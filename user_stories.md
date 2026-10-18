# User Story Template

**Title:**
_As a [user role], I want [feature/goal], so that [reason]._

**Acceptance Criteria:**
1. [Criteria 1]
2. [Criteria 2]
3. [Criteria 3]

**Priority:** [High/Medium/Low]
**Story Points:** [Estimated Effort in Points]
**Notes:**
- [Additional information or edge cases]

---

# ADMIN USER STORIES

## Admin Story 1 — Log into the portal

**Title:**
_As an admin, I want to log into the portal with my username and password, so that I can manage the Smart Clinic platform securely._

**Acceptance Criteria:**
1. The login page is accessible at `/login` and shared with doctor/patient roles.
2. The form requires both `username` and `password` fields.
3. Credentials are validated against the `admin` table in MySQL.
4. Passwords are stored hashed with BCrypt.
5. On success, a JWT is issued and returned in the response body.

**Priority:** High
**Story Points:** 5
**Notes:**
- Backend: `AdminController` → `Service.validateAdmin` → `TokenService.generateToken`.
- Returns 401 Unauthorized on invalid credentials.

## Admin Story 2 — Log out

**Title:**
_As an admin, I want to log out of the portal, so that I can protect system access when I leave my workstation._

**Acceptance Criteria:**
1. A visible "Logout" button/link exists in the admin dashboard.
2. Clicking logout invalidates the current JWT and clears the session.
3. The user is redirected to the login page (`/`).
4. Accessing protected pages after logout returns 401 Unauthorized.

**Priority:** High
**Story Points:** 2
**Notes:**
- Frontend: `header.js` → `logout()` clears `localStorage.token` and `userRole`.

## Admin Story 3 — Add doctors

**Title:**
_As an admin, I want to add new doctors to the portal, so that they can be assigned to patients and appointments._

**Acceptance Criteria:**
1. An "Add Doctor" form is accessible from the admin dashboard.
2. Required fields: first name, last name, email, phone, specialty, license number.
3. Email and license number must be unique.
4. Validation annotations (`@NotNull`, `@Email`, `@Size`, `@Pattern`) are applied.
5. On submit, the doctor is persisted to the `doctor` table in MySQL.
6. A success confirmation is shown and the doctor appears in the list.

**Priority:** High
**Story Points:** 5
**Notes:**
- Backend: `DoctorController.saveDoctor` → `DoctorService.saveDoctor` → `DoctorRepository`.
- Frontend: `modals.js` (addDoctor) + `adminDashboard.js` (adminAddDoctor).

## Admin Story 4 — Delete doctor profile

**Title:**
_As an admin, I want to delete a doctor's profile from the portal, so that I can remove doctors who no longer work at the clinic._

**Acceptance Criteria:**
1. Each doctor card has a "Delete" action.
2. A confirmation dialog is shown before deletion.
3. Deleting a doctor also removes their appointments.
4. Soft delete is preferred (set `active = false`).
5. An audit log entry is created for the deletion.

**Priority:** Medium
**Story Points:** 5
**Notes:**
- Backend: `DoctorController.deleteDoctor` → `DoctorService.deleteDoctor` → `appointmentRepository.deleteAllByDoctorId` + `doctorRepository.delete`.

## Admin Story 5 — Monthly appointment report

**Title:**
_As an admin, I want to run a stored procedure in MySQL CLI that returns the number of appointments per month, so that I can track usage statistics._

**Acceptance Criteria:**
1. A stored procedure named `GetDoctorWithMostPatientsByMonth` exists in MySQL.
2. Input parameters: `input_month` (INT) and `input_year` (INT).
3. Output: rows with `doctor_id` and `patients_seen`.
4. Procedure can be executed from MySQL CLI: `CALL GetDoctorWithMostPatientsByMonth(4, 2025);`
5. Results are sorted by `patients_seen DESC` and limited to 1 row.

**Priority:** Medium
**Story Points:** 3
**Notes:**
- SQL: `CREATE PROCEDURE GetDoctorWithMostPatientsByMonth(IN input_month INT, IN input_year INT)`.
- Also `GetDoctorWithMostPatientsByYear` and `GetDailyAppointmentReportByDoctor` are created.

---

# DOCTOR USER STORIES

## Doctor Story 1 — Log into the portal

**Title:**
_As a doctor, I want to log into the portal, so that I can manage my appointments._

**Acceptance Criteria:**
1. The login page is accessible at `/login` and shared with admin/patient roles.
2. The form requires both `email` and `password` fields.
3. Credentials are validated against the `doctor` table in MySQL.
4. On success, a JWT is issued and stored in localStorage.
5. On success, the doctor is redirected to `/doctorDashboard/{token}`.

**Priority:** High
**Story Points:** 5
**Notes:**
- Backend: `DoctorController.doctorLogin` → `DoctorService.validateDoctor` → `TokenService.generateToken`.

## Doctor Story 2 — Log out

**Title:**
_As a doctor, I want to log out of the portal, so that I can protect my data when I leave my workstation._

**Acceptance Criteria:**
1. A visible "Logout" button exists in the doctor dashboard.
2. Clicking logout invalidates the JWT and clears the session.
3. The user is redirected to the login page.

**Priority:** High
**Story Points:** 2
**Notes:**
- Frontend: `header.js` → `logout()`.

## Doctor Story 3 — View appointment calendar

**Title:**
_As a doctor, I want to view my appointment calendar, so that I can stay organized and manage my daily schedule._

**Acceptance Criteria:**
1. Authenticated doctors can access `/doctorDashboard/{token}`.
2. The dashboard shows a date picker and a "Today's Appointments" button.
3. Only appointments for the logged-in doctor are shown.
4. Each appointment shows: patient name, phone, email.
5. A search bar filters by patient name.

