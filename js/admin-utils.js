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
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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