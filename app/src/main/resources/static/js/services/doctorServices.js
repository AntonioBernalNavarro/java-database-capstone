/* Import API Base URL from the config file */
import { API_BASE_URL } from "../config/config.js";

/* Set Doctor API Endpoint */
const DOCTOR_API = API_BASE_URL + '/doctor';

/* Get all doctors */
export async function getDoctors() {
    try {
        const response = await fetch(DOCTOR_API, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            console.error("Failed to fetch doctors:", response.status);
            return [];
        }
        const data = await response.json();
        return data.doctors || [];
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return [];
    }
}

/* Delete a doctor (admin only) */
export async function deleteDoctor(id, token) {
    try {
        const response = await fetch(`${DOCTOR_API}/${id}/${token}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            return { success: false, message: `Failed (status ${response.status})` };
        }
        const data = await response.json();
        return { success: true, message: data.message || "Doctor deleted" };
    } catch (error) {
        console.error("Error deleting doctor:", error);
        return { success: false, message: "Network or server error" };
    }
}

/* Save (add) a new doctor */
export async function saveDoctor(doctor, token) {
    try {
        const response = await fetch(`${DOCTOR_API}/${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctor)
        });
        if (!response.ok) {
            return { success: false, message: `Failed (status ${response.status})` };
        }
        const data = await response.json();
        return { success: true, message: data.message || "Doctor saved" };
    } catch (error) {
        console.error("Error saving doctor:", error);
        return { success: false, message: "Network or server error" };
    }
}

/* Filter doctors */
export async function filterDoctors(name, time, specialty) {
    try {
        const n = name || "null";
        const t = time || "null";
        const s = specialty || "null";

        const url = `${DOCTOR_API}/filter/${encodeURIComponent(n)}/${encodeURIComponent(t)}/${encodeURIComponent(s)}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            console.error("Failed to filter doctors:", response.status);
            return [];
        }
        const data = await response.json();
        return data.doctors || [];
    } catch (error) {
        console.error("Error filtering doctors:", error);
        return [];
    }
}