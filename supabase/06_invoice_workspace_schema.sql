/* =========================================================
   GO EAST MECHANICS
   Sprint 9 — Industry-Standard Invoice Workspace Schema

   File:
   supabase/06_invoice_workspace_schema.sql

   Run order:
   1. Sprint 9 preflight
   2. Legacy invoice cleanup
   3. This schema migration
   4. Invoice calculation/workflow engine
   5. Verification
   6. Frontend installation

   Purpose:
   - Upgrade invoices for an Ontario automotive repair shop.
   - Preserve all existing invoices, payments and invoice items.
   - Add customer, vehicle, estimate, authorization, warranty,
     tax, payment receipt and audit fields.
   - Improve database indexes and customer RLS access.
   - Keep tax disabled until business registration is confirmed.

   Safety:
   - Does not delete existing financial records.
   - Preserves INV-4 and its payment.
   - Idempotent where practical.
   ========================================================= */

BEGIN;


/* =========================================================
   1. BUSINESS INVOICE SETTINGS

   One row stores the business identity and defaults used
   when preparing future invoices.
   ========================================================= */

CREATE TABLE IF NOT EXISTS public.business_settings (
  id smallint PRIMARY KEY DEFAULT 1,

  legal_name text,
  trading_name text NOT NULL DEFAULT 'Go East Mechanics',

  address_line_1 text,
  address_line_2 text,
  city text,
  province text NOT NULL DEFAULT 'Ontario',
  postal_code text,
  country text NOT NULL DEFAULT 'Canada',

  phone text,
  email text,
  website text,

  tax_enabled boolean NOT NULL DEFAULT false,
  tax_label text NOT NULL DEFAULT 'HST',
  tax_registration_number text,
  default_tax_rate numeric(7,4) NOT NULL DEFAULT 13.0000,

  currency_code text NOT NULL DEFAULT 'CAD',
  invoice_prefix text NOT NULL DEFAULT 'GEM',
  receipt_prefix text NOT NULL DEFAULT 'GEM-R',

  default_payment_terms_days integer NOT NULL DEFAULT 0,

  warranty_terms text,
  consumer_notice text,
  invoice_footer text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT business_settings_singleton_check
    CHECK (id = 1),

  CONSTRAINT business_settings_tax_rate_check
    CHECK (
      default_tax_rate >= 0
      AND default_tax_rate <= 100
    ),

  CONSTRAINT business_settings_currency_check
    CHECK (currency_code ~ '^[A-Z]{3}$'),

  CONSTRAINT business_settings_payment_terms_check
    CHECK (default_payment_terms_days >= 0)
);


INSERT INTO public.business_settings (
  id,
  trading_name,
  province,
  country,
  tax_enabled,
  tax_label,
  default_tax_rate,
  currency_code,
  invoice_prefix,
  receipt_prefix,
  default_payment_terms_days,
  warranty_terms,
  consumer_notice
)
VALUES (
  1,
  'Go East Mechanics',
  'Ontario',
  'Canada',
  false,
  'HST',
  13.0000,
  'CAD',
  'GEM',
  'GEM-R',
  0,
  'Warranty terms must be confirmed before an invoice is finalized.',
  'Ontario motor vehicle repair customers have statutory rights concerning estimates, invoices, warranties and replaced parts.'
)
ON CONFLICT (id) DO NOTHING;


/* Use the existing project-wide updated_at function. */

DROP TRIGGER IF EXISTS
  update_business_settings_updated_at
ON public.business_settings;

CREATE TRIGGER update_business_settings_updated_at
BEFORE UPDATE ON public.business_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


