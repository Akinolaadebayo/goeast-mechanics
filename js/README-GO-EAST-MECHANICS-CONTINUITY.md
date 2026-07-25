# Go East Mechanics – Enterprise Project Continuity README

## Project Identity

Go East Mechanics is being developed as an enterprise dealership management system, not a simple mechanic website.

The system should scale toward:
- Service request management
- Mechanic job cards
- Customer management
- Inventory management
- Invoices
- Payments
- Reports
- Developer/admin controls
- Role-based access
- Future mobile and multi-location support

## Current Development Standard

All future updates must:
- Provide complete files, not partial snippets.
- Preserve existing working features.
- Avoid deleting functionality unless explicitly requested.
- Use modular architecture.
- Reuse components.
- Avoid duplicated code.
- Follow enterprise UI/UX patterns.
- Keep Service Requests, Mechanic Jobs, Inventory, Invoices, Payments, and Customers as connected business workflows.

## Current Main Workflow

Customer submits service request.

Service request appears in Admin Portal.

Admin/reception can:
- View request
- Update status
- Add repair updates
- Archive request
- Restore archived request
- Permanently delete only when developer access allows it

Service request can be converted into mechanic job card.

Mechanic job card appears in Mechanic Jobs.

Mechanic job contains:
- Assigned mechanic
- Repair bay
- Appointment date
- Estimated completion
- Diagnosis
- Repairs performed
- Parts used
- Labour notes
- Customer visible update
- Job status

## Current Service Request Filter Rules

The Service Request dropdown should use business-state filters:

- Active Requests
- All Active Jobs
- Ready for Pickup
- Closed Jobs
- Cancelled Jobs
- Archived Requests

Important:
- Archived requests must NOT appear in active lists.
- All Active Jobs means all non-archived records.
- Archived Requests is a separate historical view.
- Archive should remove the request from active workflow.
- Restore should return it to active workflow.
- Permanent delete should remain developer-only.

## Current Workspace Rule

There must only be ONE:

```html
<section id="workspaceContainer" class="hidden"></section>