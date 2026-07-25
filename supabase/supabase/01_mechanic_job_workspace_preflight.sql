ChatGPT




Sunday 6:37 AM

goeast-mechanics-main 4(2).zip
Zip Archive

Figma
 GO EAST MECHANICS
Enterprise Development Handoff
Version 1.0
Paste this entire prompt into the new chat.
CONTINUATION PROMPT

We are continuing development of Go East Mechanics Enterprise Management System.

This is NOT a new project.

This is a continuation of months of development.

You should reference:

the previous Go East Mechanics Info chat
the current chat
every architectural decision made previously

Nothing should be redesigned unless we explicitly decide to redesign it.

We are continuing from the existing codebase.

PROJECT PHILOSOPHY

Treat this as if you are the Lead Software Architect of an enterprise software company.

Do NOT make random changes.

Do NOT rewrite working code.

Do NOT rename variables unnecessarily.

Do NOT change architecture unless approved.

Every modification must be surgical.

Every change must preserve backwards compatibility.

We never replace large files unless absolutely necessary.

We patch.

We improve.

We refactor carefully.

PROJECT

Go East Mechanics

Enterprise Automotive Shop Management System

Long-term vision:

• Customer Portal

• Admin Portal

• Mechanic Workspace

• Service Advisor Workspace

• Inventory Management

• Purchasing

• Receiving

• Estimates

• Work Orders

• Invoices

• Payments

• Scheduling

• Time Tracking

• Technician Productivity

• Reporting

• Dashboard

• Notifications

• Audit History

• Roles & Permissions

• Mobile App

• AI Assistant

DEVELOPMENT RULES

Never rewrite files unnecessarily.

Always inspect existing code first.

Always explain WHY before changing code.

Always provide a rollback strategy.

Always preserve existing functionality.

Always think like a Senior Software Architect.

MY PREFERENCE

I do NOT like snippets.

I prefer complete functions.

If an entire function changes,
give the entire function.

If only 5 lines change,
only give those 5 lines.

Never rewrite an entire 3,000-line file unless I specifically ask.

CURRENT PROJECT STRUCTURE

The project currently contains approximately:

admin.js

admin-dashboard.js

admin-workspace-shell.js

admin-components.js

admin-utils.js

admin-inventory-items.js

admin-inventory-history.js

admin-inventory-transactions.js

admin-inventory-bulk.js

admin-inventory-adjustments.js

admin-inventory-receiving.js

admin-mechanic-board.js

admin-mechanic-labour.js

admin-mechanic-parts.js

admin-service-request-workspace.js

admin-payments.js

admin-invoices.js

admin-updates.js

customer.js

customer-requests.js

customer-payments.js

customer-invoices.js

customer-vehicles.js

login.js

signup.js

auth-config.js

etc.

CURRENT ARCHITECTURE

The application uses:

Supabase

JavaScript

HTML

CSS

No framework.

Modular architecture.

Each module owns its own functionality.

Shared UI is handled through:

admin-components.js

Shared utilities through:

admin-utils.js

MY EXPECTATIONS

Act as if this software will eventually have

100,000 users.

Design every decision for scalability.

Avoid technical debt.

Follow enterprise architecture.

CURRENT DEVELOPMENT STATUS

The major enterprise foundation already exists.

The dashboard works.

Authentication works.

Customer portal works.

Admin portal works.

Service Requests work.

Invoices work.

Payments work.

Mechanic board works.

Inventory system is largely complete.

The focus is stabilization, refinement, UX polish, and enterprise cleanup.

CURRENT INVENTORY MODULE STATUS

Completed

Inventory Dashboard

Inventory List

Inventory History

Inventory Transactions

Receiving

Bulk Operations

Inventory Adjustments

Inventory Metrics

Supplier support

Category support

Search

Filtering

Sorting

Statistics

Archive system

Restore system

Delete system

CURRENT ISSUE WE ARE FIXING

We are currently fixing the Inventory Edit modal.

The function

saveInventoryEditFromModal()

was updated.

The function compiles.

However,

the toast notifications are not working correctly.

We are NOT assuming the problem is inside saveInventoryEditFromModal().

We will debug methodically.

No guessing.

We will verify:

showToast exists

admin-components.js loads

toast CSS loads

the function executes

Supabase update succeeds

loadInventoryItems refreshes

Only after identifying the exact failure point will we change code.

IMPORTANT RULE

We are NOT allowed to introduce random changes.

Every modification must be evidence-based.

WHAT I EXPECT FROM CHATGPT

I want ChatGPT to act as my software engineering partner.

Roles include:

• Chief Software Architect

• Senior Full-Stack Engineer

• Enterprise Systems Engineer

• UI/UX Consultant

• Database Architect

• QA Engineer

• Code Reviewer

• Performance Engineer

• Security Reviewer

• Documentation Writer

• Technical Mentor

Every recommendation should be explained.

Every code change should be justified.

Every fix should minimize risk.

WHAT WE ARE DOING NEXT

Before changing any code:

Inspect the current issue.

Determine the root cause.

Explain why.

Provide the smallest safe fix.

Test.

Move to the next task.

We are building production-quality enterprise software, not just completing features.

ADDITIONAL CONTEXT FROM PREVIOUS CHATS

We previously discussed creating a Sprint 6.4.1 – Enterprise Cleanup. The goals were:

Remove duplicate workspaceContainer.
Remove the obsolete All Records feature completely.
Ensure All Jobs excludes archived jobs.
Eventually add a user-friendly notice explaining that archived jobs are not included.
Continue improving the inventory and admin modules without breaking existing functionality.

We also agreed that future development should be driven by a project roadmap, with each sprint focused on a small, testable set of changes.

HOW WE SHOULD WORK TOGETHER

For every task:

Analyze the existing implementation first.
Identify the exact root cause of any issue.
Propose the smallest safe change.
Explain the impact of that change.
Only then provide the updated code (preferably only the affected function or section).
After the fix, define the next logical task in the roadmap.
Final note

One thing I'd add to our process going forward is maintaining a living project README/architecture document inside the repository. It should include:

Overall architecture
Folder structure
Module responsibilities
Database tables and relationships
Naming conventions
Coding standards
Current sprint
Completed features
Known issues
Future roadmap
Change log

That document will make future development much safer and more consistent, especially as the codebase continues to grow. It also gives us a single source of truth so we don't have to reconstruct project history from previous chats.

445c8be7-5227-4500-b254-d62d5360ed7a.png
cadf3dc4-a265-45b0-87d0-47874b0fc79e.png
fbd41b89-fb49-41a7-8f78-4e14cf0cf0cf.png
3d600c80-d2e1-4d3f-bbb5-6dfa40317b8e.png

Pasted code(40).js
JavaScript

Pasted code (2)(8).js
JavaScript

Pasted code (3)(1).js
JavaScript

Pasted code (4)(2).js
JavaScript

Pasted code (5)(1).js
JavaScript

Pasted code (6)(1).js
JavaScript

Pasted code (7).js
JavaScript

Pasted code (8).js
JavaScript

Pasted code (9).js
JavaScript

Pasted code (10).js
JavaScript

Pasted code (11).html
File

Pasted code (12).html
File
Attached are all the codes for your review and so we can start fixing the problem of notifications first before we start something else or whatever you propose as the professional.

/* =========================================================
   ADMIN APP CONTROLLER
   File: js/admin.js

   Purpose:
   This file is now the startup controller for the admin dashboard.

   It does NOT contain heavy business logic anymore.

   It only:
   1. Checks staff access.
   2. Applies dashboard UI for the logged-in role.
   3. Loads service request data.
   4. Starts realtime updates.
   5. Connects logout.

   Other files will handle the actual feature logic.
   ========================================================= */


/* =========================================================
   1. APP STARTUP

   initializeAdminDashboard() is the main entry point.

   It runs after:
   - auth-config.js
   - admin-auth.js
   - admin-dashboard.js
   - admin-updates.js
   - admin-requests.js

   have already loaded.
   ========================================================= */

   async function initializeAdminDashboard() {
    /*
      Step 1:
      Verify that the logged-in user is allowed to access admin.html.
  
      checkStaffAccess() comes from admin-auth.js.
    */
    const isAuthorized = await checkStaffAccess();
  
    if (!isAuthorized) {
      return;
    }
  
    /*
      Step 2:
      Apply role-based UI.
  
      applyAdminProfileUI() and applyRoleUI() will come from
      admin-dashboard.js in the next step.
    */
    if (typeof applyAdminProfileUI === "function") {
      applyAdminProfileUI();
    }
  
    if (typeof applyRoleUI === "function") {
      applyRoleUI();
    }
  
    /*
      Step 3:
      Show the first section this user is allowed to access.
  
      showFirstAllowedSection() will come from admin-dashboard.js.
    */
    if (typeof showFirstAllowedSection === "function") {
      showFirstAllowedSection();
    }
  
    /*
      Step 4:
      Load service requests.
  
      loadServiceRequests() will come from admin-requests.js.
    */
    if (typeof loadServiceRequests === "function") {
      await loadServiceRequests();
    }
    if (typeof loadAdminPayments === "function") {
      await loadAdminPayments();
    }

    if (typeof loadMechanicBoard === "function") {
      await loadMechanicBoard();
    }
    
    if (typeof loadAdminInvoices === "function") {
      await loadAdminInvoices();
    }
    if (typeof loadInventoryItems === "function") {
      await loadInventoryItems();
    }
  
    /*
      Step 5:
      Start realtime updates.
  
      subscribeStaffRealtime() will come from admin-requests.js later.
    */
    if (typeof subscribeStaffRealtime === "function") {
      subscribeStaffRealtime();
    }
  
    /*
      Step 6:
      Connect logout button.
  
      logoutStaffUser() comes from admin-auth.js.
    */
    const logoutBtn = document.getElementById("logoutBtn");
  
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logoutStaffUser);
    }
  }
  
  
  /* =========================================================
     2. START APPLICATION
  
     This starts the dashboard once the browser has loaded this file.
     ========================================================= */
  
  initializeAdminDashboard();
* =========================================================
   ADMIN WORKSPACE SHELL
   File: js/admin-workspace-shell.js

   Sprint 6.4.1 Enterprise Cleanup:
   - Reusable workspace open/close system
   - Keeps workspace from appearing in unrelated modules
   - Supports future modules: Customers, Inventory, Mechanic Jobs,
     Invoices, Payments, Reports, Developer
   ========================================================= */

   let currentWorkspace = null;

   function getWorkspaceContainer() {
     return document.getElementById("workspaceContainer");
   }
   
   function openWorkspace(config) {
     const workspace = getWorkspaceContainer();
   
     if (!workspace) {
       alert("Workspace container is missing from admin.html.");
       return;
     }
   
     currentWorkspace = config.module || null;
   
     workspace.classList.remove("hidden");
   
     workspace.innerHTML = renderWorkspace({
       kicker: config.kicker || "Workspace",
       title: config.title || "Workspace",
       subtitle: config.subtitle || "",
       actions: config.actions || "",
       tabs: config.tabs || []
     });
   
     if (typeof bindWorkspaceTabs === "function") {
       bindWorkspaceTabs(workspace);
     }
   
     workspace.scrollIntoView({
       behavior: "smooth",
       block: "start"
     });
   }
   
   function closeWorkspace() {
     const workspace = getWorkspaceContainer();
   
     if (!workspace) return;
   
     workspace.innerHTML = "";
     workspace.classList.add("hidden");
     currentWorkspace = null;
   }
   
   function toggleWorkspace(config) {
     if (currentWorkspace === config.module) {
       closeWorkspace();
       return;
     }
   
     openWorkspace(config);
   }
   
   /*
     Future-ready workspace routing.
   
     Right now workspaceContainer is physically inside requestsSection.
     Later, when we move Customers, Inventory, Mechanic Jobs, Invoices,
     and Payments to workspaces, this shell can be upgraded into a
     global workspace router without changing every module.
   */
   function closeWorkspaceWhenLeavingRequests() {
     document.addEventListener("click", function (event) {
       const navButton = event.target.closest(".nav-btn");
   
       if (!navButton) return;
   
       const targetSection = navButton.getAttribute("data-section");
   
       if (targetSection !== "requestsSection") {
         closeWorkspace();
       }
     });
   }
   
   closeWorkspaceWhenLeavingRequests();
/* =========================================================
   ADMIN CORE UTILITIES
   File: js/admin-utils.js

   Purpose:
   Shared helper functions used across admin modules.

   Sprint 6.5.1:
   - Centralizes formatting helpers
   - Adds safe DOM helpers
   - Keeps auth-config.js unchanged for now
   ========================================================= */


/* =========================================================
   1. TEXT / HTML SAFETY
   ========================================================= */

   function escapeHtml(value) {
    if (value === null || value === undefined || value === "") return "";
  
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  
  function safeText(value, fallback = "Not provided") {
    const text = escapeHtml(value);
    return text || fallback;
  }
  
  
  /* =========================================================
     2. FORMATTERS
     ========================================================= */
  
  function money(value) {
    return "$" + Number(value || 0).toFixed(2);
  }
  
  function formatDate(value) {
    if (!value) return "Not provided";
  
    const date = new Date(value);
  
    if (Number.isNaN(date.getTime())) {
      return "Not provided";
    }
  
    return date.toLocaleString();
  }
  
  function formatRole(role) {
    if (typeof ROLE_LABELS !== "undefined" && ROLE_LABELS[role]) {
      return ROLE_LABELS[role];
    }
  
    if (!role) return "Staff";
  
    return String(role)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  
  
  /* =========================================================
     3. ROLE HELPERS
     ========================================================= */
  
  function hasFullAccess() {
    return (
      typeof currentProfile !== "undefined" &&
      currentProfile &&
      typeof FULL_ACCESS_ROLES !== "undefined" &&
      FULL_ACCESS_ROLES.includes(currentProfile.role)
    );
  }
  
  function isDeveloper() {
    return (
      typeof currentProfile !== "undefined" &&
      currentProfile &&
      currentProfile.role === "developer"
    );
  }
  
  function isUpperAdmin() {
    return (
      typeof currentProfile !== "undefined" &&
      currentProfile &&
      currentProfile.role === "upper_admin"
    );
  }
  
  function isReceptionist() {
    return (
      typeof currentProfile !== "undefined" &&
      currentProfile &&
      currentProfile.role === "receptionist"
    );
  }
  
  function isMechanic() {
    return (
      typeof currentProfile !== "undefined" &&
      currentProfile &&
      currentProfile.role === "mechanic"
    );
  }
  
  function canSaveRepairUpdate() {
    return (
      typeof currentProfile !== "undefined" &&
      currentProfile &&
      ["developer", "upper_admin", "mechanic", "receptionist"].includes(
        currentProfile.role
      )
    );
  }
  
  
  /* =========================================================
     4. DOM HELPERS
     ========================================================= */
  
  function getElement(id) {
    return document.getElementById(id);
  }
  
  function setTextIfExists(id, value) {
    const element = getElement(id);
  
    if (element) {
      element.textContent = value;
    }
  }
  
  function setHtmlIfExists(id, value) {
    const element = getElement(id);
  
    if (element) {
      element.innerHTML = value;
    }
  }
  
  function showElement(id) {
    const element = getElement(id);
  
    if (element) {
      element.classList.remove("hidden");
    }
  }
  
  function hideElement(id) {
    const element = getElement(id);
  
    if (element) {
      element.classList.add("hidden");
    }
  }
  
  function toggleElement(id, shouldShow) {
    const element = getElement(id);
  
    if (!element) return;
  
    element.classList.toggle("hidden", !shouldShow);
  }
  
  
  /* =========================================================
     5. SMALL GENERAL HELPERS
     ========================================================= */
  
  function shortText(value, maxLength = 80) {
    const text = String(value || "");
  
    if (text.length <= maxLength) return text;
  
    return text.slice(0, maxLength).trim() + "...";
  }
  
  function generateClientId(prefix = "id") {
    return ${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)};
  }
  
  function debounce(callback, delay = 300) {
    let timer = null;
  
    return function (...args) {
      clearTimeout(timer);
  
      timer = setTimeout(() => {
        callback.apply(this, args);
      }, delay);
    };
  }
/* =========================================================
   ADMIN REPAIR UPDATES MODULE
   File: js/admin-updates.js

   Purpose:
   Handles repair update history and service request progress notes.

   This file no longer creates job cards.
   Job-card creation now belongs to js/admin-job-cards.js.
   ========================================================= */

   let repairUpdatesByRequest = {};

   /* =========================================================
      1. LOAD REPAIR UPDATES
      ========================================================= */
   
   async function loadRepairUpdates() {
     repairUpdatesByRequest = {};
   
     if (!allRequests || allRequests.length === 0) return;
   
     const requestIds = allRequests.map((request) => request.id);
   
     const { data, error } = await supabaseClient
       .from("repair_updates")
       .select("id, service_request_id, title, message, visible_to_customer, created_at")
       .in("service_request_id", requestIds)
       .order("created_at", { ascending: false });
   
     if (error) {
       console.error("Could not load repair updates:", error.message);
       return;
     }
   
     (data || []).forEach((update) => {
       if (!repairUpdatesByRequest[update.service_request_id]) {
         repairUpdatesByRequest[update.service_request_id] = [];
       }
   
       repairUpdatesByRequest[update.service_request_id].push(update);
     });
   }
   
   /* =========================================================
      2. RENDER UPDATE HISTORY
      ========================================================= */
   
   function renderUpdateHistory(requestId) {
     const updates = repairUpdatesByRequest[requestId] || [];
   
     if (updates.length === 0) {
       return 
         <div class="card-notes">
           <strong>Update History:</strong>
           <p>No repair updates saved yet.</p>
         </div>
       ;
     }
   
     const items = updates.map((update) => {
       const visibility = update.visible_to_customer
         ? "Customer visible"
         : "Internal only";
   
       return 
         <div class="timeline-item">
           <strong>${safeText((update.title || "update").replaceAll("_", " "))}</strong>
           <small>${formatDate(update.created_at)} • ${visibility}</small>
           <p>${safeText(update.message)}</p>
         </div>
       ;
     }).join("");
   
     return 
       <div class="card-notes">
         <strong>Update History:</strong>
         <div class="timeline-list">
           ${items}
         </div>
       </div>
     ;
   }
   
   /* =========================================================
      3. RENDER REPAIR UPDATE FORM
      ========================================================= */
   
   function renderRepairUpdateForm(request, status, priority) {
     return 
       <div class="action-row repair-update-box">
         <label>
           Status
           <select class="status-select" data-id="${request.id}">
             <option value="new" ${status === "new" ? "selected" : ""}>New</option>
             <option value="acknowledged" ${status === "acknowledged" ? "selected" : ""}>Acknowledged</option>
             <option value="diagnosing" ${status === "diagnosing" ? "selected" : ""}>Diagnosing</option>
             <option value="waiting_parts" ${status === "waiting_parts" ? "selected" : ""}>Waiting Parts</option>
             <option value="repairing" ${status === "repairing" ? "selected" : ""}>Repairing</option>
             <option value="ready_for_pickup" ${status === "ready_for_pickup" ? "selected" : ""}>Ready for Pickup</option>
             <option value="closed" ${status === "closed" ? "selected" : ""}>Closed</option>
             <option value="cancelled" ${status === "cancelled" ? "selected" : ""}>Cancelled</option>
           </select>
         </label>
   
         ${hasFullAccess() ? 
           <label>
             Priority
             <select class="priority-select" data-id="${request.id}">
               <option value="low" ${priority === "low" ? "selected" : ""}>Low</option>
               <option value="normal" ${priority === "normal" ? "selected" : ""}>Normal</option>
               <option value="high" ${priority === "high" ? "selected" : ""}>High</option>
               <option value="urgent" ${priority === "urgent" ? "selected" : ""}>Urgent</option>
             </select>
           </label>
   
           <label>
             Estimated Cost
             <input class="estimated-cost-input" data-id="${request.id}" type="number" min="0" step="0.01" value="${Number(request.estimated_cost || 0)}">
           </label>
   
           <label>
             Final Cost
             <input class="final-cost-input" data-id="${request.id}" type="number" min="0" step="0.01" value="${Number(request.final_cost || 0)}">
           </label>
          : ""}
   
         <label class="wide-field">
           Repair Update
           <textarea class="repair-update-input" data-id="${request.id}" placeholder="Example: Mechanic has started checking the issue."></textarea>
         </label>
   
         <label class="checkbox-line">
           <input type="checkbox" class="internal-only-checkbox" data-id="${request.id}">
           Internal note only
         </label>
   
         <button class="save-repair-update-btn" data-id="${request.id}">
           Save Update
         </button>
       </div>
     ;
   }
   
   /* =========================================================
      4. SAVE REPAIR UPDATE
      ========================================================= */
   
   async function saveRepairUpdate(requestId, button) {
     const statusValue = document.querySelector(.status-select[data-id="${requestId}"]).value;
     const messageValue = document.querySelector(.repair-update-input[data-id="${requestId}"]).value.trim();
     const internalOnly = document.querySelector(.internal-only-checkbox[data-id="${requestId}"]).checked;
   
     if (!messageValue) {
       alert("Please write a repair update before saving.");
       return;
     }
   
     button.disabled = true;
     button.textContent = "Saving...";
   
     if (hasFullAccess()) {
       const priorityValue = document.querySelector(.priority-select[data-id="${requestId}"]).value;
       const estimatedCostValue = document.querySelector(.estimated-cost-input[data-id="${requestId}"]).value;
       const finalCostValue = document.querySelector(.final-cost-input[data-id="${requestId}"]).value;
   
       const { error: requestUpdateError } = await supabaseClient
         .from("service_requests")
         .update({
           priority: priorityValue,
           estimated_cost: Number(estimatedCostValue || 0),
           final_cost: Number(finalCostValue || 0)
         })
         .eq("id", requestId);
   
       if (requestUpdateError) {
         alert("Could not update costs/priority: " + requestUpdateError.message);
         button.disabled = false;
         button.textContent = "Save Update";
         return;
       }
     }
   
     const { error } = await supabaseClient.rpc("save_repair_update", {
       p_service_request_id: Number(requestId),
       p_status: statusValue,
       p_message: messageValue,
       p_internal_only: internalOnly
     });
   
     if (error) {
       alert("Could not save update: " + error.message);
     } else {
       alert("Repair update saved successfully.");
       await loadServiceRequests();
     }
   
     button.disabled = false;
     button.textContent = "Save Update";
   }
   
   /* =========================================================
      5. BUTTON BINDINGS
      ========================================================= */
   
   function bindRepairUpdateButtons() {
     document.querySelectorAll(".save-repair-update-btn").forEach((button) => {
       button.addEventListener("click", async function () {
         await saveRepairUpdate(button.getAttribute("data-id"), button);
       });
     });
   }/* =========================================================
   ADMIN JOB CARDS MODULE
   File: js/admin-job-cards.js

   Purpose:
   Handles job-card lookup and job-card creation.

   Business separation:
   - Service Request = intake/customer request
   - Job Card = workshop repair job

   New workflow:
   - If no job card exists, show "Create Mechanic Job Card".
   - If a job card already exists, show confirmation AND allow
     "Create Additional Job Card" for extra problems discovered later.
   ========================================================= */

   let jobCardsByRequest = {};

   /* =========================================================
      1. LOAD JOB CARDS FOR CURRENT REQUESTS
      Operation:
      Groups job cards by service_request_id.
      A service request may now have more than one job card.
      ========================================================= */
   
   async function loadJobCardsForRequests() {
     jobCardsByRequest = {};
   
     if (!Array.isArray(allRequests) || allRequests.length === 0) return;
   
     const requestIds = allRequests.map((request) => request.id);
   
     const { data, error } = await supabaseClient
       .from("job_cards")
       .select(
         id,
         service_request_id,
         vehicle_id,
         job_status,
         assigned_mechanic,
         repair_bay,
         appointment_date,
         estimated_completion
       )
       .in("service_request_id", requestIds)
       .order("id", { ascending: false });
   
     if (error) {
       console.error("Could not load job cards:", error.message);
       return;
     }
   
     (data || []).forEach((job) => {
       if (!jobCardsByRequest[job.service_request_id]) {
         jobCardsByRequest[job.service_request_id] = [];
       }
   
       jobCardsByRequest[job.service_request_id].push(job);
     });
   }
   
   /* =========================================================
      2. RENDER CREATE JOB CARD BOX
      Operation:
      Shows first-job form if no job exists.
      Shows existing job summary plus additional-job form if jobs exist.
      ========================================================= */
   
   function renderCreateJobCardBox(request) {
     const existingJobs = jobCardsByRequest[request.id] || [];
   
     if (existingJobs.length > 0) {
       const jobList = existingJobs.map((job) => {
         return 
           <li>
             <strong>JOB-${job.id}</strong>
             <span>Status: ${safeText(job.job_status || "created")}</span>
           </li>
         ;
       }).join("");
   
       return 
         <div class="existing-job-card-box">
           <strong>Mechanic Job Card Created</strong>
   
           <p>
             This service request already has ${existingJobs.length} mechanic job card(s).
             Create another job card only when the same vehicle needs a separate repair issue handled.
           </p>
   
           <ul class="existing-job-list">
             ${jobList}
           </ul>
   
           <button class="show-additional-job-btn" data-id="${request.id}">
             Create Additional Job Card
           </button>
   
           <div class="additional-job-form hidden" id="additionalJobForm-${request.id}">
             ${renderJobCardFormFields(request, "additional")}
           </div>
         </div>
       ;
     }
   
     return 
       <div class="create-job-box">
         <div>
           <strong>Create Mechanic Job Card</strong>
           <p>
             Convert this customer service request into an active workshop job.
             This keeps intake separate from mechanic operations.
           </p>
         </div>
   
         ${renderJobCardFormFields(request, "first")}
       </div>
     ;
   }
   
   /* =========================================================
      3. RENDER SHARED JOB CARD FORM FIELDS
      Operation:
      Used for first job cards and additional job cards.
      ========================================================= */
   
   function renderJobCardFormFields(request, mode) {
     const buttonText = mode === "additional"
       ? "Create Additional Job Card"
       : "Create Job Card";
   
     return 
       <div class="create-job-grid">
         <label>
           Assigned Mechanic
           <input
             class="job-mechanic-input"
             data-id="${request.id}"
             data-mode="${mode}"
             type="text"
             placeholder="Example: John, Tunde, Shop Team"
           >
         </label>
   
         <label>
           Repair Bay
           <input
             class="job-bay-input"
             data-id="${request.id}"
             data-mode="${mode}"
             type="text"
             placeholder="Example: Bay 1"
           >
         </label>
   
         <label>
           Appointment Date
           <input
             class="job-appointment-input"
             data-id="${request.id}"
             data-mode="${mode}"
             type="datetime-local"
           >
         </label>
   
         <label>
           Estimated Completion
           <input
             class="job-completion-input"
             data-id="${request.id}"
             data-mode="${mode}"
             type="datetime-local"
           >
         </label>
       </div>
   
       <button
         class="create-job-card-btn"
         data-id="${request.id}"
         data-mode="${mode}"
       >
         ${buttonText}
       </button>
     ;
   }
   
   /* =========================================================
      4. CREATE JOB CARD
      Operation:
      Creates a workshop job card from a service request.
      Additional job cards are allowed only when the user clicks
      "Create Additional Job Card".
      ========================================================= */
   
   async function createJobCardFromRequest(requestId, mode, button) {
     const request = allRequests.find((item) => {
       return String(item.id) === String(requestId);
     });
   
     if (!request) {
       alert("Could not find this service request.");
       return;
     }
   
     const existingJobs = jobCardsByRequest[request.id] || [];
   
     if (existingJobs.length > 0 && mode !== "additional") {
       alert("A mechanic job card already exists. Use Create Additional Job Card if this is a separate repair issue.");
       return;
     }
   
     const confirmMessage = existingJobs.length > 0
       ? "Create another job card for this same service request?"
       : "Create mechanic job card for this service request?";
   
     if (!confirm(confirmMessage)) return;
   
     button.disabled = true;
     button.textContent = "Creating Job...";
   
     const assignedMechanic =
       document.querySelector(.job-mechanic-input[data-id="${requestId}"][data-mode="${mode}"])?.value.trim() || "";
   
     const repairBay =
       document.querySelector(.job-bay-input[data-id="${requestId}"][data-mode="${mode}"])?.value.trim() || "";
   
     const appointmentDate =
       document.querySelector(.job-appointment-input[data-id="${requestId}"][data-mode="${mode}"])?.value || null;
   
     const estimatedCompletion =
       document.querySelector(.job-completion-input[data-id="${requestId}"][data-mode="${mode}"])?.value || null;
   
     const jobPayload = {
       service_request_id: Number(request.id),
       vehicle_id: request.vehicle_id || null,
   
       customer_name: request.name || null,
       customer_email: request.email || null,
       customer_phone: request.phone || null,
   
       vehicle: request.vehicle || null,
       complaint: request.message || null,
   
       job_status: "created",
       assigned_mechanic: assignedMechanic || null,
       repair_bay: repairBay || null,
       appointment_date: appointmentDate,
       estimated_completion: estimatedCompletion,
   
       estimated_cost: Number(request.estimated_cost || 0),
       final_cost: Number(request.final_cost || 0),
   
       labor_notes: "",
       parts_notes: ""
     };
   
     const { error: jobError } = await supabaseClient
       .from("job_cards")
       .insert([jobPayload]);
   
     if (jobError) {
       alert("Could not create job card: " + jobError.message);
       button.disabled = false;
       button.textContent = mode === "additional" ? "Create Additional Job Card" : "Create Job Card";
       return;
     }
   
     await supabaseClient
       .from("service_requests")
       .update({ status: "acknowledged" })
       .eq("id", request.id);
   
     alert("Job card created successfully.");
   
     button.disabled = false;
     button.textContent = mode === "additional" ? "Create Additional Job Card" : "Create Job Card";
   
     await loadServiceRequests();
   
     if (typeof loadMechanicBoard === "function") {
       await loadMechanicBoard();
     }
   }
   
   /* =========================================================
      5. BUTTON BINDINGS
      Operation:
      Connects Create Job Card and Create Additional Job Card buttons.
      ========================================================= */
   
   function bindCreateJobButtons() {
     document.querySelectorAll(".show-additional-job-btn").forEach((button) => {
       button.addEventListener("click", function () {
         const requestId = button.getAttribute("data-id");
         const form = document.getElementById(additionalJobForm-${requestId});
   
         if (form) {
           form.classList.toggle("hidden");
         }
       });
     });
   
     document.querySelectorAll(".create-job-card-btn").forEach((button) => {
       button.addEventListener("click", async function () {
         const requestId = button.getAttribute("data-id");
         const mode = button.getAttribute("data-mode") || "first";
   
         await createJobCardFromRequest(requestId, mode, button);
       });
     });
   }/* =========================================================
   ADMIN SIMPLE INVOICE / JOB BILL MODULE
   File: js/admin-invoices.js

   Purpose:
   Displays simple job bills for Go East Mechanics.

   Business rule:
   Payments are external/manual. This module does not process payment.
   It reads invoice records and payment records, then calculates:
   - Total
   - Paid
   - Balance
   - Payment status
   ========================================================= */

   let adminInvoiceRecords = [];
   let adminInvoicePayments = [];
   
   const invoicesList = document.getElementById("invoicesList");
   
   
   /* =========================================================
      1. LOAD ADMIN INVOICES + PAYMENTS
      ========================================================= */
   
   async function loadAdminInvoices() {
     if (!invoicesList) return;
   
     invoicesList.innerHTML = <p class="empty-message">Loading invoices...</p>;
   
     if (!hasFullAccess()) {
       invoicesList.innerHTML = 
         <p class="empty-message">
           Invoice module is reserved for Developer and Upper Admin access.
         </p>
       ;
       return;
     }
   
     const { data: invoiceData, error: invoiceError } = await supabaseClient
       .from("invoices")
       .select("*")
       .order("invoice_date", { ascending: false });
   
     if (invoiceError) {
       invoicesList.innerHTML = 
         <p class="empty-message">
           Could not load invoices: ${escapeHtml(invoiceError.message)}
         </p>
       ;
       return;
     }
   
     const { data: paymentData, error: paymentError } = await supabaseClient
       .from("payments")
       .select("*")
       .order("payment_date", { ascending: false });
   
     if (paymentError) {
       invoicesList.innerHTML = 
         <p class="empty-message">
           Could not load payments for invoices: ${escapeHtml(paymentError.message)}
         </p>
       ;
       return;
     }
   
     adminInvoiceRecords = invoiceData || [];
     adminInvoicePayments = paymentData || [];
   
     renderAdminInvoices();
   }
   
   
   /* =========================================================
      2. RENDER ADMIN INVOICES
      ========================================================= */
   
   function renderAdminInvoices() {
     if (!invoicesList) return;
   
     if (adminInvoiceRecords.length === 0) {
       invoicesList.innerHTML = 
         <div class="module-card">
           <h3>No invoices yet</h3>
           <p>
             Invoices will appear here after a simple job bill is created from a
             service request.
           </p>
         </div>
       ;
       return;
     }
   
     invoicesList.innerHTML = "";
   
     adminInvoiceRecords.forEach((invoice) => {
       const relatedPayments = getPaymentsForInvoice(invoice.id);
       const totals = calculateInvoiceTotals(invoice, relatedPayments);
       const status = getAdminInvoicePaymentStatus(totals);
   
       const card = document.createElement("div");
       card.className = "request-card";
   
       card.innerHTML = 
         <div class="card-top">
           <div>
             <h3>${safeText(invoice.invoice_number, "Invoice")}</h3>
             <p>${safeText(invoice.customer_name, "Customer")} • ${safeText(invoice.vehicle, "Vehicle")}</p>
           </div>
   
           <span class="status-badge status-${escapeHtml(status.key)}">
             ${safeText(status.label)}
           </span>
         </div>
   
         <div class="card-grid">
           <p><strong>Customer</strong><br>${safeText(invoice.customer_name, "-")}</p>
           <p><strong>Email</strong><br>${safeText(invoice.customer_email, "-")}</p>
           <p><strong>Phone</strong><br>${safeText(invoice.customer_phone, "-")}</p>
           <p><strong>Vehicle</strong><br>${safeText(invoice.vehicle, "-")}</p>
           <p><strong>Invoice Date</strong><br>${formatDate(invoice.invoice_date || invoice.created_at)}</p>
           <p><strong>Invoice Status</strong><br>${safeText(invoice.invoice_status, "-")}</p>
         </div>
   
         <div class="card-grid">
           <p><strong>Estimated Cost</strong><br>${money(invoice.subtotal)}</p>
           <p><strong>Tax</strong><br>${money(invoice.tax)}</p>
           <p><strong>Discount</strong><br>${money(invoice.discount)}</p>
           <p><strong>Final Amount</strong><br>${money(totals.total)}</p>
           <p><strong>Amount Paid</strong><br>${money(totals.amountPaid)}</p>
           <p><strong>Balance</strong><br>${money(totals.balance)}</p>
         </div>
   
         <div class="card-notes">
           <strong>Payment History</strong>
           ${renderInvoicePaymentHistory(relatedPayments)}
         </div>
   
         <div class="card-notes">
           <strong>Invoice / Job Bill Notes</strong>
           <p>${safeText(invoice.notes, "No invoice notes recorded.")}</p>
         </div>
       ;
   
       invoicesList.appendChild(card);
     });
   }
   
   
   /* =========================================================
      3. PAYMENT HELPERS
      ========================================================= */
   
   function getPaymentsForInvoice(invoiceId) {
     return adminInvoicePayments.filter((payment) => {
       return Number(payment.invoice_id) === Number(invoiceId);
     });
   }
   
   function calculateInvoiceTotals(invoice, relatedPayments) {
     const total = Number(invoice.total || invoice.final_cost || invoice.subtotal || 0);
   
     const amountPaid = relatedPayments.reduce((sum, payment) => {
       return sum + Number(payment.amount || 0);
     }, 0);
   
     const balance = Math.max(total - amountPaid, 0);
   
     return {
       total,
       amountPaid,
       balance
     };
   }
   
   function getAdminInvoicePaymentStatus(totals) {
     if (totals.total > 0 && totals.amountPaid >= totals.total && totals.balance <= 0) {
       return {
         key: "paid_in_full",
         label: "Paid in Full"
       };
     }
   
     if (totals.amountPaid > 0 && totals.balance > 0) {
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
   
   function renderInvoicePaymentHistory(relatedPayments) {
     if (relatedPayments.length === 0) {
       return <p>No payments recorded yet.</p>;
     }
   
     return 
       <div class="timeline-list">
         ${relatedPayments.map((payment) => 
           <div class="timeline-item">
             <strong>${money(payment.amount)} • ${safeText(payment.payment_method, "Payment")}</strong>
             <small>${formatDate(payment.payment_date || payment.paid_at || payment.created_at)}</small>
             <p>
               Reference: ${safeText(payment.reference_number, "-")}<br>
               Notes: ${safeText(payment.notes, "No notes")}
             </p>
           </div>
         ).join("")}
       </div>
     ;
   }/* =========================================================
   ADMIN INVENTORY UTILITIES
   File: js/admin-inventory-utils.js

   Purpose:
   Shared helper functions for the enterprise inventory system.

   Used by:
   - admin-inventory-items.js
   - admin-inventory-transactions.js
   - admin-inventory-history.js
   - admin-inventory-receiving.js
   - admin-inventory-adjustments.js
   - admin-inventory-bulk.js
   ========================================================= */

   function canManageInventory() {
    return (
      currentProfile &&
      ["developer", "upper_admin"].includes(currentProfile.role)
    );
  }
  
  function canDeleteInventoryItem() {
    return currentProfile && currentProfile.role === "developer";
  }
  
  function inventoryNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }
  
  function inventoryQuantityLabel(quantity, reorderLevel, isActive = true) {
    if (!isActive) return "Inactive";
    if (quantity <= 0) return "Out of Stock";
    if (quantity <= reorderLevel) return "Low Stock";
    return "In Stock";
  }
  
  function inventoryStatusClass(quantity, reorderLevel, isActive = true) {
    if (!isActive) return "status-cancelled";
    if (quantity <= 0) return "status-cancelled";
    if (quantity <= reorderLevel) return "status-waiting_parts";
    return "status-closed";
  }
  
  function inventoryFormatTransactionType(type) {
    if (!type) return "Transaction";
  
    return String(type)
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  
  function inventorySignedQuantity(value) {
    const number = inventoryNumber(value);
  
    if (number > 0) return +${number};
    return String(number);
  }
  
  function inventorySafeId(value) {
    return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "");
  }/* =========================================================
   ADMIN INVENTORY ADJUSTMENTS MODULE
   File: js/admin-inventory-adjustments.js
========================================================= */

let adjustingInventoryItemId = null;

function openInventoryAdjustmentModal(item) {
  if (!item) {
    alert("Inventory item could not be found.");
    return;
  }

  if (typeof openAdminModal !== "function") {
    alert("Modal framework not loaded.");
    return;
  }

  adjustingInventoryItemId = item.id;

  openAdminModal({
    title: "Adjust Stock",
    subtitle: ${safeText(item.item_name, "Inventory Item")} • Current Qty: ${safeText(item.quantity, "0")},
    content: 
      <form id="inventoryAdjustmentModalForm" class="admin-modal-form">
        <label>
          Current Quantity
          <input id="adjustmentCurrentQuantity" type="number" value="${Number(item.quantity || 0)}" disabled>
        </label>

        <label>
          New Counted Quantity
          <input id="adjustmentNewQuantity" type="number" min="0" step="1" required>
        </label>

        <label>
          Reason
          <select id="adjustmentReason">
            <option value="CYCLE_COUNT">Cycle Count Correction</option>
            <option value="FOUND_STOCK">Found Extra Stock</option>
            <option value="MISSING_STOCK">Missing Stock</option>
            <option value="DAMAGED_STOCK">Damaged Stock</option>
            <option value="DATA_CORRECTION">Data Correction</option>
            <option value="MANUAL_ADJUSTMENT">Manual Adjustment</option>
          </select>
        </label>

        <label class="full-span">
          Adjustment Notes
          <textarea id="adjustmentNotes" placeholder="Explain why this adjustment is needed."></textarea>
        </label>
      </form>
    ,
    footer: 
      <button type="button" class="secondary-action-btn" onclick="closeAdminModal()">Cancel</button>
      <button type="button" class="primary-action-btn" onclick="submitInventoryAdjustmentFromModal()">Save Adjustment</button>
    
  });
}

async function submitInventoryAdjustmentFromModal() {
  if (!adjustingInventoryItemId) {
    if (typeof showToast === "function") {
      showToast(
        "warning",
        "No Item Selected",
        "Select an inventory item before adjusting stock."
      );
    }

    return;
  }

  const quantityInput = document.getElementById(
    "adjustmentNewQuantity"
  );

  const reasonInput = document.getElementById(
    "adjustmentReason"
  );

  const notesInput = document.getElementById(
    "adjustmentNotes"
  );

  if (!quantityInput || !reasonInput || !notesInput) {
    if (typeof showToast === "function") {
      showToast(
        "error",
        "Adjustment Form Error",
        "One or more adjustment form fields could not be found."
      );
    }

    return;
  }

  const newQuantity = inventoryNumber(quantityInput.value);

  if (newQuantity < 0) {
    if (typeof showToast === "function") {
      showToast(
        "warning",
        "Invalid Quantity",
        "The new inventory quantity cannot be negative."
      );
    }

    quantityInput.focus();
    return;
  }

  const reason = reasonInput.value;
  const notes = notesInput.value.trim();

  const submitButton = document.querySelector(
    "#adminModalBox .primary-action-btn"
  );

  const originalButtonText = submitButton
    ? submitButton.textContent
    : "Save Adjustment";

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Adjusting...";
  }

  try {
    const result = await adjustInventoryStock(
      adjustingInventoryItemId,
      newQuantity,
      {
        reference_type:
          reason || "MANUAL_ADJUSTMENT",

        notes:
          notes ||
          Manual inventory adjustment. Reason: ${
            reason || "Not specified"
          }
      }
    );

    if (!result.success) {
      if (typeof showToast === "function") {
        showToast(
          "error",
          "Adjustment Failed",
          result.message ||
            "The inventory quantity could not be adjusted."
        );
      }

      return;
    }

    adjustingInventoryItemId = null;

    if (typeof closeAdminModal === "function") {
      closeAdminModal();
    }

    if (typeof showToast === "function") {
      showToast(
        "success",
        "Stock Adjusted",
        Inventory quantity was updated to ${newQuantity}.
      );
    }

    if (typeof loadInventoryItems === "function") {
      await loadInventoryItems();
    }
  } catch (error) {
    console.error("Inventory adjustment error:", error);

    if (typeof showToast === "function") {
      showToast(
        "error",
        "Adjustment Failed",
        error?.message ||
          "An unexpected error occurred while adjusting inventory."
      );
    }
  } finally {
    if (
      submitButton &&
      document.body.contains(submitButton)
    ) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  }
}

/* Legacy support */
function openInventoryAdjustmentForm(itemId) {
  const item = inventoryItems.find((record) => String(record.id) === String(itemId));

  if (!item) {
    alert("Inventory item could not be found.");
    return;
  }

  openInventoryAdjustmentModal(item);
}

function closeInventoryAdjustmentForm() {
  adjustingInventoryItemId = null;

  if (typeof closeAdminModal === "function") {
    closeAdminModal();
  }
}

async function submitInventoryAdjustment(event) {
  event.preventDefault();
  await submitInventoryAdjustmentFromModal();
}

function bindInventoryAdjustmentButtons() {
  document.querySelectorAll(".adjust-stock-btn").forEach((button) => {
    button.addEventListener("click", function () {
      openInventoryAdjustmentForm(button.getAttribute("data-id"));
    });
  });
}

window.openInventoryAdjustmentModal = openInventoryAdjustmentModal;
window.openInventoryAdjustmentForm = openInventoryAdjustmentForm;
window.closeInventoryAdjustmentForm = closeInventoryAdjustmentForm;
window.submitInventoryAdjustmentFromModal = submitInventoryAdjustmentFromModal;
window.submitInventoryAdjustment = submitInventoryAdjustment;
window.bindInventoryAdjustmentButtons = bindInventoryAdjustmentButtons;/* =========================================================
   ADMIN DASHBOARD MODULE
   File: js/admin-dashboard.js

   Purpose:
   - Shows logged-in staff profile
   - Updates sidebar role badge
   - Controls admin section navigation
   - Updates dashboard statistics

   This file is defensive:
   Missing HTML elements will not break the whole dashboard.
   ========================================================= */


/* =========================================================
   1. SAFE TEXT HELPERS
   ========================================================= */

   function setTextIfExists(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }
  
  function setTextBySelector(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  }
  
  function formatAdminRole(role) {
    if (!role) return "Staff";
  
    return role
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  
  
  /* =========================================================
     2. ADMIN PROFILE UI
     Operation:
     Replaces "Checking access..." with actual profile details.
     ========================================================= */
  
  function applyAdminProfileUI() {
    if (!currentUser || !currentProfile) return;
  
    const displayName = currentProfile.full_name || currentUser.email || "Staff User";
    const email = currentProfile.email || currentUser.email || "";
    const role = formatAdminRole(currentProfile.role);
  
    const initials = displayName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  
    setTextIfExists("adminName", displayName);
    setTextIfExists("adminEmail", email);
    setTextIfExists("adminRoleBadge", role);
    setTextIfExists("adminInitials", initials);
  
    setTextBySelector(".profile-card strong", displayName);
    setTextBySelector(".profile-card span", ${email} • ${role});
    setTextBySelector(".profile-avatar", initials);
  
    const sidebarBadge =
      document.querySelector(".sidebar .role-badge") ||
      document.querySelector(".sidebar-badge") ||
      document.querySelector(".sidebar-role");
  
    if (sidebarBadge) {
      sidebarBadge.textContent = role.toUpperCase();
    }
  
    const topLabel = document.querySelector(".admin-topbar .top-label");
    if (topLabel) {
      topLabel.textContent = role.toUpperCase();
    }
  }
  
  
  /* =========================================================
     3. ROLE UI
     Operation:
     Hides elements the current role should not access.
     ========================================================= */
  
  function applyRoleUI() {
    if (!currentProfile) return;
  
    document.querySelectorAll("[data-roles]").forEach((element) => {
      const allowedRoles = element.dataset.roles
        .split(",")
        .map((role) => role.trim());
  
      element.style.display = allowedRoles.includes(currentProfile.role) ? "" : "none";
    });
  }
  
  
  /* =========================================================
     4. SECTION NAVIGATION
     Operation:
     Sidebar buttons open the matching dashboard section.
     ========================================================= */
  
  function showAdminSection(sectionId) {
    document.querySelectorAll(".admin-section").forEach((section) => {
      section.classList.remove("active-section");
    });
  
    document.querySelectorAll(".nav-btn").forEach((button) => {
      button.classList.remove("active");
    });
  
    const section = document.getElementById(sectionId);
    const button = document.querySelector(.nav-btn[data-section="${sectionId}"]);
  
    if (section) section.classList.add("active-section");
    if (button) button.classList.add("active");
  }
  
  function showFirstAllowedSection() {
    const buttons = Array.from(document.querySelectorAll(".nav-btn"))
      .filter((button) => button.style.display !== "none");
  
    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        showAdminSection(button.dataset.section);
      });
    });
  
    const firstButton = buttons[0];
  
    if (firstButton && firstButton.dataset.section) {
      showAdminSection(firstButton.dataset.section);
    }
  }
  
  
  /* =========================================================
     5. DASHBOARD STATS
     Operation:
     Reads allRequests from admin-requests.js.
     ========================================================= */
  
  function updateDashboardStats() {
    const requests = Array.isArray(allRequests) ? allRequests : [];
  
    const total = requests.length;
  
    const newCount = requests.filter((request) => {
      return (request.status || "new") === "new";
    }).length;
  
    const acknowledged = requests.filter((request) => {
      return (request.status || "") === "acknowledged";
    }).length;
  
    const active = requests.filter((request) => {
      const status = request.status || "new";
      return !["closed", "cancelled", "ready_for_pickup"].includes(status);
    }).length;
  
    const readyClosed = requests.filter((request) => {
      const status = request.status || "";
      return ["ready_for_pickup", "closed"].includes(status);
    }).length;
  
    const cancelled = requests.filter((request) => {
      return (request.status || "") === "cancelled";
    }).length;
  
    setTextIfExists("totalRequests", total);
    setTextIfExists("newRequests", newCount);
    setTextIfExists("acknowledgedRequests", acknowledged);
    setTextIfExists("activeJobs", active);
    setTextIfExists("readyClosed", readyClosed);
    setTextIfExists("cancelledRequests", cancelled);
  }
  
  
  /* =========================================================
     6. INVENTORY STATS
     Operation:
     Safely loads inventory totals for dashboard cards.
     ========================================================= */
  
  async function loadDashboardStats() {
    updateDashboardStats();
  
    if (typeof supabaseClient === "undefined") return;
  
    const { data, error } = await supabaseClient
      .from("inventory_items")
      .select("id, quantity, low_stock_limit");
  
    if (error) {
      setTextIfExists("inventoryItems", "—");
      setTextIfExists("lowStockItems", "—");
      setTextIfExists("paymentMode", "Manual");
      return;
    }
  
    const items = data || [];
  
    const lowStock = items.filter((item) => {
      return Number(item.quantity || 0) <= Number(item.low_stock_limit || 0);
    }).length;
  
    setTextIfExists("inventoryItems", items.length);
    setTextIfExists("lowStockItems", lowStock);
    setTextIfExists("paymentMode", "Manual");
  }/* =========================================================
   ADMIN AUTH MODULE
   File: js/admin-auth.js

   Purpose:
   This file handles staff authentication and authorization.

   Responsibilities:
   - Check whether a user is logged in.
   - Load the logged-in user's profile.
   - Confirm the user has a staff role.
   - Store the active user/profile for other admin modules.
   - Provide role helper functions for the dashboard.
   - Handle logout.

   This file does NOT:
   - Render service request cards.
   - Save repair updates.
   - Calculate dashboard statistics.
   ========================================================= */


