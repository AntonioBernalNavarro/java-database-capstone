# Smart Clinic Management System – Schema Design

This document defines the **hybrid data storage strategy** for the Smart Clinic Management System, using **polyglot persistence**:

- **MySQL** → structured, validated, interrelated data (admin, doctor, patient, appointment, medical_record, doctor_availability).
- **MongoDB** → flexible, document-based data (prescriptions, feedback, audit_logs, messages).

---

# MySQL Database Design

Structured, validated, interrelated data works well in MySQL. The system uses `InnoDB` engine and `utf8mb4` charset. Database name: `smart_clinic_db`.

## 1. Tables

### Table: admin
- id: BIGINT, Primary Key, Auto Increment
- username: VARCHAR(50), Not Null, Unique
- password_hash: VARCHAR(255), Not Null
- full_name: VARCHAR(100), Not Null
- email: VARCHAR(120), Not Null, Unique
- created_at: TIMESTAMP, Not Null, Default CURRENT_TIMESTAMP
- active: BOOLEAN, Not Null, Default TRUE (soft delete flag)

### Table: doctor
- id: BIGINT, Primary Key, Auto Increment
- first_name: VARCHAR(60), Not Null
- last_name: VARCHAR(60), Not Null
- email: VARCHAR(120), Not Null, Unique
- phone: VARCHAR(20), Null
- password_hash: VARCHAR(255), Not Null
- specialization: VARCHAR(100), Not Null
- license_number: VARCHAR(50), Not Null, Unique
- years_experience: INT, Check >= 0
- bio: TEXT, Null
- active: BOOLEAN, Not Null, Default TRUE
- created_at: TIMESTAMP, Not Null, Default CURRENT_TIMESTAMP

### Table: patient
- id: BIGINT, Primary Key, Auto Increment
- first_name: VARCHAR(60), Not Null
- last_name: VARCHAR(60), Not Null
- email: VARCHAR(120), Not Null, Unique
- password_hash: VARCHAR(255), Not Null
- phone: VARCHAR(20), Null
- date_of_birth: DATE, Null
- created_at: TIMESTAMP, Not Null, Default CURRENT_TIMESTAMP
- active: BOOLEAN, Not Null, Default TRUE

### Table: medical_record
- id: BIGINT, Primary Key, Auto Increment
- patient_id: BIGINT, Foreign Key → patient(id), Not Null, **Unique** (enforces 1:1)
- blood_type: VARCHAR(5), Null
- allergies: TEXT, Null
- chronic_conditions: TEXT, Null
- updated_at: TIMESTAMP, Not Null, Default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

### Table: appointment
- id: BIGINT, Primary Key, Auto Increment
- doctor_id: BIGINT, Foreign Key → doctor(id), Not Null, ON DELETE RESTRICT
- patient_id: BIGINT, Foreign Key → patient(id), Not Null, ON DELETE RESTRICT
- appointment_time: DATETIME, Not Null
- duration_minutes: INT, Not Null, Default 60
- status: ENUM('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW'), Not Null, Default 'SCHEDULED'
- reason: VARCHAR(255), Null
- created_at: TIMESTAMP, Not Null, Default CURRENT_TIMESTAMP
- **Constraint:** UNIQUE(doctor_id, appointment_time) → prevents overlapping appointments for the same doctor
- **Index:** (patient_id, appointment_time) → speeds up "my upcoming appointments" queries

### Table: doctor_availability
- id: BIGINT, Primary Key, Auto Increment
- doctor_id: BIGINT, Foreign Key → doctor(id), Not Null, ON DELETE CASCADE
- start_datetime: DATETIME, Not Null
- end_datetime: DATETIME, Not Null, Check > start_datetime
- reason: VARCHAR(120), Null (vacation / conference / personal)

## 2. Key design decisions

- **Email and phone validation** is intentionally deferred to the **application layer** using Hibernate Validator (`@Email`, `@Pattern`). MySQL stores them as `VARCHAR` to keep the schema portable and allow future format changes without a migration.
- **`password_hash`** stores BCrypt output — never plain text.
- **Soft delete** (`active` flag on `admin`, `doctor`, `patient`) preserves referential integrity and history.
- **`ON DELETE RESTRICT`** on `appointment` prevents hard-deleting a patient/doctor with appointments. History is retained forever unless a data-retention policy is applied later.
- **`UNIQUE(doctor_id, appointment_time)`** prevents double-booking at the DB level, making the constraint concurrency-safe.
- **`medical_record` enforces 1:1** via `UNIQUE(patient_id)` — each patient has exactly one medical record.
- **`doctor_availability`** models blocked slots separately from `appointment`, so a doctor can declare unavailability without creating appointments.

## 3. Relationships

- **1:1** — `patient → medical_record`
- **1:N** — `doctor → appointment`, `patient → appointment`, `doctor → doctor_availability`
- **N:M** — modeled in MongoDB (a prescription references multiple medications; a patient can receive many prescriptions across appointments)

## 4. Think deeper (MySQL answers)

