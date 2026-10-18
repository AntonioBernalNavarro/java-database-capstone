package com.project.back_end.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Admin;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.AdminRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.repo.PatientRepository;

// ✅ CAMBIO: anotación fully-qualified para evitar conflicto de nombres con la clase Service
@org.springframework.stereotype.Service
public class Service {

// 1. **@Service Annotation**
// The @Service annotation marks this class as a service component in Spring. This allows Spring to automatically detect it through component scanning
// and manage its lifecycle, enabling it to be injected into controllers or other services using @Autowired or constructor injection.
// ✅ Implementado arriba.

// 2. **Constructor Injection for Dependencies**
// The constructor injects all required dependencies (TokenService, Repositories, and other Services). This approach promotes loose coupling, improves testability,
// and ensures that all required dependencies are provided at object creation time.

    private final TokenService tokenService;
    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DoctorService doctorService;
    private final PatientService patientService;

    @Autowired
    public Service(TokenService tokenService,
                   AdminRepository adminRepository,
                   DoctorRepository doctorRepository,
                   PatientRepository patientRepository,
                   DoctorService doctorService,
                   PatientService patientService) {
        this.tokenService = tokenService;
        this.adminRepository = adminRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.doctorService = doctorService;
        this.patientService = patientService;
    }

// 3. **validateToken Method**
// This method checks if the provided JWT token is valid for a specific user. It uses the TokenService to perform the validation.
// If the token is invalid or expired, it returns a 401 Unauthorized response with an appropriate error message. This ensures security by preventing
// unauthorized access to protected resources.

