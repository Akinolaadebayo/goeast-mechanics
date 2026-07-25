/* =========================================================
   ADMIN JOB CARDS MODULE
   File: js/admin-job-cards.js

   Sprint:
   Mechanic Job Workspace and Synchronization

   Purpose:
   Handles:
   - Loading job cards linked to Service Requests.
   - Rendering linked-job summary cards.
   - Creating first and additional mechanic jobs.
   - Opening the dedicated Mechanic Job Workspace.

   Business Separation:
   - Service Request = customer intake and administration.
   - Job Card = workshop diagnosis and repair execution.
   - Invoice = authoritative customer billing.
   - Payments = authoritative payment ledger.

   Multiple-Job Rule:
   One Service Request may contain several mechanic jobs.
   The database calculates the parent request status from every
   linked job. This module never applies "last job wins".
   ========================================================= */


/* =========================================================
   1. JOB-CARD CACHE
   ========================================================= */

/*
  Job cards are grouped by service_request_id.

  Structure:

  {
    6: [job1, job2],
    8: [job3]
  }
*/
let jobCardsByRequest = {};


/* =========================================================
   2. LOAD JOB CARDS FOR CURRENT REQUESTS
   ========================================================= */

/**
 * Loads all job cards connected to the Service Requests
 * currently available in allRequests.
 *
 * A Service Request may contain more than one job card.
 */
async function loadJobCardsForRequests() {
  jobCardsByRequest = {};


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
    .from("job_cards")
    .select(`
      id,
      service_request_id,
      vehicle_id,
      complaint,
      job_status,
      assigned_mechanic,
      assigned_mechanic_id,
      repair_bay,
      appointment_date,
      estimated_completion,
      estimated_cost,
      final_cost,
      created_at,
      updated_at
    `)
    .in(
      "service_request_id",
      requestIds
    )
    .order(
      "id",
      {
        ascending: false
      }
    );


  if (error) {
    console.error(
      "Could not load job cards:",
      error.message
    );

    notifyJobCardModule(
      "danger",
      "Linked Jobs Unavailable",
      "The linked mechanic jobs could not be loaded."
    );

    return;
  }


  (data || []).forEach((job) => {
    const requestKey =
      String(job.service_request_id);


    if (!jobCardsByRequest[requestKey]) {
      jobCardsByRequest[requestKey] = [];
    }


    jobCardsByRequest[requestKey].push(
      job
    );
  });
}


/* =========================================================
   3. GET JOBS FOR ONE REQUEST
   ========================================================= */

/**
 * Returns every job linked to one Service Request.
 *
 * @param {number|string} requestId
 * @returns {Array}
 */
function getJobCardsForRequest(requestId) {
  return (
    jobCardsByRequest[
      String(requestId)
    ] || []
  );
}


/* =========================================================
   4. RENDER LINKED JOBS WORKSPACE
   ========================================================= */

/**
 * Compatibility entry point used by the Service Request
 * workspace.
 *
 * Previously, this function rendered only a confirmation
 * message or a job-creation box.
 *
 * It now renders:
 * - Linked-job summary cards.
 * - Open Job Workspace actions.
 * - First-job creation form.
 * - Controlled additional-job creation form.
 *
 * @param {object} request
 * @returns {string}
 */
function renderCreateJobCardBox(request) {
  const existingJobs =
    getJobCardsForRequest(
      request.id
    );


  return `
    <div class="linked-job-workspace-block">

      <div class="linked-job-heading-row">

        <div>
          <span class="linked-job-card-label">
            Workshop Jobs
          </span>

          <h4>
            Linked Mechanic Jobs
          </h4>

          <p>
            Each job represents one separate repair scope.
            The parent Service Request remains open until every
            active linked job reaches an appropriate completion
            status.
          </p>
        </div>

        ${
          existingJobs.length > 0
            ? `
              <span class="status-badge status-acknowledged">
                ${existingJobs.length}
                Linked
                ${
                  existingJobs.length === 1
                    ? "Job"
                    : "Jobs"
                }
              </span>
            `
            : ""
        }

      </div>


      ${
        existingJobs.length > 0
          ? renderLinkedJobCards(
              request,
              existingJobs
            )
          : renderNoLinkedJobsState()
      }


      ${
        existingJobs.length > 0
          ? renderAdditionalJobSection(
              request
            )
          : renderJobCardCreateSection(
              request,
              "first"
            )
      }

    </div>
  `;
}


