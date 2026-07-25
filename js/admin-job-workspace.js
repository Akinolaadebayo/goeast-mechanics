/* =========================================================
   ADMIN MECHANIC JOB WORKSPACE
   File: js/admin-job-workspace.js

   Sprint:
   Mechanic Job Workspace and Synchronization

   Purpose:
   Provides one dedicated enterprise workspace for a mechanic
   job and coordinates the controller, view, parts, labour,
   timeline, and synchronization modules.

   Tabs:
   - Overview
   - Customer
   - Vehicle
   - Diagnosis
   - Repairs
   - Parts & Labour
   - Timeline
   - Update

   Security Boundary:
   - Developer / Upper Admin: full operational access.
   - Mechanic: operational access without customer identity.
   - Receptionist: read-only job access from Service Requests.
   ========================================================= */

/* =========================================================
   1. WORKSPACE STATE
   ========================================================= */

let activeMechanicJobWorkspace = createEmptyMechanicJobWorkspaceState();

function createEmptyMechanicJobWorkspaceState() {
  return {
    jobId: null,
    job: null,
    request: null,
    timeline: [],
    returnRequestId: null,
    currentTab: "overview",
    dirty: false,
    refreshing: false,
    draft: null,
  };
}

/* =========================================================
    2. PERMISSIONS
    ========================================================= */

/**
 * Roles permitted to open a mechanic-job workspace.
 *
 * Receptionists receive read-only access so they can review a
 * linked job from the Service Request workflow.
 *
 * @returns {boolean}
 */
function canViewMechanicJobWorkspace() {
  return Boolean(
    typeof currentProfile !== "undefined" &&
      currentProfile &&
      ["developer", "upper_admin", "mechanic", "receptionist"].includes(
        currentProfile.role
      )
  );
}

/**
 * Roles permitted to change diagnosis, repairs, notes, and
 * mechanic-job status.
 *
 * @returns {boolean}
 */
function canEditMechanicJobWorkspace() {
  return Boolean(
    typeof currentProfile !== "undefined" &&
      currentProfile &&
      ["developer", "upper_admin", "mechanic"].includes(currentProfile.role)
  );
}

/**
 * Customer identity is intentionally hidden from mechanics.
 *
 * @returns {boolean}
 */
function canViewMechanicJobCustomerIdentity() {
  return Boolean(
    typeof currentProfile !== "undefined" &&
      currentProfile &&
      ["developer", "upper_admin", "receptionist"].includes(currentProfile.role)
  );
}

/* =========================================================
    3. OPEN FROM A LINKED SERVICE REQUEST
    ========================================================= */

/**
 * Opens a job while remembering which Service Request should
 * be restored when the job workspace closes.
 *
 * @param {number|string} jobId
 * @param {number|string} requestId
 */
async function openMechanicJobFromRequest(jobId, requestId) {
  await openMechanicJobWorkspace(jobId, "overview", requestId);
}

/* =========================================================
    4. OPEN WORKSPACE
    ========================================================= */

/**
 * Loads and opens one mechanic job.
 *
 * @param {number|string} jobId
 * @param {string} initialTab
 * @param {number|string|null} returnRequestId
 */
