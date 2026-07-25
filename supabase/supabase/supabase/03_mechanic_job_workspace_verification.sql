/* =========================================================
   GO EAST MECHANICS
   Mechanic Job Workspace Post-Migration Verification

   File:
   supabase/03_mechanic_job_workspace_verification.sql

   Safety:
   READ ONLY. Run after migration 02.
   ========================================================= */


/* =========================================================
   1. CONFIRM REQUIRED COLUMNS
   ========================================================= */

SELECT
  table_name,
  column_name,
  data_type,
  is_nullable

FROM information_schema.columns

WHERE table_schema = 'public'

  AND (
    (
      table_name = 'repair_updates'
      AND column_name = 'job_card_id'
    )

    OR

    (
      table_name = 'invoice_items'
      AND column_name = 'job_card_id'
    )
  )

ORDER BY
  table_name,
  column_name;


/* =========================================================
   2. CONFIRM REQUIRED DATABASE FUNCTIONS
   ========================================================= */

SELECT
  procedures.proname AS function_name,

  pg_get_function_identity_arguments(
    procedures.oid
  ) AS arguments

FROM pg_proc AS procedures

INNER JOIN pg_namespace AS namespaces
  ON namespaces.oid = procedures.pronamespace

WHERE namespaces.nspname = 'public'

  AND procedures.proname IN (
    'derive_service_request_status',
    'sync_service_request_status_from_jobs',
    'record_job_timeline_event',
    'save_job_workspace_update',
    'save_repair_update',
    'sync_job_part_compatibility_fields',
    'sync_service_request_final_cost_from_invoices',
    'sync_request_final_cost_invoice_trigger'
  )

ORDER BY procedures.proname;


/* =========================================================
   3. CONFIRM CONTROLLED JOB STATUSES
   ========================================================= */

SELECT
  job_status,
  COUNT(*) AS job_count

FROM public.job_cards

GROUP BY job_status

ORDER BY job_status;


/* =========================================================
   4. CONFIRM PART AND LABOUR REQUEST RELATIONSHIPS
   ========================================================= */

SELECT
  'job_parts_request_mismatch' AS check_name,
  COUNT(*) AS issue_count

FROM public.job_parts AS part

INNER JOIN public.job_cards AS job
  ON job.id = part.job_card_id

WHERE part.service_request_id
      IS DISTINCT FROM job.service_request_id


UNION ALL


SELECT
  'job_labour_request_mismatch',
  COUNT(*)

FROM public.job_labour_entries AS labour

INNER JOIN public.job_cards AS job
  ON job.id = labour.job_card_id

WHERE labour.service_request_id
      IS DISTINCT FROM job.service_request_id;


/* =========================================================
   5. CONFIRM JOB-PART TOTALS ARE SYNCHRONIZED
   ========================================================= */

SELECT
  COUNT(*) AS incorrect_job_part_totals

FROM public.job_parts

WHERE coalesce(line_total, 0)
      IS DISTINCT FROM (
        coalesce(quantity_used, 0)
        *
        coalesce(
          selling_price,
          unit_price,
          0
        )
      );


/* =========================================================
   6. COMPARE STORED AND DERIVED REQUEST STATUSES
   ========================================================= */

SELECT
  request.id AS service_request_id,

  request.status AS stored_status,

  public.derive_service_request_status(
    request.id
  ) AS derived_status,

  COUNT(job.id) AS linked_job_count

FROM public.service_requests AS request

LEFT JOIN public.job_cards AS job
  ON job.service_request_id = request.id

GROUP BY
  request.id,
  request.status

HAVING COUNT(job.id) > 0

ORDER BY request.id;


/* =========================================================
   7. CONFIRM INVOICE FINAL-COST TRIGGER
   ========================================================= */

SELECT
  event_object_table AS table_name,
  trigger_name,
  action_timing,
  event_manipulation

FROM information_schema.triggers

WHERE trigger_schema = 'public'

  AND event_object_table = 'invoices'

  AND trigger_name =
      'sync_request_final_cost_after_invoice_change'

ORDER BY event_manipulation;


/* =========================================================
   8. CONFIRM INVOICE TOTALS MATCH REQUEST FINAL COST
   ========================================================= */

WITH invoice_totals AS (
  SELECT
    service_request_id,

    coalesce(
      sum(total) FILTER (
        WHERE invoice_status <> 'canceled'
      ),
      0
    ) AS expected_final_cost

  FROM public.invoices

  WHERE service_request_id IS NOT NULL

  GROUP BY service_request_id
)

SELECT
  request.id AS service_request_id,

  request.final_cost AS stored_final_cost,

  invoice_totals.expected_final_cost,

  request.final_cost IS DISTINCT FROM
    invoice_totals.expected_final_cost
    AS has_mismatch

FROM invoice_totals

INNER JOIN public.service_requests AS request
  ON request.id =
     invoice_totals.service_request_id

WHERE request.final_cost IS DISTINCT FROM
      invoice_totals.expected_final_cost

ORDER BY request.id;