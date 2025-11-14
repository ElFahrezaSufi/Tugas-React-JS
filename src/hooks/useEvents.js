import { useState, useEffect, useCallback } from "react";
import * as api from "../services/eventsApi";

export default function useEvents({
  location,
  category,
  page = 1,
  limit = 50,
} = {}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (opts = {}) => {
      setLoading(true);
      setError(null);
      setEvents([]);
      try {
        const res = await api.fetchEvents({
          location: opts.location ?? location,
          category: opts.category ?? category,
          page: opts.page ?? page,
          limit: opts.limit ?? limit,
        });
        const items = res.items || [];
        setEvents(items);
        try {
          localStorage.setItem("events", JSON.stringify(items));
        } catch (err) {
          console.warn("Failed to persist events to localStorage", err);
        }
      } catch (err) {
        console.error("useEvents load error", err);
        const errorMsg = err.message || "Failed to load events";
        setError(errorMsg);
        setEvents([]);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [location, category, page, limit]
  );

  useEffect(() => {
    load().catch((err) => {
      console.warn("Initial load failed, UI will show error state");
    });
  }, [load]);

  // Keep a local copy of events in localStorage so pages/components
  // that still read `localStorage.events` (eg. MyRegistrations)
  // can work without breaking. This writes whenever `events` changes.
  useEffect(() => {
    try {
      localStorage.setItem("events", JSON.stringify(events || []));
    } catch (err) {
      // non-fatal
    }
  }, [events]);

  return { events, loading, error, reload: load, setEvents };
}
