/* =========================================================
   ADMIN REPAIR UPDATES MODULE
   File: js/admin-updates.js

   Sprint:
   Mechanic Job Workspace and Synchronization

   Purpose:
   Handles Service Request progress notes and timeline history.

   Responsibilities:
   - Load request-level and job-level timeline records.
   - Group timeline records by Service Request.
   - Group job-specific records by mechanic job.
   - Render the complete parent-request timeline.
   - Save administrative request updates.
   - Preserve controlled multi-job status synchronization.
   - Keep invoice-controlled Final Cost read-only.

   Business Rules:
   - Service Request updates describe customer communication
     and administrative progress.
   - Mechanic Job updates describe diagnosis and repair work.
   - When linked jobs exist, the database calculates the
     Service Request status from every linked job.
   - Service Request Final Cost is controlled by invoices.
   ========================================================= */


/* =========================================================
   1. TIMELINE CACHES
   ========================================================= */

/*
  All timeline records grouped by Service Request.

  Example:

  {
    "6": [update1, update2]
  }
*/
let repairUpdatesByRequest = {};


/*
  Job-specific timeline records grouped by job_card_id.

  Example:

  {
    "3": [update1, update2]
  }
*/
let repairUpdatesByJob = {};


/* =========================================================
   2. LOAD REPAIR UPDATES
   ========================================================= */

/**
 * Loads every repair update connected to the Service Requests
 * currently available in allRequests.
 *
 * The Sprint 8 migration added repair_updates.job_card_id.
 * A NULL job_card_id means the entry belongs directly to the
 * parent Service Request.
 */
async function loadRepairUpdates() {
  repairUpdatesByRequest = {};
  repairUpdatesByJob = {};


  if (
    !Array.isArray(allRequests) ||
    allRequests.length === 0
  ) {
    return;
  }


  const requestIds = allRequests
    .map((request) => {
      return Number(request.id);
    })
    .filter(Number.isFinite);


  if (requestIds.length === 0) {
    return;
  }


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
    .in(
      "service_request_id",
      requestIds
    )
    .order(
      "created_at",
      {
        ascending: false
      }
    );


  if (error) {
    console.error(
      "Could not load repair updates:",
      error.message
    );


    notifyRepairUpdateModule(
      "danger",
      "Timeline Unavailable",
      "The Service Request timeline could not be loaded."
    );


    return;
  }


  (data || []).forEach((update) => {
    const requestKey =
      String(update.service_request_id);


    if (!repairUpdatesByRequest[requestKey]) {
      repairUpdatesByRequest[requestKey] = [];
    }


    repairUpdatesByRequest[requestKey].push(
      update
    );


    /*
      A non-null job_card_id identifies an event belonging
      to a specific mechanic job.
    */
    if (update.job_card_id !== null) {
      const jobKey =
        String(update.job_card_id);


      if (!repairUpdatesByJob[jobKey]) {
        repairUpdatesByJob[jobKey] = [];
      }


      repairUpdatesByJob[jobKey].push(
        update
      );
    }
  });
}


/* =========================================================
   3. TIMELINE GETTERS
   ========================================================= */

/**
 * Returns all timeline entries for one Service Request.
 *
 * This includes:
 * - Request-level administrative updates.
 * - Job-specific mechanic updates.
 *
 * @param {number|string} requestId
 * @returns {Array}
 */
function getRepairUpdatesForRequest(requestId) {
  return (
    repairUpdatesByRequest[
      String(requestId)
    ] || []
  );
}


/**
 * Returns timeline entries belonging to one mechanic job.
 *
 * @param {number|string} jobId
 * @returns {Array}
 */
function getRepairUpdatesForJob(jobId) {
  return (
    repairUpdatesByJob[
      String(jobId)
    ] || []
  );
}


/* =========================================================
   4. RENDER REQUEST TIMELINE
   ========================================================= */

/**
 * Renders the complete timeline for a Service Request.
 *
 * Job-specific records display their JOB reference so staff
 * can distinguish simultaneous repair scopes.
 *
 * Optional settings:
 *
 * {
 *   jobCardId: 3,
 *   includeRequestLevel: true
 * }
 *
 * @param {number|string} requestId
 * @param {object} options
 * @returns {string}
 */
