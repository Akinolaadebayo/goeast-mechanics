/* =========================================================
   GO EAST MECHANICS
   Sprint 9 — Invoice Workspace Preflight

   File:
   supabase/04_invoice_workspace_preflight.sql

   Purpose:
   Read the current staging invoice, invoice-item, payment,
   job, and service-request structures before Sprint 9 changes.

   Safety:
   READ ONLY.
   This script does not insert, update, delete, alter,
   create, or drop anything.
   ========================================================= */

WITH invoice_columns AS (
  SELECT
    table_name,
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default,
    ordinal_position
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name IN (
      'invoices',
      'invoice_items',
      'payments',
      'service_requests',
      'job_cards',
      'job_parts',
      'job_labour_entries'
    )
),

invoice_constraints AS (
  SELECT
    c.conrelid::regclass::text AS table_name,
    c.conname AS constraint_name,

    CASE c.contype
      WHEN 'p' THEN 'PRIMARY KEY'
      WHEN 'f' THEN 'FOREIGN KEY'
      WHEN 'u' THEN 'UNIQUE'
      WHEN 'c' THEN 'CHECK'
      WHEN 'x' THEN 'EXCLUSION'
      ELSE c.contype::text
    END AS constraint_type,

    pg_get_constraintdef(c.oid) AS definition
  FROM pg_constraint AS c
  INNER JOIN pg_namespace AS namespace
    ON namespace.oid = c.connamespace
  WHERE namespace.nspname = 'public'
    AND c.conrelid::regclass::text IN (
      'invoices',
      'invoice_items',
      'payments',
      'service_requests',
      'job_cards',
      'job_parts',
      'job_labour_entries'
    )
),

invoice_indexes AS (
  SELECT
    tablename AS table_name,
    indexname AS index_name,
    indexdef AS definition
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename IN (
      'invoices',
      'invoice_items',
      'payments',
      'service_requests',
      'job_cards',
      'job_parts',
      'job_labour_entries'
    )
),

invoice_triggers AS (
  SELECT
    event_object_table AS table_name,
    trigger_name,
    action_timing,
    event_manipulation,
    action_statement
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
    AND event_object_table IN (
      'invoices',
      'invoice_items',
      'payments',
      'service_requests',
      'job_cards',
      'job_parts',
      'job_labour_entries'
    )
),

invoice_policies AS (
  SELECT
    tablename AS table_name,
    policyname AS policy_name,
    roles,
    cmd AS command,
    permissive,
    qual AS using_expression,
    with_check AS check_expression
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN (
      'invoices',
      'invoice_items',
      'payments',
      'service_requests',
      'job_cards',
      'job_parts',
      'job_labour_entries'
    )
),

invoice_functions AS (
  SELECT
    procedure.proname AS function_name,
    pg_get_function_identity_arguments(procedure.oid) AS arguments,
    pg_get_function_result(procedure.oid) AS return_type
  FROM pg_proc AS procedure
  INNER JOIN pg_namespace AS namespace
    ON namespace.oid = procedure.pronamespace
  WHERE namespace.nspname = 'public'
    AND (
      procedure.proname ILIKE '%invoice%'
      OR procedure.proname ILIKE '%payment%'
      OR procedure.proname ILIKE '%billing%'
    )
),

required_columns AS (
  SELECT *
  FROM (
    VALUES
      ('invoices', 'id'),
      ('invoices', 'invoice_number'),
      ('invoices', 'service_request_id'),
      ('invoices', 'customer_name'),
      ('invoices', 'customer_email'),
      ('invoices', 'subtotal'),
      ('invoices', 'tax'),
      ('invoices', 'discount'),
      ('invoices', 'total'),
      ('invoices', 'invoice_status'),

      ('invoice_items', 'id'),
      ('invoice_items', 'invoice_id'),
      ('invoice_items', 'description'),
      ('invoice_items', 'quantity'),
      ('invoice_items', 'unit_price'),
      ('invoice_items', 'line_total'),
      ('invoice_items', 'job_card_id'),

      ('payments', 'id'),
      ('payments', 'invoice_id')
  ) AS expected(table_name, column_name)
),

