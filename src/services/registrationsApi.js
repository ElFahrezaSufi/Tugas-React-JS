const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function getEventRegistrations(eventId, token) {
  const res = await fetch(`${baseURL}/api/events/${eventId}/registrations`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to fetch registrations");
  const json = await res.json();
  return json.data || [];
}

async function registerForEvent(eventId, token) {
  const res = await fetch(`${baseURL}/api/events/${eventId}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || "Failed to register");
  }
  const json = await res.json();
  return json.data;
}

async function cancelRegistrationForCurrentUser(eventId, token) {
  const res = await fetch(`${baseURL}/api/events/${eventId}/registrations`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || "Failed to cancel registration");
  }
  const json = await res.json();
  return json.data;
}

async function cancelRegistrationById(eventId, regId, token) {
  const res = await fetch(
    `${baseURL}/api/events/${eventId}/registrations/${regId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error("Failed to cancel registration");
  const json = await res.json();
  return json.data;
}

async function getMyRegistrations(token) {
  const res = await fetch(`${baseURL}/api/registrations/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch my registrations");
  const json = await res.json();
  return json.data || [];
}

export {
  getEventRegistrations,
  registerForEvent,
  cancelRegistrationForCurrentUser,
  cancelRegistrationById,
  getMyRegistrations,
};
