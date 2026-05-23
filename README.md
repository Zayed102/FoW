# friendshipOnWheels — Prototype

Live demo: https://fow-six.vercel.app/login

## Stack

Vite + React + Tailwind. No backend. Mock data in src/data.

## Run locally

```
npm install
npm run dev
```

Production preview:

```
npm run build && npm run preview
```

## Roles in the demo

Open the app and you will see the login screen. Choose **Login as Coordinator** or **Login as Volunteer**, enter any username and password (there is no validation), and click **Login**. You will be taken to the appropriate dashboard. To switch roles, click the **Log out** button in the top-right of the header and log in again with the other role.

## Requirements traceability

| Requirement | Screen |
| --- | --- |
| View chronological requests | Coordinator > Dashboard |
| Filter unassigned | Coordinator > Dashboard (status chips) |
| Allocate volunteer with history + availability | Coordinator > Request Detail |
| Notify volunteer on allocation | Toast + Notification bell |
| Reassign uncovered visit | Coordinator > Reassignment |
| Stage 2: district scoping | Header > District filter |
| Stage 2: visit outcome recording | Volunteer > Visit Detail > Outcome modal |
| Stage 2: welfare alerts | Dashboard banner + Notifications > Welfare tab |
| Update availability (default/current/next week) | Volunteer > Schedule |
| View upcoming + past visits | Volunteer > Visit List |
| Update visit status | Volunteer > Visit Detail |
| Cancel assigned visit | Volunteer > Visit Detail |
| Role-based login / logout | Login pages + header Log out |
| Requestor + volunteer characteristics | Coordinator > Request Detail + volunteer profile modal |
| Suburb-preference matching | Coordinator > Request Detail (candidate ranking) |
| Volunteer suburb preference ranking | Volunteer > My Schedule |
| Coordinator district + date filtering | Coordinator > Dashboard filters |
| Delivery route / map | Volunteer > Visit Detail > Route |