/* =========================================================
   5. RENDER NO-JOB STATE
   ========================================================= */

/**
 * Displays an informational state before the first mechanic
 * job is created.
 *
 * @returns {string}
 */
function renderNoLinkedJobsState() {
  if (
    typeof renderEmptyState ===
    "function"
  ) {
    return renderEmptyState(
      "No Mechanic Jobs Yet",
      "Create the first mechanic job when this Service Request is ready for workshop operations."
    );
  }


  return `
    <div class="empty-message">
      <strong>
        No Mechanic Jobs Yet
      </strong>

      <p>
        Create the first mechanic job when this request is
        ready for workshop operations.
      </p>
    </div>
  `;
}


/* =========================================================
   6. RENDER LINKED JOB CARDS
   ========================================================= */

/**
 * Renders all job cards connected to a Service Request.
 *
 * @param {object} request
 * @param {Array} jobs
 * @returns {string}
 */
function renderLinkedJobCards(
  request,
  jobs
) {
  return `
    <div class="linked-job-cards">

      ${jobs
        .map((job) => {
          return renderLinkedJobSummaryCard(
            request,
            job
          );
        })
        .join("")}

    </div>
  `;
}


/**
 * Renders one linked-job command card.
 *
 * @param {object} request
 * @param {object} job
 * @returns {string}
 */
function renderLinkedJobSummaryCard(
  request,
  job
) {
  const normalizedStatus =
    typeof normalizeJobWorkflowStatus ===
      "function"
      ? normalizeJobWorkflowStatus(
          job.job_status
        )
      : normalizeJobCardStatusFallback(
          job.job_status
        );


  const statusLabel =
    typeof formatJobWorkflowStatus ===
      "function"
      ? formatJobWorkflowStatus(
          normalizedStatus
        )
      : formatJobCardStatusFallback(
          normalizedStatus
        );


  const jobScope =
    job.complaint ||
    request.message ||
    "No repair scope was recorded.";


  return `
    <article
      class="linked-job-card"
      data-linked-job-id="${Number(job.id)}"
    >

      <div class="linked-job-card-header">

        <div>
          <span class="linked-job-card-label">
            Mechanic Job
          </span>

          <h4>
            JOB-${Number(job.id)}
          </h4>

          <p>
            ${safeText(jobScope)}
          </p>
        </div>

        <span
          class="
            status-badge
            status-${safeText(normalizedStatus)}
          "
        >
          ${safeText(statusLabel)}
        </span>

      </div>


      <div class="linked-job-card-grid">

        <div>
          <span>
            Assigned Mechanic
          </span>

          <strong>
            ${safeText(
              job.assigned_mechanic,
              "Unassigned"
            )}
          </strong>
        </div>


        <div>
          <span>
            Repair Bay
          </span>

          <strong>
            ${safeText(
              job.repair_bay,
              "-"
            )}
          </strong>
        </div>


        <div>
          <span>
            Appointment
          </span>

          <strong>
            ${formatLinkedJobDate(
              job.appointment_date
            )}
          </strong>
        </div>


        <div>
          <span>
            Estimated Completion
          </span>

          <strong>
            ${formatLinkedJobDate(
              job.estimated_completion
            )}
          </strong>
        </div>


        <div>
          <span>
            Created
          </span>

          <strong>
            ${formatLinkedJobDate(
              job.created_at
            )}
          </strong>
        </div>


        <div>
          <span>
            Vehicle ID
          </span>

          <strong>
            ${safeText(
              job.vehicle_id,
              "-"
            )}
          </strong>
        </div>


        <div>
          <span>
            Service Request
          </span>

          <strong>
            #${Number(request.id)}
          </strong>
        </div>


        <div>
          <span>
            Billing
          </span>

          <strong>
            Invoice Controlled
          </strong>
        </div>

      </div>


      <div class="linked-job-card-actions">

        <button
          type="button"
          class="
            table-action-btn
            open-linked-job-workspace-btn
          "
          data-job-id="${Number(job.id)}"
          data-request-id="${Number(request.id)}"
        >
          Open Job Workspace
        </button>

      </div>

    </article>
  `;
}