/* =========================================================
   1. SHARED ADMIN STATE

   These variables are global on purpose because the admin modules
   are loaded as normal browser scripts, not ES modules.

   Other files will use:
   - currentUser
   - currentProfile
   ========================================================= */

   let currentUser = null;
   let currentProfile = null;
   
   
   /* =========================================================
      2. ROLE HELPER FUNCTIONS
   
      These functions keep role checks readable across the dashboard.
   
      Example:
      Instead of writing:
      currentProfile.role === "developer"
   
      Other modules can call:
      isDeveloper()
      ========================================================= */
   
   function hasFullAccess() {
     return currentProfile && FULL_ACCESS_ROLES.includes(currentProfile.role);
   }
   
   function isDeveloper() {
     return currentProfile && currentProfile.role === ROLES.DEVELOPER;
   }
   
   function isUpperAdmin() {
     return currentProfile && currentProfile.role === ROLES.UPPER_ADMIN;
   }
   
   function isReceptionist() {
     return currentProfile && currentProfile.role === ROLES.RECEPTIONIST;
   }
   
   function isMechanic() {
     return currentProfile && currentProfile.role === ROLES.MECHANIC;
   }
   
   function canSaveRepairUpdate() {
     return (
       currentProfile &&
       ["developer", "upper_admin", "mechanic", "receptionist"].includes(currentProfile.role)
     );
   }
   
   function roleAllowsElement(element) {
     if (!currentProfile || !element.dataset.roles) return true;
   
     return element.dataset.roles
       .split(",")
       .map((role) => role.trim())
       .includes(currentProfile.role);
   }
   
   
   /* =========================================================
      3. STAFF ACCESS CHECK
   
      This function is called by admin.js when the dashboard starts.
   
      Flow:
      1. Get current Supabase session.
      2. Redirect to login if no session exists.
      3. Load profile from public.profiles.
      4. Confirm profile role is a staff role.
      5. Save user/profile into shared state.
      6. Return true if authorized.
      ========================================================= */
   
   async function checkStaffAccess() {
     const { data: sessionData, error: sessionError } =
       await supabaseClient.auth.getSession();
   
     if (sessionError || !sessionData.session) {
       window.location.href = "login.html";
       return false;
     }
   
     currentUser = sessionData.session.user;
   
     const { data: profile, error: profileError } = await supabaseClient
       .from("profiles")
       .select("id, email, full_name, role")
       .eq("id", currentUser.id)
       .single();
   
     if (profileError || !profile || !STAFF_ROLES.includes(profile.role)) {
       alert("Access denied. Staff only.");
       window.location.href = "customer.html";
       return false;
     }
   
     currentProfile = profile;
     return true;
   }
   
   
   /* =========================================================
      4. LOGOUT
   
      This signs the current staff user out of Supabase Auth and
      returns them to the login page.
      ========================================================= */
   
   async function logoutStaffUser() {
     await supabaseClient.auth.signOut();
     window.location.href = "login.html";
   }/* =========================================================
   ADMIN ENTERPRISE COMPONENT LIBRARY
   File: js/ui/admin-components.js
========================================================= */

function renderBreadcrumbs(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "";

  return 
    <div class="admin-breadcrumbs">
      ${items.map((item, index) => {
        const isLast = index === items.length - 1;

        return 
          ${isLast
            ? <strong>${safeText(item.label)}</strong>
            : <span>${safeText(item.label)}</span>
          }
          ${!isLast ? <span class="admin-breadcrumb-separator">›</span> : ""}
        ;
      }).join("")}
    </div>
  ;
}

function renderActionToolbar(config = {}) {
  return 
    <div class="admin-action-toolbar">
      <div class="admin-action-toolbar-left">
        ${config.title ? <span class="admin-action-toolbar-title">${safeText(config.title)}</span> : ""}
        ${config.left || ""}
      </div>

      <div class="admin-action-toolbar-right">
        ${config.right || ""}
      </div>
    </div>
  ;
}

function ensureToastContainer() {
  let container = document.getElementById("adminToastContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "adminToastContainer";
    container.className = "admin-toast-container";
    document.body.appendChild(container);
  }

  return container;
}

function showToast(type = "success", title = "Success", message = "") {
  const container = ensureToastContainer();

  const toast = document.createElement("div");
  toast.className = admin-toast ${type};

  toast.innerHTML = 
    <strong>${safeText(title)}</strong>
    <p>${safeText(message)}</p>
  ;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4200);
}

function renderEmptyState(title = "No records found", message = "There is nothing to show yet.") {
  return 
    <div class="admin-empty-state">
      <strong>${safeText(title)}</strong>
      <p>${safeText(message)}</p>
    </div>
  ;
}

function renderLoadingState(message = "Loading...") {
  return 
    <div class="admin-loading-state">
      <div class="admin-loading-spinner"></div>
      <strong>${safeText(message)}</strong>
    </div>
  ;
}

function openSlidePanel(config = {}) {
  closeSlidePanel();

  const backdrop = document.createElement("div");
  backdrop.id = "adminSlidePanelBackdrop";
  backdrop.className = "admin-slide-backdrop";

  backdrop.innerHTML = 
    <aside class="admin-slide-panel">
      <div class="admin-slide-header">
        <div>
          <h3>${safeText(config.title || "Panel")}</h3>
          ${config.subtitle ? <p>${safeText(config.subtitle)}</p> : ""}
        </div>

        <button class="admin-slide-close" type="button" onclick="closeSlidePanel()">×</button>
      </div>

      <div class="admin-slide-body">
        ${config.content || ""}
      </div>
    </aside>
  ;

  document.body.appendChild(backdrop);
}

function closeSlidePanel() {
  const existing = document.getElementById("adminSlidePanelBackdrop");
  if (existing) existing.remove();
}

/* =========================================================
   MODAL FRAMEWORK
========================================================= */

function openAdminModal(config = {}) {
  closeAdminModal();

  const backdrop = document.createElement("div");
  backdrop.id = "adminModalBackdrop";
  backdrop.className = "admin-modal-backdrop";

  backdrop.innerHTML = 
    <div class="admin-modal-box" id="adminModalBox">
      <div class="admin-modal-header" id="adminModalDragHandle">
        <div>
          <h3>${safeText(config.title || "Modal")}</h3>
          ${config.subtitle ? <p>${safeText(config.subtitle)}</p> : ""}
        </div>

        <button class="admin-modal-close" type="button" onclick="closeAdminModal()">×</button>
      </div>

      <div class="admin-modal-body">
        ${config.content || ""}
      </div>

      ${config.footer ? 
        <div class="admin-modal-footer">
          ${config.footer}
        </div>
       : ""}
    </div>
  ;

  document.body.appendChild(backdrop);

  const modal = document.getElementById("adminModalBox");

  modal.style.position = "fixed";
  modal.style.width = config.width || "760px";
  modal.style.height = config.height || "650px";
  modal.style.left = "50%";
  modal.style.top = "50%";
  modal.style.transform = "translate(-50%, -50%)";

  enableAdminModalDrag();
}

function closeAdminModal() {
  const existing = document.getElementById("adminModalBackdrop");
  if (existing) existing.remove();
}

function enableAdminModalDrag() {
  const modal = document.getElementById("adminModalBox");
  const handle = document.getElementById("adminModalDragHandle");

  if (!modal || !handle) return;

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  handle.addEventListener("pointerdown", function (event) {
    if (event.target.closest("button, input, textarea, select, option")) return;

    dragging = true;

    const rect = modal.getBoundingClientRect();

    startX = event.clientX;
    startY = event.clientY;
    startLeft = rect.left;
    startTop = rect.top;

    modal.style.transform = "none";
    modal.style.left = ${startLeft}px;
    modal.style.top = ${startTop}px;

    modal.classList.add("is-dragging");
    document.body.style.userSelect = "none";

    handle.setPointerCapture(event.pointerId);

    event.preventDefault();
    event.stopPropagation();
  });

  handle.addEventListener("pointermove", function (event) {
    if (!dragging) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    const maxLeft = window.innerWidth - modal.offsetWidth - 12;
    const maxTop = window.innerHeight - modal.offsetHeight - 12;

    modal.style.left = ${Math.max(12, Math.min(startLeft + dx, maxLeft))}px;
    modal.style.top = ${Math.max(12, Math.min(startTop + dy, maxTop))}px;

    event.preventDefault();
  });

  handle.addEventListener("pointerup", function (event) {
    dragging = false;
    modal.classList.remove("is-dragging");
    document.body.style.userSelect = "";

    try {
      handle.releasePointerCapture(event.pointerId);
    } catch (error) {}
  });
}

/* =========================================================
   CONTEXT MENU
========================================================= */

function openContextMenu(event, actions = []) {
  event.preventDefault();
  closeContextMenu();

  const menu = document.createElement("div");
  menu.id = "adminContextMenu";
  menu.className = "admin-context-menu";

  menu.style.left = ${event.clientX}px;
  menu.style.top = ${event.clientY}px;

  menu.innerHTML = actions.map((action) => 
    <button
      type="button"
      class="${action.danger ? "danger" : ""}"
      onclick="${action.onClick}"
    >
      ${safeText(action.label)}
    </button>
  ).join("");

  document.body.appendChild(menu);
}

function closeContextMenu() {
  const existing = document.getElementById("adminContextMenu");
  if (existing) existing.remove();
}

document.addEventListener("click", function () {
  closeContextMenu();
});
/* =========================================================
   ADMIN TABS COMPONENT
   File: js/ui/admin-tabs.js

   Purpose:
   Reusable enterprise tab controller.

   Used by:
   - Service Requests
   - Mechanic Jobs
   - Customers
   - Inventory
   - Invoices
   - Payments
   - Future modules

   Sprint 6.5
   ========================================================= */


/* =========================================================
   ACTIVATE ONE TAB
   ========================================================= */

   function activateWorkspaceTab(workspaceElement, tabName) {
    if (!workspaceElement || !tabName) return;
  
    workspaceElement
      .querySelectorAll(".workspace-tab-btn")
      .forEach((button) => {
        button.classList.toggle(
          "active",
          button.dataset.tab === tabName
        );
      });
  
    workspaceElement
      .querySelectorAll(".workspace-panel")
      .forEach((panel) => {
        panel.classList.toggle(
          "active",
          panel.dataset.panel === tabName
        );
      });
  }
  
  
  /* =========================================================
     INITIALIZE FIRST TAB
     ========================================================= */
  
  function initializeWorkspaceTabs(workspaceElement) {
    if (!workspaceElement) return;
  
    const firstButton = workspaceElement.querySelector(".workspace-tab-btn");
  
    if (!firstButton) return;
  
    activateWorkspaceTab(
      workspaceElement,
      firstButton.dataset.tab
    );
  }
  
  
  /* =========================================================
     BIND TAB EVENTS
     ========================================================= */
  
  function bindWorkspaceTabs(scope = document) {
  
    scope.querySelectorAll(".workspace-body").forEach((workspaceBody) => {
  
      initializeWorkspaceTabs(workspaceBody);
  
      workspaceBody
        .querySelectorAll(".workspace-tab-btn")
        .forEach((button) => {
  
          if (button.dataset.bound === "true") return;
  
          button.dataset.bound = "true";
  
          button.addEventListener("click", function () {
  
            activateWorkspaceTab(
              workspaceBody,
              button.dataset.tab
            );
  
          });
  
        });
  
    });
  
  }

/* =========================================================
   ADMIN WORKSPACE COMPONENT
   File: js/ui/admin-workspace.js

   Purpose:
   Creates reusable enterprise workspace HTML.

   Pattern:
   Header
   Toolbar
   Body
   Tabs
   Panels

   Used by:
   - Service Requests
   - Mechanic Jobs
   - Customers
   - Inventory
   - Invoices
   - Payments
   ========================================================= */


   function renderWorkspaceHeader(config = {}) {
    return 
      <div class="workspace-header">
        <div>
          <p class="workspace-kicker">${safeText(config.kicker || "Workspace")}</p>
          <h2 class="workspace-title">${safeText(config.title || "Untitled Workspace")}</h2>
          <p class="workspace-subtitle">${safeText(config.subtitle || "")}</p>
        </div>
  
        <div class="workspace-actions">
          ${config.actions || ""}
        </div>
      </div>
    ;
  }
  
  
  function renderWorkspaceTabs(tabs = []) {
    if (!Array.isArray(tabs) || tabs.length === 0) return "";
  
    return 
      <div class="workspace-tabs">
        ${tabs.map((tab, index) => 
          <button
            type="button"
            class="workspace-tab-btn ${index === 0 ? "active" : ""}"
            data-tab="${safeText(tab.id)}"
          >
            ${safeText(tab.label)}
          </button>
        ).join("")}
      </div>
    ;
  }
  
  
  function renderWorkspacePanels(tabs = []) {
    if (!Array.isArray(tabs) || tabs.length === 0) {
      return 
        <div class="workspace-panel active">
          ${typeof renderEmptyState === "function"
            ? renderEmptyState("No workspace content", "This workspace does not have any panels yet.")
            : <p class="workspace-empty">No workspace content available.</p>
          }
        </div>
      ;
    }
  
    return tabs.map((tab, index) => 
      <div
        class="workspace-panel ${index === 0 ? "active" : ""}"
        data-panel="${safeText(tab.id)}"
      >
        ${tab.content || ""}
      </div>
    ).join("");
  }
  
  
  function renderWorkspace(config = {}) {
    const tabs = Array.isArray(config.tabs) ? config.tabs : [];
  
    return 
      <div class="workspace-shell">
        ${renderWorkspaceHeader(config)}
  
        ${config.toolbar ? 
          <div class="workspace-toolbar">
            ${config.toolbar}
          </div>
         : ""}
  
        <div class="workspace-body">
          ${renderWorkspaceTabs(tabs)}
          ${renderWorkspacePanels(tabs)}
        </div>
      </div>
    ;
  }
  
  
  function renderInfoCard(label, value) {
    return 
      <div class="workspace-info-card">
        <span>${safeText(label)}</span>
        <strong>${safeText(value, "-")}</strong>
      </div>
    ;
  }
  
  
  function renderInfoGrid(items = []) {
    if (!Array.isArray(items) || items.length === 0) {
      return typeof renderEmptyState === "function"
        ? renderEmptyState("No information available", "There are no details to display.")
        : <p class="workspace-empty">No information available.</p>;
    }
  
    return 
      <div class="workspace-info-grid">
        ${items.map((item) => renderInfoCard(item.label, item.value)).join("")}
      </div>
    ;
  }
/* =========================================================
   ADMIN INVENTORY BULK ACTIONS MODULE
   File: js/admin-inventory-bulk.js

   Purpose:
   Handles checkbox-based bulk actions for inventory records.

   Business Purpose:
   When inventory grows to hundreds or thousands of records,
   staff should not repeat actions one row at a time.

   Supported bulk actions:
   - Select all visible items
   - Clear selection
   - Bulk deactivate
   - Bulk restore
   - Bulk delete, Developer only

   Important:
   Edit remains one item at a time because every part has its own
   SKU, price, supplier, reorder level, quantity, and notes.
   ========================================================= */


/* =========================================================
   1. BULK SELECTION STATE
   ========================================================= */

   let selectedInventoryItemIds = new Set();


   /* =========================================================
      2. SELECTION HELPERS
      ========================================================= */
   
   function getSelectedInventoryIds() {
     return Array.from(selectedInventoryItemIds);
   }
   
   function clearInventorySelection() {
     selectedInventoryItemIds.clear();
   
     document.querySelectorAll(".inventory-row-checkbox").forEach((checkbox) => {
       checkbox.checked = false;
     });
   
     const selectAllCheckbox = document.getElementById("inventorySelectAllCheckbox");
   
     if (selectAllCheckbox) {
       selectAllCheckbox.checked = false;
     }
   
     updateInventoryBulkBar();
   }
   
   function toggleInventoryRowSelection(itemId, checked) {
     if (checked) {
       selectedInventoryItemIds.add(String(itemId));
     } else {
       selectedInventoryItemIds.delete(String(itemId));
     }
   
     updateInventoryBulkBar();
   }
   
   function toggleAllVisibleInventoryRows(checked) {
     document.querySelectorAll(".inventory-row-checkbox").forEach((checkbox) => {
       checkbox.checked = checked;
   
       const itemId = checkbox.getAttribute("data-id");
   
       if (checked) {
         selectedInventoryItemIds.add(String(itemId));
       } else {
         selectedInventoryItemIds.delete(String(itemId));
       }
     });
   
     updateInventoryBulkBar();
   }
   
   
   /* =========================================================
      3. BULK BAR UI
      ========================================================= */
   
   function renderInventoryBulkBar() {
     const selectedCount = selectedInventoryItemIds.size;
   
     return 
       <div class="inventory-bulk-bar ${selectedCount > 0 ? "active" : ""}">
         <div>
           <strong>${selectedCount}</strong> item(s) selected
         </div>
   
         <div class="inventory-bulk-actions">
           <button id="bulkClearInventorySelectionBtn" type="button">
             Clear
           </button>
   
           <button id="bulkDeactivateInventoryBtn" type="button">
             Deactivate
           </button>
   
           <button id="bulkRestoreInventoryBtn" type="button">
             Restore
           </button>
   
           ${
             typeof canDeleteInventoryItem === "function" && canDeleteInventoryItem()
               ? 
                 <button id="bulkDeleteInventoryBtn" type="button" class="danger-action-btn">
                   Delete
                 </button>
               
               : ""
           }
         </div>
       </div>
     ;
   }
   
   function updateInventoryBulkBar() {
     const bulkBar = document.getElementById("inventoryBulkBar");
   
     if (!bulkBar) return;
   
     bulkBar.innerHTML = renderInventoryBulkBar();
     bindInventoryBulkActionButtons();
   }
   
   
   /* =========================================================
      4. BULK DATABASE ACTIONS
      ========================================================= */
   
   async function bulkDeactivateInventoryItems() {
     const ids = getSelectedInventoryIds();
   
     if (ids.length === 0) {
       alert("Please select at least one inventory item.");
       return;
     }
   
     if (!canManageInventory()) {
       alert("You do not have permission to manage inventory.");
       return;
     }
   
     if (!confirm(Deactivate ${ids.length} selected item(s)?)) return;
   
     const { error } = await supabaseClient
       .from("inventory_items")
       .update({
         is_active: false,
         status: "inactive",
         updated_by: currentUser ? currentUser.id : null
       })
       .in("id", ids);
   
     if (error) {
       alert("Could not deactivate selected items: " + error.message);
       return;
     }
   
     clearInventorySelection();
   
     if (typeof loadInventoryItems === "function") {
       await loadInventoryItems();
     }
   }
   
   async function bulkRestoreInventoryItems() {
     const ids = getSelectedInventoryIds();
   
     if (ids.length === 0) {
       alert("Please select at least one inventory item.");
       return;
     }
   
     if (!canManageInventory()) {
       alert("You do not have permission to manage inventory.");
       return;
     }
   
     if (!confirm(Restore ${ids.length} selected item(s)?)) return;
   
     const { error } = await supabaseClient
       .from("inventory_items")
       .update({
         is_active: true,
         status: "active",
         updated_by: currentUser ? currentUser.id : null
       })
       .in("id", ids);
   
     if (error) {
       alert("Could not restore selected items: " + error.message);
       return;
     }
   
     clearInventorySelection();
   
     if (typeof loadInventoryItems === "function") {
       await loadInventoryItems();
     }
   }
   
   async function bulkDeleteInventoryItems() {
     const ids = getSelectedInventoryIds();
   
     if (ids.length === 0) {
       alert("Please select at least one inventory item.");
       return;
     }
   
     if (!canDeleteInventoryItem()) {
       alert("Only Developer access can permanently delete inventory items.");
       return;
     }
   
     if (!confirm(Permanently delete ${ids.length} selected item(s)?)) return;
   
     if (!confirm("Final warning. This cannot be undone.")) return;
   
     const { error } = await supabaseClient
       .from("inventory_items")
       .delete()
       .in("id", ids);
   
     if (error) {
       alert("Could not delete selected items: " + error.message);
       return;
     }
   
     clearInventorySelection();
   
     if (typeof loadInventoryItems === "function") {
       await loadInventoryItems();
     }
   }
   
   
   /* =========================================================
      5. BUTTON BINDINGS
      ========================================================= */
   
   function bindInventoryBulkSelectionButtons() {
     const selectAllCheckbox = document.getElementById("inventorySelectAllCheckbox");
   
     if (selectAllCheckbox) {
       selectAllCheckbox.addEventListener("change", function () {
         toggleAllVisibleInventoryRows(selectAllCheckbox.checked);
       });
     }
   
     document.querySelectorAll(".inventory-row-checkbox").forEach((checkbox) => {
       checkbox.addEventListener("change", function () {
         toggleInventoryRowSelection(
           checkbox.getAttribute("data-id"),
           checkbox.checked
         );
       });
     });
   
     updateInventoryBulkBar();
   }
   
   function bindInventoryBulkActionButtons() {
     const clearButton = document.getElementById("bulkClearInventorySelectionBtn");
     const deactivateButton = document.getElementById("bulkDeactivateInventoryBtn");
     const restoreButton = document.getElementById("bulkRestoreInventoryBtn");
     const deleteButton = document.getElementById("bulkDeleteInventoryBtn");
   
     if (clearButton) {
       clearButton.addEventListener("click", clearInventorySelection);
     }
   
     if (deactivateButton) {
       deactivateButton.addEventListener("click", bulkDeactivateInventoryItems);
     }
   
     if (restoreButton) {
       restoreButton.addEventListener("click", bulkRestoreInventoryItems);
     }
   
     if (deleteButton) {
       deleteButton.addEventListener("click", bulkDeleteInventoryItems);
     }
   }
/* =========================================================
   ADMIN INVENTORY HISTORY MODULE
   File: js/admin-inventory-history.js

   Purpose:
   Shows inventory movement history inside a modal instead of
   expanding inside the inventory table.
   ========================================================= */


