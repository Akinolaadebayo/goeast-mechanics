/* =========================================================
   GO EAST MECHANICS
   Sprint 9 — Legacy Invoice Cleanup

   File:
   supabase/05_invoice_legacy_cleanup.sql

   Purpose:
   Normalize legacy invoice INV-4 before installing the
   structured Sprint 9 invoice workspace.

   Fixes:
   1. Creates one structured invoice item for the historical
      manually entered $200 invoice.
   2. Synchronizes amount paid from the existing payment row.
   3. Synchronizes balance and payment status.
   4. Marks the fully paid invoice as finished.

   Safety:
   - Targets invoice ID 2 / INV-4 only.
   - Does not delete the invoice or payment.
   - Does not attach it to an unrelated service request.
   - Idempotent: it will not insert the item twice.
   ========================================================= */

BEGIN;


/* =========================================================
   1. CREATE THE MISSING LEGACY INVOICE ITEM
   ========================================================= */

INSERT INTO public.invoice_items (
  invoice_id,
  description,
  quantity,
  unit_price,
  line_total,
  job_card_id
)
SELECT
  invoice.id,
  'Legacy manual invoice amount',
  1,
  invoice.subtotal,
  invoice.subtotal,
  NULL
FROM public.invoices AS invoice
WHERE invoice.id = 2
  AND invoice.invoice_number = 'INV-4'
  AND NOT EXISTS (
    SELECT 1
    FROM public.invoice_items AS existing_item
    WHERE existing_item.invoice_id = invoice.id
  );


/* =========================================================
   2. SYNCHRONIZE PAYMENT TOTALS INTO THE INVOICE
   ========================================================= */

WITH payment_totals AS (
  SELECT
    payment.invoice_id,

    COALESCE(
      SUM(payment.amount)
        FILTER (WHERE payment.payment_status = 'paid'),
      0
    )::numeric AS paid_total

  FROM public.payments AS payment

  WHERE payment.invoice_id = 2

  GROUP BY payment.invoice_id
)

UPDATE public.invoices AS invoice
SET
  amount_paid = payment_totals.paid_total,

  balance_due = GREATEST(
    COALESCE(invoice.total, 0) - payment_totals.paid_total,
    0
  ),

  payment_status = CASE
    WHEN payment_totals.paid_total >= COALESCE(invoice.total, 0)
         AND COALESCE(invoice.total, 0) > 0
      THEN 'paid'

    WHEN payment_totals.paid_total > 0
      THEN 'partial'

    ELSE 'unpaid'
  END,

  invoice_status = CASE
    WHEN payment_totals.paid_total >= COALESCE(invoice.total, 0)
         AND COALESCE(invoice.total, 0) > 0
      THEN 'finished'

    ELSE invoice.invoice_status
  END,

  updated_at = now()

FROM payment_totals

WHERE invoice.id = payment_totals.invoice_id
  AND invoice.id = 2
  AND invoice.invoice_number = 'INV-4';


COMMIT;


/* =========================================================
   3. VERIFICATION RESULT
   ========================================================= */

WITH item_totals AS (
  SELECT
    invoice_item.invoice_id,
    COUNT(*) AS item_count,
    COALESCE(SUM(invoice_item.line_total), 0)::numeric
      AS structured_subtotal
  FROM public.invoice_items AS invoice_item
  WHERE invoice_item.invoice_id = 2
  GROUP BY invoice_item.invoice_id
),

payment_totals AS (
  SELECT
    payment.invoice_id,
    COUNT(*) AS payment_count,

    COALESCE(
      SUM(payment.amount)
        FILTER (WHERE payment.payment_status = 'paid'),
      0
    )::numeric AS recorded_paid

  FROM public.payments AS payment
  WHERE payment.invoice_id = 2
  GROUP BY payment.invoice_id
)

SELECT
  invoice.id,
  invoice.invoice_number,
  invoice.invoice_status,
  invoice.payment_status,

  invoice.subtotal AS stored_subtotal,
  COALESCE(item_totals.structured_subtotal, 0)
    AS structured_subtotal,

  invoice.total,
  invoice.amount_paid,
  COALESCE(payment_totals.recorded_paid, 0)
    AS recorded_paid,

  invoice.balance_due,

  COALESCE(item_totals.item_count, 0)
    AS invoice_item_count,

  COALESCE(payment_totals.payment_count, 0)
    AS payment_count,

  CASE
    WHEN invoice.subtotal
         = COALESCE(item_totals.structured_subtotal, 0)
      AND invoice.amount_paid
         = COALESCE(payment_totals.recorded_paid, 0)
      AND invoice.balance_due = 0
      AND invoice.payment_status = 'paid'
      AND invoice.invoice_status = 'finished'
    THEN 'PASS'
    ELSE 'REVIEW REQUIRED'
  END AS cleanup_result

FROM public.invoices AS invoice

LEFT JOIN item_totals
  ON item_totals.invoice_id = invoice.id

LEFT JOIN payment_totals
  ON payment_totals.invoice_id = invoice.id

WHERE invoice.id = 2
  AND invoice.invoice_number = 'INV-4';