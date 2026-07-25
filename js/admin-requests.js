/* =========================================================
   ADMIN SERVICE REQUESTS MODULE
   File: js/admin-requests.js

   Sprint 6.4.1 Enterprise Cleanup:
   - Removes "All Records"
   - Uses business-state filters only
   - Archived records only show under Archived Requests
   - Archive/restore closes workspace and refreshes table cleanly
   - Removes archived text badge from request row
   ========================================================= */

   const requestsList = document.getElementById("requestsList");
   const requestSearch = document.getElementById("requestSearch");
   const requestStatusFilter = document.getElementById("requestStatusFilter");
   const refreshRequestsBtn = document.getElementById("refreshRequestsBtn");
   
   let allRequests = [];
   
   function parseVehicleInfo(vehicleText) {
     const fallback = { make: "-", model: "-", year: "-" };
   
     if (!vehicleText) return fallback;
   
     const text = String(vehicleText).trim();
     const yearMatch = text.match(/\b(19|20)\d{2}\b/);
     const year = yearMatch ? yearMatch[0] : "-";
   
     const cleanText = text
       .replace(year, "")
       .replaceAll(",", " ")
       .replace(/\s+/g, " ")
       .trim();
   
     const parts = cleanText.split(" ").filter(Boolean);
   
     return {
       make: parts[0] || "-",
       model: parts.slice(1).join(" ") || "-",
       year
     };
   }
   
   async function loadServiceRequests() {
     if (!requestsList) return;
   
     requestsList.innerHTML =
       typeof renderLoadingState === "function"
         ? renderLoadingState("Loading service requests...")
         : `<p class="empty-message">Loading service requests...</p>`;
   
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
         archived
       `)
       .order("created_at", { ascending: false });
   
     if (error) {
       console.error("Service request load error:", error);
   
       requestsList.innerHTML =
         typeof renderEmptyState === "function"
           ? renderEmptyState("Could not load service requests", error.message)
           : `<p class="empty-message">Could not load service requests: ${escapeHtml(error.message)}</p>`;
   
       if (typeof showToast === "function") {
         showToast("danger", "Load Failed", "Could not load service requests.");
       }
   
       return;
     }
   
     allRequests = data || [];
   
     try {
       if (typeof loadRepairUpdates === "function") {
         await loadRepairUpdates();
       }
     } catch (err) {
       console.warn("Repair updates failed but requests still rendered:", err);
     }
   
     try {
       if (typeof loadJobCardsForRequests === "function") {
         await loadJobCardsForRequests();
       }
     } catch (err) {
       console.warn("Job cards failed but requests still rendered:", err);
     }
   
     try {
       if (typeof updateDashboardStats === "function") {
         updateDashboardStats();
       }
     } catch (err) {
       console.warn("Dashboard stats failed:", err);
     }
   
     renderServiceRequests();
   }
   
   function getFilteredRequests() {
     const searchText = requestSearch
       ? requestSearch.value.trim().toLowerCase()
       : "";
   
     const selectedStatus = requestStatusFilter
       ? requestStatusFilter.value
       : "active";
   
     return allRequests.filter((request) => {
       const status = request.status || "new";
       const archived = request.archived === true;
       const vehicleInfo = parseVehicleInfo(request.vehicle);
   
       const searchableText = `
  ${request.id || ""}
  req-${request.id || ""}
  request ${request.id || ""}
  #${request.id || ""}
  ${request.name || ""}
  ${request.email || ""}
  ${request.phone || ""}
  ${request.vehicle || ""}
  ${vehicleInfo.make}
  ${vehicleInfo.model}
  ${vehicleInfo.year}
  ${request.message || ""}
  ${status}
  ${request.priority || ""}
`.toLowerCase();
   
       const matchesSearch = searchableText.includes(searchText);
   
       let matchesStatus = false;
   
       if (selectedStatus === "active") {
         matchesStatus =
           !archived &&
           !["closed", "cancelled"].includes(status);
       }
       if (selectedStatus === "all_active") {
        matchesStatus = !archived;
      }
   
       if (selectedStatus === "ready_for_pickup") {
         matchesStatus =
           !archived &&
           status === "ready_for_pickup";
       }
   
       if (selectedStatus === "closed") {
         matchesStatus =
           !archived &&
           status === "closed";
       }
   
       if (selectedStatus === "cancelled") {
         matchesStatus =
           !archived &&
           status === "cancelled";
       }
   
       if (selectedStatus === "archived") {
         matchesStatus = archived;
       }
   
       return matchesSearch && matchesStatus;
     });
   }
   
   function renderServiceRequests() {
     if (!requestsList) return;
   
     const filteredRequests = getFilteredRequests();
   
     if (filteredRequests.length === 0) {
       requestsList.innerHTML =
         typeof renderEmptyState === "function"
           ? renderEmptyState(
               "No service requests found",
               "Try changing the search text or selected filter."
             )
           : `<p class="empty-message">No service requests found.</p>`;
       return;
     }
   
     const rows = filteredRequests.map((request) => {
       const status = request.status || "new";
       const priority = request.priority || "normal";
       const vehicleInfo = parseVehicleInfo(request.vehicle);
   
       return `
  <tr
    class="${request.archived ? "archived-row" : ""}"
    data-service-request-id="${Number(request.id)}"
  >
    <td class="service-request-reference-cell">
      <strong>
        REQ-${Number(request.id)}
      </strong>

      <small>
        Request #${Number(request.id)}
      </small>
    </td>

    <td>
      <strong>${safeText(request.name, "No Name")}</strong>
      <small>${safeText(request.email, "-")}</small>
    </td>
   
           <td>${safeText(request.phone, "-")}</td>
           <td>${safeText(vehicleInfo.make)}</td>
           <td>${safeText(vehicleInfo.model)}</td>
           <td>${safeText(vehicleInfo.year)}</td>
   
           <td>
             <span class="status-badge status-${escapeHtml(status)}">
               ${escapeHtml(status.replaceAll("_", " "))}
             </span>
           </td>
   
           <td>
             <span class="priority-badge priority-${escapeHtml(priority)}">
               ${escapeHtml(priority)}
             </span>
           </td>
   
           <td>${hasFullAccess() ? money(request.estimated_cost || 0) : "-"}</td>
           <td>${formatDate(request.created_at)}</td>
   
           <td>
             <button
               type="button"
               class="table-action-btn open-request-btn"
               data-id="${request.id}"
             >
               Open
             </button>
           </td>
         </tr>
       `;
     }).join("");
   
     requestsList.innerHTML = `
       <div class="admin-table-wrap">
         <table class="admin-data-table service-requests-table">
           <thead>
            <tr>
               <th>Request</th>
               <th>Customer</th>
               <th>Phone</th>
               <th>Make</th>
               <th>Model</th>
               <th>Year</th>
               <th>Status</th>
               <th>Priority</th>
               <th>Estimate</th>
               <th>Submitted</th>
               <th>Action</th>
             </tr>
           </thead>
   
           <tbody>
             ${rows}
           </tbody>
         </table>
       </div>
     `;
   
     bindRequestOpenButtons();
   }
   
   function bindRequestOpenButtons() {
     document.querySelectorAll(".open-request-btn").forEach((button) => {
       button.addEventListener("click", function () {
         const requestId = button.getAttribute("data-id");
   
         if (typeof openServiceRequestWorkspace === "function") {
           openServiceRequestWorkspace(requestId);
         } else {
           alert("Service Request Workspace module is not loaded.");
         }
       });
     });
   }
   
   async function archiveOrRestoreRequest(requestId) {
     const request = allRequests.find((item) => String(item.id) === String(requestId));
   
     if (!request) {
       showToast("danger", "Request Not Found", "Request could not be found.");
       return;
     }
   
     const nextArchivedValue = !request.archived;
   
     const confirmMessage = nextArchivedValue
       ? "Archive this service request? It will leave the active board but stay in Archived Requests."
       : "Restore this service request to Active Requests?";
   
     if (!confirm(confirmMessage)) return;
   
     const { error } = await supabaseClient
       .from("service_requests")
       .update({ archived: nextArchivedValue })
       .eq("id", requestId);
   
     if (error) {
       showToast("danger", "Archive Failed", error.message);
       return;
     }
   
     await loadServiceRequests();
     closeWorkspace();
   
     showToast(
       "success",
       nextArchivedValue ? "Request Archived" : "Request Restored",
       nextArchivedValue
         ? "The request has been moved to Archived Requests."
         : "The request has been restored to Active Requests."
     );
   }
   
   async function deleteServiceRequestPermanently(requestId) {
     if (!isDeveloper()) {
       showToast("danger", "Permission Denied", "Only developer access can permanently delete requests.");
       return;
     }
   
     if (!confirm("Permanent delete removes this service request from the database. Continue?")) {
       return;
     }
   
     if (!confirm("Final warning: this cannot be undone. Delete permanently?")) {
       return;
     }
   
     const { error } = await supabaseClient
       .from("service_requests")
       .delete()
       .eq("id", requestId);
   
     if (error) {
       showToast("danger", "Delete Failed", error.message);
       return;
     }
   
     await loadServiceRequests();
     closeWorkspace();
   
     showToast("success", "Request Deleted", "Service request deleted permanently.");
   }
   
   function subscribeStaffRealtime() {
     supabaseClient
       .channel("staff-dashboard")
       .on(
         "postgres_changes",
         { event: "*", schema: "public", table: "service_requests" },
         loadServiceRequests
       )
       .on(
         "postgres_changes",
         { event: "*", schema: "public", table: "repair_updates" },
         loadServiceRequests
       )
       .on(
         "postgres_changes",
         { event: "*", schema: "public", table: "job_cards" },
         loadServiceRequests
       )
       .subscribe();
   }
   
   if (requestSearch) {
     requestSearch.addEventListener("input", renderServiceRequests);
   }
   
   if (requestStatusFilter) {
     requestStatusFilter.addEventListener("change", function () {
       closeWorkspace();
       renderServiceRequests();
     });
   }
   
   if (refreshRequestsBtn) {
     refreshRequestsBtn.addEventListener("click", async function () {
       closeWorkspace();
       await loadServiceRequests();
     });
   }