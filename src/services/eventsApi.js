import {
  getAuthHeader,
  handleApiResponse,
  mapBackendResponse,
} from "../utils/apiHelpers";

const DEFAULT_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function mapFromBackend(item) {
  // Convert snake_case to camelCase first
  const camelItem = mapBackendResponse(item);

  // Map to frontend field names
  return {
    id: camelItem.id,
    nama: camelItem.name || camelItem.nama || "",
    tanggal: camelItem.date || camelItem.tanggal || "",
    waktu: camelItem.time || camelItem.waktu || "",
    lokasi: camelItem.location || camelItem.lokasi || "",
    kategori: camelItem.category || camelItem.kategori || "",
    deskripsi: camelItem.description || camelItem.deskripsi || "",
    createdAt: camelItem.createdAt || camelItem.created_at || null,
    updatedAt: camelItem.updatedAt || camelItem.updated_at || null,
    raw: camelItem,
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
  const json = await handleApiResponse(res);
  const items = (json.data?.items || json.data || []).map(mapFromBackend);
  return { ...json.data, items };
}

async function getEventById(id) {
  const res = await fetch(`${DEFAULT_BASE}/api/events/${id}`);
  const json = await handleApiResponse(res);
  return mapFromBackend(json.data);
}

async function createEvent(payload) {
  const body = mapToBackend(payload);
  const res = await fetch(`${DEFAULT_BASE}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(body),
  });
  const json = await handleApiResponse(res);
  return mapFromBackend(json.data);
}

async function updateEvent(id, payload) {
  const body = mapToBackend(payload);
  const res = await fetch(`${DEFAULT_BASE}/api/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(body),
  });
  const json = await handleApiResponse(res);
  return mapFromBackend(json.data);
}

async function deleteEvent(id) {
  const res = await fetch(`${DEFAULT_BASE}/api/events/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeader() },
  });
  const json = await handleApiResponse(res);
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
  const json = await handleApiResponse(res);
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