async function openMechanicJobWorkspace(
  jobId,
  initialTab = "overview",
  returnRequestId = null
) {
  if (!canViewMechanicJobWorkspace()) {
    notifyMechanicJobWorkspace(
      "danger",
      "Access Restricted",
      "You do not have permission to open this mechanic job."
    );

    return;
  }

  const workspaceContainer = document.getElementById("jobWorkspaceContainer");

  if (!workspaceContainer) {
    notifyMechanicJobWorkspace(
      "danger",
      "Workspace Missing",
      "The #jobWorkspaceContainer element is missing from admin.html."
    );

    return;
  }

  /*
     Close any request or job workspace that is already open.
 
     skipOnClose prevents an older workspace return callback
     from running while the new job workspace is opening.
   */
  if (typeof isWorkspaceOpen === "function" && isWorkspaceOpen()) {
    closeWorkspace({
      restoreScroll: false,
      skipOnClose: true,
    });
  }

  activateAdminSection("mechanicSection");

  workspaceContainer.classList.remove("hidden");

  workspaceContainer.innerHTML =
    typeof renderLoadingState === "function"
      ? renderLoadingState("Loading mechanic job workspace...")
      : `
         <p class="empty-message">
           Loading mechanic job workspace...
         </p>
       `;

  try {
    const job = await loadMechanicJobRecord(jobId);

    if (!job) {
      workspaceContainer.innerHTML =
        typeof renderEmptyState === "function"
          ? renderEmptyState(
              "Mechanic Job Not Found",
              "The selected mechanic job could not be loaded."
            )
          : `
             <p class="empty-message">
               The selected mechanic job could not be loaded.
             </p>
           `;

      return;
    }

    const request = await loadLinkedServiceRequestRecord(
      job.service_request_id
    );

    /*
       Parts and labour must load before the views calculate
       operational totals and render their structured tables.
     */
    if (typeof loadMechanicPartsEngine === "function") {
      await loadMechanicPartsEngine();
    }

    if (typeof loadMechanicLabourEngine === "function") {
      await loadMechanicLabourEngine();
    }

    const timeline = await loadMechanicJobTimeline(job.id);

    activeMechanicJobWorkspace = {
      jobId: Number(job.id),

      job,

      request,

      timeline,

      returnRequestId:
        returnRequestId !== null && returnRequestId !== undefined
          ? Number(returnRequestId)
          : null,

      currentTab: normalizeMechanicJobWorkspaceTab(initialTab),

      dirty: false,

      refreshing: false,

      draft: null,
    };

    renderMechanicJobWorkspace(activeMechanicJobWorkspace.currentTab);

    installMechanicWorkspaceRefreshBridges();
  } catch (error) {
    console.error("Mechanic job workspace load failed:", error);

    workspaceContainer.innerHTML =
      typeof renderEmptyState === "function"
        ? renderEmptyState(
            "Workspace Load Failed",
            error?.message || "The mechanic job workspace could not be loaded."
          )
        : `
           <p class="empty-message">
             The mechanic job workspace could not be loaded.
           </p>
         `;

    notifyMechanicJobWorkspace(
      "danger",
      "Workspace Load Failed",
      error?.message || "The mechanic job workspace could not be loaded."
    );
  }
}

/* =========================================================
    5. RENDER COMPLETE WORKSPACE
    ========================================================= */

/**
 * Renders the complete workspace from the active state.
 *
 * @param {string} initialTab
 */
function renderMechanicJobWorkspace(initialTab = "overview") {
  const { job } = activeMechanicJobWorkspace;

  if (!job) {
    return;
  }

  const vehicleInfo = getMechanicWorkspaceVehicleInfo(job);

  const normalizedStatus = normalizeJobWorkflowStatus(job.job_status);

  const safeInitialTab = normalizeMechanicJobWorkspaceTab(initialTab);

  const opened = openWorkspace({
    containerId: "jobWorkspaceContainer",

    module: `mechanic-job-${job.id}`,

    ownerSectionId: "mechanicSection",

    /*
       Hide the normal Mechanic Jobs board while the selected
       job workspace is open.
     */
    hideSelectors: [":scope > .section-heading", ":scope > #mechanicJobsList"],

    kicker: "Mechanic Job Workspace",

    title: `JOB-${job.id} • ${vehicleInfo.title}`,

    subtitle:
      `Request #${job.service_request_id || "-"} • ` +
      formatJobWorkflowStatus(normalizedStatus),

    actions: `
       <button
         type="button"
         class="
           secondary-action-btn
           workspace-close-btn
         "
         onclick="
           closeMechanicJobWorkspaceSafely()
         "
       >
         ${
           activeMechanicJobWorkspace.returnRequestId
             ? `
               Back to Request
               #${activeMechanicJobWorkspace.returnRequestId}
             `
             : "Back to Mechanic Jobs"
         }
       </button>
     `,

    context: renderMechanicJobWorkspaceContext(job, normalizedStatus),

    tabs: [
      {
        id: "overview",
        label: "Overview",

        content: renderMechanicJobOverviewTab(job),
      },

      {
        id: "customer",
        label: "Customer",

        content: renderMechanicJobCustomerTab(),
      },

      {
        id: "vehicle",
        label: "Vehicle",

        content: renderMechanicJobVehicleTab(job),
      },

      {
        id: "diagnosis",
        label: "Diagnosis",

        content: renderMechanicJobDiagnosisTab(job),
      },

      {
        id: "repairs",
        label: "Repairs",

        content: renderMechanicJobRepairsTab(job),
      },

      {
        id: "parts-labour",
        label: "Parts & Labour",

        content: renderMechanicJobPartsLabourTab(job),
      },

      {
        id: "timeline",
        label: "Timeline",

        content: renderMechanicJobTimelineTab(job),
      },

      {
        id: "update",
        label: "Update",

        content: renderMechanicJobUpdateTab(job),
      },
    ],

    /*
       Controls what happens when the workspace closes.
 
       The user is returned either to:
       - The parent Service Request; or
       - The normal Mechanic Jobs board.
     */
    onClose: handleMechanicJobWorkspaceClosed,
  });

  if (!opened) {
    return;
  }

  const container = document.getElementById("jobWorkspaceContainer");

  if (container && typeof activateWorkspaceTab === "function") {
    activateWorkspaceTab(container, safeInitialTab);
  }

  activeMechanicJobWorkspace.currentTab = safeInitialTab;

  bindMechanicJobWorkspaceEvents();

  /*
     Reconnect controls rendered by the existing structured
     parts and labour modules.
   */
  if (typeof bindMechanicPartsButtons === "function") {
    bindMechanicPartsButtons();
  }

  if (typeof bindMechanicLabourButtons === "function") {
    bindMechanicLabourButtons();
  }

  restoreMechanicJobWorkspaceDraft();

  applyMechanicJobWorkspacePermissionState();
}

