/*
Import the overlay function for booking appointments from loggedPatient.js

Import the deleteDoctor API function to remove doctors (admin role) from doctorServices.js

Import function to fetch patient details (used during booking) from patientServices.js

Function to create and return a DOM element for a single doctor card
  Create the main container for the doctor card
  Retrieve the current user role from localStorage
  Create a div to hold doctor information
  Create and set the doctor's name
  Create and set the doctor's specialization
  Create and set the doctor's email
  Create and list available appointment times
  Append all info elements to the doctor info container
  Create a container for card action buttons
  === ADMIN ROLE ACTIONS ===
    Create a delete button
    Add click handler for delete button
      Get the admin token from localStorage
      Call API to delete the doctor
      Show result and remove card if successful
    Add delete button to actions container
  === PATIENT (NOT LOGGED-IN) ROLE ACTIONS ===
    Create a book now button
    Alert patient to log in before booking
    Add button to actions container
  === LOGGED-IN PATIENT ROLE ACTIONS ===
    Create a book now button
    Handle booking logic for logged-in patient
      Redirect if token not available
      Fetch patient data with token
      Show booking overlay UI with doctor and patient info
    Add button to actions container
  Append doctor info and action buttons to the card
  Return the complete doctor card element
*/

/* Import the deleteDoctor API function to remove doctors (admin role) from doctorServices.js */
import { deleteDoctor } from "../services/doctorServices.js";

/* Import function to fetch patient details (used during booking) from patientServices.js */
import { getPatientData } from "../services/patientServices.js";

/* Function to create and return a DOM element for a single doctor card */
export function createDoctorCard(doctor) {

    /* Create the main container for the doctor card */
    const card = document.createElement("div");
    card.classList.add("doctor-card");

    /* Retrieve the current user role from localStorage */
    const role = localStorage.getItem("userRole");

    /* Create a div to hold doctor information */
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("doctor-info");

    /* Create and set the doctor's name */
    const name = document.createElement("h3");
    name.textContent = doctor.name;

    /* Create and set the doctor's specialization */
    const specialization = document.createElement("p");
    specialization.textContent = doctor.specialty;

    /* Create and set the doctor's email */
    const email = document.createElement("p");
    email.textContent = doctor.email;

    /* Create and list available appointment times */
    const availability = document.createElement("p");
    availability.textContent = doctor.availableTimes
        ? doctor.availableTimes.join(", ")
        : "No availability";

    /* Append all info elements to the doctor info container */
    infoDiv.appendChild(name);
    infoDiv.appendChild(specialization);
    infoDiv.appendChild(email);
    infoDiv.appendChild(availability);

    /* Create a container for card action buttons */
    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("card-actions");

    /* === ADMIN ROLE ACTIONS === */
    if (role === "admin") {
        /* Create a delete button */
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Delete";

        /* Add click handler for delete button */
        removeBtn.addEventListener("click", async () => {
            if (!confirm(`Delete ${doctor.name}?`)) return;

            /* Get the admin token from localStorage */
            const token = localStorage.getItem("token");

            try {
                /* Call API to delete the doctor */
                const result = await deleteDoctor(doctor.id, token);

                /* Show result and remove card if successful */
                if (result && result.success === false) {
                    alert("Failed to delete doctor: " + (result.message || "Unknown error"));
                    return;
                }
                alert("Doctor deleted successfully.");
                card.remove();
            } catch (error) {
                alert("Failed to delete doctor: " + error.message);
            }
        });

        /* Add delete button to actions container */
        actionsDiv.appendChild(removeBtn);
    }

    /* === PATIENT (NOT LOGGED-IN) ROLE ACTIONS === */
    else if (role === "patient") {
        /* Create a book now button */
        const bookNow = document.createElement("button");
        bookNow.textContent = "Book Now";

        /* Alert patient to log in before booking */
        bookNow.addEventListener("click", () => {
            alert("Patient needs to login first.");
        });

        /* Add button to actions container */
        actionsDiv.appendChild(bookNow);
    }

    /* === LOGGED-IN PATIENT ROLE ACTIONS === */
    else if (role === "loggedPatient") {
        /* Create a book now button */
        const bookNow = document.createElement("button");
        bookNow.textContent = "Book Now";

        /* Handle booking logic for logged-in patient */
        bookNow.addEventListener("click", async (e) => {
            /* Redirect if token not available */
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Session expired. Please log in again.");
                window.location.href = "/";
                return;
            }

            try {
                /* Fetch patient data with token */
                const patientData = await getPatientData(token);

                /* Show booking overlay UI with doctor and patient info */
                console.log("Booking data ready:", { doctor, patientData });
                alert(`Booking for ${doctor.name} — booking flow will be implemented in the next lab.`);
            } catch (error) {
                alert("Failed to load patient data: " + error.message);
            }
        });

        /* Add button to actions container */
        actionsDiv.appendChild(bookNow);
    }

    /* Append doctor info and action buttons to the card */
    card.appendChild(infoDiv);
    card.appendChild(actionsDiv);

    /* Return the complete doctor card element */
    return card;
}