/* =========================================================
   CUSTOMER VEHICLES MODULE
   File: js/customer-vehicles.js

   Purpose:
   - Loads vehicles belonging to the authenticated customer.
   - Allows a customer to register a vehicle.
   - Displays the customer's active vehicles.
   - Allows a customer to remove a vehicle from the garage
     by changing its status to inactive.

   Security:
   - Every query is restricted by customer_id.
   - Supabase Row Level Security remains the final authority.
   - No service-role or secret key is used in this browser file.
   ========================================================= */


/* =========================================================
   1. PAGE ELEMENT REFERENCES
   ========================================================= */

   const customerVehiclesContainer =
   document.getElementById("customerVehicles");
 
 const customerVehicleForm =
   document.getElementById("vehicleForm");
 
 const customerVehicleYear =
   document.getElementById("vehicleYear");
 
 const customerVehicleMake =
   document.getElementById("vehicleMake");
 
 const customerVehicleModel =
   document.getElementById("vehicleModel");
 
 const customerVehicleTrim =
   document.getElementById("vehicleTrim");
 
 const customerVehiclePlate =
   document.getElementById("vehiclePlate");
 
 const customerVehicleVin =
   document.getElementById("vehicleVin");
 
 const customerVehicleMileage =
   document.getElementById("vehicleMileage");
 
 const customerVehicleNotes =
   document.getElementById("vehicleNotes");
 
 
 /* =========================================================
    2. MODULE STATE
    ========================================================= */
 
 let customerVehicleRecords = [];
 let customerVehicleSaving = false;
 
 
 /* =========================================================
    3. SAFE TEXT HELPERS
    ========================================================= */
 
 function escapeCustomerVehicleHtml(value) {
   return String(value ?? "")
     .replaceAll("&", "&amp;")
     .replaceAll("<", "&lt;")
     .replaceAll(">", "&gt;")
     .replaceAll('"', "&quot;")
     .replaceAll("'", "&#039;");
 }
 
 function cleanCustomerVehicleValue(value) {
   const cleanedValue = String(value ?? "").trim();
 
   return cleanedValue || null;
 }
 
 function formatCustomerVehicleDate(value) {
   if (!value) return "Not available";
 
   const date = new Date(value);
 
   if (Number.isNaN(date.getTime())) {
     return "Not available";
   }
 
   return date.toLocaleDateString("en-CA", {
     year: "numeric",
     month: "short",
     day: "numeric",
   });
 }
 
 
 /* =========================================================
    4. AUTHENTICATED CUSTOMER HELPER
    ========================================================= */
 
 function getAuthenticatedCustomerId() {
   /*
     currentUser is established by js/customer.js before the
     dashboard modules are loaded.
   */
 
   if (
     typeof currentUser === "undefined" ||
     !currentUser ||
     !currentUser.id
   ) {
     return null;
   }
 
   return currentUser.id;
 }
 
 
 /* =========================================================
    5. VEHICLE DISPLAY HELPERS
    ========================================================= */
 
 function getCustomerVehicleTitle(vehicle) {
   const titleParts = [
     vehicle.year,
     vehicle.make,
     vehicle.model,
   ].filter(Boolean);
 
   return titleParts.join(" ") || "Registered Vehicle";
 }
 
 function getCustomerVehicleSubtitle(vehicle) {
   const subtitleParts = [];
 
   if (vehicle.trim) {
     subtitleParts.push(vehicle.trim);
   }
 
   if (vehicle.license_plate) {
     subtitleParts.push(
       `Plate: ${String(vehicle.license_plate).toUpperCase()}`
     );
   }
 
   return subtitleParts.join(" • ") || "Vehicle record";
 }
 
 
 /* =========================================================
    6. LOAD CUSTOMER VEHICLES
    ========================================================= */
 
 async function loadCustomerVehicles() {
   if (!customerVehiclesContainer) return;
 
   const customerId = getAuthenticatedCustomerId();
 
   if (!customerId) {
     customerVehiclesContainer.innerHTML = `
       <p class="empty-message">
         Your customer session is not available. Please sign in again.
       </p>
     `;
 
     return;
   }
 
   customerVehiclesContainer.innerHTML = `
     <p class="empty-message">Loading vehicles...</p>
   `;
 
   const { data, error } = await supabaseClient
     .from("vehicles")
     .select(`
       id,
       customer_id,
       year,
       make,
       model,
       trim,
       vin,
       license_plate,
       color,
       mileage,
       notes,
       status,
       created_at,
       updated_at
     `)
     .eq("customer_id", customerId)
     .order("created_at", { ascending: false });
 
   if (error) {
     console.error("Customer vehicle loading error:", error);
 
     customerVehiclesContainer.innerHTML = `
       <p class="empty-message">
         Could not load your vehicles:
         ${escapeCustomerVehicleHtml(error.message)}
       </p>
     `;
 
     return;
   }
 
   customerVehicleRecords = (data || []).filter((vehicle) => {
     return String(vehicle.status || "active").toLowerCase() !== "inactive";
   });
 
   renderCustomerVehicles();
 }
 
 
 /* =========================================================
    7. RENDER CUSTOMER VEHICLES
    ========================================================= */
 
 function renderCustomerVehicles() {
   if (!customerVehiclesContainer) return;
 
   if (customerVehicleRecords.length === 0) {
     customerVehiclesContainer.innerHTML = `
       <div class="empty-message">
         <strong>No vehicles registered yet.</strong>
         <p>
           Complete the form above to add your first vehicle.
         </p>
       </div>
     `;
 
     return;
   }
 
   customerVehiclesContainer.innerHTML =
     customerVehicleRecords
       .map((vehicle) => {
         const title = getCustomerVehicleTitle(vehicle);
         const subtitle = getCustomerVehicleSubtitle(vehicle);
 
         return `
           <article
             class="request-card customer-vehicle-card"
             data-customer-vehicle-id="${escapeCustomerVehicleHtml(vehicle.id)}"
           >
             <div class="card-top">
               <div>
                 <h3>${escapeCustomerVehicleHtml(title)}</h3>
 
                 <p>
                   ${escapeCustomerVehicleHtml(subtitle)}
                 </p>
               </div>
 
               <span class="status-badge status-active">
                 Active
               </span>
             </div>
 
             <div class="card-grid">
               <p>
                 <strong>Year</strong><br>
                 ${escapeCustomerVehicleHtml(vehicle.year || "Not provided")}
               </p>
 
               <p>
                 <strong>Make</strong><br>
                 ${escapeCustomerVehicleHtml(vehicle.make || "Not provided")}
               </p>
 
               <p>
                 <strong>Model</strong><br>
                 ${escapeCustomerVehicleHtml(vehicle.model || "Not provided")}
               </p>
 
               <p>
                 <strong>Trim</strong><br>
                 ${escapeCustomerVehicleHtml(vehicle.trim || "Not provided")}
               </p>
 
               <p>
                 <strong>License Plate</strong><br>
                 ${escapeCustomerVehicleHtml(
                   vehicle.license_plate
                     ? String(vehicle.license_plate).toUpperCase()
                     : "Not provided"
                 )}
               </p>
 
               <p>
                 <strong>VIN</strong><br>
                 ${escapeCustomerVehicleHtml(
                   vehicle.vin
                     ? String(vehicle.vin).toUpperCase()
                     : "Not provided"
                 )}
               </p>
 
               <p>
                 <strong>Mileage</strong><br>
                 ${escapeCustomerVehicleHtml(
                   vehicle.mileage || "Not provided"
                 )}
               </p>
 
               <p>
                 <strong>Added</strong><br>
                 ${escapeCustomerVehicleHtml(
                   formatCustomerVehicleDate(vehicle.created_at)
                 )}
               </p>
             </div>
 
             ${
               vehicle.notes
                 ? `
                   <div class="card-notes">
                     <strong>Vehicle Notes</strong>
 
                     <p>
                       ${escapeCustomerVehicleHtml(vehicle.notes)}
                     </p>
                   </div>
                 `
                 : ""
             }
 
             <div class="card-actions">
               <button
                 type="button"
                 class="table-action-btn danger"
                 data-remove-customer-vehicle="${escapeCustomerVehicleHtml(
                   vehicle.id
                 )}"
               >
                 Remove from Garage
               </button>
             </div>
           </article>
         `;
       })
       .join("");
 }
 
 
 /* =========================================================
    8. CREATE CUSTOMER VEHICLE
    ========================================================= */
 
 async function saveCustomerVehicle(event) {
   event.preventDefault();
 
   if (customerVehicleSaving) return;
 
   const customerId = getAuthenticatedCustomerId();
 
   if (!customerId) {
     alert("Your customer session has expired. Please sign in again.");
     return;
   }
 
   const model = cleanCustomerVehicleValue(
     customerVehicleModel?.value
   );
 
   if (!model) {
     alert("Please enter the vehicle model.");
     customerVehicleModel?.focus();
     return;
   }
 
   const payload = {
     customer_id: customerId,
 
     year: cleanCustomerVehicleValue(
       customerVehicleYear?.value
     ),
 
     make: cleanCustomerVehicleValue(
       customerVehicleMake?.value
     ),
 
     model,
 
     trim: cleanCustomerVehicleValue(
       customerVehicleTrim?.value
     ),
 
     license_plate: cleanCustomerVehicleValue(
       customerVehiclePlate?.value
     )
       ? customerVehiclePlate.value.trim().toUpperCase()
       : null,
 
     vin: cleanCustomerVehicleValue(
       customerVehicleVin?.value
     )
       ? customerVehicleVin.value.trim().toUpperCase()
       : null,
 
     mileage: cleanCustomerVehicleValue(
       customerVehicleMileage?.value
     ),
 
     notes: cleanCustomerVehicleValue(
       customerVehicleNotes?.value
     ),
 
     status: "active",
     updated_at: new Date().toISOString(),
   };
 
   const submitButton =
     customerVehicleForm?.querySelector('button[type="submit"]');
 
   customerVehicleSaving = true;
 
   if (submitButton) {
     submitButton.disabled = true;
     submitButton.textContent = "Adding Vehicle...";
   }
 
   try {
     const { error } = await supabaseClient
       .from("vehicles")
       .insert([payload]);
 
     if (error) {
       throw error;
     }
 
     customerVehicleForm.reset();
 
     await loadCustomerVehicles();
 
     alert("Vehicle added successfully.");
   } catch (error) {
     console.error("Customer vehicle creation error:", error);
 
     alert(
       `Could not add vehicle: ${
         error?.message || "Unknown database error"
       }`
     );
   } finally {
     customerVehicleSaving = false;
 
     if (submitButton) {
       submitButton.disabled = false;
       submitButton.textContent = "Add Vehicle";
     }
   }
 }
 
 
 /* =========================================================
    9. REMOVE VEHICLE FROM CUSTOMER GARAGE
 
    This does not permanently delete the database record.
    It changes the vehicle status to inactive.
    ========================================================= */
 
 async function removeCustomerVehicle(vehicleId) {
   const customerId = getAuthenticatedCustomerId();
 
   if (!customerId) {
     alert("Your customer session has expired. Please sign in again.");
     return;
   }
 
   const vehicle = customerVehicleRecords.find((record) => {
     return String(record.id) === String(vehicleId);
   });
 
   const vehicleTitle = vehicle
     ? getCustomerVehicleTitle(vehicle)
     : "this vehicle";
 
   const confirmed = window.confirm(
     `Remove ${vehicleTitle} from your garage?`
   );
 
   if (!confirmed) return;
 
   const { error } = await supabaseClient
     .from("vehicles")
     .update({
       status: "inactive",
       updated_at: new Date().toISOString(),
     })
     .eq("id", vehicleId)
     .eq("customer_id", customerId);
 
   if (error) {
     console.error("Customer vehicle removal error:", error);
 
     alert(`Could not remove vehicle: ${error.message}`);
     return;
   }
 
   await loadCustomerVehicles();
 }
 
 
 /* =========================================================
    10. EVENT BINDINGS
    ========================================================= */
 
 function bindCustomerVehicleEvents() {
   if (
     customerVehicleForm &&
     !window.__customerVehicleFormBound
   ) {
     customerVehicleForm.addEventListener(
       "submit",
       saveCustomerVehicle
     );
 
     window.__customerVehicleFormBound = true;
   }
 
   if (!window.__customerVehicleActionsBound) {
     document.addEventListener("click", async function (event) {
       const removeButton = event.target.closest(
         "[data-remove-customer-vehicle]"
       );
 
       if (!removeButton) return;
 
       event.preventDefault();
 
       await removeCustomerVehicle(
         removeButton.dataset.removeCustomerVehicle
       );
     });
 
     window.__customerVehicleActionsBound = true;
   }
 }
 
 
 /* =========================================================
    11. INITIALIZATION
    ========================================================= */
 
 bindCustomerVehicleEvents();
 
 
 /* =========================================================
    12. GLOBAL EXPORTS
 
    js/customer.js calls loadCustomerVehicles after confirming
    the customer's session.
    ========================================================= */
 
 window.loadCustomerVehicles = loadCustomerVehicles;
 window.renderCustomerVehicles = renderCustomerVehicles;
 window.saveCustomerVehicle = saveCustomerVehicle;
 window.removeCustomerVehicle = removeCustomerVehicle;