    public ResponseEntity<Map<String, String>> validateToken(String token, String user) {
        Map<String, String> response = new HashMap<>();

        Boolean isValid = tokenService.validateToken(token, user);
        if (isValid == null || !isValid) {
            response.put("message", "Invalid or expired token.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        // Empty body = token is valid
        return ResponseEntity.ok(response);
    }

// 4. **validateAdmin Method**
// This method validates the login credentials for an admin user.
// - It first searches the admin repository using the provided username.
// - If an admin is found, it checks if the password matches.
// - If the password is correct, it generates and returns a JWT token (using the admin’s username) with a 200 OK status.
// - If the password is incorrect, it returns a 401 Unauthorized status with an error message.
// - If no admin is found, it also returns a 401 Unauthorized.
// - If any unexpected error occurs during the process, a 500 Internal Server Error response is returned.
// This method ensures that only valid admin users can access secured parts of the system.

    public ResponseEntity<Map<String, String>> validateAdmin(Admin receivedAdmin) {
        Map<String, String> response = new HashMap<>();

        try {
            Admin admin = adminRepository.findByUsername(receivedAdmin.getUsername());
            if (admin == null) {
                response.put("message", "Admin not found.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            if (!admin.getPassword().equals(receivedAdmin.getPassword())) {
                response.put("message", "Invalid password.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            String token = tokenService.generateToken(admin.getUsername(), "admin");
            response.put("token", token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error validating admin: " + e.getMessage());
            response.put("message", "An error occurred during admin login.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

// 5. **filterDoctor Method**
// This method provides filtering functionality for doctors based on name, specialty, and available time slots.
// - It supports various combinations of the three filters.
// - If none of the filters are provided, it returns all available doctors.
// This flexible filtering mechanism allows the frontend or consumers of the API to search and narrow down doctors based on user criteria.

    public Map<String, Object> filterDoctor(String name, String specialty, String time) {
        boolean hasName      = name      != null && !name.isBlank();
        boolean hasSpecialty = specialty != null && !specialty.isBlank();
        boolean hasTime      = time      != null && !time.isBlank();

        if (hasName && hasSpecialty && hasTime) {
            return doctorService.filterDoctorsByNameSpecilityandTime(name, specialty, time);
        } else if (hasName && hasTime) {
            return doctorService.filterDoctorByNameAndTime(name, time);
        } else if (hasName && hasSpecialty) {
            return doctorService.filterDoctorByNameAndSpecility(name, specialty);
        } else if (hasSpecialty && hasTime) {
            return doctorService.filterDoctorByTimeAndSpecility(specialty, time);
        } else if (hasName) {
            return doctorService.findDoctorByName(name);
        } else if (hasSpecialty) {
            return doctorService.filterDoctorBySpecility(specialty);
        } else if (hasTime) {
            return doctorService.filterDoctorsByTime(time);
        } else {
            // No filters → return all doctors
            Map<String, Object> response = new HashMap<>();
            response.put("doctors", doctorService.getDoctors());
            return response;
        }
    }

// 6. **validateAppointment Method**
// This method validates if the requested appointment time for a doctor is available.
// - It first checks if the doctor exists in the repository.
// - Then, it retrieves the list of available time slots for the doctor on the specified date.
// - It compares the requested appointment time with the start times of these slots.
// - If a match is found, it returns 1 (valid appointment time).
// - If no matching time slot is found, it returns 0 (invalid).
// - If the doctor doesn’t exist, it returns -1.
// This logic prevents overlapping or invalid appointment bookings.

    public int validateAppointment(Appointment appointment) {
        if (appointment == null || appointment.getDoctor() == null) {
            return -1;
        }

        Doctor doctor = doctorRepository.findById(appointment.getDoctor().getId()).orElse(null);
        if (doctor == null) {
            return -1;  // Doctor doesn't exist
        }

        LocalDate date = appointment.getAppointmentTime().toLocalDate();
        List<String> availableSlots = doctorService.getDoctorAvailability(doctor.getId(), date);

        String requestedSlot = formatSlot(appointment.getAppointmentTime());
        if (availableSlots.contains(requestedSlot)) {
            return 1;  // Valid time slot
        }
        return 0;  // Unavailable
    }

// 7. **validatePatient Method**
// This method checks whether a patient with the same email or phone number already exists in the system.
// - If a match is found, it returns false (indicating the patient is not valid for new registration).
// - If no match is found, it returns true.
// This helps enforce uniqueness constraints on patient records and prevent duplicate entries.

    public boolean validatePatient(Patient patient) {
        if (patient == null) return false;
        Patient existing = patientRepository.findByEmailOrPhone(patient.getEmail(), patient.getPhone());
        return existing == null;  // true = patient does NOT exist (valid for registration)
    }

// 8. **validatePatientLogin Method**
// This method handles login validation for patient users.
// - It looks up the patient by email.
// - If found, it checks whether the provided password matches the stored one.
// - On successful validation, it generates a JWT token and returns it with a 200 OK status.
// - If the password is incorrect or the patient doesn't exist, it returns a 401 Unauthorized with a relevant error.
// - If an exception occurs, it returns a 500 Internal Server Error.
// This method ensures only legitimate patients can log in and access their data securely.

    public ResponseEntity<Map<String, String>> validatePatientLogin(Login login) {
        Map<String, String> response = new HashMap<>();

        try {
            Patient patient = patientRepository.findByEmail(login.getEmail());
            if (patient == null) {
                response.put("message", "Patient not found.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            if (!patient.getPassword().equals(login.getPassword())) {
                response.put("message", "Invalid password.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            String token = tokenService.generateToken(patient.getEmail(), "patient");
            response.put("token", token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error validating patient login: " + e.getMessage());
            response.put("message", "An error occurred during patient login.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

// 9. **filterPatient Method**
// This method filters a patient's appointment history based on condition and doctor name.
// - It extracts the email from the JWT token to identify the patient.
// - Depending on which filters (condition, doctor name) are provided, it delegates the filtering logic to PatientService.
// - If no filters are provided, it retrieves all appointments for the patient.
// This flexible method supports patient-specific querying and enhances user experience on the client side.

    public ResponseEntity<Map<String, Object>> filterPatient(String condition, String name, String token) {
        try {
            // Extract patient from token
            String email = tokenService.extractUsername(token);
            if (email == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Invalid token.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            Patient patient = patientRepository.findByEmail(email);
            if (patient == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Patient not found.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            boolean hasCondition = condition != null && !condition.isBlank();
            boolean hasName      = name      != null && !name.isBlank();

            if (hasCondition && hasName) {
                return patientService.filterByDoctorAndCondition(condition, name, patient.getId());
            } else if (hasCondition) {
                return patientService.filterByCondition(condition, patient.getId());
            } else if (hasName) {
                return patientService.filterByDoctor(name, patient.getId());
            } else {
                return patientService.getPatientAppointment(patient.getId(), token);
            }
        } catch (Exception e) {
            System.err.println("Error filtering patient appointments: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("message", "An error occurred while filtering appointments.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

// ----------------------------------------------------
// Private helper method (not part of the template's numbering)
// ----------------------------------------------------

    /**
     * Format a LocalDateTime as a slot string compatible with Doctor.availableTimes
     * (e.g. 2025-11-01T09:00 -> "09:00-10:00").
     */
    private String formatSlot(LocalDateTime dateTime) {
        LocalTime start = dateTime.toLocalTime();
        LocalTime end   = start.plusHours(1);
        return String.format("%02d:%02d-%02d:%02d",
                start.getHour(), start.getMinute(),
                end.getHour(),   end.getMinute());
    }

}