/* =========================================================
   1. LOAD TRANSACTION HISTORY
   ========================================================= */

   async function loadInventoryItemHistory(itemId) {
    const { data, error } = await supabaseClient
      .from("inventory_transactions")
      .select(
        id,
        inventory_item_id,
        transaction_type,
        quantity_change,
        previous_quantity,
        new_quantity,
        reference_type,
        reference_id,
        supplier,
        location,
        unit_cost,
        unit_price,
        notes,
        performed_by,
        created_at
      )
      .eq("inventory_item_id", itemId)
      .order("created_at", { ascending: false });
  
    if (error) {
      return {
        success: false,
        message: error.message,
        transactions: []
      };
    }
  
    return {
      success: true,
      message: "History loaded successfully.",
      transactions: data || []
    };
  }
  
  
  /* =========================================================
     2. OPEN HISTORY MODAL
     ========================================================= */
  
  async function openInventoryHistoryModal(item) {
    if (!item) {
      alert("Inventory item could not be found.");
      return;
    }
  
    if (typeof openAdminModal !== "function") {
      alert("Modal framework not loaded.");
      return;
    }
  
    openAdminModal({
      title: "Inventory Movement History",
      subtitle: safeText(item.item_name, "Inventory Item"),
      content: renderLoadingState("Loading inventory history..."),
      footer: 
        <button type="button" class="secondary-action-btn" onclick="closeAdminModal()">
          Close
        </button>
      
    });
  
    const result = await loadInventoryItemHistory(item.id);
  
    const modalBody = document.querySelector("#adminModalBackdrop .admin-modal-body");
  
    if (!modalBody) return;
  
    if (!result.success) {
      modalBody.innerHTML = 
        <div class="admin-empty-state">
          <strong>Could not load inventory history</strong>
          <p>${safeText(result.message)}</p>
        </div>
      ;
      return;
    }
  
    modalBody.innerHTML = renderInventoryHistoryPanel(item, result.transactions);
  }
  
  
  /* =========================================================
     3. RENDER HISTORY PANEL
     ========================================================= */
  
  function renderInventoryHistoryPanel(item, transactions) {
    const quantity = inventoryNumber(item.quantity);
    const reorderLevel = inventoryNumber(item.reorder_level || item.low_stock_limit);
    const isActive = item.is_active !== false;
  
    const statusLabel = inventoryQuantityLabel(quantity, reorderLevel, isActive);
    const statusClass = inventoryStatusClass(quantity, reorderLevel, isActive);
  
    return 
      <div class="inventory-history-panel modal-history-panel">
        <div class="inventory-history-header">
          <div>
            <p class="admin-card-label">Inventory Audit Trail</p>
            <h3>${safeText(item.item_name, "Inventory Item")}</h3>
            <p>
              SKU: ${safeText(item.sku, "-")}
              ${item.part_number ?  • Part #: ${safeText(item.part_number)} : ""}
            </p>
          </div>
  
          <div class="inventory-history-summary">
            <span class="status-badge ${statusClass}">
              ${safeText(statusLabel)}
            </span>
            <strong>${safeText(quantity)}</strong>
            <small>Current quantity</small>
          </div>
        </div>
  
        <div class="inventory-history-list">
          ${renderInventoryTransactionRows(transactions)}
        </div>
      </div>
    ;
  }
  
  
  /* =========================================================
     4. RENDER TRANSACTION ROWS
     ========================================================= */
  
  function renderInventoryTransactionRows(transactions) {
    if (!transactions || transactions.length === 0) {
      return 
        <div class="inventory-history-empty">
          No inventory movement has been recorded for this item yet.
        </div>
      ;
    }
  
    return transactions.map((transaction) => {
      const quantityChange = Number(transaction.quantity_change || 0);
  
      const quantityClass = quantityChange >= 0
        ? "inventory-qty-positive"
        : "inventory-qty-negative";
  
      return 
        <div class="inventory-history-item">
          <div class="inventory-history-main">
            <div>
              <strong>
                ${safeText(inventoryFormatTransactionType(transaction.transaction_type))}
              </strong>
  
              <small>
                ${formatDate(transaction.created_at)}
                ${
                  transaction.reference_type
                    ?  • ${safeText(transaction.reference_type)}
                    : ""
                }
                ${
                  transaction.reference_id
                    ?  #${safeText(transaction.reference_id)}
                    : ""
                }
              </small>
            </div>
  
            <span class="inventory-history-quantity ${quantityClass}">
              ${safeText(inventorySignedQuantity(quantityChange))}
            </span>
          </div>
  
          <div class="inventory-history-grid">
            <div>
              <span>Previous Qty</span>
              <strong>${safeText(transaction.previous_quantity, "0")}</strong>
            </div>
  
            <div>
              <span>New Qty</span>
              <strong>${safeText(transaction.new_quantity, "0")}</strong>
            </div>
  
            <div>
              <span>Supplier</span>
              <strong>${safeText(transaction.supplier, "-")}</strong>
            </div>
  
            <div>
              <span>Location</span>
              <strong>${safeText(transaction.location, "-")}</strong>
            </div>
  
            <div>
              <span>Unit Cost</span>
              <strong>${money(transaction.unit_cost || 0)}</strong>
            </div>
  
            <div>
              <span>Unit Price</span>
              <strong>${money(transaction.unit_price || 0)}</strong>
            </div>
          </div>
  
          ${
            transaction.notes
              ? 
                <div class="inventory-history-notes">
                  <strong>Notes</strong>
                  <p>${safeText(transaction.notes)}</p>
                </div>
              
              : ""
          }
        </div>
      ;
    }).join("");
  }
  
  
  /* =========================================================
     5. LEGACY SAFE WRAPPERS
     ========================================================= */
  
  async function toggleInventoryHistory(itemId) {
    const item = inventoryItems.find((record) => {
      return String(record.id) === String(itemId);
    });
  
    if (!item) {
      alert("Inventory item could not be found.");
      return;
    }
  
    await openInventoryHistoryModal(item);
  }
  
  function bindInventoryHistoryButtons() {
    document.querySelectorAll(".view-inventory-history-btn").forEach((button) => {
      button.addEventListener("click", async function () {
        const itemId = button.getAttribute("data-id");
        await toggleInventoryHistory(itemId);
      });
    });
  }
  
  
  /* =========================================================
     6. GLOBAL EXPORTS
     ========================================================= */
  
  window.loadInventoryItemHistory = loadInventoryItemHistory;
  window.openInventoryHistoryModal = openInventoryHistoryModal;
  window.renderInventoryHistoryPanel = renderInventoryHistoryPanel;
  window.toggleInventoryHistory = toggleInventoryHistory;
  window.bindInventoryHistoryButtons = bindInventoryHistoryButtons;
  window.openInventoryHistoryModal = openInventoryHistoryModal;
window.toggleInventoryHistory = toggleInventoryHistory;
window.bindInventoryHistoryButtons = bindInventoryHistoryButtons;

/Users/akinolaadebayo/Downloads/goeast-mechanics-main 4/js/admin-inventory-items.js
/* =========================================================
   ADMIN INVENTORY RECEIVING MODULE
   File: js/admin-inventory-receiving.js
========================================================= */

let receivingInventoryItemId = null;

function openReceiveStockModal(item) {
  if (!item) {
    alert("Inventory item could not be found.");
    return;
  }

  if (typeof openAdminModal !== "function") {
    alert("Modal framework not loaded.");
    return;
  }

  receivingInventoryItemId = item.id;

  openAdminModal({
    title: "Receive Stock",
    subtitle: ${safeText(item.item_name, "Inventory Item")} • Current Qty: ${safeText(item.quantity, "0")},
    content: 
      <form id="receiveStockModalForm" class="admin-modal-form">
        <label>
          Quantity Received
          <input id="modalReceiveStockQuantity" type="number" min="1" step="1" required>
        </label>

        <label>
          Supplier
          <input id="modalReceiveStockSupplier" value="${escapeHtml(item.supplier || "")}">
        </label>

        <label>
          Location / Shelf
          <input id="modalReceiveStockLocation" value="${escapeHtml(item.location || "")}">
        </label>

        <label>
          Unit Cost
          <input id="modalReceiveStockUnitCost" type="number" min="0" step="0.01" value="${Number(item.cost_price || item.unit_price || 0)}">
        </label>

        <label>
          Unit Price
          <input id="modalReceiveStockUnitPrice" type="number" min="0" step="0.01" value="${Number(item.selling_price || item.unit_price || 0)}">
        </label>

        <label class="full-span">
          Receiving Notes
          <textarea id="modalReceiveStockNotes" placeholder="Example: Supplier invoice received, shelf A2."></textarea>
        </label>
      </form>
    ,
    footer: 
      <button type="button" class="secondary-action-btn" onclick="closeReceiveStockForm()">Cancel</button>
      <button type="button" class="primary-action-btn" onclick="submitReceiveStockFromModal()">Receive Stock</button>
    
  });
}

async function submitReceiveStockFromModal() {
  if (!receivingInventoryItemId) {
    if (typeof showToast === "function") {
      showToast(
        "warning",
        "No Item Selected",
        "Select an inventory item before receiving stock."
      );
    }

    return;
  }

  const quantityInput = document.getElementById(
    "modalReceiveStockQuantity"
  );

  const supplierInput = document.getElementById(
    "modalReceiveStockSupplier"
  );

  const locationInput = document.getElementById(
    "modalReceiveStockLocation"
  );

  const unitCostInput = document.getElementById(
    "modalReceiveStockUnitCost"
  );

  const unitPriceInput = document.getElementById(
    "modalReceiveStockUnitPrice"
  );

  const notesInput = document.getElementById(
    "modalReceiveStockNotes"
  );

  if (
    !quantityInput ||
    !supplierInput ||
    !locationInput ||
    !unitCostInput ||
    !unitPriceInput ||
    !notesInput
  ) {
    if (typeof showToast === "function") {
      showToast(
        "error",
        "Receive Stock Form Error",
        "One or more receiving form fields could not be found."
      );
    }

    return;
  }

  const quantity = inventoryNumber(quantityInput.value);

  if (quantity <= 0) {
    if (typeof showToast === "function") {
      showToast(
        "warning",
        "Invalid Quantity",
        "Receive quantity must be greater than zero."
      );
    }

    quantityInput.focus();
    return;
  }

  const supplier = supplierInput.value.trim();
  const location = locationInput.value.trim();
  const unitCost = inventoryNumber(unitCostInput.value);
  const unitPrice = inventoryNumber(unitPriceInput.value);
  const notes = notesInput.value.trim();

  const submitButton = document.querySelector(
    "#adminModalBox .primary-action-btn"
  );

  const originalButtonText = submitButton
    ? submitButton.textContent
    : "Receive Stock";

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Receiving...";
  }

  try {
    const result = await receiveInventoryStock(
      receivingInventoryItemId,
      quantity,
      {
        supplier,
        location,
        unit_cost: unitCost,
        unit_price: unitPrice,
        notes: notes || "Stock received manually."
      }
    );

    if (!result.success) {
      if (typeof showToast === "function") {
        showToast(
          "error",
          "Stock Could Not Be Received",
          result.message ||
            "The stock receiving operation could not be completed."
        );
      }

      return;
    }

    receivingInventoryItemId = null;

    if (typeof closeAdminModal === "function") {
      closeAdminModal();
    }

    if (typeof showToast === "function") {
      showToast(
        "success",
        "Stock Received",
        ${quantity} unit${quantity === 1 ? "" : "s"} added to inventory successfully.
      );
    }

    if (typeof loadInventoryItems === "function") {
      await loadInventoryItems();
    }
  } catch (error) {
    console.error("Receive stock error:", error);

    if (typeof showToast === "function") {
      showToast(
        "error",
        "Stock Could Not Be Received",
        error?.message ||
          "An unexpected error occurred while receiving stock."
      );
    }
  } finally {
    if (
      submitButton &&
      document.body.contains(submitButton)
    ) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  }
}

function openReceiveStockForm(itemId) {
  const item = inventoryItems.find((record) => String(record.id) === String(itemId));

  if (!item) {
    alert("Inventory item could not be found.");
    return;
  }

  openReceiveStockModal(item);
}

function closeReceiveStockForm() {
  receivingInventoryItemId = null;

  if (typeof closeAdminModal === "function") {
    closeAdminModal();
  }
}

async function submitReceiveStock(event) {
  event.preventDefault();
  await submitReceiveStockFromModal();
}

function bindInventoryReceivingButtons() {
  document.querySelectorAll(".receive-stock-btn").forEach((button) => {
    button.addEventListener("click", function () {
      openReceiveStockForm(button.getAttribute("data-id"));
    });
  });
}

window.openReceiveStockModal = openReceiveStockModal;
window.openReceiveStockForm = openReceiveStockForm;
window.closeReceiveStockForm = closeReceiveStockForm;
window.submitReceiveStockFromModal = submitReceiveStockFromModal;
window.submitReceiveStock = submitReceiveStock;
window.bindInventoryReceivingButtons = bindInventoryReceivingButtons;

/* =========================================================
   ADMIN INVENTORY TRANSACTIONS MODULE
   File: js/admin-inventory-transactions.js

   Purpose:
   Core inventory transaction engine.

   Enterprise Rule:
   Inventory quantity should not be changed silently.
   Every stock movement must create a transaction record.

   Supported transaction types:
   - OPENING_BALANCE
   - RECEIVE
   - ISSUE
   - RETURN
   - ADJUSTMENT
   - TRANSFER
   - WARRANTY
   - DAMAGED
   - CYCLE_COUNT
   - PURCHASE
   ========================================================= */

/* =========================================================
   1. CREATE INVENTORY TRANSACTION

   Operation:
   - Reads current inventory item quantity.
   - Calculates new quantity.
   - Updates inventory_items.quantity.
   - Inserts inventory_transactions ledger record.

   This function becomes the single source for stock movement.
   ========================================================= */

   async function createInventoryTransaction(options) {
    if (!canManageInventory()) {
      return {
        success: false,
        message: "You do not have permission to manage inventory."
      };
    }
  
    const inventoryItemId = Number(options.inventory_item_id);
    const transactionType = options.transaction_type;
    const quantityChange = inventoryNumber(options.quantity_change);
  
    if (!inventoryItemId) {
      return {
        success: false,
        message: "Inventory item is required."
      };
    }
  
    if (!transactionType) {
      return {
        success: false,
        message: "Transaction type is required."
      };
    }
  
    if (quantityChange === 0) {
      return {
        success: false,
        message: "Quantity change cannot be zero."
      };
    }
  
    const { data: item, error: itemError } = await supabaseClient
      .from("inventory_items")
      .select("*")
      .eq("id", inventoryItemId)
      .single();
  
    if (itemError || !item) {
      return {
        success: false,
        message: "Inventory item could not be found."
      };
    }
  
    const previousQuantity = inventoryNumber(item.quantity);
    const newQuantity = previousQuantity + quantityChange;
  
    if (newQuantity < 0) {
      return {
        success: false,
        message: "This transaction would make stock negative."
      };
    }
  
    const { error: updateError } = await supabaseClient
      .from("inventory_items")
      .update({
        quantity: newQuantity,
        updated_by: currentUser ? currentUser.id : null
      })
      .eq("id", inventoryItemId);
  
    if (updateError) {
      return {
        success: false,
        message: "Inventory quantity could not be updated: " + updateError.message
      };
    }
  
    const transactionPayload = {
      inventory_item_id: inventoryItemId,
      transaction_type: transactionType,
      quantity_change: quantityChange,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      reference_type: options.reference_type || "MANUAL",
      reference_id: options.reference_id || null,
      supplier: options.supplier || item.supplier || null,
      location: options.location || item.location || null,
      unit_cost: inventoryNumber(options.unit_cost || item.cost_price || item.unit_price),
      unit_price: inventoryNumber(options.unit_price || item.selling_price || item.unit_price),
      notes: options.notes || null,
      performed_by: currentUser ? currentUser.id : null
    };
  
    const { error: transactionError } = await supabaseClient
      .from("inventory_transactions")
      .insert([transactionPayload]);
  
    if (transactionError) {
      /*
        Important:
        If this insert fails, quantity has already changed.
        In a later enterprise version, we should move this into a
        Supabase RPC/database transaction for true atomic safety.
      */
      return {
        success: false,
        message:
          "Quantity updated, but transaction record failed: " +
          transactionError.message
      };
    }
  
    return {
      success: true,
      message: "Inventory transaction completed successfully.",
      previous_quantity: previousQuantity,
      new_quantity: newQuantity
    };
  }
  
  /* =========================================================
     2. RECEIVE STOCK
  
     Operation:
     Adds inventory quantity and creates RECEIVE transaction.
     ========================================================= */
  
  async function receiveInventoryStock(itemId, quantity, options = {}) {
    return await createInventoryTransaction({
      inventory_item_id: itemId,
      transaction_type: "RECEIVE",
      quantity_change: Math.abs(inventoryNumber(quantity)),
      reference_type: options.reference_type || "MANUAL_RECEIVE",
      reference_id: options.reference_id || null,
      supplier: options.supplier || null,
      location: options.location || null,
      unit_cost: options.unit_cost || 0,
      unit_price: options.unit_price || 0,
      notes: options.notes || "Stock received manually."
    });
  }
  
  /* =========================================================
     3. ISSUE STOCK
  
     Operation:
     Deducts inventory quantity and creates ISSUE transaction.
  
     Later this will be used by Job Cards when mechanics consume parts.
     ========================================================= */
  
  async function issueInventoryStock(itemId, quantity, options = {}) {
    return await createInventoryTransaction({
      inventory_item_id: itemId,
      transaction_type: "ISSUE",
      quantity_change: -Math.abs(inventoryNumber(quantity)),
      reference_type: options.reference_type || "MANUAL_ISSUE",
      reference_id: options.reference_id || null,
      supplier: options.supplier || null,
      location: options.location || null,
      unit_cost: options.unit_cost || 0,
      unit_price: options.unit_price || 0,
      notes: options.notes || "Stock issued manually."
    });
  }
  
  /* =========================================================
     4. ADJUST STOCK
  
     Operation:
     Handles manual correction.
  
     Example:
     Current quantity is 10.
     Actual counted quantity is 14.
     Difference = +4.
     ========================================================= */
  
  async function adjustInventoryStock(itemId, newQuantity, options = {}) {
    const { data: item, error } = await supabaseClient
      .from("inventory_items")
      .select("id, quantity")
      .eq("id", itemId)
      .single();
  
    if (error || !item) {
      return {
        success: false,
        message: "Inventory item could not be found."
      };
    }
  
    const currentQuantity = inventoryNumber(item.quantity);
    const targetQuantity = inventoryNumber(newQuantity);
    const difference = targetQuantity - currentQuantity;
  
    if (difference === 0) {
      return {
        success: false,
        message: "No stock change needed."
      };
    }
  
    return await createInventoryTransaction({
      inventory_item_id: itemId,
      transaction_type: "ADJUSTMENT",
      quantity_change: difference,
      reference_type: options.reference_type || "MANUAL_ADJUSTMENT",
      reference_id: options.reference_id || null,
      notes: options.notes || "Manual stock adjustment."
    });
  }
  
  /* =========================================================
     5. RETURN STOCK
  
     Operation:
     Adds stock back into inventory.
     ========================================================= */
  
  async function returnInventoryStock(itemId, quantity, options = {}) {
    return await createInventoryTransaction({
      inventory_item_id: itemId,
      transaction_type: "RETURN",
      quantity_change: Math.abs(inventoryNumber(quantity)),
      reference_type: options.reference_type || "MANUAL_RETURN",
      reference_id: options.reference_id || null,
      notes: options.notes || "Stock returned."
    });
  }
  
  /* =========================================================
     6. DAMAGE / WRITE-OFF STOCK
  
     Operation:
     Deducts damaged stock with a ledger record.
     ========================================================= */
  
  async function damageInventoryStock(itemId, quantity, options = {}) {
    return await createInventoryTransaction({
      inventory_item_id: itemId,
      transaction_type: "DAMAGED",
      quantity_change: -Math.abs(inventoryNumber(quantity)),
      reference_type: options.reference_type || "MANUAL_DAMAGE",
      reference_id: options.reference_id || null,
      notes: options.notes || "Stock marked as damaged."
    });
  }

/* =========================================================
   ADMIN INVENTORY UTILITIES
   File: js/admin-inventory-utils.js

   Purpose:
   Shared helper functions for the enterprise inventory system.

   Used by:
   - admin-inventory-items.js
   - admin-inventory-transactions.js
   - admin-inventory-history.js
   - admin-inventory-receiving.js
   - admin-inventory-adjustments.js
   - admin-inventory-bulk.js
   ========================================================= */

   function canManageInventory() {
    return (
      currentProfile &&
      ["developer", "upper_admin"].includes(currentProfile.role)
    );
  }
  
  function canDeleteInventoryItem() {
    return currentProfile && currentProfile.role === "developer";
  }
  
  function inventoryNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }
  
  function inventoryQuantityLabel(quantity, reorderLevel, isActive = true) {
    if (!isActive) return "Inactive";
    if (quantity <= 0) return "Out of Stock";
    if (quantity <= reorderLevel) return "Low Stock";
    return "In Stock";
  }
  
  function inventoryStatusClass(quantity, reorderLevel, isActive = true) {
    if (!isActive) return "status-cancelled";
    if (quantity <= 0) return "status-cancelled";
    if (quantity <= reorderLevel) return "status-waiting_parts";
    return "status-closed";
  }
  
  function inventoryFormatTransactionType(type) {
    if (!type) return "Transaction";
  
    return String(type)
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  
  function inventorySignedQuantity(value) {
    const number = inventoryNumber(value);
  
    if (number > 0) return +${number};
    return String(number);
  }
  
  function inventorySafeId(value) {
    return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "");
  }

const SUPABASE_URL = "https://jajpzobofhajsoxkszdx.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphanB6b2JvZmhhanNveGtzemR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzM5MTUsImV4cCI6MjA5NzY0OTkxNX0.jH6oD-yc3M5NolFVKDG4NV_z2UVsJfF_Rkk25VqLzms";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ROLES = {
  DEVELOPER: "developer",
  UPPER_ADMIN: "upper_admin",
  RECEPTIONIST: "receptionist",
  MECHANIC: "mechanic",
  CUSTOMER: "customer",
};

const ROLE_LABELS = {
  developer: "Developer",
  upper_admin: "Upper Admin",
  receptionist: "Receptionist",
  mechanic: "Mechanic",
  customer: "Customer",
};

const STAFF_ROLES = [
  ROLES.DEVELOPER,
  ROLES.UPPER_ADMIN,
  ROLES.RECEPTIONIST,
  ROLES.MECHANIC,
];

const FULL_ACCESS_ROLES = [ROLES.DEVELOPER, ROLES.UPPER_ADMIN];

function formatRole(role) {
  return ROLE_LABELS[role] || "Customer";
}

function escapeHtml(value) {
  if (value === null || value === undefined || value === "") return "";

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeText(value, fallback = "Not provided") {
  const text = escapeHtml(value);
  return text || fallback;
}

function money(value) {
  return "$" + Number(value || 0).toFixed(2);
}

function formatDate(value) {
  if (!value) return "Not provided";
  return new Date(value).toLocaleString();
}

Contact.js

const contactForm = document.getElementById("contactForm");
const savedVehicleSelect = document.getElementById("savedVehicleSelect");
const vehicleInput = document.getElementById("vehicle");

const bookingProfileCard = document.getElementById("bookingProfileCard");
const bookingInitials = document.getElementById("bookingInitials");
const bookingName = document.getElementById("bookingName");
const bookingEmail = document.getElementById("bookingEmail");

let currentBookingUser = null;
let currentBookingProfile = null;
let savedVehicles = [];

document.addEventListener("DOMContentLoaded", initializeBookingPage);

async function initializeBookingPage() {
  await loadLoggedInCustomer();
  await loadSavedVehiclesForBooking();
}

async function loadLoggedInCustomer() {
  const { data, error } = await supabaseClient.auth.getUser();

  if (error || !data.user) {
    currentBookingUser = null;
    setupGuestBookingMode();
    return;
  }

  currentBookingUser = data.user;

  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("full_name, phone, email, role")
    .eq("id", currentBookingUser.id)
    .maybeSingle();

  currentBookingProfile = profile || null;

  const displayName =
    currentBookingProfile?.full_name ||
    currentBookingUser.email ||
    "Customer";

  document.getElementById("name").value = displayName;
  document.getElementById("email").value = currentBookingUser.email || "";

  document.getElementById("email").readOnly = true;

  if (currentBookingProfile?.phone) {
    document.getElementById("phone").value = currentBookingProfile.phone;
  }

  renderBookingProfileCard(displayName, currentBookingUser.email);
}

function renderBookingProfileCard(name, email) {
  if (!bookingProfileCard) return;

  bookingProfileCard.classList.remove("hidden");

  if (bookingInitials) {
    bookingInitials.textContent = name.trim().slice(0, 1).toUpperCase();
  }

  if (bookingName) {
    bookingName.textContent = name;
  }

  if (bookingEmail) {
    bookingEmail.textContent = ${email} • Customer Account;
  }
}

function setupGuestBookingMode() {
  savedVehicleSelect.innerHTML = 
    <option value="">Login to select a saved vehicle, or type vehicle below</option>
  ;

  vehicleInput.required = true;

  if (bookingProfileCard) {
    bookingProfileCard.classList.add("hidden");
  }
}

async function loadSavedVehiclesForBooking() {
  if (!currentBookingUser) return;

  const { data, error } = await supabaseClient
    .from("vehicles")
    .select("id, year, make, model, trim, license_plate")
    .eq("customer_id", currentBookingUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    savedVehicleSelect.innerHTML = 
      <option value="">Could not load saved vehicles</option>
    ;
    vehicleInput.required = true;
    return;
  }

  savedVehicles = data || [];

  if (savedVehicles.length === 0) {
    savedVehicleSelect.innerHTML = 
      <option value="">No saved vehicles yet. Type vehicle below.</option>
    ;
    vehicleInput.required = true;
    return;
  }

  savedVehicleSelect.innerHTML = 
    <option value="">Choose a saved vehicle</option>
    ${savedVehicles.map((vehicle) => {
      return 
        <option value="${vehicle.id}">
          ${buildVehicleLabel(vehicle)}
        </option>
      ;
    }).join("")}
  ;
}

savedVehicleSelect.addEventListener("change", function () {
  const selectedVehicle = savedVehicles.find((vehicle) => {
    return vehicle.id === savedVehicleSelect.value;
  });

  if (!selectedVehicle) {
    vehicleInput.value = "";
    vehicleInput.readOnly = false;
    vehicleInput.required = true;
    return;
  }

  vehicleInput.value = buildVehicleLabel(selectedVehicle);
  vehicleInput.readOnly = true;
  vehicleInput.required = false;
});

contactForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const submitButton = contactForm.querySelector("button");

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  const selectedVehicleId = savedVehicleSelect.value || null;
  const vehicleText = vehicleInput.value.trim();

  if (!vehicleText) {
    alert("Please select or type a vehicle.");
    submitButton.disabled = false;
    submitButton.textContent = "Submit Service Request";
    return;
  }

  const requestData = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    vehicle: vehicleText,
    vehicle_id: selectedVehicleId,
    message: document.getElementById("message").value.trim()
  };

  try {
    const { error } = await supabaseClient
      .from("service_requests")
      .insert([requestData]);

    if (error) {
      alert(
        "Something went wrong.\n\n" +
        "Message: " + error.message + "\n" +
        "Code: " + error.code + "\n" +
        "Details: " + error.details
      );
    } else {
      alert("✅ Service request submitted successfully!");

      const savedEmail = currentBookingUser?.email || "";
      const savedName =
        currentBookingProfile?.full_name ||
        currentBookingUser?.email ||
        "";

      contactForm.reset();

      if (currentBookingUser) {
        document.getElementById("name").value = savedName;
        document.getElementById("email").value = savedEmail;
        document.getElementById("email").readOnly = true;
        await loadSavedVehiclesForBooking();
      }
    }
  } catch (err) {
    alert("Unexpected error happened.\n\n" + err.message);
  }

  submitButton.disabled = false;
  submitButton.textContent = "Submit Service Request";
});

function buildVehicleLabel(vehicle) {
  return [
    vehicle.year,
    vehicle.make,
    vehicle.model,
    vehicle.trim,
    vehicle.license_plate ? Plate: ${vehicle.license_plate} : ""
  ].filter(Boolean).join(" ");
}

/* =========================================================
   CUSTOMER AUTH MODULE
   File: js/customer-auth.js
   ========================================================= */

   const customerEmail = document.getElementById("customerEmail");
   const customerRoleBadge = document.getElementById("customerRoleBadge");
   const customerInitials = document.getElementById("customerInitials");
   const logoutBtn = document.getElementById("logoutBtn");
   
   const vehiclesContainer = document.getElementById("customerVehicles");
   const vehicleForm = document.getElementById("vehicleForm");
   
   const requestsContainer = document.getElementById("customerRequests");
   const invoicesContainer = document.getElementById("customerInvoices");
   const paymentsContainer = document.getElementById("customerPayments");
   
   const totalRequests = document.getElementById("totalRequests");
   const newRequests = document.getElementById("newRequests");
   const ongoingRequests = document.getElementById("ongoingRequests");
   const finishedRequests = document.getElementById("finishedRequests");
   
   const navButtons = document.querySelectorAll(".nav-btn");
   const sections = document.querySelectorAll(".admin-section");
   
   let currentUser = null;
   let currentProfile = null;
   
   let customerVehicles = [];
   let customerRequests = [];
   let customerInvoices = [];
   let customerPayments = [];
   
   let repairUpdatesByRequest = {};
   
   async function checkCustomerSession() {
     const { data: userData, error: userError } = await supabaseClient.auth.getUser();
   
     if (userError || !userData.user) {
       window.location.href = "login.html";
       return false;
     }
   
     currentUser = userData.user;
   
     let { data: profile, error: profileError } = await supabaseClient
       .from("profiles")
       .select("id, email, full_name, role, phone")
       .eq("id", currentUser.id)
       .maybeSingle();
   
     if (profileError) {
       alert("Profile loading failed: " + profileError.message);
       return false;
     }
   
     if (!profile) {
       const { data: newProfile, error: createError } = await supabaseClient
         .from("profiles")
         .insert([
           {
             id: currentUser.id,
             email: currentUser.email,
             role: "customer"
           }
         ])
         .select("id, email, full_name, role, phone")
         .single();
   
       if (createError) {
         alert("Profile setup failed: " + createError.message);
         return false;
       }
   
       profile = newProfile;
     }
   
     if (STAFF_ROLES.includes(profile.role)) {
       window.location.href = "admin.html";
       return false;
     }
   
     currentProfile = profile;
     renderCustomerProfile();
   
     return true;
   }
   
   function renderCustomerProfile() {
     if (!currentUser || !currentProfile) return;
   
     const displayName = currentProfile.full_name || currentUser.email || "Customer";
   
     if (customerEmail) {
       customerEmail.textContent = displayName;
     }
   
     if (customerRoleBadge) {
       customerRoleBadge.textContent = ${currentUser.email} • ${formatRole(currentProfile.role)};
     }
   
     if (customerInitials) {
       customerInitials.textContent = displayName.trim().slice(0, 1).toUpperCase();
     }
   }
   
   if (logoutBtn) {
     logoutBtn.addEventListener("click", async function () {
       await supabaseClient.auth.signOut();
       window.location.href = "login.html";
     });
   }

/* =========================================================
   CUSTOMER INVOICES MODULE
   File: js/customer-invoices.js

   Purpose:
   - Loads invoices for the logged-in customer.
   - Displays each invoice as a simple job bill.
   - Calculates amount paid and balance using actual payment rows.
   - Keeps invoice display simple for Go East Mechanics.

   Business rule:
   Go East Mechanics receives payments outside the website.
   The website only shows payments manually recorded by staff.
   ========================================================= */


/* =========================================================
   1. LOAD CUSTOMER INVOICES
   ========================================================= */

   async function loadCustomerInvoices() {
    if (!currentUser) return;
  
    const { data, error } = await supabaseClient
      .from("invoices")
      .select("*")
      .eq("customer_email", currentUser.email)
      .order("invoice_date", { ascending: false });
  
    if (error) {
      if (invoicesContainer) {
        invoicesContainer.innerHTML = 
          <div class="empty-message">Unable to load invoices.</div>
        ;
      }
      return;
    }
  
    customerInvoices = data || [];
  }
  
  
  /* =========================================================
     2. RENDER CUSTOMER SIMPLE INVOICES / JOB BILLS
     ========================================================= */
  
  function renderCustomerInvoices() {
    if (!invoicesContainer) return;
  
    if (customerInvoices.length === 0) {
      invoicesContainer.innerHTML = 
        <div class="empty-message">No invoices available.</div>
      ;
      return;
    }
  
    invoicesContainer.innerHTML = "";
  
    customerInvoices.forEach((invoice) => {
      const invoicePayments = getCustomerPaymentsForInvoice(invoice.id);
      const totals = calculateCustomerInvoiceTotals(invoice, invoicePayments);
      const status = getCustomerInvoicePaymentStatus(totals);
  
      const card = document.createElement("div");
      card.className = "request-card";
  
      card.innerHTML = 
        <div class="card-top">
          <div>
            <h3>${safeText(invoice.invoice_number, "Invoice")}</h3>
            <p>${safeText(invoice.customer_name, "Customer")} • ${safeText(invoice.vehicle, "Vehicle")}</p>
          </div>
  
          <span class="status-badge status-${escapeHtml(status.key)}">
            ${safeText(status.label)}
          </span>
        </div>
  
        <div class="card-grid">
          <p><strong>Invoice Date</strong><br>${formatDate(invoice.invoice_date || invoice.created_at)}</p>
          <p><strong>Vehicle</strong><br>${safeText(invoice.vehicle, "-")}</p>
          <p><strong>Estimated Cost</strong><br>${money(invoice.subtotal)}</p>
          <p><strong>Final Amount</strong><br>${money(totals.total)}</p>
          <p><strong>Amount Paid</strong><br>${money(totals.amountPaid)}</p>
          <p><strong>Balance</strong><br>${money(totals.balance)}</p>
          <p><strong>Payment Status</strong><br>${safeText(status.label)}</p>
          <p><strong>Invoice Status</strong><br>${safeText(invoice.invoice_status, "-")}</p>
        </div>
  
        <div class="card-notes">
          <strong>Payment Notice</strong>
          <p>
            Payments are handled outside this website. This invoice only reflects
            payments manually recorded by Go East Mechanics staff.
          </p>
        </div>
  
        <div class="card-notes">
          <strong>Invoice / Job Bill Notes</strong>
          <p>${safeText(invoice.notes, "No invoice notes recorded.")}</p>
        </div>
  
        <div class="card-notes">
          <strong>Payment History</strong>
          ${renderCustomerPaymentHistory(invoicePayments)}
        </div>
      ;
  
      invoicesContainer.appendChild(card);
    });
  }
  
  
  /* =========================================================
     3. SHARED INVOICE HELPERS
     ========================================================= */
  
  function getCustomerPaymentsForInvoice(invoiceId) {
    return customerPayments.filter((payment) => {
      return Number(payment.invoice_id) === Number(invoiceId);
    });
  }
  
  function calculateCustomerInvoiceTotals(invoice, invoicePayments) {
    const total = Number(invoice.total || invoice.subtotal || 0);
  
    const amountPaid = invoicePayments.reduce((sum, payment) => {
      return sum + Number(payment.amount || 0);
    }, 0);
  
    const balance = Math.max(total - amountPaid, 0);
  
    return {
      total,
      amountPaid,
      balance
    };
  }
  
  function getCustomerInvoicePaymentStatus(totals) {
    if (totals.total > 0 && totals.amountPaid >= totals.total && totals.balance <= 0) {
      return {
        key: "paid_in_full",
        label: "Paid in Full"
      };
    }
  
    if (totals.amountPaid > 0 && totals.balance > 0) {
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
/* =========================================================
   CUSTOMER PAYMENTS MODULE
   File: js/customer-payments.js

   Purpose:
   - Loads payment records connected to the logged-in customer’s invoices.
   - Displays the Payments tab as receipt-style cards.
   - Keeps the customer payment view separate from the invoice/job bill view.

   Business rule:
   Go East Mechanics does not process payments online.
   Staff record cash/debit/credit/e-transfer/cheque payments manually.
   The customer sees those records as payment receipts.
   ========================================================= */


/* =========================================================
   1. LOAD CUSTOMER PAYMENT RECORDS
   ========================================================= */

   async function loadCustomerPayments() {
    if (!paymentsContainer) return;
  
    if (customerInvoices.length === 0) {
      customerPayments = [];
      renderCustomerInvoices();
      renderCustomerPayments();
      return;
    }
  
    const invoiceIds = customerInvoices.map((invoice) => invoice.id);
  
    const { data, error } = await supabaseClient
      .from("payments")
      .select("*")
      .in("invoice_id", invoiceIds)
      .order("payment_date", { ascending: false });
  
    if (error) {
      customerPayments = [];
  
      if (invoicesContainer) {
        invoicesContainer.innerHTML = 
          <div class="empty-message">Unable to load invoice payment records.</div>
        ;
      }
  
      paymentsContainer.innerHTML = 
        <div class="empty-message">Unable to load payments.</div>
      ;
  
      return;
    }
  
    customerPayments = data || [];
  
    renderCustomerInvoices();
    renderCustomerPayments();
  }
  
  
  /* =========================================================
     2. RENDER CUSTOMER PAYMENT RECEIPTS
     ========================================================= */
  
  function renderCustomerPayments() {
    if (!paymentsContainer) return;
  
    if (customerPayments.length === 0) {
      paymentsContainer.innerHTML = 
        <div class="empty-message">
          No payment receipts available yet.
        </div>
      ;
      return;
    }
  
    paymentsContainer.innerHTML = "";
  
    customerPayments.forEach((payment) => {
      const invoice = customerInvoices.find((item) => {
        return Number(item.id) === Number(payment.invoice_id);
      });
  
      const receiptNumber = buildCustomerReceiptNumber(payment);
  
      const card = document.createElement("div");
      card.className = "request-card";
  
      card.innerHTML = 
        <div class="card-top">
          <div>
            <h3>${receiptNumber}</h3>
            <p>
              Payment Receipt
              ${invoice ? • ${safeText(invoice.invoice_number)} • ${safeText(invoice.vehicle, "Vehicle")} : ""}
            </p>
          </div>
  
          <span class="status-badge status-paid_in_full">
            Completed
          </span>
        </div>
  
        <div class="card-grid">
          <p><strong>Amount Paid</strong><br>${money(payment.amount)}</p>
          <p><strong>Payment Method</strong><br>${formatCustomerPaymentMethod(payment.payment_method)}</p>
          <p><strong>Reference</strong><br>${safeText(payment.reference_number, "-")}</p>
          <p><strong>Payment Date</strong><br>${formatDate(payment.payment_date || payment.paid_at || payment.created_at)}</p>
          <p><strong>Status</strong><br>${formatCustomerPaymentStatus(payment.payment_status)}</p>
          <p><strong>Invoice</strong><br>${safeText(invoice ? invoice.invoice_number : "-")}</p>
          <p><strong>Vehicle</strong><br>${safeText(invoice ? invoice.vehicle : "-")}</p>
          <p><strong>Customer</strong><br>${safeText(invoice ? invoice.customer_name : currentProfile?.full_name || currentUser?.email)}</p>
        </div>
  
        <div class="card-notes">
          <strong>Payment Notes</strong>
          <p>${safeText(payment.notes, "No payment notes recorded.")}</p>
        </div>
  
        <div class="card-notes">
          <strong>Important</strong>
          <p>
            This receipt confirms that Go East Mechanics staff manually recorded
            this payment after it was received outside the website.
          </p>
        </div>
      ;
  
      paymentsContainer.appendChild(card);
    });
  }
  
  
  /* =========================================================
     3. PAYMENT HISTORY FOR INVOICE CARDS
     ========================================================= */
  
  function renderCustomerPaymentHistory(invoicePayments) {
    if (!invoicePayments || invoicePayments.length === 0) {
      return <p>No payments have been recorded yet.</p>;
    }
  
    return 
      <div class="timeline-list">
        ${invoicePayments.map((payment) => 
          <div class="timeline-item">
            <strong>${money(payment.amount)} • ${formatCustomerPaymentMethod(payment.payment_method)}</strong>
            <small>${formatDate(payment.payment_date || payment.paid_at || payment.created_at)}</small>
            <p>
              Receipt: ${buildCustomerReceiptNumber(payment)}<br>
              Reference: ${safeText(payment.reference_number, "-")}<br>
              Status: ${safeText(formatCustomerPaymentStatus(payment.payment_status))}<br>
              Notes: ${safeText(payment.notes, "No notes")}
            </p>
          </div>
        ).join("")}
      </div>
    ;
  }
  
  
  /* =========================================================
     4. CUSTOMER PAYMENT HELPERS
     ========================================================= */
  
  function buildCustomerReceiptNumber(payment) {
    const rawId = String(payment.id || "0").padStart(4, "0");
    const dateSource = payment.payment_date || payment.paid_at || payment.created_at || new Date().toISOString();
    const year = new Date(dateSource).getFullYear();
  
    return PAY-${year}-${rawId};
  }
  
  function formatCustomerPaymentMethod(method) {
    const methods = {
      cash: "Cash",
      debit: "Debit",
      credit_card: "Credit Card",
      etransfer: "E-transfer",
      cheque: "Cheque",
      other: "Other"
    };
  
    return methods[method] || safeText(method, "Payment Method");
  }
  
  function formatCustomerPaymentStatus(status) {
    const statuses = {
      paid: "Paid",
      pending: "Pending",
      failed: "Failed",
      refunded: "Refunded",
      cancelled: "Cancelled"
    };
  
    return statuses[status] || safeText(status, "Recorded");
  }
/* =========================================================
   CUSTOMER DASHBOARD APP CONTROLLER
   File: js/customer.js
   ========================================================= */

   function initializeCustomerNavigation() {
    navButtons.forEach((button) => {
      button.addEventListener("click", function () {
        navButtons.forEach((btn) => btn.classList.remove("active"));
        sections.forEach((section) => section.classList.remove("active-section"));
  
        button.classList.add("active");
  
        const targetSection = document.getElementById(button.dataset.section);
  
        if (targetSection) {
          targetSection.classList.add("active-section");
        }
      });
    });
  }
  
  async function loadCustomerDashboard() {
    await loadCustomerVehicles();
  
    await loadCustomerRequests();
    await loadCustomerRepairUpdates();
  
    await loadCustomerInvoices();
    await loadCustomerPayments();
  
    updateCustomerStatistics();
  }
  
  function subscribeCustomerRealtime() {
    supabaseClient
      .channel("customer-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vehicles" },
        loadCustomerDashboard
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_requests" },
        loadCustomerDashboard
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "repair_updates" },
        loadCustomerDashboard
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "invoices" },
        loadCustomerDashboard
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        loadCustomerDashboard
      )
      .subscribe();
  }
  
  async function initializeCustomerDashboard() {
    initializeCustomerNavigation();
  
    const isAuthorizedCustomer = await checkCustomerSession();
  
    if (!isAuthorizedCustomer) {
      return;
    }
  
    await loadCustomerDashboard();
    subscribeCustomerRealtime();
  }
  
  initializeCustomerDashboard();

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const button = loginForm.querySelector("button");

  button.disabled = true;
  button.textContent = "Logging in...";

  try {
    const { data: loginData, error: loginError } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      alert("Login failed: " + loginError.message);
      return;
    }

    const user = loginData.user;

    let { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("id, email, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      const { data: newProfile, error: createError } = await supabaseClient
        .from("profiles")
        .insert([
          {
            id: user.id,
            email: user.email,
            role: "customer",
          },
        ])
        .select("id, email, role")
        .single();

      if (createError) {
        alert("Profile setup failed: " + createError.message);
        return;
      }

      profile = newProfile;
    }

    if (profile.role === "developer") {
      window.location.href = "admin.html";
    } else if (profile.role === "upper_admin") {
      window.location.href = "admin.html";
    } else if (profile.role === "receptionist") {
      window.location.href = "admin.html";
    } else if (profile.role === "mechanic") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "customer.html";
    }
  } catch (err) {
    alert("Unexpected login error: " + err.message);
  } finally {
    button.disabled = false;
    button.textContent = "Login";
  }
});