- **What happens if a patient is deleted?** — `appointment.patient_id` uses `ON DELETE RESTRICT`; the patient cannot be hard-deleted while appointments exist. The application uses **soft delete** (`patient.active = false`) to preserve history.
- **Should a doctor be allowed to have overlapping appointments?** — **No.** Enforced by `UNIQUE(doctor_id, appointment_time)` at the database level. Concurrent bookings are handled with `SELECT … FOR UPDATE` inside a transaction (see §6).
- **Should each doctor have their own available time slots?** — Yes. `doctor_availability` stores blocked ranges. The booking service queries this table before offering slots.
- **Should a patient's past appointment history be retained forever?** — Yes. `ON DELETE RESTRICT` + soft delete preserve history. Only `status` changes (COMPLETED / CANCELLED).
- **Is a prescription tied to a specific appointment or can it exist independently?** — It is **tied to a specific appointment** (`appointmentId` is required in the MongoDB document). A prescription always follows a consultation; if a follow-up is needed, a new prescription document is created with a new appointment reference.

## 5. DDL (Data Definition Language)

```sql
CREATE TABLE admin (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    username        VARCHAR(50)  NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(120) NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    UNIQUE KEY uk_admin_username (username),
    UNIQUE KEY uk_admin_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE doctor (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    first_name        VARCHAR(60)  NOT NULL,
    last_name         VARCHAR(60)  NOT NULL,
    email             VARCHAR(120) NOT NULL,
    phone             VARCHAR(20),
    password_hash     VARCHAR(255) NOT NULL,
    specialization    VARCHAR(100) NOT NULL,
    license_number    VARCHAR(50)  NOT NULL,
    years_experience  INT          CHECK (years_experience >= 0),
    bio               TEXT,
    active            BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_doctor_email (email),
    UNIQUE KEY uk_doctor_license (license_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE patient (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    first_name      VARCHAR(60)  NOT NULL,
    last_name       VARCHAR(60)  NOT NULL,
    email           VARCHAR(120) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    date_of_birth   DATE,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    UNIQUE KEY uk_patient_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE medical_record (
    id                   BIGINT    NOT NULL AUTO_INCREMENT,
    patient_id           BIGINT    NOT NULL,
    blood_type           VARCHAR(5),
    allergies            TEXT,
    chronic_conditions   TEXT,
    updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                                      ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_medical_patient (patient_id),
    CONSTRAINT fk_medical_patient FOREIGN KEY (patient_id)
        REFERENCES patient(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE appointment (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    doctor_id         BIGINT       NOT NULL,
    patient_id        BIGINT       NOT NULL,
    appointment_time  DATETIME     NOT NULL,
    duration_minutes  INT          NOT NULL DEFAULT 60,
    status            ENUM('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW')
                                   NOT NULL DEFAULT 'SCHEDULED',
    reason            VARCHAR(255),
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_appt_doctor  FOREIGN KEY (doctor_id)  REFERENCES doctor(id)  ON DELETE RESTRICT,
    CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE RESTRICT,
    UNIQUE KEY uk_appt_doctor_slot (doctor_id, appointment_time),
    INDEX idx_appt_patient_time (patient_id, appointment_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE doctor_availability (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    doctor_id       BIGINT       NOT NULL,
    start_datetime  DATETIME     NOT NULL,
    end_datetime    DATETIME     NOT NULL,
    reason          VARCHAR(120),
    PRIMARY KEY (id),
    CONSTRAINT fk_avail_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE,
    CONSTRAINT chk_avail_range CHECK (end_datetime > start_datetime),
    INDEX idx_avail_doctor_range (doctor_id, start_datetime, end_datetime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 6. DML (Data Manipulation Language) examples

```sql
-- INSERT: register a new doctor
INSERT INTO doctor
    (first_name, last_name, email, password_hash,
     specialization, license_number, years_experience)
VALUES
    ('Ana', 'García', 'ana.garcia@clinic.com', '$2a$10$...',
     'Cardiology', 'LIC-MD-2026-001', 12);

-- SELECT: upcoming appointments for a patient
SELECT a.id, a.appointment_time, a.status,
       d.first_name, d.last_name, d.specialization
FROM appointment a
JOIN doctor d ON d.id = a.doctor_id
WHERE a.patient_id = 3001
  AND a.appointment_time >= NOW()
ORDER BY a.appointment_time ASC;

-- UPDATE: mark an appointment as completed
UPDATE appointment SET status = 'COMPLETED' WHERE id = 10245;