function renderUpdateHistory(
  requestId,
  options = {}
) {
  const {
    jobCardId = null,
    includeRequestLevel = true
  } = options;


  let updates =
    getRepairUpdatesForRequest(
      requestId
    );


  /*
    Optional job filtering remains available for supporting
    interfaces. The dedicated Mechanic Job Workspace normally
    loads its timeline directly from Supabase.
  */
  if (
    jobCardId !== null &&
    jobCardId !== undefined
  ) {
    updates = updates.filter((update) => {
      const belongsToJob =
        String(update.job_card_id) ===
        String(jobCardId);


      const isRequestLevel =
        update.job_card_id === null;


      return (
        belongsToJob ||
        (
          includeRequestLevel &&
          isRequestLevel
        )
      );
    });
  }


  if (updates.length === 0) {
    if (
      typeof renderEmptyState ===
      "function"
    ) {
      return renderEmptyState(
        "No Timeline Entries Yet",
        "Administrative updates, mechanic progress, and approved customer communications will appear here."
      );
    }


    return `
      <div class="card-notes">
        <strong>
          Update History
        </strong>

        <p>
          No repair updates have been saved.
        </p>
      </div>
    `;
  }


  return `
    <div class="card-notes">

      <strong>
        Update History
      </strong>

      <div
        class="
          timeline-list
          repair-timeline-list
        "
      >

        ${updates
          .map((update) => {
            return renderRequestTimelineEntry(
              update
            );
          })
          .join("")}

      </div>

    </div>
  `;
}


/**
 * Renders one Service Request timeline entry.
 *
 * @param {object} update
 * @returns {string}
 */
function renderRequestTimelineEntry(update) {
  const visibility =
    update.visible_to_customer
      ? "Customer visible"
      : "Internal only";


  const title =
    String(
      update.title ||
      update.update_type ||
      "update"
    ).replaceAll("_", " ");


  return `
    <article
      class="
        timeline-item
        repair-timeline-item
      "
    >

      <div class="repair-timeline-marker">
      </div>


      <div class="repair-timeline-content">

        <div class="repair-timeline-heading">

          <strong>
            ${safeText(title)}
          </strong>

          <small>
            ${formatRepairUpdateDate(
              update.created_at
            )}
            •
            ${visibility}
          </small>

        </div>


        ${
          update.job_card_id !== null
            ? `
              <span class="repair-timeline-job-reference">
                JOB-${Number(update.job_card_id)}
              </span>
            `
            : `
              <span class="repair-timeline-job-reference">
                Service Request
              </span>
            `
        }


        <p>
          ${safeText(
            update.message,
            "No timeline message was recorded."
          )}
        </p>

      </div>

    </article>
  `;
}


/* =========================================================
   5. LINKED-JOB STATUS CONTROL
   ========================================================= */

/**
 * Returns true when a Service Request has at least one linked
 * mechanic job.
 *
 * @param {number|string} requestId
 * @returns {boolean}
 */
function requestHasLinkedJobs(requestId) {
  if (
    typeof getJobCardsForRequest ===
    "function"
  ) {
    return (
      getJobCardsForRequest(
        requestId
      ).length > 0
    );
  }


  /*
    Compatibility fallback during staged script loading.
  */
  if (
    typeof jobCardsByRequest !==
      "undefined" &&
    jobCardsByRequest
  ) {
    return Boolean(
      jobCardsByRequest[
        String(requestId)
      ]?.length
    );
  }


  return false;
}


/* =========================================================
   6. REQUEST STATUS OPTIONS
   ========================================================= */

/**
 * Renders the complete Service Request status list.
 *
 * When linked jobs exist, the select is disabled because
 * the database derives the request status from all jobs.
 *
 * @param {string} currentStatus
 * @returns {string}
 */
function renderRequestStatusOptions(currentStatus) {
  const status =
    String(
      currentStatus ||
      "new"
    )
      .trim()
      .toLowerCase();


  const statuses = [
    ["new", "New"],
    ["acknowledged", "Acknowledged"],
    ["diagnosing", "Diagnosing"],
    ["waiting_parts", "Waiting for Parts"],
    ["repairing", "Repairing"],
    ["testing", "Testing"],
    ["ready_for_pickup", "Ready for Pickup"],
    ["payment_confirmed", "Payment Confirmed"],
    ["delivered", "Delivered"],
    ["closed", "Closed"],
    ["cancelled", "Cancelled"]
  ];


  return statuses
    .map(([value, label]) => {
      return `
        <option
          value="${value}"
          ${status === value ? "selected" : ""}
        >
          ${label}
        </option>
      `;
    })
    .join("");
}


/* =========================================================
   7. RENDER REQUEST UPDATE FORM
   ========================================================= */

/**
 * Renders the administrative Service Request update form.
 *
 * Important financial behavior:
 * - Estimated Cost remains an administrative estimate.
 * - Final Cost is displayed read-only.
 * - Final Cost is synchronized from non-cancelled invoices.
 *
 * Important status behavior:
 * - Requests without jobs may be updated administratively.
 * - Requests with linked jobs use controlled job aggregation.
 *
 * @param {object} request
 * @param {string} status
 * @param {string} priority
 * @returns {string}
 */