/* =========================================================
   PUBLIC WEBSITE CONTROLLER
   File: js/script.js
   Purpose:
   - Mobile menu
   - Active navbar state
   - Logged-in public profile badge
   - Login/logout-aware navigation
   ========================================================= */

   const menuBtn = document.getElementById("menuBtn");
   const navLinks = document.getElementById("navLinks");
   
   const STAFF_ROLES_PUBLIC = ["developer", "upper_admin", "receptionist", "mechanic"];
   
   document.addEventListener("DOMContentLoaded", initializePublicWebsite);
   
   async function initializePublicWebsite() {
     initializeMobileMenu();
     await renderPublicNavbar();
     highlightActivePublicPage();
   }
   
   function initializeMobileMenu() {
     if (!menuBtn || !navLinks) return;
   
     menuBtn.addEventListener("click", function () {
       navLinks.classList.toggle("active");
     });
   }
   
   async function renderPublicNavbar() {
     if (!navLinks) return;
   
     let user = null;
     let profile = null;
   
     if (typeof supabaseClient !== "undefined") {
       const { data } = await supabaseClient.auth.getUser();
       user = data?.user || null;
   
       if (user) {
         const { data: profileData } = await supabaseClient
           .from("profiles")
           .select("id, email, full_name, role")
           .eq("id", user.id)
           .maybeSingle();
   
         profile = profileData || null;
       }
     }
   
     if (!user || !profile) {
       navLinks.innerHTML = 
         <a href="index.html" data-page="index.html">Home</a>
         <a href="services.html" data-page="services.html">Services</a>
         <a href="about.html" data-page="about.html">About</a>
         <a href="inventory.html" data-page="inventory.html">Inventory</a>
         <a href="contact.html" data-page="contact.html">Book Service</a>
         <a href="login.html" data-page="login.html">Login</a>
         <a href="signup.html" data-page="signup.html">Sign Up</a>
       ;
       return;
     }
   
     const displayName = profile.full_name || user.email || "User";
     const role = profile.role || "customer";
   
     const dashboardLink = STAFF_ROLES_PUBLIC.includes(role)
       ? "admin.html"
       : "customer.html";
   
     const dashboardText = STAFF_ROLES_PUBLIC.includes(role)
       ? "Dashboard"
       : "My Dashboard";
   
     navLinks.innerHTML = 
       <a href="index.html" data-page="index.html">Home</a>
       <a href="services.html" data-page="services.html">Services</a>
       <a href="about.html" data-page="about.html">About</a>
       <a href="inventory.html" data-page="inventory.html">Inventory</a>
       <a href="contact.html" data-page="contact.html">Book Service</a>
       <a href="${dashboardLink}" data-page="${dashboardLink}">${dashboardText}</a>
       <a href="#" id="publicLogoutBtn">Logout</a>
   
       <div class="public-profile-badge">
         <strong>${escapePublicHtml(displayName)}</strong>
         <span>${formatPublicRole(role)}</span>
       </div>
     ;
   
     const publicLogoutBtn = document.getElementById("publicLogoutBtn");
   
     if (publicLogoutBtn) {
       publicLogoutBtn.addEventListener("click", async function (event) {
         event.preventDefault();
         await supabaseClient.auth.signOut();
         window.location.href = "login.html";
       });
     }
   }
   
   function highlightActivePublicPage() {
     if (!navLinks) return;
   
     const currentPage = window.location.pathname.split("/").pop() || "index.html";
     const links = navLinks.querySelectorAll("a");
   
     links.forEach((link) => {
       link.classList.remove("active-link");
   
       const page = link.dataset.page;
   
       if (page === currentPage) {
         link.classList.add("active-link");
       }
     });
   }
   
   function formatPublicRole(role) {
     if (!role) return "Customer";
   
     return role
       .replaceAll("_", " ")
       .replace(/\b\w/g, (letter) => letter.toUpperCase());
   }
   
   function escapePublicHtml(value) {
     return String(value)
       .replaceAll("&", "&amp;")
       .replaceAll("<", "&lt;")
       .replaceAll(">", "&gt;")
       .replaceAll('"', "&quot;")
       .replaceAll("'", "&#039;");
   }
/* =========================================================
   CUSTOMER SIGNUP CONTROLLER
   File: js/signup.js

   Purpose:
   - Creates a Supabase Auth customer account.
   - Saves full_name into Supabase user metadata.
   - Creates/updates the matching row in public.profiles.
   - Prevents customer portal from showing email as the name.

   Business rule:
   Every customer account should have a real full name because Go East
   Mechanics needs customer-facing portals, invoices, receipts, and service
   history to look professional.
   ========================================================= */

   const signupForm = document.getElementById("signupForm");

   signupForm.addEventListener("submit", async function (event) {
     event.preventDefault();
   
     const button = signupForm.querySelector("button");
     button.disabled = true;
     button.textContent = "Creating account...";
   
     const fullName = document.getElementById("fullName").value.trim();
     const email = document.getElementById("email").value.trim().toLowerCase();
     const password = document.getElementById("password").value.trim();
     const confirmPassword = document.getElementById("confirmPassword").value.trim();
   
     if (!fullName) {
       alert("Please enter your full name.");
       button.disabled = false;
       button.textContent = "Create Account";
       return;
     }
   
     if (fullName.length < 2) {
       alert("Full name must be at least 2 characters.");
       button.disabled = false;
       button.textContent = "Create Account";
       return;
     }
   
     if (password !== confirmPassword) {
       alert("Passwords do not match.");
       button.disabled = false;
       button.textContent = "Create Account";
       return;
     }
   
     if (password.length < 8) {
       alert("Password must be at least 8 characters.");
       button.disabled = false;
       button.textContent = "Create Account";
       return;
     }
   
     const { data, error } = await supabaseClient.auth.signUp({
       email,
       password,
       options: {
         data: {
           full_name: fullName,
           role: "customer"
         }
       }
     });
   
     if (error) {
       alert("Signup failed: " + error.message);
       button.disabled = false;
       button.textContent = "Create Account";
       return;
     }
   
     if (data.user) {
       await upsertCustomerProfile(data.user.id, email, fullName);
     }
   
     if (data.session) {
       window.location.href = "customer.html";
     } else {
       alert("Account created. Please check your email to confirm your account, then login.");
       window.location.href = "login.html";
     }
   });
   
   
   async function upsertCustomerProfile(userId, email, fullName) {
     const { error } = await supabaseClient
       .from("profiles")
       .upsert(
         {
           id: userId,
           email,
           full_name: fullName,
           role: "customer"
         },
         {
           onConflict: "id"
         }
       );
   
     if (error) {
       console.error("Profile creation warning:", error.message);
     }
   }

-- Go East Mechanics authorization setup for Supabase
-- Run this in Supabase SQL Editor after confirming your existing table names/columns.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'customer' check (role in ('developer', 'upper_admin', 'receptionist', 'customer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.current_role() in ('developer', 'upper_admin', 'receptionist');
$$;

create or replace function public.has_full_staff_access()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.current_role() in ('developer', 'upper_admin');
$$;

alter table public.profiles enable row level security;
alter table public.service_requests enable row level security;

-- Profiles
create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "Developer can read all profiles"
on public.profiles for select
to authenticated
using (public.current_role() = 'developer');

create policy "Developer can manage profiles"
on public.profiles for all
to authenticated
using (public.current_role() = 'developer')
with check (public.current_role() = 'developer');

-- Service requests
create policy "Anyone can create service requests"
on public.service_requests for insert
to anon, authenticated
with check (true);

create policy "Staff can read all service requests"
on public.service_requests for select
to authenticated
using (public.is_staff());

create policy "Customers can read their own service requests"
on public.service_requests for select
to authenticated
using (email = auth.jwt()->>'email');

create policy "Developer and upper admin can update service requests"
on public.service_requests for update
to authenticated
using (public.has_full_staff_access())
with check (public.has_full_staff_access());

create policy "Receptionist can acknowledge service requests"
on public.service_requests for update
to authenticated
using (public.current_role() = 'receptionist')
with check (public.current_role() = 'receptionist' and status = 'acknowledged');

-- Recommended: enable these only if the tables exist.
-- alter table public.invoices enable row level security;
-- alter table public.payments enable row level security;
-- create policy "Full staff can manage invoices" on public.invoices for all to authenticated using (public.has_full_staff_access()) with check (public.has_full_staff_access());
-- create policy "Customers can read own invoices" on public.invoices for select to authenticated using (customer_email = auth.jwt()->>'email');
-- create policy "Full staff can manage payments" on public.payments for all to authenticated using (public.has_full_staff_access()) with check (public.has_full_staff_access());
-- create policy "Customers can read own payments" on public.payments for select to authenticated using (invoice_id in (select id from public.invoices where customer_email = auth.jwt()->>'email'));

-- Create the first developer manually. Replace this email with your developer/admin email.
-- update public.profiles set role = 'developer' where id = (select id from auth.users where email = 'YOUR_EMAIL_HERE');

about.html

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About Us | Go East Mechanics</title>

  <link rel="stylesheet" href="css/style.css">
  
</head>

<body>

<header class="navbar">
  <div class="logo">GO EAST <span>MECHANICS</span></div>

  <nav class="nav-links" id="navLinks">
    <a href="index.html">Home</a>
    <a href="services.html">Services</a>
    <a href="about.html">About</a>
    <a href="inventory.html">Inventory</a>
    <a href="contact.html">Book Service</a>
    <a href="login.html">Login</a>
    <a href="signup.html">Sign Up</a>
  </nav>

  <button class="menu-btn" id="menuBtn">☰</button>
</header>

<section class="hero page-hero">
  <div class="hero-content">
    <p class="tagline">Learn More About Us</p>
    <h1>About Go East Mechanics</h1>
    <p class="hero-text">
      Dependable automotive repairs and vehicle solutions built on honesty,
      professionalism, and quality workmanship.
    </p>
  </div>
</section>

<section class="section">
  <div class="section-title">
    <p>Who We Are</p>
    <h2>Your Trusted Automotive Partner</h2>
  </div>

  <p class="center-text">
    Go East Mechanics supports drivers with reliable vehicle repair, maintenance,
    inspection, and service communication. Our goal is to make every customer feel
    informed, respected, and confident before, during, and after service.
  </p>
</section>

<section class="section services-preview">
  <div class="section-title">
    <p>Our Mission</p>
    <h2>What We Stand For</h2>
  </div>

  <div class="cards">
    <div class="card">
      <h3>Quality</h3>
      <p>We aim to provide dependable service using practical repair methods and careful review.</p>
    </div>

    <div class="card">
      <h3>Integrity</h3>
      <p>We believe in honest recommendations, clear explanations, and fair customer treatment.</p>
    </div>

    <div class="card">
      <h3>Reliability</h3>
      <p>We focus on repairs and maintenance that help customers drive with confidence.</p>
    </div>

    <div class="card">
      <h3>Customer Care</h3>
      <p>We value long-term trust, respectful communication, and practical support.</p>
    </div>
  </div>
</section>

<section class="section why-us">
  <div class="section-title">
    <p>Our Values</p>
    <h2>What Sets Us Apart</h2>
  </div>

  <div class="why-grid">
    <div>✓ Honest Advice</div>
    <div>✓ Fair Pricing</div>
    <div>✓ Skilled Technicians</div>
    <div>✓ Reliable Repairs</div>
  </div>
</section>

<section class="cta">
  <h2>Ready To Work With Us?</h2>
  <p>Submit a service request and let our team review your vehicle needs.</p>
  <a href="contact.html" class="btn secondary-btn">Book Service</a>
</section>

<footer>
  <p>© 2026 Go East Mechanics. All Rights Reserved.</p>
</footer>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/auth-config.js"></script>
<script src="js/script.js"></script>

</body>
</html>
Customer.html

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Customer Dashboard | Go East Mechanics</title>

  <link rel="stylesheet" href="css/admin.css">

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>

<body>

  <aside class="sidebar">

    <div class="sidebar-logo">
      GO EAST <span>MECHANICS</span>
    </div>

    <nav class="sidebar-nav">
      <button class="nav-btn active" data-section="vehiclesSection">
        My Garage
      </button>

      <button class="nav-btn" data-section="requestsSection">
        My Requests
      </button>

      <button class="nav-btn" data-section="invoicesSection">
        My Invoices
      </button>

      <button class="nav-btn" data-section="paymentsSection">
        Payments
      </button>
    </nav>

    <div class="sidebar-footer">
      <a href="index.html">View Website</a>
      <a href="contact.html">Book Service</a>
      <button id="logoutBtn">Logout</button>
    </div>

  </aside>

  <main class="admin-main">

    <header class="admin-topbar">

      <div>
        <p class="top-label">Customer Portal</p>
        <h1>My Dashboard</h1>
      </div>

      <div class="profile-card">
        <div class="profile-avatar" id="customerInitials">?</div>
        <div>
          <strong id="customerEmail">Loading...</strong>
          <span id="customerRoleBadge">Customer Portal</span>
        </div>
      </div>

    </header>

    <section class="stats-grid">
      <div class="stat-card">
        <h3 id="totalRequests">0</h3>
        <p>Total Requests</p>
      </div>

      <div class="stat-card blue">
        <h3 id="newRequests">0</h3>
        <p>New</p>
      </div>

      <div class="stat-card orange">
        <h3 id="ongoingRequests">0</h3>
        <p>Ongoing</p>
      </div>

      <div class="stat-card green">
        <h3 id="finishedRequests">0</h3>
        <p>Finished</p>
      </div>
    </section>

    <section id="vehiclesSection" class="admin-section active-section">
      <div class="section-heading">
        <p>My Garage</p>
        <h2>My Vehicles</h2>
      </div>

      <form id="vehicleForm" class="admin-form">
        <input type="text" id="vehicleYear" placeholder="Year e.g. 2018">
        <input type="text" id="vehicleMake" placeholder="Make e.g. Audi">
        <input type="text" id="vehicleModel" placeholder="Model e.g. A3" required>
        <input type="text" id="vehicleTrim" placeholder="Trim e.g. 2.0T">
        <input type="text" id="vehiclePlate" placeholder="License Plate">
        <input type="text" id="vehicleVin" placeholder="VIN">
        <input type="text" id="vehicleMileage" placeholder="Mileage">
        <textarea id="vehicleNotes" placeholder="Vehicle notes"></textarea>

        <button type="submit">Add Vehicle</button>
      </form>

      <div id="customerVehicles" class="cards-list">
        <p class="empty-message">Loading vehicles...</p>
      </div>
    </section>

    <section id="requestsSection" class="admin-section">
      <div class="section-heading">
        <p>Service Requests</p>
        <h2>My Vehicle Service Requests</h2>
      </div>

      <div id="customerRequests" class="cards-list">
        <p class="empty-message">Loading your requests...</p>
      </div>
    </section>

    <section id="invoicesSection" class="admin-section">
      <div class="section-heading">
        <p>Invoices</p>
        <h2>My Invoices</h2>
      </div>

      <div id="customerInvoices" class="cards-list">
        <p class="empty-message">Loading invoices...</p>
      </div>
    </section>

    <section id="paymentsSection" class="admin-section">
      <div class="section-heading">
        <p>Payments</p>
        <h2>My Payment Records</h2>
      </div>

      <div id="customerPayments" class="cards-list">
        <p class="empty-message">Loading payments...</p>
      </div>
    </section>

  </main>

  <script src="js/auth-config.js"></script>
  <script src="js/customer-auth.js"></script>
  <script src="js/customer-vehicles.js"></script>
  <script src="js/customer-requests.js"></script>
  <script src="js/customer-invoices.js"></script>
  <script src="js/customer-payments.js"></script>
  <script src="js/customer.js"></script>

</body>
</html><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Customer Dashboard | Go East Mechanics</title>

  <link rel="stylesheet" href="css/admin.css">

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>

<body>

  <aside class="sidebar">

    <div class="sidebar-logo">
      GO EAST <span>MECHANICS</span>
    </div>

    <nav class="sidebar-nav">
      <button class="nav-btn active" data-section="vehiclesSection">
        My Garage
      </button>

      <button class="nav-btn" data-section="requestsSection">
        My Requests
      </button>

      <button class="nav-btn" data-section="invoicesSection">
        My Invoices
      </button>

      <button class="nav-btn" data-section="paymentsSection">
        Payments
      </button>
    </nav>

    <div class="sidebar-footer">
      <a href="index.html">View Website</a>
      <a href="contact.html">Book Service</a>
      <button id="logoutBtn">Logout</button>
    </div>

  </aside>

  <main class="admin-main">

    <header class="admin-topbar">

      <div>
        <p class="top-label">Customer Portal</p>
        <h1>My Dashboard</h1>
      </div>

      <div class="profile-card">
        <div class="profile-avatar" id="customerInitials">?</div>
        <div>
          <strong id="customerEmail">Loading...</strong>
          <span id="customerRoleBadge">Customer Portal</span>
        </div>
      </div>

    </header>

    <section class="stats-grid">
      <div class="stat-card">
        <h3 id="totalRequests">0</h3>
        <p>Total Requests</p>
      </div>

      <div class="stat-card blue">
        <h3 id="newRequests">0</h3>
        <p>New</p>
      </div>

      <div class="stat-card orange">
        <h3 id="ongoingRequests">0</h3>
        <p>Ongoing</p>
      </div>

      <div class="stat-card green">
        <h3 id="finishedRequests">0</h3>
        <p>Finished</p>
      </div>
    </section>

    <section id="vehiclesSection" class="admin-section active-section">
      <div class="section-heading">
        <p>My Garage</p>
        <h2>My Vehicles</h2>
      </div>

      <form id="vehicleForm" class="admin-form">
        <input type="text" id="vehicleYear" placeholder="Year e.g. 2018">
        <input type="text" id="vehicleMake" placeholder="Make e.g. Audi">
        <input type="text" id="vehicleModel" placeholder="Model e.g. A3" required>
        <input type="text" id="vehicleTrim" placeholder="Trim e.g. 2.0T">
        <input type="text" id="vehiclePlate" placeholder="License Plate">
        <input type="text" id="vehicleVin" placeholder="VIN">
        <input type="text" id="vehicleMileage" placeholder="Mileage">
        <textarea id="vehicleNotes" placeholder="Vehicle notes"></textarea>

        <button type="submit">Add Vehicle</button>
      </form>

      <div id="customerVehicles" class="cards-list">
        <p class="empty-message">Loading vehicles...</p>
      </div>
    </section>

    <section id="requestsSection" class="admin-section">
      <div class="section-heading">
        <p>Service Requests</p>
        <h2>My Vehicle Service Requests</h2>
      </div>

      <div id="customerRequests" class="cards-list">
        <p class="empty-message">Loading your requests...</p>
      </div>
    </section>

    <section id="invoicesSection" class="admin-section">
      <div class="section-heading">
        <p>Invoices</p>
        <h2>My Invoices</h2>
      </div>

      <div id="customerInvoices" class="cards-list">
        <p class="empty-message">Loading invoices...</p>
      </div>
    </section>

    <section id="paymentsSection" class="admin-section">
      <div class="section-heading">
        <p>Payments</p>
        <h2>My Payment Records</h2>
      </div>

      <div id="customerPayments" class="cards-list">
        <p class="empty-message">Loading payments...</p>
      </div>
    </section>

  </main>

  <script src="js/auth-config.js"></script>
  <script src="js/customer-auth.js"></script>
  <script src="js/customer-vehicles.js"></script>
  <script src="js/customer-requests.js"></script>
  <script src="js/customer-invoices.js"></script>
  <script src="js/customer-payments.js"></script>
  <script src="js/customer.js"></script>

</body>
</html>contact.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Book Service | Go East Mechanics</title>

  <link rel="stylesheet" href="css/style.css">
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>

<body>

<header class="navbar">
  <div class="logo">GO EAST <span>MECHANICS</span></div>

  <nav class="nav-links" id="navLinks">
    <a href="index.html">Home</a>
    <a href="services.html">Services</a>
    <a href="about.html">About</a>
    <a href="inventory.html">Inventory</a>
    <a href="contact.html">Book Service</a>
    <a href="login.html">Login</a>
    <a href="signup.html">Sign Up</a>
    <a href="admin.html">Admin</a>
  </nav>

  <button class="menu-btn" id="menuBtn">☰</button>
</header>

<section class="hero page-hero">
  <div class="hero-content">
    <p class="tagline">Book Your Appointment</p>
    <h1>Schedule Your Vehicle Service</h1>
    <p class="hero-text">
      Complete the form below to request a repair, maintenance appointment,
      or vehicle inspection. Our team will review your request and contact
      you to confirm your booking.
    </p>
  </div>
</section>

<section class="section">
  <div class="section-title">
    <p>Service Request</p>
    <h2>Book Your Service</h2>
  </div>

  <div id="bookingProfileCard" class="booking-profile-card hidden">
    <div class="booking-avatar" id="bookingInitials">?</div>
    <div>
      <p>Booking as</p>
      <h3 id="bookingName">Customer</h3>
      <span id="bookingEmail">customer@email.com</span>
    </div>
  </div>

  <form id="contactForm" class="contact-form">

    <input type="text" id="name" placeholder="Full Name" required>

    <input type="email" id="email" placeholder="Email Address" required>

    <input type="tel" id="phone" placeholder="Phone Number">

    <label class="form-label" for="savedVehicleSelect">
      Select a saved vehicle
    </label>

    <select id="savedVehicleSelect">
      <option value="">Loading saved vehicles...</option>
    </select>

    <p class="form-helper">
      Or enter a different vehicle below.
    </p>

    <input
      type="text"
      id="vehicle"
      placeholder="Vehicle Make, Model & Year"
    >

    <textarea
      id="message"
      placeholder="Please describe the issue or service you need..."
      required
    ></textarea>

    <button class="btn primary-btn" type="submit">
      Submit Service Request
    </button>

  </form>
</section>

<section class="cta">
  <h2>Need Immediate Assistance?</h2>
  <p>
    Submit your request online and one of our team members will contact you
    as soon as possible.
  </p>

  <a href="tel:+10000000000" class="btn secondary-btn">
    Call Our Shop
  </a>
</section>

<footer>
  <p>© 2026 Go East Mechanics. All Rights Reserved.</p>
</footer>

<script src="js/auth-config.js"></script>
<script src="js/script.js"></script>
<script src="js/contact.js"></script>

</body>
</html>

index.html

<!DOCTYPE html>
<html lang="en">
<head>
  <!--
    index.html
    Public homepage for Go East Mechanics.

    This page is now session-aware:
    - Logged-out users see Login / Sign Up.
    - Customers see My Dashboard / Logout + profile badge.
    - Staff see Dashboard / Logout + profile badge.
  -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Go East Mechanics | Auto Repairs & Vehicle Sales</title>

  <link rel="stylesheet" href="css/style.css">

  <!-- Supabase SDK required for session-aware navbar -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>

<body>
  <header class="navbar">
    <div class="logo">GO EAST <span>MECHANICS</span></div>

    <nav class="nav-links" id="navLinks">
      <a href="index.html">Home</a>
      <a href="services.html">Services</a>
      <a href="about.html">About</a>
      <a href="inventory.html">Inventory</a>
      <a href="contact.html">Book Service</a>

      <!-- Auth links are replaced dynamically by js/script.js -->
      <span id="authNavLinks">
        <a href="login.html">Login</a>
        <a href="signup.html">Sign Up</a>
      </span>

      <!-- Logged-in profile badge is filled by js/script.js -->
      <div id="publicProfileBadge" class="public-profile-badge hidden"></div>
    </nav>

    <button class="menu-btn" id="menuBtn">☰</button>
  </header>

  <section class="hero">
    <div class="hero-content">
      <p class="tagline">Trusted Auto Repair & Vehicle Sales</p>
      <h1>Quality Repairs You Can Trust</h1>

      <p class="hero-text">
        Go East Mechanics provides reliable automotive repairs, maintenance,
        diagnostics, and vehicle sales at fair prices.
      </p>

      <div class="hero-buttons">
        <a href="contact.html" class="btn primary-btn">Book Service</a>
        <a href="services.html" class="btn secondary-btn">View Services</a>
      </div>
    </div>
  </section>

  <section class="section about-preview">
    <div class="section-title">
      <p>About Us</p>
      <h2>Your Local Mechanic Shop</h2>
    </div>

    <p class="center-text">
      We help drivers keep their vehicles safe, reliable, and road-ready.
      Whether you need an oil change, brake repair, diagnostics, inspection,
      or used vehicle support, Go East Mechanics is here to help.
    </p>
  </section>

  <section class="section services-preview">
    <div class="section-title">
      <p>What We Do</p>
      <h2>Our Main Services</h2>
    </div>

    <div class="cards">
      <div class="card">
        <h3>Brake Service</h3>
        <p>Brake inspections, repairs, pad replacement, and safety checks.</p>
      </div>

      <div class="card">
        <h3>Oil Changes</h3>
        <p>Fast oil changes to keep your engine clean and protected.</p>
      </div>

      <div class="card">
        <h3>Diagnostics</h3>
        <p>Check engine light scans and vehicle issue troubleshooting.</p>
      </div>

      <div class="card">
        <h3>Vehicle Sales</h3>
        <p>Affordable used vehicles available depending on current inventory.</p>
      </div>
    </div>
  </section>

  <section class="section why-us">
    <div class="section-title">
      <p>Why Choose Us</p>
      <h2>Honest Service. Fair Pricing.</h2>
    </div>

    <div class="why-grid">
      <div>✓ Experienced Mechanics</div>
      <div>✓ Honest Recommendations</div>
      <div>✓ Fair Prices</div>
      <div>✓ Reliable Repairs</div>
    </div>
  </section>

  <section class="cta">
    <h2>Need Your Vehicle Repaired?</h2>
    <p>Contact Go East Mechanics today to book a service appointment.</p>
    <a href="contact.html" class="btn primary-btn">Contact Us</a>
  </section>

  <footer>
    <p>© 2026 Go East Mechanics. All Rights Reserved.</p>
  </footer>

  <!-- Script order matters -->
  <script src="js/auth-config.js"></script>
  <script src="js/script.js"></script>
</body>
</html>

inventory.html

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vehicle Inventory | Go East Mechanics</title>

  <link rel="stylesheet" href="css/style.css">
</head>

<body>

<header class="navbar">
  <div class="logo">GO EAST <span>MECHANICS</span></div>

  <nav class="nav-links" id="navLinks">
    <a href="index.html">Home</a>
    <a href="services.html">Services</a>
    <a href="about.html">About</a>
    <a href="inventory.html">Inventory</a>
    <a href="contact.html">Book Service</a>
    <a href="login.html">Login</a>
    <a href="signup.html">Sign Up</a>
  </nav>

  <button class="menu-btn" id="menuBtn">☰</button>
</header>

<section class="hero page-hero">
  <div class="hero-content">
    <p class="tagline">Quality Pre-Owned Vehicles</p>
    <h1>Available Inventory</h1>
    <p class="hero-text">
      Browse our selection of inspected, reliable vehicles. Every vehicle is carefully
      reviewed before being offered for sale.
    </p>
  </div>
</section>

<section class="section services-preview">
  <div class="section-title">
    <p>Current Stock</p>
    <h2>Vehicles Available Today</h2>
  </div>

  <div class="cards">
    <div class="card">
      <h3>2019 Toyota Corolla LE</h3>
      <p><strong>Price:</strong> $18,995</p>
      <p><strong>Mileage:</strong> 82,000 km</p>
      <p><strong>Transmission:</strong> Automatic</p>
      <p><strong>Fuel:</strong> Gasoline</p>
      <p>Fuel-efficient sedan with dependable reliability and practical daily-driver value.</p>
    </div>

    <div class="card">
      <h3>2020 Honda Civic EX</h3>
      <p><strong>Price:</strong> $21,500</p>
      <p><strong>Mileage:</strong> 68,000 km</p>
      <p><strong>Transmission:</strong> Automatic</p>
      <p><strong>Fuel:</strong> Gasoline</p>
      <p>Comfortable daily driver with modern features and strong fuel economy.</p>
    </div>

    <div class="card">
      <h3>2018 Ford Escape SE</h3>
      <p><strong>Price:</strong> $19,900</p>
      <p><strong>Mileage:</strong> 94,000 km</p>
      <p><strong>Transmission:</strong> Automatic AWD</p>
      <p><strong>Fuel:</strong> Gasoline</p>
      <p>Practical SUV with cargo space, family usability, and all-wheel-drive support.</p>
    </div>

    <div class="card">
      <h3>2021 Hyundai Elantra Preferred</h3>
      <p><strong>Price:</strong> $23,900</p>
      <p><strong>Mileage:</strong> 45,000 km</p>
      <p><strong>Transmission:</strong> Automatic</p>
      <p><strong>Fuel:</strong> Gasoline</p>
      <p>Modern compact sedan with efficient performance and useful comfort features.</p>
    </div>
  </div>
</section>

<section class="cta">
  <h2>Looking For Something Specific?</h2>
  <p>Tell us what you are looking for and we can help review available vehicle options.</p>
  <a href="contact.html" class="btn secondary-btn">Contact Us</a>
</section>

<footer>
  <p>© 2026 Go East Mechanics. All Rights Reserved.</p>
</footer>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/auth-config.js"></script>
<script src="js/script.js"></script>

</body>
</html>

login.html

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login | Go East Mechanics</title>

  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/auth.css">

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>

<header class="navbar">

    <div class="logo">
        GO EAST <span>MECHANICS</span>
    </div>

    <nav class="nav-links" id="navLinks">
        <a href="index.html">Home</a>
        <a href="services.html">Services</a>
        <a href="about.html">About</a>
        <a href="inventory.html">Inventory</a>
        <a href="contact.html">Book Service</a>
        <a href="login.html">Login</a>
        <a href="signup.html">Sign Up</a>
    </nav>

    <button class="menu-btn" id="menuBtn">☰</button>

</header>

<main class="auth-page">

    <section class="auth-card">

        <div class="auth-logo">
            GO EAST <span>MECHANICS</span>
        </div>

        <h1>Welcome Back</h1>

        <p class="auth-subtitle">
            Sign in to access your customer account or the admin dashboard.
        </p>

        <form id="loginForm" class="auth-form">

            <input
                type="email"
                id="email"
                placeholder="Email Address"
                required
            >

            <input
                type="password"
                id="password"
                placeholder="Password"
                required
            >

            <button type="submit">
                Login
            </button>

        </form>

        <p class="auth-link">
            Don't have an account?
            <a href="signup.html">Create an Account</a>
        </p>

        <p class="auth-link">
            <a href="index.html">← Return to Home</a>
        </p>

    </section>

</main>

<script src="js/script.js"></script>
<script src="js/auth-config.js"></script>
  <script src="js/login.js"></script>

</body>
</html>

services.html

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Services | Go East Mechanics</title>

  <link rel="stylesheet" href="css/style.css">
</head>

<body>

<header class="navbar">
  <div class="logo">GO EAST <span>MECHANICS</span></div>

  <nav class="nav-links" id="navLinks">
    <a href="index.html">Home</a>
    <a href="services.html">Services</a>
    <a href="about.html">About</a>
    <a href="inventory.html">Inventory</a>
    <a href="contact.html">Book Service</a>
    <a href="login.html">Login</a>
    <a href="signup.html">Sign Up</a>
  </nav>

  <button class="menu-btn" id="menuBtn">☰</button>
</header>

<section class="hero page-hero">
  <div class="hero-content">
    <p class="tagline">Professional Auto Care</p>
    <h1>Our Services</h1>
    <p class="hero-text">
      From regular maintenance to major repairs, we help keep your vehicle safe,
      reliable, and road-ready.
    </p>
  </div>
</section>

<section class="section services-preview">
  <div class="section-title">
    <p>What We Offer</p>
    <h2>Complete Automotive Services</h2>
  </div>

  <div class="cards">
    <div class="card">
      <h3>Engine Repair</h3>
      <p>Inspection and repair for performance issues, leaks, overheating, and warning signs.</p>
    </div>

    <div class="card">
      <h3>Brake Service</h3>
      <p>Brake pads, rotors, inspections, brake fluid checks, and safety-focused repair service.</p>
    </div>

    <div class="card">
      <h3>Oil Changes</h3>
      <p>Regular oil and filter changes to protect your engine and improve long-term performance.</p>
    </div>

    <div class="card">
      <h3>Diagnostics</h3>
      <p>Computer diagnostics, warning light scans, and troubleshooting for major vehicle systems.</p>
    </div>

    <div class="card">
      <h3>Suspension & Steering</h3>
      <p>Shock absorbers, struts, steering components, and suspension repair support.</p>
    </div>

    <div class="card">
      <h3>Tire Services</h3>
      <p>Tire installation, balancing, rotation, seasonal tire changes, and puncture repairs.</p>
    </div>

    <div class="card">
      <h3>Vehicle Inspections</h3>
      <p>Safety inspections, pre-purchase inspections, and maintenance evaluations.</p>
    </div>

    <div class="card">
      <h3>Battery & Electrical</h3>
      <p>Battery replacement, charging system diagnosis, alternators, starters, and electrical repairs.</p>
    </div>
  </div>
</section>

<section class="cta">
  <h2>Need Automotive Service?</h2>
  <p>Book your appointment online and let our team review your service request.</p>
  <a href="contact.html" class="btn secondary-btn">Book Service</a>
</section>

<footer>
  <p>© 2026 Go East Mechanics. All Rights Reserved.</p>
</footer>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/auth-config.js"></script>
<script src="js/script.js"></script>

</body>
</html>

signup.html

<!DOCTYPE html>
<html lang="en">
<head>
  <!--
    signup.html
    Purpose:
    Customer account creation page.

    Important:
    New customers must enter their full name so the portal can display
    a real customer name instead of only an email/username.
  -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Create Account | Go East Mechanics</title>

  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="css/auth.css" />

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>

<body>
  <header class="navbar">
    <div class="logo">GO EAST <span>MECHANICS</span></div>

    <nav class="nav-links" id="navLinks">
      <a href="index.html">Home</a>
      <a href="services.html">Services</a>
      <a href="about.html">About</a>
      <a href="inventory.html">Inventory</a>
      <a href="contact.html">Book Service</a>
      <a href="login.html">Login</a>
      <a href="signup.html">Sign Up</a>
    </nav>

    <button class="menu-btn" id="menuBtn">☰</button>
  </header>

  <main class="auth-page">
    <section class="auth-card">
      <div class="auth-logo">GO EAST <span>MECHANICS</span></div>

      <h1>Create Your Account</h1>

      <p class="auth-subtitle">
        Create a customer account to book services, track repair progress,
        view invoices, and access your vehicle service history.
      </p>

      <form id="signupForm" class="auth-form">
        <input
          type="text"
          id="fullName"
          placeholder="Full Name"
          autocomplete="name"
          required
        />

        <input
          type="email"
          id="email"
          placeholder="Email Address"
          autocomplete="email"
          required
        />

        <input
          type="password"
          id="password"
          placeholder="Password"
          autocomplete="new-password"
          required
        />

        <input
          type="password"
          id="confirmPassword"
          placeholder="Confirm Password"
          autocomplete="new-password"
          required
        />

        <button type="submit">Create Account</button>
      </form>

      <p class="auth-link">
        Already have an account?
        <a href="login.html">Login Here</a>
      </p>

      <p class="auth-link">
        <a href="index.html">← Return to Home</a>
      </p>
    </section>
  </main>

  <script src="js/script.js"></script>
  <script src="js/auth-config.js"></script>
  <script src="js/signup.js"></script>
</body>
</html>


Pasted code(8).css
File

Pasted code (2)(9).js
JavaScript
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About Us | Go East Mechanics</title>

  <link rel="stylesheet" href="css/style.css">
  
</head>

<body>

<header class="navbar">
  <div class="logo">GO EAST <span>MECHANICS</span></div>

  <nav class="nav-links" id="navLinks">
    <a href="index.html">Home</a>
    <a href="services.html">Services</a>
    <a href="about.html">About</a>
    <a href="inventory.html">Inventory</a>
    <a href="contact.html">Book Service</a>
    <a href="login.html">Login</a>
    <a href="signup.html">Sign Up</a>
  </nav>

  <button class="menu-btn" id="menuBtn">☰</button>
</header>

<section class="hero page-hero">
  <div class="hero-content">
    <p class="tagline">Learn More About Us</p>
    <h1>About Go East Mechanics</h1>
    <p class="hero-text">
      Dependable automotive repairs and vehicle solutions built on honesty,
      professionalism, and quality workmanship.
    </p>
  </div>
</section>

<section class="section">
  <div class="section-title">
    <p>Who We Are</p>
    <h2>Your Trusted Automotive Partner</h2>
  </div>

  <p class="center-text">
    Go East Mechanics supports drivers with reliable vehicle repair, maintenance,
    inspection, and service communication. Our goal is to make every customer feel
    informed, respected, and confident before, during, and after service.
  </p>
</section>

<section class="section services-preview">
  <div class="section-title">
    <p>Our Mission</p>
    <h2>What We Stand For</h2>
  </div>

  <div class="cards">
    <div class="card">
      <h3>Quality</h3>
      <p>We aim to provide dependable service using practical repair methods and careful review.</p>
    </div>

    <div class="card">
      <h3>Integrity</h3>
      <p>We believe in honest recommendations, clear explanations, and fair customer treatment.</p>
    </div>

    <div class="card">
      <h3>Reliability</h3>
      <p>We focus on repairs and maintenance that help customers drive with confidence.</p>
    </div>

    <div class="card">
      <h3>Customer Care</h3>
      <p>We value long-term trust, respectful communication, and practical support.</p>
    </div>
  </div>
</section>

<section class="section why-us">
  <div class="section-title">
    <p>Our Values</p>
    <h2>What Sets Us Apart</h2>
  </div>

  <div class="why-grid">
    <div>✓ Honest Advice</div>
    <div>✓ Fair Pricing</div>
    <div>✓ Skilled Technicians</div>
    <div>✓ Reliable Repairs</div>
  </div>
</section>

<section class="cta">
  <h2>Ready To Work With Us?</h2>
  <p>Submit a service request and let our team review your vehicle needs.</p>
  <a href="contact.html" class="btn secondary-btn">Book Service</a>
</section>

<footer>
  <p>© 2026 Go East Mechanics. All Rights Reserved.</p>
</footer>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/auth-config.js"></script>
<script src="js/script.js"></script>

</body>
</html>

/* =========================================================
   ADMIN APP CONTROLLER
   File: js/admin.js

   Purpose:
   This file is now the startup controller for the admin dashboard.

   It does NOT contain heavy business logic anymore.

   It only:
   1. Checks staff access.
   2. Applies dashboard UI for the logged-in role.
   3. Loads service request data.
   4. Starts realtime updates.
   5. Connects logout.

   Other files will handle the actual feature logic.
   ========================================================= */


/* =========================================================
   1. APP STARTUP

   initializeAdminDashboard() is the main entry point.

   It runs after:
   - auth-config.js
   - admin-auth.js
   - admin-dashboard.js
   - admin-updates.js
   - admin-requests.js

   have already loaded.
   ========================================================= */

   async function initializeAdminDashboard() {
    /*
      Step 1:
      Verify that the logged-in user is allowed to access admin.html.
  
      checkStaffAccess() comes from admin-auth.js.
    */
    const isAuthorized = await checkStaffAccess();
  
    if (!isAuthorized) {
      return;
    }
  
    /*
      Step 2:
      Apply role-based UI.
  
      applyAdminProfileUI() and applyRoleUI() will come from
      admin-dashboard.js in the next step.
    */
    if (typeof applyAdminProfileUI === "function") {
      applyAdminProfileUI();
    }
  
    if (typeof applyRoleUI === "function") {
      applyRoleUI();
    }
  
    /*
      Step 3:
      Show the first section this user is allowed to access.
  
      showFirstAllowedSection() will come from admin-dashboard.js.
    */
    if (typeof showFirstAllowedSection === "function") {
      showFirstAllowedSection();
    }
  
    /*
      Step 4:
      Load service requests.
  
      loadServiceRequests() will come from admin-requests.js.
    */
    if (typeof loadServiceRequests === "function") {
      await loadServiceRequests();
    }
    if (typeof loadAdminPayments === "function") {
      await loadAdminPayments();
    }

    if (typeof loadMechanicBoard === "function") {
      await loadMechanicBoard();
    }
    
    if (typeof loadAdminInvoices === "function") {
      await loadAdminInvoices();
    }
    if (typeof loadInventoryItems === "function") {
      await loadInventoryItems();
    }
  
    /*
      Step 5:
      Start realtime updates.
  
      subscribeStaffRealtime() will come from admin-requests.js later.
    */
    if (typeof subscribeStaffRealtime === "function") {
      subscribeStaffRealtime();
    }
  
    /*
      Step 6:
      Connect logout button.
  
      logoutStaffUser() comes from admin-auth.js.
    */
    const logoutBtn = document.getElementById("logoutBtn");
  
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logoutStaffUser);
    }
  }
  
  
  /* =========================================================
     2. START APPLICATION
  
     This starts the dashboard once the browser has loaded this file.
     ========================================================= */
  
  initializeAdminDashboard();