**Priority:** High
**Story Points:** 5
**Notes:**
- Frontend: `doctorDashboard.js` + `doctorDashboard.html`.
- Backend: `AppointmentController.getAppointments`.

## Doctor Story 4 — Mark unavailability

**Title:**
_As a doctor, I want to mark my unavailability, so that patients only see the slots where I am actually available._

**Acceptance Criteria:**
1. Doctors can block specific dates or time ranges.
2. Blocked slots are not offered to patients during booking.
3. The doctor can add a reason (optional): vacation, conference, personal.
4. Changes are persisted to the `doctor_available_times` table.

**Priority:** High
**Story Points:** 8
**Notes:**
- Backend: `Doctor.availableTimes` (`@ElementCollection`) in MySQL.
- Service: `DoctorService.getDoctorAvailability`.

## Doctor Story 5 — Update profile

**Title:**
_As a doctor, I want to update my profile with specialization and contact information, so that patients have up-to-date information._

**Acceptance Criteria:**
1. Authenticated doctors can access `/doctor/profile`.
2. Editable fields: name, email, phone, specialty.
3. Email must remain unique.
4. Changes are persisted to the `doctor` table in MySQL.

**Priority:** Medium
**Story Points:** 5
**Notes:**
- Backend: `DoctorController.updateDoctor` → `DoctorService.updateDoctor`.

## Doctor Story 6 — View patient details

**Title:**
_As a doctor, I want to view the patient details for my upcoming appointments, so that I can be prepared before the consultation._

**Acceptance Criteria:**
1. Doctors can access patient details from an appointment.
2. The view shows: patient name, phone, email.
3. Only patients with an appointment scheduled with the doctor are accessible.
4. Prescriptions (from MongoDB) are visible if available.

**Priority:** High
**Story Points:** 5
**Notes:**
- Backend: `PrescriptionController.getPrescription` → `PrescriptionService.getPrescription`.
- Frontend: `patientRows.js` links to `/pages/patientRecord.html`.

---

# PATIENT USER STORIES

## Patient Story 1 — View doctors without login

**Title:**
_As a patient, I want to view a list of doctors without logging in, so that I can explore options before registering._

**Acceptance Criteria:**
1. The `/pages/patientDashboard.html` page is publicly accessible.
2. Each doctor card shows: name, specialty, email, available times.
3. A search bar allows filtering by doctor name.
4. Two dropdowns filter by time (AM/PM) and specialty.
5. Attempting to book redirects to the login modal.

**Priority:** High
**Story Points:** 3
**Notes:**
- Backend: `DoctorController.getDoctor` (public, no token).
- Frontend: `patientDashboard.js` + `doctorCard.js`.

## Patient Story 2 — Sign up

**Title:**
_As a patient, I want to sign up using my email and password, so that I can book appointments._

**Acceptance Criteria:**
1. A sign-up form is available via `patientSignup` modal.
2. Required fields: name, email, password, phone, address.
3. Email must be unique and validated.
4. Passwords are validated (`@Size(min = 6)`).
5. On success, the patient is redirected to the login modal.

**Priority:** High
**Story Points:** 5
**Notes:**
- Backend: `PatientController.createPatient` → `PatientService.createPatient` → `PatientRepository.save`.
- Validation: `Service.validatePatient` checks email/phone uniqueness.

## Patient Story 3 — Log in

**Title:**
_As a patient, I want to log into the portal, so that I can manage my bookings._

**Acceptance Criteria:**
1. Login page accessible at `/login` with email + password.
2. Credentials validated against the `patient` table in MySQL.
3. On success, a JWT is issued and stored in localStorage.
4. Redirected to `/pages/loggedPatientDashboard.html`.

**Priority:** High
**Story Points:** 5
**Notes:**
- Backend: `PatientController.login` → `Service.validatePatientLogin`.

## Patient Story 4 — Log out

**Title:**
_As a patient, I want to log out of the portal, so that I can secure my account._

**Acceptance Criteria:**
1. A "Logout" button appears in the patient dashboard.
2. Clicking logout clears the JWT and redirects to `/pages/patientDashboard.html`.
3. The role is reset to `patient` (not `loggedPatient`).

**Priority:** High
**Story Points:** 2
**Notes:**
- Frontend: `header.js` → `logoutPatient()` (keeps role as "patient").

## Patient Story 5 — Book an appointment

**Title:**
_As a patient, I want to log in and book an hour-long appointment to consult with a doctor, so that I can receive medical attention at a scheduled time._

**Acceptance Criteria:**
1. Authenticated patients can book appointments via the doctor cards.
2. The form allows selecting date and time slot.
3. Slots already booked by the doctor are disabled.
4. Duration fixed at 60 minutes.
5. On success, the appointment is persisted to MySQL and a confirmation is shown.

**Priority:** High
**Story Points:** 8
**Notes:**
- Backend: `AppointmentController.bookAppointment` → `AppointmentService.bookAppointment` → `Service.validateAppointment`.
- Entity: `Appointment` with relations to `Patient` and `Doctor`.

## Patient Story 6 — View upcoming appointments

**Title:**
_As a patient, I want to view my upcoming appointments, so that I can prepare accordingly._

**Acceptance Criteria:**
1. Authenticated patients can access their appointments.
2. Only appointments belonging to the logged-in patient are shown.
3. Appointments are sorted by date ascending.
4. Each entry shows: doctor name, specialty, date, time, status.
5. Filtering by condition (past/future) and doctor name is available.

**Priority:** Medium
**Story Points:** 3
**Notes:**
- Backend: `PatientController.getPatientAppointment` → `PatientService.getPatientAppointment` → `AppointmentRepository.findByPatientId`.
- Frontend: `patientServices.js` → `getPatientAppointments`.
