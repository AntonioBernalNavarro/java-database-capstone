import { API_BASE_URL } from "../config/config.js";

const PATIENT_API = API_BASE_URL + '/patient';

export async function patientSignup(data) {
    try {
        const response = await fetch(`${PATIENT_API}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            return { success: false, message: `Signup failed (status ${response.status})` };
        }
        const result = await response.json();
        return { success: true, message: result.message || "Patient signed up" };
    } catch (error) {
        console.error("Error in patientSignup:", error);
        return { success: false, message: "Network or server error" };
    }
}

export async function patientLogin(data) {
    const response = await fetch(`${PATIENT_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    console.log("Patient login data:", data);
    return response;
}

export async function getPatientData(token) {
    try {
        const response = await fetch(`${PATIENT_API}/${token}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Error fetching patient data:", error);
        return null;
    }
}

export async function getPatientAppointments(id, token, user) {
    try {
        const response = await fetch(`${PATIENT_API}/${id}/${token}/${user}/appointments`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return null;
    }
}

export async function filterAppointments(condition, name, token) {
    try {
        const params = new URLSearchParams();
        if (condition) params.append("condition", condition);
        if (name)      params.append("name", name);
        const queryString = params.toString();
        const url = queryString
            ? `${PATIENT_API}/appointments/filter?${queryString}&token=${token}`
            : `${PATIENT_API}/appointments/filter?token=${token}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Error filtering appointments:", error);
        alert("An unexpected error occurred while filtering appointments.");
        return [];
    }
}