/* =========================================================
   2. UPGRADE INVOICE HEADER RECORDS

   Invoice fields are snapshots. Once an invoice is finalized,
   changes to a customer profile or business settings must not
   silently rewrite the historical invoice.
   ========================================================= */

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS customer_id uuid,

  ADD COLUMN IF NOT EXISTS currency_code text
    NOT NULL DEFAULT 'CAD',

  ADD COLUMN IF NOT EXISTS due_date date,

  ADD COLUMN IF NOT EXISTS service_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS vehicle_returned_at timestamptz,

  ADD COLUMN IF NOT EXISTS customer_address_line_1 text,
  ADD COLUMN IF NOT EXISTS customer_address_line_2 text,
  ADD COLUMN IF NOT EXISTS customer_city text,
  ADD COLUMN IF NOT EXISTS customer_province text,
  ADD COLUMN IF NOT EXISTS customer_postal_code text,

  ADD COLUMN IF NOT EXISTS vehicle_year integer,
  ADD COLUMN IF NOT EXISTS vehicle_make text,
  ADD COLUMN IF NOT EXISTS vehicle_model text,
  ADD COLUMN IF NOT EXISTS vehicle_trim text,
  ADD COLUMN IF NOT EXISTS vehicle_vin text,
  ADD COLUMN IF NOT EXISTS vehicle_license_plate text,
  ADD COLUMN IF NOT EXISTS odometer_in numeric(12,1),
  ADD COLUMN IF NOT EXISTS odometer_out numeric(12,1),

  ADD COLUMN IF NOT EXISTS estimate_number text,
  ADD COLUMN IF NOT EXISTS estimate_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS authorized_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS authorization_reference text,
  ADD COLUMN IF NOT EXISTS authorization_at timestamptz,

  ADD COLUMN IF NOT EXISTS purchase_order_number text,

  ADD COLUMN IF NOT EXISTS tax_rate numeric(7,4)
    NOT NULL DEFAULT 0,

  ADD COLUMN IF NOT EXISTS discount_reason text,

  ADD COLUMN IF NOT EXISTS parts_return_offered boolean
    NOT NULL DEFAULT true,

  ADD COLUMN IF NOT EXISTS parts_return_requested boolean,

  ADD COLUMN IF NOT EXISTS warranty_terms text,
  ADD COLUMN IF NOT EXISTS payment_terms text,

  ADD COLUMN IF NOT EXISTS public_notes text,
  ADD COLUMN IF NOT EXISTS internal_notes text,

  ADD COLUMN IF NOT EXISTS business_name text,
  ADD COLUMN IF NOT EXISTS business_address text,
  ADD COLUMN IF NOT EXISTS business_phone text,
  ADD COLUMN IF NOT EXISTS business_email text,
  ADD COLUMN IF NOT EXISTS business_tax_number text,

  ADD COLUMN IF NOT EXISTS sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS finalized_at timestamptz,
  ADD COLUMN IF NOT EXISTS locked_at timestamptz,

  ADD COLUMN IF NOT EXISTS voided_at timestamptz,
  ADD COLUMN IF NOT EXISTS void_reason text;


/* Normalize nullable legacy discount values. */

UPDATE public.invoices
SET discount = 0
WHERE discount IS NULL;

ALTER TABLE public.invoices
  ALTER COLUMN discount SET DEFAULT 0;

ALTER TABLE public.invoices
  ALTER COLUMN discount SET NOT NULL;


/* Ensure every invoice has a permanent number. */

UPDATE public.invoices
SET invoice_number = 'LEGACY-' || id::text
WHERE invoice_number IS NULL
   OR trim(invoice_number) = '';

ALTER TABLE public.invoices
  ALTER COLUMN invoice_number SET NOT NULL;


/* Backfill customer UUIDs by existing invoice email. */

UPDATE public.invoices AS invoice
SET customer_id = profile.id
FROM public.profiles AS profile
WHERE invoice.customer_id IS NULL
  AND invoice.customer_email IS NOT NULL
  AND lower(trim(profile.email))
      = lower(trim(invoice.customer_email));


