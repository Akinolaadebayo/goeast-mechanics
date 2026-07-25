/* =========================================================
   SERVICE REQUEST WORKSPACE
   File: js/admin-service-request-workspace.js

   Sprint: Mechanic Job Workspace and Synchronization

   Purpose:
   Renders one selected Service Request inside the reusable
   enterprise workspace.

   Workspace Tabs:
   - Overview
   - Customer
   - Vehicle
   - Linked Jobs
   - Timeline
   - Update

   Business Rules:
   - Service Request = customer intake and administration.
   - Mechanic Job = diagnosis and repair execution.
   - Invoice = authoritative Final Cost.
   - Requests with linked jobs receive their operational status
     from the database's controlled multi-job synchronization.
   ========================================================= */


/* =========================================================
   1. WORKSPACE STATE
   ========================================================= */

   let activeServiceRequestWorkspace = {
    requestId: null,
    currentTab: "overview"
  };
  
  const SERVICE_REQUEST_WORKSPACE_TABS = [
    "overview",
    "customer",
    "vehicle",
    "linkedjobs",
    "timeline",
    "update"
  ];
  
  
  /* =========================================================
     2. PERMISSION HELPERS
     ========================================================= */
  
  /**
   * The complete Service Request administration workspace is
   * restricted to authorized administrative staff.
   *
   * Mechanics work from the Mechanic Job Workspace and therefore
   * do not receive unnecessary customer identity information.
   */
  function canOpenServiceRequestWorkspace() {
    if (
      typeof currentProfile === "undefined" ||
      !currentProfile
    ) {
      return false;
    }
  
    return [
      "developer",
      "upper_admin",
      "receptionist"
    ].includes(currentProfile.role);
  }
  
  
  /**
   * Determines whether the current user may save a request-level
   * administrative update.
   */
  function canUpdateServiceRequestWorkspace() {
    if (
      typeof canSaveRepairUpdate === "function"
    ) {
      return Boolean(
        canSaveRepairUpdate()
      );
    }
  
    if (
      typeof hasFullAccess === "function" &&
      hasFullAccess()
    ) {
      return true;
    }
  
    return Boolean(
      typeof currentProfile !== "undefined" &&
      currentProfile?.role === "receptionist"
    );
  }
  
  
  /**
   * Preserves the existing financial-visibility rule.
   */
  function canViewServiceRequestFinancials() {
    return Boolean(
      typeof hasFullAccess === "function" &&
      hasFullAccess()
    );
  }
  
  
  /* =========================================================
     3. TAB NORMALIZATION
     ========================================================= */
  
  /**
   * The former "jobcard" identifier is retained as a
   * compatibility alias for the new Linked Jobs tab.
   */
  function normalizeServiceRequestWorkspaceTab(
    tabName
  ) {
    const requestedTab = String(
      tabName || "overview"
    )
      .trim()
      .toLowerCase();
  
    if (requestedTab === "jobcard") {
      return "linkedjobs";
    }
  
    return SERVICE_REQUEST_WORKSPACE_TABS.includes(
      requestedTab
    )
      ? requestedTab
      : "overview";
  }
  
  
  /* =========================================================
     4. OPEN SERVICE REQUEST WORKSPACE
     ========================================================= */
  
  /**
   * Opens one Service Request and optionally activates a specific
   * tab.
   *
   * The initialTab argument is required by the Mechanic Job
   * Workspace return workflow.
   */
  function openServiceRequestWorkspace(
    requestId,
    initialTab = "overview"
  ) {
    if (!canOpenServiceRequestWorkspace()) {
      notifyServiceRequestWorkspace(
        "danger",
        "Access Restricted",
        "Service Request administration is limited to authorized administrative staff."
      );
  
      return;
    }
  
    const request = Array.isArray(allRequests)
      ? allRequests.find((item) => {
          return (
            String(item.id) ===
            String(requestId)
          );
        })
      : null;
  
    if (!request) {
      notifyServiceRequestWorkspace(
        "danger",
        "Request Not Found",
        "The selected Service Request could not be found."
      );
  
      return;
    }
  
    activateServiceRequestSection();
  
    const vehicleInfo =
      parseVehicleInfo(
        request.vehicle
      );
  
    const titleParts = [
      vehicleInfo.year,
      vehicleInfo.make,
      vehicleInfo.model
    ].filter((value) => {
      return value && value !== "-";
    });
  
    const title =
      titleParts.join(" ").trim() ||
      request.vehicle ||
      "Service Request";
  
    const requestedTab =
      normalizeServiceRequestWorkspaceTab(
        initialTab
      );
  
    const tabs =
      buildServiceRequestWorkspaceTabs(
        request
      );
  
    const availableTabIds =
      tabs.map((tab) => {
        return tab.id;
      });
  
    const safeInitialTab =
      availableTabIds.includes(
        requestedTab
      )
        ? requestedTab
        : "overview";
  
    const opened = openWorkspace({
      containerId:
        "workspaceContainer",
  
      module:
        `service-request-${request.id}`,
  
      ownerSectionId:
        "requestsSection",
  
      /*
        Hide the normal request board without destroying search,
        filter, loaded-record, or scroll state.
      */
      hideSelectors: [
        ":scope > .section-heading",
        ":scope > .toolbar",
        ":scope > #requestsList"
      ],
  
      kicker:
        "Service Request Workspace",
  
      title,
  
      subtitle:
        `Request #${request.id} • ${formatDate(request.created_at)}`,
  
      actions: `
        <button
          type="button"
          class="
            secondary-action-btn
            workspace-close-btn
          "
          onclick="closeWorkspace()"
        >
          Close
        </button>
      `,
  
      context:
        renderServiceRequestWorkspaceContext(
          request
        ),
  
      tabs,
  
      onClose:
        resetServiceRequestWorkspaceState
    });
  
    if (!opened) {
      return;
    }
  
    activeServiceRequestWorkspace = {
      requestId:
        Number(request.id),
  
      currentTab:
        safeInitialTab
    };
  
    const container =
      document.getElementById(
        "workspaceContainer"
      );
  
    if (
      container &&
      typeof activateWorkspaceTab ===
        "function"
    ) {
      activateWorkspaceTab(
        container,
        safeInitialTab
      );
    }
  
    bindServiceRequestWorkspaceEvents(
      container
    );
  
    /*
      Bind the Linked Jobs controls rendered in the new tab.
    */
    if (
      container &&
      typeof bindCreateJobButtons ===
        "function"
    ) {
      bindCreateJobButtons(
        container
      );
    }
  
    /*
      Bind the centralized Service Request update form.
    */
    if (
      container &&
      typeof bindRepairUpdateButtons ===
        "function"
    ) {
      bindRepairUpdateButtons(
        container
      );
    }
  }
  
  
  /* =========================================================
     5. BUILD WORKSPACE TABS
     ========================================================= */
  
  function buildServiceRequestWorkspaceTabs(
    request
  ) {
    return [
      {
        id: "overview",
        label: "Overview",
        content:
          renderServiceRequestOverviewTab(
            request
          )
      },
      {
        id: "customer",
        label: "Customer",
        content:
          renderServiceRequestCustomerTab(
            request
          )
      },
      {
        id: "vehicle",
        label: "Vehicle",
        content:
          renderServiceRequestVehicleTab(
            request
          )
      },
      {
        id: "linkedjobs",
        label: "Linked Jobs",
        content:
          renderServiceRequestLinkedJobsTab(
            request
          )
      },
      {
        id: "timeline",
        label: "Timeline",
        content:
          renderServiceRequestTimelineTab(
            request
          )
      },
      {
        id: "update",
        label: "Update",
        content:
          renderServiceRequestUpdateTab(
            request
          )
      }
    ];
  }
  
  
  /* =========================================================
     6. SHARED WORKSPACE CONTEXT
     ========================================================= */
  
  function renderServiceRequestWorkspaceContext(
    request
  ) {
    const requestId =
      Number(request.id);
  
    const actionButtons = `
      ${
        typeof hasFullAccess === "function" &&
        hasFullAccess()
          ? `
            <button
              type="button"
              class="secondary-action-btn"
              onclick="
                archiveOrRestoreRequest(
                  ${requestId}
                )
              "
            >
              ${
                request.archived
                  ? "Restore Request"
                  : "Archive Request"
              }
            </button>
          `
          : ""
      }
  
      ${
        typeof isDeveloper === "function" &&
        isDeveloper()
          ? `
            <button
              type="button"
              class="danger-action-btn"
              onclick="
                deleteServiceRequestPermanently(
                  ${requestId}
                )
              "
            >
              Delete Permanently
            </button>
          `
          : ""
      }
    `;
  
    return `
      <div class="service-request-workspace-context">
  
        ${renderBreadcrumbs([
          {
            label: "Dashboard"
          },
          {
            label: "Service Requests"
          },
          {
            label: `Request #${request.id}`
          }
        ])}
  
        ${
          actionButtons.trim()
            ? renderActionToolbar({
                title:
                  "Request Actions",
  
                right:
                  actionButtons
              })
            : ""
        }
  
      </div>
    `;
  }
  
  
  /* =========================================================
     7. OVERVIEW TAB
     ========================================================= */
  
  function renderServiceRequestOverviewTab(
    request
  ) {
    const linkedJobs =
      typeof getJobCardsForRequest ===
        "function"
        ? getJobCardsForRequest(
            request.id
          )
        : [];
  
    const canViewFinancials =
      canViewServiceRequestFinancials();
  
    return `
      <div class="workspace-tab-section">
  
        ${renderServiceRequestWorkspaceHeading(
          "Request Summary",
          "Request Overview"
        )}
  
        ${renderInfoGrid([
          {
            label: "Status",
            value:
              formatServiceRequestStatus(
                request.status
              )
          },
          {
            label: "Priority",
            value:
              request.priority ||
              "-"
          },
          {
            label: "Estimate",
            value:
              canViewFinancials
                ? money(
                    request.estimated_cost ||
                    0
                  )
                : "-"
          },
          {
            label: "Final Cost",
            value:
              canViewFinancials
                ? money(
                    request.final_cost ||
                    0
                  )
                : "-"
          },
          {
            label: "Linked Jobs",
            value:
              String(
                linkedJobs.length
              )
          },
          {
            label: "Submitted",
            value:
              formatDate(
                request.created_at
              )
          },
          {
            label: "Archive Status",
            value:
              request.archived
                ? "Archived"
                : "Active"
          }
        ])}
  
        <div class="workspace-content-card">
          <h4>
            Customer Message
          </h4>
  
          <p>
            ${safeText(
              request.message,
              "No customer message was provided."
            )}
          </p>
        </div>
  
        ${
          canViewFinancials
            ? `
              <div class="workspace-financial-notice">
                <strong>
                  Final Cost is invoice controlled
                </strong>
  
                <p>
                  The displayed Final Cost is synchronized from
                  non-cancelled invoices. It is not edited from the
                  Service Request or Mechanic Job workspace.
                </p>
              </div>
            `
            : ""
        }
  
        ${
          typeof hasFullAccess === "function" &&
          hasFullAccess()
            ? `
              <div class="workspace-content-card">
                <h4>
                  Admin Notes
                </h4>
  
                <p>
                  ${safeText(
                    request.admin_notes,
                    "No admin notes have been recorded."
                  )}
                </p>
              </div>
            `
            : ""
        }
  
      </div>
    `;
  }
  
  
  /* =========================================================
     8. CUSTOMER TAB
     ========================================================= */
  
  function renderServiceRequestCustomerTab(
    request
  ) {
    return `
      <div class="workspace-tab-section">
  
        ${renderServiceRequestWorkspaceHeading(
          "Customer Record",
          "Customer Information"
        )}
  
        ${renderInfoGrid([
          {
            label: "Customer",
            value:
              request.name ||
              "-"
          },
          {
            label: "Email",
            value:
              request.email ||
              "-"
          },
          {
            label: "Phone",
            value:
              request.phone ||
              "-"
          }
        ])}
  
      </div>
    `;
  }
  
  
  /* =========================================================
     9. VEHICLE TAB
     ========================================================= */
  
  function renderServiceRequestVehicleTab(
    request
  ) {
    const vehicleInfo =
      parseVehicleInfo(
        request.vehicle
      );
  
    return `
      <div class="workspace-tab-section">
  
        ${renderServiceRequestWorkspaceHeading(
          "Vehicle Record",
          "Vehicle Information"
        )}
  
        ${renderInfoGrid([
          {
            label: "Vehicle",
            value:
              request.vehicle ||
              "-"
          },
          {
            label: "Year",
            value:
              vehicleInfo.year ||
              "-"
          },
          {
            label: "Make",
            value:
              vehicleInfo.make ||
              "-"
          },
          {
            label: "Model",
            value:
              vehicleInfo.model ||
              "-"
          },
          {
            label: "Vehicle ID",
            value:
              request.vehicle_id ||
              "-"
          }
        ])}
  
      </div>
    `;
  }
  
  
  /* =========================================================
     10. LINKED JOBS TAB
     ========================================================= */
  
  function renderServiceRequestLinkedJobsTab(
    request
  ) {
    if (
      typeof renderCreateJobCardBox !==
      "function"
    ) {
      return `
        <div class="workspace-tab-section">
  
          ${renderServiceRequestWorkspaceHeading(
            "Workshop",
            "Linked Mechanic Jobs"
          )}
  
          ${renderEmptyState(
            "Linked Jobs Module Missing",
            "The mechanic job-card module is not loaded."
          )}
  
        </div>
      `;
    }
  
    return `
      <div class="workspace-tab-section">
  
        ${renderServiceRequestWorkspaceHeading(
          "Workshop",
          "Linked Mechanic Jobs",
          "Each job represents one separate repair scope under this Service Request."
        )}
  
        ${renderCreateJobCardBox(
          request
        )}
  
      </div>
    `;
  }
  
  
  /**
   * Compatibility alias retained for older callers that still
   * refer to the former Job Card tab.
   */
  function renderServiceRequestJobCardTab(
    request
  ) {
    return renderServiceRequestLinkedJobsTab(
      request
    );
  }
  
  
  /* =========================================================
     11. TIMELINE TAB
     ========================================================= */
  
  function renderServiceRequestTimelineContent(
    requestId
  ) {
    if (
      typeof renderUpdateHistory !==
      "function"
    ) {
      return renderEmptyState(
        "Timeline Unavailable",
        "The repair-update timeline module is not loaded."
      );
    }
  
    const historyHtml =
      renderUpdateHistory(
        requestId
      );
  
    if (!historyHtml) {
      return renderEmptyState(
        "No Timeline Entries Yet",
        "Administrative updates, mechanic progress, and approved customer communications will appear here."
      );
    }
  
    return `
      <div class="service-request-timeline">
        ${historyHtml}
      </div>
    `;
  }
  
  
  function renderServiceRequestTimelineTab(
    request
  ) {
    return `
      <div class="workspace-tab-section">
  
        ${renderServiceRequestWorkspaceHeading(
          "Activity History",
          "Request Timeline",
          "Request-level and linked-job events are shown together in chronological order."
        )}
  
        ${renderServiceRequestTimelineContent(
          request.id
        )}
  
      </div>
    `;
  }
  
  
  /* =========================================================
     12. UPDATE TAB
     ========================================================= */
  
  /**
   * Uses the centralized form from admin-updates.js so linked-job
   * status controls and invoice-owned Final Cost cannot diverge.
   */
  function renderServiceRequestUpdateTab(
    request
  ) {
    if (
      !canUpdateServiceRequestWorkspace()
    ) {
      return `
        <div class="workspace-tab-section">
  
          ${renderServiceRequestWorkspaceHeading(
            "Request Administration",
            "Update Service Request"
          )}
  
          ${renderEmptyState(
            "Permission Required",
            "You do not have permission to update this Service Request."
          )}
  
        </div>
      `;
    }
  
    if (
      typeof renderRepairUpdateForm !==
      "function"
    ) {
      return `
        <div class="workspace-tab-section">
  
          ${renderServiceRequestWorkspaceHeading(
            "Request Administration",
            "Update Service Request"
          )}
  
          ${renderEmptyState(
            "Update Module Missing",
            "The Service Request update module is not loaded."
          )}
  
        </div>
      `;
    }
  
    return `
      <div class="workspace-tab-section">
  
        ${renderServiceRequestWorkspaceHeading(
          "Request Administration",
          "Update Service Request"
        )}
  
        ${renderRepairUpdateForm(
          request,
          request.status || "new",
          request.priority || "normal"
        )}
  
      </div>
    `;
  }
  
  
  /* =========================================================
     13. SAVE COMPATIBILITY WRAPPER
     ========================================================= */
  
  /**
   * Retains the former public function name.
   *
   * New rendering uses bindRepairUpdateButtons(), but older
   * callers still reach the centralized request-update workflow.
   */
  async function saveServiceRequestWorkspaceUpdate(
    requestId,
    button
  ) {
    if (
      typeof saveRepairUpdate !==
      "function"
    ) {
      notifyServiceRequestWorkspace(
        "danger",
        "Update Module Missing",
        "The centralized Service Request update function is unavailable."
      );
  
      return;
    }
  
    await saveRepairUpdate(
      requestId,
      button
    );
  }
  
  
  /* =========================================================
     14. WORKSPACE EVENTS
     ========================================================= */
  
  function bindServiceRequestWorkspaceEvents(
    container
  ) {
    if (!container) {
      return;
    }
  
    container
      .querySelectorAll(
        ".workspace-tab-btn"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          function () {
            activeServiceRequestWorkspace
              .currentTab =
                normalizeServiceRequestWorkspaceTab(
                  button.dataset.tab
                );
          }
        );
      });
  }
  
  
  /* =========================================================
     15. SECTION ACTIVATION
     ========================================================= */
  
  function activateServiceRequestSection() {
    document
      .querySelectorAll(
        ".admin-section"
      )
      .forEach((section) => {
        section.classList.toggle(
          "active-section",
          section.id ===
            "requestsSection"
        );
      });
  
    document
      .querySelectorAll(
        ".nav-btn[data-section]"
      )
      .forEach((button) => {
        button.classList.toggle(
          "active",
          button.dataset.section ===
            "requestsSection"
        );
      });
  }
  
  
  /* =========================================================
     16. DISPLAY HELPERS
     ========================================================= */
  
  function renderServiceRequestWorkspaceHeading(
    kicker,
    title,
    description = ""
  ) {
    return `
      <div class="workspace-section-heading">
  
        <p>
          ${safeText(kicker)}
        </p>
  
        <h3>
          ${safeText(title)}
        </h3>
  
        ${
          description
            ? `
              <small>
                ${safeText(description)}
              </small>
            `
            : ""
        }
  
      </div>
    `;
  }
  
  
  function formatServiceRequestStatus(
    status
  ) {
    const normalized =
      String(status || "new")
        .trim()
        .toLowerCase();
  
    const labels = {
      new:
        "New",
  
      acknowledged:
        "Acknowledged",
  
      diagnosing:
        "Diagnosing",
  
      waiting_parts:
        "Waiting for Parts",
  
      repairing:
        "Repairing",
  
      testing:
        "Testing",
  
      ready_for_pickup:
        "Ready for Pickup",
  
      payment_confirmed:
        "Payment Confirmed",
  
      delivered:
        "Delivered",
  
      closed:
        "Closed",
  
      cancelled:
        "Cancelled"
    };
  
    return (
      labels[normalized] ||
      normalized.replaceAll(
        "_",
        " "
      )
    );
  }
  
  
  /* =========================================================
     17. STATE AND NOTIFICATION HELPERS
     ========================================================= */
  
  function resetServiceRequestWorkspaceState() {
    activeServiceRequestWorkspace = {
      requestId: null,
      currentTab: "overview"
    };
  }
  
  
  function notifyServiceRequestWorkspace(
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
     18. GLOBAL EXPORTS
     ========================================================= */
  
  window.openServiceRequestWorkspace =
    openServiceRequestWorkspace;
  
  window.renderServiceRequestLinkedJobsTab =
    renderServiceRequestLinkedJobsTab;
  
  window.renderServiceRequestJobCardTab =
    renderServiceRequestJobCardTab;
  
  window.saveServiceRequestWorkspaceUpdate =
    saveServiceRequestWorkspaceUpdate;