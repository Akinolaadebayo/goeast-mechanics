/* =========================================================
   ADMIN JOB SYNCHRONIZATION
   File: js/admin-job-synchronization.js

   Sprint: Mechanic Job Workspace and Synchronization

   Purpose:
   Centralizes mechanic-job data loading, status labels,
   financial summaries, job timeline access, and the database
   RPC used to save a mechanic job update.

   Important Business Rules:
   - A mechanic job owns diagnosis and repair execution.
   - A service request owns customer intake and administration.
   - The parent service-request status is calculated by Supabase
     from every linked job. The browser never uses "last job wins".
   - Final billing remains owned by invoices.
   ========================================================= */


/* =========================================================
   1. STATUS CONFIGURATION
   ========================================================= */

   const JOB_WORKFLOW_STATUSES = [
    ["new", "Created"],
    ["acknowledged", "Acknowledged"],
    ["diagnosing", "Diagnosing"],
    ["waiting_parts", "Waiting for Parts"],
    ["repairing", "Repairing"],
    ["testing", "Testing"],
    ["ready_for_pickup", "Ready for Pickup"],
    ["closed", "Closed"],
    ["cancelled", "Cancelled"]
  ];
  
  const JOB_WORKFLOW_CLOSED_STATUSES = [
    "closed",
    "cancelled"
  ];
  
  
  /* =========================================================
     2. STATUS HELPERS
     ========================================================= */
  
  /**
   * Converts legacy and current status values into one
   * consistent internal format.
   *
   * Older job cards used "created".
   * The new workflow uses "new" while displaying "Created".
   *
   * @param {string} status
   * @returns {string}
   */
  function normalizeJobWorkflowStatus(status) {
    const normalized = String(status || "new")
      .trim()
      .toLowerCase();
  
    return normalized === "created"
      ? "new"
      : normalized;
  }
  
  
  /**
   * Returns the staff-facing label for a job status.
   *
   * @param {string} status
   * @returns {string}
   */
  function formatJobWorkflowStatus(status) {
    const normalized = normalizeJobWorkflowStatus(status);
  
    const match = JOB_WORKFLOW_STATUSES.find(([value]) => {
      return value === normalized;
    });
  
    return match
      ? match[1]
      : normalized.replaceAll("_", " ");
  }
  
  
  /**
   * Builds the complete status dropdown options.
   *
   * @param {string} currentStatus
   * @returns {string}
   */
  function renderJobWorkflowStatusOptions(currentStatus) {
    const normalized = normalizeJobWorkflowStatus(
      currentStatus
    );
  
    return JOB_WORKFLOW_STATUSES
      .map(([value, label]) => {
        return `
          <option
            value="${value}"
            ${value === normalized ? "selected" : ""}
          >
            ${label}
          </option>
        `;
      })
      .join("");
  }
  
  
  /**
   * Determines whether a job is no longer active.
   *
   * @param {string} status
   * @returns {boolean}
   */
  function isClosedJobWorkflowStatus(status) {
    return JOB_WORKFLOW_CLOSED_STATUSES.includes(
      normalizeJobWorkflowStatus(status)
    );
  }
  
  
  /* =========================================================
     3. LOAD ONE MECHANIC JOB
     ========================================================= */
  
  /**
   * Loads one complete mechanic job record.
   *
   * The mechanic-board cache is used first when available.
   * Supabase is queried when the job is not already cached.
   *
   * @param {number|string} jobId
   * @returns {Promise<object|null>}
   */
  async function loadMechanicJobRecord(jobId) {
    /*
      Reuse the mechanic-board cache when possible.
    */
    if (
      typeof mechanicBoardJobs !== "undefined" &&
      Array.isArray(mechanicBoardJobs)
    ) {
      const cachedJob = mechanicBoardJobs.find((job) => {
        return String(job.id) === String(jobId);
      });
  
      if (cachedJob) {
        return cachedJob;
      }
    }
  
    const { data, error } = await supabaseClient
      .from("job_cards")
      .select(`
        id,
        service_request_id,
        complaint,
        diagnosis,
        repairs_performed,
        parts_used,
        labor_notes,
        mechanic_recommendation,
        internal_notes,
        assigned_mechanic_id,
        customer_visible,
        created_by,
        updated_by,
        created_at,
        updated_at,
        vehicle_id,
        assigned_mechanic,
        job_status,
        appointment_date,
        estimated_completion,
        repair_bay,
        parts_notes,
        customer_name,
        customer_email,
        customer_phone,
        vehicle,
        estimated_cost,
        final_cost,
        vehicles (
          year,
          make,
          model,
          trim,
          license_plate,
          vin,
          mileage,
          color,
          notes
        )
      `)
      .eq("id", Number(jobId))
      .maybeSingle();
  
    if (error) {
      console.error(
        "Mechanic job load failed:",
        error.message
      );
  
      return null;
    }
  
    return data || null;
  }
  
  
  /* =========================================================
     4. LOAD LINKED SERVICE REQUEST
     ========================================================= */
  
  /**
   * Loads the service request connected to a mechanic job.
   *
   * @param {number|string} requestId
   * @returns {Promise<object|null>}
   */
  async function loadLinkedServiceRequestRecord(requestId) {
    if (!requestId) {
      return null;
    }
  
    /*
      Reuse the current Service Request cache when possible.
    */
    if (
      typeof allRequests !== "undefined" &&
      Array.isArray(allRequests)
    ) {
      const cachedRequest = allRequests.find((request) => {
        return String(request.id) === String(requestId);
      });
  
      if (cachedRequest) {
        return cachedRequest;
      }
    }
  
    const { data, error } = await supabaseClient
      .from("service_requests")
      .select(`
        id,
        created_at,
        name,
        email,
        phone,
        vehicle,
        vehicle_id,
        message,
        status,
        priority,
        admin_notes,
        estimated_cost,
        final_cost,
        updated_at,
        updated_by,
        archived
      `)
      .eq("id", Number(requestId))
      .maybeSingle();
  
    if (error) {
      console.error(
        "Linked service request load failed:",
        error.message
      );
  
      return null;
    }
  
    return data || null;
  }
  
  
  /* =========================================================
     5. LOAD JOB-SPECIFIC TIMELINE
     ========================================================= */
  
  /**
   * Loads only timeline entries belonging to one mechanic job.
   *
   * This uses the new repair_updates.job_card_id field installed
   * by the Sprint 8 database migration.
   *
   * @param {number|string} jobId
   * @returns {Promise<Array>}
   */
  async function loadMechanicJobTimeline(jobId) {
    const { data, error } = await supabaseClient
      .from("repair_updates")
      .select(`
        id,
        service_request_id,
        job_card_id,
        update_type,
        title,
        message,
        visible_to_customer,
        created_by,
        created_at
      `)
      .eq("job_card_id", Number(jobId))
      .order("created_at", {
        ascending: false
      });
  
    if (error) {
      console.error(
        "Mechanic job timeline load failed:",
        error.message
      );
  
      return [];
    }
  
    return data || [];
  }
  
  
  /* =========================================================
     6. FINANCIAL SUMMARY
     ========================================================= */
  
  /**
   * Calculates the current operational subtotal for one job.
   *
   * Parts:
   * Uses stored line_total when available.
   * Falls back to quantity × selling price or legacy unit price.
   *
   * Labour:
   * Uses the structured labour_total field.
   *
   * This is not the final customer invoice total.
   *
   * @param {number|string} jobId
   * @returns {{
   *   partsTotal: number,
   *   labourTotal: number,
   *   operationalSubtotal: number
   * }}
   */
  function getMechanicJobFinancialSummary(jobId) {
    const jobKey = String(jobId);
  
    const parts =
      typeof mechanicPartsByJob !== "undefined" &&
      mechanicPartsByJob
        ? mechanicPartsByJob[jobKey] || []
        : [];
  
    const labour =
      typeof mechanicLabourByJob !== "undefined" &&
      mechanicLabourByJob
        ? mechanicLabourByJob[jobKey] || []
        : [];
  
    const partsTotal = parts.reduce((sum, part) => {
      const storedLineTotal = Number(
        part.line_total || 0
      );
  
      if (storedLineTotal > 0) {
        return sum + storedLineTotal;
      }
  
      const unitPrice = Number(
        part.selling_price ||
        part.unit_price ||
        0
      );
  
      return sum + (
        Number(part.quantity_used || 0) *
        unitPrice
      );
    }, 0);
  
    const labourTotal = labour.reduce((sum, entry) => {
      return sum + Number(
        entry.labour_total || 0
      );
    }, 0);
  
    return {
      partsTotal,
      labourTotal,
      operationalSubtotal:
        partsTotal + labourTotal
    };
  }
  
  
  /* =========================================================
     7. SAVE MECHANIC JOB UPDATE
     ========================================================= */
  
  /**
   * Saves a mechanic workspace update through the new
   * save_job_workspace_update database RPC.
   *
   * The RPC performs these operations atomically:
   * - Updates the mechanic job.
   * - Calculates the parent Service Request status.
   * - Creates a job-specific timeline record.
   * - Preserves customer-visible/internal-only rules.
   *
   * @param {object} payload
   * @returns {Promise<{
   *   success: boolean,
   *   data: object|null,
   *   error: object|null
   * }>}
   */
  async function saveMechanicJobWorkflowUpdate(
    payload = {}
  ) {
    const {
      jobId,
      status,
      diagnosis,
      repairsPerformed,
      laborNotes,
      message,
      internalOnly
    } = payload;
  
    const { data, error } = await supabaseClient.rpc(
      "save_job_workspace_update",
      {
        p_job_card_id: Number(jobId),
  
        p_status:
          normalizeJobWorkflowStatus(status),
  
        p_diagnosis:
          diagnosis || "",
  
        p_repairs_performed:
          repairsPerformed || "",
  
        p_labor_notes:
          laborNotes || "",
  
        p_message:
          message || null,
  
        p_internal_only:
          Boolean(internalOnly)
      }
    );
  
    if (error) {
      return {
        success: false,
        data: null,
        error
      };
    }
  
    return {
      success: true,
  
      data: Array.isArray(data)
        ? data[0] || null
        : data,
  
      error: null
    };
  }
  
  
  /* =========================================================
     8. RECORD A JOB TIMELINE EVENT
     ========================================================= */
  
  /**
   * Creates a job-specific timeline event without changing
   * diagnosis, repairs, or labour notes.
   *
   * This will be used by supporting modules such as:
   * - Parts
   * - Labour
   * - Future technician assignment tools
   * - Future inspection and testing tools
   *
   * @param {object} payload
   * @returns {Promise<{
   *   success: boolean,
   *   data: any,
   *   error: object|null
   * }>}
   */
  async function recordMechanicJobTimelineEvent(
    payload = {}
  ) {
    const {
      jobId,
      title,
      message,
      internalOnly = true,
      updateType = "job_event"
    } = payload;
  
    const { data, error } = await supabaseClient.rpc(
      "record_job_timeline_event",
      {
        p_job_card_id:
          Number(jobId),
  
        p_title:
          title || "job_event",
  
        p_message:
          message || "Mechanic job updated.",
  
        p_internal_only:
          Boolean(internalOnly),
  
        p_update_type:
          updateType || "job_event"
      }
    );
  
    return {
      success: !error,
      data,
      error: error || null
    };
  }
  
  
  /* =========================================================
     9. REFRESH ALL JOB-RELATED DATA
     ========================================================= */
  
  /**
   * Refreshes the mechanic board, Service Request list,
   * structured parts, and structured labour.
   *
   * Each module is checked before calling it so this helper
   * remains safe during staged script loading.
   */
  async function refreshMechanicJobWorkflowData() {
    const refreshTasks = [];
  
    if (
      typeof loadMechanicBoard === "function"
    ) {
      refreshTasks.push(
        loadMechanicBoard()
      );
    }
  
    if (
      typeof loadServiceRequests === "function"
    ) {
      refreshTasks.push(
        loadServiceRequests()
      );
    }
  
    if (
      typeof loadMechanicPartsEngine === "function"
    ) {
      refreshTasks.push(
        loadMechanicPartsEngine()
      );
    }
  
    if (
      typeof loadMechanicLabourEngine === "function"
    ) {
      refreshTasks.push(
        loadMechanicLabourEngine()
      );
    }
  
    /*
      Promise.allSettled allows one optional module to fail
      without preventing the remaining modules from refreshing.
    */
    const results = await Promise.allSettled(
      refreshTasks
    );
  
    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error(
          "A mechanic workflow refresh failed:",
          result.reason
        );
      }
    });
  
    return results;
  }
  
  
  /* =========================================================
     10. GLOBAL EXPORTS
     ========================================================= */
  
  window.JOB_WORKFLOW_STATUSES =
    JOB_WORKFLOW_STATUSES;
  
  window.normalizeJobWorkflowStatus =
    normalizeJobWorkflowStatus;
  
  window.formatJobWorkflowStatus =
    formatJobWorkflowStatus;
  
  window.renderJobWorkflowStatusOptions =
    renderJobWorkflowStatusOptions;
  
  window.isClosedJobWorkflowStatus =
    isClosedJobWorkflowStatus;
  
  window.loadMechanicJobRecord =
    loadMechanicJobRecord;
  
  window.loadLinkedServiceRequestRecord =
    loadLinkedServiceRequestRecord;
  
  window.loadMechanicJobTimeline =
    loadMechanicJobTimeline;
  
  window.getMechanicJobFinancialSummary =
    getMechanicJobFinancialSummary;
  
  window.saveMechanicJobWorkflowUpdate =
    saveMechanicJobWorkflowUpdate;
  
  window.recordMechanicJobTimelineEvent =
    recordMechanicJobTimelineEvent;
  
  window.refreshMechanicJobWorkflowData =
    refreshMechanicJobWorkflowData;