/* Customer relationship. */

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'invoices_customer_id_fkey'
      AND conrelid = 'public.invoices'::regclass
  ) THEN
    ALTER TABLE public.invoices
      ADD CONSTRAINT invoices_customer_id_fkey
      FOREIGN KEY (customer_id)
      REFERENCES public.profiles(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;


/* Replace invoice status validation with the expanded workflow. */

ALTER TABLE public.invoices
  DROP CONSTRAINT IF EXISTS invoice_status_check;

ALTER TABLE public.invoices
  ADD CONSTRAINT invoice_status_check
  CHECK (
    invoice_status IN (
      'draft',
      'sent',
      'finished',
      'void',
      'canceled'
    )
  );


/* Replace payment-status validation with canonical values. */

ALTER TABLE public.invoices
  DROP CONSTRAINT IF EXISTS payment_status_check;

ALTER TABLE public.invoices
  ADD CONSTRAINT payment_status_check
  CHECK (
    payment_status IN (
      'unpaid',
      'partial',
      'paid',
      'refunded'
    )
  );


/* Invoice financial and operational validation. */

ALTER TABLE public.invoices
  DROP CONSTRAINT IF EXISTS invoices_amounts_check;

ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_amounts_check
  CHECK (
    subtotal >= 0
    AND tax >= 0
    AND discount >= 0
    AND total >= 0
    AND amount_paid >= 0
    AND balance_due >= 0
    AND coalesce(estimate_amount, 0) >= 0
    AND coalesce(authorized_amount, 0) >= 0
  );


ALTER TABLE public.invoices
  DROP CONSTRAINT IF EXISTS invoices_tax_rate_check;

ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_tax_rate_check
  CHECK (
    tax_rate >= 0
    AND tax_rate <= 100
  );


ALTER TABLE public.invoices
  DROP CONSTRAINT IF EXISTS invoices_currency_check;

ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_currency_check
  CHECK (currency_code ~ '^[A-Z]{3}$');


ALTER TABLE public.invoices
  DROP CONSTRAINT IF EXISTS invoices_odometer_check;

ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_odometer_check
  CHECK (
    coalesce(odometer_in, 0) >= 0
    AND coalesce(odometer_out, 0) >= 0
  );


/* =========================================================
   3. UPGRADE STRUCTURED INVOICE ITEMS

   Quantity becomes decimal so labour can use values such
   as 0.25, 1.50 or 2.75 hours.
   ========================================================= */

ALTER TABLE public.invoice_items
  ALTER COLUMN quantity TYPE numeric(12,3)
  USING quantity::numeric(12,3);

ALTER TABLE public.invoice_items
  ALTER COLUMN quantity SET DEFAULT 1;


ALTER TABLE public.invoice_items
  ADD COLUMN IF NOT EXISTS line_type text
    NOT NULL DEFAULT 'manual',

  ADD COLUMN IF NOT EXISTS unit text
    NOT NULL DEFAULT 'each',

  ADD COLUMN IF NOT EXISTS taxable boolean
    NOT NULL DEFAULT true,

  ADD COLUMN IF NOT EXISTS tax_rate numeric(7,4)
    NOT NULL DEFAULT 0,

  ADD COLUMN IF NOT EXISTS line_subtotal numeric(12,2)
    NOT NULL DEFAULT 0,

  ADD COLUMN IF NOT EXISTS discount_amount numeric(12,2)
    NOT NULL DEFAULT 0,

  ADD COLUMN IF NOT EXISTS tax_amount numeric(12,2)
    NOT NULL DEFAULT 0,

  ADD COLUMN IF NOT EXISTS job_part_id bigint,
  ADD COLUMN IF NOT EXISTS job_labour_entry_id bigint,

  ADD COLUMN IF NOT EXISTS part_condition text,

  ADD COLUMN IF NOT EXISTS warranty_terms text,
  ADD COLUMN IF NOT EXISTS notes text,

  ADD COLUMN IF NOT EXISTS sort_order integer
    NOT NULL DEFAULT 0,

  ADD COLUMN IF NOT EXISTS updated_at timestamptz
    NOT NULL DEFAULT now();


/* Existing legacy lines remain tax neutral. */

UPDATE public.invoice_items
SET
  line_subtotal = round(
    coalesce(quantity, 0) * coalesce(unit_price, 0),
    2
  ),

  discount_amount = coalesce(discount_amount, 0),

  tax_amount = greatest(
    coalesce(line_total, 0)
    -
    (
      round(
        coalesce(quantity, 0) * coalesce(unit_price, 0),
        2
      )
      -
      coalesce(discount_amount, 0)
    ),
    0
  ),

  tax_rate = coalesce(tax_rate, 0),

  updated_at = now();


/* Every invoice item must belong to an invoice. */

DO $$
DECLARE
  orphan_count bigint;
BEGIN
  SELECT COUNT(*)
  INTO orphan_count
  FROM public.invoice_items
  WHERE invoice_id IS NULL;

  IF orphan_count > 0 THEN
    RAISE EXCEPTION
      'Migration stopped: % invoice_items rows have no invoice_id.',
      orphan_count;
  END IF;
END;
$$;

ALTER TABLE public.invoice_items
  ALTER COLUMN invoice_id SET NOT NULL;


/* Source traceability. */

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'invoice_items_job_part_id_fkey'
      AND conrelid = 'public.invoice_items'::regclass
  ) THEN
    ALTER TABLE public.invoice_items
      ADD CONSTRAINT invoice_items_job_part_id_fkey
      FOREIGN KEY (job_part_id)
      REFERENCES public.job_parts(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'invoice_items_job_labour_entry_id_fkey'
      AND conrelid = 'public.invoice_items'::regclass
  ) THEN
    ALTER TABLE public.invoice_items
      ADD CONSTRAINT invoice_items_job_labour_entry_id_fkey
      FOREIGN KEY (job_labour_entry_id)
      REFERENCES public.job_labour_entries(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;


/* Controlled invoice-item classifications. */

ALTER TABLE public.invoice_items
  DROP CONSTRAINT IF EXISTS invoice_items_line_type_check;

ALTER TABLE public.invoice_items
  ADD CONSTRAINT invoice_items_line_type_check
  CHECK (
    line_type IN (
      'part',
      'labour',
      'shop_supply',
      'sublet',
      'fee',
      'manual'
    )
  );


ALTER TABLE public.invoice_items
  DROP CONSTRAINT IF EXISTS invoice_items_part_condition_check;

ALTER TABLE public.invoice_items
  ADD CONSTRAINT invoice_items_part_condition_check
  CHECK (
    part_condition IS NULL
    OR part_condition IN (
      'new',
      'used',
      'reconditioned',
      'customer_supplied',
      'not_applicable'
    )
  );


ALTER TABLE public.invoice_items
  DROP CONSTRAINT IF EXISTS invoice_items_amounts_check;

ALTER TABLE public.invoice_items
  ADD CONSTRAINT invoice_items_amounts_check
  CHECK (
    quantity > 0
    AND unit_price >= 0
    AND line_subtotal >= 0
    AND discount_amount >= 0
    AND tax_amount >= 0
    AND line_total >= 0
    AND tax_rate >= 0
    AND tax_rate <= 100
  );


DROP TRIGGER IF EXISTS
  update_invoice_items_updated_at
ON public.invoice_items;

CREATE TRIGGER update_invoice_items_updated_at
BEFORE UPDATE ON public.invoice_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


/* =========================================================
   4. UPGRADE PAYMENT AND RECEIPT RECORDS
   ========================================================= */

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS receipt_number text,
  ADD COLUMN IF NOT EXISTS currency_code text
    NOT NULL DEFAULT 'CAD',
  ADD COLUMN IF NOT EXISTS received_from text,
  ADD COLUMN IF NOT EXISTS processor_name text,
  ADD COLUMN IF NOT EXISTS voided_at timestamptz,
  ADD COLUMN IF NOT EXISTS void_reason text;


/* Every payment must belong to an invoice. */

DO $$
DECLARE
  orphan_count bigint;
BEGIN
  SELECT COUNT(*)
  INTO orphan_count
  FROM public.payments
  WHERE invoice_id IS NULL;

  IF orphan_count > 0 THEN
    RAISE EXCEPTION
      'Migration stopped: % payments rows have no invoice_id.',
      orphan_count;
  END IF;
END;
$$;

ALTER TABLE public.payments
  ALTER COLUMN invoice_id SET NOT NULL;


/* Normalize existing payment methods before new validation. */

ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_method_check;

UPDATE public.payments
SET payment_method = CASE lower(trim(payment_method))
  WHEN 'e-transfer' THEN 'e_transfer'
  WHEN 'etransfer' THEN 'e_transfer'
  WHEN 'card' THEN 'credit_card'
  WHEN 'credit card' THEN 'credit_card'
  ELSE lower(trim(payment_method))
END;


ALTER TABLE public.payments
  ADD CONSTRAINT payments_method_check
  CHECK (
    payment_method IN (
      'cash',
      'debit',
      'credit_card',
      'e_transfer',
      'cheque',
      'other'
    )
  );


ALTER TABLE public.payments
  ALTER COLUMN payment_status SET DEFAULT 'paid';


ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_currency_check;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_currency_check
  CHECK (currency_code ~ '^[A-Z]{3}$');


ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_amount_check;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_amount_check
  CHECK (amount > 0);


/* =========================================================
   5. IMMUTABLE INVOICE AUDIT TABLE

   The engine installed in the next SQL file will write invoice
   lifecycle events here.
   ========================================================= */

CREATE TABLE IF NOT EXISTS public.invoice_events (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,

  invoice_id bigint,

  event_type text NOT NULL,
  event_message text,

  previous_data jsonb,
  new_data jsonb,

  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT invoice_events_invoice_id_fkey
    FOREIGN KEY (invoice_id)
    REFERENCES public.invoices(id)
    ON DELETE SET NULL,

  CONSTRAINT invoice_events_created_by_fkey
    FOREIGN KEY (created_by)
    REFERENCES public.profiles(id)
    ON DELETE SET NULL
);


/* =========================================================
   6. PERFORMANCE INDEXES

   These support invoice lists, customer lookups, RLS checks,
   item imports, payment summaries and audit timelines.
   ========================================================= */

CREATE INDEX IF NOT EXISTS
  idx_invoices_customer_id
ON public.invoices(customer_id);


CREATE INDEX IF NOT EXISTS
  idx_invoices_customer_email
ON public.invoices(lower(customer_email));


CREATE INDEX IF NOT EXISTS
  idx_invoices_service_request_id
ON public.invoices(service_request_id);


CREATE INDEX IF NOT EXISTS
  idx_invoices_status_date
ON public.invoices(
  invoice_status,
  invoice_date DESC
);


CREATE INDEX IF NOT EXISTS
  idx_invoices_payment_status
ON public.invoices(payment_status);


CREATE INDEX IF NOT EXISTS
  idx_invoices_due_date
ON public.invoices(due_date)
WHERE balance_due > 0;


CREATE INDEX IF NOT EXISTS
  idx_invoice_items_invoice_id
ON public.invoice_items(invoice_id);


CREATE INDEX IF NOT EXISTS
  idx_invoice_items_job_part_id
ON public.invoice_items(job_part_id);


CREATE INDEX IF NOT EXISTS
  idx_invoice_items_job_labour_entry_id
ON public.invoice_items(job_labour_entry_id);


CREATE UNIQUE INDEX IF NOT EXISTS
  uq_invoice_items_invoice_job_part
ON public.invoice_items(
  invoice_id,
  job_part_id
)
WHERE job_part_id IS NOT NULL;


CREATE UNIQUE INDEX IF NOT EXISTS
  uq_invoice_items_invoice_labour
ON public.invoice_items(
  invoice_id,
  job_labour_entry_id
)
WHERE job_labour_entry_id IS NOT NULL;


CREATE INDEX IF NOT EXISTS
  idx_payments_invoice_id
ON public.payments(invoice_id);


CREATE INDEX IF NOT EXISTS
  idx_payments_status_date
ON public.payments(
  payment_status,
  payment_date DESC
);


CREATE UNIQUE INDEX IF NOT EXISTS
  uq_payments_receipt_number
ON public.payments(receipt_number)
WHERE receipt_number IS NOT NULL;


CREATE INDEX IF NOT EXISTS
  idx_invoice_events_invoice_created
ON public.invoice_events(
  invoice_id,
  created_at DESC
);


/* =========================================================
   7. ROW LEVEL SECURITY

   Customers may read only their own non-draft invoices,
   corresponding line items and payment records.
   ========================================================= */

ALTER TABLE public.business_settings
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.invoice_events
  ENABLE ROW LEVEL SECURITY;


/* Business setting policies. */

DROP POLICY IF EXISTS
  "Authenticated users can read business settings"
ON public.business_settings;

CREATE POLICY
  "Authenticated users can read business settings"
ON public.business_settings
FOR SELECT
TO authenticated
USING (true);


DROP POLICY IF EXISTS
  "Admins can manage business settings"
ON public.business_settings;

CREATE POLICY
  "Admins can manage business settings"
ON public.business_settings
FOR ALL
TO authenticated
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));