/* =========================================================
   7. RENDER FIRST / ADDITIONAL JOB SECTIONS
   ========================================================= */

/**
 * Renders the first-job creation panel.
 *
 * @param {object} request
 * @param {string} mode
 * @returns {string}
 */
function renderJobCardCreateSection(
  request,
  mode
) {
  const isAdditional =
    mode === "additional";


  return `
    <section
      class="
        linked-job-create-box
        ${
          isAdditional
            ? "additional-job-warning"
            : ""
        }
      "
    >

      <span class="linked-job-card-label">
        ${
          isAdditional
            ? "Separate Repair Scope"
            : "Workshop Conversion"
        }
      </span>

      <h4>
        ${
          isAdditional
            ? "Create Additional Mechanic Job"
            : "Create Mechanic Job"
        }
      </h4>

      <p>
        ${
          isAdditional
            ? `
              Create another job only when the same Service Request
              contains a genuinely separate repair issue that needs
              its own diagnosis, parts, labour, status, and timeline.
            `
            : `
              Convert this customer Service Request into an active
              workshop job. The request remains the intake record,
              while this job becomes the operational repair record.
            `
        }
      </p>

      ${renderJobCardFormFields(
        request,
        mode
      )}

    </section>
  `;
}


/**
 * Renders the hidden additional-job section.
 *
 * @param {object} request
 * @returns {string}
 */
function renderAdditionalJobSection(
  request
) {
  return `
    <div class="linked-job-create-actions">

      <button
        type="button"
        class="
          secondary-action-btn
          show-additional-job-btn
        "
        data-id="${Number(request.id)}"
        aria-expanded="false"
        aria-controls="
          additionalJobForm-${Number(request.id)}
        "
      >
        Create Additional Job
      </button>

    </div>


    <div
      class="additional-job-form hidden"
      id="additionalJobForm-${Number(request.id)}"
    >
      ${renderJobCardCreateSection(
        request,
        "additional"
      )}
    </div>
  `;
}


/* =========================================================
   8. RENDER JOB-CREATION FIELDS
   ========================================================= */

/**
 * Shared creation fields for:
 * - The first mechanic job.
 * - A separate additional mechanic job.
 *
 * Costs are intentionally excluded.
 *
 * New jobs begin with zero operational totals. Parts and
 * structured labour create the job subtotal, while invoices
 * own the final customer amount.
 *
 * @param {object} request
 * @param {string} mode
 * @returns {string}
 */
function renderJobCardFormFields(
  request,
  mode
) {
  const isAdditional =
    mode === "additional";


  const defaultScope =
    isAdditional
      ? ""
      : request.message || "";


  const buttonText =
    isAdditional
      ? "Create Additional Job"
      : "Create Job Card";


  return `
    <div class="create-job-grid">

      <label>
        Assigned Mechanic

        <input
          class="job-mechanic-input"
          data-id="${Number(request.id)}"
          data-mode="${safeText(mode)}"
          type="text"
          placeholder="Example: John, Tunde, Shop Team"
        >
      </label>


      <label>
        Repair Bay

        <input
          class="job-bay-input"
          data-id="${Number(request.id)}"
          data-mode="${safeText(mode)}"
          type="text"
          placeholder="Example: Bay 1"
        >
      </label>


      <label>
        Appointment Date

        <input
          class="job-appointment-input"
          data-id="${Number(request.id)}"
          data-mode="${safeText(mode)}"
          type="datetime-local"
        >
      </label>


      <label>
        Estimated Completion

        <input
          class="job-completion-input"
          data-id="${Number(request.id)}"
          data-mode="${safeText(mode)}"
          type="datetime-local"
        >
      </label>


      <label class="full-span">
        ${
          isAdditional
            ? "Separate Repair Scope"
            : "Job Scope / Customer Complaint"
        }

        <textarea
          class="job-scope-input"
          data-id="${Number(request.id)}"
          data-mode="${safeText(mode)}"
          placeholder="${
            isAdditional
              ? "Describe the separate repair issue that requires another job."
              : "Describe the complaint or workshop scope."
          }"
        >${safeText(defaultScope)}</textarea>
      </label>

    </div>


    ${
      isAdditional
        ? `
          <div class="mechanic-update-guidance">
            <strong>
              Multiple-job control
            </strong>

            <p>
              Do not create another job merely for another part,
              mechanic update, or repair stage. Use an additional
              job only for a separate repair scope.
            </p>
          </div>
        `
        : ""
    }


    <div class="linked-job-create-actions">

      <button
        type="button"
        class="
          primary-action-btn
          create-job-card-btn
        "
        data-id="${Number(request.id)}"
        data-mode="${safeText(mode)}"
      >
        ${buttonText}
      </button>

    </div>
  `;
}


