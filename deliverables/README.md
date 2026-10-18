# Capstone Project — Final Submission
## Smart Clinic Management System

**Repository:** https://github.com/AntonioBernalNavarro/java-database-capstone
**Public App URL:** https://antonionbern-8080.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai

---

## Table of Contents

1. [Public GitHub Links (12)](#1-public-github-links-12)
2. [Screenshots (6)](#2-screenshots-6)
3. [SQL Outputs (5)](#3-sql-outputs-5)
4. [Curl Outputs (3)](#4-curl-outputs-3)

---

## 1. Public GitHub Links (12)

### 1.1 User Stories (GitHub Issues)
https://github.com/AntonioBernalNavarro/java-database-capstone/issues

### 1.2 Database Schema Design
https://github.com/AntonioBernalNavarro/java-database-capstone/blob/main/schema-design.md

### 1.3 Doctor Model
https://github.com/AntonioBernalNavarro/java-database-capstone/blob/main/app/src/main/java/com/project/back_end/models/Doctor.java

### 1.4 Appointment Model
https://github.com/AntonioBernalNavarro/java-database-capstone/blob/main/app/src/main/java/com/project/back_end/models/Appointment.java

### 1.5 Doctor Controller
https://github.com/AntonioBernalNavarro/java-database-capstone/blob/main/app/src/main/java/com/project/back_end/controllers/DoctorController.java

### 1.6 Appointment Service
https://github.com/AntonioBernalNavarro/java-database-capstone/blob/main/app/src/main/java/com/project/back_end/services/AppointmentService.java

### 1.7 Prescription Controller
https://github.com/AntonioBernalNavarro/java-database-capstone/blob/main/app/src/main/java/com/project/back_end/controllers/PrescriptionController.java

### 1.8 Patient Repository
https://github.com/AntonioBernalNavarro/java-database-capstone/blob/main/app/src/main/java/com/project/back_end/repo/PatientRepository.java

### 1.9 Token Service
https://github.com/AntonioBernalNavarro/java-database-capstone/blob/main/app/src/main/java/com/project/back_end/services/TokenService.java

### 1.10 Doctor Service
https://github.com/AntonioBernalNavarro/java-database-capstone/blob/main/app/src/main/java/com/project/back_end/services/DoctorService.java

### 1.11 Dockerfile
https://github.com/AntonioBernalNavarro/java-database-capstone/blob/main/app/Dockerfile

### 1.12 GitHub Actions — Compile Backend Workflow
https://github.com/AntonioBernalNavarro/java-database-capstone/blob/main/.github/workflows/compile-backend.yml

---

## 2. Screenshots (6)

### 2.1 Admin Portal Login Screen
![Admin Portal Login](Admin%20Portal.png)

### 2.2 Doctor Portal Login Screen
![Doctor Portal Login](Doctor%20Portal.png)

### 2.3 Patient Portal Login Screen
![Patient Portal Login](Patient%20Portal.png)

### 2.4 Admin Adding a Doctor
![Adding Doctor](Adding%20Doctor.png)

### 2.5 Patient Searching for a Doctor
![Searching Doctor](Searching%20Doctor.png)

### 2.6 Doctor Viewing Appointments
![Appointments List](Appointments%20List.png)

---

## 3. SQL Outputs (5)

### 3.1 SHOW TABLES — All tables in cms

+------------------------+
| Tables_in_cms          |
+------------------------+
| admin                  |
| appointment            |
| doctor                 |
| doctor_available_times |
| patient                |
+------------------------+

### 3.2 SELECT * FROM patient LIMIT 5

+----+-----------------------------+------------------------+----------------+-------------+--------------+
| id | address                     | email                  | name           | password    | phone        |
+----+-----------------------------+------------------------+----------------+-------------+--------------+
|  1 | 101 Oak St, Cityville       | jane.doe@example.com   | Jane Doe       | passJane1   | 888-111-1111 |
|  2 | 202 Maple Rd, Townsville    | john.smith@example.com | John Smith     | smithSecure | 888-222-2222 |
|  3 | 303 Pine Ave, Villageton    | emily.rose@example.com | Emily Rose     | emilyPass99 | 888-333-3333 |
|  4 | 404 Birch Ln, Metropolis    | michael.j@example.com  | Michael Jordan | airmj23     | 888-444-4444 |
|  5 | 505 Cedar Blvd, Springfield | olivia.m@example.com   | Olivia Moon    | moonshine12 | 888-555-5555 |
+----+-----------------------------+------------------------+----------------+-------------+--------------+

### 3.3 CALL GetDailyAppointmentReportByDoctor('2025-04-15')

+------------------+----------------------------+--------+----------------+---------------+
| doctor_name      | appointment_time           | status | patient_name   | patient_phone |
+------------------+----------------------------+--------+----------------+---------------+
| Dr. Ava Hall     | 2025-04-15 11:00:00.000000 |      1 | Lucas Turner   | 889-666-6666  |
| Dr. Mark Johnson | 2025-04-15 12:00:00.000000 |      1 | Michael Jordan | 888-444-4444  |
| Dr. Mark Johnson | 2025-04-15 13:00:00.000000 |      1 | Olivia Moon    | 888-555-5555  |
+------------------+----------------------------+--------+----------------+---------------+

### 3.4 CALL GetDoctorWithMostPatientsByMonth(4, 2025)

+-----------+---------------+
| doctor_id | patients_seen |
+-----------+---------------+
|         2 |            31 |
+-----------+---------------+

### 3.5 CALL GetDoctorWithMostPatientsByYear(2025)

+-----------+---------------+
| doctor_id | patients_seen |
+-----------+---------------+
|         1 |            34 |
+-----------+---------------+

---

## 4. Curl Outputs (3)

### 4.1 GET all doctors

curl -s https://antonionbern-8080.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/doctor

Output: JSON with 25 doctors including availableTimes. Full output in deliverables/curl-outputs/24-all-doctors.json

### 4.2 Patient Login + Get Patient Appointments

Login: curl -X POST https://antonionbern-8080.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/patient/login -H "Content-Type: application/json" -d '{"email":"jane.doe@example.com","password":"passJane1"}'

Appointments: curl -i -X GET https://antonionbern-8080.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/patient/1/patient/<JWT-TOKEN> -H "Accept: application/json"

Full output in deliverables/curl-outputs/25-patient-appointments.txt

### 4.3 GET doctors filtered by specialty and time

curl -X GET https://antonionbern-8080.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/doctor/filter/null/09:00-10:00/Cardiologist

Output: JSON with cardiologists available 09:00-10:00. Full output in deliverables/curl-outputs/26-filter-doctors.json

---

## Summary of Artifacts

| Category | Count | Status |
|----------|-------|--------|
| Public GitHub Links | 12 | Complete |
| Screenshots | 6 | Complete |
| SQL Outputs | 5 | Complete |
| Curl Outputs | 3 | Complete |
| TOTAL | 26 | Complete |

---

## Technologies Used

- Backend: Spring Boot 3.4.4, Java 17
- Databases: MySQL 8.0 (relational) + MongoDB (document)
- ORM/ODM: Spring Data JPA / Spring Data MongoDB
- Authentication: JWT (JJWT 0.12.6)
- Frontend: HTML/CSS/JavaScript + Thymeleaf
- CI/CD: GitHub Actions (4 workflows)
- Containerization: Docker (multi-stage build)
