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
       navLinks.innerHTML = `
         <a href="index.html" data-page="index.html">Home</a>
         <a href="services.html" data-page="services.html">Services</a>
         <a href="about.html" data-page="about.html">About</a>
         <a href="inventory.html" data-page="inventory.html">Inventory</a>
         <a href="contact.html" data-page="contact.html">Book Service</a>
         <a href="login.html" data-page="login.html">Login</a>
         <a href="signup.html" data-page="signup.html">Sign Up</a>
       `;
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
   
     navLinks.innerHTML = `
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
     `;
   
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