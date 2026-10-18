/*
  This script handles the admin dashboard functionality for managing doctors:
  - Loads all doctor cards
  - Filters doctors by name, time, or specialty
  - Adds a new doctor via modal form


  Attach a click listener to the "Add Doctor" button
  When clicked, it opens a modal form using openModal('addDoctor')


  When the DOM is fully loaded:
    - Call loadDoctorCards() to fetch and display all doctors


  Function: loadDoctorCards
  Purpose: Fetch all doctors and display them as cards

    Call getDoctors() from the service layer
    Clear the current content area
    For each doctor returned:
    - Create a doctor card using createDoctorCard()
    - Append it to the content div

    Handle any fetch errors by logging them


  Attach 'input' and 'change' event listeners to the search bar and filter dropdowns
  On any input change, call filterDoctorsOnChange()


  Function: filterDoctorsOnChange
  Purpose: Filter doctors based on name, available time, and specialty

    Read values from the search bar and filters
    Normalize empty values to null
    Call filterDoctors(name, time, specialty) from the service

    If doctors are found:
    - Render them using createDoctorCard()
    If no doctors match the filter:
    - Show a message: "No doctors found with the given filters."

    Catch and display any errors with an alert


  Function: renderDoctorCards
  Purpose: A helper function to render a list of doctors passed to it

    Clear the content area
    Loop through the doctors and append each card to the content area


  Function: adminAddDoctor
  Purpose: Collect form data and add a new doctor to the system

    Collect input values from the modal form
    - Includes name, email, phone, password, specialty, and available times

    Retrieve the authentication token from localStorage
    - If no token is found, show an alert and stop execution

    Build a doctor object with the form values

    Call saveDoctor(doctor, token) from the service

    If save is successful:
    - Show a success message
    - Close the modal and reload the page

    If saving fails, show an error message
*/

/* Import required modules */
import { openModal } from "./components/modals.js";
import { getDoctors, filterDoctors, saveDoctor } from "./services/doctorServices.js";
import { createDoctorCard } from "./components/doctorCard.js";


/* Attach a click listener to the "Add Doctor" button */
document.addEventListener("DOMContentLoaded", () => {
    const addDocBtn = document.getElementById("addDocBtn");
    if (addDocBtn) {
        addDocBtn.addEventListener("click", () => {
            openModal("addDoctor");
        });
    }
});


/* When the DOM is fully loaded: call loadDoctorCards() to fetch and display all doctors */
window.addEventListener("DOMContentLoaded", () => {
    loadDoctorCards();
});


/* Function: loadDoctorCards — Fetch all doctors and display them as cards */
async function loadDoctorCards() {
    try {
        /* Call getDoctors() from the service layer */
        const doctors = await getDoctors();

        /* Clear the current content area */
        const contentDiv = document.getElementById("content");
        if (!contentDiv) return;
        contentDiv.innerHTML = "";

        /* For each doctor returned: create a card and append it */
        doctors.forEach((doctor) => {
            const card = createDoctorCard(doctor);
            contentDiv.appendChild(card);
        });
    } catch (error) {
        /* Handle any fetch errors by logging them */
        console.error("Error loading doctor cards:", error);
    }
}


/* Attach 'input' and 'change' event listeners to the search bar and filter dropdowns */
const searchBar = document.getElementById("searchBar");
const filterTime = document.getElementById("filterTime");
const filterSpecialty = document.getElementById("filterSpecialty");

if (searchBar)        searchBar.addEventListener("input", filterDoctorsOnChange);
if (filterTime)       filterTime.addEventListener("change", filterDoctorsOnChange);
if (filterSpecialty)  filterSpecialty.addEventListener("change", filterDoctorsOnChange);


/* Function: filterDoctorsOnChange — Filter doctors based on name, time, specialty */
async function filterDoctorsOnChange() {
    try {
        /* Read values from the search bar and filters */
        const name = document.getElementById("searchBar").value.trim();
        const time = document.getElementById("filterTime").value;
        const specialty = document.getElementById("filterSpecialty").value;

        /* Normalize empty values to null */
        const nameParam      = name      || null;
        const timeParam      = time      || null;
        const specialtyParam = specialty || null;

        /* Call filterDoctors(name, time, specialty) from the service */
        const doctors = await filterDoctors(nameParam, timeParam, specialtyParam);

        /* If doctors are found: render them using createDoctorCard() */
        if (doctors && doctors.length > 0) {
            renderDoctorCards(doctors);
        } else {
            /* If no doctors match the filter: show a message */
            const contentDiv = document.getElementById("content");
            contentDiv.innerHTML = `<p class="noPatientRecord">No doctors found with the given filters.</p>`;
        }
    } catch (error) {
        /* Catch and display any errors with an alert */
        console.error("Error filtering doctors:", error);
        alert("An error occurred while filtering doctors. Please try again.");
    }
}


/* Function: renderDoctorCards — A helper function to render a list of doctors */
function renderDoctorCards(doctors) {
    /* Clear the content area */
    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = "";

    /* Loop through the doctors and append each card to the content area */
    doctors.forEach((doctor) => {
        const card = createDoctorCard(doctor);
        contentDiv.appendChild(card);
    });
}


/* Function: adminAddDoctor — Collect form data and add a new doctor */
async function adminAddDoctor() {
    /* Collect input values from the modal form */
    const name          = document.getElementById("doctorName").value.trim();
    const email         = document.getElementById("doctorEmail").value.trim();
    const phone         = document.getElementById("doctorPhone").value.trim();
    const password      = document.getElementById("doctorPassword").value.trim();
    const specialty     = document.getElementById("specialization").value.trim();

    /* Collect any checkbox values for doctor availability */
    const availableTimes = Array.from(
        document.querySelectorAll('input[name="availability"]:checked')
    ).map((checkbox) => checkbox.value);

    /* Retrieve the authentication token from localStorage */
    const token = localStorage.getItem("token");

    /* If no token is found, show an alert and stop execution */
    if (!token) {
        alert("Session expired. Please log in again.");
        return;
    }

    /* Build a doctor object with the form values */
    const doctor = {
        name,
        email,
        phone,
        password,
        specialty,
        availableTimes
    };

    try {
        /* Call saveDoctor(doctor, token) from the service */
        const result = await saveDoctor(doctor, token);

        /* If save is successful: show message, close modal, reload */
        if (result.success) {
            alert(result.message || "Doctor added successfully!");
            const modal = document.getElementById("modal");
            if (modal) modal.classList.remove("show");
            window.location.reload();
        } else {
            /* If saving fails, show an error message */
            alert(`Failed to add doctor: ${result.message}`);
        }
    } catch (error) {
        console.error("Error adding doctor:", error);
        alert("An error occurred while adding the doctor. Please try again.");
    }
}

/* Expose adminAddDoctor globally so the modal form's onsubmit can call it */
window.adminAddDoctor = adminAddDoctor;