/* =========================================================
   9. READ JOB-CREATION FORM
   ========================================================= */

/**
 * Reads one job-creation form.
 *
 * @param {number|string} requestId
 * @param {string} mode
 * @returns {object}
 */
function getJobCardCreationValues(
  requestId,
  mode
) {
  const selectorSuffix =
    `[data-id="${requestId}"]` +
    `[data-mode="${mode}"]`;


  return {
    assignedMechanic:
      document.querySelector(
        `.job-mechanic-input${selectorSuffix}`
      )?.value.trim() || "",


    repairBay:
      document.querySelector(
        `.job-bay-input${selectorSuffix}`
      )?.value.trim() || "",


    appointmentDate:
      document.querySelector(
        `.job-appointment-input${selectorSuffix}`
      )?.value || null,


    estimatedCompletion:
      document.querySelector(
        `.job-completion-input${selectorSuffix}`
      )?.value || null,


    scope:
      document.querySelector(
        `.job-scope-input${selectorSuffix}`
      )?.value.trim() || ""
  };
}


/* =========================================================
   10. CREATE JOB CARD
   ========================================================= */

/**
 * Creates a first or additional mechanic job.
 *
 * Important:
 * - The job begins with status "new".
 * - Request-level estimated/final costs are not copied.
 * - The database synchronization function calculates the
 *   parent request status.
 * - Job creation is recorded in the job-specific timeline.
 *
 * @param {number|string} requestId
 * @param {string} mode
 * @param {HTMLButtonElement} button
 */
