package com.project.back_end.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.back_end.models.Prescription;
import com.project.back_end.services.AppointmentService;
import com.project.back_end.services.PrescriptionService;
import com.project.back_end.services.Service;

@RestController
@RequestMapping("${api.path}prescription")
public class PrescriptionController {

// 1. Set Up the Controller Class:
//    - Annotate the class with `@RestController` to define it as a REST API controller.
//    - Use `@RequestMapping("${api.path}prescription")` to set the base path for all prescription-related endpoints.
//    - This controller manages creating and retrieving prescriptions tied to appointments.
//    ✅ Implementado arriba.

// 2. Autowire Dependencies:
//    - Inject `PrescriptionService` to handle logic related to saving and fetching prescriptions.
//    - Inject the shared `Service` class for token validation and role-based access control.
//    - Inject `AppointmentService` to update appointment status after a prescription is issued.

    private final PrescriptionService prescriptionService;
    private final Service service;
    private final AppointmentService appointmentService;

    @Autowired
    public PrescriptionController(PrescriptionService prescriptionService,
                                  Service service,
                                  AppointmentService appointmentService) {
        this.prescriptionService = prescriptionService;
        this.service = service;
        this.appointmentService = appointmentService;
    }

// 3. Define the `savePrescription` Method:
//    - Handles HTTP POST requests to save a new prescription for a given appointment.
//    - Accepts a validated `Prescription` object in the request body and a doctor’s token as a path variable.
//    - Validates the token for the `"doctor"` role.
//    - If the token is valid, updates the status of the corresponding appointment to reflect that a prescription has been added.
//    - Delegates the saving logic to `PrescriptionService` and returns a response indicating success or failure.

    @PostMapping("/{token}")
    public ResponseEntity<Map<String, String>> savePrescription(
            @PathVariable("token") String token,
            @RequestBody Prescription prescription) {

        Map<String, String> response = new HashMap<>();

        // Validate the token for "doctor" role
        ResponseEntity<Map<String, String>> validation = service.validateToken(token, "doctor");
        if (!validation.getStatusCode().is2xxSuccessful()
                || (validation.getBody() != null && !validation.getBody().isEmpty())) {
            return validation;
        }

        // Delegate saving logic to PrescriptionService
        ResponseEntity<Map<String, String>> saveResult =
                prescriptionService.savePrescription(prescription);

        // If saved successfully (201 Created), update the appointment status to "Completed" (1)
        if (saveResult.getStatusCode() == HttpStatus.CREATED) {
            try {
                appointmentService.changeStatus(1, prescription.getAppointmentId());
            } catch (Exception e) {
                System.err.println("Error updating appointment status: " + e.getMessage());
                response.put("message", "Prescription saved, but failed to update appointment status.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        }

        // Return the result from the service (success or error)
        return saveResult;
    }

// 4. Define the `getPrescription` Method:
//    - Handles HTTP GET requests to retrieve a prescription by its associated appointment ID.
//    - Accepts the appointment ID and a doctor’s token as path variables.
//    - Validates the token for the `"doctor"` role using the shared service.
//    - If the token is valid, fetches the prescription using the `PrescriptionService`.
//    - Returns the prescription details or an appropriate error message if validation fails.

    @GetMapping("/{appointmentId}/{token}")
    public ResponseEntity<Map<String, Object>> getPrescription(
            @PathVariable("appointmentId") Long appointmentId,
            @PathVariable("token") String token) {

        // Validate the token for "doctor" role
        ResponseEntity<Map<String, String>> validation = service.validateToken(token, "doctor");
        if (!validation.getStatusCode().is2xxSuccessful()
                || (validation.getBody() != null && !validation.getBody().isEmpty())) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", validation.getBody() != null && validation.getBody().containsKey("message")
                    ? validation.getBody().get("message")
                    : "Invalid token.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        // Delegate retrieval to PrescriptionService
        return prescriptionService.getPrescription(appointmentId);
    }

}