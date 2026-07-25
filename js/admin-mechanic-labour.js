/* =========================================================
   ADMIN MECHANIC LABOUR MODULE
   File: js/admin-mechanic-labour.js

   Sprint:
   Mechanic Job Workspace and Synchronization

   Purpose:
   Manages structured labour entries attached to mechanic jobs.

   Supports:
   - Authorized technician selection
   - Add, edit, and remove labour entries
   - Labour totals calculated from hours × hourly rate
   - Service Request linkage on every labour entry
   - Internal job-specific timeline events
   - Mechanic Job Workspace refresh integration

   Business Rules:
   - Labour belongs to one mechanic job and one parent
     Service Request.
   - Structured labour contributes to the operational subtotal.
   - Invoice totals remain the authoritative customer Final Cost.
   - Automatic labour activity is recorded internally. Customer
     communication remains a deliberate job update.
   ========================================================= */


/* =========================================================
   1. MODULE STATE
   ========================================================= */

   let mechanicLabourByJob = {};
   let mechanicTechnicians = [];
   
   
   /* =========================================================
      2. PERMISSION CONTROL
      ========================================================= */
   
   /**
    * Returns true when the current role may change labour records.
    *
    * Receptionists may review linked jobs from Service Requests,
    * but labour remains a workshop operation.
    *
    * @returns {boolean}
    */
   function canManageMechanicJobLabour() {
     if (
       typeof canEditMechanicJobWorkspace ===
       "function"
     ) {
       return canEditMechanicJobWorkspace();
     }
   
     return Boolean(
       typeof currentProfile !== "undefined" &&
       currentProfile &&
       [
         "developer",
         "upper_admin",
         "mechanic"
       ].includes(currentProfile.role)
     );
   }
   
   
   /* =========================================================
      3. LOAD TECHNICIANS
      ========================================================= */
   
   /**
    * Loads profiles authorized to perform workshop labour.
    *
    * @returns {Promise<boolean>}
    */
   async function loadMechanicTechnicians() {
     const { data, error } = await supabaseClient
       .from("profiles")
       .select(`
         id,
         full_name,
         email,
         role
       `)
       .in("role", [
         "mechanic",
         "developer",
         "upper_admin"
       ])
       .order("full_name", {
         ascending: true
       });
   
     if (error) {
       console.error(
         "Could not load technicians:",
         error.message
       );
   
       mechanicTechnicians = [];
   
       /*
         Keep the authenticated staff member available as a safe
         fallback when profile-list RLS prevents a broader query.
       */
       if (
         typeof currentProfile !== "undefined" &&
         currentProfile &&
         [
           "mechanic",
           "developer",
           "upper_admin"
         ].includes(currentProfile.role)
       ) {
         mechanicTechnicians.push({
           id: currentProfile.id || null,
   
           full_name:
             currentProfile.full_name ||
             currentProfile.email ||
             "Current Technician",
   
           email:
             currentProfile.email || "",
   
           role:
             currentProfile.role
         });
       }
   
       return mechanicTechnicians.length > 0;
     }
   
     mechanicTechnicians = data || [];
   
     return true;
   }
   
   
   /* =========================================================
      4. LOAD LABOUR ENTRIES
      ========================================================= */
   
   /**
    * Loads technicians and all structured labour records.
    *
    * @returns {Promise<boolean>}
    */
   async function loadMechanicLabourEngine() {
     mechanicLabourByJob = {};
   
     const techniciansLoaded =
       await loadMechanicTechnicians();
   
     const { data, error } = await supabaseClient
       .from("job_labour_entries")
       .select("*")
       .order("created_at", {
         ascending: false
       });
   
     if (error) {
       console.error(
         "Could not load labour entries:",
         error.message
       );
   
       return false;
     }
   
     (data || []).forEach((entry) => {
       const jobKey = String(
         entry.job_card_id
       );
   
       if (!mechanicLabourByJob[jobKey]) {
         mechanicLabourByJob[jobKey] = [];
       }
   
       mechanicLabourByJob[jobKey].push(
         entry
       );
     });
   
     return techniciansLoaded;
   }
   
   
   /* =========================================================
      5. LABOUR LOOKUP AND CALCULATION HELPERS
      ========================================================= */
   
   function getMechanicLabourForJob(jobId) {
     return (
       mechanicLabourByJob[
         String(jobId)
       ] || []
     );
   }
   
   
   function findMechanicLabourEntry(labourId) {
     return Object.values(
       mechanicLabourByJob
     )
       .flat()
       .find((entry) => {
         return (
           Number(entry.id) ===
           Number(labourId)
         );
       }) || null;
   }
   
   
   function calculateMechanicLabourTotal(
     hours,
     hourlyRate
   ) {
     return Number(
       (
         Number(hours || 0) *
         Number(hourlyRate || 0)
       ).toFixed(2)
     );
   }
   
   
   /**
    * Loads the minimum job context required for a labour write.
    *
    * @param {number|string} jobId
    * @returns {Promise<object|null>}
    */
   async function findLabourJob(jobId) {
     const activeJob =
       typeof activeMechanicJobWorkspace !==
         "undefined" &&
       activeMechanicJobWorkspace?.job &&
       String(
         activeMechanicJobWorkspace.job.id
       ) === String(jobId)
         ? activeMechanicJobWorkspace.job
         : null;
   
     if (activeJob) {
       return activeJob;
     }
   
     if (
       typeof mechanicBoardJobs !==
         "undefined" &&
       Array.isArray(mechanicBoardJobs)
     ) {
       const cachedJob =
         mechanicBoardJobs.find((job) => {
           return (
             String(job.id) ===
             String(jobId)
           );
         });
   
       if (cachedJob) {
         return cachedJob;
       }
     }
   
     if (
       typeof loadMechanicJobRecord ===
       "function"
     ) {
       const loadedJob =
         await loadMechanicJobRecord(
           jobId
         );
   
       if (loadedJob) {
         return loadedJob;
       }
     }
   
     const { data, error } = await supabaseClient
       .from("job_cards")
       .select(`
         id,
         service_request_id,
         job_status
       `)
       .eq("id", Number(jobId))
       .single();
   
     if (error || !data) {
       console.error(
         "Could not load the labour job context:",
         error?.message || "Job not found."
       );
   
       return null;
     }
   
     return data;
   }
   
   
   /* =========================================================
      6. RENDER LABOUR WORKSPACE
      ========================================================= */
   
   function renderMechanicLabourWorkspace(job) {
     const entries =
       getMechanicLabourForJob(job.id);
   
     return `
       <section class="mechanic-labour-workspace">
   
         <div class="admin-detail-header">
   
           <div>
             <p class="admin-card-label">
               Labour Management
             </p>
   
             <h3>Labour Performed</h3>
   
             <p>
               Record technician labour, repair operations,
               billed hours, and labour charges for this job.
             </p>
           </div>
   
           ${
             canManageMechanicJobLabour()
               ? `
                 <button
                   type="button"
                   class="table-action-btn"
                   data-open-add-labour="${Number(job.id)}"
                 >
                   Add Labour
                 </button>
               `
               : ""
           }
   
         </div>
   
         ${
           entries.length === 0
             ? `
               <div class="card-notes">
                 <strong>No labour recorded yet</strong>
   
                 <p>
                   No structured labour entry has been added to
                   this mechanic job.
                 </p>
               </div>
             `
             : `
               ${renderMechanicLabourSummary(entries)}
               ${renderMechanicLabourTable(entries)}
             `
         }
   
       </section>
     `;
   }
   
   
   function renderMechanicLabourSummary(entries) {
     const totalHours = entries.reduce(
       (sum, entry) => {
         return (
           sum +
           Number(entry.hours || 0)
         );
       },
       0
     );
   
     const labourRevenue = entries.reduce(
       (sum, entry) => {
         return (
           sum +
           Number(
             entry.labour_total ||
             calculateMechanicLabourTotal(
               entry.hours,
               entry.hourly_rate
             )
           )
         );
       },
       0
     );
   
     return `
       <div class="workspace-info-grid">
   
         ${renderInfoCard(
           "Labour Entries",
           entries.length
         )}
   
         ${renderInfoCard(
           "Total Hours",
           totalHours.toFixed(2)
         )}
   
         ${renderInfoCard(
           "Labour Revenue",
           money(labourRevenue)
         )}
   
       </div>
     `;
   }
   
   
   function renderMechanicLabourTable(entries) {
     return `
       <div class="labour-entry-list">
   
         ${entries
           .map((entry) => {
             const labourTotal = Number(
               entry.labour_total ||
               calculateMechanicLabourTotal(
                 entry.hours,
                 entry.hourly_rate
               )
             );
   
             return `
               <article class="labour-entry-card">
   
                 <div class="labour-entry-main">
   
                   <div>
                     <span class="labour-label">
                       Technician
                     </span>
   
                     <strong>
                       ${safeText(
                         entry.technician_name,
                         "-"
                       )}
                     </strong>
                   </div>
   
                   <div>
                     <span class="labour-label">
                       Operation
                     </span>
   
                     <strong>
                       ${safeText(
                         entry.labour_operation,
                         "Labour operation"
                       )}
                     </strong>
   
                     ${
                       entry.notes
                         ? `
                           <p class="labour-notes">
                             ${safeText(entry.notes)}
                           </p>
                         `
                         : ""
                     }
                   </div>
   
                 </div>
   
                 <div class="labour-entry-metrics">
   
                   <div>
                     <span class="labour-label">
                       Hours
                     </span>
   
                     <strong>
                       ${Number(
                         entry.hours || 0
                       ).toFixed(2)}
                     </strong>
                   </div>
   
                   <div>
                     <span class="labour-label">
                       Rate
                     </span>
   
                     <strong>
                       ${money(
                         entry.hourly_rate || 0
                       )}
                     </strong>
                   </div>
   
                   <div>
                     <span class="labour-label">
                       Total
                     </span>
   
                     <strong>
                       ${money(labourTotal)}
                     </strong>
                   </div>
   
                 </div>
   
                 ${
                   canManageMechanicJobLabour()
                     ? `
                       <div class="labour-entry-actions">
   
                         <button
                           type="button"
                           class="table-action-btn labour-edit-btn"
                           data-labour-id="${Number(entry.id)}"
                         >
                           Edit
                         </button>
   
                         <button
                           type="button"
                           class="danger-action-btn labour-remove-btn"
                           data-labour-id="${Number(entry.id)}"
                         >
                           Remove
                         </button>
   
                       </div>
                     `
                     : ""
                 }
   
               </article>
             `;
           })
           .join("")}
   
       </div>
     `;
   }
   
   
   /* =========================================================
      7. MODALS
      ========================================================= */
   
   async function openAddLabourModal(jobId) {
     if (!canManageMechanicJobLabour()) {
       notifyMechanicLabour(
         "danger",
         "Access Restricted",
         "You do not have permission to add mechanic labour."
       );
   
       return;
     }
   
     if (
       typeof openAdminModal !==
       "function"
     ) {
       notifyMechanicLabour(
         "danger",
         "Modal Unavailable",
         "The admin modal framework is not loaded."
       );
   
       return;
     }
   
     if (mechanicTechnicians.length === 0) {
       await loadMechanicTechnicians();
     }
   
     openAdminModal({
       title:
         "Add Labour",
   
       subtitle:
         `JOB-${jobId}`,
   
       content:
         renderLabourForm({
           technician_name:
             currentProfile?.full_name ||
             currentProfile?.email ||
             "",
   
           labour_operation:
             "",
   
           hours:
             1,
   
           hourly_rate:
             120,
   
           notes:
             ""
         }),
   
       footer: `
         <button
           type="button"
           class="secondary-action-btn"
           onclick="closeAdminModal()"
         >
           Cancel
         </button>
   
         <button
           type="button"
           class="primary-action-btn"
           onclick="saveLabourEntry(${Number(jobId)})"
         >
           Save Labour
         </button>
       `
     });
   }
   
   
   function openEditLabourModal(labourId) {
     if (!canManageMechanicJobLabour()) {
       notifyMechanicLabour(
         "danger",
         "Access Restricted",
         "You do not have permission to edit mechanic labour."
       );
   
       return;
     }
   
     const entry =
       findMechanicLabourEntry(labourId);
   
     if (!entry) {
       notifyMechanicLabour(
         "danger",
         "Labour Entry Not Found",
         "The labour entry could not be found."
       );
   
       return;
     }
   
     if (
       typeof openAdminModal !==
       "function"
     ) {
       notifyMechanicLabour(
         "danger",
         "Modal Unavailable",
         "The admin modal framework is not loaded."
       );
   
       return;
     }
   
     openAdminModal({
       title:
         "Edit Labour",
   
       subtitle:
         safeText(
           entry.labour_operation ||
           "Labour entry"
         ),
   
       content:
         renderLabourForm(entry),
   
       footer: `
         <button
           type="button"
           class="secondary-action-btn"
           onclick="closeAdminModal()"
         >
           Cancel
         </button>
   
         <button
           type="button"
           class="primary-action-btn"
           onclick="updateLabourEntry(${Number(entry.id)})"
         >
           Save Changes
         </button>
       `
     });
   }
   
   
   function renderLabourForm(entry = {}) {
     const technicianOptions =
       getMechanicTechnicianOptions(
         entry.technician_name
       );
   
     return `
       <div class="mechanic-labour-form">
   
         <label>
           Technician
   
           <select id="labourTechnicianName">
             <option value="">
               Select technician
             </option>
   
             ${technicianOptions}
           </select>
         </label>
   
   
         <label>
           Labour Operation
   
           <input
             id="labourOperation"
             type="text"
             value="${safeText(
               entry.labour_operation || ""
             )}"
             placeholder="Example: Diagnosis, oil service, brake replacement"
           >
         </label>
   
   
         <label>
           Hours
   
           <input
             id="labourHours"
             type="number"
             min="0.25"
             step="0.25"
             value="${Number(
               entry.hours || 1
             )}"
           >
         </label>
   
   
         <label>
           Hourly Rate
   
           <input
             id="labourHourlyRate"
             type="number"
             min="0"
             step="0.01"
             value="${Number(
               entry.hourly_rate ?? 120
             )}"
           >
         </label>
   
   
         <label>
           Notes
   
           <textarea
             id="labourNotes"
             placeholder="Optional labour notes"
           >${safeText(
             entry.notes || ""
           )}</textarea>
         </label>
   
       </div>
     `;
   }
   
   
   function getMechanicTechnicianOptions(
     selectedTechnicianName = ""
   ) {
     const technicians = [
       ...mechanicTechnicians
     ];
   
     const selectedExists =
       technicians.some((technician) => {
         const technicianName =
           technician.full_name ||
           technician.email ||
           "Unnamed technician";
   
         return (
           technicianName ===
           selectedTechnicianName
         );
       });
   
     /*
       Preserve a historical technician name even if that profile
       is no longer in the active authorized-technician query.
     */
     if (
       selectedTechnicianName &&
       !selectedExists
     ) {
       technicians.unshift({
         id:
           null,
   
         full_name:
           selectedTechnicianName,
   
         email:
           "",
   
         role:
           "historical"
       });
     }
   
     return technicians
       .map((technician) => {
         const technicianName =
           technician.full_name ||
           technician.email ||
           "Unnamed technician";
   
         return `
           <option
             value="${safeText(technicianName)}"
             ${
               technicianName ===
               selectedTechnicianName
                 ? "selected"
                 : ""
             }
           >
             ${safeText(technicianName)}
             (${safeText(
               technician.role ||
               "technician"
             )})
           </option>
         `;
       })
       .join("");
   }
   
   
   /* =========================================================
      8. FORM VALUES AND VALIDATION
      ========================================================= */
   
   function getLabourFormValues() {
     return {
       technicianName:
         document.getElementById(
           "labourTechnicianName"
         )?.value.trim() || "",
   
       operation:
         document.getElementById(
           "labourOperation"
         )?.value.trim() || "",
   
       hours:
         Number(
           document.getElementById(
             "labourHours"
           )?.value || 0
         ),
   
       hourlyRate:
         Number(
           document.getElementById(
             "labourHourlyRate"
           )?.value || 0
         ),
   
       notes:
         document.getElementById(
           "labourNotes"
         )?.value.trim() || ""
     };
   }
   
   
   function validateLabourForm(values) {
     if (!values.technicianName) {
       notifyMechanicLabour(
         "warning",
         "Technician Required",
         "Select the technician who performed this labour."
       );
   
       return false;
     }
   
     if (!values.operation) {
       notifyMechanicLabour(
         "warning",
         "Operation Required",
         "Enter the labour operation before saving."
       );
   
       return false;
     }
   
     if (
       !Number.isFinite(values.hours) ||
       values.hours <= 0
     ) {
       notifyMechanicLabour(
         "warning",
         "Invalid Labour Hours",
         "Labour hours must be greater than zero."
       );
   
       return false;
     }
   
     if (
       !Number.isFinite(values.hourlyRate) ||
       values.hourlyRate < 0
     ) {
       notifyMechanicLabour(
         "warning",
         "Invalid Hourly Rate",
         "The hourly rate cannot be negative."
       );
   
       return false;
     }
   
     return true;
   }
   
   
   /* =========================================================
      9. SAVE LABOUR ENTRY
      ========================================================= */
   
   async function saveLabourEntry(jobId) {
     if (!canManageMechanicJobLabour()) {
       notifyMechanicLabour(
         "danger",
         "Access Restricted",
         "You do not have permission to add mechanic labour."
       );
   
       return;
     }
   
     const job =
       await findLabourJob(jobId);
   
     if (!job?.service_request_id) {
       notifyMechanicLabour(
         "danger",
         "Job Link Missing",
         "The mechanic job is not linked to a valid Service Request."
       );
   
       return;
     }
   
     const values =
       getLabourFormValues();
   
     if (!validateLabourForm(values)) {
       return;
     }
   
     const labourTotal =
       calculateMechanicLabourTotal(
         values.hours,
         values.hourlyRate
       );
   
     const payload = {
       job_card_id:
         Number(jobId),
   
       service_request_id:
         Number(job.service_request_id),
   
       technician_name:
         values.technicianName,
   
       labour_operation:
         values.operation,
   
       hours:
         values.hours,
   
       hourly_rate:
         values.hourlyRate,
   
       labour_total:
         labourTotal,
   
       notes:
         values.notes || null,
   
       customer_visible:
         false
     };
   
     try {
       const {
         data: createdEntry,
         error
       } = await supabaseClient
         .from("job_labour_entries")
         .insert(payload)
         .select("*")
         .single();
   
       if (error || !createdEntry) {
         throw (
           error ||
           new Error(
             "The labour entry could not be created."
           )
         );
       }
   
       const timelineResult =
         await recordMechanicLabourTimeline({
           jobId,
   
           title:
             "labour_added",
   
           message:
             `${values.operation}: ${values.hours.toFixed(2)} hour(s) recorded for ${values.technicianName} at ${formatMechanicLabourMoney(values.hourlyRate)} per hour.`,
   
           updateType:
             "labour_added"
         });
   
       if (
         typeof closeAdminModal ===
         "function"
       ) {
         closeAdminModal();
       }
   
       notifyMechanicLabour(
         timelineResult.success
           ? "success"
           : "warning",
   
         timelineResult.success
           ? "Labour Added"
           : "Labour Added With Warning",
   
         timelineResult.success
           ? "The labour entry was added to this mechanic job."
           : timelineResult.message
       );
   
       await refreshMechanicLabourDependencies();
   
     } catch (error) {
       console.error(
         "Labour entry creation failed:",
         error
       );
   
       notifyMechanicLabour(
         "danger",
         "Labour Save Failed",
         error?.message ||
         "The labour entry could not be saved."
       );
     }
   }
   
   
   /* =========================================================
      10. UPDATE LABOUR ENTRY
      ========================================================= */
   
   async function updateLabourEntry(labourId) {
     if (!canManageMechanicJobLabour()) {
       notifyMechanicLabour(
         "danger",
         "Access Restricted",
         "You do not have permission to edit mechanic labour."
       );
   
       return;
     }
   
     const entry =
       findMechanicLabourEntry(labourId);
   
     if (!entry) {
       notifyMechanicLabour(
         "danger",
         "Labour Entry Not Found",
         "The labour entry could not be found."
       );
   
       return;
     }
   
     const values =
       getLabourFormValues();
   
     if (!validateLabourForm(values)) {
       return;
     }
   
     const labourTotal =
       calculateMechanicLabourTotal(
         values.hours,
         values.hourlyRate
       );
   
     try {
       const { error } = await supabaseClient
         .from("job_labour_entries")
         .update({
           technician_name:
             values.technicianName,
   
           labour_operation:
             values.operation,
   
           hours:
             values.hours,
   
           hourly_rate:
             values.hourlyRate,
   
           labour_total:
             labourTotal,
   
           notes:
             values.notes || null,
   
           customer_visible:
             false,
   
           updated_at:
             new Date().toISOString()
         })
         .eq("id", Number(labourId));
   
       if (error) {
         throw error;
       }
   
       const timelineResult =
         await recordMechanicLabourTimeline({
           jobId:
             entry.job_card_id,
   
           title:
             "labour_updated",
   
           message:
             `${values.operation} updated to ${values.hours.toFixed(2)} hour(s) at ${formatMechanicLabourMoney(values.hourlyRate)} per hour.`,
   
           updateType:
             "labour_updated"
         });
   
       if (
         typeof closeAdminModal ===
         "function"
       ) {
         closeAdminModal();
       }
   
       notifyMechanicLabour(
         timelineResult.success
           ? "success"
           : "warning",
   
         timelineResult.success
           ? "Labour Updated"
           : "Labour Updated With Warning",
   
         timelineResult.success
           ? "The labour entry was updated successfully."
           : timelineResult.message
       );
   
       await refreshMechanicLabourDependencies();
   
     } catch (error) {
       console.error(
         "Labour entry update failed:",
         error
       );
   
       notifyMechanicLabour(
         "danger",
         "Labour Update Failed",
         error?.message ||
         "The labour entry could not be updated."
       );
     }
   }
   
   
   /* =========================================================
      11. REMOVE LABOUR ENTRY
      ========================================================= */
   
   async function removeLabourEntry(labourId) {
     if (!canManageMechanicJobLabour()) {
       notifyMechanicLabour(
         "danger",
         "Access Restricted",
         "You do not have permission to remove mechanic labour."
       );
   
       return;
     }
   
     const entry =
       findMechanicLabourEntry(labourId);
   
     if (!entry) {
       notifyMechanicLabour(
         "danger",
         "Labour Entry Not Found",
         "The labour entry could not be found."
       );
   
       return;
     }
   
     const confirmed = confirm(
       `Remove “${entry.labour_operation || "this labour entry"}” from JOB-${entry.job_card_id}?`
     );
   
     if (!confirmed) {
       return;
     }
   
     try {
       const { error } = await supabaseClient
         .from("job_labour_entries")
         .delete()
         .eq("id", Number(labourId));
   
       if (error) {
         throw error;
       }
   
       const timelineResult =
         await recordMechanicLabourTimeline({
           jobId:
             entry.job_card_id,
   
           title:
             "labour_removed",
   
           message:
             `${entry.labour_operation || "Labour entry"} (${Number(entry.hours || 0).toFixed(2)} hour(s)) was removed from JOB-${entry.job_card_id}.`,
   
           updateType:
             "labour_removed"
         });
   
       notifyMechanicLabour(
         timelineResult.success
           ? "success"
           : "warning",
   
         timelineResult.success
           ? "Labour Removed"
           : "Labour Removed With Warning",
   
         timelineResult.success
           ? "The labour entry was removed from this mechanic job."
           : timelineResult.message
       );
   
       await refreshMechanicLabourDependencies();
   
     } catch (error) {
       console.error(
         "Labour entry removal failed:",
         error
       );
   
       notifyMechanicLabour(
         "danger",
         "Labour Removal Failed",
         error?.message ||
         "The labour entry could not be removed."
       );
     }
   }
   
   
   /* =========================================================
      12. JOB TIMELINE INTEGRATION
      ========================================================= */
   
   /**
    * Creates one internal, job-specific timeline event.
    *
    * @param {object} config
    * @returns {Promise<{success:boolean,message:string}>}
    */
   async function recordMechanicLabourTimeline(
     config = {}
   ) {
     if (
       typeof recordMechanicJobTimelineEvent !==
       "function"
     ) {
       return {
         success:
           false,
   
         message:
           "The labour record was saved, but the job timeline helper is not loaded."
       };
     }
   
     const result =
       await recordMechanicJobTimelineEvent({
         jobId:
           Number(config.jobId),
   
         title:
           config.title ||
           "labour_update",
   
         message:
           config.message ||
           "A labour record was updated.",
   
         internalOnly:
           true,
   
         updateType:
           config.updateType ||
           "labour_update"
       });
   
     if (!result?.success) {
       return {
         success:
           false,
   
         message:
           result?.error?.message ||
           "The labour record was saved, but its timeline event could not be recorded."
       };
     }
   
     return {
       success:
         true,
   
       message:
         "The job timeline was updated."
     };
   }
   
   
   /* =========================================================
      13. REFRESH RELATED VIEWS
      ========================================================= */
   
   /**
    * Refreshes the labour cache and visible board totals.
    *
    * The Mechanic Job Workspace controller wraps successful
    * labour actions and refreshes the open Parts & Labour tab.
    */
   async function refreshMechanicLabourDependencies() {
     await loadMechanicLabourEngine();
   
     if (
       typeof renderMechanicBoard ===
         "function" &&
       typeof mechanicBoardJobs !==
         "undefined" &&
       Array.isArray(mechanicBoardJobs)
     ) {
       renderMechanicBoard();
     }
   }
   
   
   /* =========================================================
      14. EVENT BINDINGS
      ========================================================= */
   
   function bindMechanicLabourButtons(
     root = document
   ) {
     root
       .querySelectorAll(
         "[data-open-add-labour]"
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
             openAddLabourModal(
               button.dataset.openAddLabour
             );
           }
         );
       });
   }
   
   
   if (
     !window.__mechanicLabourDelegatedEventsBound
   ) {
     document.addEventListener(
       "click",
       function (event) {
         const editButton =
           event.target.closest(
             ".labour-edit-btn"
           );
   
         const removeButton =
           event.target.closest(
             ".labour-remove-btn"
           );
   
         if (editButton) {
           event.preventDefault();
   
           openEditLabourModal(
             editButton.dataset.labourId
           );
   
           return;
         }
   
         if (removeButton) {
           event.preventDefault();
   
           removeLabourEntry(
             removeButton.dataset.labourId
           );
         }
       }
     );
   
     window.__mechanicLabourDelegatedEventsBound =
       true;
   }
   
   
   /* =========================================================
      15. DISPLAY AND NOTIFICATION HELPERS
      ========================================================= */
   
   function formatMechanicLabourMoney(value) {
     if (
       typeof money ===
       "function"
     ) {
       return money(value);
     }
   
     return `$${Number(value || 0).toFixed(2)}`;
   }
   
   
   function notifyMechanicLabour(
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
      16. GLOBAL EXPORTS
      ========================================================= */
   
   window.loadMechanicTechnicians =
     loadMechanicTechnicians;
   
   window.loadMechanicLabourEngine =
     loadMechanicLabourEngine;
   
   window.getMechanicLabourForJob =
     getMechanicLabourForJob;
   
   window.renderMechanicLabourWorkspace =
     renderMechanicLabourWorkspace;
   
   window.renderMechanicLabourSummary =
     renderMechanicLabourSummary;
   
   window.renderMechanicLabourTable =
     renderMechanicLabourTable;
   
   window.bindMechanicLabourButtons =
     bindMechanicLabourButtons;
   
   window.openAddLabourModal =
     openAddLabourModal;
   
   window.openEditLabourModal =
     openEditLabourModal;
   
   window.saveLabourEntry =
     saveLabourEntry;
   
   window.updateLabourEntry =
     updateLabourEntry;
   
   window.removeLabourEntry =
     removeLabourEntry;
   
   window.refreshMechanicLabourDependencies =
     refreshMechanicLabourDependencies;