/* =========================================================
   ADMIN WORKSPACE SHELL
   File: js/admin-workspace-shell.js

   Sprint: Mechanic Job Workspace and Synchronization

   Purpose:
   Controls opening and closing reusable enterprise workspaces.

   Major Upgrade:
   The shell now supports more than one workspace container:
   - #workspaceContainer for Service Requests
   - #jobWorkspaceContainer for Mechanic Jobs

   Responsibilities:
   - Render a workspace inside the selected container.
   - Hide the source list and toolbar without destroying state.
   - Preserve the previous page scroll position.
   - Restore hidden source elements when the workspace closes.
   - Support a controlled onClose callback.
   - Close safely when staff navigate to another admin section.
   ========================================================= */


/* =========================================================
   1. WORKSPACE STATE
   ========================================================= */

   let activeWorkspaceState =
   createEmptyWorkspaceState();
 
 
 /**
  * Returns a clean workspace-state object.
  *
  * Only one enterprise workspace can be active at a time.
  *
  * @returns {object}
  */
 function createEmptyWorkspaceState() {
   return {
     isOpen: false,
     module: null,
     containerId: null,
     container: null,
     ownerSectionId: null,
     ownerSection: null,
     hiddenElements: [],
     previousScrollY: 0,
     onClose: null
   };
 }
 
 
 /* =========================================================
    2. GET A WORKSPACE CONTAINER
    ========================================================= */
 
 /**
  * Returns the requested workspace container.
  *
  * Defaults to the Service Request workspace container.
  *
  * @param {string} containerId
  * @returns {HTMLElement|null}
  */
 function getWorkspaceContainer(
   containerId = "workspaceContainer"
 ) {
   return document.getElementById(
     containerId
   );
 }
 
 
 /* =========================================================
    3. HIDE NORMAL MODULE ELEMENTS
    ========================================================= */
 
 /**
  * Temporarily hides source-module elements while a workspace
  * is open.
  *
  * The elements are not removed from the DOM. This preserves:
  * - Search values
  * - Selected filters
  * - Loaded table records
  * - Horizontal scroll positions
  * - Existing module state
  *
  * @param {HTMLElement|null} ownerSection
  * @param {string[]} selectors
  * @returns {HTMLElement[]}
  */
 function hideWorkspaceSourceElements(
   ownerSection,
   selectors = []
 ) {
   const hiddenElements = [];
 
 
   if (
     !ownerSection ||
     !Array.isArray(selectors)
   ) {
     return hiddenElements;
   }
 
 
   selectors.forEach((selector) => {
     let matches = [];
 
 
     try {
       matches =
         ownerSection.querySelectorAll(
           selector
         );
 
     } catch (error) {
       console.error(
         `Invalid workspace hide selector: ${selector}`,
         error
       );
 
       return;
     }
 
 
     matches.forEach((element) => {
       /*
         Never hide either workspace container.
       */
       if (
         element.id ===
           "workspaceContainer" ||
 
         element.id ===
           "jobWorkspaceContainer"
       ) {
         return;
       }
 
 
       element.classList.add(
         "workspace-source-hidden"
       );
 
 
       hiddenElements.push(
         element
       );
     });
   });
 
 
   return hiddenElements;
 }
 
 
 /* =========================================================
    4. RESTORE HIDDEN MODULE ELEMENTS
    ========================================================= */
 
 /**
  * Restores every source element hidden by the active
  * workspace.
  *
  * @param {object} state
  */
 function restoreWorkspaceSourceElements(
   state = activeWorkspaceState
 ) {
   state.hiddenElements.forEach(
     (element) => {
       if (
         element &&
         document.body.contains(element)
       ) {
         element.classList.remove(
           "workspace-source-hidden"
         );
       }
     }
   );
 
 
   state.hiddenElements = [];
 }
 
 
 /* =========================================================
    5. OPEN WORKSPACE
    ========================================================= */
 
 /**
  * Opens a reusable enterprise workspace.
  *
  * Supported configuration:
  * - containerId
  * - module
  * - ownerSectionId
  * - hideSelectors
  * - kicker
  * - title
  * - subtitle
  * - actions
  * - context
  * - toolbar
  * - tabs
  * - onClose
  *
  * @param {object} config
  * @returns {boolean}
  */
 function openWorkspace(config = {}) {
   const containerId =
     config.containerId ||
     "workspaceContainer";
 
 
   const container =
     getWorkspaceContainer(
       containerId
     );
 
 
   if (!container) {
     console.error(
       `Workspace could not open because #${containerId} was not found.`
     );
 
 
     if (
       typeof showToast ===
       "function"
     ) {
       showToast(
         "error",
         "Workspace Error",
         `The workspace container #${containerId} could not be found.`
       );
     }
 
 
     return false;
   }
 
 
   if (
     typeof renderWorkspace !==
     "function"
   ) {
     console.error(
       "renderWorkspace() is not available."
     );
 
 
     if (
       typeof showToast ===
       "function"
     ) {
       showToast(
         "error",
         "Workspace Error",
         "The shared workspace component is not loaded."
       );
     }
 
 
     return false;
   }
 
 
   /*
     Only one enterprise workspace may be active at a time.
 
     When a new workspace intentionally replaces an existing
     one, the former workspace closes without calling its
     return callback.
   */
   if (
     activeWorkspaceState.isOpen
   ) {
     closeWorkspace({
       restoreScroll: false,
       skipOnClose: true
     });
   }
 
 
   const ownerSectionId =
     config.ownerSectionId ||
 
     container.closest(
       ".admin-section"
     )?.id ||
 
     null;
 
 
   const ownerSection =
     ownerSectionId
       ? document.getElementById(
           ownerSectionId
         )
       : container.closest(
           ".admin-section"
         );
 
 
   activeWorkspaceState = {
     isOpen: true,
 
     module:
       config.module ||
       null,
 
     containerId,
 
     container,
 
     ownerSectionId,
 
     ownerSection,
 
     hiddenElements: [],
 
     previousScrollY:
       window.scrollY,
 
     onClose:
       typeof config.onClose ===
         "function"
         ? config.onClose
         : null
   };
 
 
   /*
     Hide the normal source interface while preserving its
     current state.
   */
   if (ownerSection) {
     ownerSection.classList.add(
       "workspace-open"
     );
 
 
     activeWorkspaceState
       .hiddenElements =
         hideWorkspaceSourceElements(
           ownerSection,
           config.hideSelectors || []
         );
   }
 
 
   /*
     Render the reusable workspace component.
   */
   container.innerHTML =
     renderWorkspace(config);
 
 
   container.classList.remove(
     "hidden"
   );
 
 
   container.classList.add(
     "workspace-container-active"
   );
 
 
   container.dataset.workspaceModule =
     config.module ||
     "workspace";
 
 
   /*
     Connect the reusable tab controller.
   */
   if (
     typeof bindWorkspaceTabs ===
     "function"
   ) {
     bindWorkspaceTabs(
       container
     );
   }
 
 
   /*
     Bring the opened workspace into view.
   */
   requestAnimationFrame(() => {
     container.scrollIntoView({
       behavior: "auto",
       block: "start"
     });
   });
 
 
   return true;
 }
 
 
 /* =========================================================
    6. CLOSE WORKSPACE
    ========================================================= */
 
 /**
  * Closes the active enterprise workspace.
  *
  * Options:
  * - restoreScroll:
  *   Returns the user to the position held before opening.
  *
  * - skipOnClose:
  *   Prevents the registered close callback from running.
  *   Used when one workspace is intentionally replacing another.
  *
  * @param {object} options
  */
 function closeWorkspace(options = {}) {
   const {
     restoreScroll = true,
     skipOnClose = false
   } = options;
 
 
   if (
     !activeWorkspaceState.isOpen
   ) {
     return;
   }
 
 
   /*
     Preserve a copy before resetting global state.
   */
   const closingState =
     activeWorkspaceState;
 
 
   const previousScrollY =
     closingState.previousScrollY ||
     0;
 
 
   restoreWorkspaceSourceElements(
     closingState
   );
 
 
   if (
     closingState.ownerSection
   ) {
     closingState.ownerSection
       .classList.remove(
         "workspace-open"
       );
   }
 
 
   if (
     closingState.container
   ) {
     closingState.container.innerHTML =
       "";
 
 
     closingState.container.classList.add(
       "hidden"
     );
 
 
     closingState.container.classList.remove(
       "workspace-container-active"
     );
 
 
     delete closingState
       .container
       .dataset
       .workspaceModule;
   }
 
 
   activeWorkspaceState =
     createEmptyWorkspaceState();
 
 
   if (restoreScroll) {
     requestAnimationFrame(() => {
       window.scrollTo({
         top: previousScrollY,
         left: 0,
         behavior: "auto"
       });
     });
   }
 
 
   /*
     Run the workspace-specific return workflow only after
     the shared shell has finished cleaning up.
   */
   if (
     !skipOnClose &&
     closingState.onClose
   ) {
     closingState.onClose();
   }
 }
 
 
 /* =========================================================
    7. WORKSPACE INSPECTION HELPERS
    ========================================================= */
 
 /**
  * Determines whether an enterprise workspace is open.
  *
  * Passing a module name checks for that specific workspace.
  *
  * @param {string|null} moduleName
  * @returns {boolean}
  */
 function isWorkspaceOpen(
   moduleName = null
 ) {
   if (
     !activeWorkspaceState.isOpen
   ) {
     return false;
   }
 
 
   if (!moduleName) {
     return true;
   }
 
 
   return (
     activeWorkspaceState.module ===
     moduleName
   );
 }
 
 
 /**
  * Returns a protected copy of the current workspace state.
  *
  * @returns {object}
  */
 function getActiveWorkspaceState() {
   return {
     ...activeWorkspaceState,
 
     hiddenElements: [
       ...activeWorkspaceState
         .hiddenElements
     ]
   };
 }
 
 
 /* =========================================================
    8. CLOSE WHEN NAVIGATING TO ANOTHER SECTION
    ========================================================= */
 
 /*
   Example:
 
   A mechanic workspace is open and the user selects Inventory.
   The workspace must close without returning to its previous
   Service Request.
 */
 if (
   !window.__workspaceNavigationListenerBound
 ) {
   document.addEventListener(
     "click",
     function (event) {
       const navigationButton =
         event.target.closest(
           ".nav-btn[data-section]"
         );
 
 
       if (
         !navigationButton ||
         !activeWorkspaceState.isOpen
       ) {
         return;
       }
 
 
       const destinationSection =
         navigationButton.dataset.section;
 
 
       if (
         destinationSection &&
 
         destinationSection !==
           activeWorkspaceState
             .ownerSectionId
       ) {
         closeWorkspace({
           restoreScroll: false,
           skipOnClose: true
         });
       }
     }
   );
 
 
   window.__workspaceNavigationListenerBound =
     true;
 }
 
 
 /* =========================================================
    9. ESCAPE KEY SUPPORT
    ========================================================= */
 
 /*
   Escape closes the active workspace unless an admin modal
   currently owns the keyboard interaction.
 */
 if (
   !window.__workspaceEscapeListenerBound
 ) {
   document.addEventListener(
     "keydown",
     function (event) {
       const modalIsOpen =
         Boolean(
           document.getElementById(
             "adminModalBackdrop"
           )
         );
 
 
       if (
         event.key ===
           "Escape" &&
 
         activeWorkspaceState.isOpen &&
 
         !modalIsOpen
       ) {
         closeWorkspace();
       }
     }
   );
 
 
   window.__workspaceEscapeListenerBound =
     true;
 }
 
 
 /* =========================================================
    10. GLOBAL EXPORTS
    ========================================================= */
 
 window.openWorkspace =
   openWorkspace;
 
 
 window.closeWorkspace =
   closeWorkspace;
 
 
 window.isWorkspaceOpen =
   isWorkspaceOpen;
 
 
 window.getActiveWorkspaceState =
   getActiveWorkspaceState;
 
 
 window.getWorkspaceContainer =
   getWorkspaceContainer;