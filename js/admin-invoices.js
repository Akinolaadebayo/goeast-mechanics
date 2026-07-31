/* =========================================================
   GO EAST MECHANICS — ADMIN INVOICE WORKSPACE
   File: js/admin-invoices.js

   Sprint: 9 — Industry-Standard Invoice Workspace

   Purpose:
   - Loads invoices, line items, payments, and invoice events.
   - Presents searchable invoice operations and financial summaries.
   - Opens a professional invoice detail workspace.
   - Calculates safe fallback totals while preserving database totals
     as the billing source of truth.
   - Supports print-ready invoice output.

   Security boundary:
   - Developer / Upper Admin: full invoice visibility.
   - Other roles: blocked by the existing access policy.

   Payment rule:
   - Payments are recorded externally/manually.
   - This module does not process card or online payments.
   ========================================================= */


/* =========================================================
   1. WORKSPACE STATE
   ========================================================= */

   let adminInvoiceState = {
    invoices: [],
    items: [],
    payments: [],
    events: [],
    selectedInvoiceId: null,
    search: "",
    invoiceStatus: "all",
    paymentStatus: "all",
    sort: "newest",
    loading: false,
    loadedAt: null
  };

  const invoicesList = document.getElementById("invoicesList");


  /* =========================================================
     2. CONSTANTS
     ========================================================= */

  const ADMIN_INVOICE_STATUS_LABELS = {
    draft: "Draft",
    issued: "Issued",
    sent: "Sent",
    viewed: "Viewed",
    partially_paid: "Partially Paid",
    paid: "Paid",
    finished: "Finished",
    overdue: "Overdue",
    void: "Void",
    cancelled: "Cancelled"
  };

  const ADMIN_PAYMENT_STATUS_LABELS = {
    unpaid: "Unpaid",
    partially_paid: "Partially Paid",
    paid: "Paid",
    refunded: "Refunded",
    void: "Void"
  };

  const ADMIN_INVOICE_CLOSED_STATUSES = new Set([
    "paid",
    "finished",
    "void",
    "cancelled"
  ]);


  /* =========================================================
     3. LOAD INVOICE WORKSPACE DATA
     ========================================================= */

  async function loadAdminInvoices(options = {}) {
    if (!invoicesList) return;

    const { preserveSelection = true } = options;

    const previousSelection = preserveSelection
      ? adminInvoiceState.selectedInvoiceId
      : null;

    if (!hasAdminInvoiceAccess()) {
      invoicesList.innerHTML = renderAdminInvoiceAccessDenied();
      return;
    }

    adminInvoiceState.loading = true;
    invoicesList.innerHTML = renderAdminInvoiceLoadingState();

    try {
      const [
        invoiceResult,
        itemResult,
        paymentResult,
        eventResult
      ] = await Promise.all([
        supabaseClient
          .from("invoices")
          .select("*")
          .order("invoice_date", { ascending: false })
          .order("created_at", { ascending: false }),

        supabaseClient
          .from("invoice_items")
          .select("*")
          .order("created_at", { ascending: true }),

        supabaseClient
          .from("payments")
          .select("*")
          .order("payment_date", { ascending: false })
          .order("created_at", { ascending: false }),

        supabaseClient
          .from("invoice_events")
          .select("*")
          .order("created_at", { ascending: false })
      ]);

      if (invoiceResult.error) {
        throw invoiceResult.error;
      }

      if (itemResult.error) {
        throw itemResult.error;
      }

      if (paymentResult.error) {
        throw paymentResult.error;
      }

      if (eventResult.error) {
        throw eventResult.error;
      }

      adminInvoiceState.invoices = invoiceResult.data || [];
      adminInvoiceState.items = itemResult.data || [];
      adminInvoiceState.payments = paymentResult.data || [];
      adminInvoiceState.events = eventResult.data || [];
      adminInvoiceState.loadedAt = new Date();
      adminInvoiceState.loading = false;

      const selectionStillExists = adminInvoiceState.invoices.some(
        (invoice) => Number(invoice.id) === Number(previousSelection)
      );

      adminInvoiceState.selectedInvoiceId = selectionStillExists
        ? Number(previousSelection)
        : null;

      renderAdminInvoices();
    } catch (error) {
      adminInvoiceState.loading = false;

      console.error(
        "Unable to load invoice workspace:",
        error
      );

      invoicesList.innerHTML =
        renderAdminInvoiceErrorState(error);
    }
  }


  /* =========================================================
     4. ACCESS CONTROL
     ========================================================= */

  function hasAdminInvoiceAccess() {
    if (typeof hasFullAccess === "function") {
      return Boolean(hasFullAccess());
    }

    return Boolean(
      window.currentProfile &&
      [
        "developer",
        "upper_admin"
      ].includes(window.currentProfile.role)
    );
  }

  function renderAdminInvoiceAccessDenied() {
    return `
      <div class="module-card invoice-empty-state">
        <p class="invoice-eyebrow">
          Restricted financial workspace
        </p>

        <h3>Invoice access is not available</h3>

        <p>
          The invoice workspace is reserved for Developer
          and Upper Admin roles.
        </p>
      </div>
    `;
  }


  /* =========================================================
     5. MAIN RENDERER
     ========================================================= */

  function renderAdminInvoices() {
    if (!invoicesList) return;

    if (adminInvoiceState.selectedInvoiceId) {
      const selectedInvoice = getAdminInvoiceById(
        adminInvoiceState.selectedInvoiceId
      );

      if (selectedInvoice) {
        invoicesList.innerHTML =
          renderAdminInvoiceWorkspace(selectedInvoice);

        bindAdminInvoiceWorkspaceEvents();
        return;
      }

      adminInvoiceState.selectedInvoiceId = null;
    }

    const filteredInvoices =
      getFilteredAdminInvoices();

    const summary =
      getAdminInvoicePortfolioSummary(
        adminInvoiceState.invoices
      );

    invoicesList.innerHTML = `
      <section
        class="invoice-dashboard"
        aria-label="Invoice dashboard"
      >
        ${renderAdminInvoicePortfolioHeader(summary)}

        ${renderAdminInvoiceToolbar()}

        ${renderAdminInvoiceSummaryCards(summary)}

        ${renderAdminInvoiceRegister(filteredInvoices)}
      </section>
    `;

    bindAdminInvoiceRegisterEvents();
  }


  /* =========================================================
     6. PORTFOLIO HEADER AND SUMMARY
     ========================================================= */

  function renderAdminInvoicePortfolioHeader(summary) {
    const refreshedLabel = adminInvoiceState.loadedAt
      ? `Updated ${formatAdminInvoiceDateTime(
          adminInvoiceState.loadedAt
        )}`
      : "Not refreshed yet";

    return `
      <div class="invoice-portfolio-header">
        <div>
          <p class="invoice-eyebrow">
            Accounts receivable
          </p>

          <h3>Invoice Register</h3>

          <p class="invoice-subtitle">
            ${summary.invoiceCount}
            invoice${summary.invoiceCount === 1 ? "" : "s"}
            · ${refreshedLabel}
          </p>
        </div>

        <button
          type="button"
          class="secondary-action-btn"
          id="refreshAdminInvoicesBtn"
        >
          Refresh invoices
        </button>
      </div>
    `;
  }

  function renderAdminInvoiceSummaryCards(summary) {
    return `
      <div class="invoice-summary-grid">
        ${renderAdminInvoiceMetricCard(
          "Total billed",
          formatAdminInvoiceMoney(summary.totalBilled),
          `${summary.activeInvoiceCount} active invoice${
            summary.activeInvoiceCount === 1 ? "" : "s"
          }`,
          "navy"
        )}

        ${renderAdminInvoiceMetricCard(
          "Payments received",
          formatAdminInvoiceMoney(summary.totalPaid),
          `${summary.paymentCount} payment record${
            summary.paymentCount === 1 ? "" : "s"
          }`,
          "green"
        )}

        ${renderAdminInvoiceMetricCard(
          "Outstanding balance",
          formatAdminInvoiceMoney(
            summary.totalOutstanding
          ),
          `${summary.outstandingCount} invoice${
            summary.outstandingCount === 1 ? "" : "s"
          } with balance`,
          summary.totalOutstanding > 0
            ? "orange"
            : "green"
        )}

        ${renderAdminInvoiceMetricCard(
          "Overdue",
          formatAdminInvoiceMoney(
            summary.totalOverdue
          ),
          `${summary.overdueCount} overdue invoice${
            summary.overdueCount === 1 ? "" : "s"
          }`,
          summary.overdueCount > 0
            ? "red"
            : "green"
        )}
      </div>
    `;
  }

  function renderAdminInvoiceMetricCard(
    label,
    value,
    detail,
    tone
  ) {
    return `
      <article
        class="
          invoice-metric-card
          invoice-metric-${invoiceEscapeHtml(tone)}
        "
      >
        <span>${invoiceEscapeHtml(label)}</span>

        <strong>${invoiceEscapeHtml(value)}</strong>

        <small>${invoiceEscapeHtml(detail)}</small>
      </article>
    `;
  }

  function getAdminInvoicePortfolioSummary(invoices) {
    return invoices.reduce(
      (summary, invoice) => {
        const financials =
          calculateAdminInvoiceFinancials(invoice);

        const invoiceStatus =
          normalizeAdminInvoiceStatus(
            invoice.invoice_status
          );

        const isCancelled = [
          "cancelled",
          "void"
        ].includes(invoiceStatus);

        const isOverdue =
          isAdminInvoiceOverdue(
            invoice,
            financials
          );

        summary.invoiceCount += 1;

        summary.paymentCount +=
          getAdminInvoicePayments(invoice.id).length;

        if (!isCancelled) {
          summary.totalBilled += financials.total;
          summary.totalPaid += financials.amountPaid;
          summary.totalOutstanding +=
            financials.balance;
        }

        if (
          !ADMIN_INVOICE_CLOSED_STATUSES.has(
            invoiceStatus
          )
        ) {
          summary.activeInvoiceCount += 1;
        }

        if (
          !isCancelled &&
          financials.balance > 0
        ) {
          summary.outstandingCount += 1;
        }

        if (isOverdue) {
          summary.overdueCount += 1;
          summary.totalOverdue +=
            financials.balance;
        }

        return summary;
      },
      {
        invoiceCount: 0,
        activeInvoiceCount: 0,
        paymentCount: 0,
        outstandingCount: 0,
        overdueCount: 0,
        totalBilled: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        totalOverdue: 0
      }
    );
  }


  /* =========================================================
     7. FILTER TOOLBAR
     ========================================================= */

  function renderAdminInvoiceToolbar() {
    return `
      <div class="invoice-register-toolbar">
        <label
          class="
            invoice-toolbar-field
            invoice-toolbar-search
          "
        >
          <span>Search invoices</span>

          <input
            type="search"
            id="adminInvoiceSearch"
            value="${invoiceEscapeAttribute(
              adminInvoiceState.search
            )}"
            placeholder="
              Invoice, customer, email, phone,
              vehicle or request
            "
            autocomplete="off"
          >
        </label>

        <label class="invoice-toolbar-field">
          <span>Invoice status</span>

          <select id="adminInvoiceStatusFilter">
            ${renderAdminInvoiceFilterOptions(
              ADMIN_INVOICE_STATUS_LABELS,
              adminInvoiceState.invoiceStatus
            )}
          </select>
        </label>

        <label class="invoice-toolbar-field">
          <span>Payment status</span>

          <select id="adminPaymentStatusFilter">
            ${renderAdminInvoiceFilterOptions(
              ADMIN_PAYMENT_STATUS_LABELS,
              adminInvoiceState.paymentStatus
            )}
          </select>
        </label>

        <label class="invoice-toolbar-field">
          <span>Sort</span>

          <select id="adminInvoiceSort">
            <option
              value="newest"
              ${
                adminInvoiceState.sort === "newest"
                  ? "selected"
                  : ""
              }
            >
              Newest first
            </option>

            <option
              value="oldest"
              ${
                adminInvoiceState.sort === "oldest"
                  ? "selected"
                  : ""
              }
            >
              Oldest first
            </option>

            <option
              value="highest"
              ${
                adminInvoiceState.sort === "highest"
                  ? "selected"
                  : ""
              }
            >
              Highest total
            </option>

            <option
              value="balance"
              ${
                adminInvoiceState.sort === "balance"
                  ? "selected"
                  : ""
              }
            >
              Highest balance
            </option>

            <option
              value="customer"
              ${
                adminInvoiceState.sort === "customer"
                  ? "selected"
                  : ""
              }
            >
              Customer A–Z
            </option>
          </select>
        </label>
      </div>
    `;
  }

  function renderAdminInvoiceFilterOptions(
    labelMap,
    selectedValue
  ) {
    const options = [
      `
        <option
          value="all"
          ${selectedValue === "all" ? "selected" : ""}
        >
          All statuses
        </option>
      `
    ];

    Object.entries(labelMap).forEach(
      ([value, label]) => {
        options.push(`
          <option
            value="${invoiceEscapeAttribute(value)}"
            ${
              selectedValue === value
                ? "selected"
                : ""
            }
          >
            ${invoiceEscapeHtml(label)}
          </option>
        `);
      }
    );

    return options.join("");
  }


  /* =========================================================
     8. INVOICE REGISTER
     ========================================================= */

  function renderAdminInvoiceRegister(invoices) {
    if (adminInvoiceState.invoices.length === 0) {
      return `
        <div class="module-card invoice-empty-state">
          <p class="invoice-eyebrow">
            Invoice register
          </p>

          <h3>No invoices have been created</h3>

          <p>
            Invoices will appear here after billing
            records are created from completed service
            requests or mechanic jobs.
          </p>
        </div>
      `;
    }

    if (invoices.length === 0) {
      return `
        <div class="module-card invoice-empty-state">
          <p class="invoice-eyebrow">
            No matching records
          </p>

          <h3>
            No invoices match the selected filters
          </h3>

          <p>
            Clear the search or choose different
            status filters.
          </p>
        </div>
      `;
    }

    return `
      <div class="invoice-register-wrap">
        <table class="invoice-register-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer / Vehicle</th>
              <th>Issued</th>
              <th>Invoice status</th>
              <th>Payment status</th>
              <th class="invoice-number-column">
                Total
              </th>
              <th class="invoice-number-column">
                Paid
              </th>
              <th class="invoice-number-column">
                Balance
              </th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            ${invoices
              .map(renderAdminInvoiceRegisterRow)
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderAdminInvoiceRegisterRow(invoice) {
    const financials =
      calculateAdminInvoiceFinancials(invoice);

    const invoiceStatus =
      getAdminInvoiceDisplayStatus(
        invoice,
        financials
      );

    const paymentStatus =
      getAdminInvoicePaymentStatus(
        invoice,
        financials
      );

    const requestLabel =
      invoice.service_request_id
        ? `Request #${Number(
            invoice.service_request_id
          )}`
        : "Unlinked invoice";

    const overdue =
      isAdminInvoiceOverdue(
        invoice,
        financials
      );

    return `
      <tr
        class="${
          overdue
            ? "invoice-row-overdue"
            : ""
        }"
      >
        <td>
          <strong>
            ${invoiceEscapeHtml(
              invoice.invoice_number ||
              `INV-${invoice.id}`
            )}
          </strong>

          <small>
            ${invoiceEscapeHtml(requestLabel)}
          </small>
        </td>

        <td>
          <strong>
            ${invoiceEscapeHtml(
              invoice.customer_name ||
              "Customer not recorded"
            )}
          </strong>

          <small>
            ${invoiceEscapeHtml(
              invoice.vehicle ||
              invoice.customer_email ||
              "Vehicle not recorded"
            )}
          </small>
        </td>

        <td>
          ${invoiceEscapeHtml(
            formatAdminInvoiceDate(
              invoice.invoice_date ||
              invoice.created_at
            )
          )}

          ${
            invoice.due_date
              ? `
                <small>
                  Due ${invoiceEscapeHtml(
                    formatAdminInvoiceDate(
                      invoice.due_date
                    )
                  )}
                </small>
              `
              : ""
          }
        </td>

        <td>
          ${renderAdminInvoiceStatusBadge(
            invoiceStatus.key,
            invoiceStatus.label
          )}
        </td>

        <td>
          ${renderAdminInvoiceStatusBadge(
            paymentStatus.key,
            paymentStatus.label
          )}
        </td>

        <td class="invoice-number-column">
          <strong>
            ${invoiceEscapeHtml(
              formatAdminInvoiceMoney(
                financials.total,
                invoice.currency_code
              )
            )}
          </strong>
        </td>

        <td class="invoice-number-column">
          ${invoiceEscapeHtml(
            formatAdminInvoiceMoney(
              financials.amountPaid,
              invoice.currency_code
            )
          )}
        </td>

        <td class="invoice-number-column">
          <strong>
            ${invoiceEscapeHtml(
              formatAdminInvoiceMoney(
                financials.balance,
                invoice.currency_code
              )
            )}
          </strong>
        </td>

        <td>
          <button
            type="button"
            class="
              table-action-btn
              admin-invoice-open-btn
            "
            data-invoice-id="${Number(invoice.id)}"
          >
            Open invoice
          </button>
        </td>
      </tr>
    `;
  }


  /* =========================================================
     9. FILTERING AND SORTING
     ========================================================= */

  function getFilteredAdminInvoices() {
    const search =
      normalizeAdminInvoiceSearch(
        adminInvoiceState.search
      );

    const filtered =
      adminInvoiceState.invoices.filter(
        (invoice) => {
          const financials =
            calculateAdminInvoiceFinancials(
              invoice
            );

          const invoiceStatus =
            getAdminInvoiceDisplayStatus(
              invoice,
              financials
            ).key;

          const paymentStatus =
            getAdminInvoicePaymentStatus(
              invoice,
              financials
            ).key;

          const matchesInvoiceStatus =
            adminInvoiceState.invoiceStatus === "all" ||
            invoiceStatus ===
              adminInvoiceState.invoiceStatus;

          const matchesPaymentStatus =
            adminInvoiceState.paymentStatus === "all" ||
            paymentStatus ===
              adminInvoiceState.paymentStatus;

          if (
            !matchesInvoiceStatus ||
            !matchesPaymentStatus
          ) {
            return false;
          }

          if (!search) {
            return true;
          }

          const searchableText =
            normalizeAdminInvoiceSearch(
              [
                invoice.invoice_number,
                invoice.customer_name,
                invoice.customer_email,
                invoice.customer_phone,
                invoice.vehicle,
                invoice.service_request_id,
                invoice.notes,
                invoice.purchase_order_number,
                invoice.work_order_number
              ]
                .filter(Boolean)
                .join(" ")
            );

          return searchableText.includes(search);
        }
      );

    return filtered.sort(compareAdminInvoices);
  }

  function compareAdminInvoices(
    invoiceA,
    invoiceB
  ) {
    const dateA =
      getAdminInvoiceTimestamp(invoiceA);

    const dateB =
      getAdminInvoiceTimestamp(invoiceB);

    if (adminInvoiceState.sort === "oldest") {
      return dateA - dateB;
    }

    if (adminInvoiceState.sort === "highest") {
      return (
        calculateAdminInvoiceFinancials(
          invoiceB
        ).total -
        calculateAdminInvoiceFinancials(
          invoiceA
        ).total
      );
    }

    if (adminInvoiceState.sort === "balance") {
      return (
        calculateAdminInvoiceFinancials(
          invoiceB
        ).balance -
        calculateAdminInvoiceFinancials(
          invoiceA
        ).balance
      );
    }

    if (adminInvoiceState.sort === "customer") {
      return String(
        invoiceA.customer_name || ""
      ).localeCompare(
        String(invoiceB.customer_name || ""),
        undefined,
        {
          sensitivity: "base"
        }
      );
    }

    return dateB - dateA;
  }

  function normalizeAdminInvoiceSearch(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function getAdminInvoiceTimestamp(invoice) {
    const value =
      invoice.invoice_date ||
      invoice.created_at;

    const timestamp = value
      ? new Date(value).getTime()
      : 0;

    return Number.isFinite(timestamp)
      ? timestamp
      : 0;
  }


  /* =========================================================
     10. OPEN / CLOSE INVOICE WORKSPACE
     ========================================================= */

  function openAdminInvoiceWorkspace(invoiceId) {
    const invoice =
      getAdminInvoiceById(invoiceId);

    if (!invoice) {
      showAdminInvoiceNotice(
        "Invoice not found",
        "The selected invoice could not be located. Refresh the invoice register."
      );

      return;
    }

    adminInvoiceState.selectedInvoiceId =
      Number(invoiceId);

    renderAdminInvoices();
    scrollAdminInvoiceWorkspaceIntoView();
  }

  function closeAdminInvoiceWorkspace() {
    adminInvoiceState.selectedInvoiceId = null;

    renderAdminInvoices();
    scrollAdminInvoiceWorkspaceIntoView();
  }

  function scrollAdminInvoiceWorkspaceIntoView() {
    const invoiceSection =
      document.getElementById(
        "invoicesSection"
      );

    if (
      invoiceSection &&
      typeof invoiceSection.scrollIntoView ===
        "function"
    ) {
      invoiceSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }


  /* =========================================================
     11. PROFESSIONAL INVOICE WORKSPACE
     ========================================================= */

  function renderAdminInvoiceWorkspace(invoice) {
    const items =
      getAdminInvoiceItems(invoice.id);

    const payments =
      getAdminInvoicePayments(invoice.id);

    const events =
      getAdminInvoiceEvents(invoice.id);

    const financials =
      calculateAdminInvoiceFinancials(invoice);

    const invoiceStatus =
      getAdminInvoiceDisplayStatus(
        invoice,
        financials
      );

    const paymentStatus =
      getAdminInvoicePaymentStatus(
        invoice,
        financials
      );

    return `
      <section
        class="invoice-workspace"
        aria-label="Invoice ${invoiceEscapeAttribute(
          invoice.invoice_number ||
          invoice.id
        )}"
      >
        <div class="invoice-workspace-actions">
          <button
            type="button"
            class="secondary-action-btn"
            id="closeAdminInvoiceWorkspaceBtn"
          >
            Back to invoice register
          </button>

          <div class="invoice-workspace-action-group">
            <button
              type="button"
              class="secondary-action-btn"
              id="refreshSelectedInvoiceBtn"
            >
              Refresh
            </button>

            <button
              type="button"
              class="table-action-btn"
              id="printAdminInvoiceBtn"
              data-invoice-id="${Number(invoice.id)}"
            >
              Print invoice
            </button>
          </div>
        </div>

        <article
          class="invoice-document"
          id="adminInvoiceDocument"
        >
          ${renderAdminInvoiceDocumentHeader(
            invoice,
            invoiceStatus,
            paymentStatus
          )}

          ${renderAdminInvoiceParties(invoice)}

          ${renderAdminInvoiceMetadata(invoice)}

          ${renderAdminInvoiceLineItems(
            invoice,
            items
          )}

          ${renderAdminInvoiceTotals(
            invoice,
            financials
          )}

          ${renderAdminInvoiceNotes(invoice)}
        </article>

        <div class="invoice-support-grid">
          ${renderAdminInvoicePaymentPanel(
            invoice,
            payments,
            financials
          )}

          ${renderAdminInvoiceAuditPanel(events)}
        </div>
      </section>
    `;
  }

  function renderAdminInvoiceDocumentHeader(
    invoice,
    invoiceStatus,
    paymentStatus
  ) {
    return `
      <header class="invoice-document-header">
        <div class="invoice-business-identity">
          <p class="invoice-business-name">
            GO EAST <span>MECHANICS</span>
          </p>

          <p>
            Automotive Repairs &amp; Vehicle Sales
          </p>

          <small>
            Professional service invoice
          </small>
        </div>

        <div class="invoice-document-title">
          <p class="invoice-eyebrow">
            Invoice
          </p>

          <h2>
            ${invoiceEscapeHtml(
              invoice.invoice_number ||
              `INV-${invoice.id}`
            )}
          </h2>

          <div class="invoice-status-group">
            ${renderAdminInvoiceStatusBadge(
              invoiceStatus.key,
              invoiceStatus.label
            )}

            ${renderAdminInvoiceStatusBadge(
              paymentStatus.key,
              paymentStatus.label
            )}
          </div>
        </div>
      </header>
    `;
  }

  function renderAdminInvoiceParties(invoice) {
    return `
      <div class="invoice-party-grid">
        <section>
          <span class="invoice-detail-label">
            Bill to
          </span>

          <strong>
            ${invoiceEscapeHtml(
              invoice.customer_name ||
              "Customer not recorded"
            )}
          </strong>

          <p>
            ${invoiceEscapeHtml(
              invoice.customer_email ||
              "Email not recorded"
            )}
          </p>

          <p>
            ${invoiceEscapeHtml(
              invoice.customer_phone ||
              "Phone not recorded"
            )}
          </p>

          ${
            invoice.billing_address
              ? `
                <p>
                  ${invoiceEscapeHtml(
                    invoice.billing_address
                  )}
                </p>
              `
              : ""
          }
        </section>

        <section>
          <span class="invoice-detail-label">
            Vehicle / work order
          </span>

          <strong>
            ${invoiceEscapeHtml(
              invoice.vehicle ||
              "Vehicle not recorded"
            )}
          </strong>

          <p>
            ${
              invoice.service_request_id
                ? `Service Request #${Number(
                    invoice.service_request_id
                  )}`
                : "No linked service request"
            }
          </p>

          ${
            invoice.job_card_id
              ? `
                <p>
                  Mechanic Job #${Number(
                    invoice.job_card_id
                  )}
                </p>
              `
              : ""
          }

          ${
            invoice.work_order_number
              ? `
                <p>
                  Work Order:
                  ${invoiceEscapeHtml(
                    invoice.work_order_number
                  )}
                </p>
              `
              : ""
          }
        </section>
      </div>
    `;
  }

  function renderAdminInvoiceMetadata(invoice) {
    const metadata = [
      [
        "Invoice date",
        formatAdminInvoiceDate(
          invoice.invoice_date ||
          invoice.created_at
        )
      ],
      [
        "Due date",
        invoice.due_date
          ? formatAdminInvoiceDate(
              invoice.due_date
            )
          : "Due on receipt"
      ],
      [
        "Currency",
        String(
          invoice.currency_code || "CAD"
        ).toUpperCase()
      ],
      [
        "Purchase order",
        invoice.purchase_order_number ||
        "Not provided"
      ],
      [
        "Created",
        formatAdminInvoiceDateTime(
          invoice.created_at
        )
      ],
      [
        "Last updated",
        formatAdminInvoiceDateTime(
          invoice.updated_at ||
          invoice.created_at
        )
      ]
    ];

    return `
      <div class="invoice-metadata-grid">
        ${metadata
          .map(
            ([label, value]) => `
              <div>
                <span>
                  ${invoiceEscapeHtml(label)}
                </span>

                <strong>
                  ${invoiceEscapeHtml(value)}
                </strong>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderAdminInvoiceLineItems(
    invoice,
    items
  ) {
    return `
      <section class="invoice-line-items-section">
        <div class="invoice-section-heading">
          <div>
            <span class="invoice-detail-label">
              Charges
            </span>

            <h3>Invoice line items</h3>
          </div>

          <small>
            ${items.length}
            item${items.length === 1 ? "" : "s"}
          </small>
        </div>

        <div class="invoice-line-items-wrap">
          <table class="invoice-line-items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Reference</th>

                <th class="invoice-number-column">
                  Qty
                </th>

                <th class="invoice-number-column">
                  Unit price
                </th>

                <th class="invoice-number-column">
                  Line total
                </th>
              </tr>
            </thead>

            <tbody>
              ${
                items.length > 0
                  ? items
                      .map(
                        (item) =>
                          renderAdminInvoiceLineItem(
                            invoice,
                            item
                          )
                      )
                      .join("")
                  : `
                    <tr>
                      <td
                        colspan="5"
                        class="invoice-empty-table-cell"
                      >
                        No structured line items are
                        recorded for this invoice.
                      </td>
                    </tr>
                  `
              }
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderAdminInvoiceLineItem(
    invoice,
    item
  ) {
    const quantity =
      Number(item.quantity || 0);

    const unitPrice =
      Number(item.unit_price || 0);

    const lineTotal =
      Number(
        item.line_total ??
        quantity * unitPrice
      );

    const reference =
      item.job_card_id
        ? `JOB-${Number(item.job_card_id)}`
        : item.item_type ||
          item.category ||
          "General";

    return `
      <tr>
        <td>
          <strong>
            ${invoiceEscapeHtml(
              item.description ||
              "Invoice item"
            )}
          </strong>

          ${
            item.notes
              ? `
                <small>
                  ${invoiceEscapeHtml(item.notes)}
                </small>
              `
              : ""
          }
        </td>

        <td>
          ${invoiceEscapeHtml(reference)}
        </td>

        <td class="invoice-number-column">
          ${invoiceEscapeHtml(
            formatAdminInvoiceQuantity(quantity)
          )}
        </td>

        <td class="invoice-number-column">
          ${invoiceEscapeHtml(
            formatAdminInvoiceMoney(
              unitPrice,
              invoice.currency_code
            )
          )}
        </td>

        <td class="invoice-number-column">
          <strong>
            ${invoiceEscapeHtml(
              formatAdminInvoiceMoney(
                lineTotal,
                invoice.currency_code
              )
            )}
          </strong>
        </td>
      </tr>
    `;
  }

  function renderAdminInvoiceTotals(
    invoice,
    financials
  ) {
    return `
      <div class="invoice-totals-layout">
        <div class="invoice-payment-terms">
          <span class="invoice-detail-label">
            Payment terms
          </span>

          <p>
            ${invoiceEscapeHtml(
              invoice.payment_terms ||
              "Payment is recorded manually when received."
            )}
          </p>
        </div>

        <dl class="invoice-totals-card">
          <div>
            <dt>Subtotal</dt>

            <dd>
              ${invoiceEscapeHtml(
                formatAdminInvoiceMoney(
                  financials.subtotal,
                  invoice.currency_code
                )
              )}
            </dd>
          </div>

          <div>
            <dt>Discount</dt>

            <dd>
              −
              ${invoiceEscapeHtml(
                formatAdminInvoiceMoney(
                  financials.discount,
                  invoice.currency_code
                )
              )}
            </dd>
          </div>

          <div>
            <dt>Tax</dt>

            <dd>
              ${invoiceEscapeHtml(
                formatAdminInvoiceMoney(
                  financials.tax,
                  invoice.currency_code
                )
              )}
            </dd>
          </div>

          <div class="invoice-total-row">
            <dt>Invoice total</dt>

            <dd>
              ${invoiceEscapeHtml(
                formatAdminInvoiceMoney(
                  financials.total,
                  invoice.currency_code
                )
              )}
            </dd>
          </div>

          <div>
            <dt>Payments received</dt>

            <dd>
              −
              ${invoiceEscapeHtml(
                formatAdminInvoiceMoney(
                  financials.amountPaid,
                  invoice.currency_code
                )
              )}
            </dd>
          </div>

          <div class="invoice-balance-row">
            <dt>Balance due</dt>

            <dd>
              ${invoiceEscapeHtml(
                formatAdminInvoiceMoney(
                  financials.balance,
                  invoice.currency_code
                )
              )}
            </dd>
          </div>
        </dl>
      </div>
    `;
  }

  function renderAdminInvoiceNotes(invoice) {
    return `
      <footer class="invoice-document-footer">
        <div>
          <span class="invoice-detail-label">
            Invoice notes
          </span>

          <p>
            ${invoiceEscapeHtml(
              invoice.notes ||
              "No invoice notes recorded."
            )}
          </p>
        </div>

        <p class="invoice-thank-you">
          Thank you for choosing Go East Mechanics.
        </p>
      </footer>
    `;
  }


  /* =========================================================
     12. PAYMENT PANEL
     ========================================================= */

  function renderAdminInvoicePaymentPanel(
    invoice,
    payments,
    financials
  ) {
    return `
      <section class="invoice-support-card">
        <div class="invoice-section-heading">
          <div>
            <span class="invoice-detail-label">
              Receipts
            </span>

            <h3>Payment history</h3>
          </div>

          <strong>
            ${invoiceEscapeHtml(
              formatAdminInvoiceMoney(
                financials.amountPaid,
                invoice.currency_code
              )
            )}
          </strong>
        </div>

        ${
          payments.length === 0
            ? `
              <div class="invoice-support-empty">
                No payments have been recorded for
                this invoice.
              </div>
            `
            : `
              <div class="invoice-payment-list">
                ${payments
                  .map(
                    (payment) =>
                      renderAdminInvoicePayment(
                        invoice,
                        payment
                      )
                  )
                  .join("")}
              </div>
            `
        }
      </section>
    `;
  }

  function renderAdminInvoicePayment(
    invoice,
    payment
  ) {
    const receiptNumber =
      payment.receipt_number ||
      payment.reference_number ||
      `PAY-${payment.id}`;

    return `
      <article class="invoice-payment-entry">
        <div>
          <strong>
            ${invoiceEscapeHtml(
              formatAdminInvoiceMoney(
                payment.amount,
                payment.currency_code ||
                invoice.currency_code
              )
            )}
          </strong>

          <span>
            ${invoiceEscapeHtml(
              formatAdminPaymentMethod(
                payment.payment_method
              )
            )}
          </span>
        </div>

        <div>
          <strong>
            ${invoiceEscapeHtml(receiptNumber)}
          </strong>

          <span>
            ${invoiceEscapeHtml(
              formatAdminInvoiceDateTime(
                payment.payment_date ||
                payment.paid_at ||
                payment.created_at
              )
            )}
          </span>
        </div>

        <div>
          <strong>
            ${invoiceEscapeHtml(
              formatAdminInvoiceStatusLabel(
                payment.payment_status ||
                "paid"
              )
            )}
          </strong>

          <span>
            ${invoiceEscapeHtml(
              payment.notes ||
              "No payment notes"
            )}
          </span>
        </div>
      </article>
    `;
  }


  /* =========================================================
     13. AUDIT EVENT PANEL
     ========================================================= */

  function renderAdminInvoiceAuditPanel(events) {
    return `
      <section class="invoice-support-card">
        <div class="invoice-section-heading">
          <div>
            <span class="invoice-detail-label">
              Audit trail
            </span>

            <h3>Invoice activity</h3>
          </div>

          <small>
            ${events.length}
            event${events.length === 1 ? "" : "s"}
          </small>
        </div>

        ${
          events.length === 0
            ? `
              <div class="invoice-support-empty">
                No invoice events have been
                recorded yet.
              </div>
            `
            : `
              <div class="invoice-event-list">
                ${events
                  .map(renderAdminInvoiceEvent)
                  .join("")}
              </div>
            `
        }
      </section>
    `;
  }

  function renderAdminInvoiceEvent(event) {
    const title =
      event.title ||
      event.event_type ||
      event.action ||
      "Invoice updated";

    const message =
      event.message ||
      event.notes ||
      event.description ||
      "Invoice activity recorded.";

    return `
      <article class="invoice-event-entry">
        <span
          class="invoice-event-dot"
          aria-hidden="true"
        ></span>

        <div>
          <strong>
            ${invoiceEscapeHtml(
              formatAdminInvoiceStatusLabel(
                title
              )
            )}
          </strong>

          <p>
            ${invoiceEscapeHtml(message)}
          </p>

          <small>
            ${invoiceEscapeHtml(
              formatAdminInvoiceDateTime(
                event.created_at ||
                event.event_date
              )
            )}
          </small>
        </div>
      </article>
    `;
  }


  /* =========================================================
     14. DATA HELPERS
     ========================================================= */

  function getAdminInvoiceById(invoiceId) {
    return (
      adminInvoiceState.invoices.find(
        (invoice) =>
          Number(invoice.id) ===
          Number(invoiceId)
      ) || null
    );
  }

  function getAdminInvoiceItems(invoiceId) {
    return adminInvoiceState.items.filter(
      (item) =>
        Number(item.invoice_id) ===
        Number(invoiceId)
    );
  }

  function getAdminInvoicePayments(invoiceId) {
    return adminInvoiceState.payments.filter(
      (payment) =>
        Number(payment.invoice_id) ===
        Number(invoiceId)
    );
  }

  function getAdminInvoiceEvents(invoiceId) {
    return adminInvoiceState.events.filter(
      (event) =>
        Number(event.invoice_id) ===
        Number(invoiceId)
    );
  }


  /* =========================================================
     15. FINANCIAL CALCULATIONS
     ========================================================= */

  function calculateAdminInvoiceFinancials(invoice) {
    const items =
      getAdminInvoiceItems(invoice.id);

    const payments =
      getAdminInvoicePayments(invoice.id);

    const calculatedItemSubtotal =
      roundAdminInvoiceMoney(
        items.reduce((sum, item) => {
          const lineTotal = Number(
            item.line_total ??
            Number(item.quantity || 0) *
            Number(item.unit_price || 0)
          );

          return (
            sum +
            (
              Number.isFinite(lineTotal)
                ? lineTotal
                : 0
            )
          );
        }, 0)
      );

    const storedSubtotal =
      toAdminInvoiceNumber(
        invoice.subtotal
      );

    const subtotal =
      storedSubtotal > 0
        ? storedSubtotal
        : calculatedItemSubtotal;

    const discount = Math.max(
      toAdminInvoiceNumber(
        invoice.discount
      ),
      0
    );

    const tax = Math.max(
      toAdminInvoiceNumber(invoice.tax),
      0
    );

    const calculatedTotal = Math.max(
      roundAdminInvoiceMoney(
        subtotal - discount + tax
      ),
      0
    );

    const storedTotal =
      toAdminInvoiceNumber(
        invoice.total ??
        invoice.final_cost
      );

    const total =
      storedTotal > 0
        ? storedTotal
        : calculatedTotal;

    const paymentRowsTotal =
      roundAdminInvoiceMoney(
        payments.reduce((sum, payment) => {
          const amount =
            toAdminInvoiceNumber(
              payment.amount
            );

          const status = String(
            payment.payment_status ||
            "paid"
          )
            .trim()
            .toLowerCase();

          if (
            [
              "void",
              "cancelled",
              "failed"
            ].includes(status)
          ) {
            return sum;
          }

          if (status === "refunded") {
            return sum - amount;
          }

          return sum + amount;
        }, 0)
      );

    const storedAmountPaid =
      toAdminInvoiceNumber(
        invoice.amount_paid
      );

    const amountPaid = Math.max(
      paymentRowsTotal > 0
        ? paymentRowsTotal
        : storedAmountPaid,
      0
    );

    const storedBalance =
      toAdminInvoiceNumber(
        invoice.balance_due
      );

    const calculatedBalance = Math.max(
      roundAdminInvoiceMoney(
        total - amountPaid
      ),
      0
    );

    const balance =
      storedBalance >= 0 &&
      Math.abs(
        storedBalance -
        calculatedBalance
      ) < 0.01
        ? storedBalance
        : calculatedBalance;

    return {
      calculatedItemSubtotal,
      subtotal:
        roundAdminInvoiceMoney(subtotal),
      discount:
        roundAdminInvoiceMoney(discount),
      tax:
        roundAdminInvoiceMoney(tax),
      total:
        roundAdminInvoiceMoney(total),
      amountPaid:
        roundAdminInvoiceMoney(amountPaid),
      balance:
        roundAdminInvoiceMoney(balance)
    };
  }

  function toAdminInvoiceNumber(value) {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : 0;
  }

  function roundAdminInvoiceMoney(value) {
    return (
      Math.round(
        (
          toAdminInvoiceNumber(value) +
          Number.EPSILON
        ) * 100
      ) / 100
    );
  }


  /* =========================================================
     16. STATUS HELPERS
     ========================================================= */

  function normalizeAdminInvoiceStatus(status) {
    return String(status || "draft")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
  }

  function getAdminInvoiceDisplayStatus(
    invoice,
    financials
  ) {
    const storedStatus =
      normalizeAdminInvoiceStatus(
        invoice.invoice_status
      );

    if (
      [
        "cancelled",
        "void"
      ].includes(storedStatus)
    ) {
      return {
        key: storedStatus,
        label:
          formatAdminInvoiceStatusLabel(
            storedStatus
          )
      };
    }

    if (
      isAdminInvoiceOverdue(
        invoice,
        financials
      )
    ) {
      return {
        key: "overdue",
        label: "Overdue"
      };
    }

    return {
      key: storedStatus,
      label:
        ADMIN_INVOICE_STATUS_LABELS[
          storedStatus
        ] ||
        formatAdminInvoiceStatusLabel(
          storedStatus
        )
    };
  }

  function getAdminInvoicePaymentStatus(
    invoice,
    financials
  ) {
    const storedStatus =
      normalizeAdminInvoiceStatus(
        invoice.payment_status
      );

    if (
      [
        "refunded",
        "void"
      ].includes(storedStatus)
    ) {
      return {
        key: storedStatus,
        label:
          ADMIN_PAYMENT_STATUS_LABELS[
            storedStatus
          ] ||
          formatAdminInvoiceStatusLabel(
            storedStatus
          )
      };
    }

    if (
      financials.total > 0 &&
      financials.balance <= 0.009
    ) {
      return {
        key: "paid",
        label: "Paid"
      };
    }

    if (
      financials.amountPaid > 0 &&
      financials.balance > 0.009
    ) {
      return {
        key: "partially_paid",
        label: "Partially Paid"
      };
    }

    return {
      key: "unpaid",
      label: "Unpaid"
    };
  }

  function isAdminInvoiceOverdue(
    invoice,
    financials
  ) {
    if (
      !invoice.due_date ||
      financials.balance <= 0.009
    ) {
      return false;
    }

    const dueDate =
      new Date(invoice.due_date);

    if (
      Number.isNaN(
        dueDate.getTime()
      )
    ) {
      return false;
    }

    const endOfDueDate =
      new Date(dueDate);

    endOfDueDate.setHours(
      23,
      59,
      59,
      999
    );

    return (
      endOfDueDate.getTime() <
      Date.now()
    );
  }

  function renderAdminInvoiceStatusBadge(
    key,
    label
  ) {
    return `
      <span
        class="
          status-badge
          invoice-status-badge
          status-${invoiceEscapeAttribute(key)}
        "
      >
        ${invoiceEscapeHtml(label)}
      </span>
    `;
  }

  function formatAdminInvoiceStatusLabel(value) {
    return String(value || "-")
      .trim()
      .replace(/[_-]+/g, " ")
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase()
      );
  }

  function formatAdminPaymentMethod(value) {
    const normalized =
      String(value || "Payment")
        .trim()
        .replace(/[_-]+/g, " ");

    return normalized.replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
  }


  /* =========================================================
     17. EVENT BINDING
     ========================================================= */

  function bindAdminInvoiceRegisterEvents() {
    const searchInput =
      document.getElementById(
        "adminInvoiceSearch"
      );

    const invoiceStatusFilter =
      document.getElementById(
        "adminInvoiceStatusFilter"
      );

    const paymentStatusFilter =
      document.getElementById(
        "adminPaymentStatusFilter"
      );

    const sortSelect =
      document.getElementById(
        "adminInvoiceSort"
      );

    const refreshButton =
      document.getElementById(
        "refreshAdminInvoicesBtn"
      );

    if (searchInput) {
      searchInput.addEventListener(
        "input",
        debounceAdminInvoiceInput(
          (event) => {
            adminInvoiceState.search =
              event.target.value || "";

            renderAdminInvoices();

            const replacementSearch =
              document.getElementById(
                "adminInvoiceSearch"
              );

            if (replacementSearch) {
              replacementSearch.focus();

              replacementSearch.setSelectionRange(
                replacementSearch.value.length,
                replacementSearch.value.length
              );
            }
          },
          180
        )
      );
    }

    if (invoiceStatusFilter) {
      invoiceStatusFilter.addEventListener(
        "change",
        (event) => {
          adminInvoiceState.invoiceStatus =
            event.target.value;

          renderAdminInvoices();
        }
      );
    }

    if (paymentStatusFilter) {
      paymentStatusFilter.addEventListener(
        "change",
        (event) => {
          adminInvoiceState.paymentStatus =
            event.target.value;

          renderAdminInvoices();
        }
      );
    }

    if (sortSelect) {
      sortSelect.addEventListener(
        "change",
        (event) => {
          adminInvoiceState.sort =
            event.target.value;

          renderAdminInvoices();
        }
      );
    }

    if (refreshButton) {
      refreshButton.addEventListener(
        "click",
        () => {
          loadAdminInvoices({
            preserveSelection: false
          });
        }
      );
    }

    document
      .querySelectorAll(
        ".admin-invoice-open-btn"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            openAdminInvoiceWorkspace(
              button.dataset.invoiceId
            );
          }
        );
      });
  }

  function bindAdminInvoiceWorkspaceEvents() {
    const closeButton =
      document.getElementById(
        "closeAdminInvoiceWorkspaceBtn"
      );

    const refreshButton =
      document.getElementById(
        "refreshSelectedInvoiceBtn"
      );

    const printButton =
      document.getElementById(
        "printAdminInvoiceBtn"
      );

    if (closeButton) {
      closeButton.addEventListener(
        "click",
        closeAdminInvoiceWorkspace
      );
    }

    if (refreshButton) {
      refreshButton.addEventListener(
        "click",
        () => {
          loadAdminInvoices({
            preserveSelection: true
          });
        }
      );
    }

    if (printButton) {
      printButton.addEventListener(
        "click",
        () => {
          printAdminInvoice(
            printButton.dataset.invoiceId
          );
        }
      );
    }
  }

  function debounceAdminInvoiceInput(
    callback,
    delay = 200
  ) {
    let timerId = null;

    return (...args) => {
      window.clearTimeout(timerId);

      timerId = window.setTimeout(
        () => callback(...args),
        delay
      );
    };
  }


  /* =========================================================
     18. PRINT-READY INVOICE
     ========================================================= */

  function printAdminInvoice(invoiceId) {
    const invoice =
      getAdminInvoiceById(invoiceId);

    if (!invoice) {
      showAdminInvoiceNotice(
        "Invoice not found",
        "The selected invoice could not be printed."
      );

      return;
    }

    const documentNode =
      document.getElementById(
        "adminInvoiceDocument"
      );

    if (!documentNode) {
      showAdminInvoiceNotice(
        "Invoice document unavailable",
        "Open the invoice workspace before printing."
      );

      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=1100,height=850"
    );

    if (!printWindow) {
      showAdminInvoiceNotice(
        "Print window blocked",
        "Allow pop-ups for this site, then try printing again."
      );

      return;
    }

    const styles = Array.from(
      document.querySelectorAll(
        'link[rel="stylesheet"], style'
      )
    )
      .map((node) => node.outerHTML)
      .join("\n");

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">

          <meta
            name="viewport"
            content="
              width=device-width,
              initial-scale=1.0
            "
          >

          <title>
            ${invoiceEscapeHtml(
              invoice.invoice_number ||
              `INV-${invoice.id}`
            )}
          </title>

          ${styles}

          <style>
            body {
              margin: 0;
              padding: 24px;
              background: #ffffff;
            }

            .invoice-document {
              max-width: 900px;
              margin: 0 auto;
              box-shadow: none !important;
              border: 1px solid #d9e2ec;
            }

            @page {
              size: Letter;
              margin: 14mm;
            }
          </style>
        </head>

        <body>
          ${documentNode.outerHTML}

          <script>
            window.addEventListener(
              "load",
              function () {
                window.print();
              }
            );
          <\/script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }


  /* =========================================================
     19. FORMATTING AND ESCAPING
     ========================================================= */

  function formatAdminInvoiceMoney(
    value,
    currencyCode = "CAD"
  ) {
    const currency =
      String(
        currencyCode || "CAD"
      ).toUpperCase();

    try {
      return new Intl.NumberFormat(
        "en-CA",
        {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      ).format(
        toAdminInvoiceNumber(value)
      );
    } catch (error) {
      return `$${toAdminInvoiceNumber(
        value
      ).toFixed(2)}`;
    }
  }

  function formatAdminInvoiceDate(value) {
    if (!value) {
      return "Not recorded";
    }

    const date =
      value instanceof Date
        ? value
        : new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Not recorded";
    }

    return new Intl.DateTimeFormat(
      "en-CA",
      {
        year: "numeric",
        month: "short",
        day: "numeric"
      }
    ).format(date);
  }

  function formatAdminInvoiceDateTime(value) {
    if (!value) {
      return "Not recorded";
    }

    const date =
      value instanceof Date
        ? value
        : new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Not recorded";
    }

    return new Intl.DateTimeFormat(
      "en-CA",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }
    ).format(date);
  }

  function formatAdminInvoiceQuantity(value) {
    const quantity =
      toAdminInvoiceNumber(value);

    return Number.isInteger(quantity)
      ? String(quantity)
      : quantity.toFixed(2);
  }

  function invoiceEscapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function invoiceEscapeAttribute(value) {
    return invoiceEscapeHtml(value)
      .replace(/`/g, "&#096;");
  }


  /* =========================================================
     20. LOADING, ERROR, AND NOTICE UI
     ========================================================= */

  function renderAdminInvoiceLoadingState() {
    return `
      <div
        class="module-card invoice-empty-state"
        aria-live="polite"
      >
        <p class="invoice-eyebrow">
          Accounts receivable
        </p>

        <h3>Loading invoice workspace</h3>

        <p>
          Retrieving invoices, line items,
          payments, and audit events.
        </p>
      </div>
    `;
  }

  function renderAdminInvoiceErrorState(error) {
    const message =
      error && error.message
        ? error.message
        : "An unexpected error occurred.";

    return `
      <div
        class="
          module-card
          invoice-empty-state
          invoice-error-state
        "
      >
        <p class="invoice-eyebrow">
          Invoice workspace error
        </p>

        <h3>Invoices could not be loaded</h3>

        <p>
          ${invoiceEscapeHtml(message)}
        </p>

        <button
          type="button"
          class="table-action-btn"
          id="retryAdminInvoiceLoadBtn"
        >
          Try again
        </button>
      </div>
    `;
  }

  function showAdminInvoiceNotice(
    title,
    message
  ) {
    if (
      typeof openAdminModal ===
      "function"
    ) {
      openAdminModal({
        title,
        subtitle: "Invoice workspace",

        content: `
          <p>
            ${invoiceEscapeHtml(message)}
          </p>
        `,

        footer: `
          <button
            type="button"
            class="table-action-btn"
            onclick="closeAdminModal()"
          >
            Close
          </button>
        `
      });

      return;
    }

    window.alert(
      `${title}\n\n${message}`
    );
  }


  document.addEventListener(
    "click",
    (event) => {
      const retryButton =
        event.target.closest(
          "#retryAdminInvoiceLoadBtn"
        );

      if (retryButton) {
        loadAdminInvoices({
          preserveSelection: false
        });
      }
    }
  );


  /* =========================================================
     21. GLOBAL EXPORTS
     ========================================================= */

  window.loadAdminInvoices =
    loadAdminInvoices;

  window.renderAdminInvoices =
    renderAdminInvoices;

  window.openAdminInvoiceWorkspace =
    openAdminInvoiceWorkspace;

  window.closeAdminInvoiceWorkspace =
    closeAdminInvoiceWorkspace;

  window.printAdminInvoice =
    printAdminInvoice;

  window.calculateAdminInvoiceFinancials =
    calculateAdminInvoiceFinancials;

  window.getAdminInvoicePayments =
    getAdminInvoicePayments;

  window.getAdminInvoiceItems =
    getAdminInvoiceItems;

  window.getAdminInvoiceEvents =
    getAdminInvoiceEvents;