/* Replace email-only customer invoice access. */

DROP POLICY IF EXISTS
  "Customers can read own invoices"
ON public.invoices;

CREATE POLICY
  "Customers can read own invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (
  invoice_status <> 'draft'
  AND (
    customer_id = (SELECT auth.uid())

    OR lower(coalesce(customer_email, ''))
       =
       lower(
         coalesce(
           (SELECT auth.jwt() ->> 'email'),
           ''
         )
       )
  )
);


/* Customers can read their finalized invoice lines. */

DROP POLICY IF EXISTS
  "Customers can read own invoice items"
ON public.invoice_items;

CREATE POLICY
  "Customers can read own invoice items"
ON public.invoice_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.invoices AS invoice
    WHERE invoice.id = invoice_items.invoice_id
      AND invoice.invoice_status <> 'draft'
      AND (
        invoice.customer_id = (SELECT auth.uid())

        OR lower(coalesce(invoice.customer_email, ''))
           =
           lower(
             coalesce(
               (SELECT auth.jwt() ->> 'email'),
               ''
             )
           )
      )
  )
);


/* Replace email-only customer payment access. */

DROP POLICY IF EXISTS
  "Customers can read own payments"
ON public.payments;

CREATE POLICY
  "Customers can read own payments"
ON public.payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.invoices AS invoice
    WHERE invoice.id = payments.invoice_id
      AND invoice.invoice_status <> 'draft'
      AND (
        invoice.customer_id = (SELECT auth.uid())

        OR lower(coalesce(invoice.customer_email, ''))
           =
           lower(
             coalesce(
               (SELECT auth.jwt() ->> 'email'),
               ''
             )
           )
      )
  )
);