async function createJobCardFromRequest(
  requestId,
  mode,
  button
) {
  const request =
    allRequests.find((item) => {
      return (
        String(item.id) ===
        String(requestId)
      );
    });


  if (!request) {
    notifyJobCardModule(
      "danger",
      "Request Not Found",
      "The Service Request could not be found."
    );

    return;
  }


  const existingJobs =
    getJobCardsForRequest(
      request.id
    );


  if (
    existingJobs.length > 0 &&
    mode !== "additional"
  ) {
    notifyJobCardModule(
      "warning",
      "Job Already Exists",
      "Use Create Additional Job only when this request contains a separate repair scope."
    );

    return;
  }


  const formValues =
    getJobCardCreationValues(
      requestId,
      mode
    );


  const jobScope =
    formValues.scope ||
    (
      mode === "first"
        ? request.message || ""
        : ""
    );


  if (!jobScope) {
    notifyJobCardModule(
      "warning",
      "Repair Scope Required",
      mode === "additional"
        ? "Describe the separate repair issue before creating another job."
        : "Enter the workshop complaint or job scope before creating the job."
    );

    return;
  }


  const confirmationMessage =
    mode === "additional"
      ? `
        Create a separate mechanic job for this additional
        repair scope?
      `
      : `
        Create the first mechanic job for this
        Service Request?
      `;


  if (!confirm(
    confirmationMessage.trim()
  )) {
    return;
  }


  const originalButtonText =
    button?.textContent ||
    (
      mode === "additional"
        ? "Create Additional Job"
        : "Create Job Card"
    );


  setJobCardButtonState(
    button,
    true,
    "Creating Job..."
  );


  const jobPayload = {
    service_request_id:
      Number(request.id),

    vehicle_id:
      request.vehicle_id ||
      null,

    customer_name:
      request.name ||
      null,

    customer_email:
      request.email ||
      null,

    customer_phone:
      request.phone ||
      null,

    vehicle:
      request.vehicle ||
      null,

    complaint:
      jobScope,

    job_status:
      "new",

    assigned_mechanic:
      formValues.assignedMechanic ||
      null,

    repair_bay:
      formValues.repairBay ||
      null,

    appointment_date:
      formValues.appointmentDate,

    estimated_completion:
      formValues.estimatedCompletion,

    /*
      Do not duplicate parent request costs into each job.

      Parts and structured labour will create the job's
      operational subtotal. Invoice totals remain authoritative.
    */
    estimated_cost: 0,
    final_cost: 0,

    diagnosis: "",
    repairs_performed: "",
    labor_notes: "",
    parts_notes: ""
  };


  /*
    Record the authenticated staff profile when available.

    These assignments remain optional so the insert stays
    compatible with nullable audit fields.
  */
  if (
    typeof currentProfile !==
      "undefined" &&
    currentProfile?.id
  ) {
    jobPayload.created_by =
      currentProfile.id;

    jobPayload.updated_by =
      currentProfile.id;
  }


  try {
    const {
      data: createdJob,
      error: jobError
    } = await supabaseClient
      .from("job_cards")
      .insert([
        jobPayload
      ])
      .select(`
        id,
        service_request_id,
        job_status,
        assigned_mechanic,
        repair_bay,
        appointment_date,
        estimated_completion,
        created_at
      `)
      .single();


    if (jobError) {
      throw jobError;
    }


    let timelineWarning =
      null;


    /*
      record_job_timeline_event also synchronizes the parent
      Service Request status from every linked job.
    */
    if (
      typeof recordMechanicJobTimelineEvent ===
      "function"
    ) {
      const timelineResult =
        await recordMechanicJobTimelineEvent({
          jobId:
            createdJob.id,

          title:
            "job_created",

          message:
            mode === "additional"
              ? `
                JOB-${createdJob.id} created for a separate
                repair scope: ${jobScope}
              `.trim()
              : `
                JOB-${createdJob.id} created from
                Service Request #${request.id}.
              `.trim(),

          internalOnly:
            true,

          updateType:
            "job_created"
        });


      if (!timelineResult.success) {
        timelineWarning =
          timelineResult.error?.message ||
          "The creation timeline entry could not be recorded.";
      }

    } else {
      /*
        Compatibility fallback during staged frontend
        installation.
      */
      const {
        error: syncError
      } = await supabaseClient.rpc(
        "sync_service_request_status_from_jobs",
        {
          p_service_request_id:
            Number(request.id)
        }
      );


      if (syncError) {
        timelineWarning =
          syncError.message;
      }
    }


    /*
      Refresh every affected source module.
    */
    if (
      typeof loadServiceRequests ===
      "function"
    ) {
      await loadServiceRequests();
    }


    /*
      Ensure the local linked-job cache reflects the newly
      created job even when another loader does not call it.
    */
    if (
      typeof loadJobCardsForRequests ===
      "function"
    ) {
      await loadJobCardsForRequests();
    }


    if (
      typeof loadMechanicBoard ===
      "function"
    ) {
      await loadMechanicBoard();
    }


    notifyJobCardModule(
      timelineWarning
        ? "warning"
        : "success",

      timelineWarning
        ? "Job Created With Warning"
        : "Mechanic Job Created",

      timelineWarning
        ? `
          JOB-${createdJob.id} was created, but the timeline
          or status synchronization reported:
          ${timelineWarning}
        `
        : `
          JOB-${createdJob.id} was created successfully.
        `
    );


    /*
      Return to the Service Request Linked Jobs tab so the
      user immediately sees the new summary card.
    */
    if (
      typeof openServiceRequestWorkspace ===
      "function"
    ) {
      openServiceRequestWorkspace(
        request.id,
        "linkedjobs"
      );
    }

  } catch (error) {
    console.error(
      "Job-card creation failed:",
      error
    );


    notifyJobCardModule(
      "danger",
      "Job Creation Failed",
      error?.message ||
        "The mechanic job could not be created."
    );

  } finally {
    setJobCardButtonState(
      button,
      false,
      originalButtonText
    );
  }
}