/* =========================================================
    6. VALID WORKSPACE TABS
    ========================================================= */

const MECHANIC_JOB_WORKSPACE_TABS = [
  "overview",
  "customer",
  "vehicle",
  "diagnosis",
  "repairs",
  "parts-labour",
  "timeline",
  "update",
];

function normalizeMechanicJobWorkspaceTab(tabName) {
  const requestedTab = String(tabName || "overview")
    .trim()
    .toLowerCase();

  return MECHANIC_JOB_WORKSPACE_TABS.includes(requestedTab)
    ? requestedTab
    : "overview";
}

/* =========================================================
    7. SAVE JOB UPDATE
    ========================================================= */

/**
 * Saves:
 * - Job status
 * - Diagnosis
 * - Repairs performed
 * - Labour notes
 * - Optional timeline/customer message
 *
 * The verified Supabase RPC also:
 * - Recalculates the parent request status.
 * - Creates a job-specific timeline record.
 * - Preserves customer visibility rules.
 *
 * @param {number|string} jobId
 * @param {HTMLButtonElement|null} button
 */
async function saveMechanicJobWorkspace(jobId, button) {
  const job = activeMechanicJobWorkspace.job;

  if (!job || String(job.id) !== String(jobId)) {
    notifyMechanicJobWorkspace(
      "danger",
      "Job Not Found",
      "The open mechanic job could not be found."
    );

    return;
  }

  if (!canEditMechanicJobWorkspace()) {
    notifyMechanicJobWorkspace(
      "danger",
      "Read-Only Access",
      "You do not have permission to update this mechanic job."
    );

    return;
  }

  const formValues = getMechanicJobWorkspaceFormValues(jobId);

  const originalText = button?.textContent || "Save Job Update";

  setMechanicJobWorkspaceButton(button, true, "Saving...");

  try {
    const result = await saveMechanicJobWorkflowUpdate({
      jobId,

      status: formValues.status,

      diagnosis: formValues.diagnosis,

      repairsPerformed: formValues.repairsPerformed,

      laborNotes: formValues.laborNotes,

      message: formValues.message,

      internalOnly: formValues.internalOnly,
    });

    if (!result.success) {
      throw result.error || new Error("The mechanic job could not be saved.");
    }

    activeMechanicJobWorkspace.dirty = false;

    activeMechanicJobWorkspace.draft = null;

    notifyMechanicJobWorkspace(
      "success",
      "Mechanic Job Updated",

      formValues.message && !formValues.internalOnly
        ? `
           Job saved and the customer-visible
           timeline update was posted.
         `
        : `
           Job saved and its timeline record
           was created.
         `
    );

    /*
       Refresh the hidden source lists before reopening
       the job workspace.
     */
    if (typeof loadServiceRequests === "function") {
      await loadServiceRequests();
    }

    if (typeof loadMechanicBoard === "function") {
      await loadMechanicBoard();
    }

    /*
       After saving, reopen the job on Timeline so staff
       can immediately confirm the new record.
     */
    await refreshOpenMechanicJobWorkspace("timeline", {
      preserveDraft: false,
    });
  } catch (error) {
    console.error("Mechanic job save failed:", error);

    notifyMechanicJobWorkspace(
      "danger",
      "Job Save Failed",
      error?.message || "The mechanic job could not be saved."
    );
  } finally {
    setMechanicJobWorkspaceButton(button, false, originalText);
  }
}

