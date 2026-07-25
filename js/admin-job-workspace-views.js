/* =========================================================
   ADMIN MECHANIC JOB WORKSPACE VIEWS
   File: js/admin-job-workspace-views.js

   Sprint:
   Mechanic Job Workspace and Synchronization

   Purpose:
   Contains all HTML rendering functions used by the dedicated
   Mechanic Job Workspace.

   Architecture:
   - This file renders interface content only.
   - js/admin-job-workspace.js controls loading, navigation,
     permissions, events, saving, and workspace state.
   - js/admin-job-synchronization.js supplies shared job status,
     financial, timeline, and RPC helpers.

   Workspace Tabs:
   1. Overview
   2. Customer
   3. Vehicle
   4. Diagnosis
   5. Repairs
   6. Parts & Labour
   7. Timeline
   8. Update
   ========================================================= */


/* =========================================================
   1. SHARED WORKSPACE CONTEXT
   ========================================================= */

/**
 * Renders the shared context block displayed above all job tabs.
 *
 * Includes:
 * - Breadcrumbs
 * - Current job status
 * - Link back to the related Service Request
 *
 * @param {object} job
 * @param {string} status
 * @returns {string}
 */
function renderMechanicJobWorkspaceContext(job, status) {
    return `
      <div class="mechanic-job-workspace-context">
  
        ${renderBreadcrumbs([
          {
            label: "Dashboard"
          },
          {
            label: "Mechanic Jobs"
          },
          {
            label: `JOB-${job.id}`
          }
        ])}
  
        ${renderActionToolbar({
          title: "Workshop Job",
  
          left: `
            <span
              class="status-badge status-${escapeHtml(status)}"
            >
              ${safeText(
                formatJobWorkflowStatus(status)
              )}
            </span>
          `,
  
          right: `
            ${
              job.service_request_id
                ? `
                  <button
                    type="button"
                    class="secondary-action-btn"
                    onclick="
                      returnToLinkedServiceRequest(
                        ${Number(job.service_request_id)}
                      )
                    "
                  >
                    Open Service Request
                  </button>
                `
                : ""
            }
          `
        })}
  
      </div>
    `;
  }
  
  
  /* =========================================================
     2. OVERVIEW TAB
     ========================================================= */
  
  /**
   * Renders the high-level mechanic job summary.
   *
   * Financial values shown here are operational values from
   * structured parts and labour. They are not the final invoice.
   *
   * @param {object} job
   * @returns {string}
   */
  function renderMechanicJobOverviewTab(job) {
    const finances = getMechanicJobFinancialSummary(
      job.id
    );
  
    return `
      <div class="workspace-tab-section">
  
        ${renderJobWorkspaceHeading(
          "Workshop Summary",
          "Job Overview"
        )}
  
        ${renderInfoGrid([
          {
            label: "Job Status",
            value: formatJobWorkflowStatus(
              job.job_status
            )
          },
          {
            label: "Assigned Mechanic",
            value:
              job.assigned_mechanic ||
              "Unassigned"
          },
          {
            label: "Repair Bay",
            value:
              job.repair_bay ||
              "-"
          },
          {
            label: "Appointment",
            value: formatDate(
              job.appointment_date
            )
          },
          {
            label: "Estimated Completion",
            value: formatDate(
              job.estimated_completion
            )
          },
          {
            label: "Service Request",
            value: job.service_request_id
              ? `#${job.service_request_id}`
              : "-"
          },
          {
            label: "Parts Total",
            value: money(
              finances.partsTotal
            )
          },
          {
            label: "Labour Total",
            value: money(
              finances.labourTotal
            )
          },
          {
            label: "Operational Subtotal",
            value: money(
              finances.operationalSubtotal
            )
          }
        ])}
  
        <div class="workspace-content-card">
          <h4>Customer Complaint</h4>
  
          <p>
            ${safeText(
              job.complaint,
              "No customer complaint was recorded."
            )}
          </p>
        </div>
  
        <div class="workspace-financial-notice">
          <strong>
            Billing source of truth
          </strong>
  
          <p>
            This subtotal comes from structured parts and labour.
            Taxes, discounts, payments, and the final customer amount
            remain controlled by the invoice module.
          </p>
        </div>
  
      </div>
    `;
  }
  
  
  /* =========================================================
     3. CUSTOMER TAB
     ========================================================= */
  
  /**
   * Renders customer information according to staff permissions.
   *
   * Developer, Upper Admin, and Receptionist:
   * - Customer identity can be displayed.
   *
   * Mechanic:
   * - Customer identity remains hidden.
   *
   * @returns {string}
   */
  function renderMechanicJobCustomerTab() {
    /*
      Mechanics can operate on the vehicle and repair record,
      but should not receive unnecessary customer identity data.
    */
    if (!canViewMechanicJobCustomerIdentity()) {
      return `
        <div class="workspace-tab-section">
  
          ${renderJobWorkspaceHeading(
            "Privacy Protected",
            "Customer Information"
          )}
  
          <div class="mechanic-customer-privacy-notice">
            <strong>
              Customer identity is restricted.
            </strong>
  
            <p>
              Mechanics receive the vehicle, complaint, diagnosis,
              repair, parts, labour, and timeline information needed
              to complete the work.
            </p>
          </div>
  
        </div>
      `;
    }
  
    const request =
      activeMechanicJobWorkspace.request;
  
    if (!request) {
      return `
        <div class="workspace-tab-section">
  
          ${renderJobWorkspaceHeading(
            "Customer Record",
            "Customer Information"
          )}
  
          ${renderEmptyState(
            "Customer Record Unavailable",
            "The linked service request could not be loaded."
          )}
  
        </div>
      `;
    }
  
    return `
      <div class="workspace-tab-section">
  
        ${renderJobWorkspaceHeading(
          "Authorized Customer Record",
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
          },
          {
            label: "Request Priority",
            value:
              request.priority ||
              "-"
          }
        ])}
  
      </div>
    `;
  }
  
  
  /* =========================================================
     4. VEHICLE TAB
     ========================================================= */
  
  /**
   * Renders the complete vehicle record for the job.
   *
   * @param {object} job
   * @returns {string}
   */
  function renderMechanicJobVehicleTab(job) {
    const vehicle =
      getMechanicWorkspaceVehicleInfo(job);
  
    return `
      <div class="workspace-tab-section">
  
        ${renderJobWorkspaceHeading(
          "Vehicle Record",
          "Vehicle Information"
        )}
  
        ${renderInfoGrid([
          {
            label: "Vehicle",
            value:
              vehicle.title ||
              "-"
          },
          {
            label: "Year",
            value:
              vehicle.year ||
              "-"
          },
          {
            label: "Make",
            value:
              vehicle.make ||
              "-"
          },
          {
            label: "Model",
            value:
              vehicle.model ||
              "-"
          },
          {
            label: "Trim",
            value:
              vehicle.trim ||
              "-"
          },
          {
            label: "Colour",
            value:
              vehicle.color ||
              "-"
          },
          {
            label: "Plate",
            value:
              vehicle.plate ||
              "-"
          },
          {
            label: "VIN",
            value:
              vehicle.vin ||
              "-"
          },
          {
            label: "Mileage",
            value:
              vehicle.mileage ||
              "-"
          },
          {
            label: "Vehicle ID",
            value:
              job.vehicle_id ||
              "-"
          }
        ])}
  
        <div class="workspace-content-card">
          <h4>Vehicle Notes</h4>
  
          <p>
            ${safeText(
              vehicle.notes,
              "No vehicle notes were recorded."
            )}
          </p>
        </div>
  
      </div>
    `;
  }
  
  
  /* =========================================================
     5. DIAGNOSIS TAB
     ========================================================= */
  
  /**
   * Renders the customer complaint and current mechanic diagnosis.
   *
   * @param {object} job
   * @returns {string}
   */
  function renderMechanicJobDiagnosisTab(job) {
    return `
      <div class="workspace-tab-section">
  
        ${renderJobWorkspaceHeading(
          "Technical Assessment",
          "Diagnosis"
        )}
  
        <div class="workspace-content-card">
          <h4>Customer Complaint</h4>
  
          <p>
            ${safeText(
              job.complaint,
              "No complaint was recorded."
            )}
          </p>
        </div>
  
        <div class="workspace-content-card">
          <h4>Current Diagnosis</h4>
  
          <p>
            ${safeText(
              job.diagnosis,
              "Diagnosis has not been recorded."
            )}
          </p>
        </div>
  
        ${
          canEditMechanicJobWorkspace()
            ? `
              <button
                type="button"
                class="table-action-btn"
                onclick="
                  activateMechanicJobWorkspaceTab(
                    'update'
                  )
                "
              >
                Update Diagnosis
              </button>
            `
            : ""
        }
  
      </div>
    `;
  }
  
  
  /* =========================================================
     6. REPAIRS TAB
     ========================================================= */
  
  /**
   * Renders completed repairs and technical labour notes.
   *
   * Structured billed labour remains in Parts & Labour.
   *
   * @param {object} job
   * @returns {string}
   */
  function renderMechanicJobRepairsTab(job) {
    return `
      <div class="workspace-tab-section">
  
        ${renderJobWorkspaceHeading(
          "Repair Execution",
          "Repairs Performed"
        )}
  
        <div class="workspace-content-card">
          <h4>Repair Record</h4>
  
          <p>
            ${safeText(
              job.repairs_performed,
              "No repair work has been recorded."
            )}
          </p>
        </div>
  
        <div class="workspace-content-card">
          <h4>Labour Notes</h4>
  
          <p>
            ${safeText(
              job.labor_notes,
              "No labour notes have been recorded."
            )}
          </p>
        </div>
  
        ${
          canEditMechanicJobWorkspace()
            ? `
              <button
                type="button"
                class="table-action-btn"
                onclick="
                  activateMechanicJobWorkspaceTab(
                    'update'
                  )
                "
              >
                Update Repair Record
              </button>
            `
            : ""
        }
  
      </div>
    `;
  }
  
  
  /* =========================================================
     7. PARTS & LABOUR TAB
     ========================================================= */
  
  /**
   * Renders:
   * - Structured installed parts
   * - Structured labour entries
   * - Current operational subtotal
   *
   * @param {object} job
   * @returns {string}
   */
  function renderMechanicJobPartsLabourTab(job) {
    const finances =
      getMechanicJobFinancialSummary(job.id);
  
    return `
      <div
        class="
          workspace-tab-section
          mechanic-parts-labour-tab
        "
      >
  
        ${renderJobWorkspaceHeading(
          "Costed Workshop Records",
          "Parts & Labour"
        )}
  
        ${
          typeof renderMechanicPartsWorkspace ===
          "function"
            ? renderMechanicPartsWorkspace(job)
            : renderEmptyState(
                "Parts Module Unavailable",
                "The structured parts module is not loaded."
              )
        }
  
        ${
          typeof renderMechanicLabourWorkspace ===
          "function"
            ? renderMechanicLabourWorkspace(job)
            : renderEmptyState(
                "Labour Module Unavailable",
                "The structured labour module is not loaded."
              )
        }
  
        <div class="mechanic-job-cost-summary">
  
          <div>
            <span>Parts Total</span>
  
            <strong>
              ${money(finances.partsTotal)}
            </strong>
          </div>
  
          <div>
            <span>Labour Total</span>
  
            <strong>
              ${money(finances.labourTotal)}
            </strong>
          </div>
  
          <div class="mechanic-job-cost-total">
            <span>Operational Subtotal</span>
  
            <strong>
              ${money(
                finances.operationalSubtotal
              )}
            </strong>
          </div>
  
        </div>
  
      </div>
    `;
  }
  
  
  /* =========================================================
     8. TIMELINE TAB
     ========================================================= */
  
  /**
   * Renders timeline records belonging only to the active job.
   *
   * The database migration added repair_updates.job_card_id,
   * allowing each mechanic job to have a separate timeline.
   *
   * @param {object} job
   * @returns {string}
   */
  function renderMechanicJobTimelineTab(job) {
    const entries =
      activeMechanicJobWorkspace.timeline || [];
  
    return `
      <div class="workspace-tab-section">
  
        ${renderJobWorkspaceHeading(
          "Activity History",
          "Mechanic Job Timeline",
          `Only events recorded for JOB-${job.id} appear here.`
        )}
  
        ${
          entries.length === 0
            ? renderEmptyState(
                "No Job Timeline Entries",
                "Job status, diagnosis, repairs, and mechanic updates will appear here."
              )
            : `
              <div class="repair-timeline-list">
  
                ${entries
                  .map((entry) => {
                    return renderMechanicJobTimelineEntry(
                      entry
                    );
                  })
                  .join("")}
  
              </div>
            `
        }
  
      </div>
    `;
  }
  
  
  /**
   * Renders one mechanic job timeline record.
   *
   * @param {object} entry
   * @returns {string}
   */
  function renderMechanicJobTimelineEntry(entry) {
    const visibility =
      entry.visible_to_customer
        ? "Customer visible"
        : "Internal only";
  
    return `
      <article class="repair-timeline-item">
  
        <div class="repair-timeline-marker">
        </div>
  
        <div class="repair-timeline-content">
  
          <div class="repair-timeline-heading">
  
            <strong>
              ${safeText(
                String(
                  entry.title ||
                  "job update"
                ).replaceAll("_", " ")
              )}
            </strong>
  
            <small>
              ${formatDate(entry.created_at)}
              •
              ${visibility}
            </small>
  
          </div>
  
          <p>
            ${safeText(
              entry.message,
              "No timeline message was recorded."
            )}
          </p>
  
        </div>
  
      </article>
    `;
  }
  
  
  /* =========================================================
     9. UPDATE TAB
     ========================================================= */
  
  /**
   * Renders the mechanic job update form.
   *
   * Developer, Upper Admin, and Mechanic:
   * - Can update operational job details.
   *
   * Receptionist:
   * - Receives a read-only notice.
   *
   * @param {object} job
   * @returns {string}
   */
  function renderMechanicJobUpdateTab(job) {
    if (!canEditMechanicJobWorkspace()) {
      return `
        <div class="workspace-tab-section">
  
          ${renderJobWorkspaceHeading(
            "Read-Only Access",
            "Update Mechanic Job"
          )}
  
          ${renderEmptyState(
            "Operational Editing Restricted",
            "Reception staff can review the linked job but cannot change diagnosis or repair records."
          )}
  
        </div>
      `;
    }
  
    return `
      <div class="workspace-tab-section">
  
        ${renderJobWorkspaceHeading(
          "Mechanic Update",
          "Update Mechanic Job"
        )}
  
        <form
          class="mechanic-job-update-form"
          id="mechanicJobUpdateForm-${job.id}"
          onsubmit="
            event.preventDefault();
  
            saveMechanicJobWorkspace(
              ${Number(job.id)},
              event.submitter
            );
          "
        >
  
          <div class="mechanic-job-update-grid">
  
            <label>
              <span>Job Status</span>
  
              <select
                id="jobWorkspaceStatus-${job.id}"
              >
                ${renderJobWorkflowStatusOptions(
                  job.job_status
                )}
              </select>
            </label>
  
  
            <label class="full-span">
              <span>Diagnosis</span>
  
              <textarea
                id="jobWorkspaceDiagnosis-${job.id}"
                placeholder="Record inspection findings and the confirmed diagnosis."
              >${safeText(
                job.diagnosis,
                ""
              )}</textarea>
            </label>
  
  
            <label class="full-span">
              <span>Repairs Performed</span>
  
              <textarea
                id="jobWorkspaceRepairs-${job.id}"
                placeholder="Record completed repair work and testing."
              >${safeText(
                job.repairs_performed,
                ""
              )}</textarea>
            </label>
  
  
            <label class="full-span">
              <span>Labour Notes</span>
  
              <textarea
                id="jobWorkspaceLabourNotes-${job.id}"
                placeholder="Record technical labour notes not represented by structured labour charges."
              >${safeText(
                job.labor_notes,
                ""
              )}</textarea>
            </label>
  
  
            <label class="full-span">
              <span>
                Timeline / Customer Update
              </span>
  
              <textarea
                id="jobWorkspaceMessage-${job.id}"
                placeholder="Example: Diagnosis completed. Cooling fan relay replacement is in progress."
              ></textarea>
            </label>
  
  
            <label
              class="
                workspace-checkbox-field
                full-span
              "
            >
  
              <input
                id="jobWorkspaceInternalOnly-${job.id}"
                type="checkbox"
                checked
              >
  
              <span>
                Internal note only
              </span>
  
              <small>
                Clear this checkbox only when the message is approved
                for the customer portal.
              </small>
  
            </label>
  
          </div>
  
  
          <div class="mechanic-update-guidance">
            <strong>
              Structured record rule
            </strong>
  
            <p>
              Add parts and billed labour in Parts & Labour.
              Do not duplicate those charges in free-text notes.
            </p>
          </div>
  
  
          <div class="workspace-form-actions">
            <button
              type="submit"
              class="primary-action-btn"
            >
              Save Job Update
            </button>
          </div>
  
        </form>
  
      </div>
    `;
  }
  
  
  /* =========================================================
     10. VEHICLE INFORMATION HELPER
     ========================================================= */
  
  /**
   * Returns normalized vehicle information.
   *
   * Uses getFullVehicleInfo() from the mechanic board when it
   * is available. Falls back to the joined vehicles record.
   *
   * @param {object} job
   * @returns {object}
   */
  function getMechanicWorkspaceVehicleInfo(job) {
    if (
      typeof getFullVehicleInfo ===
      "function"
    ) {
      return getFullVehicleInfo(job);
    }
  
    const vehicle =
      job.vehicles || {};
  
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
        job.vehicle ||
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
  
  
  /* =========================================================
     11. SHARED SECTION HEADING
     ========================================================= */
  
  /**
   * Renders a consistent heading for every workspace tab.
   *
   * @param {string} kicker
   * @param {string} title
   * @param {string} description
   * @returns {string}
   */
  function renderJobWorkspaceHeading(
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
  
  
  /* =========================================================
     12. GLOBAL EXPORTS
     ========================================================= */
  
  window.renderMechanicJobWorkspaceContext =
    renderMechanicJobWorkspaceContext;
  
  window.renderMechanicJobOverviewTab =
    renderMechanicJobOverviewTab;
  
  window.renderMechanicJobCustomerTab =
    renderMechanicJobCustomerTab;
  
  window.renderMechanicJobVehicleTab =
    renderMechanicJobVehicleTab;
  
  window.renderMechanicJobDiagnosisTab =
    renderMechanicJobDiagnosisTab;
  
  window.renderMechanicJobRepairsTab =
    renderMechanicJobRepairsTab;
  
  window.renderMechanicJobPartsLabourTab =
    renderMechanicJobPartsLabourTab;
  
  window.renderMechanicJobTimelineTab =
    renderMechanicJobTimelineTab;
  
  window.renderMechanicJobUpdateTab =
    renderMechanicJobUpdateTab;
  
  window.getMechanicWorkspaceVehicleInfo =
    getMechanicWorkspaceVehicleInfo;
  
  window.renderJobWorkspaceHeading =
    renderJobWorkspaceHeading;