function renderRepairUpdateForm(
  request,
  status,
  priority
) {
  const hasLinkedJobs =
    requestHasLinkedJobs(
      request.id
    );


  return `
    <div
      class="
        action-row
        repair-update-box
      "
    >

      <label>
        Status

        <select
          class="status-select"
          data-id="${Number(request.id)}"
          ${
            hasLinkedJobs
              ? `
                disabled
                data-controlled-by-jobs="true"
              `
              : ""
          }
        >
          ${renderRequestStatusOptions(
            status
          )}
        </select>

        ${
          hasLinkedJobs
            ? `
              <small>
                Status is calculated from every linked
                mechanic job.
              </small>
            `
            : `
              <small>
                This status remains administratively controlled
                until a mechanic job is created.
              </small>
            `
        }
      </label>


      ${
        hasFullAccess()
          ? `
            <label>
              Priority

              <select
                class="priority-select"
                data-id="${Number(request.id)}"
              >
                <option
                  value="low"
                  ${priority === "low" ? "selected" : ""}
                >
                  Low
                </option>

                <option
                  value="normal"
                  ${priority === "normal" ? "selected" : ""}
                >
                  Normal
                </option>

                <option
                  value="high"
                  ${priority === "high" ? "selected" : ""}
                >
                  High
                </option>

                <option
                  value="urgent"
                  ${priority === "urgent" ? "selected" : ""}
                >
                  Urgent
                </option>
              </select>
            </label>


            <label>
              Estimated Cost

              <input
                class="estimated-cost-input"
                data-id="${Number(request.id)}"
                type="number"
                min="0"
                step="0.01"
                value="${Number(
                  request.estimated_cost ||
                  0
                )}"
              >

              <small>
                Preliminary administrative estimate.
              </small>
            </label>


            <label>
              Final Cost — Invoice Controlled

              <input
                class="
                  final-cost-input
                  request-final-cost-readonly
                "
                data-id="${Number(request.id)}"
                type="number"
                min="0"
                step="0.01"
                value="${Number(
                  request.final_cost ||
                  0
                )}"
                readonly
                aria-readonly="true"
              >

              <small>
                Automatically synchronized from non-cancelled
                invoices.
              </small>
            </label>
          `
          : ""
      }


      <label class="wide-field">
        Service Request Update

        <textarea
          class="repair-update-input"
          data-id="${Number(request.id)}"
          placeholder="Example: Customer contacted. Vehicle is now being diagnosed."
        ></textarea>
      </label>


      <label class="checkbox-line service-request-visibility-control">

  <input
    type="checkbox"
    class="internal-only-checkbox"
    data-id="${Number(request.id)}"
    checked
  >

  <span>
    <strong>
      Internal note only
    </strong>

    <small>
      Clear this checkbox only when the update is approved
      for the customer portal.
    </small>
  </span>

</label>


      <button
        type="button"
        class="
          save-repair-update-btn
          primary-action-btn
        "
        data-id="${Number(request.id)}"
      >
        Save Update
      </button>

    </div>
  `;
}


/* =========================================================
   8. SAVE REQUEST UPDATE
   ========================================================= */

/**
 * Saves an administrative Service Request update.
 *
 * The database RPC performs the controlled status behavior:
 *
 * - No linked jobs:
 *   Uses the selected administrative status.
 *
 * - One or more linked jobs:
 *   Ignores manual repair-stage changes and calculates the
 *   request status from every linked job.
 *
 * Final Cost is never updated here.
 *
 * @param {number|string} requestId
 * @param {HTMLButtonElement|null} button
 */
