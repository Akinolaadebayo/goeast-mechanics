/* =========================================================
   ADMIN MECHANIC JOB BOARD MODULE
   File: js/admin-mechanic-board.js

   Purpose:
   Professional workshop board for mechanics.

   Privacy Rule:
   Mechanics only see repair-relevant information:
   - Vehicle details
   - Complaint
   - Bay
   - Assigned mechanic
   - Repair workflow fields

   Mechanics do NOT see customer name, email, or phone.
   ========================================================= */

   let mechanicBoardJobs = [];
   let mechanicBoardOpenJobId = null;
   let mechanicBoardFilter = "active";
   let mechanicBoardSearch = "";
   
   const mechanicJobsContainer = document.getElementById("mechanicJobsList");
   
   /* =========================================================
      LOAD MECHANIC JOBS
   
      This loads job cards and joins vehicle details from vehicles.
      ========================================================= */
   
   async function loadMechanicBoard() {
     if (!mechanicJobsContainer) return;
   
     mechanicJobsContainer.innerHTML = `<p class="empty-message">Loading mechanic jobs...</p>`;
   
     if (!["developer", "upper_admin", "mechanic"].includes(currentProfile.role)) {
       mechanicJobsContainer.innerHTML = `
         <p class="empty-message">
           Mechanic Jobs are reserved for mechanics and authorized staff.
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
       .order("id", { ascending: false });
   
     if (error) {
       mechanicJobsContainer.innerHTML = `
         <p class="empty-message">
           Could not load mechanic jobs: ${escapeHtml(error.message)}
         </p>
       `;
       return;
     }
   
     mechanicBoardJobs = data || [];
     renderMechanicBoard();
   }
   
   /* =========================================================
      FILTER AND SEARCH JOBS
      ========================================================= */
   
   function getFilteredMechanicJobs() {
     return mechanicBoardJobs.filter((job) => {
       const status = job.job_status || "created";
       const vehicleInfo = getFullVehicleInfo(job);
   
       let matchesFilter = true;
   
       if (mechanicBoardFilter === "active") {
         matchesFilter = !["closed", "cancelled"].includes(status);
       }
   
       if (mechanicBoardFilter === "closed") {
         matchesFilter = ["closed", "cancelled"].includes(status);
       }
   
       const searchableText = `
         job-${job.id || ""}
         request-${job.service_request_id || ""}
         ${vehicleInfo.title || ""}
         ${vehicleInfo.plate || ""}
         ${vehicleInfo.vin || ""}
         ${job.assigned_mechanic || ""}
         ${job.repair_bay || ""}
         ${job.complaint || ""}
         ${status}
       `.toLowerCase();
   
       return matchesFilter && searchableText.includes(mechanicBoardSearch.toLowerCase());
     });
   }
   
   /* =========================================================
      RENDER MECHANIC BOARD
      ========================================================= */
   
   function renderMechanicBoard() {
     if (!mechanicJobsContainer) return;
   
     const filteredJobs = getFilteredMechanicJobs();
   
     mechanicJobsContainer.innerHTML = `
       <div class="mechanic-board-toolbar">
         <div class="mechanic-search-box">
           <label for="mechanicJobSearch">Search Jobs</label>
           <input
             type="text"
             id="mechanicJobSearch"
             placeholder="Search job, vehicle, plate, VIN, complaint, mechanic, bay..."
             value="${escapeHtml(mechanicBoardSearch)}"
           >
         </div>
   
         <div class="mechanic-filter-box">
           <label for="mechanicJobFilter">Job View</label>
           <select id="mechanicJobFilter">
             <option value="active" ${mechanicBoardFilter === "active" ? "selected" : ""}>Active Jobs</option>
             <option value="closed" ${mechanicBoardFilter === "closed" ? "selected" : ""}>Closed / Cancelled Jobs</option>
             <option value="all" ${mechanicBoardFilter === "all" ? "selected" : ""}>All Jobs</option>
           </select>
         </div>
       </div>
   
       <div id="mechanicBoardContent"></div>
     `;
   
     const content = document.getElementById("mechanicBoardContent");
   
     if (filteredJobs.length === 0) {
       content.innerHTML = `
         <div class="module-card">
           <h3>No jobs found</h3>
           <p>No mechanic jobs match your selected filter or search.</p>
         </div>
       `;
   
       bindMechanicToolbar();
       return;
     }
   
     content.innerHTML = `
       <div class="admin-requests-table-wrap">
         <table class="admin-requests-table">
           <thead>
             <tr>
               <th>Job</th>
               <th>Vehicle</th>
               <th>Complaint</th>
               <th>Mechanic</th>
               <th>Bay</th>
               <th>Status</th>
               <th>Appointment</th>
               <th>Action</th>
             </tr>
           </thead>
           <tbody id="mechanicJobsTableBody"></tbody>
         </table>
       </div>
     `;
   
     const tableBody = document.getElementById("mechanicJobsTableBody");
   
     filteredJobs.forEach((job) => {
       const status = job.job_status || "created";
       const vehicleInfo = getFullVehicleInfo(job);
       const isOpen = String(mechanicBoardOpenJobId) === String(job.id);
   
       const row = document.createElement("tr");
   
       row.innerHTML = `
         <td>
           <strong>JOB-${job.id}</strong>
           <small>Request: ${safeText(job.service_request_id, "-")}</small>
         </td>
   
         <td>
           <strong>${safeText(vehicleInfo.title, "Vehicle")}</strong>
           ${vehicleInfo.plate ? `<small>Plate: ${safeText(vehicleInfo.plate)}</small>` : ""}
         </td>
   
         <td>
           <strong>${safeText(shortText(job.complaint, 55), "No complaint")}</strong>
         </td>
   
         <td>${safeText(job.assigned_mechanic, "Unassigned")}</td>
         <td>${safeText(job.repair_bay, "-")}</td>
   
         <td>
           <span class="status-badge status-${escapeHtml(status)}">
             ${escapeHtml(status.replaceAll("_", " "))}
           </span>
         </td>
   
         <td>${formatDate(job.appointment_date)}</td>
   
         <td>
           <button class="table-action-btn" data-mechanic-job-toggle="${job.id}">
             ${isOpen ? "Close" : "Open"}
           </button>
         </td>
       `;
   
       tableBody.appendChild(row);
   
       if (isOpen) {
         const detailRow = document.createElement("tr");
         detailRow.className = "admin-request-details-row";
   
         detailRow.innerHTML = `
           <td colspan="8">
             ${renderMechanicJobDetails(job)}
           </td>
         `;
   
         tableBody.appendChild(detailRow);
       }
     });
   
     bindMechanicToolbar();
     bindMechanicJobButtons();
   }
   
   /* =========================================================
      RENDER EXPANDED JOB CARD
      ========================================================= */
   
   function renderMechanicJobDetails(job) {
     const status = job.job_status || "created";
     const vehicleInfo = getFullVehicleInfo(job);
     const isClosed = ["closed", "cancelled"].includes(status);
   
     return `
       <div class="admin-request-detail-panel">
   
         <div class="admin-detail-header">
           <div>
             <p class="admin-card-label">Workshop Job Card</p>
             <h3>JOB-${job.id} • ${safeText(vehicleInfo.title, "Vehicle")}</h3>
             ${vehicleInfo.plate ? `<p class="vehicle-plate">Plate: ${safeText(vehicleInfo.plate)}</p>` : ""}
           </div>
   
           <span class="status-badge status-${escapeHtml(status)}">
             ${escapeHtml(status.replaceAll("_", " "))}
           </span>
         </div>
   
         <div class="card-message">
           <strong>Customer Complaint</strong>
           <p>${safeText(job.complaint, "No complaint provided.")}</p>
         </div>
   
         <div class="admin-request-grid">
           <div><span>Year</span><strong>${safeText(vehicleInfo.year, "-")}</strong></div>
           <div><span>Make</span><strong>${safeText(vehicleInfo.make, "-")}</strong></div>
           <div><span>Model</span><strong>${safeText(vehicleInfo.model, "-")}</strong></div>
           <div><span>Trim</span><strong>${safeText(vehicleInfo.trim, "-")}</strong></div>
           <div><span>Plate</span><strong>${safeText(vehicleInfo.plate, "-")}</strong></div>
           <div><span>VIN</span><strong>${safeText(vehicleInfo.vin, "-")}</strong></div>
           <div><span>Mileage</span><strong>${safeText(vehicleInfo.mileage, "-")}</strong></div>
           <div><span>Repair Bay</span><strong>${safeText(job.repair_bay, "-")}</strong></div>
           <div><span>Assigned Mechanic</span><strong>${safeText(job.assigned_mechanic, "Unassigned")}</strong></div>
           <div><span>Appointment</span><strong>${formatDate(job.appointment_date)}</strong></div>
           <div><span>Estimated Completion</span><strong>${formatDate(job.estimated_completion)}</strong></div>
         </div>
   
         <div class="card-notes">
           <strong>Vehicle Notes</strong>
           <p>${safeText(vehicleInfo.notes, "No vehicle notes added.")}</p>
         </div>
   
         ${
           isClosed
             ? `
               <div class="card-notes">
                 <strong>Closed Job Record</strong>
                 <p>This job is closed/cancelled and is kept for history and reporting.</p>
               </div>
             `
             : ""
         }
   
         <div class="mechanic-workspace-grid">
           <label>
             Job Status
             <select class="mechanic-job-status" data-id="${job.id}">
               ${renderMechanicJobStatusOptions(status)}
             </select>
           </label>
   
           <label>
             Diagnosis
             <textarea class="mechanic-diagnosis" data-id="${job.id}" placeholder="Diagnosis notes">${safeText(job.diagnosis, "")}</textarea>
           </label>
   
           <label>
             Repairs Performed
             <textarea class="mechanic-repairs" data-id="${job.id}" placeholder="Repairs performed">${safeText(job.repairs_performed, "")}</textarea>
           </label>
   
           <label>
             Parts Used
             <textarea class="mechanic-parts" data-id="${job.id}" placeholder="Parts used">${safeText(job.parts_used, "")}</textarea>
           </label>
   
           <label>
             Labour Notes
             <textarea class="mechanic-labor" data-id="${job.id}" placeholder="Labour notes">${safeText(job.labor_notes, "")}</textarea>
           </label>
   
           <label>
             Customer Visible Update
             <textarea class="mechanic-public-update" data-id="${job.id}" placeholder="Example: Vehicle inspection completed. Repair is in progress."></textarea>
           </label>
         </div>
   
         <button class="save-mechanic-job-btn" data-id="${job.id}">
           Save Mechanic Job
         </button>
   
       </div>
     `;
   }
   
   /* =========================================================
      SAVE JOB
      ========================================================= */
   
   async function saveMechanicJob(jobId, button) {
     const job = mechanicBoardJobs.find((item) => String(item.id) === String(jobId));
   
     if (!job) {
       showAdminToast("Could not find this mechanic job.", "error");
       return;
     }
   
     const statusValue = document.querySelector(`.mechanic-job-status[data-id="${jobId}"]`).value;
     const diagnosisValue = document.querySelector(`.mechanic-diagnosis[data-id="${jobId}"]`).value.trim();
     const repairsValue = document.querySelector(`.mechanic-repairs[data-id="${jobId}"]`).value.trim();
     const partsValue = document.querySelector(`.mechanic-parts[data-id="${jobId}"]`).value.trim();
     const laborValue = document.querySelector(`.mechanic-labor[data-id="${jobId}"]`).value.trim();
     const publicUpdateValue = document.querySelector(`.mechanic-public-update[data-id="${jobId}"]`).value.trim();
   
     button.disabled = true;
     button.textContent = "Saving...";
   
     const { error: jobError } = await supabaseClient
       .from("job_cards")
       .update({
         job_status: statusValue,
         diagnosis: diagnosisValue,
         repairs_performed: repairsValue,
         parts_used: partsValue,
         labor_notes: laborValue
       })
       .eq("id", jobId);
   
     if (jobError) {
       showAdminToast("Could not save mechanic job: " + jobError.message, "error");
       button.disabled = false;
       button.textContent = "Save Mechanic Job";
       return;
     }
   
     if (job.service_request_id) {
       await supabaseClient
         .from("service_requests")
         .update({ status: statusValue })
         .eq("id", job.service_request_id);
   
       if (publicUpdateValue) {
         await supabaseClient.rpc("save_repair_update", {
           p_service_request_id: Number(job.service_request_id),
           p_status: statusValue,
           p_message: publicUpdateValue,
           p_internal_only: false
         });
       }
     }
   
     mechanicBoardOpenJobId = jobId;
   
     button.disabled = false;
     button.textContent = "Save Mechanic Job";
   
     showAdminToast("Mechanic job saved successfully.", "success");
   
     await loadMechanicBoard();
   
     const refreshedUpdateInput = document.querySelector(`.mechanic-public-update[data-id="${jobId}"]`);
   
     if (refreshedUpdateInput && mechanicBoardFilter !== "closed") {
       refreshedUpdateInput.value = "";
       refreshedUpdateInput.focus();
     }
   
     if (typeof loadServiceRequests === "function") {
       await loadServiceRequests();
     }
   }
   
   /* =========================================================
      EVENT BINDINGS
      ========================================================= */
   
   function bindMechanicToolbar() {
     const filterSelect = document.getElementById("mechanicJobFilter");
     const searchInput = document.getElementById("mechanicJobSearch");
   
     if (filterSelect) {
       filterSelect.addEventListener("change", function () {
         mechanicBoardFilter = filterSelect.value;
         mechanicBoardOpenJobId = null;
         renderMechanicBoard();
       });
     }
   
     if (searchInput) {
       searchInput.addEventListener("input", function () {
         mechanicBoardSearch = searchInput.value.trim();
         mechanicBoardOpenJobId = null;
         renderMechanicBoard();
       });
     }
   }
   
   function bindMechanicJobButtons() {
     document.querySelectorAll("[data-mechanic-job-toggle]").forEach((button) => {
       button.addEventListener("click", function () {
         const jobId = button.dataset.mechanicJobToggle;
   
         mechanicBoardOpenJobId =
           String(mechanicBoardOpenJobId) === String(jobId) ? null : jobId;
   
         renderMechanicBoard();
       });
     });
   
     document.querySelectorAll(".save-mechanic-job-btn").forEach((button) => {
       button.addEventListener("click", async function () {
         await saveMechanicJob(button.dataset.id, button);
       });
     });
   }
   
   /* =========================================================
      HELPERS
      ========================================================= */
   
   function getFullVehicleInfo(job) {
     const vehicle = job.vehicles || {};
     const fallback = parseMechanicVehicleDisplay(job.vehicle);
   
     const title = [
       vehicle.year,
       vehicle.make,
       vehicle.model,
       vehicle.trim
     ].filter(Boolean).join(" ");
   
     return {
       title: title || fallback.main || "Vehicle",
       year: vehicle.year || "",
       make: vehicle.make || "",
       model: vehicle.model || "",
       trim: vehicle.trim || "",
       plate: vehicle.license_plate || fallback.plate || "",
       vin: vehicle.vin || "",
       mileage: vehicle.mileage || "",
       notes: vehicle.notes || ""
     };
   }
   
   function renderMechanicJobStatusOptions(currentStatus) {
     const statuses = [
       ["created", "Created"],
       ["acknowledged", "Acknowledged"],
       ["diagnosing", "Diagnosing"],
       ["waiting_parts", "Waiting Parts"],
       ["repairing", "Repairing"],
       ["testing", "Testing"],
       ["ready_for_pickup", "Ready For Pickup"],
       ["closed", "Closed"],
       ["cancelled", "Cancelled"]
     ];
   
     return statuses.map(([value, label]) => {
       return `<option value="${value}" ${value === currentStatus ? "selected" : ""}>${label}</option>`;
     }).join("");
   }
   
   function parseMechanicVehicleDisplay(vehicleText) {
     const raw = String(vehicleText || "").trim();
   
     if (!raw) return { main: "Vehicle not provided", plate: "" };
   
     const plateMatch = raw.match(/plate:\s*(.+)$/i);
   
     if (!plateMatch) return { main: raw, plate: "" };
   
     return {
       main: raw.replace(/plate:\s*(.+)$/i, "").trim(),
       plate: plateMatch[1].trim().toUpperCase()
     };
   }
   
   function shortText(value, limit = 60) {
     const text = String(value || "").trim();
     return text.length <= limit ? text : text.slice(0, limit) + "...";
   }
   
   function showAdminToast(message, type = "success") {
     let toast = document.getElementById("adminToast");
   
     if (!toast) {
       toast = document.createElement("div");
       toast.id = "adminToast";
       document.body.appendChild(toast);
     }
   
     toast.className = `admin-toast admin-toast-${type}`;
     toast.textContent = message;
   
     setTimeout(() => toast.classList.add("show"), 50);
     setTimeout(() => toast.classList.remove("show"), 3000);
   }