/* Invoice audit events remain internal. */

DROP POLICY IF EXISTS
  "Admins can read invoice events"
ON public.invoice_events;

CREATE POLICY
  "Admins can read invoice events"
ON public.invoice_events
FOR SELECT
TO authenticated
USING ((SELECT public.is_admin()));


/* Explicit API grants for newly created tables. */

GRANT SELECT
ON public.business_settings
TO authenticated;

GRANT SELECT
ON public.invoice_events
TO authenticated;


/* =========================================================
   8. FINAL LEGACY NORMALIZATION
   ========================================================= */

UPDATE public.invoices
SET
  currency_code = 'CAD',
  tax_rate = CASE
    WHEN subtotal > 0
      THEN round((tax / subtotal) * 100, 4)
    ELSE 0
  END
WHERE currency_code IS NULL
   OR trim(currency_code) = ''
   OR tax_rate IS NULL;


/* =========================================================
   9. COMPLETE TRANSACTION
   ========================================================= */

COMMIT;


/* =========================================================
   10. VERIFICATION

   Expected:
   schema_result = PASS
   missing_columns = null
   ========================================================= */

WITH required_columns (
  table_name,
  column_name
) AS (
  VALUES
    ('business_settings', 'trading_name'),
    ('business_settings', 'tax_enabled'),
    ('business_settings', 'default_tax_rate'),

    ('invoices', 'customer_id'),
    ('invoices', 'due_date'),
    ('invoices', 'vehicle_vin'),
    ('invoices', 'vehicle_license_plate'),
    ('invoices', 'odometer_in'),
    ('invoices', 'odometer_out'),
    ('invoices', 'estimate_amount'),
    ('invoices', 'authorized_amount'),
    ('invoices', 'authorization_reference'),
    ('invoices', 'parts_return_offered'),
    ('invoices', 'warranty_terms'),
    ('invoices', 'business_name'),
    ('invoices', 'finalized_at'),
    ('invoices', 'voided_at'),

    ('invoice_items', 'line_type'),
    ('invoice_items', 'unit'),
    ('invoice_items', 'taxable'),
    ('invoice_items', 'line_subtotal'),
    ('invoice_items', 'discount_amount'),
    ('invoice_items', 'tax_amount'),
    ('invoice_items', 'job_part_id'),
    ('invoice_items', 'job_labour_entry_id'),
    ('invoice_items', 'part_condition'),

    ('payments', 'receipt_number'),
    ('payments', 'currency_code'),

    ('invoice_events', 'event_type')
),

missing AS (
  SELECT
    required.table_name,
    required.column_name
  FROM required_columns AS required

  LEFT JOIN information_schema.columns AS installed
    ON installed.table_schema = 'public'
   AND installed.table_name = required.table_name
   AND installed.column_name = required.column_name

  WHERE installed.column_name IS NULL
)

SELECT
  CASE
    WHEN COUNT(*) = 0 THEN 'PASS'
    ELSE 'REVIEW REQUIRED'
  END AS schema_result,

  array_agg(
    missing.table_name || '.' || missing.column_name
    ORDER BY missing.table_name, missing.column_name
  ) AS missing_columns

FROM missing;