/* =========================================================
    8. FORM VALUES AND DRAFT PRESERVATION
    ========================================================= */

/**
 * Reads the active job update form.
 *
 * @param {number|string} jobId
 * @returns {object}
 */
function getMechanicJobWorkspaceFormValues(jobId) {
  return {
    status:
      document.getElementById(`jobWorkspaceStatus-${jobId}`)?.value ||
      activeMechanicJobWorkspace.job?.job_status ||
      "new",

    diagnosis:
      document.getElementById(`jobWorkspaceDiagnosis-${jobId}`)?.value.trim() ||
      "",

    repairsPerformed:
      document.getElementById(`jobWorkspaceRepairs-${jobId}`)?.value.trim() ||
      "",

    laborNotes:
      document
        .getElementById(`jobWorkspaceLabourNotes-${jobId}`)
        ?.value.trim() || "",

    message:
      document.getElementById(`jobWorkspaceMessage-${jobId}`)?.value.trim() ||
      "",

    internalOnly: Boolean(
      document.getElementById(`jobWorkspaceInternalOnly-${jobId}`)?.checked
    ),
  };
}

/**
 * Saves unsaved Update-tab values in memory.
 *
 * This protects the form when parts or labour refresh
 * the job workspace.
 *
 * @returns {object|null}
 */
function captureMechanicJobWorkspaceDraft() {
  const jobId = activeMechanicJobWorkspace.jobId;

  if (!jobId) {
    return null;
  }

  const form = document.getElementById(`mechanicJobUpdateForm-${jobId}`);

  if (!form) {
    return activeMechanicJobWorkspace.draft;
  }

  const draft = getMechanicJobWorkspaceFormValues(jobId);

  activeMechanicJobWorkspace.draft = draft;

  return draft;
}

/**
 * Restores an unsaved Update-tab draft after a workspace
 * refresh.
 */
function restoreMechanicJobWorkspaceDraft() {
  const jobId = activeMechanicJobWorkspace.jobId;

  const draft = activeMechanicJobWorkspace.draft;

  if (!jobId || !draft) {
    return;
  }

  const statusInput = document.getElementById(`jobWorkspaceStatus-${jobId}`);

  const diagnosisInput = document.getElementById(
    `jobWorkspaceDiagnosis-${jobId}`
  );

  const repairsInput = document.getElementById(`jobWorkspaceRepairs-${jobId}`);

  const labourNotesInput = document.getElementById(
    `jobWorkspaceLabourNotes-${jobId}`
  );

  const messageInput = document.getElementById(`jobWorkspaceMessage-${jobId}`);

  const internalOnlyInput = document.getElementById(
    `jobWorkspaceInternalOnly-${jobId}`
  );

  if (statusInput) {
    statusInput.value = draft.status;
  }

  if (diagnosisInput) {
    diagnosisInput.value = draft.diagnosis;
  }

  if (repairsInput) {
    repairsInput.value = draft.repairsPerformed;
  }

  if (labourNotesInput) {
    labourNotesInput.value = draft.laborNotes;
  }

  if (messageInput) {
    messageInput.value = draft.message;
  }

  if (internalOnlyInput) {
    internalOnlyInput.checked = Boolean(draft.internalOnly);
  }
}

/* =========================================================
    9. REFRESH OPEN WORKSPACE
    ========================================================= */

/**
 * Reloads the active job without losing its return route.
 *
 * @param {string|null} preferredTab
 * @param {{preserveDraft?: boolean}} options
 */
async function refreshOpenMechanicJobWorkspace(
  preferredTab = null,
  options = {}
) {
  const { preserveDraft = true } = options;

  if (
    !activeMechanicJobWorkspace.jobId ||
    activeMechanicJobWorkspace.refreshing
  ) {
    return;
  }

  if (preserveDraft && activeMechanicJobWorkspace.dirty) {
    captureMechanicJobWorkspaceDraft();
  }

  const jobId = activeMechanicJobWorkspace.jobId;

  const returnRequestId = activeMechanicJobWorkspace.returnRequestId;

  const preservedDraft = preserveDraft
    ? activeMechanicJobWorkspace.draft
    : null;

  const wasDirty = preserveDraft ? activeMechanicJobWorkspace.dirty : false;

  const tab = normalizeMechanicJobWorkspaceTab(
    preferredTab || activeMechanicJobWorkspace.currentTab || "overview"
  );

  activeMechanicJobWorkspace.refreshing = true;

  try {
    /*
       Remove the board cache entry so the synchronization
       helper performs a fresh Supabase job query.
     */
    if (
      typeof mechanicBoardJobs !== "undefined" &&
      Array.isArray(mechanicBoardJobs)
    ) {
      mechanicBoardJobs = mechanicBoardJobs.filter((job) => {
        return String(job.id) !== String(jobId);
      });
    }

    await openMechanicJobWorkspace(jobId, tab, returnRequestId);

    /*
       openMechanicJobWorkspace creates a fresh state object.
       Restore any protected draft after that fresh load.
     */
    activeMechanicJobWorkspace.draft = preservedDraft;

    activeMechanicJobWorkspace.dirty = wasDirty;

    restoreMechanicJobWorkspaceDraft();
  } catch (error) {
    console.error("Mechanic job workspace refresh failed:", error);

    notifyMechanicJobWorkspace(
      "danger",
      "Refresh Failed",
      error?.message || "The mechanic job workspace could not be refreshed."
    );
  } finally {
    activeMechanicJobWorkspace.refreshing = false;
  }
}