/* =========================================================
   11. BUTTON BINDINGS
   ========================================================= */

/**
 * Connects:
 * - Create first job.
 * - Show/hide additional-job form.
 * - Create additional job.
 * - Open dedicated Mechanic Job Workspace.
 *
 * @param {HTMLElement|Document} root
 */
function bindCreateJobButtons(
  root = document
) {
  root
    .querySelectorAll(
      ".show-additional-job-btn"
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
        function () {
          const requestId =
            button.getAttribute(
              "data-id"
            );


          const form =
            document.getElementById(
              `additionalJobForm-${requestId}`
            );


          if (!form) {
            return;
          }


          const willOpen =
            form.classList.contains(
              "hidden"
            );


          form.classList.toggle(
            "hidden",
            !willOpen
          );


          button.setAttribute(
            "aria-expanded",
            String(willOpen)
          );


          button.textContent =
            willOpen
              ? "Cancel Additional Job"
              : "Create Additional Job";


          if (willOpen) {
            form.scrollIntoView({
              behavior: "smooth",
              block: "nearest"
            });
          }
        }
      );
    });


  root
    .querySelectorAll(
      ".create-job-card-btn"
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
          const requestId =
            button.getAttribute(
              "data-id"
            );


          const mode =
            button.getAttribute(
              "data-mode"
            ) ||
            "first";


          await createJobCardFromRequest(
            requestId,
            mode,
            button
          );
        }
      );
    });


  root
    .querySelectorAll(
      ".open-linked-job-workspace-btn"
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
          const jobId =
            button.getAttribute(
              "data-job-id"
            );


          const requestId =
            button.getAttribute(
              "data-request-id"
            );


          if (
            typeof openMechanicJobFromRequest !==
            "function"
          ) {
            notifyJobCardModule(
              "danger",
              "Workspace Unavailable",
              "The Mechanic Job Workspace controller is not loaded."
            );

            return;
          }


          await openMechanicJobFromRequest(
            jobId,
            requestId
          );
        }
      );
    });
}


/* =========================================================
   12. DISPLAY HELPERS
   ========================================================= */

/**
 * Formats linked-job dates using the existing global date
 * formatter.
 *
 * @param {string|null} value
 * @returns {string}
 */
function formatLinkedJobDate(value) {
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


/**
 * Compatibility normalizer used before the synchronization
 * module is loaded.
 *
 * @param {string} status
 * @returns {string}
 */
function normalizeJobCardStatusFallback(
  status
) {
  const normalized =
    String(status || "new")
      .trim()
      .toLowerCase();


  return normalized === "created"
    ? "new"
    : normalized;
}


/**
 * Compatibility formatter used before the synchronization
 * module is loaded.
 *
 * @param {string} status
 * @returns {string}
 */
function formatJobCardStatusFallback(
  status
) {
  const normalized =
    normalizeJobCardStatusFallback(
      status
    );


  const labels = {
    new: "Created",
    acknowledged: "Acknowledged",
    diagnosing: "Diagnosing",
    waiting_parts: "Waiting for Parts",
    repairing: "Repairing",
    testing: "Testing",
    ready_for_pickup: "Ready for Pickup",
    closed: "Closed",
    cancelled: "Cancelled"
  };


  return (
    labels[normalized] ||
    normalized.replaceAll("_", " ")
  );
}


/* =========================================================
   13. BUTTON AND NOTIFICATION HELPERS
   ========================================================= */

function setJobCardButtonState(
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


function notifyJobCardModule(
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
   14. GLOBAL EXPORTS
   ========================================================= */

window.loadJobCardsForRequests =
  loadJobCardsForRequests;


window.getJobCardsForRequest =
  getJobCardsForRequest;


window.renderCreateJobCardBox =
  renderCreateJobCardBox;


window.renderJobCardFormFields =
  renderJobCardFormFields;


window.createJobCardFromRequest =
  createJobCardFromRequest;


window.bindCreateJobButtons =
  bindCreateJobButtons;