/* =========================================================
   ADMIN WORKSPACE COMPONENT
   File: js/ui/admin-workspace.js

   Purpose:
   Creates reusable enterprise workspace HTML.

   Pattern:
   Header
   Toolbar
   Body
   Tabs
   Panels

   Used by:
   - Service Requests
   - Mechanic Jobs
   - Customers
   - Inventory
   - Invoices
   - Payments
   ========================================================= */


   function renderWorkspaceHeader(config = {}) {
    return 
      <div class="workspace-header">
        <div>
          <p class="workspace-kicker">${safeText(config.kicker || "Workspace")}</p>
          <h2 class="workspace-title">${safeText(config.title || "Untitled Workspace")}</h2>
          <p class="workspace-subtitle">${safeText(config.subtitle || "")}</p>
        </div>
  
        <div class="workspace-actions">
          ${config.actions || ""}
        </div>
      </div>
    ;
  }
  
  
  function renderWorkspaceTabs(tabs = []) {
    if (!Array.isArray(tabs) || tabs.length === 0) return "";
  
    return 
      <div class="workspace-tabs">
        ${tabs.map((tab, index) => 
          <button
            type="button"
            class="workspace-tab-btn ${index === 0 ? "active" : ""}"
            data-tab="${safeText(tab.id)}"
          >
            ${safeText(tab.label)}
          </button>
        ).join("")}
      </div>
    ;
  }
  
  
  function renderWorkspacePanels(tabs = []) {
    if (!Array.isArray(tabs) || tabs.length === 0) {
      return 
        <div class="workspace-panel active">
          ${typeof renderEmptyState === "function"
            ? renderEmptyState("No workspace content", "This workspace does not have any panels yet.")
            : <p class="workspace-empty">No workspace content available.</p>
          }
        </div>
      ;
    }
  
    return tabs.map((tab, index) => 
      <div
        class="workspace-panel ${index === 0 ? "active" : ""}"
        data-panel="${safeText(tab.id)}"
      >
        ${tab.content || ""}
      </div>
    ).join("");
  }
  
  
  function renderWorkspace(config = {}) {
    const tabs = Array.isArray(config.tabs) ? config.tabs : [];
  
    return 
      <div class="workspace-shell">
        ${renderWorkspaceHeader(config)}
  
        ${config.toolbar ? 
          <div class="workspace-toolbar">
            ${config.toolbar}
          </div>
         : ""}
  
        <div class="workspace-body">
          ${renderWorkspaceTabs(tabs)}
          ${renderWorkspacePanels(tabs)}
        </div>
      </div>
    ;
  }
  
  
  function renderInfoCard(label, value) {
    return 
      <div class="workspace-info-card">
        <span>${safeText(label)}</span>
        <strong>${safeText(value, "-")}</strong>
      </div>
    ;
  }
  
  
  function renderInfoGrid(items = []) {
    if (!Array.isArray(items) || items.length === 0) {
      return typeof renderEmptyState === "function"
        ? renderEmptyState("No information available", "There are no details to display.")
        : <p class="workspace-empty">No information available.</p>;
    }
  
    return 
      <div class="workspace-info-grid">
        ${items.map((item) => renderInfoCard(item.label, item.value)).join("")}
      </div>
    ;
  }



32d0091c-20a2-433a-849e-9468d03abef5.png
5cda32b8-25e8-4e12-a4d6-403e75ad145a.png
b7781f11-1339-408c-848f-fc6987e24354.png
8bab0fd8-bba9-4660-8a72-651e53ba4c01.png
28799570-3201-46ea-807f-386c126ebb34.png
6b89f703-08d5-46e5-a08b-e4290a489414.png
6a67f8d3-e984-464c-8ea4-25d62dedbe90.png
7e4b9edf-e138-4541-9013-6ad31274cd77.png
717fe85e-6d0a-4a4a-9a10-b45f00ee4dbd.png
221d293f-7257-4c11-b7af-e3d579eccbe4.png
2ad9081a-fb8a-447c-a7ad-495ffd795418.png
f1dd51aa-782c-45b3-a243-e3fdff0f9241.png
look at the screenshot and watch the flow. my adjust stock is not calculating and acting rigth. check it out and let me know if i am wrong or right. also give me what to provide to you to fix it if wrong. my notifications is coming out okay now at the top right corner,is that ok?

892d0cc3-6f19-4ad2-aa43-c58f8abe977d.png
6cbcd1df-60ad-45f5-944c-1cd752ccc50e.png
18d7f6e3-6c26-4868-bd8e-447c487e739d.png
a002da4a-ca45-4259-9b10-2f4c8a01ef28.png
/* =========================================================
   ADMIN INVENTORY ADJUSTMENTS MODULE
   File: js/admin-inventory-adjustments.js
========================================================= */

let adjustingInventoryItemId = null;

function openInventoryAdjustmentModal(item) {
  if (!item) {
    alert("Inventory item could not be found.");
    return;
  }

  if (typeof openAdminModal !== "function") {
    alert("Modal framework not loaded.");
    return;
  }

  adjustingInventoryItemId = item.id;

  openAdminModal({
    title: "Adjust Stock",
    subtitle: ${safeText(item.item_name, "Inventory Item")} • Current Qty: ${safeText(item.quantity, "0")},
    content: 
      <form id="inventoryAdjustmentModalForm" class="admin-modal-form">
        <label>
          Current Quantity
          <input id="adjustmentCurrentQuantity" type="number" value="${Number(item.quantity || 0)}" disabled>
        </label>

        <label>
          New Counted Quantity
          <input id="adjustmentNewQuantity" type="number" min="0" step="1" required>
        </label>

        <label>
          Reason
          <select id="adjustmentReason">
            <option value="CYCLE_COUNT">Cycle Count Correction</option>
            <option value="FOUND_STOCK">Found Extra Stock</option>
            <option value="MISSING_STOCK">Missing Stock</option>
            <option value="DAMAGED_STOCK">Damaged Stock</option>
            <option value="DATA_CORRECTION">Data Correction</option>
            <option value="MANUAL_ADJUSTMENT">Manual Adjustment</option>
          </select>
        </label>

        <label class="full-span">
          Adjustment Notes
          <textarea id="adjustmentNotes" placeholder="Explain why this adjustment is needed."></textarea>
        </label>
      </form>
    ,
    footer: 
      <button type="button" class="secondary-action-btn" onclick="closeAdminModal()">Cancel</button>
      <button type="button" class="primary-action-btn" onclick="submitInventoryAdjustmentFromModal()">Save Adjustment</button>
    
  });
}

async function submitInventoryAdjustmentFromModal() {
  if (!adjustingInventoryItemId) {
    if (typeof showToast === "function") {
      showToast(
        "warning",
        "No Item Selected",
        "Select an inventory item before adjusting stock."
      );
    }

    return;
  }

  const quantityInput = document.getElementById(
    "adjustmentNewQuantity"
  );

  const reasonInput = document.getElementById(
    "adjustmentReason"
  );

  const notesInput = document.getElementById(
    "adjustmentNotes"
  );

  if (!quantityInput || !reasonInput || !notesInput) {
    if (typeof showToast === "function") {
      showToast(
        "error",
        "Adjustment Form Error",
        "One or more adjustment form fields could not be found."
      );
    }

    return;
  }

  const newQuantity = inventoryNumber(quantityInput.value);

  if (newQuantity < 0) {
    if (typeof showToast === "function") {
      showToast(
        "warning",
        "Invalid Quantity",
        "The new inventory quantity cannot be negative."
      );
    }

    quantityInput.focus();
    return;
  }

  const reason = reasonInput.value;
  const notes = notesInput.value.trim();

  const submitButton = document.querySelector(
    "#adminModalBox .primary-action-btn"
  );

  const originalButtonText = submitButton
    ? submitButton.textContent
    : "Save Adjustment";

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Adjusting...";
  }

  try {
    const result = await adjustInventoryStock(
      adjustingInventoryItemId,
      newQuantity,
      {
        reference_type:
          reason || "MANUAL_ADJUSTMENT",

        notes:
          notes ||
          Manual inventory adjustment. Reason: ${
            reason || "Not specified"
          }
      }
    );

    if (!result.success) {
      if (typeof showToast === "function") {
        showToast(
          "error",
          "Adjustment Failed",
          result.message ||
            "The inventory quantity could not be adjusted."
        );
      }

      return;
    }

    adjustingInventoryItemId = null;

    if (typeof closeAdminModal === "function") {
      closeAdminModal();
    }

    if (typeof showToast === "function") {
      showToast(
        "success",
        "Stock Adjusted",
        Inventory quantity was updated to ${newQuantity}.
      );
    }

    if (typeof loadInventoryItems === "function") {
      await loadInventoryItems();
    }
  } catch (error) {
    console.error("Inventory adjustment error:", error);

    if (typeof showToast === "function") {
      showToast(
        "error",
        "Adjustment Failed",
        error?.message ||
          "An unexpected error occurred while adjusting inventory."
      );
    }
  } finally {
    if (
      submitButton &&
      document.body.contains(submitButton)
    ) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  }
}

/* Legacy support */
function openInventoryAdjustmentForm(itemId) {
  const item = inventoryItems.find((record) => String(record.id) === String(itemId));

  if (!item) {
    alert("Inventory item could not be found.");
    return;
  }

  openInventoryAdjustmentModal(item);
}

function closeInventoryAdjustmentForm() {
  adjustingInventoryItemId = null;

  if (typeof closeAdminModal === "function") {
    closeAdminModal();
  }
}

async function submitInventoryAdjustment(event) {
  event.preventDefault();
  await submitInventoryAdjustmentFromModal();
}

function bindInventoryAdjustmentButtons() {
  document.querySelectorAll(".adjust-stock-btn").forEach((button) => {
    button.addEventListener("click", function () {
      openInventoryAdjustmentForm(button.getAttribute("data-id"));
    });
  });
}

window.openInventoryAdjustmentModal = openInventoryAdjustmentModal;
window.openInventoryAdjustmentForm = openInventoryAdjustmentForm;
window.closeInventoryAdjustmentForm = closeInventoryAdjustmentForm;
window.submitInventoryAdjustmentFromModal = submitInventoryAdjustmentFromModal;
window.submitInventoryAdjustment = submitInventoryAdjustment;
window.bindInventoryAdjustmentButtons = bindInventoryAdjustmentButtons;

/* =========================================================
   ADMIN INVENTORY TRANSACTIONS MODULE
   File: js/admin-inventory-transactions.js

   Purpose:
   Core inventory transaction engine.

   Enterprise Rule:
   Inventory quantity should not be changed silently.
   Every stock movement must create a transaction record.

   Supported transaction types:
   - OPENING_BALANCE
   - RECEIVE
   - ISSUE
   - RETURN
   - ADJUSTMENT
   - TRANSFER
   - WARRANTY
   - DAMAGED
   - CYCLE_COUNT
   - PURCHASE
   ========================================================= */

/* =========================================================
   1. CREATE INVENTORY TRANSACTION

   Operation:
   - Reads current inventory item quantity.
   - Calculates new quantity.
   - Updates inventory_items.quantity.
   - Inserts inventory_transactions ledger record.

   This function becomes the single source for stock movement.
   ========================================================= */

   async function createInventoryTransaction(options) {
    if (!canManageInventory()) {
      return {
        success: false,
        message: "You do not have permission to manage inventory."
      };
    }
  
    const inventoryItemId = Number(options.inventory_item_id);
    const transactionType = options.transaction_type;
    const quantityChange = inventoryNumber(options.quantity_change);
  
    if (!inventoryItemId) {
      return {
        success: false,
        message: "Inventory item is required."
      };
    }
  
    if (!transactionType) {
      return {
        success: false,
        message: "Transaction type is required."
      };
    }
  
    if (quantityChange === 0) {
      return {
        success: false,
        message: "Quantity change cannot be zero."
      };
    }
  
    const { data: item, error: itemError } = await supabaseClient
      .from("inventory_items")
      .select("*")
      .eq("id", inventoryItemId)
      .single();
  
    if (itemError || !item) {
      return {
        success: false,
        message: "Inventory item could not be found."
      };
    }
  
    const previousQuantity = inventoryNumber(item.quantity);
    const newQuantity = previousQuantity + quantityChange;
  
    if (newQuantity < 0) {
      return {
        success: false,
        message: "This transaction would make stock negative."
      };
    }
  
    const { error: updateError } = await supabaseClient
      .from("inventory_items")
      .update({
        quantity: newQuantity,
        updated_by: currentUser ? currentUser.id : null
      })
      .eq("id", inventoryItemId);
  
    if (updateError) {
      return {
        success: false,
        message: "Inventory quantity could not be updated: " + updateError.message
      };
    }
  
    const transactionPayload = {
      inventory_item_id: inventoryItemId,
      transaction_type: transactionType,
      quantity_change: quantityChange,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      reference_type: options.reference_type || "MANUAL",
      reference_id: options.reference_id || null,
      supplier: options.supplier || item.supplier || null,
      location: options.location || item.location || null,
      unit_cost: inventoryNumber(options.unit_cost || item.cost_price || item.unit_price),
      unit_price: inventoryNumber(options.unit_price || item.selling_price || item.unit_price),
      notes: options.notes || null,
      performed_by: currentUser ? currentUser.id : null
    };
  
    const { error: transactionError } = await supabaseClient
      .from("inventory_transactions")
      .insert([transactionPayload]);
  
    if (transactionError) {
      /*
        Important:
        If this insert fails, quantity has already changed.
        In a later enterprise version, we should move this into a
        Supabase RPC/database transaction for true atomic safety.
      */
      return {
        success: false,
        message:
          "Quantity updated, but transaction record failed: " +
          transactionError.message
      };
    }
  
    return {
      success: true,
      message: "Inventory transaction completed successfully.",
      previous_quantity: previousQuantity,
      new_quantity: newQuantity
    };
  }
  
  /* =========================================================
     2. RECEIVE STOCK
  
     Operation:
     Adds inventory quantity and creates RECEIVE transaction.
     ========================================================= */
  
  async function receiveInventoryStock(itemId, quantity, options = {}) {
    return await createInventoryTransaction({
      inventory_item_id: itemId,
      transaction_type: "RECEIVE",
      quantity_change: Math.abs(inventoryNumber(quantity)),
      reference_type: options.reference_type || "MANUAL_RECEIVE",
      reference_id: options.reference_id || null,
      supplier: options.supplier || null,
      location: options.location || null,
      unit_cost: options.unit_cost || 0,
      unit_price: options.unit_price || 0,
      notes: options.notes || "Stock received manually."
    });
  }

/* =========================================================
   ADMIN INVENTORY UTILITIES
   File: js/admin-inventory-utils.js

   Purpose:
   Shared helper functions for the enterprise inventory system.

   Used by:
   - admin-inventory-items.js
   - admin-inventory-transactions.js
   - admin-inventory-history.js
   - admin-inventory-receiving.js
   - admin-inventory-adjustments.js
   - admin-inventory-bulk.js
   ========================================================= */

   function canManageInventory() {
    return (
      currentProfile &&
      ["developer", "upper_admin"].includes(currentProfile.role)
    );
  }
  
  function canDeleteInventoryItem() {
    return currentProfile && currentProfile.role === "developer";
  }
  
  function inventoryNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }
  
  function inventoryQuantityLabel(quantity, reorderLevel, isActive = true) {
    if (!isActive) return "Inactive";
    if (quantity <= 0) return "Out of Stock";
    if (quantity <= reorderLevel) return "Low Stock";
    return "In Stock";
  }
  
  function inventoryStatusClass(quantity, reorderLevel, isActive = true) {
    if (!isActive) return "status-cancelled";
    if (quantity <= 0) return "status-cancelled";
    if (quantity <= reorderLevel) return "status-waiting_parts";
    return "status-closed";
  }
  
  function inventoryFormatTransactionType(type) {
    if (!type) return "Transaction";
  
    return String(type)
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  
  function inventorySignedQuantity(value) {
    const number = inventoryNumber(value);
  
    if (number > 0) return +${number};
    return String(number);
  }
  
  function inventorySafeId(value) {
    return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "");
  }  
  /* =========================================================
     3. ISSUE STOCK
  
     Operation:
     Deducts inventory quantity and creates ISSUE transaction.
  
     Later this will be used by Job Cards when mechanics consume parts.
     ========================================================= */
  
  async function issueInventoryStock(itemId, quantity, options = {}) {
    return await createInventoryTransaction({
      inventory_item_id: itemId,
      transaction_type: "ISSUE",
      quantity_change: -Math.abs(inventoryNumber(quantity)),
      reference_type: options.reference_type || "MANUAL_ISSUE",
      reference_id: options.reference_id || null,
      supplier: options.supplier || null,
      location: options.location || null,
      unit_cost: options.unit_cost || 0,
      unit_price: options.unit_price || 0,
      notes: options.notes || "Stock issued manually."
    });
  }
  
  /* =========================================================
     4. ADJUST STOCK
  
     Operation:
     Handles manual correction.
  
     Example:
     Current quantity is 10.
     Actual counted quantity is 14.
     Difference = +4.
     ========================================================= */
  
  async function adjustInventoryStock(itemId, newQuantity, options = {}) {
    const { data: item, error } = await supabaseClient
      .from("inventory_items")
      .select("id, quantity")
      .eq("id", itemId)
      .single();
  
    if (error || !item) {
      return {
        success: false,
        message: "Inventory item could not be found."
      };
    }
  
    const currentQuantity = inventoryNumber(item.quantity);
    const targetQuantity = inventoryNumber(newQuantity);
    const difference = targetQuantity - currentQuantity;
  
    if (difference === 0) {
      return {
        success: false,
        message: "No stock change needed."
      };
    }
  
    return await createInventoryTransaction({
      inventory_item_id: itemId,
      transaction_type: "ADJUSTMENT",
      quantity_change: difference,
      reference_type: options.reference_type || "MANUAL_ADJUSTMENT",
      reference_id: options.reference_id || null,
      notes: options.notes || "Manual stock adjustment."
    });
  }
  
  /* =========================================================
     5. RETURN STOCK
  
     Operation:
     Adds stock back into inventory.
     ========================================================= */
  
  async function returnInventoryStock(itemId, quantity, options = {}) {
    return await createInventoryTransaction({
      inventory_item_id: itemId,
      transaction_type: "RETURN",
      quantity_change: Math.abs(inventoryNumber(quantity)),
      reference_type: options.reference_type || "MANUAL_RETURN",
      reference_id: options.reference_id || null,
      notes: options.notes || "Stock returned."
    });
  }
  
  /* =========================================================
     6. DAMAGE / WRITE-OFF STOCK
  
     Operation:
     Deducts damaged stock with a ledger record.
     ========================================================= */
  
  async function damageInventoryStock(itemId, quantity, options = {}) {
    return await createInventoryTransaction({
      inventory_item_id: itemId,
      transaction_type: "DAMAGED",
      quantity_change: -Math.abs(inventoryNumber(quantity)),
      reference_type: options.reference_type || "MANUAL_DAMAGE",
      reference_id: options.reference_id || null,
      notes: options.notes || "Stock marked as damaged."
    });
  }


28c97f5a-8071-4c24-ba55-f863d2b14ad4.png
9fe10be2-08eb-44e4-8011-e960e4690f56.png
a3825423-db43-479c-86ca-c4ad55429767.png
3fcb506a-bd6b-47c1-8d9d-32a2ee95194f.png
thats the process in the screenshot. after deleting the code block as instructed the inventory lists items dissapeared. nothing to adjust.

c876b150-72b6-4140-8149-e7c61f25e6d4.png
296b38ee-ccb7-4ce8-8378-989b8c570223.png
81fd8a47-2c8c-47c3-a6f4-5373fa069c72.png
e6c41a97-91a7-406e-b26e-f21b9da38f94.png
6a18b192-07f0-4088-a965-d6e7629e4b5d.png
fceaf8b7-b7d6-44c6-bf17-22b0dbfe52e8.png
f2e7390a-f921-4c12-a344-11a15a718747.png
c79641fb-b706-4970-82a8-4c99145c3bb1.png
d4fcfac6-3acf-4674-bbb2-90e716cfd158.png
f34ec497-a1e9-48c7-9333-293210a04fca.png
416c12f6-73e2-43fd-b4b3-05ba47766237.png
6ed9b279-8539-413e-b995-7e28779092a5.png
95fe2061-f4e9-4c6a-abc8-9de3e04546bf.png
follow the process in the screenshot and find where the problem is. i have a duplicate adjust stock below the parts, supplies etc that i have to update from the tab before going into the action bar to adjust as per the adjust stock bar below parts etc before it works. this looks wrong to me. how do i fix this and give me full updated codes please. 

1e91a3c4-9f71-4eb7-bc5f-9e9d95eeef42.png
bcb97235-11a2-43ac-8363-70af845cbf60.png
2bdd3da1-a543-443e-97c7-b36ed43e0fa3.png
eda6270f-cc90-489b-ad03-e4ebc52234e4.png
cf0de1eb-f5f9-4609-8f56-cfc00357e5b9.png
7f2a9af3-8171-4c82-9c6c-641c5ed7cb65.png
63edf87c-0019-49e0-91d2-c6b2158d40e1.png
4d4a67d4-8787-4628-9829-1cbbb7f4e61e.png
1468b134-1fee-4221-b0ca-9a46f9cb754f.png
26d7661a-53b2-4c71-ba51-1ddd6bcd2217.png
829d5efa-37de-4f9d-b497-be3b97d31997.png
e75cacdf-e77f-424e-80cc-292c2bc9ef9d.png
c95b4fe1-b4d6-4ce6-8d52-7bf3ad97c7ad.png
b86a8f83-4101-462c-9e20-4e3b682791ec.png
the action bar adjust stocks seems okay now. but the old adjust stock container (if it is a container) now shows up every where in the process. i want full file code updates where needed.

f46a06b7-153c-4b28-88bb-d0a89e612930.png
b8fb10a9-ea28-4bf2-86ac-dbdfc12a17b9.png
d31340ed-80f6-457a-a154-7e8b264727c2.png
everything works now. the modification i think we should do now is 
1) make the table items visible at first glance.
2) also the table should have beside the listed items with numbers and also a checkbox that can make me delete several entries at one.
3) the action bar pop up does not allow adequate UX/UI for the item we want to perform action on.

 what do you think about this because you are the professional acting all roles for this project.


Pasted code(41).js
JavaScript

Pasted code (2)(4).css
File

please give full update codes for all files with codes less than 700lines if more just tell me where to change and the codes to replace the change with.


/* =========================================================
   ADMIN INVENTORY BULK ACTIONS MODULE
   File: js/admin-inventory-bulk.js

   Purpose:
   Handles checkbox-based bulk actions for inventory records.

   Business Purpose:
   When inventory grows to hundreds or thousands of records,
   staff should not repeat actions one row at a time.

   Supported bulk actions:
   - Select all visible items
   - Clear selection
   - Bulk deactivate
   - Bulk restore
   - Bulk delete, Developer only

   Important:
   Edit remains one item at a time because every part has its own
   SKU, price, supplier, reorder level, quantity, and notes.
   ========================================================= */


/* =========================================================
   1. BULK SELECTION STATE
   ========================================================= */

   let selectedInventoryItemIds = new Set();


   /* =========================================================
      2. SELECTION HELPERS
      ========================================================= */
   
   function getSelectedInventoryIds() {
     return Array.from(selectedInventoryItemIds);
   }
   
   function clearInventorySelection() {
     selectedInventoryItemIds.clear();
   
     document.querySelectorAll(".inventory-row-checkbox").forEach((checkbox) => {
       checkbox.checked = false;
     });
   
     const selectAllCheckbox = document.getElementById("inventorySelectAllCheckbox");
   
     if (selectAllCheckbox) {
       selectAllCheckbox.checked = false;
     }
   
     updateInventoryBulkBar();
   }
   
   function toggleInventoryRowSelection(itemId, checked) {
     if (checked) {
       selectedInventoryItemIds.add(String(itemId));
     } else {
       selectedInventoryItemIds.delete(String(itemId));
     }
   
     updateInventoryBulkBar();
   }
   
   function toggleAllVisibleInventoryRows(checked) {
     document.querySelectorAll(".inventory-row-checkbox").forEach((checkbox) => {
       checkbox.checked = checked;
   
       const itemId = checkbox.getAttribute("data-id");
   
       if (checked) {
         selectedInventoryItemIds.add(String(itemId));
       } else {
         selectedInventoryItemIds.delete(String(itemId));
       }
     });
   
     updateInventoryBulkBar();
   }
   
   
   /* =========================================================
      3. BULK BAR UI
      ========================================================= */
   
   function renderInventoryBulkBar() {
     const selectedCount = selectedInventoryItemIds.size;
   
     return 
       <div class="inventory-bulk-bar ${selectedCount > 0 ? "active" : ""}">
         <div>
           <strong>${selectedCount}</strong> item(s) selected
         </div>
   
         <div class="inventory-bulk-actions">
           <button id="bulkClearInventorySelectionBtn" type="button">
             Clear
           </button>
   
           <button id="bulkDeactivateInventoryBtn" type="button">
             Deactivate
           </button>
   
           <button id="bulkRestoreInventoryBtn" type="button">
             Restore
           </button>
   
           ${
             typeof canDeleteInventoryItem === "function" && canDeleteInventoryItem()
               ? 
                 <button id="bulkDeleteInventoryBtn" type="button" class="danger-action-btn">
                   Delete
                 </button>
               
               : ""
           }
         </div>
       </div>
     ;
   }
   
   function updateInventoryBulkBar() {
     const bulkBar = document.getElementById("inventoryBulkBar");
   
     if (!bulkBar) return;
   
     bulkBar.innerHTML = renderInventoryBulkBar();
     bindInventoryBulkActionButtons();
   }
   
   
   /* =========================================================
      4. BULK DATABASE ACTIONS
      ========================================================= */
   
   async function bulkDeactivateInventoryItems() {
     const ids = getSelectedInventoryIds();
   
     if (ids.length === 0) {
       alert("Please select at least one inventory item.");
       return;
     }
   
     if (!canManageInventory()) {
       alert("You do not have permission to manage inventory.");
       return;
     }
   
     if (!confirm(Deactivate ${ids.length} selected item(s)?)) return;
   
     const { error } = await supabaseClient
       .from("inventory_items")
       .update({
         is_active: false,
         status: "inactive",
         updated_by: currentUser ? currentUser.id : null
       })
       .in("id", ids);
   
     if (error) {
       alert("Could not deactivate selected items: " + error.message);
       return;
     }
   
     clearInventorySelection();
   
     if (typeof loadInventoryItems === "function") {
       await loadInventoryItems();
     }
   }
   
   async function bulkRestoreInventoryItems() {
     const ids = getSelectedInventoryIds();
   
     if (ids.length === 0) {
       alert("Please select at least one inventory item.");
       return;
     }
   
     if (!canManageInventory()) {
       alert("You do not have permission to manage inventory.");
       return;
     }
   
     if (!confirm(Restore ${ids.length} selected item(s)?)) return;
   
     const { error } = await supabaseClient
       .from("inventory_items")
       .update({
         is_active: true,
         status: "active",
         updated_by: currentUser ? currentUser.id : null
       })
       .in("id", ids);
   
     if (error) {
       alert("Could not restore selected items: " + error.message);
       return;
     }
   
     clearInventorySelection();
   
     if (typeof loadInventoryItems === "function") {
       await loadInventoryItems();
     }
   }
   
   async function bulkDeleteInventoryItems() {
     const ids = getSelectedInventoryIds();
   
     if (ids.length === 0) {
       alert("Please select at least one inventory item.");
       return;
     }
   
     if (!canDeleteInventoryItem()) {
       alert("Only Developer access can permanently delete inventory items.");
       return;
     }
   
     if (!confirm(Permanently delete ${ids.length} selected item(s)?)) return;
   
     if (!confirm("Final warning. This cannot be undone.")) return;
   
     const { error } = await supabaseClient
       .from("inventory_items")
       .delete()
       .in("id", ids);
   
     if (error) {
       alert("Could not delete selected items: " + error.message);
       return;
     }
   
     clearInventorySelection();
   
     if (typeof loadInventoryItems === "function") {
       await loadInventoryItems();
     }
   }
   
   
   /* =========================================================
      5. BUTTON BINDINGS
      ========================================================= */
   
   function bindInventoryBulkSelectionButtons() {
     const selectAllCheckbox = document.getElementById("inventorySelectAllCheckbox");
   
     if (selectAllCheckbox) {
       selectAllCheckbox.addEventListener("change", function () {
         toggleAllVisibleInventoryRows(selectAllCheckbox.checked);
       });
     }
   
     document.querySelectorAll(".inventory-row-checkbox").forEach((checkbox) => {
       checkbox.addEventListener("change", function () {
         toggleInventoryRowSelection(
           checkbox.getAttribute("data-id"),
           checkbox.checked
         );
       });
     });
   
     updateInventoryBulkBar();
   }
   
   function bindInventoryBulkActionButtons() {
     const clearButton = document.getElementById("bulkClearInventorySelectionBtn");
     const deactivateButton = document.getElementById("bulkDeactivateInventoryBtn");
     const restoreButton = document.getElementById("bulkRestoreInventoryBtn");
     const deleteButton = document.getElementById("bulkDeleteInventoryBtn");
   
     if (clearButton) {
       clearButton.addEventListener("click", clearInventorySelection);
     }
   
     if (deactivateButton) {
       deactivateButton.addEventListener("click", bulkDeactivateInventoryItems);
     }
   
     if (restoreButton) {
       restoreButton.addEventListener("click", bulkRestoreInventoryItems);
     }
   
     if (deleteButton) {
       deleteButton.addEventListener("click", bulkDeleteInventoryItems);
     }
   }
