/* =========================================================
   ADMIN MECHANIC JOB BOARD MODULE
   File: js/admin-mechanic-board.js

   Sprint:
   Mechanic Job Workspace and Synchronization

   Purpose:
   Provides the searchable Mechanic Jobs command board and
   routes each job into the dedicated Mechanic Job Workspace.

   Architecture:
   - The board is a summary and navigation surface.
   - The job workspace owns diagnosis, repairs, parts, labour,
     timeline, and update operations.
   - Inline editing is retired so the application has one
     authoritative mechanic-job save workflow.

   Privacy Rule:
   Customer name, email, and phone are not loaded or rendered
   by this board.
   ========================================================= */


/* =========================================================
   1. MODULE CONFIGURATION
   ========================================================= */

   const MECHANIC_BOARD_CONFIG = {
    allowedRoles: ["developer", "upper_admin", "mechanic"],
  
    defaultFilter: "active",
  
    defaultSearch: "",
  
    closedStatuses: [
      "closed",
      "cancelled"
    ],
  
    statuses: [
      ["new", "Created"],
      ["acknowledged", "Acknowledged"],
      ["diagnosing", "Diagnosing"],
      ["waiting_parts", "Waiting for Parts"],
      ["repairing", "Repairing"],
      ["testing", "Testing"],
      ["ready_for_pickup", "Ready for Pickup"],
      ["closed", "Closed"],
      ["cancelled", "Cancelled"]
    ]
  };
  
  
  /* =========================================================
     2. MODULE STATE
     ========================================================= */
  
  let mechanicBoardJobs = [];
  
  let mechanicBoardFilter =
    MECHANIC_BOARD_CONFIG.defaultFilter;
  
  let mechanicBoardSearch =
    MECHANIC_BOARD_CONFIG.defaultSearch;
  
  
  /* =========================================================
     3. DOM AND PERMISSION HELPERS
     ========================================================= */
  
  function getMechanicJobsContainer() {
    return document.getElementById(
      "mechanicJobsList"
    );
  }
  
  
  /**
   * The normal board is reserved for workshop and senior admin
   * roles.
   *
   * Reception may still open linked jobs in read-only mode from
   * the Service Request workspace.
   *
   * @returns {boolean}
   */
  function canAccessMechanicBoard() {
    return Boolean(
      typeof currentProfile !== "undefined" &&
      currentProfile &&
      MECHANIC_BOARD_CONFIG.allowedRoles.includes(
        currentProfile.role
      )
    );
  }
  
  
  /* =========================================================
     4. LOAD MECHANIC JOBS
     ========================================================= */
  
  /**
   * Loads repair-relevant fields only.
   *
   * Customer identity fields are intentionally excluded.
   */
  async function loadMechanicBoard() {
    const container =
      getMechanicJobsContainer();
  
    if (!container) {
      return;
    }
  
  
    container.innerHTML =
      typeof renderLoadingState === "function"
        ? renderLoadingState(
            "Loading mechanic jobs..."
          )
        : `
          <p class="empty-message">
            Loading mechanic jobs...
          </p>
        `;
  
  
    if (!canAccessMechanicBoard()) {
      mechanicBoardJobs = [];
  
      container.innerHTML =
        typeof renderEmptyState === "function"
          ? renderEmptyState(
              "Access Restricted",
              "Mechanic Jobs are reserved for mechanics and authorized staff."
            )
          : `
            <p class="empty-message">
              Mechanic Jobs are reserved for mechanics and
              authorized staff.
            </p>
          `;
  
      return;
    }
  
  
    const { data, error } = await supabaseClient
      .from("job_cards")
      .select(`
        id,
        service_request_id,
        vehicle_id,
        vehicle,
        job_status,
        assigned_mechanic,
        repair_bay,
        appointment_date,
        estimated_completion,
        complaint,
        diagnosis,
        repairs_performed,
        parts_used,
        labor_notes,
        parts_notes,
        vehicles (
          year,
          make,
          model,
          trim,
          license_plate,
          vin,
          mileage,
          notes
        )
      `)
      .order(
        "id",
        {
          ascending: false
        }
      );
  
  
    if (error) {
      console.error(
        "Could not load mechanic jobs:",
        error.message
      );
  
  
      container.innerHTML =
        typeof renderEmptyState === "function"
          ? renderEmptyState(
              "Could Not Load Mechanic Jobs",
              error.message
            )
          : `
            <p class="empty-message">
              Could not load mechanic jobs:
              ${safeText(error.message)}
            </p>
          `;
  
  
      notifyMechanicBoard(
        "danger",
        "Load Failed",
        "The mechanic job board could not be loaded."
      );
  
      return;
    }
  
  
    mechanicBoardJobs = (data || []).map(
      (job) => {
        return {
          ...job,
  
          job_status:
            normalizeMechanicBoardStatus(
              job.job_status
            )
        };
      }
    );
  
  
    /*
      Load structured parts and labour so operational totals are
      available before a job workspace opens.
    */
    const supportingLoads = [];
  
  
    if (
      typeof loadMechanicPartsEngine ===
      "function"
    ) {
      supportingLoads.push(
        loadMechanicPartsEngine()
      );
    }
  
  
    if (
      typeof loadMechanicLabourEngine ===
      "function"
    ) {
      supportingLoads.push(
        loadMechanicLabourEngine()
      );
    }
  
  
    const supportingResults =
      await Promise.allSettled(
        supportingLoads
      );
  
  
    supportingResults.forEach(
      (result) => {
        if (
          result.status ===
          "rejected"
        ) {
          console.error(
            "A mechanic board supporting module failed to load:",
            result.reason
          );
        }
      }
    );
  
  
    renderMechanicBoard();
  }
  
  
  /* =========================================================
     5. STATUS, FILTER, AND SEARCH HELPERS
     ========================================================= */
  
  function normalizeMechanicBoardStatus(
    status
  ) {
    if (
      typeof normalizeJobWorkflowStatus ===
      "function"
    ) {
      return normalizeJobWorkflowStatus(
        status
      );
    }
  
  
    const normalized =
      String(
        status ||
        "new"
      )
        .trim()
        .toLowerCase();
  
  
    return normalized === "created"
      ? "new"
      : normalized;
  }
  
  
  function formatMechanicBoardStatus(
    status
  ) {
    if (
      typeof formatJobWorkflowStatus ===
      "function"
    ) {
      return formatJobWorkflowStatus(
        status
      );
    }
  
  
    const normalized =
      normalizeMechanicBoardStatus(
        status
      );
  
  
    const match =
      MECHANIC_BOARD_CONFIG
        .statuses
        .find(([value]) => {
          return value === normalized;
        });
  
  
    return match
      ? match[1]
      : normalized.replaceAll(
          "_",
          " "
        );
  }
  
  
  function isMechanicJobClosed(job) {
    return MECHANIC_BOARD_CONFIG
      .closedStatuses
      .includes(
        normalizeMechanicBoardStatus(
          job.job_status
        )
      );
  }
  
  
  function mechanicJobMatchesFilter(job) {
    if (
      mechanicBoardFilter ===
      "all"
    ) {
      return true;
    }
  
  
    if (
      mechanicBoardFilter ===
      "active"
    ) {
      return !isMechanicJobClosed(
        job
      );
    }
  
  
    if (
      mechanicBoardFilter ===
      "closed"
    ) {
      return isMechanicJobClosed(
        job
      );
    }
  
  
    return true;
  }
  
  
  function mechanicJobMatchesSearch(job) {
    const searchValue =
      mechanicBoardSearch
        .trim()
        .toLowerCase();
  
  
    if (!searchValue) {
      return true;
    }
  
  
    const vehicleInfo =
      getFullVehicleInfo(
        job
      );
  
  
    const searchableText = `
      job-${job.id || ""}
      job ${job.id || ""}
      request-${job.service_request_id || ""}
      request ${job.service_request_id || ""}
      ${vehicleInfo.title || ""}
      ${vehicleInfo.plate || ""}
      ${vehicleInfo.vin || ""}
      ${job.assigned_mechanic || ""}
      ${job.repair_bay || ""}
      ${job.complaint || ""}
      ${job.diagnosis || ""}
      ${job.job_status || ""}
    `.toLowerCase();
  
  
    return searchableText.includes(
      searchValue
    );
  }
  
  
  function getFilteredMechanicJobs() {
    return mechanicBoardJobs.filter(
      (job) => {
        return (
          mechanicJobMatchesFilter(
            job
          ) &&
          mechanicJobMatchesSearch(
            job
          )
        );
      }
    );
  }
  
  
  /* =========================================================
     6. BOARD RENDERING
     ========================================================= */
  
  function renderMechanicBoard() {
    const container =
      getMechanicJobsContainer();
  
  
    if (!container) {
      return;
    }
  
  
    container.innerHTML = `
      ${renderMechanicBoardToolbar()}
  
      <div id="mechanicBoardSummary">
        ${renderMechanicBoardSummary()}
      </div>
  
      <div id="mechanicBoardContent">
        ${renderMechanicBoardContent()}
      </div>
    `;
  
  
    bindMechanicToolbar();
  
    bindMechanicJobButtons(
      container
    );
  }
  
  
  /**
   * Refreshes only summary and results.
   *
   * The search input remains mounted, preserving focus and
   * cursor position.
   */
  function refreshMechanicBoardView() {
    const summary =
      document.getElementById(
        "mechanicBoardSummary"
      );
  
  
    const content =
      document.getElementById(
        "mechanicBoardContent"
      );
  
  
    if (summary) {
      summary.innerHTML =
        renderMechanicBoardSummary();
    }
  
  
    if (content) {
      content.innerHTML =
        renderMechanicBoardContent();
    }
  
  
    bindMechanicJobButtons(
      content ||
      document
    );
  }
  
  
  function renderMechanicBoardToolbar() {
    return `
      <div class="mechanic-board-toolbar">
  
        <div class="mechanic-search-box">
          <label for="mechanicJobSearch">
            Search Jobs
          </label>
  
          <input
            type="search"
            id="mechanicJobSearch"
            placeholder="Search job, request, vehicle, plate, VIN, complaint, mechanic, bay..."
            value="${
  mechanicBoardSearch
    ? escapeHtml(mechanicBoardSearch)
    : ""
}"
            autocomplete="off"
          >
        </div>
  
  
        <div class="mechanic-filter-box">
          <label for="mechanicJobFilter">
            Job View
          </label>
  
          <select id="mechanicJobFilter">
  
            <option
              value="active"
              ${
                mechanicBoardFilter ===
                "active"
                  ? "selected"
                  : ""
              }
            >
              Active Jobs
            </option>
  
  
            <option
              value="closed"
              ${
                mechanicBoardFilter ===
                "closed"
                  ? "selected"
                  : ""
              }
            >
              Closed / Cancelled Jobs
            </option>
  
  
            <option
              value="all"
              ${
                mechanicBoardFilter ===
                "all"
                  ? "selected"
                  : ""
              }
            >
              All Jobs
            </option>
  
          </select>
        </div>
  
      </div>
    `;
  }
  
  
  function renderMechanicBoardSummary() {
    const totalJobs =
      mechanicBoardJobs.length;
  
  
    const activeJobs =
      mechanicBoardJobs.filter(
        (job) => {
          return !isMechanicJobClosed(
            job
          );
        }
      ).length;
  
  
    const waitingPartsJobs =
      mechanicBoardJobs.filter(
        (job) => {
          return (
            normalizeMechanicBoardStatus(
              job.job_status
            ) ===
            "waiting_parts"
          );
        }
      ).length;
  
  
    const readyJobs =
      mechanicBoardJobs.filter(
        (job) => {
          return (
            normalizeMechanicBoardStatus(
              job.job_status
            ) ===
            "ready_for_pickup"
          );
        }
      ).length;
  
  
    return `
      <div class="stats-grid mechanic-board-stats">
  
        <article class="stat-card">
          <h3>${totalJobs}</h3>
          <p>Total Jobs</p>
        </article>
  
  
        <article class="stat-card blue">
          <h3>${activeJobs}</h3>
          <p>Active Jobs</p>
        </article>
  
  
        <article class="stat-card orange">
          <h3>${waitingPartsJobs}</h3>
          <p>Waiting for Parts</p>
        </article>
  
  
        <article class="stat-card green">
          <h3>${readyJobs}</h3>
          <p>Ready for Pickup</p>
        </article>
  
      </div>
    `;
  }
  
  
  function renderMechanicBoardContent() {
    const filteredJobs =
      getFilteredMechanicJobs();
  
  
    if (
      filteredJobs.length ===
      0
    ) {
      return typeof renderEmptyState ===
        "function"
        ? renderEmptyState(
            "No Jobs Found",
            "No mechanic jobs match the current search and filter."
          )
        : `
          <div class="module-card">
            <h3>
              No Jobs Found
            </h3>
  
            <p>
              No mechanic jobs match the current search
              and filter.
            </p>
          </div>
        `;
    }
  
  
    return renderMechanicJobsTable(
      filteredJobs
    );
  }
  
  
  function renderMechanicJobsTable(
    jobs
  ) {
    return `
      <div class="admin-requests-table-wrap">
  
        <table class="admin-requests-table mechanic-jobs-table">
  
          <thead>
            <tr>
              <th>Job</th>
              <th>Vehicle</th>
              <th>Repair Scope</th>
              <th>Mechanic / Bay</th>
              <th>Status</th>
              <th>Schedule</th>
              <th class="mechanic-job-subtotal-heading">
  <span>Operational</span>
  <span>Subtotal</span>
</th>

<th class="mechanic-job-action-heading">
  Action
</th>
            </tr>
          </thead>
  
  
          <tbody>
            ${jobs
              .map((job) => {
                return renderMechanicJobRow(
                  job
                );
              })
              .join("")}
          </tbody>
  
        </table>
  
      </div>
    `;
  }
  
  
  function renderMechanicJobRow(job) {
    const status =
      normalizeMechanicBoardStatus(
        job.job_status
      );
  
  
    const vehicleInfo =
      getFullVehicleInfo(
        job
      );
  
  
    const finances =
      typeof getMechanicJobFinancialSummary ===
        "function"
        ? getMechanicJobFinancialSummary(
            job.id
          )
        : {
            operationalSubtotal: 0
          };
  
  
    const subtotal =
      Number(
        finances.operationalSubtotal ||
        0
      );
  
  
    const subtotalDisplay =
      typeof money === "function"
        ? money(
            subtotal
          )
        : subtotal.toFixed(
            2
          );
  
  
    return `
      <tr
        data-mechanic-job-row="${Number(job.id)}"
      >
  
        <td>
          <strong>
            JOB-${Number(job.id)}
          </strong>
  
          <small>
            Request #${safeText(
              job.service_request_id,
              "-"
            )}
          </small>
        </td>
  
  
        <td>
          <strong>
            ${safeText(
              vehicleInfo.title,
              "Vehicle"
            )}
          </strong>
  
          ${
            vehicleInfo.plate
              ? `
                <small>
                  Plate:
                  ${safeText(
                    vehicleInfo.plate
                  )}
                </small>
              `
              : ""
          }
        </td>
  
  
        <td>
          <strong>
            ${safeText(
              shortenMechanicBoardText(
                job.complaint,
                72
              ),
              "No repair scope recorded"
            )}
          </strong>
        </td>
  
  
        <td>
          <strong>
            ${safeText(
              job.assigned_mechanic,
              "Unassigned"
            )}
          </strong>
  
          <small>
            Bay:
            ${safeText(
              job.repair_bay,
              "-"
            )}
          </small>
        </td>
  
  
        <td>
          <span
            class="
              status-badge
              status-${mechanicBoardStatusClass(status)}
            "
          >
            ${safeText(
              formatMechanicBoardStatus(
                status
              )
            )}
          </span>
        </td>
  
  
        <td>
          <strong>
            ${formatMechanicBoardDate(
              job.appointment_date
            )}
          </strong>
  
          <small>
            Est. completion:
            ${formatMechanicBoardDate(
              job.estimated_completion
            )}
          </small>
        </td>
  
  
        <td>
          <strong>
            ${subtotalDisplay}
          </strong>
  
          <small>
            Parts + labour only
          </small>
        </td>
  
  
        <td>
          <button
            type="button"
            class="
              table-action-btn
              open-mechanic-job-workspace-btn
            "
            data-job-id="${Number(job.id)}"
          >
            Open Job Workspace
          </button>
        </td>
  
      </tr>
    `;
  }
  
  
  /* =========================================================
     7. EVENT BINDINGS
     ========================================================= */
  
  function bindMechanicToolbar() {
    const filterSelect =
      document.getElementById(
        "mechanicJobFilter"
      );
  
  
    const searchInput =
      document.getElementById(
        "mechanicJobSearch"
      );
  
  
    if (filterSelect) {
      filterSelect.addEventListener(
        "change",
        function () {
          mechanicBoardFilter =
            filterSelect.value;
  
          refreshMechanicBoardView();
        }
      );
    }
  
  
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        function () {
          mechanicBoardSearch =
            searchInput.value;
  
          refreshMechanicBoardView();
        }
      );
    }
  }
  
  
  function bindMechanicJobButtons(
    root = document
  ) {
    root
      .querySelectorAll(
        ".open-mechanic-job-workspace-btn"
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
  
  
            if (
              typeof openMechanicJobWorkspace !==
              "function"
            ) {
              notifyMechanicBoard(
                "danger",
                "Workspace Unavailable",
                "The Mechanic Job Workspace controller is not loaded."
              );
  
              return;
            }
  
  
            const originalText =
              button.textContent;
  
  
            button.disabled =
              true;
  
  
            button.textContent =
              "Opening...";
  
  
            try {
              await openMechanicJobWorkspace(
                jobId,
                "overview",
                null
              );
  
            } finally {
              if (
                document.body.contains(
                  button
                )
              ) {
                button.disabled =
                  false;
  
                button.textContent =
                  originalText;
              }
            }
          }
        );
      });
  }
  
  
  /* =========================================================
     8. LEGACY INLINE-SAVE COMPATIBILITY
     ========================================================= */
  
  /**
   * Inline editing is retired.
   *
   * Any remaining legacy caller is routed to the authoritative
   * Update tab.
   *
   * @param {number|string} jobId
   */
  async function saveMechanicJob(jobId) {
    if (
      typeof openMechanicJobWorkspace !==
      "function"
    ) {
      notifyMechanicBoard(
        "danger",
        "Workspace Unavailable",
        "The Mechanic Job Workspace controller is not loaded."
      );
  
      return;
    }
  
  
    notifyMechanicBoard(
      "info",
      "Job Update Moved",
      "Mechanic job updates are now saved from the dedicated Job Workspace."
    );
  
  
    await openMechanicJobWorkspace(
      jobId,
      "update",
      null
    );
  }
  
  
  /* =========================================================
     9. VEHICLE AND DISPLAY HELPERS
     ========================================================= */
  
  function getFullVehicleInfo(job) {
    const vehicle =
      job.vehicles ||
      {};
  
  
    const fallback =
      parseMechanicVehicleDisplay(
        job.vehicle
      );
  
  
    const title = [
      vehicle.year,
      vehicle.make,
      vehicle.model,
      vehicle.trim
    ]
      .filter(Boolean)
      .join(" ");
  
  
    return {
      title:
        title ||
        fallback.main ||
        "Vehicle",
  
      year:
        vehicle.year ||
        "",
  
      make:
        vehicle.make ||
        "",
  
      model:
        vehicle.model ||
        "",
  
      trim:
        vehicle.trim ||
        "",
  
      color:
        vehicle.color ||
        "",
  
      plate:
        vehicle.license_plate ||
        fallback.plate ||
        "",
  
      vin:
        vehicle.vin ||
        "",
  
      mileage:
        vehicle.mileage ||
        "",
  
      notes:
        vehicle.notes ||
        ""
    };
  }
  
  
  function renderMechanicJobStatusOptions(
    currentStatus
  ) {
    const normalizedStatus =
      normalizeMechanicBoardStatus(
        currentStatus
      );
  
  
    if (
      typeof renderJobWorkflowStatusOptions ===
      "function"
    ) {
      return renderJobWorkflowStatusOptions(
        normalizedStatus
      );
    }
  
  
    return MECHANIC_BOARD_CONFIG
      .statuses
      .map(([value, label]) => {
        return `
          <option
            value="${value}"
            ${
              value === normalizedStatus
                ? "selected"
                : ""
            }
          >
            ${label}
          </option>
        `;
      })
      .join("");
  }
  
  
  function parseMechanicVehicleDisplay(
    vehicleText
  ) {
    const raw =
      String(
        vehicleText ||
        ""
      ).trim();
  
  
    if (!raw) {
      return {
        main:
          "Vehicle not provided",
  
        plate:
          ""
      };
    }
  
  
    const plateMatch =
      raw.match(
        /plate:\s*(.+)$/i
      );
  
  
    if (!plateMatch) {
      return {
        main:
          raw,
  
        plate:
          ""
      };
    }
  
  
    return {
      main:
        raw
          .replace(
            /plate:\s*(.+)$/i,
            ""
          )
          .trim(),
  
      plate:
        plateMatch[1]
          .trim()
          .toUpperCase()
    };
  }
  
  
  function shortenMechanicBoardText(
    value,
    maximumLength = 70
  ) {
    const text =
      String(
        value ||
        ""
      ).trim();
  
  
    if (
      text.length <=
      maximumLength
    ) {
      return text;
    }
  
  
    return `${text.slice(
      0,
      maximumLength - 1
    )}…`;
  }
  
  
  function formatMechanicBoardDate(value) {
    if (!value) {
      return "-";
    }
  
  
    if (
      typeof formatDate ===
      "function"
    ) {
      return formatDate(
        value
      );
    }
  
  
    return new Date(
      value
    ).toLocaleString();
  }
  
  
  function mechanicBoardStatusClass(
    status
  ) {
    return normalizeMechanicBoardStatus(
      status
    ).replace(
      /[^a-z0-9_-]/g,
      "-"
    );
  }
  
  
  /* =========================================================
     10. NOTIFICATION HELPER
     ========================================================= */
  
  function notifyMechanicBoard(
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
     11. GLOBAL EXPORTS
     ========================================================= */
  
  window.loadMechanicBoard =
    loadMechanicBoard;
  
  
  window.renderMechanicBoard =
    renderMechanicBoard;
  
  
  window.refreshMechanicBoardView =
    refreshMechanicBoardView;
  
  
  window.canAccessMechanicBoard =
    canAccessMechanicBoard;
  
  
  window.getFilteredMechanicJobs =
    getFilteredMechanicJobs;
  
  
  window.isMechanicJobClosed =
    isMechanicJobClosed;
  
  
  window.getFullVehicleInfo =
    getFullVehicleInfo;
  
  
  window.renderMechanicJobStatusOptions =
    renderMechanicJobStatusOptions;
  
  
  window.parseMechanicVehicleDisplay =
    parseMechanicVehicleDisplay;
  
  
  window.saveMechanicJob =
    saveMechanicJob;