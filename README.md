# MedSystem

**Author:** Kondwani Phiri

**SIN:** 21163650

Hospital management assignment built with Express, MySQL, EJS and jQuery. The original pages and POST /database/action contract are preserved. The /api routes share the same validated handlers.

## Setup

1. Install a supported Node.js release and MySQL with InnoDB tables.
2. Run npm install (PowerShell users can use npm.cmd).
3. Copy .env.example to .env and configure database credentials and a random SESSION_SECRET.
4. For a new installation, run npm run init-db. Set ADMIN_PASSWORD to a password of at least 12 characters, or use the generated password printed by setup. Setup does not reset existing accounts.
5. For an existing database, run npm run migrate-passwords to hash all stored passwords without changing credentials. Successful logins also automatically upgrade individual legacy passwords.
6. Run npm run setup-pharmacy to add the inventory table and account role column. Use npm run setup-pharmacy -- --sample to add five sample medicines and a doctor account (the generated password is printed once).
7. Run npm start and open http://localhost:3000 (or your configured PORT).

## Behavior and security

- Login checks credentials on the server. Responses never include passwords. Passwords use salted scrypt hashes.
- Protected pages and both API styles require a server session. Login rotates the session identifier; logout destroys it.
- Every POST requires an X-CSRF-Token header. Pages expose the current token in the csrf-token meta element; common.js attaches it automatically. API clients must first GET / with a cookie jar, then send the token and session cookie. After login, GET /home for the regenerated session's token.
- Login is limited to 15 attempts per IP per 15 minutes.
- All record operations use parameterized SQL, validation and meaningful HTTP errors. An unknown legacy action returns 400.
- Dynamic HTML is escaped; simple detail fields use textContent. Frontend calls use relative URLs.
- Doctor and nurse assignments verify the staff member's position. Ward assignment transactions lock the patient and ward, reject existing assignments and enforce capacity. Ward occupancy is calculated from actual assignment rows.
- Only the account named admin can create users. Administrators can choose Staff or Doctor when creating an account. Pharmacy inventory is restricted to Doctor accounts and administrators on both pages and API routes. Existing accounts default to Staff when the pharmacy migration adds the role column.
- The Add User form now saves accounts instead of displaying a simulated success message. New passwords require at least 12 characters.

## Legacy actions

POST /database/action accepts action plus the original form fields:

| Actions | Purpose |
| --- | --- |
| login, logout | Session authentication; login requires username and password |
| fetchp, fetche, fetchw | Patients, staff and wards |
| addp, updatep, deletep | Patient operations |
| adde, updatee, deletee | Staff operations |
| fetchd-p, fetchn-w, fetchp-w | Assignment lists |
| addd-p, addn-w, addp-w | Assign doctor, nurse or ward |
| appp, appd, appn | Patient, doctor or nurse relationships |
| add-user | Administrator-only account creation |

Responses retain data and message fields, with an additional success flag. The login action now accepts credentials and returns only the signed-in user's public information; fetching the credential table is intentionally unsupported. Earlier API examples without sessions or CSRF headers are obsolete.

## Additional improvements

- The home page shows live patient and staff totals, patients without wards, and ward occupancy and availability. Refresh updates the overview without reloading the page.
- Change your password from the home page using your current password and a new password of at least 12 characters. A successful change signs out the current session; other existing sessions are unaffected.
- The appointments page has independent patient and staff searches, full-name matching, 15-row client-side pagination, keyboard selection, loading messages and empty states. Assignment details load together and include wards with no assigned doctor or patient.
- Remove a doctor-patient, nurse-ward or patient-ward assignment from its detail panel. Confirmation is required; removing an assignment preserves the underlying patient, staff member and ward records. Nurse assignments are managed from the nurse's staff detail panel.
- Add/edit forms share validation and busy-state handling. Update and Delete remain disabled until edit mode is enabled and a full, valid record ID is selected. Repeated clicks cannot submit duplicate requests while a save is pending. Optional fields can be left blank.
- Other pages have dashboard navigation, visible keyboard focus, and responsive layout adjustments. Staff management links are available to all authenticated staff, consistent with the current server permissions; account creation remains administrator-only.

Additional legacy actions are `dashboard`, `change-password`, `removed-p`, `removen-w`, and `removep-w`. Removal requires the assignment's `id`. Password changes require `currentPassword` and `newPassword`. The corresponding `/api` paths are `/dashboard`, `/change-password`, `/remove-doctor-patient`, `/remove-nurse-ward`, and `/remove-patient-ward`.

## Pharmacy inventory

Open /pharmacy from the dashboard using a Doctor or administrator account. Search by medicine or strength, filter stock status, add medicines, and restock or issue a specified quantity. Stock adjustments are atomic, cannot make stock negative, and cannot issue expired medicines. This simple inventory tracks one expiry date per medicine and strength; it does not manage separate batches, prescriptions or sales.

Legacy actions: pharmacy-list, pharmacy-add, pharmacy-adjust. Matching /api paths are available. Adding requires name, strength, unit, quantity, minimumStock and optional expiryDate (YYYY-MM-DD). Adjusting requires id and a nonzero signed integer change (positive restocks, negative issues).

The mysql2 driver supports the installed MySQL 8 authentication method. The legacy callback query style is preserved. Setup information is consolidated here; obsolete duplicate installation/API guides and unrelated C++ test files were removed.

## Test coverage

Run npm test. Tests cover password hashing, migration on login, session rotation, protected pages and both APIs, logout, CSRF rejection, input validation, parameterized values, missing records, HTML escaping, template scripts and ward transaction commit/rollback paths. HTTP tests use a mocked database; run against a configured MySQL installation to verify actual schema compatibility and concurrent database behavior.

## Deployment limits

This assignment retains Express's in-memory session store and an in-memory login limiter. Sessions and rate counters reset on restart and do not coordinate across multiple processes. Use a shared persistent session store and limiter before a multi-instance deployment. Production requires HTTPS and a SESSION_SECRET of at least 32 characters. Set TRUST_PROXY=1 only behind a trusted reverse proxy. Review existing duplicate or invalid assignments before using the improved ward rules; historical rows are not deleted or repaired automatically.

## Zambian sample records

Patient and staff names, plot addresses, phone numbers and staff references in the screenshot dataset are fictional. They use Zambian towns and provinces, with NHIMA, private insurance and self-paying examples. Run `node scripts/seed-zambian-records.js --replace` to replace patient, staff, ward and relationship records in one transaction. This deliberately deletes those current records while retaining login accounts and pharmacy inventory.
