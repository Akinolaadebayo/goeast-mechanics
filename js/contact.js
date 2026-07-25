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
    bookingEmail.textContent = `${email} • Customer Account`;
  }
}

function setupGuestBookingMode() {
  savedVehicleSelect.innerHTML = `
    <option value="">Login to select a saved vehicle, or type vehicle below</option>
  `;

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
    savedVehicleSelect.innerHTML = `
      <option value="">Could not load saved vehicles</option>
    `;
    vehicleInput.required = true;
    return;
  }

  savedVehicles = data || [];

  if (savedVehicles.length === 0) {
    savedVehicleSelect.innerHTML = `
      <option value="">No saved vehicles yet. Type vehicle below.</option>
    `;
    vehicleInput.required = true;
    return;
  }

  savedVehicleSelect.innerHTML = `
    <option value="">Choose a saved vehicle</option>
    ${savedVehicles.map((vehicle) => {
      return `
        <option value="${vehicle.id}">
          ${buildVehicleLabel(vehicle)}
        </option>
      `;
    }).join("")}
  `;
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
    vehicle.license_plate ? `Plate: ${vehicle.license_plate}` : ""
  ].filter(Boolean).join(" ");
}