-- DELETE (soft): deactivate a doctor
UPDATE doctor SET active = FALSE WHERE id = 42;
```

## 7. Transactions & concurrency

Booking an appointment is a **transaction**. The `UNIQUE(doctor_id, appointment_time)` constraint plus `SELECT … FOR UPDATE` guarantees atomicity and prevents double-booking under concurrency:

```sql
START TRANSACTION;
SELECT id FROM doctor WHERE id = 42 FOR UPDATE;
INSERT INTO appointment (doctor_id, patient_id, appointment_time, duration_minutes)
VALUES (42, 3001, '2026-11-03 10:00:00', 60);
COMMIT;   -- or ROLLBACK on duplicate slot
```

---

# MongoDB Collection Design

Some data doesn't fit well into rigid tables: free-form doctor notes, optional patient feedback, prescription metadata, chat messages, and log records. These are great candidates for MongoDB (`smart_clinic_docs` database).

## Collection: prescriptions

**Why NoSQL?** Prescriptions contain variable-length medication lists with heterogeneous fields per medication. Modeling this in SQL would require a `prescription_medication` join table plus frequent migrations.

```json
{
  "_id": "ObjectId('64abc123456')",
  "patientId": 3001,
  "patientName": "John Smith",
  "appointmentId": 51,
  "doctorId": 42,
  "issuedAt": "2026-10-17T10:30:00Z",
  "medications": [
    {
      "name": "Paracetamol",
      "dosage": "500 mg",
      "frequency": "every 6 hours",
      "durationDays": 3,
      "doctorNotes": "Take 1 tablet every 6 hours."
    },
    {
      "name": "Ibuprofen",
      "dosage": "400 mg",
      "frequency": "every 8 hours as needed",
      "durationDays": 2,
      "doctorNotes": "Max 1200 mg/day"
    }
  ],
  "refillCount": 2,
  "pharmacy": {
    "name": "Walgreens SF",
    "location": "Market Street"
  },
  "tags": ["antibiotic", "urgent"],
  "status": "ACTIVE"
}
```

## Collection: feedback

**Why NoSQL?** Feedback forms evolve: new rating dimensions appear without migrations.

```json
{
  "_id": "ObjectId('64abc123457')",
  "appointmentId": 51,
  "patientId": 3001,
  "doctorId": 42,
  "submittedAt": "2026-10-17T15:12:00Z",
  "ratings": {
    "overall": 5,
    "punctuality": 4,
    "communication": 5,
    "facilities": 4
  },
  "comments": "Very professional and thorough.",
  "tags": ["friendly-staff", "short-wait"],
  "anonymous": false
}
```

## Collection: audit_logs

**Why NoSQL?** High write volume + heterogeneous event shapes. TTL index auto-purges old records.

```json
{
  "_id": "ObjectId('64abc123458')",
  "timestamp": "2026-10-17T10:00:00Z",
  "actorRole": "ADMIN",
  "actorId": 1,
  "action": "LOGIN",
  "targetType": "SESSION",
  "targetId": "sess_abc123",
  "metadata": {
    "ip": "203.0.113.42",
    "userAgent": "Mozilla/5.0 ...",
    "result": "SUCCESS"
  },
  "severity": "INFO"
}
```

## Collection: messages (chat between patient and doctor)

**Why NoSQL?** Chat messages are high-volume, time-series-like, and each may carry optional attachments. Relational modeling would be overkill.

```json
{
  "_id": "ObjectId('64abc123459')",
  "threadId": "thread_patient3001_doctor42",
  "senderId": 3001,
  "senderRole": "PATIENT",
  "receiverId": 42,
  "receiverRole": "DOCTOR",
  "sentAt": "2026-10-17T11:45:00Z",
  "body": "Hello Dr. García, I have a question about my prescription.",
  "attachments": [],
  "readBy": [42],
  "metadata": {
    "device": "iOS",
    "appVersion": "1.4.2"
  }
}
```

## Think deeper (MongoDB answers)

- **Should MongoDB documents include the full patient object or just an ID?** — **Just the ID** (with an optional `patientName` snapshot for display). Rationale: patient records change over time (name, phone, address). Embedding the full object would duplicate data across many documents and create inconsistencies when a patient is updated. The service layer joins by ID when needed.
- **What would a chat message document look like?** — See the `messages` collection above: `threadId`, `sender`, `receiver`, `sentAt`, `body`, optional `attachments[]`, `readBy[]`, and open-ended `metadata`.
- **What happens if the schema needs to evolve?** — MongoDB doesn't enforce schema, so adding new fields (e.g., `medications[].warnings[]`, new `ratings` dimensions) is zero-cost for existing documents. A `version` field can be added later for handling breaking changes if needed.
- **Why more than one collection?** — Each collection has a distinct access pattern (prescriptions by patient, feedback by doctor, logs by timestamp, messages by thread). Separating them gives better indexing and TTL control.

## Indexes

```js
db.prescriptions.createIndex({ patientId: 1, issuedAt: -1 });
db.feedback.createIndex({ doctorId: 1, submittedAt: -1 });
db.audit_logs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 31536000 });
db.messages.createIndex({ threadId: 1, sentAt: 1 });
```

---

# Justification of the hybrid approach

| Concern | MySQL | MongoDB |
|---------|-------|---------|
| Integrity | Foreign keys, UNIQUE, ACID transactions | Document-level atomicity |
| Schema | Fixed, versioned via migrations | Flexible, evolves with app |
| Use cases | admin, doctor, patient, appointment, medical_record, doctor_availability | prescriptions, feedback, audit_logs, messages |
| Query pattern | Joins, aggregations, reporting | Nested reads, flexible filters |
| Scaling | Vertical + read replicas | Horizontal sharding |

Cross-database references (`prescription.appointmentId`, `feedback.appointmentId`, `messages.threadId`) are validated at the **service layer**, not via cross-DB foreign keys.