missing_required_columns AS (
  SELECT
    expected.table_name,
    expected.column_name
  FROM required_columns AS expected
  LEFT JOIN information_schema.columns AS installed
    ON installed.table_schema = 'public'
    AND installed.table_name = expected.table_name
    AND installed.column_name = expected.column_name
  WHERE installed.column_name IS NULL
),

invoice_item_totals AS (
  SELECT
    invoice_id,
    COALESCE(SUM(line_total), 0)::numeric AS item_total
  FROM public.invoice_items
  GROUP BY invoice_id
),

invoice_subtotal_mismatches AS (
  SELECT
    invoice.id AS invoice_id,
    invoice.invoice_number,
    COALESCE(invoice.subtotal, 0)::numeric AS stored_subtotal,
    COALESCE(item_totals.item_total, 0)::numeric AS calculated_item_total
  FROM public.invoices AS invoice
  LEFT JOIN invoice_item_totals AS item_totals
    ON item_totals.invoice_id = invoice.id
  WHERE COALESCE(invoice.subtotal, 0)::numeric
    IS DISTINCT FROM COALESCE(item_totals.item_total, 0)::numeric
),

invoice_job_request_mismatches AS (
  SELECT
    invoice_item.id AS invoice_item_id,
    invoice_item.invoice_id,
    invoice_item.job_card_id,
    invoice.service_request_id AS invoice_request_id,
    job.service_request_id AS job_request_id
  FROM public.invoice_items AS invoice_item
  INNER JOIN public.invoices AS invoice
    ON invoice.id = invoice_item.invoice_id
  INNER JOIN public.job_cards AS job
    ON job.id = invoice_item.job_card_id
  WHERE invoice_item.job_card_id IS NOT NULL
    AND invoice.service_request_id
      IS DISTINCT FROM job.service_request_id
),

