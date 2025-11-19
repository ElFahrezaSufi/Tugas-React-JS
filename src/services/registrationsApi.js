import {
  handleApiResponse,
  mapBackendResponse,
  getCurrentToken,
} from "../utils/apiHelpers";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function getEventRegistrations(eventId, token) {
  const authToken = token || getCurrentToken();
  const res = await fetch(`${baseURL}/api/events/${eventId}/registrations`, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
  });
  const data = await handleApiResponse(res);
  const registrations = data.data || [];

  // Map snake_case to camelCase
  return registrations.map((reg) => mapBackendResponse(reg));
}

async function registerForEvent(eventId, token) {
  const authToken = token || getCurrentToken();
  const res = await fetch(`${baseURL}/api/events/${eventId}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  const data = await handleApiResponse(res);
  return mapBackendResponse(data.data);
}

async function cancelRegistrationForCurrentUser(eventId, token) {
  const authToken = token || getCurrentToken();
  const res = await fetch(`${baseURL}/api/events/${eventId}/registrations`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const data = await handleApiResponse(res);
  return mapBackendResponse(data.data);
}

async function cancelRegistrationById(eventId, regId, token) {
  const authToken = token || getCurrentToken();
  const res = await fetch(
    `${baseURL}/api/events/${eventId}/registrations/${regId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );
  const data = await handleApiResponse(res);
  return mapBackendResponse(data.data);
}

async function getMyRegistrations(token) {
  const authToken = token || getCurrentToken();
  const res = await fetch(`${baseURL}/api/registrations/me`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const data = await handleApiResponse(res);
  const registrations = data.data || [];

  // Map snake_case to camelCase
  return registrations.map((reg) => mapBackendResponse(reg));
}

export {
  getEventRegistrations,
  registerForEvent,
  cancelRegistrationForCurrentUser,
  cancelRegistrationById,
  getMyRegistrations,
};