/* =========================================================
    10. CLOSE AND RETURN WORKFLOW
    ========================================================= */

/**
 * Closes the job workspace only after protecting unsaved
 * form changes.
 */
function closeMechanicJobWorkspaceSafely() {
  if (
    activeMechanicJobWorkspace.dirty &&
    !confirm("You have unsaved mechanic job changes. Close anyway?")
  ) {
    return;
  }

  activeMechanicJobWorkspace.dirty = false;

  activeMechanicJobWorkspace.draft = null;

  if (typeof closeWorkspace === "function") {
    closeWorkspace();
  }
}

/**
 * Runs after the shared workspace shell completes its close.
 */
function handleMechanicJobWorkspaceClosed() {
  const returnRequestId = activeMechanicJobWorkspace.returnRequestId;

  resetMechanicJobWorkspaceState();

  /*
     The workspace was opened from a Service Request.
     Return to that request's Linked Jobs tab.
   */
  if (returnRequestId && typeof openServiceRequestWorkspace === "function") {
    activateAdminSection("requestsSection");

    openServiceRequestWorkspace(returnRequestId, "linkedjobs");

    return;
  }

  /*
     The workspace was opened directly from Mechanic Jobs.
   */
  activateAdminSection("mechanicSection");
}

/**
 * Routes staff back to a specific linked Service Request.
 *
 * @param {number|string} requestId
 */
function returnToLinkedServiceRequest(requestId) {
  activeMechanicJobWorkspace.returnRequestId = Number(requestId);

  closeMechanicJobWorkspaceSafely();
}

/**
 * Clears all active job workspace state.
 */
function resetMechanicJobWorkspaceState() {
  activeMechanicJobWorkspace = createEmptyMechanicJobWorkspaceState();
}

/* =========================================================
    11. TAB AND FORM EVENTS
    ========================================================= */

/**
 * Tracks:
 * - Current active tab
 * - Unsaved form changes
 */
function bindMechanicJobWorkspaceEvents() {
  const container = document.getElementById("jobWorkspaceContainer");

  if (!container) {
    return;
  }

  container.querySelectorAll(".workspace-tab-btn").forEach((button) => {
    button.addEventListener("click", function () {
      activeMechanicJobWorkspace.currentTab = normalizeMechanicJobWorkspaceTab(
        button.dataset.tab
      );
    });
  });

  const form = document.getElementById(
    `mechanicJobUpdateForm-${activeMechanicJobWorkspace.jobId}`
  );

  if (form) {
    const markDirty = function () {
      activeMechanicJobWorkspace.dirty = true;

      captureMechanicJobWorkspaceDraft();
    };

    form.addEventListener("input", markDirty);

    form.addEventListener("change", markDirty);
  }
}

/**
 * Programmatically opens one job workspace tab.
 *
 * Used by buttons such as:
 * - Update Diagnosis
 * - Update Repair Record
 *
 * @param {string} tabName
 */
function activateMechanicJobWorkspaceTab(tabName) {
  const container = document.getElementById("jobWorkspaceContainer");

  const safeTabName = normalizeMechanicJobWorkspaceTab(tabName);

  if (!container || typeof activateWorkspaceTab !== "function") {
    return;
  }

  activeMechanicJobWorkspace.currentTab = safeTabName;

  activateWorkspaceTab(container, safeTabName);
}

/* =========================================================
    12. PERMISSION-BASED UI CLEANUP
    ========================================================= */

/**
 * Removes operational edit controls for read-only users.
 */
