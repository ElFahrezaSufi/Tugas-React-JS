const DEFAULT_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function getAuthHeader() {
  try {
    const current = JSON.parse(localStorage.getItem("currentUser") || "null");
    const token = current?.token || current?.authToken || null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

function mapFromBackend(item) {
  return {
    id: item.id,
    nama: item.name || item.nama || "",
    tanggal: item.date || item.tanggal || "",
    waktu: item.time || item.waktu || "",
    lokasi: item.location || item.lokasi || "",
    kategori: item.category || item.kategori || "",
    deskripsi: item.description || item.deskripsi || "",
    raw: item,
  };
}

function mapToBackend(payload) {
  return {
    name: payload.nama,
    date: payload.tanggal,
    time: payload.waktu,
    location: payload.lokasi,
    category: payload.kategori,
    description: payload.deskripsi,
  };
}

async function fetchEvents({ location, category, page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams();
  if (location) params.append("location", location);
  if (category) params.append("category", category);
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);

  const res = await fetch(`${DEFAULT_BASE}/api/events?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch events");
  const json = await res.json();
  const items = (json.data?.items || json.data || []).map(mapFromBackend);
  return { ...json.data, items };
}

async function getEventById(id) {
  const res = await fetch(`${DEFAULT_BASE}/api/events/${id}`);
  if (!res.ok) throw new Error("Failed to fetch event");
  const json = await res.json();
  return mapFromBackend(json.data);
}

async function createEvent(payload) {
  const body = mapToBackend(payload);
  const res = await fetch(`${DEFAULT_BASE}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create event");
  }
  const json = await res.json();
  return mapFromBackend(json.data);
}

async function updateEvent(id, payload) {
  const body = mapToBackend(payload);
  const res = await fetch(`${DEFAULT_BASE}/api/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update event");
  }
  const json = await res.json();
  return mapFromBackend(json.data);
}

async function deleteEvent(id) {
  const res = await fetch(`${DEFAULT_BASE}/api/events/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete event");
  }
  const json = await res.json();
  return mapFromBackend(json.data);
}

async function searchEvents(q = "", page = 1, limit = 10) {
  const params = new URLSearchParams();
  if (q) params.append("q", q);
  params.append("page", page);
  params.append("limit", limit);
  const res = await fetch(
    `${DEFAULT_BASE}/api/events/search?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to search events");
  const json = await res.json();
  const items = (json.data?.items || json.data || []).map(mapFromBackend);
  return { ...json.data, items };
}

export {
  fetchEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  searchEvents,
};