/* =========================================================
   ADMIN TABLES
   File: css/admin-tables.css
   ========================================================= */

   .admin-table-wrap {
    background: var(--color-surface);
    border-radius: var(--radius-md);
    overflow-x: auto;
    box-shadow: var(--shadow-sm);
  }
  
  .admin-data-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1150px;
  }
  
  .admin-data-table thead {
    background: var(--color-navy);
    color: #fff;
  }
  
  .admin-data-table th,
  .admin-data-table td {
    padding: 16px 18px;
    text-align: left;
    border-bottom: 1px solid var(--color-border);
    vertical-align: middle;
    font-size: .95rem;
  }
  
  .admin-data-table th {
    text-transform: uppercase;
    letter-spacing: .04em;
    font-size: .78rem;
    font-weight: 900;
  }
  
  .admin-data-table tbody tr:hover {
    background: #f8fafc;
  }
  
  .inventory-checkbox-cell {
    width: 44px;
    text-align: center;
  }
  
  .inventory-item-cell strong {
    display: block;
  }
  
  .inventory-item-cell small {
    color: var(--color-muted);
  }
  
  .inventory-actions-cell {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

9db9856d-13ac-445c-a436-009072262421.png
bdf0cc70-4db7-4235-8260-bf3e412732a1.png
what do you think. is this user friendly. i think we ought to see the action bar as well. what do you think


Pasted code(42).js
JavaScript
screenshot 2 is just update of how it looks now when i updated the css file. attached is the admin-inventory-items.


Pasted code(43).js
JavaScript
double check code to see if its okay. if not please supply full codes for this file(this is an exception for full code updates just to make sure it is right)


Pasted code(9).css
File

Pasted code (2)(5).css
File

Pasted code (3).html
File
please provide full updated codes for the file as necessary

6b3f174d-9697-4356-bcba-97322cde53c9.png
91411807-23dd-480f-a819-bbc8368436b1.png
after the update i got this. what do you think

7e00e3fe-6ec6-4bd7-9778-3ea41ad4fb03.png
c96529f8-e357-439c-be69-14f14a125d9d.png
a2588916-7aaa-48c9-bed4-56024d2f45a2.png
fc7e468f-4fd7-43ec-bf54-8667faa0f9bb.png
look at the screenshot uploaded and let me know what is happening 


Pasted code(44).js
JavaScript

Pasted code (2)(6).css
File

Pasted code (3)(2).css
File

attached is the screenshot where we are and ready for 

Remove Category and Brand from the Item cell (keep only Item Name + SKU). This will reduce duplication and free horizontal space.
Increase the Category column width slightly so names like "Accessories" stay on one line.
Make only the Checkbox and # columns sticky on the left; let the Item column scroll naturally while keeping the Actions column sticky on the right.
In a later sprint, enrich the Action modal with more operational details (supplier, storage location, reserved stock, last transaction, etc.) to turn it into a true inventory command center.

Sunday 2:20 PM
a9471e65-cf95-419a-a221-a33c1d870295.png
875bdbb0-a86b-4d4e-9e1f-3a363c2aa035.png

Pasted code(10).css
File

Pasted code (2)(10).js
JavaScript

4th screenshot shows what i see after moving the table horizontally to the right to be able to see cost and sell price. is this okey for now. 

Worked for 47s
It is acceptable for development right now, but I would not call it the final production layout yet.

What is working correctly:

The Item column scrolls away naturally.

Cost and Sell become accessible through horizontal scrolling.

The Actions column stays visible on the right.

Category and Brand are no longer repeated inside the Item cell.

The selected row remains visually highlighted.

Your JavaScript structure is correct: the table includes dedicated classes for Checkbox, #, Item, Part Number, prices, and Actions. 

 Your CSS also correctly intends only Checkbox and # to remain sticky on the left while Actions remains sticky on the right. 


Remaining visual issue
In the right-scrolled screenshot:

The row numbers 1 and 2 are no longer visible.

Part numbers appear clipped as 3-OF-01 and 3-OF-003.

The Part # heading is partly hidden behind the sticky left area.

That means the table is functional, but the left sticky boundary is not layering perfectly. The scrolling Part Number column is moving underneath the sticky Checkbox/Number area and becoming partly visible through the boundary.

This is a CSS alignment issue, not an inventory-data or JavaScript problem.

There is also a smaller bulk-bar issue: the standalone 1 above “1 item selected” is redundant and should eventually be removed.

Professional decision
For now:

Continue testing Receive Stock, Adjust Stock, Edit, History, deletion, filtering, and pagination.

Do not restructure the inventory table again.

Record this as a small table-polish correction before the inventory sprint is closed.

The final expected right-scrolled view should show:

☑ | 1 | ... Reorder | Max | Cost | Sell | Actions
The # value must stay visible, and no scrolling column should appear underneath it. The present version is usable, but that sticky-column overlap should be corrected before launch.


9b5f4f60-c1f8-42b3-bd2d-a9c01b994180.png
d3f12751-de88-47c7-b369-ae46899dccbf.png
41296842-1f8c-4455-8d56-94b1c9667f8f.png
99036ae4-c085-4569-a160-7f840431a406.png
wheni update the sale price in inventory this did not affect the change in the price when mechanic add price .i expect the price to change immediately after the update. the first 2 ( SKU/ part #: OF_001). please tell me whats wrong. 


Pasted code(45).js
JavaScript


Pasted code(46).js
JavaScript
i still cant get the updated file. i will send you what i have and update and send me as something i can copy..attached is what i have currently now. 

7b0bad55-50da-4a3a-b70a-4e69ade5081d.png
89bca856-98f6-4b79-b18f-992087afb3c3.png
that works now. the next problem is the add inventory item not working now. also the overview||customer||vehicle||job card||timeline||update isnt responding any more when i click it.  what should we solve first or can both be resolved at same time. 

dc3c65b6-53d5-42b8-a95e-78ad6bcf8475.png
e8852279-e84a-4983-accb-1e77c315adb6.png

Pasted code(47).js
JavaScript

Pasted code (2)(11).js
JavaScript

Pasted code (3)(2).js
JavaScript

Pasted code (4)(3).js
JavaScript

/* =========================================================
   ADMIN APP CONTROLLER
   File: js/admin.js

   Purpose:
   This file is now the startup controller for the admin dashboard.

   It does NOT contain heavy business logic anymore.

   It only:
   1. Checks staff access.
   2. Applies dashboard UI for the logged-in role.
   3. Loads service request data.
   4. Starts realtime updates.
   5. Connects logout.

   Other files will handle the actual feature logic.
   ========================================================= */


/* =========================================================
   1. APP STARTUP

   initializeAdminDashboard() is the main entry point.

   It runs after:
   - auth-config.js
   - admin-auth.js
   - admin-dashboard.js
   - admin-updates.js
   - admin-requests.js

   have already loaded.
   ========================================================= */

   async function initializeAdminDashboard() {
    /*
      Step 1:
      Verify that the logged-in user is allowed to access admin.html.
  
      checkStaffAccess() comes from admin-auth.js.
    */
    const isAuthorized = await checkStaffAccess();
  
    if (!isAuthorized) {
      return;
    }
  
    /*
      Step 2:
      Apply role-based UI.
  
      applyAdminProfileUI() and applyRoleUI() will come from
      admin-dashboard.js in the next step.
    */
    if (typeof applyAdminProfileUI === "function") {
      applyAdminProfileUI();
    }
  
    if (typeof applyRoleUI === "function") {
      applyRoleUI();
    }
  
    /*
      Step 3:
      Show the first section this user is allowed to access.
  
      showFirstAllowedSection() will come from admin-dashboard.js.
    */
    if (typeof showFirstAllowedSection === "function") {
      showFirstAllowedSection();
    }
  
    /*
      Step 4:
      Load service requests.
  
      loadServiceRequests() will come from admin-requests.js.
    */
    if (typeof loadServiceRequests === "function") {
      await loadServiceRequests();
    }
    if (typeof loadAdminPayments === "function") {
      await loadAdminPayments();
    }

    if (typeof loadMechanicBoard === "function") {
      await loadMechanicBoard();
    }
    
    if (typeof loadAdminInvoices === "function") {
      await loadAdminInvoices();
    }
    if (typeof loadInventoryItems === "function") {
      await loadInventoryItems();
    }
  
    /*
      Step 5:
      Start realtime updates.
  
      subscribeStaffRealtime() will come from admin-requests.js later.
    */
    if (typeof subscribeStaffRealtime === "function") {
      subscribeStaffRealtime();
    }
  
    /*
      Step 6:
      Connect logout button.
  
      logoutStaffUser() comes from admin-auth.js.
    */
    const logoutBtn = document.getElementById("logoutBtn");
  
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logoutStaffUser);
    }
  }
  
  
  /* =========================================================
     2. START APPLICATION
  
     This starts the dashboard once the browser has loaded this file.
     ========================================================= */
  
  initializeAdminDashboard();/* =========================================================
   ADMIN ENTERPRISE COMPONENT LIBRARY
   File: js/ui/admin-components.js
========================================================= */

function renderBreadcrumbs(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "";

  return 
    <div class="admin-breadcrumbs">
      ${items.map((item, index) => {
        const isLast = index === items.length - 1;

        return 
          ${isLast
            ? <strong>${safeText(item.label)}</strong>
            : <span>${safeText(item.label)}</span>
          }
          ${!isLast ? <span class="admin-breadcrumb-separator">›</span> : ""}
        ;
      }).join("")}
    </div>
  ;
}

function renderActionToolbar(config = {}) {
  return 
    <div class="admin-action-toolbar">
      <div class="admin-action-toolbar-left">
        ${config.title ? <span class="admin-action-toolbar-title">${safeText(config.title)}</span> : ""}
        ${config.left || ""}
      </div>

      <div class="admin-action-toolbar-right">
        ${config.right || ""}
      </div>
    </div>
  ;
}

function ensureToastContainer() {
  let container = document.getElementById("adminToastContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "adminToastContainer";
    container.className = "admin-toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");

    document.body.appendChild(container);
  }

  return container;
}

function showToast(type = "success", title = "Success", message = "") {
  const container = ensureToastContainer();

  const normalizedType = String(type || "success").toLowerCase();

  const supportedTypes = [
    "success",
    "error",
    "warning",
    "danger",
    "info"
  ];

  const safeType = supportedTypes.includes(normalizedType)
    ? normalizedType
    : "info";

  /*
    Existing modules sometimes use "danger", while the notification
    styles use "error". Both values remain supported.
  */
  const visualType = safeType === "danger"
    ? "error"
    : safeType;

  const toast = document.createElement("div");

  /*
    Both class formats are deliberately included:

    1. admin-toast-success
       Supports the existing admin.css notification styles.

    2. success
       Preserves compatibility with any newer modular component CSS.
  */
  toast.className =
    admin-toast admin-toast-${visualType} ${visualType};

  toast.setAttribute("role", visualType === "error" ? "alert" : "status");

  toast.innerHTML = 
    <strong>${safeText(title)}</strong>
    <p>${safeText(message)}</p>
  ;

  container.appendChild(toast);

  /*
    The browser must first render the hidden state before the
    "show" class is added. requestAnimationFrame provides that
    rendering boundary more reliably than an immediate class change.
  */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });
  });

  const removeToast = () => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();

      if (
        container.childElementCount === 0 &&
        document.body.contains(container)
      ) {
        container.remove();
      }
    }, 300);
  };

  const removalTimer = setTimeout(removeToast, 4200);

  toast.addEventListener("click", function () {
    clearTimeout(removalTimer);
    removeToast();
  });
}

function renderEmptyState(title = "No records found", message = "There is nothing to show yet.") {
  return 
    <div class="admin-empty-state">
      <strong>${safeText(title)}</strong>
      <p>${safeText(message)}</p>
    </div>
  ;
}

function renderLoadingState(message = "Loading...") {
  return 
    <div class="admin-loading-state">
      <div class="admin-loading-spinner"></div>
      <strong>${safeText(message)}</strong>
    </div>
  ;
}

function openSlidePanel(config = {}) {
  closeSlidePanel();

  const backdrop = document.createElement("div");
  backdrop.id = "adminSlidePanelBackdrop";
  backdrop.className = "admin-slide-backdrop";

  backdrop.innerHTML = 
    <aside class="admin-slide-panel">
      <div class="admin-slide-header">
        <div>
          <h3>${safeText(config.title || "Panel")}</h3>
          ${config.subtitle ? <p>${safeText(config.subtitle)}</p> : ""}
        </div>

        <button class="admin-slide-close" type="button" onclick="closeSlidePanel()">×</button>
      </div>

      <div class="admin-slide-body">
        ${config.content || ""}
      </div>
    </aside>
  ;

  document.body.appendChild(backdrop);
}

function closeSlidePanel() {
  const existing = document.getElementById("adminSlidePanelBackdrop");
  if (existing) existing.remove();
}

/* =========================================================
   MODAL FRAMEWORK
========================================================= */

function openAdminModal(config = {}) {
  closeAdminModal();

  const backdrop = document.createElement("div");
  backdrop.id = "adminModalBackdrop";
  backdrop.className = "admin-modal-backdrop";

  backdrop.innerHTML = 
    <div class="admin-modal-box" id="adminModalBox">
      <div class="admin-modal-header" id="adminModalDragHandle">
        <div>
          <h3>${safeText(config.title || "Modal")}</h3>
          ${config.subtitle ? <p>${safeText(config.subtitle)}</p> : ""}
        </div>

        <button class="admin-modal-close" type="button" onclick="closeAdminModal()">×</button>
      </div>

      <div class="admin-modal-body">
        ${config.content || ""}
      </div>

      ${config.footer ? 
        <div class="admin-modal-footer">
          ${config.footer}
        </div>
       : ""}
    </div>
  ;

  document.body.appendChild(backdrop);

  const modal = document.getElementById("adminModalBox");

  modal.style.position = "fixed";
  modal.style.width = config.width || "760px";
  modal.style.height = config.height || "650px";
  modal.style.left = "50%";
  modal.style.top = "50%";
  modal.style.transform = "translate(-50%, -50%)";

  enableAdminModalDrag();
}

function closeAdminModal() {
  const existing = document.getElementById("adminModalBackdrop");
  if (existing) existing.remove();
}

function enableAdminModalDrag() {
  const modal = document.getElementById("adminModalBox");
  const handle = document.getElementById("adminModalDragHandle");

  if (!modal || !handle) return;

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  handle.addEventListener("pointerdown", function (event) {
    if (event.target.closest("button, input, textarea, select, option")) return;

    dragging = true;

    const rect = modal.getBoundingClientRect();

    startX = event.clientX;
    startY = event.clientY;
    startLeft = rect.left;
    startTop = rect.top;

    modal.style.transform = "none";
    modal.style.left = ${startLeft}px;
    modal.style.top = ${startTop}px;

    modal.classList.add("is-dragging");
    document.body.style.userSelect = "none";

    handle.setPointerCapture(event.pointerId);

    event.preventDefault();
    event.stopPropagation();
  });

  handle.addEventListener("pointermove", function (event) {
    if (!dragging) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    const maxLeft = window.innerWidth - modal.offsetWidth - 12;
    const maxTop = window.innerHeight - modal.offsetHeight - 12;

    modal.style.left = ${Math.max(12, Math.min(startLeft + dx, maxLeft))}px;
    modal.style.top = ${Math.max(12, Math.min(startTop + dy, maxTop))}px;

    event.preventDefault();
  });

  handle.addEventListener("pointerup", function (event) {
    dragging = false;
    modal.classList.remove("is-dragging");
    document.body.style.userSelect = "";

    try {
      handle.releasePointerCapture(event.pointerId);
    } catch (error) {}
  });
}

/* =========================================================
   CONTEXT MENU
========================================================= */

function openContextMenu(event, actions = []) {
  event.preventDefault();
  closeContextMenu();

  const menu = document.createElement("div");
  menu.id = "adminContextMenu";
  menu.className = "admin-context-menu";

  menu.style.left = ${event.clientX}px;
  menu.style.top = ${event.clientY}px;

  menu.innerHTML = actions.map((action) => 
    <button
      type="button"
      class="${action.danger ? "danger" : ""}"
      onclick="${action.onClick}"
    >
      ${safeText(action.label)}
    </button>
  ).join("");

  document.body.appendChild(menu);
}

function closeContextMenu() {
  const existing = document.getElementById("adminContextMenu");
  if (existing) existing.remove();
}

document.addEventListener("click", function () {
  closeContextMenu();
});/* =========================================================
   ADMIN TABS COMPONENT
   File: js/ui/admin-tabs.js

   Purpose:
   Reusable enterprise tab controller.

   Used by:
   - Service Requests
   - Mechanic Jobs
   - Customers
   - Inventory
   - Invoices
   - Payments
   - Future modules

   Sprint 6.5
   ========================================================= */


/* =========================================================
   ACTIVATE ONE TAB
   ========================================================= */

   function activateWorkspaceTab(workspaceElement, tabName) {
    if (!workspaceElement || !tabName) return;
  
    workspaceElement
      .querySelectorAll(".workspace-tab-btn")
      .forEach((button) => {
        button.classList.toggle(
          "active",
          button.dataset.tab === tabName
        );
      });
  
    workspaceElement
      .querySelectorAll(".workspace-panel")
      .forEach((panel) => {
        panel.classList.toggle(
          "active",
          panel.dataset.panel === tabName
        );
      });
  }
  
  
  /* =========================================================
     INITIALIZE FIRST TAB
     ========================================================= */
  
  function initializeWorkspaceTabs(workspaceElement) {
    if (!workspaceElement) return;
  
    const firstButton = workspaceElement.querySelector(".workspace-tab-btn");
  
    if (!firstButton) return;
  
    activateWorkspaceTab(
      workspaceElement,
      firstButton.dataset.tab
    );
  }
  
  
  /* =========================================================
     BIND TAB EVENTS
     ========================================================= */
  
  function bindWorkspaceTabs(scope = document) {
  
    scope.querySelectorAll(".workspace-body").forEach((workspaceBody) => {
  
      initializeWorkspaceTabs(workspaceBody);
  
      workspaceBody
        .querySelectorAll(".workspace-tab-btn")
        .forEach((button) => {
  
          if (button.dataset.bound === "true") return;
  
          button.dataset.bound = "true";
  
          button.addEventListener("click", function () {
  
            activateWorkspaceTab(
              workspaceBody,
              button.dataset.tab
            );
  
          });
  
        });
  
    });
  
  }/* =========================================================
   ADMIN WORKSPACE COMPONENT
   File: js/ui/admin-workspace.js

   Purpose:
   Creates reusable enterprise workspace HTML.

   Pattern:
   Header
   Toolbar
   Body
   Tabs
   Panels

   Used by:
   - Service Requests
   - Mechanic Jobs
   - Customers
   - Inventory
   - Invoices
   - Payments
   ========================================================= */


   function renderWorkspaceHeader(config = {}) {
    return 
      <div class="workspace-header">
        <div>
          <p class="workspace-kicker">${safeText(config.kicker || "Workspace")}</p>
          <h2 class="workspace-title">${safeText(config.title || "Untitled Workspace")}</h2>
          <p class="workspace-subtitle">${safeText(config.subtitle || "")}</p>
        </div>
  
        <div class="workspace-actions">
          ${config.actions || ""}
        </div>
      </div>
    ;
  }
  
  
  function renderWorkspaceTabs(tabs = []) {
    if (!Array.isArray(tabs) || tabs.length === 0) return "";
  
    return 
      <div class="workspace-tabs">
        ${tabs.map((tab, index) => 
          <button
            type="button"
            class="workspace-tab-btn ${index === 0 ? "active" : ""}"
            data-tab="${safeText(tab.id)}"
          >
            ${safeText(tab.label)}
          </button>
        ).join("")}
      </div>
    ;
  }
  
  
  function renderWorkspacePanels(tabs = []) {
    if (!Array.isArray(tabs) || tabs.length === 0) {
      return 
        <div class="workspace-panel active">
          ${typeof renderEmptyState === "function"
            ? renderEmptyState("No workspace content", "This workspace does not have any panels yet.")
            : <p class="workspace-empty">No workspace content available.</p>
          }
        </div>
      ;
    }
  
    return tabs.map((tab, index) => 
      <div
        class="workspace-panel ${index === 0 ? "active" : ""}"
        data-panel="${safeText(tab.id)}"
      >
        ${tab.content || ""}
      </div>
    ).join("");
  }
  
  
  function renderWorkspace(config = {}) {
    const tabs = Array.isArray(config.tabs) ? config.tabs : [];
  
    return 
      <div class="workspace-shell">
        ${renderWorkspaceHeader(config)}
  
        ${config.toolbar ? 
          <div class="workspace-toolbar">
            ${config.toolbar}
          </div>
         : ""}
  
        <div class="workspace-body">
          ${renderWorkspaceTabs(tabs)}
          ${renderWorkspacePanels(tabs)}
        </div>
      </div>
    ;
  }
  
  
  function renderInfoCard(label, value) {
    return 
      <div class="workspace-info-card">
        <span>${safeText(label)}</span>
        <strong>${safeText(value, "-")}</strong>
      </div>
    ;
  }
  
  
  function renderInfoGrid(items = []) {
    if (!Array.isArray(items) || items.length === 0) {
      return typeof renderEmptyState === "function"
        ? renderEmptyState("No information available", "There are no details to display.")
        : <p class="workspace-empty">No information available.</p>;
    }
  
    return 
      <div class="workspace-info-grid">
        ${items.map((item) => renderInfoCard(item.label, item.value)).join("")}
      </div>
    ;
  }

27d0b972-7c6c-494c-ac2f-50ad6bf7380a.png
a2b2ca5a-fa85-41f9-be7e-1071111f4ad2.png
ce08210f-bd8d-4c2b-9046-ee54b33607a1.png
25621c4f-c194-4043-9dea-c27e17a87a54.png
b44a1431-daf3-4cfb-bdd7-21f7d64dccc5.png
72073dc6-c2c3-4969-a966-23b0877aa62a.png
9a5703e8-1557-42ab-9521-96d4a05681ce.png
its working but check screenshots. is this ui user friendly for the overview||customer||vehichle etc. what about it opening up like label just like the label for history etc good. what do you think you are the professional. or we move ahead solving other problems .

200cc134-372e-4dd9-84ea-c0262bec83db.png
8b16cc83-2f0b-48de-81e6-888360147911.png
6e8417f2-87bf-4011-b82f-ecb3d3a725cc.png
e69ef4a0-06f1-40e6-aed5-6c8e50ccc5cf.png
36ba8c7e-b538-4bba-9677-8aa8fac24986.png
1cdfd973-bc2e-4106-8532-cc1e931d1061.png
2f636ae5-4591-4475-9dcd-92b46fb6aef0.png
c9d01899-9f65-42ce-aca7-7941421c5106.png
cf9b9067-cfc6-4b00-9937-120c92b9e8ce.png
6a8e6ee9-4cef-437c-a801-4802ab527b0d.png
Check the work flow and se its efficiency and ways available to improve if need be for now or we move forward with other business logic. 
Also the job card after created should have a tab in an appropriate section to be able to be viewed to see mechanic update customer information overview and also timeline. mechanic update should sync to mechanic diagnosis etc. is this a good or bad recommendation. please act your job i am just suggesting.

df0c7583-3465-407d-bec6-e8a0f847188c.png
93d2554f-dfc8-4cf4-9235-ba3240bf4057.png
d6a010f9-6925-4f21-8058-e091371be385.png
8c99eabf-d413-4d45-b686-9aef3821fa9c.png
look at the image. i want to be clear what i am going to copy and change and what about the read me text. i will uploads the present codes i have on the files so that you will be sure about the code upgrades you want to make also tell me when i need create another file. lookl at the screen shot tell me what you have and also tell me the codes i should supply for you to have adequate information about what to change. lets do this professionally without going back and forth. 


goeast-mechanics-main 5.zip
Zip Archive
look through the compressed file and let me know if you see all the codes.

87c45e9f-b8d7-4eb8-9777-85113bcba54a.png
55880da6-7799-4a29-862b-68b9d8f83881.png
f0e44f25-14d4-4c7f-b0ba-6949253ffe8c.png
660f3bbc-c7b8-451a-81de-f47ac7191109.png
8eb542b2-0def-4231-81fa-90839411dafd.png
369513e9-3801-4942-8c8a-40668d291a70.png
95415ced-3410-46e4-ad0f-95b44dbbcfe9.png
7ff628b9-f24b-4f87-b07a-1acb307b5d37.png
99c53b91-b53f-401c-98f6-4d2bc5dc4e92.png
a96570ff-38dc-4ff7-b750-fe5f60354d73.png
2d86a766-9094-4bdc-9810-73d5687ad4f2.png
1d5146f6-e2eb-4231-b577-46ed04025c5c.png
42e87bb8-cf4a-4cb8-9e77-dcb2a48a1ea5.png
2e3f13a7-d5f9-4767-b4d3-d5a3cf4e0128.png
this is the ones i have screenshot for now tell me if you need more and what particular tables you are interested in before continuing.

Supabase Snippet Untitled query
Now interactive!


Pasted code(48).js
JavaScript

/* =========================================================
   ADMIN WORKSPACE COMPONENT
   File: js/ui/admin-workspace.js

   Purpose:
   Creates reusable enterprise workspace HTML.

   Layout:
   1. Workspace header
   2. Shared context area
   3. Optional toolbar
   4. Tabs
   5. Active tab panel

   The context area is used for shared content such as:
   - Breadcrumbs
   - Archive actions
   - Delete actions
   - Request identity
   ========================================================= */


/* =========================================================
   1. SAFE WORKSPACE DOM ID
   ========================================================= */

   function workspaceDomId(value) {
    return String(value || "workspace")
      .replace(/[^a-zA-Z0-9_-]/g, "-");
  }
  
  
  /* =========================================================
     2. WORKSPACE HEADER
     ========================================================= */
  
  function renderWorkspaceHeader(config = {}) {
    return 
      <div class="workspace-header">
        <div class="workspace-header-copy">
          <p class="workspace-kicker">
            ${safeText(config.kicker || "Workspace")}
          </p>
  
          <h2 class="workspace-title">
            ${safeText(config.title || "Untitled Workspace")}
          </h2>
  
          ${
            config.subtitle
              ? 
                <p class="workspace-subtitle">
                  ${safeText(config.subtitle)}
                </p>
              
              : ""
          }
        </div>
  
        ${
          config.actions
            ? 
              <div class="workspace-actions">
                ${config.actions}
              </div>
            
            : ""
        }
      </div>
    ;
  }
  
  
  /* =========================================================
     3. WORKSPACE TABS
     ========================================================= */
  
  function renderWorkspaceTabs(tabs = [], moduleName = "workspace") {
    if (!Array.isArray(tabs) || tabs.length === 0) {
      return "";
    }
  
    const safeModuleName = workspaceDomId(moduleName);
  
    return 
      <div
        class="workspace-tabs"
        role="tablist"
        aria-label="Workspace sections"
      >
        ${tabs.map((tab, index) => {
          const safeTabId = workspaceDomId(tab.id);
          const buttonId =
            ${safeModuleName}-tab-${safeTabId};
  
          const panelId =
            ${safeModuleName}-panel-${safeTabId};
  
          return 
            <button
              type="button"
              id="${buttonId}"
              class="workspace-tab-btn ${
                index === 0 ? "active" : ""
              }"
              data-tab="${safeText(tab.id)}"
              role="tab"
              aria-selected="${index === 0 ? "true" : "false"}"
              aria-controls="${panelId}"
              tabindex="${index === 0 ? "0" : "-1"}"
            >
              ${safeText(tab.label)}
            </button>
          ;
        }).join("")}
      </div>
    ;
  }
  
  
  /* =========================================================
     4. WORKSPACE PANELS
     ========================================================= */
  
  function renderWorkspacePanels(
    tabs = [],
    moduleName = "workspace"
  ) {
    if (!Array.isArray(tabs) || tabs.length === 0) {
      return 
        <div class="workspace-panel active">
          ${
            typeof renderEmptyState === "function"
              ? renderEmptyState(
                  "No workspace content",
                  "This workspace does not have any panels yet."
                )
              : 
                <p class="workspace-empty">
                  No workspace content available.
                </p>
              
          }
        </div>
      ;
    }
  
    const safeModuleName = workspaceDomId(moduleName);
  
    return tabs.map((tab, index) => {
      const safeTabId = workspaceDomId(tab.id);
  
      const buttonId =
        ${safeModuleName}-tab-${safeTabId};
  
      const panelId =
        ${safeModuleName}-panel-${safeTabId};
  
      return 
        <section
          id="${panelId}"
          class="workspace-panel ${
            index === 0 ? "active" : ""
          }"
          data-panel="${safeText(tab.id)}"
          role="tabpanel"
          aria-labelledby="${buttonId}"
          ${index === 0 ? "" : "hidden"}
        >
          ${tab.content || ""}
        </section>
      ;
    }).join("");
  }
  
  
  /* =========================================================
     5. COMPLETE WORKSPACE
     ========================================================= */
  
  function renderWorkspace(config = {}) {
    const tabs = Array.isArray(config.tabs)
      ? config.tabs
      : [];
  
    const moduleName =
      config.module || "workspace";
  
    /*
      config.context contains information shared by every tab.
  
      It is rendered only once rather than being repeated inside
      every individual tab panel.
    */
    const contextContent =
      config.context ||
      config.beforeTabs ||
      "";
  
    return 
      <div
        class="workspace-shell"
        data-workspace="${safeText(moduleName)}"
      >
        ${renderWorkspaceHeader(config)}
  
        ${
          contextContent
            ? 
              <div class="workspace-context">
                ${contextContent}
              </div>
            
            : ""
        }
  
        ${
          config.toolbar
            ? 
              <div class="workspace-toolbar">
                ${config.toolbar}
              </div>
            
            : ""
        }
  
        <div class="workspace-body">
          ${renderWorkspaceTabs(tabs, moduleName)}
  
          <div class="workspace-panels">
            ${renderWorkspacePanels(tabs, moduleName)}
          </div>
        </div>
      </div>
    ;
  }
  
  
  /* =========================================================
     6. INFORMATION CARD
     ========================================================= */
  
  function renderInfoCard(label, value) {
    return 
      <div class="workspace-info-card">
        <span>${safeText(label)}</span>
        <strong>${safeText(value, "-")}</strong>
      </div>
    ;
  }
  
  
  /* =========================================================
     7. INFORMATION GRID
     ========================================================= */
  
  function renderInfoGrid(items = []) {
    if (!Array.isArray(items) || items.length === 0) {
      return typeof renderEmptyState === "function"
        ? renderEmptyState(
            "No information available",
            "There are no details to display."
          )
        : 
          <p class="workspace-empty">
            No information available.
          </p>
        ;
    }
  
    return 
      <div class="workspace-info-grid">
        ${items.map((item) => {
          return renderInfoCard(
            item.label,
            item.value
          );
        }).join("")}
      </div>
    ;
  }
  
  
  /* =========================================================
     8. GLOBAL EXPORTS
     ========================================================= */
  
  window.renderWorkspace = renderWorkspace;
  window.renderInfoCard = renderInfoCard;
  window.renderInfoGrid = renderInfoGrid;


/* =========================================================
   ADMIN JOB CARDS MODULE
   File: js/admin-job-cards.js

   Purpose:
   Handles job-card lookup and job-card creation.

   Business separation:
   - Service Request = intake/customer request
   - Job Card = workshop repair job

   New workflow:
   - If no job card exists, show "Create Mechanic Job Card".
   - If a job card already exists, show confirmation AND allow
     "Create Additional Job Card" for extra problems discovered later.
   ========================================================= */

   let jobCardsByRequest = {};

   /* =========================================================
      1. LOAD JOB CARDS FOR CURRENT REQUESTS
      Operation:
      Groups job cards by service_request_id.
      A service request may now have more than one job card.
      ========================================================= */
   
   async function loadJobCardsForRequests() {
     jobCardsByRequest = {};
   
     if (!Array.isArray(allRequests) || allRequests.length === 0) return;
   
     const requestIds = allRequests.map((request) => request.id);
   
     const { data, error } = await supabaseClient
       .from("job_cards")
       .select(
         id,
         service_request_id,
         vehicle_id,
         job_status,
         assigned_mechanic,
         repair_bay,
         appointment_date,
         estimated_completion
       )
       .in("service_request_id", requestIds)
       .order("id", { ascending: false });
   
     if (error) {
       console.error("Could not load job cards:", error.message);
       return;
     }
   
     (data || []).forEach((job) => {
       if (!jobCardsByRequest[job.service_request_id]) {
         jobCardsByRequest[job.service_request_id] = [];
       }
   
       jobCardsByRequest[job.service_request_id].push(job);
     });
   }
   
   /* =========================================================
      2. RENDER CREATE JOB CARD BOX
      Operation:
      Shows first-job form if no job exists.
      Shows existing job summary plus additional-job form if jobs exist.
      ========================================================= */
   
   function renderCreateJobCardBox(request) {
     const existingJobs = jobCardsByRequest[request.id] || [];
   
     if (existingJobs.length > 0) {
       const jobList = existingJobs.map((job) => {
         return 
           <li>
             <strong>JOB-${job.id}</strong>
             <span>Status: ${safeText(job.job_status || "created")}</span>
           </li>
         ;
       }).join("");
   
       return 
         <div class="existing-job-card-box">
           <strong>Mechanic Job Card Created</strong>
   
           <p>
             This service request already has ${existingJobs.length} mechanic job card(s).
             Create another job card only when the same vehicle needs a separate repair issue handled.
           </p>
   
           <ul class="existing-job-list">
             ${jobList}
           </ul>
   
           <button class="show-additional-job-btn" data-id="${request.id}">
             Create Additional Job Card
           </button>
   
           <div class="additional-job-form hidden" id="additionalJobForm-${request.id}">
             ${renderJobCardFormFields(request, "additional")}
           </div>
         </div>
       ;
     }
   
     return 
       <div class="create-job-box">
         <div>
           <strong>Create Mechanic Job Card</strong>
           <p>
             Convert this customer service request into an active workshop job.
             This keeps intake separate from mechanic operations.
           </p>
         </div>
   
         ${renderJobCardFormFields(request, "first")}
       </div>
     ;
   }
   
   /* =========================================================
      3. RENDER SHARED JOB CARD FORM FIELDS
      Operation:
      Used for first job cards and additional job cards.
      ========================================================= */
   
   function renderJobCardFormFields(request, mode) {
     const buttonText = mode === "additional"
       ? "Create Additional Job Card"
       : "Create Job Card";
   
     return 
       <div class="create-job-grid">
         <label>
           Assigned Mechanic
           <input
             class="job-mechanic-input"
             data-id="${request.id}"
             data-mode="${mode}"
             type="text"
             placeholder="Example: John, Tunde, Shop Team"
           >
         </label>
   
         <label>
           Repair Bay
           <input
             class="job-bay-input"
             data-id="${request.id}"
             data-mode="${mode}"
             type="text"
             placeholder="Example: Bay 1"
           >
         </label>
   
         <label>
           Appointment Date
           <input
             class="job-appointment-input"
             data-id="${request.id}"
             data-mode="${mode}"
             type="datetime-local"
           >
         </label>
   
         <label>
           Estimated Completion
           <input
             class="job-completion-input"
             data-id="${request.id}"
             data-mode="${mode}"
             type="datetime-local"
           >
         </label>
       </div>
   
       <button
         class="create-job-card-btn"
         data-id="${request.id}"
         data-mode="${mode}"
       >
         ${buttonText}
       </button>
     ;
   }
   
   /* =========================================================
      4. CREATE JOB CARD
      Operation:
      Creates a workshop job card from a service request.
      Additional job cards are allowed only when the user clicks
      "Create Additional Job Card".
      ========================================================= */
   
   async function createJobCardFromRequest(requestId, mode, button) {
     const request = allRequests.find((item) => {
       return String(item.id) === String(requestId);
     });
   
     if (!request) {
       alert("Could not find this service request.");
       return;
     }
   
     const existingJobs = jobCardsByRequest[request.id] || [];
   
     if (existingJobs.length > 0 && mode !== "additional") {
       alert("A mechanic job card already exists. Use Create Additional Job Card if this is a separate repair issue.");
       return;
     }
   
     const confirmMessage = existingJobs.length > 0
       ? "Create another job card for this same service request?"
       : "Create mechanic job card for this service request?";
   
     if (!confirm(confirmMessage)) return;
   
     button.disabled = true;
     button.textContent = "Creating Job...";
   
     const assignedMechanic =
       document.querySelector(.job-mechanic-input[data-id="${requestId}"][data-mode="${mode}"])?.value.trim() || "";
   
     const repairBay =
       document.querySelector(.job-bay-input[data-id="${requestId}"][data-mode="${mode}"])?.value.trim() || "";
   
     const appointmentDate =
       document.querySelector(.job-appointment-input[data-id="${requestId}"][data-mode="${mode}"])?.value || null;
   
     const estimatedCompletion =
       document.querySelector(.job-completion-input[data-id="${requestId}"][data-mode="${mode}"])?.value || null;
   
     const jobPayload = {
       service_request_id: Number(request.id),
       vehicle_id: request.vehicle_id || null,
   
       customer_name: request.name || null,
       customer_email: request.email || null,
       customer_phone: request.phone || null,
   
       vehicle: request.vehicle || null,
       complaint: request.message || null,
   
       job_status: "created",
       assigned_mechanic: assignedMechanic || null,
       repair_bay: repairBay || null,
       appointment_date: appointmentDate,
       estimated_completion: estimatedCompletion,
   
       estimated_cost: Number(request.estimated_cost || 0),
       final_cost: Number(request.final_cost || 0),
   
       labor_notes: "",
       parts_notes: ""
     };
   
     const { error: jobError } = await supabaseClient
       .from("job_cards")
       .insert([jobPayload]);
   
     if (jobError) {
       alert("Could not create job card: " + jobError.message);
       button.disabled = false;
       button.textContent = mode === "additional" ? "Create Additional Job Card" : "Create Job Card";
       return;
     }
   
     await supabaseClient
       .from("service_requests")
       .update({ status: "acknowledged" })
       .eq("id", request.id);
   
     alert("Job card created successfully.");
   
     button.disabled = false;
     button.textContent = mode === "additional" ? "Create Additional Job Card" : "Create Job Card";
   
     await loadServiceRequests();
   
     if (typeof loadMechanicBoard === "function") {
       await loadMechanicBoard();
     }
   }
   
   /* =========================================================
      5. BUTTON BINDINGS
      Operation:
      Connects Create Job Card and Create Additional Job Card buttons.
      ========================================================= */
   
   function bindCreateJobButtons() {
     document.querySelectorAll(".show-additional-job-btn").forEach((button) => {
       button.addEventListener("click", function () {
         const requestId = button.getAttribute("data-id");
         const form = document.getElementById(additionalJobForm-${requestId});
   
         if (form) {
           form.classList.toggle("hidden");
         }
       });
     });
   
     document.querySelectorAll(".create-job-card-btn").forEach((button) => {
       button.addEventListener("click", async function () {
         const requestId = button.getAttribute("data-id");
         const mode = button.getAttribute("data-mode") || "first";
   
         await createJobCardFromRequest(requestId, mode, button);
       });
     });
   }