audit_report AS (
  SELECT jsonb_build_object(

    'audit_information',
    jsonb_build_object(
      'database', current_database(),
      'connected_user', current_user,
      'executed_at', now(),
      'mode', 'READ ONLY',
      'sprint', 'Sprint 9 Invoice Workspace'
    ),

    'row_counts',
    jsonb_build_object(
      'invoices',
      (SELECT COUNT(*) FROM public.invoices),

      'invoice_items',
      (SELECT COUNT(*) FROM public.invoice_items),

      'payments',
      (SELECT COUNT(*) FROM public.payments),

      'service_requests',
      (SELECT COUNT(*) FROM public.service_requests),

      'job_cards',
      (SELECT COUNT(*) FROM public.job_cards),

      'job_parts',
      (SELECT COUNT(*) FROM public.job_parts),

      'job_labour_entries',
      (SELECT COUNT(*) FROM public.job_labour_entries)
    ),

    'missing_required_columns',
    COALESCE(
      (
        SELECT jsonb_agg(
          to_jsonb(missing)
          ORDER BY missing.table_name, missing.column_name
        )
        FROM missing_required_columns AS missing
      ),
      '[]'::jsonb
    ),

    'columns',
    COALESCE(
      (
        SELECT jsonb_agg(
          to_jsonb(column_record)
          ORDER BY
            column_record.table_name,
            column_record.ordinal_position
        )
        FROM invoice_columns AS column_record
      ),
      '[]'::jsonb
    ),

    'constraints',
    COALESCE(
      (
        SELECT jsonb_agg(
          to_jsonb(constraint_record)
          ORDER BY
            constraint_record.table_name,
            constraint_record.constraint_name
        )
        FROM invoice_constraints AS constraint_record
      ),
      '[]'::jsonb
    ),

    'indexes',
    COALESCE(
      (
        SELECT jsonb_agg(
          to_jsonb(index_record)
          ORDER BY
            index_record.table_name,
            index_record.index_name
        )
        FROM invoice_indexes AS index_record
      ),
      '[]'::jsonb
    ),

    'triggers',
    COALESCE(
      (
        SELECT jsonb_agg(
          to_jsonb(trigger_record)
          ORDER BY
            trigger_record.table_name,
            trigger_record.trigger_name,
            trigger_record.event_manipulation
        )
        FROM invoice_triggers AS trigger_record
      ),
      '[]'::jsonb
    ),

    'policies',
    COALESCE(
      (
        SELECT jsonb_agg(
          to_jsonb(policy_record)
          ORDER BY
            policy_record.table_name,
            policy_record.policy_name
        )
        FROM invoice_policies AS policy_record
      ),
      '[]'::jsonb
    ),

    'invoice_functions',
    COALESCE(
      (
        SELECT jsonb_agg(
          to_jsonb(function_record)
          ORDER BY function_record.function_name
        )
        FROM invoice_functions AS function_record
      ),
      '[]'::jsonb
    ),

    'integrity_checks',
    jsonb_build_object(

      'orphan_invoice_items',
      (
        SELECT COUNT(*)
        FROM public.invoice_items AS invoice_item
        LEFT JOIN public.invoices AS invoice
          ON invoice.id = invoice_item.invoice_id
        WHERE invoice.id IS NULL
      ),

      'orphan_invoice_service_requests',
      (
        SELECT COUNT(*)
        FROM public.invoices AS invoice
        LEFT JOIN public.service_requests AS request
          ON request.id = invoice.service_request_id
        WHERE invoice.service_request_id IS NOT NULL
          AND request.id IS NULL
      ),

      'orphan_invoice_job_cards',
      (
        SELECT COUNT(*)
        FROM public.invoice_items AS invoice_item
        LEFT JOIN public.job_cards AS job
          ON job.id = invoice_item.job_card_id
        WHERE invoice_item.job_card_id IS NOT NULL
          AND job.id IS NULL
      ),

      'invoice_job_request_mismatch_count',
      (
        SELECT COUNT(*)
        FROM invoice_job_request_mismatches
      ),

      'invoice_subtotal_mismatch_count',
      (
        SELECT COUNT(*)
        FROM invoice_subtotal_mismatches
      )
    ),

    'invoice_subtotal_mismatches',
    COALESCE(
      (
        SELECT jsonb_agg(
          to_jsonb(mismatch)
          ORDER BY mismatch.invoice_id
        )
        FROM invoice_subtotal_mismatches AS mismatch
      ),
      '[]'::jsonb
    ),

    'invoice_job_request_mismatches',
    COALESCE(
      (
        SELECT jsonb_agg(
          to_jsonb(mismatch)
          ORDER BY mismatch.invoice_item_id
        )
        FROM invoice_job_request_mismatches AS mismatch
      ),
      '[]'::jsonb
    ),

    'current_invoices',
    COALESCE(
      (
        SELECT jsonb_agg(
          to_jsonb(invoice)
          ORDER BY invoice.id
        )
        FROM public.invoices AS invoice
      ),
      '[]'::jsonb
    ),

    'current_invoice_items',
    COALESCE(
      (
        SELECT jsonb_agg(
          to_jsonb(invoice_item)
          ORDER BY invoice_item.id
        )
        FROM public.invoice_items AS invoice_item
      ),
      '[]'::jsonb
    ),

    'current_payments',
    COALESCE(
      (
        SELECT jsonb_agg(
          to_jsonb(payment)
          ORDER BY payment.id
        )
        FROM public.payments AS payment
      ),
      '[]'::jsonb
    )
  ) AS report
)

SELECT jsonb_pretty(report) AS sprint_9_invoice_preflight
FROM audit_report;