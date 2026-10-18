/*
  Import getAllAppointments to fetch appointments from the backend
  Import createPatientRow to generate a table row for each patient appointment


  Get the table body where patient rows will be added
  Initialize selectedDate with today's date in 'YYYY-MM-DD' format
  Get the saved token from localStorage (used for authenticated API calls)
  Initialize patientName to null (used for filtering by name)


  Add an 'input' event listener to the search bar
  On each keystroke:
    - Trim and check the input value
    - If not empty, use it as the patientName for filtering
    - Else, reset patientName to "null" (as expected by backend)
    - Reload the appointments list with the updated filter


  Add a click listener to the "Today" button
  When clicked:
    - Set selectedDate to today's date
    - Update the date picker UI to match
    - Reload the appointments for today


  Add a change event listener to the date picker
  When the date changes:
    - Update selectedDate with the new value
    - Reload the appointments for that specific date


  Function: loadAppointments
  Purpose: Fetch and display appointments based on selected date and optional patient name

  Step 1: Call getAllAppointments with selectedDate, patientName, and token
  Step 2: Clear the table body content before rendering new rows

  Step 3: If no appointments are returned:
    - Display a message row: "No Appointments found for today."

  Step 4: If appointments exist:
    - Loop through each appointment and construct a 'patient' object with id, name, phone, and email
    - Call createPatientRow to generate a table row for the appointment
    - Append each row to the table body

  Step 5: Catch and handle any errors during fetch:
    - Show a message row: "Error loading appointments. Try again later."


  When the page is fully loaded (DOMContentLoaded):
    - Call renderContent() (assumes it sets up the UI layout)
    - Call loadAppointments() to display today's appointments by default
*/

/* Import getAllAppointments and createPatientRow */
import { getAllAppointments } from "./services/appointmentRecordService.js";
import { createPatientRow } from "./components/patientRows.js";

/* Get the table body where patient rows will be added */
const patientTableBody = document.getElementById("patientTableBody");

/* Initialize selectedDate with today's date in 'YYYY-MM-DD' format */
let selectedDate = new Date().toISOString().split("T")[0];

/* Get the saved token from localStorage (used for authenticated API calls) */
const token = localStorage.getItem("token");

/* Initialize patientName to null (used for filtering by name) */
let patientName = null;

/* Add an 'input' event listener to the search bar */
const searchBar = document.getElementById("searchBar");
if (searchBar) {
    searchBar.addEventListener("input", () => {
        /* Trim and check the input value */
        const value = searchBar.value.trim();

        /* If not empty, use it as the patientName for filtering; else reset to "null" */
        patientName = value !== "" ? value : "null";

        /* Reload the appointments list with the updated filter */
        loadAppointments();
    });
}

/* Add a click listener to the "Today" button */
const todayButton = document.getElementById("todayButton");
if (todayButton) {
    todayButton.addEventListener("click", () => {
        /* Set selectedDate to today's date */
        selectedDate = new Date().toISOString().split("T")[0];

        /* Update the date picker UI to match */
        const datePicker = document.getElementById("datePicker");
        if (datePicker) datePicker.value = selectedDate;

        /* Reload the appointments for today */
        loadAppointments();
    });
}

/* Add a change event listener to the date picker */
const datePicker = document.getElementById("datePicker");
if (datePicker) {
    datePicker.addEventListener("change", () => {
        /* Update selectedDate with the new value */
        selectedDate = datePicker.value;

        /* Reload the appointments for that specific date */
        loadAppointments();
    });
}

/* Function: loadAppointments — Fetch and display appointments */
async function loadAppointments() {
    try {
        /* Step 1: Call getAllAppointments with selectedDate, patientName, and token */
        const appointments = await getAllAppointments(selectedDate, patientName, token);

        /* Step 2: Clear the table body content before rendering new rows */
        if (!patientTableBody) return;
        patientTableBody.innerHTML = "";

        /* Step 3: If no appointments are returned, show a message row */
        if (!appointments || appointments.length === 0) {
            const emptyRow = document.createElement("tr");
            emptyRow.innerHTML = `<td colspan="5" class="noPatientRecord">No Appointments found for today.</td>`;
            patientTableBody.appendChild(emptyRow);
            return;
        }

        /* Step 4: Loop through each appointment and render a patient row */
        appointments.forEach((appointment) => {
            /* Construct a 'patient' object with id, name, phone, and email */
            const patient = {
                id:    appointment.patientId    || appointment.patient?.id,
                name:  appointment.patientName  || appointment.patient?.name,
                phone: appointment.patientPhone || appointment.patient?.phone,
                email: appointment.patientEmail || appointment.patient?.email
            };

            /* Call createPatientRow to generate a table row */
            const row = createPatientRow(patient, appointment.id, appointment.doctorId);

            /* Append each row to the table body */
            patientTableBody.appendChild(row);
        });

    } catch (error) {
        /* Step 5: Catch and handle any errors during fetch */
        console.error("Error loading appointments:", error);
        if (patientTableBody) {
            patientTableBody.innerHTML = "";
            const errorRow = document.createElement("tr");
            errorRow.innerHTML = `<td colspan="5" class="noPatientRecord">Error loading appointments. Try again later.</td>`;
            patientTableBody.appendChild(errorRow);
        }
    }
}

/* When the page is fully loaded: call renderContent() and loadAppointments() */
window.addEventListener("DOMContentLoaded", () => {
    /* Call renderContent() (assumes it sets up the UI layout) */
    if (typeof renderContent === "function") {
        renderContent();
    }

    /* Call loadAppointments() to display today's appointments by default */
    loadAppointments();
});