/* =========================================================
   CUSTOMER REQUESTS MODULE
   File: js/customer-requests.js

   Professional Purpose:
   Controls the customer-facing service request area.

   Business Logic:
   - Loads only the logged-in customer's requests.
   - Separates active repairs from completed/cancelled history.
   - Makes vehicle information the main focus of each repair card.
   - Hides confusing $0.00 pricing from customers.
   - Shows customer-friendly status labels.
   ========================================================= */


/* =========================================================
   1. LOAD CUSTOMER SERVICE REQUESTS
   Operation:
   Pulls all service requests for the logged-in customer.
   Includes vehicle_id so future modules can connect request
   history directly to the customer's saved vehicle.
   ========================================================= */

   async function loadCustomerRequests() {
    if (!currentUser) return;
  
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
        admin_notes,
        estimated_cost,
        final_cost
      `)
      .eq("email", currentUser.email)
      .order("created_at", { ascending: false });
  
    if (error) {
      if (requestsContainer) {
        requestsContainer.innerHTML = `
          <div class="empty-message">${escapeHtml(error.message)}</div>
        `;
      }
      return;
    }
  
    customerRequests = data || [];
  }
  
  
  /* =========================================================
     2. LOAD CUSTOMER-VISIBLE REPAIR UPDATES
     Operation:
     Loads repair updates connected to the customer's requests.
     Only updates marked visible_to_customer are shown.
     ========================================================= */
  
  async function loadCustomerRepairUpdates() {
    repairUpdatesByRequest = {};
  
    if (customerRequests.length === 0) {
      renderCustomerRequests();
      return;
    }
  
    const requestIds = customerRequests.map((request) => request.id);
  
    const { data, error } = await supabaseClient
      .from("repair_updates")
      .select("id, service_request_id, title, message, visible_to_customer, created_at")
      .in("service_request_id", requestIds)
      .eq("visible_to_customer", true)
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error("Could not load customer repair updates:", error.message);
      renderCustomerRequests();
      return;
    }
  
    (data || []).forEach((update) => {
      if (!repairUpdatesByRequest[update.service_request_id]) {
        repairUpdatesByRequest[update.service_request_id] = [];
      }
  
      repairUpdatesByRequest[update.service_request_id].push(update);
    });
  
    renderCustomerRequests();
  }
  
  
  /* =========================================================
     3. RENDER CUSTOMER REQUESTS
     Operation:
     Splits requests into Current Repairs and Service History.
     ========================================================= */
  
  function renderCustomerRequests() {
    if (!requestsContainer) return;
  
    if (customerRequests.length === 0) {
      requestsContainer.innerHTML = `<div class="empty-message">No service requests yet.</div>`;
      return;
    }
  
    const currentRepairs = customerRequests.filter((request) => {
      const status = request.status || "new";
      return !["closed", "cancelled"].includes(status);
    });
  
    const serviceHistory = customerRequests.filter((request) => {
      const status = request.status || "new";
      return ["closed", "cancelled"].includes(status);
    });
  
    requestsContainer.innerHTML = `
      <div class="customer-subsection">
        <h3>Current Repairs</h3>
        <div id="currentRepairsList"></div>
      </div>
  
      <div class="customer-subsection">
        <h3>Service History</h3>
        <div id="serviceHistoryList"></div>
      </div>
    `;
  
    renderCustomerRequestGroup("currentRepairsList", currentRepairs, "No active repairs right now.");
    renderCustomerRequestGroup("serviceHistoryList", serviceHistory, "No completed service history yet.");
  }
  
  
  /* =========================================================
     4. RENDER REQUEST GROUP
     Operation:
     Creates professional customer repair cards.
     Customer-facing cards remove unnecessary customer details
     and prioritize vehicle, status, date, estimate, and update.
     ========================================================= */
  
  function renderCustomerRequestGroup(containerId, group, emptyMessage) {
    const container = document.getElementById(containerId);
  
    if (!container) return;
  
    if (group.length === 0) {
      container.innerHTML = `<div class="empty-message">${emptyMessage}</div>`;
      return;
    }
  
    container.innerHTML = "";
  
    group.forEach((request) => {
      const status = request.status || "new";
      const statusInfo = getCustomerStatusInfo(status);
      const vehicleInfo = parseVehicleDisplay(request.vehicle);
  
      const card = document.createElement("div");
      card.className = "customer-repair-card";
  
      card.innerHTML = `
        <div class="repair-card-header">
          <div>
            <p class="repair-card-label">Vehicle Service Request</p>
            <h3>${safeText(vehicleInfo.main, "Vehicle")}</h3>
            ${vehicleInfo.plate ? `<p class="vehicle-plate">Plate: ${safeText(vehicleInfo.plate)}</p>` : ""}
          </div>
  
          <span class="customer-status-badge ${statusInfo.className}">
            ${statusInfo.label}
          </span>
        </div>
  
        <div class="repair-summary-grid">
          <div class="repair-summary-item">
            <span>Submitted</span>
            <strong>${formatDate(request.created_at)}</strong>
          </div>
  
          <div class="repair-summary-item">
            <span>Estimate</span>
            <strong>${formatCustomerEstimate(request.estimated_cost)}</strong>
          </div>
  
          <div class="repair-summary-item">
            <span>Final Cost</span>
            <strong>${formatCustomerFinalCost(request.final_cost)}</strong>
          </div>
        </div>
  
        <div class="repair-info-block">
          <strong>Problem Reported</strong>
          <p>${safeText(request.message, "No message provided.")}</p>
        </div>
  
        ${renderCustomerLatestUpdate(request.id)}
        ${renderCustomerRepairTimeline(request.id)}
      `;
  
      container.appendChild(card);
    });
  }
  
  
  /* =========================================================
     5. VEHICLE DISPLAY PARSER
     Operation:
     Splits vehicle text into cleaner display parts.
     Example:
     "2024 Toyota A3 1.6 Plate: ddd435"
     becomes:
     - main: "2024 Toyota A3 1.6"
     - plate: "DDD435"
     ========================================================= */
  
  function parseVehicleDisplay(vehicleText) {
    const raw = String(vehicleText || "").trim();
  
    if (!raw) {
      return {
        main: "Vehicle",
        plate: ""
      };
    }
  
    const plateMatch = raw.match(/plate:\s*(.+)$/i);
  
    if (!plateMatch) {
      return {
        main: raw,
        plate: ""
      };
    }
  
    const main = raw.replace(/plate:\s*(.+)$/i, "").trim();
    const plate = plateMatch[1].trim().toUpperCase();
  
    return {
      main: main || raw,
      plate
    };
  }
  
  
  /* =========================================================
     6. CUSTOMER-FRIENDLY STATUS LABELS
     Operation:
     Converts database status values into customer-facing language.
     ========================================================= */
  
  function getCustomerStatusInfo(status) {
    const normalizedStatus = String(status || "new").toLowerCase();
  
    const statusMap = {
      new: {
        label: "Awaiting Shop Review",
        className: "status-customer-new"
      },
      acknowledged: {
        label: "Request Acknowledged",
        className: "status-customer-active"
      },
      diagnosing: {
        label: "Diagnosis In Progress",
        className: "status-customer-warning"
      },
      waiting_parts: {
        label: "Waiting for Parts",
        className: "status-customer-warning"
      },
      repairing: {
        label: "Repair In Progress",
        className: "status-customer-active"
      },
      ready_for_pickup: {
        label: "Ready for Pickup",
        className: "status-customer-ready"
      },
      closed: {
        label: "Completed",
        className: "status-customer-complete"
      },
      cancelled: {
        label: "Cancelled",
        className: "status-customer-cancelled"
      }
    };
  
    return statusMap[normalizedStatus] || {
      label: normalizedStatus.replaceAll("_", " "),
      className: "status-customer-new"
    };
  }
  
  
  /* =========================================================
     7. CUSTOMER-SAFE ESTIMATE DISPLAY
     Operation:
     Shows "Pending shop review" until admin enters a real amount.
     ========================================================= */
  
  function formatCustomerEstimate(value) {
    const amount = Number(value || 0);
  
    if (!amount || amount <= 0) {
      return "Pending shop review";
    }
  
    return money(amount);
  }
  
  
  /* =========================================================
     8. CUSTOMER-SAFE FINAL COST DISPLAY
     Operation:
     Shows "Pending" until the shop enters the final cost.
     ========================================================= */
  
  function formatCustomerFinalCost(value) {
    const amount = Number(value || 0);
  
    if (!amount || amount <= 0) {
      return "Pending";
    }
  
    return money(amount);
  }
  
  
  /* =========================================================
     9. LATEST CUSTOMER-VISIBLE UPDATE
     Operation:
     Shows newest visible repair update.
     ========================================================= */
  
  function renderCustomerLatestUpdate(requestId) {
    const updates = repairUpdatesByRequest[requestId] || [];
  
    if (updates.length === 0) {
      return `
        <div class="repair-info-block">
          <strong>Latest Update</strong>
          <p>Waiting for shop update.</p>
        </div>
      `;
    }
  
    const latest = updates[0];
  
    return `
      <div class="repair-info-block">
        <strong>Latest Update</strong>
        <p>${safeText(latest.message)}</p>
        <small>${formatDate(latest.created_at)}</small>
      </div>
    `;
  }
  
  
  /* =========================================================
     10. CUSTOMER REPAIR TIMELINE
     Operation:
     Shows customer-visible repair update history.
     ========================================================= */
  
  function renderCustomerRepairTimeline(requestId) {
    const updates = repairUpdatesByRequest[requestId] || [];
  
    if (updates.length === 0) {
      return `
        <div class="repair-info-block">
          <strong>Repair Timeline</strong>
          <p>No repair updates available yet.</p>
        </div>
      `;
    }
  
    const items = updates.map((update) => {
      return `
        <div class="timeline-item">
          <strong>${safeText((update.title || "update").replaceAll("_", " "))}</strong>
          <small>${formatDate(update.created_at)}</small>
          <p>${safeText(update.message)}</p>
        </div>
      `;
    }).join("");
  
    return `
      <div class="repair-info-block">
        <strong>Repair Timeline</strong>
        <div class="timeline-list">
          ${items}
        </div>
      </div>
    `;
  }
  
  
  /* =========================================================
     11. CUSTOMER DASHBOARD STATISTICS
     Operation:
     Updates dashboard summary cards.
     ========================================================= */
  
  function updateCustomerStatistics() {
    if (totalRequests) {
      totalRequests.textContent = customerRequests.length;
    }
  
    if (newRequests) {
      newRequests.textContent = customerRequests.filter((request) => {
        return (request.status || "new") === "new";
      }).length;
    }
  
    if (ongoingRequests) {
      ongoingRequests.textContent = customerRequests.filter((request) => {
        const status = request.status || "new";
        return ["acknowledged", "diagnosing", "waiting_parts", "repairing"].includes(status);
      }).length;
    }
  
    if (finishedRequests) {
      finishedRequests.textContent = customerRequests.filter((request) => {
        const status = request.status || "new";
        return ["ready_for_pickup", "closed"].includes(status);
      }).length;
    }
  }