/* =========================================================
   ADMIN REPAIR UPDATES MODULE
   File: js/admin-updates.js

   Purpose:
   Handles repair update history and service request progress notes.

   This file no longer creates job cards.
   Job-card creation now belongs to js/admin-job-cards.js.
   ========================================================= */

   let repairUpdatesByRequest = {};

   /* =========================================================
      1. LOAD REPAIR UPDATES
      ========================================================= */
   
   async function loadRepairUpdates() {
     repairUpdatesByRequest = {};
   
     if (!allRequests || allRequests.length === 0) return;
   
     const requestIds = allRequests.map((request) => request.id);
   
     const { data, error } = await supabaseClient
       .from("repair_updates")
       .select("id, service_request_id, title, message, visible_to_customer, created_at")
       .in("service_request_id", requestIds)
       .order("created_at", { ascending: false });
   
     if (error) {
       console.error("Could not load repair updates:", error.message);
       return;
     }
   
     (data || []).forEach((update) => {
       if (!repairUpdatesByRequest[update.service_request_id]) {
         repairUpdatesByRequest[update.service_request_id] = [];
       }
   
       repairUpdatesByRequest[update.service_request_id].push(update);
     });
   }
   
   /* =========================================================
      2. RENDER UPDATE HISTORY
      ========================================================= */
   
   function renderUpdateHistory(requestId) {
     const updates = repairUpdatesByRequest[requestId] || [];
   
     if (updates.length === 0) {
       return 
         <div class="card-notes">
           <strong>Update History:</strong>
           <p>No repair updates saved yet.</p>
         </div>
       ;
     }
   
     const items = updates.map((update) => {
       const visibility = update.visible_to_customer
         ? "Customer visible"
         : "Internal only";
   
       return 
         <div class="timeline-item">
           <strong>${safeText((update.title || "update").replaceAll("_", " "))}</strong>
           <small>${formatDate(update.created_at)} • ${visibility}</small>
           <p>${safeText(update.message)}</p>
         </div>
       ;
     }).join("");
   
     return 
       <div class="card-notes">
         <strong>Update History:</strong>
         <div class="timeline-list">
           ${items}
         </div>
       </div>
     ;
   }
   
   /* =========================================================
      3. RENDER REPAIR UPDATE FORM
      ========================================================= */
   
   function renderRepairUpdateForm(request, status, priority) {
     return 
       <div class="action-row repair-update-box">
         <label>
           Status
           <select class="status-select" data-id="${request.id}">
             <option value="new" ${status === "new" ? "selected" : ""}>New</option>
             <option value="acknowledged" ${status === "acknowledged" ? "selected" : ""}>Acknowledged</option>
             <option value="diagnosing" ${status === "diagnosing" ? "selected" : ""}>Diagnosing</option>
             <option value="waiting_parts" ${status === "waiting_parts" ? "selected" : ""}>Waiting Parts</option>
             <option value="repairing" ${status === "repairing" ? "selected" : ""}>Repairing</option>
             <option value="ready_for_pickup" ${status === "ready_for_pickup" ? "selected" : ""}>Ready for Pickup</option>
             <option value="closed" ${status === "closed" ? "selected" : ""}>Closed</option>
             <option value="cancelled" ${status === "cancelled" ? "selected" : ""}>Cancelled</option>
           </select>
         </label>
   
         ${hasFullAccess() ? 
           <label>
             Priority
             <select class="priority-select" data-id="${request.id}">
               <option value="low" ${priority === "low" ? "selected" : ""}>Low</option>
               <option value="normal" ${priority === "normal" ? "selected" : ""}>Normal</option>
               <option value="high" ${priority === "high" ? "selected" : ""}>High</option>
               <option value="urgent" ${priority === "urgent" ? "selected" : ""}>Urgent</option>
             </select>
           </label>
   
           <label>
             Estimated Cost
             <input class="estimated-cost-input" data-id="${request.id}" type="number" min="0" step="0.01" value="${Number(request.estimated_cost || 0)}">
           </label>
   
           <label>
             Final Cost
             <input class="final-cost-input" data-id="${request.id}" type="number" min="0" step="0.01" value="${Number(request.final_cost || 0)}">
           </label>
          : ""}
   
         <label class="wide-field">
           Repair Update
           <textarea class="repair-update-input" data-id="${request.id}" placeholder="Example: Mechanic has started checking the issue."></textarea>
         </label>
   
         <label class="checkbox-line">
           <input type="checkbox" class="internal-only-checkbox" data-id="${request.id}">
           Internal note only
         </label>
   
         <button class="save-repair-update-btn" data-id="${request.id}">
           Save Update
         </button>
       </div>
     ;
   }
   
   /* =========================================================
      4. SAVE REPAIR UPDATE
      ========================================================= */
   
   async function saveRepairUpdate(requestId, button) {
     const statusValue = document.querySelector(.status-select[data-id="${requestId}"]).value;
     const messageValue = document.querySelector(.repair-update-input[data-id="${requestId}"]).value.trim();
     const internalOnly = document.querySelector(.internal-only-checkbox[data-id="${requestId}"]).checked;
   
     if (!messageValue) {
       alert("Please write a repair update before saving.");
       return;
     }
   
     button.disabled = true;
     button.textContent = "Saving...";
   
     if (hasFullAccess()) {
       const priorityValue = document.querySelector(.priority-select[data-id="${requestId}"]).value;
       const estimatedCostValue = document.querySelector(.estimated-cost-input[data-id="${requestId}"]).value;
       const finalCostValue = document.querySelector(.final-cost-input[data-id="${requestId}"]).value;
   
       const { error: requestUpdateError } = await supabaseClient
         .from("service_requests")
         .update({
           priority: priorityValue,
           estimated_cost: Number(estimatedCostValue || 0),
           final_cost: Number(finalCostValue || 0)
         })
         .eq("id", requestId);
   
       if (requestUpdateError) {
         alert("Could not update costs/priority: " + requestUpdateError.message);
         button.disabled = false;
         button.textContent = "Save Update";
         return;
       }
     }
   
     const { error } = await supabaseClient.rpc("save_repair_update", {
       p_service_request_id: Number(requestId),
       p_status: statusValue,
       p_message: messageValue,
       p_internal_only: internalOnly
     });
   
     if (error) {
       alert("Could not save update: " + error.message);
     } else {
       alert("Repair update saved successfully.");
       await loadServiceRequests();
     }
   
     button.disabled = false;
     button.textContent = "Save Update";
   }
   
   /* =========================================================
      5. BUTTON BINDINGS
      ========================================================= */
   
   function bindRepairUpdateButtons() {
     document.querySelectorAll(".save-repair-update-btn").forEach((button) => {
       button.addEventListener("click", async function () {
         await saveRepairUpdate(button.getAttribute("data-id"), button);
       });
     });
   }


goeast-mechanics-main 5(1).zip
Zip Archive

Pasted code(49).js
JavaScript

Pasted code (2)(12).js
JavaScript

Pasted code (3)(3).js
JavaScript

Pasted code (4).html
File

Pasted code (5).css
File

Pasted code (6).css
File

Pasted code (7).css
File

Pasted code (8).css
File
can you read from the zipped file which has my updated codes. double check with the file attached and cross check with the zipped file to know if its up to date.Also let me know if you need any other thing. i want all code updates supplied in full and also dont forget you bare acting as the best professional for all fields needed in this project.

/=========================================================
   ADMIN REPAIR UPDATES MODULE
   File: js/admin-updates.js

   Purpose:
   Handles repair update history and service request progress notes.

   This file no longer creates job cards.
   Job-card creation now belongs to js/admin-job-cards.js.
   ========================================================= */

   let repairUpdatesByRequest = {};

   /* =========================================================
      1. LOAD REPAIR UPDATES
      ========================================================= */
   
   async function loadRepairUpdates() {
     repairUpdatesByRequest = {};
   
     if (!allRequests || allRequests.length === 0) return;
   
     const requestIds = allRequests.map((request) => request.id);
   
     const { data, error } = await supabaseClient
       .from("repair_updates")
       .select("id, service_request_id, title, message, visible_to_customer, created_at")
       .in("service_request_id", requestIds)
       .order("created_at", { ascending: false });
   
     if (error) {
       console.error("Could not load repair updates:", error.message);
       return;
     }
   
     (data || []).forEach((update) => {
       if (!repairUpdatesByRequest[update.service_request_id]) {
         repairUpdatesByRequest[update.service_request_id] = [];
       }
   
       repairUpdatesByRequest[update.service_request_id].push(update);
     });
   }
   
   /* =========================================================
      2. RENDER UPDATE HISTORY
      ========================================================= */
   
   function renderUpdateHistory(requestId) {
     const updates = repairUpdatesByRequest[requestId] || [];
   
     if (updates.length === 0) {
       return 
         <div class="card-notes">
           <strong>Update History:</strong>
           <p>No repair updates saved yet.</p>
         </div>
       ;
     }
   
     const items = updates.map((update) => {
       const visibility = update.visible_to_customer
         ? "Customer visible"
         : "Internal only";
   
       return 
         <div class="timeline-item">
           <strong>${safeText((update.title || "update").replaceAll("_", " "))}</strong>
           <small>${formatDate(update.created_at)} • ${visibility}</small>
           <p>${safeText(update.message)}</p>
         </div>
       ;
     }).join("");
   
     return 
       <div class="card-notes">
         <strong>Update History:</strong>
         <div class="timeline-list">
           ${items}
         </div>
       </div>
     ;
   }
   
   /* =========================================================
      3. RENDER REPAIR UPDATE FORM
      ========================================================= */
   
   function renderRepairUpdateForm(request, status, priority) {
     return 
       <div class="action-row repair-update-box">
         <label>
           Status
           <select class="status-select" data-id="${request.id}">
             <option value="new" ${status === "new" ? "selected" : ""}>New</option>
             <option value="acknowledged" ${status === "acknowledged" ? "selected" : ""}>Acknowledged</option>
             <option value="diagnosing" ${status === "diagnosing" ? "selected" : ""}>Diagnosing</option>
             <option value="waiting_parts" ${status === "waiting_parts" ? "selected" : ""}>Waiting Parts</option>
             <option value="repairing" ${status === "repairing" ? "selected" : ""}>Repairing</option>
             <option value="ready_for_pickup" ${status === "ready_for_pickup" ? "selected" : ""}>Ready for Pickup</option>
             <option value="closed" ${status === "closed" ? "selected" : ""}>Closed</option>
             <option value="cancelled" ${status === "cancelled" ? "selected" : ""}>Cancelled</option>
           </select>
         </label>
   
         ${hasFullAccess() ? 
           <label>
             Priority
             <select class="priority-select" data-id="${request.id}">
               <option value="low" ${priority === "low" ? "selected" : ""}>Low</option>
               <option value="normal" ${priority === "normal" ? "selected" : ""}>Normal</option>
               <option value="high" ${priority === "high" ? "selected" : ""}>High</option>
               <option value="urgent" ${priority === "urgent" ? "selected" : ""}>Urgent</option>
             </select>
           </label>
   
           <label>
             Estimated Cost
             <input class="estimated-cost-input" data-id="${request.id}" type="number" min="0" step="0.01" value="${Number(request.estimated_cost || 0)}">
           </label>
   
           <label>
             Final Cost
             <input class="final-cost-input" data-id="${request.id}" type="number" min="0" step="0.01" value="${Number(request.final_cost || 0)}">
           </label>
          : ""}
   
         <label class="wide-field">
           Repair Update
           <textarea class="repair-update-input" data-id="${request.id}" placeholder="Example: Mechanic has started checking the issue."></textarea>
         </label>
   
         <label class="checkbox-line">
           <input type="checkbox" class="internal-only-checkbox" data-id="${request.id}">
           Internal note only
         </label>
   
         <button class="save-repair-update-btn" data-id="${request.id}">
           Save Update
         </button>
       </div>
     ;
   }
   
   /* =========================================================
      4. SAVE REPAIR UPDATE
      ========================================================= */
   
   async function saveRepairUpdate(requestId, button) {
     const statusValue = document.querySelector(.status-select[data-id="${requestId}"]).value;
     const messageValue = document.querySelector(.repair-update-input[data-id="${requestId}"]).value.trim();
     const internalOnly = document.querySelector(.internal-only-checkbox[data-id="${requestId}"]).checked;
   
     if (!messageValue) {
       alert("Please write a repair update before saving.");
       return;
     }
   
     button.disabled = true;
     button.textContent = "Saving...";
   
     if (hasFullAccess()) {
       const priorityValue = document.querySelector(.priority-select[data-id="${requestId}"]).value;
       const estimatedCostValue = document.querySelector(.estimated-cost-input[data-id="${requestId}"]).value;
       const finalCostValue = document.querySelector(.final-cost-input[data-id="${requestId}"]).value;
   
       const { error: requestUpdateError } = await supabaseClient
         .from("service_requests")
         .update({
           priority: priorityValue,
           estimated_cost: Number(estimatedCostValue || 0),
           final_cost: Number(finalCostValue || 0)
         })
         .eq("id", requestId);
   
       if (requestUpdateError) {
         alert("Could not update costs/priority: " + requestUpdateError.message);
         button.disabled = false;
         button.textContent = "Save Update";
         return;
       }
     }
   
     const { error } = await supabaseClient.rpc("save_repair_update", {
       p_service_request_id: Number(requestId),
       p_status: statusValue,
       p_message: messageValue,
       p_internal_only: internalOnly
     });
   
     if (error) {
       alert("Could not save update: " + error.message);
     } else {
       alert("Repair update saved successfully.");
       await loadServiceRequests();
     }
   
     button.disabled = false;
     button.textContent = "Save Update";
   }
   
   /* =========================================================
      5. BUTTON BINDINGS
      ========================================================= */
   
   function bindRepairUpdateButtons() {
     document.querySelectorAll(".save-repair-update-btn").forEach((button) => {
       button.addEventListener("click", async function () {
         await saveRepairUpdate(button.getAttribute("data-id"), button);
       });
     });
   }
/* =========================================================
   ADMIN JOB CARDS MODULE
   File: js/admin-job-cards.js

   Purpose:
   Handles job-card lookup and job-card creation.

   Business separation:
   - Service Request = intake/customer request
   - Job Card = workshop repair job

   New workflow:
   - If no job card exists, show "Create Mechanic Job Card".
   - If a job card already exists, show confirmation AND allow
     "Create Additional Job Card" for extra problems discovered later.
   ========================================================= */

   let jobCardsByRequest = {};

   /* =========================================================
      1. LOAD JOB CARDS FOR CURRENT REQUESTS
      Operation:
      Groups job cards by service_request_id.
      A service request may now have more than one job card.
      ========================================================= */
   
   async function loadJobCardsForRequests() {
     jobCardsByRequest = {};
   
     if (!Array.isArray(allRequests) || allRequests.length === 0) return;
   
     const requestIds = allRequests.map((request) => request.id);
   
     const { data, error } = await supabaseClient
       .from("job_cards")
       .select(
         id,
         service_request_id,
         vehicle_id,
         job_status,
         assigned_mechanic,
         repair_bay,
         appointment_date,
         estimated_completion
       )
       .in("service_request_id", requestIds)
       .order("id", { ascending: false });
   
     if (error) {
       console.error("Could not load job cards:", error.message);
       return;
     }
   
     (data || []).forEach((job) => {
       if (!jobCardsByRequest[job.service_request_id]) {
         jobCardsByRequest[job.service_request_id] = [];
       }
   
       jobCardsByRequest[job.service_request_id].push(job);
     });
   }
   
   /* =========================================================
      2. RENDER CREATE JOB CARD BOX
      Operation:
      Shows first-job form if no job exists.
      Shows existing job summary plus additional-job form if jobs exist.
      ========================================================= */
   
   function renderCreateJobCardBox(request) {
     const existingJobs = jobCardsByRequest[request.id] || [];
   
     if (existingJobs.length > 0) {
       const jobList = existingJobs.map((job) => {
         return 
           <li>
             <strong>JOB-${job.id}</strong>
             <span>Status: ${safeText(job.job_status || "created")}</span>
           </li>
         ;
       }).join("");
   
       return 
         <div class="existing-job-card-box">
           <strong>Mechanic Job Card Created</strong>
   
           <p>
             This service request already has ${existingJobs.length} mechanic job card(s).
             Create another job card only when the same vehicle needs a separate repair issue handled.
           </p>
   
           <ul class="existing-job-list">
             ${jobList}
           </ul>
   
           <button class="show-additional-job-btn" data-id="${request.id}">
             Create Additional Job Card
           </button>
   
           <div class="additional-job-form hidden" id="additionalJobForm-${request.id}">
             ${renderJobCardFormFields(request, "additional")}
           </div>
         </div>
       ;
     }
   
     return 
       <div class="create-job-box">
         <div>
           <strong>Create Mechanic Job Card</strong>
           <p>
             Convert this customer service request into an active workshop job.
             This keeps intake separate from mechanic operations.
           </p>
         </div>
   
         ${renderJobCardFormFields(request, "first")}
       </div>
     ;
   }
   
   /* =========================================================
      3. RENDER SHARED JOB CARD FORM FIELDS
      Operation:
      Used for first job cards and additional job cards.
      ========================================================= */
   
   function renderJobCardFormFields(request, mode) {
     const buttonText = mode === "additional"
       ? "Create Additional Job Card"
       : "Create Job Card";
   
     return 
       <div class="create-job-grid">
         <label>
           Assigned Mechanic
           <input
             class="job-mechanic-input"
             data-id="${request.id}"
             data-mode="${mode}"
             type="text"
             placeholder="Example: John, Tunde, Shop Team"
           >
         </label>
   
         <label>
           Repair Bay
           <input
             class="job-bay-input"
             data-id="${request.id}"
             data-mode="${mode}"
             type="text"
             placeholder="Example: Bay 1"
           >
         </label>
   
         <label>
           Appointment Date
           <input
             class="job-appointment-input"
             data-id="${request.id}"
             data-mode="${mode}"
             type="datetime-local"
           >
         </label>
   
         <label>
           Estimated Completion
           <input
             class="job-completion-input"
             data-id="${request.id}"
             data-mode="${mode}"
             type="datetime-local"
           >
         </label>
       </div>
   
       <button
         class="create-job-card-btn"
         data-id="${request.id}"
         data-mode="${mode}"
       >
         ${buttonText}
       </button>
     ;
   }
   
   /* =========================================================
      4. CREATE JOB CARD
      Operation:
      Creates a workshop job card from a service request.
      Additional job cards are allowed only when the user clicks
      "Create Additional Job Card".
      ========================================================= */
   
   async function createJobCardFromRequest(requestId, mode, button) {
     const request = allRequests.find((item) => {
       return String(item.id) === String(requestId);
     });
   
     if (!request) {
       alert("Could not find this service request.");
       return;
     }
   
     const existingJobs = jobCardsByRequest[request.id] || [];
   
     if (existingJobs.length > 0 && mode !== "additional") {
       alert("A mechanic job card already exists. Use Create Additional Job Card if this is a separate repair issue.");
       return;
     }
   
     const confirmMessage = existingJobs.length > 0
       ? "Create another job card for this same service request?"
       : "Create mechanic job card for this service request?";
   
     if (!confirm(confirmMessage)) return;
   
     button.disabled = true;
     button.textContent = "Creating Job...";
   
     const assignedMechanic =
       document.querySelector(.job-mechanic-input[data-id="${requestId}"][data-mode="${mode}"])?.value.trim() || "";
   
     const repairBay =
       document.querySelector(.job-bay-input[data-id="${requestId}"][data-mode="${mode}"])?.value.trim() || "";
   
     const appointmentDate =
       document.querySelector(.job-appointment-input[data-id="${requestId}"][data-mode="${mode}"])?.value || null;
   
     const estimatedCompletion =
       document.querySelector(.job-completion-input[data-id="${requestId}"][data-mode="${mode}"])?.value || null;
   
     const jobPayload = {
       service_request_id: Number(request.id),
       vehicle_id: request.vehicle_id || null,
   
       customer_name: request.name || null,
       customer_email: request.email || null,
       customer_phone: request.phone || null,
   
       vehicle: request.vehicle || null,
       complaint: request.message || null,
   
       job_status: "created",
       assigned_mechanic: assignedMechanic || null,
       repair_bay: repairBay || null,
       appointment_date: appointmentDate,
       estimated_completion: estimatedCompletion,
   
       estimated_cost: Number(request.estimated_cost || 0),
       final_cost: Number(request.final_cost || 0),
   
       labor_notes: "",
       parts_notes: ""
     };
   
     const { error: jobError } = await supabaseClient
       .from("job_cards")
       .insert([jobPayload]);
   
     if (jobError) {
       alert("Could not create job card: " + jobError.message);
       button.disabled = false;
       button.textContent = mode === "additional" ? "Create Additional Job Card" : "Create Job Card";
       return;
     }
   
     await supabaseClient
       .from("service_requests")
       .update({ status: "acknowledged" })
       .eq("id", request.id);
   
     alert("Job card created successfully.");
   
     button.disabled = false;
     button.textContent = mode === "additional" ? "Create Additional Job Card" : "Create Job Card";
   
     await loadServiceRequests();
   
     if (typeof loadMechanicBoard === "function") {
       await loadMechanicBoard();
     }
   }
   
   /* =========================================================
      5. BUTTON BINDINGS
      Operation:
      Connects Create Job Card and Create Additional Job Card buttons.
      ========================================================= */
   
   function bindCreateJobButtons() {
     document.querySelectorAll(".show-additional-job-btn").forEach((button) => {
       button.addEventListener("click", function () {
         const requestId = button.getAttribute("data-id");
         const form = document.getElementById(additionalJobForm-${requestId});
   
         if (form) {
           form.classList.toggle("hidden");
         }
       });
     });
   
     document.querySelectorAll(".create-job-card-btn").forEach((button) => {
       button.addEventListener("click", async function () {
         const requestId = button.getAttribute("data-id");
         const mode = button.getAttribute("data-mode") || "first";
   
         await createJobCardFromRequest(requestId, mode, button);
       });
     });
   }

/* =========================================================
   ADMIN WORKSPACE SHELL
   File: js/admin-workspace-shell.js

   Purpose:
   Controls opening and closing enterprise workspaces.

   Responsibilities:
   - Renders a workspace inside #workspaceContainer.
   - Temporarily hides the normal module list and toolbar.
   - Preserves search controls and table state.
   - Preserves the user's previous page position.
   - Restores the original module when the workspace closes.
   - Closes an open workspace when navigating to another module.
   ========================================================= */


/* =========================================================
   1. WORKSPACE STATE
   ========================================================= */

   let activeWorkspaceState = {
    isOpen: false,
    module: null,
    ownerSectionId: null,
    ownerSection: null,
    hiddenElements: [],
    previousScrollY: 0
  };
  
  
  /* =========================================================
     2. GET WORKSPACE CONTAINER
     ========================================================= */
  
  function getWorkspaceContainer() {
    return document.getElementById("workspaceContainer");
  }
  
  
  /* =========================================================
     3. HIDE NORMAL MODULE ELEMENTS
  
     These elements are not removed from the page.
  
     They are temporarily hidden so:
     - Search values remain intact.
     - Selected filters remain intact.
     - Table horizontal scroll remains intact.
     - Loaded records remain intact.
     ========================================================= */
  
  function hideWorkspaceSourceElements(ownerSection, selectors = []) {
    const hiddenElements = [];
  
    if (!ownerSection || !Array.isArray(selectors)) {
      return hiddenElements;
    }
  
    selectors.forEach((selector) => {
      ownerSection.querySelectorAll(selector).forEach((element) => {
        if (element.id === "workspaceContainer") {
          return;
        }
  
        element.classList.add("workspace-source-hidden");
        hiddenElements.push(element);
      });
    });
  
    return hiddenElements;
  }
  
  
  /* =========================================================
     4. RESTORE NORMAL MODULE ELEMENTS
     ========================================================= */
  
  function restoreWorkspaceSourceElements() {
    activeWorkspaceState.hiddenElements.forEach((element) => {
      if (element && document.body.contains(element)) {
        element.classList.remove("workspace-source-hidden");
      }
    });
  
    activeWorkspaceState.hiddenElements = [];
  }
  
  
  /* =========================================================
     5. OPEN WORKSPACE
     ========================================================= */
  
  function openWorkspace(config = {}) {
    const container = getWorkspaceContainer();
  
    if (!container) {
      console.error(
        "Workspace could not open because #workspaceContainer was not found."
      );
  
      if (typeof showToast === "function") {
        showToast(
          "error",
          "Workspace Error",
          "The workspace container could not be found."
        );
      }
  
      return;
    }
  
    if (typeof renderWorkspace !== "function") {
      console.error("renderWorkspace() is not available.");
  
      if (typeof showToast === "function") {
        showToast(
          "error",
          "Workspace Error",
          "The workspace component could not be loaded."
        );
      }
  
      return;
    }
  
    /*
      Close any previously opened workspace without restoring
      the former scroll position.
    */
    if (activeWorkspaceState.isOpen) {
      closeWorkspace({
        restoreScroll: false
      });
    }
  
    const ownerSectionId =
      config.ownerSectionId ||
      container.closest(".admin-section")?.id ||
      null;
  
    const ownerSection = ownerSectionId
      ? document.getElementById(ownerSectionId)
      : container.closest(".admin-section");
  
    activeWorkspaceState = {
      isOpen: true,
      module: config.module || null,
      ownerSectionId,
      ownerSection,
      hiddenElements: [],
      previousScrollY: window.scrollY
    };
  
    /*
      Hide the normal module interface while this workspace is open.
    */
    if (ownerSection) {
      ownerSection.classList.add("workspace-open");
  
      activeWorkspaceState.hiddenElements =
        hideWorkspaceSourceElements(
          ownerSection,
          config.hideSelectors || []
        );
    }
  
    /*
      Render the workspace.
    */
    container.innerHTML = renderWorkspace(config);
  
    container.classList.remove("hidden");
    container.classList.add("workspace-container-active");
  
    container.dataset.workspaceModule =
      config.module || "workspace";
  
    /*
      Connect the reusable workspace tab controller.
    */
    if (typeof bindWorkspaceTabs === "function") {
      bindWorkspaceTabs(container);
    }
  
    /*
      Place the newly opened workspace near the top of the viewport.
    */
    requestAnimationFrame(() => {
      container.scrollIntoView({
        behavior: "auto",
        block: "start"
      });
    });
  }
  
  
  /* =========================================================
     6. CLOSE WORKSPACE
     ========================================================= */
  
  function closeWorkspace(options = {}) {
    const {
      restoreScroll = true
    } = options;
  
    const container = getWorkspaceContainer();
    const previousScrollY =
      activeWorkspaceState.previousScrollY || 0;
  
    restoreWorkspaceSourceElements();
  
    if (activeWorkspaceState.ownerSection) {
      activeWorkspaceState.ownerSection.classList.remove(
        "workspace-open"
      );
    }
  
    if (container) {
      container.innerHTML = "";
      container.classList.add("hidden");
      container.classList.remove("workspace-container-active");
  
      delete container.dataset.workspaceModule;
    }
  
    activeWorkspaceState = {
      isOpen: false,
      module: null,
      ownerSectionId: null,
      ownerSection: null,
      hiddenElements: [],
      previousScrollY: 0
    };
  
    if (restoreScroll) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: previousScrollY,
          left: 0,
          behavior: "auto"
        });
      });
    }
  }
  
  
  /* =========================================================
     7. CLOSE WORKSPACE WHEN NAVIGATING AWAY
  
     Example:
     A service request workspace is open and the user clicks
     Inventory. The request workspace should close before the
     Inventory section becomes the main context.
     ========================================================= */
  
  document.addEventListener("click", function (event) {
    const navigationButton = event.target.closest(
      ".nav-btn[data-section]"
    );
  
    if (!navigationButton || !activeWorkspaceState.isOpen) {
      return;
    }
  
    const destinationSection =
      navigationButton.dataset.section;
  
    if (
      destinationSection &&
      destinationSection !== activeWorkspaceState.ownerSectionId
    ) {
      closeWorkspace({
        restoreScroll: false
      });
    }
  });
  
  
  /* =========================================================
     8. ESCAPE KEY SUPPORT
     ========================================================= */
  
  document.addEventListener("keydown", function (event) {
    if (
      event.key === "Escape" &&
      activeWorkspaceState.isOpen &&
      !document.getElementById("adminModalBackdrop")
    ) {
      closeWorkspace();
    }
  });
  
  
  /* =========================================================
     9. GLOBAL EXPORTS
     ========================================================= */
  
  window.openWorkspace = openWorkspace;
  window.closeWorkspace = closeWorkspace;

/* =========================================================
   ADMIN REPAIR UPDATES MODULE
   File: js/admin-updates.js

   Purpose:
   Handles repair update history and service request progress notes.

   This file no longer creates job cards.
   Job-card creation now belongs to js/admin-job-cards.js.
   ========================================================= */

   let repairUpdatesByRequest = {};

   /* =========================================================
      1. LOAD REPAIR UPDATES
      ========================================================= */
   
   async function loadRepairUpdates() {
     repairUpdatesByRequest = {};
   
     if (!allRequests || allRequests.length === 0) return;
   
     const requestIds = allRequests.map((request) => request.id);
   
     const { data, error } = await supabaseClient
       .from("repair_updates")
       .select("id, service_request_id, title, message, visible_to_customer, created_at")
       .in("service_request_id", requestIds)
       .order("created_at", { ascending: false });
   
     if (error) {
       console.error("Could not load repair updates:", error.message);
       return;
     }
   
     (data || []).forEach((update) => {
       if (!repairUpdatesByRequest[update.service_request_id]) {
         repairUpdatesByRequest[update.service_request_id] = [];
       }
   
       repairUpdatesByRequest[update.service_request_id].push(update);
     });
   }
   
   /* =========================================================
      2. RENDER UPDATE HISTORY
      ========================================================= */
   
   function renderUpdateHistory(requestId) {
     const updates = repairUpdatesByRequest[requestId] || [];
   
     if (updates.length === 0) {
       return 
         <div class="card-notes">
           <strong>Update History:</strong>
           <p>No repair updates saved yet.</p>
         </div>
       ;
     }
   
     const items = updates.map((update) => {
       const visibility = update.visible_to_customer
         ? "Customer visible"
         : "Internal only";
   
       return 
         <div class="timeline-item">
           <strong>${safeText((update.title || "update").replaceAll("_", " "))}</strong>
           <small>${formatDate(update.created_at)} • ${visibility}</small>
           <p>${safeText(update.message)}</p>
         </div>
       ;
     }).join("");
   
     return 
       <div class="card-notes">
         <strong>Update History:</strong>
         <div class="timeline-list">
           ${items}
         </div>
       </div>
     ;
   }
   
   /* =========================================================
      3. RENDER REPAIR UPDATE FORM
      ========================================================= */
   
   function renderRepairUpdateForm(request, status, priority) {
     return 
       <div class="action-row repair-update-box">
         <label>
           Status
           <select class="status-select" data-id="${request.id}">
             <option value="new" ${status === "new" ? "selected" : ""}>New</option>
             <option value="acknowledged" ${status === "acknowledged" ? "selected" : ""}>Acknowledged</option>
             <option value="diagnosing" ${status === "diagnosing" ? "selected" : ""}>Diagnosing</option>
             <option value="waiting_parts" ${status === "waiting_parts" ? "selected" : ""}>Waiting Parts</option>
             <option value="repairing" ${status === "repairing" ? "selected" : ""}>Repairing</option>
             <option value="ready_for_pickup" ${status === "ready_for_pickup" ? "selected" : ""}>Ready for Pickup</option>
             <option value="closed" ${status === "closed" ? "selected" : ""}>Closed</option>
             <option value="cancelled" ${status === "cancelled" ? "selected" : ""}>Cancelled</option>
           </select>
         </label>
   
         ${hasFullAccess() ? 
           <label>
             Priority
             <select class="priority-select" data-id="${request.id}">
               <option value="low" ${priority === "low" ? "selected" : ""}>Low</option>
               <option value="normal" ${priority === "normal" ? "selected" : ""}>Normal</option>
               <option value="high" ${priority === "high" ? "selected" : ""}>High</option>
               <option value="urgent" ${priority === "urgent" ? "selected" : ""}>Urgent</option>
             </select>
           </label>
   
           <label>
             Estimated Cost
             <input class="estimated-cost-input" data-id="${request.id}" type="number" min="0" step="0.01" value="${Number(request.estimated_cost || 0)}">
           </label>
   
           <label>
             Final Cost
             <input class="final-cost-input" data-id="${request.id}" type="number" min="0" step="0.01" value="${Number(request.final_cost || 0)}">
           </label>
          : ""}
   
         <label class="wide-field">
           Repair Update
           <textarea class="repair-update-input" data-id="${request.id}" placeholder="Example: Mechanic has started checking the issue."></textarea>
         </label>
   
         <label class="checkbox-line">
           <input type="checkbox" class="internal-only-checkbox" data-id="${request.id}">
           Internal note only
         </label>
   
         <button class="save-repair-update-btn" data-id="${request.id}">
           Save Update
         </button>
       </div>
     ;
   }
   
   /* =========================================================
      4. SAVE REPAIR UPDATE
      ========================================================= */
   
   async function saveRepairUpdate(requestId, button) {
     const statusValue = document.querySelector(.status-select[data-id="${requestId}"]).value;
     const messageValue = document.querySelector(.repair-update-input[data-id="${requestId}"]).value.trim();
     const internalOnly = document.querySelector(.internal-only-checkbox[data-id="${requestId}"]).checked;
   
     if (!messageValue) {
       alert("Please write a repair update before saving.");
       return;
     }
   
     button.disabled = true;
     button.textContent = "Saving...";
   
     if (hasFullAccess()) {
       const priorityValue = document.querySelector(.priority-select[data-id="${requestId}"]).value;
       const estimatedCostValue = document.querySelector(.estimated-cost-input[data-id="${requestId}"]).value;
       const finalCostValue = document.querySelector(.final-cost-input[data-id="${requestId}"]).value;
   
       const { error: requestUpdateError } = await supabaseClient
         .from("service_requests")
         .update({
           priority: priorityValue,
           estimated_cost: Number(estimatedCostValue || 0),
           final_cost: Number(finalCostValue || 0)
         })
         .eq("id", requestId);
   
       if (requestUpdateError) {
         alert("Could not update costs/priority: " + requestUpdateError.message);
         button.disabled = false;
         button.textContent = "Save Update";
         return;
       }
     }
   
     const { error } = await supabaseClient.rpc("save_repair_update", {
       p_service_request_id: Number(requestId),
       p_status: statusValue,
       p_message: messageValue,
       p_internal_only: internalOnly
     });
   
     if (error) {
       alert("Could not save update: " + error.message);
     } else {
       alert("Repair update saved successfully.");
       await loadServiceRequests();
     }
   
     button.disabled = false;
     button.textContent = "Save Update";
   }
   
   /* =========================================================
      5. BUTTON BINDINGS
      ========================================================= */
   
   function bindRepairUpdateButtons() {
     document.querySelectorAll(".save-repair-update-btn").forEach((button) => {
       button.addEventListener("click", async function () {
         await saveRepairUpdate(button.getAttribute("data-id"), button);
       });
     });
   }