function applyMechanicJobWorkspacePermissionState() {
  if (canEditMechanicJobWorkspace()) {
    return;
  }

  const container = document.getElementById("jobWorkspaceContainer");

  if (!container) {
    return;
  }

  container
    .querySelectorAll(
      `
       [data-open-add-part],
       [data-open-add-labour],
       .installed-part-edit-btn,
       .installed-part-remove-btn,
       .labour-edit-btn,
       .labour-remove-btn
     `
    )
    .forEach((button) => {
      button.remove();
    });
}

/* =========================================================
    13. PARTS AND LABOUR REFRESH BRIDGES
    ========================================================= */

/**
 * Existing parts and labour modules continue to own their
 * database save operations.
 *
 * These bridges refresh the open workspace after those
 * operations finish.
 */
function installMechanicWorkspaceRefreshBridges() {
  installMechanicWorkspaceActionBridge(
    ["saveMechanicJobPart", "saveInstalledPartEdit", "removeInstalledPart"],
    "parts"
  );

  installMechanicWorkspaceActionBridge(
    ["saveLabourEntry", "updateLabourEntry", "removeLabourEntry"],
    "labour"
  );
}

/**
 * Wraps existing module actions once.
 *
 * Every original argument, return value, and error behavior
 * is preserved.
 *
 * @param {string[]} actionNames
 * @param {string} bridgeGroup
 */
function installMechanicWorkspaceActionBridge(actionNames, bridgeGroup) {
  const bridgeFlag = `__mechanicWorkspace${bridgeGroup}ActionsBridged`;

  if (window[bridgeFlag]) {
    return;
  }

  actionNames.forEach((actionName) => {
    const originalAction = window[actionName];

    if (typeof originalAction !== "function") {
      return;
    }

    window[actionName] = async function (...args) {
      const result = await originalAction.apply(this, args);

      if (activeMechanicJobWorkspace.jobId) {
        await refreshOpenMechanicJobWorkspace("parts-labour", {
          preserveDraft: true,
        });
      }

      return result;
    };
  });

  window[bridgeFlag] = true;
}

/* =========================================================
    14. SECTION NAVIGATION
    ========================================================= */

/**
 * Activates an admin section without depending on whether its
 * sidebar button is visible.
 *
 * This is required for read-only Receptionist access launched
 * from a Service Request.
 *
 * @param {string} sectionId
 */
function activateAdminSection(sectionId) {
  document.querySelectorAll(".admin-section").forEach((section) => {
    section.classList.toggle("active-section", section.id === sectionId);
  });

  document.querySelectorAll(".nav-btn[data-section]").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });
}

/* =========================================================
    15. BUTTON AND NOTIFICATION HELPERS
    ========================================================= */

function setMechanicJobWorkspaceButton(button, disabled, text) {
  if (!button) {
    return;
  }

  button.disabled = disabled;

  button.textContent = text;
}

function notifyMechanicJobWorkspace(type, title, message) {
  if (typeof showToast === "function") {
    showToast(type, title, message);

    return;
  }

  alert(message || title);
}

/* =========================================================
    16. UNSAVED-CHANGE BROWSER PROTECTION
    ========================================================= */

/*
   Prevent accidental browser refresh or tab closing while
   unsaved mechanic job changes exist.
 */
if (!window.__mechanicJobBeforeUnloadBound) {
  window.addEventListener("beforeunload", function (event) {
    if (!activeMechanicJobWorkspace.dirty) {
      return;
    }

    event.preventDefault();

    event.returnValue = "";
  });

  window.__mechanicJobBeforeUnloadBound = true;
}

/* =========================================================
    17. GLOBAL EXPORTS
    ========================================================= */

window.openMechanicJobWorkspace = openMechanicJobWorkspace;

window.openMechanicJobFromRequest = openMechanicJobFromRequest;

window.closeMechanicJobWorkspaceSafely = closeMechanicJobWorkspaceSafely;

window.returnToLinkedServiceRequest = returnToLinkedServiceRequest;

window.activateMechanicJobWorkspaceTab = activateMechanicJobWorkspaceTab;

window.saveMechanicJobWorkspace = saveMechanicJobWorkspace;

window.refreshOpenMechanicJobWorkspace = refreshOpenMechanicJobWorkspace;

window.canViewMechanicJobWorkspace = canViewMechanicJobWorkspace;

window.canEditMechanicJobWorkspace = canEditMechanicJobWorkspace;

window.canViewMechanicJobCustomerIdentity = canViewMechanicJobCustomerIdentity;