async function saveRepairUpdate(
  requestId,
  button
) {
  const statusInput =
    document.querySelector(
      `.status-select[data-id="${requestId}"]`
    );


  const messageInput =
    document.querySelector(
      `.repair-update-input[data-id="${requestId}"]`
    );


  const internalOnlyInput =
    document.querySelector(
      `.internal-only-checkbox[data-id="${requestId}"]`
    );


  if (
    !statusInput ||
    !messageInput ||
    !internalOnlyInput
  ) {
    notifyRepairUpdateModule(
      "danger",
      "Update Form Missing",
      "The Service Request update form is incomplete."
    );


    return;
  }


  const statusValue =
    statusInput.value;


  const messageValue =
    messageInput.value.trim();


  const internalOnly =
    internalOnlyInput.checked;


  if (!messageValue) {
    notifyRepairUpdateModule(
      "warning",
      "Update Required",
      "Write a Service Request update before saving."
    );


    messageInput.focus();


    return;
  }


  const originalButtonText =
    button?.textContent ||
    "Save Update";


  setRepairUpdateButtonState(
    button,
    true,
    "Saving..."
  );


  try {
    /*
      Developer and Upper Admin may change the administrative
      priority and preliminary estimate.

      Final Cost is intentionally excluded.
    */
    if (hasFullAccess()) {
      const priorityValue =
        document.querySelector(
          `.priority-select[data-id="${requestId}"]`
        )?.value ||
        "normal";


      const estimatedCostValue =
        document.querySelector(
          `.estimated-cost-input[data-id="${requestId}"]`
        )?.value ||
        "0";


      const requestUpdatePayload = {
        priority:
          priorityValue,

        estimated_cost:
          Number(
            estimatedCostValue ||
            0
          ),

        updated_at:
          new Date().toISOString()
      };


      if (
        typeof currentProfile !==
          "undefined" &&
        currentProfile?.id
      ) {
        requestUpdatePayload.updated_by =
          currentProfile.id;
      }


      const {
        error: requestUpdateError
      } = await supabaseClient
        .from("service_requests")
        .update(
          requestUpdatePayload
        )
        .eq(
          "id",
          Number(requestId)
        );


      if (requestUpdateError) {
        throw requestUpdateError;
      }
    }


    /*
      The verified database function controls request status,
      timeline creation, and customer visibility.
    */
    const { error } =
      await supabaseClient.rpc(
        "save_repair_update",
        {
          p_service_request_id:
            Number(requestId),

          p_status:
            statusValue,

          p_message:
            messageValue,

          p_internal_only:
            Boolean(internalOnly)
        }
      );


    if (error) {
      throw error;
    }


    notifyRepairUpdateModule(
      "success",
      "Service Request Updated",

      internalOnly
        ? "The internal Service Request update was saved."
        : "The customer-visible Service Request update was saved."
    );


    /*
      Refresh requests first because the RPC may have changed
      the effective parent status.
    */
    if (
      typeof loadServiceRequests ===
      "function"
    ) {
      await loadServiceRequests();
    }


    /*
      Ensure the local timeline cache reflects the new entry.
    */
    await loadRepairUpdates();


    /*
      When the update was saved from an open request workspace,
      reopen that workspace on Timeline so the user immediately
      sees the new record.
    */
    const workspaceContainer =
      document.getElementById(
        "workspaceContainer"
      );


    const requestWorkspaceWasOpen =
      Boolean(
        workspaceContainer &&
        !workspaceContainer.classList.contains(
          "hidden"
        )
      );


    if (
      requestWorkspaceWasOpen &&
      typeof openServiceRequestWorkspace ===
        "function"
    ) {
      openServiceRequestWorkspace(
        requestId,
        "timeline"
      );
    }

  } catch (error) {
    console.error(
      "Service Request update failed:",
      error
    );


    notifyRepairUpdateModule(
      "danger",
      "Update Failed",
      error?.message ||
        "The Service Request update could not be saved."
    );

  } finally {
    setRepairUpdateButtonState(
      button,
      false,
      originalButtonText
    );
  }
}


/* =========================================================
   9. BUTTON BINDINGS
   ========================================================= */

/**
 * Connects every Service Request update button.
 *
 * The optional root argument allows binding inside a newly
 * rendered workspace without rebinding the complete page.
 *
 * @param {HTMLElement|Document} root
 */
function bindRepairUpdateButtons(
  root = document
) {
  root
    .querySelectorAll(
      ".save-repair-update-btn"
    )
    .forEach((button) => {
      if (
        button.dataset.bound ===
        "true"
      ) {
        return;
      }


      button.dataset.bound =
        "true";


      button.addEventListener(
        "click",
        async function () {
          await saveRepairUpdate(
            button.getAttribute(
              "data-id"
            ),
            button
          );
        }
      );
    });
}


/* =========================================================
   10. DISPLAY HELPERS
   ========================================================= */

function formatRepairUpdateDate(value) {
  if (!value) {
    return "-";
  }


  if (
    typeof formatDate ===
    "function"
  ) {
    return formatDate(value);
  }


  return new Date(value)
    .toLocaleString();
}


/* =========================================================
   11. BUTTON AND NOTIFICATION HELPERS
   ========================================================= */

function setRepairUpdateButtonState(
  button,
  disabled,
  text
) {
  if (!button) {
    return;
  }


  button.disabled =
    disabled;


  button.textContent =
    text;
}


function notifyRepairUpdateModule(
  type,
  title,
  message
) {
  if (
    typeof showToast ===
    "function"
  ) {
    showToast(
      type,
      title,
      message
    );


    return;
  }


  alert(
    message ||
    title
  );
}


/* =========================================================
   12. GLOBAL EXPORTS
   ========================================================= */

window.loadRepairUpdates =
  loadRepairUpdates;


window.getRepairUpdatesForRequest =
  getRepairUpdatesForRequest;


window.getRepairUpdatesForJob =
  getRepairUpdatesForJob;


window.renderUpdateHistory =
  renderUpdateHistory;


window.renderRepairUpdateForm =
  renderRepairUpdateForm;


window.saveRepairUpdate =
  saveRepairUpdate;


window.bindRepairUpdateButtons =
  bindRepairUpdateButtons;