/* =========================================================
   ADMIN MODALS
   File: css/admin-modals.css

   Current modal framework now lives in:
   - js/ui/admin-components.js
   - css/admin-workspace.css

   This file is intentionally kept as a safe compatibility file.
   Do not define .admin-modal-backdrop, .admin-modal-box,
   .admin-modal-header, .admin-modal-body, or .admin-modal-footer here.
========================================================= */

/* Legacy modal only */
.admin-modal {
  width: min(780px, 92vw);
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: var(--shadow-md);
}
/* =========================================================
   ADMIN LAYOUT
   File: css/admin-layout.css
   ========================================================= */

   .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: 270px;
    background: var(--color-sidebar);
    color: #fff;
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .sidebar-logo {
    font-size: 1.7rem;
    font-weight: 900;
    line-height: 1.1;
  }
  
  .sidebar-logo span {
    display: block;
    color: var(--color-primary);
  }
  
  .sidebar-role {
    margin: 28px 0;
    padding: 9px 14px;
    border-radius: 999px;
    background: rgba(255,255,255,.12);
    display: inline-block;
    font-size: .8rem;
    font-weight: 800;
    text-transform: uppercase;
  }
  
  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .nav-btn {
    border: 0;
    background: transparent;
    color: #fff;
    text-align: left;
    padding: 14px 16px;
    border-radius: 9px;
    font-weight: 800;
    cursor: pointer;
  }
  
  .nav-btn.active,
  .nav-btn:hover {
    background: var(--color-primary);
  }
  
  .sidebar-footer a,
  .sidebar-footer button {
    display: block;
    width: 100%;
    margin-top: 12px;
    padding: 14px;
    border-radius: 9px;
    text-align: center;
    font-weight: 900;
    border: 0;
    text-decoration: none;
    cursor: pointer;
  }
  
  .sidebar-footer a {
    background: rgba(255,255,255,.12);
    color: #fff;
  }
  
  .sidebar-footer button {
    background: var(--color-primary);
    color: #fff;
  }
  
  .admin-main {
    margin-left: 270px;
    padding: 34px;
    min-height: 100vh;
  }
  
  .admin-topbar {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: 28px;
    display: flex;
    justify-content: space-between;
    gap: 24px;
    box-shadow: var(--shadow-sm);
    margin-bottom: 30px;
  }
  
  .top-label,
  .section-heading p {
    margin: 0;
    color: var(--color-primary);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .08em;
  }
  
  .admin-topbar h1,
  .section-heading h2 {
    margin: 6px 0;
    font-size: 2rem;
  }
  
  .top-subtitle {
    color: var(--color-muted);
    margin: 0;
  }
  
  .profile-card {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #f5f7fa;
    padding: 16px;
    border-radius: var(--radius-md);
    min-width: 260px;
  }
  
  .profile-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--color-navy);
    color: #fff;
    font-weight: 900;
  }
  
  .profile-card span,
  .profile-card small {
    display: block;
    color: var(--color-muted);
  }
  
  .profile-card small {
    background: var(--color-navy);
    color: #fff;
    padding: 3px 9px;
    border-radius: 999px;
    width: fit-content;
    margin-top: 4px;
    font-weight: 900;
  }
  
  .admin-section {
    display: none;
  }
  
  .admin-section.active-section {
    display: block;
  }
  
  .section-heading {
    margin-bottom: 24px;
  }
  
  .toolbar {
    background: var(--color-surface);
    padding: 18px;
    border-radius: var(--radius-md);
    display: flex;
    gap: 14px;
    margin-bottom: 22px;
    box-shadow: var(--shadow-sm);
  }
  
  .toolbar input {
    flex: 1;
  }
  
  @media (max-width: 900px) {
    .sidebar {
      position: static;
      width: 100%;
    }
  
    .admin-main {
      margin-left: 0;
      padding: 20px;
    }
  
    .admin-topbar,
    .toolbar {
      flex-direction: column;
    }
  }
/* =========================================================
   ADMIN FORMS
   File: css/admin-forms.css
   ========================================================= */

   input,
   select,
   textarea {
     width: 100%;
     border: 1px solid #cfd7e2;
     border-radius: var(--radius-sm);
     padding: 14px 16px;
     font-size: 1rem;
     background: #fff;
     color: var(--color-text);
   }
   
   textarea {
     min-height: 110px;
     resize: vertical;
   }
   
   input:focus,
   select:focus,
   textarea:focus {
     outline: 2px solid #9cc4ff;
     border-color: var(--color-info);
   }
   
   label {
     font-weight: 800;
     color: var(--color-text);
   }
   
   .form-grid {
     display: grid;
     grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
     gap: 16px;
   }
/* =========================================================
   ADMIN ENTERPRISE COMPONENTS
   File: css/admin-components.css

   Purpose:
   Reusable UI components used across all admin modules:
   - Breadcrumbs
   - Action toolbar
   - Toast notifications
   - Empty/loading states
   - Slide-over panel
   - Modal framework
   - Context menu
   ========================================================= */


/* BREADCRUMBS */

.admin-breadcrumbs {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
    color: var(--color-muted);
    font-size: 0.9rem;
    font-weight: 700;
  }
  
  .admin-breadcrumbs span {
    color: var(--color-muted);
  }
  
  .admin-breadcrumbs strong {
    color: var(--color-navy);
  }
  
  .admin-breadcrumb-separator {
    color: #9ca3af;
  }
  
  
  /* GLOBAL ACTION TOOLBAR */
  
  .admin-action-toolbar {
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: 14px 16px;
    box-shadow: var(--shadow-sm);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    margin-bottom: 18px;
  }
  
  .admin-action-toolbar-left,
  .admin-action-toolbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .admin-action-toolbar-title {
    font-weight: 900;
    color: var(--color-navy);
  }
  
  
  /* TOAST NOTIFICATIONS */
  
  .admin-toast-container {
    position: fixed;
    top: 22px;
    right: 22px;
    z-index: 9999;
    display: grid;
    gap: 12px;
  }
  
  .admin-toast {
    min-width: 280px;
    max-width: 420px;
    background: #fff;
    border-radius: var(--radius-md);
    padding: 14px 16px;
    box-shadow: var(--shadow-md);
    border-left: 5px solid var(--color-info);
    animation: toastIn 0.2s ease-out;
  }
  
  .admin-toast strong {
    display: block;
    color: var(--color-navy);
    margin-bottom: 4px;
  }
  
  .admin-toast p {
    margin: 0;
    color: var(--color-muted);
  }
  
  .admin-toast.success {
    border-left-color: var(--color-success);
  }
  
  .admin-toast.warning {
    border-left-color: var(--color-warning);
  }
  
  .admin-toast.danger {
    border-left-color: var(--color-danger);
  }
  
  @keyframes toastIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
  
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  
  /* EMPTY / LOADING STATES */
  
  .admin-empty-state,
  .admin-loading-state {
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: 32px;
    text-align: center;
    color: var(--color-muted);
    box-shadow: var(--shadow-sm);
  }
  
  .admin-empty-state strong,
  .admin-loading-state strong {
    display: block;
    color: var(--color-navy);
    font-size: 1.1rem;
    margin-bottom: 6px;
  }
  
  .admin-loading-spinner {
    width: 34px;
    height: 34px;
    border: 4px solid #e5e7eb;
    border-top-color: var(--color-primary);
    border-radius: 50%;
    margin: 0 auto 14px;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  
  /* SLIDE-OVER PANEL */
  
  .admin-slide-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.38);
    z-index: 9990;
    display: flex;
    justify-content: flex-end;
  }
  
  .admin-slide-panel {
    width: min(560px, 96vw);
    height: 100%;
    background: #fff;
    box-shadow: var(--shadow-md);
    padding: 24px;
    overflow-y: auto;
    animation: slideIn 0.22s ease-out;
  }
  
  .admin-slide-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    margin-bottom: 20px;
  }
  
  .admin-slide-header h3 {
    margin: 0;
    color: var(--color-navy);
  }
  
  .admin-slide-close {
    border: 0;
    background: transparent;
    font-size: 1.6rem;
    cursor: pointer;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
  
    to {
      transform: translateX(0);
    }
  }
  
  
  /* MODAL FRAMEWORK */
  
  .admin-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.42);
    z-index: 9995;
    display: grid;
    place-items: center;
    padding: 20px;
  }
  
  .admin-modal-box {
    width: min(720px, 96vw);
    background: #fff;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    padding: 24px;
  }
  
  .admin-modal-header {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 18px;
  }
  
  .admin-modal-header h3 {
    margin: 0;
    color: var(--color-navy);
  }
  
  .admin-modal-close {
    border: 0;
    background: transparent;
    font-size: 1.6rem;
    cursor: pointer;
  }
  
  .admin-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 22px;
  }
  
  
  /* CONTEXT MENU */
  
  .admin-context-menu {
    position: fixed;
    z-index: 10000;
    width: 220px;
    background: #fff;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-border);
    overflow: hidden;
  }
  
  .admin-context-menu button {
    width: 100%;
    border: 0;
    background: #fff;
    text-align: left;
    padding: 12px 14px;
    font-weight: 800;
    color: var(--color-text);
  }
  
  .admin-context-menu button:hover {
    background: #f3f4f6;
  }
  
  .admin-context-menu button.danger {
    color: var(--color-danger);
  }
/* =========================================================
   ADMIN CARDS
   File: css/admin-cards.css
   ========================================================= */

   .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 20px;
  }
  
  .stat-card,
  .module-card,
  .request-card {
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: 24px;
    box-shadow: var(--shadow-sm);
  }
  
  .stat-card {
    border-top: 6px solid var(--color-navy);
  }
  
  .stat-card.blue {
    border-color: var(--color-info);
  }
  
  .stat-card.orange {
    border-color: var(--color-warning);
  }
  
  .stat-card.green {
    border-color: var(--color-success);
  }
  
  .stat-card.red {
    border-color: var(--color-danger);
  }
  
  .stat-card h3 {
    margin: 0;
    font-size: 2.3rem;
  }
  
  .stat-card p {
    margin: 8px 0 0;
    color: #555;
  }
  
  .cards-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .empty-message {
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: 24px;
    text-align: center;
    color: #555;
  }
/* =========================================================
   ADMIN BUTTONS
   File: css/admin-buttons.css
   ========================================================= */

   button,
   .btn {
     font-family: inherit;
   }
   
   button {
     cursor: pointer;
   }
   
   .btn-primary,
   .toolbar button,
   .inventory-toolbar button,
   .inventory-form button[type="submit"] {
     background: var(--color-primary);
     color: #fff;
     border: 0;
     border-radius: var(--radius-sm);
     padding: 14px 20px;
     font-weight: 900;
   }
   
   .btn-primary:hover,
   .toolbar button:hover,
   .inventory-toolbar button:hover {
     background: var(--color-primary-dark);
   }
   
   .table-action-btn,
   .secondary-action-btn {
     background: var(--color-navy);
     color: #fff;
     border: 0;
     border-radius: var(--radius-sm);
     padding: 10px 14px;
     font-weight: 900;
   }
   
   .secondary-action-btn {
     background: #274867;
   }
   
   .danger-action-btn {
     background: var(--color-danger);
     color: #fff;
     border: 0;
     border-radius: var(--radius-sm);
     padding: 10px 14px;
     font-weight: 900;
   }
   
   button:disabled {
     opacity: .55;
     cursor: not-allowed;
   }
/* =========================================================
   ADMIN BADGES
   File: css/admin-badges.css
   ========================================================= */

   .status-badge,
   .priority-badge {
     display: inline-flex;
     align-items: center;
     justify-content: center;
     padding: 7px 13px;
     border-radius: 999px;
     font-size: .75rem;
     font-weight: 900;
     text-transform: uppercase;
   }
   
   .status-new {
     background: #dbeafe;
     color: #1e40af;
   }
   
   .status-acknowledged {
     background: #ede9fe;
     color: #4c1d95;
   }
   
   .status-diagnosing,
   .status-repairing,
   .status-testing,
   .status-waiting_parts {
     background: #fff7ed;
     color: #9a3412;
   }
   
   .status-ready_for_pickup,
   .status-closed {
     background: #dcfce7;
     color: #166534;
   }
   
   .status-cancelled {
     background: #fee2e2;
     color: #991b1b;
   }
   
   .priority-normal {
     background: #e0f2fe;
     color: #075985;
   }
   
   .priority-urgent,
   .priority-high {
     background: #fee2e2;
     color: #991b1b;
   }

Worked for 5m 30s
Cross-check result
I opened and audited the ZIP archive directly. It contains 65 actual project files after excluding macOS metadata:

38 JavaScript files

15 CSS files

9 HTML files

1 SQL file

1 Markdown README

1 VS Code settings file

The ZIP is accessible here: Go East Mechanics current project ZIP

Attached files compared with the ZIP
Every separately attached file is an exact content match with its corresponding file inside the ZIP:

Attached file	Project file	Result
Pasted code(49).js	js/admin-mechanic-board.js	Exact match
Pasted code (2)(12).js	js/admin-mechanic-parts.js	Exact match
Pasted code (3)(3).js	js/admin-mechanic-labour.js	Exact match
Pasted code (4).html	admin.html	Exact match
Pasted code (5).css	css/admin-workspace.css	Exact match
Pasted code (6).css	css/admin.css	Exact match
Pasted code (7).css	css/admin-tables.css	Exact match
Pasted code (8).css	css/admin-inventory.css	Exact match
Therefore, the ZIP is the correct current source of truth, and there is no need to resend those eight files. The mechanic board, parts engine, labour engine, admin HTML, and the four CSS files you supplied are all synchronized with the archive. 

 

 

 


I also ran JavaScript syntax validation across all loaded project JavaScript files. Every JavaScript file passed the syntax check.

Important distinction
The archive is up to date with what you currently have, but it does not yet contain the proposed Mechanic Job Workspace and Synchronization sprint.

The current baseline still has several architectural issues that must be corrected during that sprint.

1. There is no dedicated Mechanic Job Workspace
The archive does not currently contain either of these proposed files:

js/admin-job-workspace.js
css/admin-job-workspace.css
The existing mechanic job opens as an expanded table row instead of a proper enterprise workspace with:

Overview
Customer
Vehicle
Diagnosis
Repairs
Parts & Labour
Timeline
Update
2. Existing job cards have no “Open Job Workspace” workflow
admin-job-cards.js currently displays job numbers and statuses, followed by the option to create another job. It does not provide a linked-job command card or an Open Job Workspace button.

That file will need a substantial full replacement.

3. Parent request status synchronization is unsafe for multiple jobs
The mechanic board currently takes the status from one saved job and writes it directly to the parent service_requests.status.

That means this situation is possible:

Service Request #11
├── JOB-8 = closed
└── JOB-9 = repairing
Saving JOB-8 as closed could incorrectly close the parent request even though JOB-9 is still active.

The correct synchronization rule must evaluate all jobs belonging to the request, not only the job that was just saved.

There is also a specific defect in the current synchronization function: it creates requestError when updating the parent request but does not actually check or handle that error before proceeding. The mechanic board currently describes itself as synchronizing job status to the related request, but the implementation needs controlled aggregation rather than direct one-job-to-parent copying. 


4. Mechanic changes do not always create timeline records
At present, a timeline record is normally created only when the mechanic enters a customer-visible update.

Changes such as:

Diagnosis entered
Status changed
Repair details modified
Parts changed
Labour added
Job reassigned
Repair bay changed
do not consistently create structured job timeline entries.

The new job workspace should have a job-level timeline, while customer-visible updates should continue flowing to the parent request/customer portal.

5. Service Request final cost can conflict with business totals
The current Service Request update form directly allows staff to edit:

Estimated Cost
Final Cost
However, the authoritative financial total should eventually come from:

Parts total
+ Labour total
+ approved fees/taxes/adjustments
= Invoice total
Allowing a manually entered request final cost to compete with job and invoice totals creates multiple sources of truth.

The update must make the distinction explicit:

Request estimate: administrative preliminary value

Job subtotal: parts and labour operational value

Invoice total: authoritative customer billing value

Amount paid: payment ledger value

6. New jobs copy request costs
When a job card is created, the current code copies the Service Request’s estimated_cost and final_cost into the new job.

With multiple jobs, this can duplicate the same request-level value across several job cards. The job creation logic must be revised so every job owns only its own operational costs.

7. The labour file contains invalid generated HTML
The labour module passes JavaScript syntax validation because the problem is inside a template string, but its rendered markup contains a duplicated opening button:

<button
<button
  type="button"
  class="table-action-btn labour-edit-btn"
That should be repaired. It can cause inconsistent button layout, DOM repair by the browser, or unreliable event targeting. 


8. admin-mechanic.js is empty
The file exists, contains zero bytes, and is still loaded by admin.html.

It is not currently breaking the site, but professionally we should either:

remove its script reference, or

formally reserve and document it as a future controller.

Leaving empty loaded files makes ownership and startup order unclear.

9. Shared helpers are duplicated
Functions such as these are declared in more than one loaded file:

escapeHtml
safeText
money
formatDate
formatRole
hasFullAccess
isDeveloper
isUpperAdmin
isReceptionist
isMechanic
canSaveRepairUpdate
The browser currently resolves this through script-loading order, with later declarations replacing earlier ones. It works, but it is fragile. The project should have one authoritative utility and authorization implementation.

10. The continuity README is incomplete
The current README ends immediately after opening an HTML code block for workspaceContainer. It does not document:

Current script order

Current CSS order

Inventory transaction architecture

Parts and labour architecture

Multiple-job rules

Status synchronization rules

Cost ownership

Required Supabase tables and RPCs

New workspace files

Installation and testing checklist

It should be fully replaced as part of this sprint.

What I still need
The frontend project ZIP is sufficient. You do not need to send more JavaScript, CSS, or HTML files before I prepare the upgrade.

The one missing source of truth is the complete Supabase database definition. The ZIP only contains supabase/authorization_setup.sql, which does not define the complete structures, constraints, triggers, functions, or policies for the operational tables.

I need the exact database definitions for:

service_requests
job_cards
repair_updates
job_parts
job_labour_entries
inventory_items
inventory_transactions
invoices
invoice_items
payments
vehicles
profiles
I also need the definition of:

public.save_repair_update(...)
and the relevant RLS policies.

Screenshots show the visible columns, but they do not reveal:

Foreign-key constraints
Unique constraints
Check constraints
Generated columns
Column defaults
Triggers
Function behavior
RLS USING expressions
RLS WITH CHECK expressions
Run this in Supabase SQL Editor
This first query provides the table columns:

select
  table_name,
  ordinal_position,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'service_requests',
    'job_cards',
    'repair_updates',
    'job_parts',
    'job_labour_entries',
    'inventory_items',
    'inventory_transactions',
    'invoices',
    'invoice_items',
    'payments',
    'vehicles',
    'profiles'
  )
order by table_name, ordinal_position;
Run this second query for constraints:

select
  conrelid::regclass as table_name,
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
from pg_constraint
where connamespace = 'public'::regnamespace
  and conrelid::regclass::text in (
    'service_requests',
    'job_cards',
    'repair_updates',
    'job_parts',
    'job_labour_entries',
    'inventory_items',
    'inventory_transactions',
    'invoices',
    'invoice_items',
    'payments',
    'vehicles',
    'profiles'
  )
order by table_name, constraint_name;
Run this third query for the repair-update function:

select
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
from pg_proc p
join pg_namespace n
  on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'save_repair_update';
Run this final query for RLS policies:

select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check as with_check_expression
from pg_policies
where schemaname = 'public'
  and tablename in (
    'service_requests',
    'job_cards',
    'repair_updates',
    'job_parts',
    'job_labour_entries',
    'inventory_items',
    'inventory_transactions',
    'invoices',
    'invoice_items',
    'payments',
    'vehicles',
    'profiles'
  )
order by tablename, policyname;
Upload or paste the four result sets. That will eliminate schema guessing and repeated corrections.

Planned full-file delivery
After the database definitions are confirmed, the sprint package should contain complete, commented files rather than fragments.

Full replacement files
js/admin-job-cards.js
js/admin-mechanic-board.js
js/admin-service-request-workspace.js
js/admin-updates.js
js/admin-workspace-shell.js
js/ui/admin-workspace.js
admin.html
css/admin-workspace.css
css/admin-workshop.css
js/README-GO-EAST-MECHANICS-CONTINUITY.md
New files
js/admin-job-workspace.js
js/admin-job-synchronization.js
css/admin-job-workspace.css
supabase/mechanic-job-workspace-migration.sql
MECHANIC-JOB-WORKSPACE-INSTALL.md
Files requiring targeted compatibility updates
js/admin-mechanic-parts.js
js/admin-mechanic-labour.js
js/admin-invoices.js
js/admin.js
The resulting implementation will preserve the working inventory, parts, labour, request workspace, authentication, and customer portal behavior while adding the dedicated Mechanic Job Workspace and controlled synchronization layer.


Today 10:04 AM
Supabase Snippet Untitled query(1)
Now interactive!
this was the query earlier done. do you still want me to do the query nsupplied above. 

Worked for 1m 4s
No, do not run the four queries again. The uploaded CSV already contains the complete combined database audit I need.

I verified the file contains:

13 tables

203 column definitions

47 constraints

40 indexes

61 RLS policies

3 triggers

The complete save_repair_update function

It covers:

service_requests
job_cards
repair_updates
job_parts
job_labour_entries
inventory_items
inventory_transactions
invoices
invoice_items
payments
vehicles
profiles
suppliers
It also includes the details the separate queries were intended to collect:

Column names, types, nullability, and defaults
Primary keys and foreign keys
Check and unique constraints
Indexes
RLS status and policy expressions
Triggers
save_repair_update function definition
You can keep the audit here for your project records:

Supabase%20Snippet%20Untitled%20query(1).csv

What I now have
I have both required sources of truth:

Your latest complete project ZIP.

Your comprehensive Supabase database audit.

Therefore, you do not need to send more frontend files, screenshots, or database queries before the implementation begins.

The only database queries still needed will be included by me as part of the professional installation package:

1. Read-only pre-migration validation
2. Controlled database migration
3. Post-migration verification
4. Rollback SQL
Those scripts will check existing records before adding constraints or backfilling relationships. You should not manually make database changes ahead of that process.

The next delivery can now be based on your actual codebase and schema, with:

CREATE — new files
REPLACE — complete updated files
UNCHANGED — protected working files
DATABASE — migration and rollback SQL
README — exact installation order
TEST — complete workflow checklist
Full replacement files will include comments and preserve the existing working inventory, parts, labour, service-request, authentication, invoice, and payment logic.


okay can supply the updated codes based on the recommended sprint. i want full codes and i should be able to copy from chat and paste it in my files. also prompt me when i need open new files. 

Worked for 30m 3s
Mechanic Job Workspace and Synchronization Sprint
The code package is now based on:

Your latest compressed project.

Your current Service Request workspace.

Your mechanic board, parts, and labour modules.

Your complete Supabase schema audit.

The existing RLS policies, constraints, triggers, and save_repair_update function.

All generated JavaScript files passed syntax validation. The updated admin.html was also checked to confirm that every local CSS and JavaScript reference exists.

The complete sprint contains approximately 8,100 lines. Pasting that into one message could truncate the files, so every link below opens a complete plain-text file that can be copied directly and pasted into VS Code.

Complete code in one plain-text document
This contains every new and replacement file, separated by filename:

MECHANIC-JOB-WORKSPACE-SPRINT-8-ALL-FULL-CODE.txt

Use this installation manifest beside it:

SPRINT-8-INSTALL-MANIFEST.txt

Step 1 — Back up first
Before copying anything:

Duplicate your current project folder.

Create a Supabase database backup.

Do not install the previous Sprint 7.8 files.

Do not delete your existing parts, inventory, invoices, or payments files.

Step 2 — CREATE these new SQL files
Open your existing project folder:

supabase/
Create these four new files.

CREATE: supabase/01_mechanic_job_workspace_preflight.sql
01_mechanic_job_workspace_preflight.sql

This is read-only. Run it first in Supabase SQL Editor.

Do not proceed when any returned issue_count is greater than zero.

CREATE: supabase/02_mechanic_job_workspace_migration.sql
02_mechanic_job_workspace_migration.sql

Run this only after the preflight passes.

It performs the following controlled changes:

Adds repair_updates.job_card_id.

Adds job-specific timeline support.

Normalizes job statuses.

Adds controlled job status constraints.

Adds missing job parts and labour relationships.

Normalizes legacy/current parts pricing fields.

Adds invoice_items.job_card_id.

Adds multi-job parent status aggregation.

Replaces the unsafe request-level update workflow.

Adds the new save_job_workspace_update RPC.

Adds receptionist read/create access for linked job summaries.

Synchronizes service_requests.final_cost from non-cancelled invoice totals.

Preserves payment-confirmed and delivered request stages.

CREATE: supabase/03_mechanic_job_workspace_verification.sql
03_mechanic_job_workspace_verification.sql

Run this after the migration.

The final result set checking invoice totals should return zero mismatched rows.

CREATE: supabase/04_mechanic_job_workspace_rollback.sql
04_mechanic_job_workspace_rollback.sql

Do not run this during normal installation.

It is reserved for removing the sprint before production if the migration must be reversed.

Step 3 — CREATE these new frontend files
You now need to create four new frontend files.

CREATE: js/admin-job-synchronization.js
admin-job-synchronization.js

This becomes the shared business-logic layer for:

Job status normalization.

Parent request status calculation.

Multi-job status synchronization.

Job-specific timeline creation.

Job operational totals.

Job and request refresh coordination.

CREATE: js/admin-job-workspace-views.js
admin-job-workspace-views.js

This renders the eight Mechanic Job Workspace tabs:

Overview
Customer
Vehicle
Diagnosis
Repairs
Parts & Labour
Timeline
Update
It is separated from the controller so the workspace does not become one oversized JavaScript file.

CREATE: js/admin-job-workspace.js
admin-job-workspace.js

This controls:

Loading the selected job.

Opening and closing the workspace.

Role permissions.

Customer privacy.

Tab activation.

Saving mechanic updates.

Returning to the parent request.

Refreshing parts and labour views.

Unsaved-change protection.

CREATE: css/admin-job-workspace.css
admin-job-workspace.css

This styles:

Linked-job summary cards.

The dedicated job workspace.

Tabs and panels.

Customer privacy notices.

Timeline entries.

Parts and labour totals.

Job update forms.

Responsive layouts.

Step 4 — REPLACE these existing files completely
Do not merge fragments into these files. Open each existing file, select everything, and replace it with the complete updated code.

REPLACE: admin.html
admin.html

The updated HTML:

Adds #jobWorkspaceContainer.

Loads the new workspace stylesheet.

Loads synchronization before modules that use it.

Loads workspace views before the workspace controller.

Preserves the correct inventory and mechanic module order.

Removes the unused admin-mechanic.js script reference.

The important new loading order is:

<script src="js/admin-workspace-shell.js"></script>
<script src="js/admin-job-synchronization.js"></script>

<script src="js/admin-updates.js"></script>
<script src="js/admin-job-cards.js"></script>
<script src="js/admin-service-request-workspace.js"></script>
<script src="js/admin-requests.js"></script>

<script src="js/admin-mechanic-parts.js"></script>
<script src="js/admin-mechanic-labour.js"></script>
<script src="js/admin-mechanic-board.js"></script>
<script src="js/admin-job-workspace-views.js"></script>
<script src="js/admin-job-workspace.js"></script>
REPLACE: js/admin-workspace-shell.js
admin-workspace-shell.js

This preserves module state, hides source boards correctly, handles navigation, and supports controlled workspace lifecycle behavior.

REPLACE: js/admin-job-cards.js
admin-job-cards.js

Major changes:

Replaces the simple “job created” message with linked-job summary cards.

Adds Open Job Workspace.

Supports multiple jobs.

Requires a reason for separate additional jobs.

Prevents request-level estimates and final costs from being duplicated across every new job.

Refreshes and reopens the Linked Jobs tab after creation.

REPLACE: js/admin-updates.js
admin-updates.js

Major changes:

Loads request-level and job-level timeline entries.

Supports filtering timeline entries by job.

Uses job_card_id after migration.

Prevents Final Cost from remaining an independent editable value.

Uses controlled status synchronization when jobs exist.

Preserves customer-visible versus internal-only updates.

REPLACE: js/admin-service-request-workspace.js
admin-service-request-workspace.js

The tabs become:

Overview
Customer
Vehicle
Linked Jobs
Timeline
Update
Important behavior:

Final Cost becomes read-only.

Linked jobs control repair-stage status.

Linked-job summaries open the dedicated Mechanic Job Workspace.

Multiple jobs are displayed independently.

The workspace remains connected to the request timeline.

Unsaved form changes are protected.

REPLACE: js/admin-mechanic-board.js
admin-mechanic-board.js

The board becomes an operational index rather than the full repair editor.

The Open action now launches the dedicated Mechanic Job Workspace instead of expanding a large inline editing row.

REPLACE: js/admin-mechanic-labour.js
admin-mechanic-labour.js

This replacement:

Fixes the malformed duplicate <button> markup.

Preserves structured labour records.

Refreshes the open Mechanic Job Workspace after labour changes.

Keeps labour charges separate from free-text labour notes.

Continues calculating hours × hourly_rate.

Step 5 — CREATE the project README
Create this file in the project root, beside admin.html:

README-MECHANIC-JOB-WORKSPACE.md
README-MECHANIC-JOB-WORKSPACE.md

The README is documentation only. It is not loaded by the website and does not need a <script> or <link> entry.

Keep it because it records:

Installation order.

New and replacement files.

Protected unchanged files.

Status aggregation rules.

Financial ownership rules.

Testing sequence.

Rollback procedure.

Files that must remain unchanged
Do not replace these:

js/admin-mechanic-parts.js
js/admin-requests.js
js/admin-invoices.js
js/admin-payments.js
js/admin-utils.js
js/admin-auth.js

js/ui/admin-components.js
js/ui/admin-workspace.js
js/ui/admin-tabs.js

css/admin-workspace.css
css/admin-workshop.css
css/admin-tables.css
css/admin-inventory.css
css/admin.css
The existing js/admin-mechanic.js file may remain physically in the folder, but the updated admin.html no longer loads it.

Correct SQL installation order
Run the SQL files in this exact order:

1. 01_mechanic_job_workspace_preflight.sql
2. 02_mechanic_job_workspace_migration.sql
3. 03_mechanic_job_workspace_verification.sql
Do not normally run:

04_mechanic_job_workspace_rollback.sql
Stop conditions
Stop before migration when the preflight reports:

issue_count > 0
Stop before frontend testing when verification reports:

Missing functions.

Missing columns.

Job part/request mismatches.

Labour/request mismatches.

Incorrect part totals.

Invoice/request final-cost mismatches.

Financial ownership after this sprint
The system will use this model:

Service Request estimated cost
    = preliminary administrative estimate

Job parts + structured labour
    = operational job subtotal

Invoice total
    = authoritative customer billing amount

Payments
    = authoritative amount paid and outstanding balance

Service Request final cost
    = read-only compatibility summary derived from invoices
Do not manually restore editable Final Cost fields inside Service Requests.

Multi-job status behavior
The parent Service Request is calculated using every linked job.

Examples:

JOB-8 = Closed
JOB-9 = Repairing
Request = Repairing
JOB-8 = Ready for Pickup
JOB-9 = Closed
Request = Ready for Pickup
JOB-8 = Closed
JOB-9 = Closed
Request = Closed
JOB-8 = Cancelled
JOB-9 = Cancelled
Request = Cancelled
One completed job can no longer incorrectly close a request containing another active job.

Test sequence after installation
Hard-refresh the admin dashboard.

Open Service Requests.

Open a request with no job.

Select Linked Jobs.

Create the first mechanic job.

Confirm a summary card appears instead of only a confirmation message.

Select Open Job Workspace.

Confirm all eight tabs load.

Save a diagnosis and status update.

Confirm a job-specific Timeline entry appears.

Return to the parent Service Request.

Confirm its status synchronized.

Create a second linked job.

Close only the first job.

Confirm the request remains active because the second job is open.

Add a part and verify the Parts & Labour subtotal refreshes.

Add labour and verify its total refreshes.

Confirm Service Request Final Cost is read-only.

Create or update an invoice.

Confirm the request Final Cost reflects non-cancelled invoice totals.

Test Developer, Upper Admin, Mechanic, and Receptionist access.

Complete packaged copies
These are backups of the exact same files listed above:

Open the code-only Sprint 8 ZIP

Open the fully merged current project

The merged project is provided as a safety/reference copy. The controlled installation method remains: run the database scripts first, create the new files, then replace only the seven specified existing files.



Library
/
01_mechanic_job_workspace_preflight.sql


/* =========================================================
   GO EAST MECHANICS
   Mechanic Job Workspace Preflight

   File:
   supabase/01_mechanic_job_workspace_preflight.sql

   Safety:
   READ ONLY. This script does not change data.

   Expected Result:
   Every issue_count should be 0 before running migration 02.
   ========================================================= */

WITH checks AS (
  SELECT
    'orphan_job_labour_entries' AS check_name,
    COUNT(*)::bigint AS issue_count
  FROM public.job_labour_entries labour
  LEFT JOIN public.job_cards job
    ON job.id = labour.job_card_id
  WHERE job.id IS NULL

  UNION ALL

  SELECT
    'orphan_job_parts',
    COUNT(*)::bigint
  FROM public.job_parts part
  LEFT JOIN public.job_cards job
    ON job.id = part.job_card_id
  WHERE part.job_card_id IS NOT NULL
    AND job.id IS NULL

  UNION ALL

  SELECT
    'unsupported_job_statuses',
    COUNT(*)::bigint
  FROM public.job_cards
  WHERE job_status IS NOT NULL
    AND lower(trim(job_status)) NOT IN (
      'created',
      'new',
      'acknowledged',
      'diagnosing',
      'waiting_parts',
      'repairing',
      'testing',
      'ready_for_pickup',
      'closed',
      'cancelled'
    )

  UNION ALL

  SELECT
    'job_parts_request_mismatch',
    COUNT(*)::bigint
  FROM public.job_parts part
  JOIN public.job_cards job
    ON job.id = part.job_card_id
  WHERE part.service_request_id IS NOT NULL
    AND part.service_request_id IS DISTINCT FROM job.service_request_id

  UNION ALL

  SELECT
    'job_labour_request_mismatch',
    COUNT(*)::bigint
  FROM public.job_labour_entries labour
  JOIN public.job_cards job
    ON job.id = labour.job_card_id
  WHERE labour.service_request_id IS NOT NULL
    AND labour.service_request_id IS DISTINCT FROM job.service_request_id
)
SELECT
  check_name,
  issue_count,
  CASE
    WHEN issue_count = 0 THEN 'PASS'
    ELSE 'REVIEW BEFORE MIGRATION'
  END AS result
FROM checks
ORDER BY check_name;


/* Inventory/job-part pricing audit for review only. */
SELECT
  id,
  job_card_id,
  item_name,
  quantity_used,
  unit_price,
  selling_price,
  line_total,
  source_type,
  part_source
FROM public.job_parts
WHERE
  coalesce(line_total, 0) <> (
    coalesce(quantity_used, 0) *
    coalesce(
      nullif(selling_price, 0),
      unit_price,
      0
    )
  )
  OR source_type IS NULL
  OR part_source IS NULL
ORDER BY id;
