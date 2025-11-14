import { useState, useEffect, useMemo, useCallback } from "react";
import DaftarEvent from "../components/DaftarEvent";
import FormTambahEvent from "../components/FormTambahEvent";
import StatistikEvent from "../components/StatistikEvent";
import DetailEvent from "../components/DetailEvent";
import Navbar from "../components/Navbar";
import SearchWithHistory from "../components/SearchWithHistory";
import { useAuth } from "../contexts/AuthContext";
import useEvents from "../hooks/useEvents";
import * as api from "../services/eventsApi";

// Fungsi helper untuk memeriksa status event
const cekStatusEvent = (tanggal, waktu = "00:00") => {
  const now = new Date();
  const [year, month, day] = tanggal.split("-").map(Number);
  const [hours, minutes] = waktu.split(":").map(Number);
  const eventDate = new Date(year, month - 1, day, hours, minutes);

  return {
    status: now < eventDate ? "mendatang" : "selesai",
    timeUntilStatusChange: Math.max(
      0,
      now < eventDate ? eventDate - now : Number.MAX_SAFE_INTEGER
    ),
  };
};

/**
 * AdminPanel - Halaman untuk admin mengelola event (Full CRUD Access)
 */
function AdminPanel() {
  const { user } = useAuth();

  const { events, loading, error, reload, setEvents } = useEvents();

  // State untuk pencarian dan filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKategori, setFilterKategori] = useState("semua");
  const [filterStatus, setFilterStatus] = useState("semua");

  // State untuk manajemen event yang sedang dilihat/diedit
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);

  // Fungsi untuk menambah event baru
  const handleTambahEvent = useCallback(
    async (newEvent) => {
      try {
        const created = await api.createEvent(newEvent);
        setEvents((prev) => [...prev, created]);
        alert("Event berhasil ditambahkan");
      } catch (err) {
        console.error("Tambah event failed", err);
        const errMsg = err.message || "Gagal menambahkan event";
        alert(`Error: ${errMsg}`);
      }
    },
    [setEvents]
  );

  // Fungsi untuk mengupdate event yang ada
  const handleUpdateEvent = useCallback(
    async (updatedEvent) => {
      try {
        const updated = await api.updateEvent(updatedEvent.id, updatedEvent);
        setEvents((prev) =>
          prev.map((e) => (e.id === updated.id ? updated : e))
        );
        setEventToEdit(null);
        alert("Event berhasil diperbarui");
      } catch (err) {
        console.error("Update failed", err);
        const errMsg = err.message || "Gagal memperbarui event";
        alert(`Error: ${errMsg}`);
      }
    },
    [setEvents]
  );

  // Fungsi untuk melihat detail event
  const handleViewDetail = useCallback((event) => {
    setSelectedEvent(event);
  }, []);

  // Fungsi untuk memulai mode edit
  const handleEditEvent = useCallback((event) => {
    setEventToEdit(event);
    // Scroll ke form edit
    document
      .getElementById("form-event")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fungsi untuk membatalkan edit
  const handleCancelEdit = useCallback(() => {
    setEventToEdit(null);
  }, []);

  // Fungsi untuk menghapus event
  const handleHapusEvent = useCallback(
    async (id) => {
      if (!window.confirm("Apakah Anda yakin ingin menghapus event ini?"))
        return;
      try {
        await api.deleteEvent(id);
        setEvents((prev) => prev.filter((e) => e.id !== id));
        alert("Event berhasil dihapus");
      } catch (err) {
        console.error("Delete failed", err);
        const errMsg = err.message || "Gagal menghapus event";
        alert(`Error: ${errMsg}`);
      }
    },
    [setEvents]
  );

  // State untuk memaksa update komponen ketika status event berubah
  const [statusUpdateTrigger, setStatusUpdateTrigger] = useState(0);

  // Filter events berdasarkan pencarian, kategori, dan status
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.nama
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesKategori =
        filterKategori === "semua" ||
        event.kategori.toLowerCase() === filterKategori.toLowerCase();

      const statusInfo = cekStatusEvent(event.tanggal, event.waktu);
      const matchesStatus =
        filterStatus === "semua" || statusInfo.status === filterStatus;

      return matchesSearch && matchesKategori && matchesStatus;
    });
  }, [events, searchTerm, filterKategori, filterStatus, statusUpdateTrigger]);

  // Effect untuk mengupdate status event secara real-time
  useEffect(() => {
    const nextUpdates = events
      .map((event) => {
        const statusInfo = cekStatusEvent(event.tanggal, event.waktu);
        return statusInfo.timeUntilStatusChange;
      })
      .filter((time) => time > 0 && time < Number.MAX_SAFE_INTEGER);

    if (nextUpdates.length > 0) {
      const nextUpdate = Math.min(...nextUpdates);
      const timer = setTimeout(() => {
        setStatusUpdateTrigger((prev) => prev + 1);
      }, nextUpdate);

      return () => clearTimeout(timer);
    }
  }, [events, statusUpdateTrigger]);

  // Fungsi untuk menghitung statistik
  const hitungStatistik = (eventsList) => {
    const total = eventsList.length;

    const { mendatang, selesai } = eventsList.reduce(
      (acc, event) => {
        try {
          const statusInfo = cekStatusEvent(event.tanggal, event.waktu);
          if (statusInfo.status === "mendatang") {
            acc.mendatang += 1;
          } else {
            acc.selesai += 1;
          }
        } catch (error) {
          console.error("Error processing event:", event, error);
        }
        return acc;
      },
      { mendatang: 0, selesai: 0 }
    );

    return { total, mendatang, selesai };
  };

  // State untuk statistik
  const [statistik, setStatistik] = useState(() => hitungStatistik(events));

  // Update statistik ketika events berubah atau status update dipicu
  useEffect(() => {
    const newStats = hitungStatistik(events);
    setStatistik((prev) => {
      return JSON.stringify(prev) !== JSON.stringify(newStats)
        ? newStats
        : prev;
    });
  }, [events, statusUpdateTrigger]);

  // Effect untuk update periodik (setiap menit) sebagai fallback
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusUpdateTrigger((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <div className="app-container">
        <header className="app-header">
          <h1>⚙️ Admin Panel - Manajemen Event</h1>
          <p className="welcome-message">
            Selamat datang, <strong>{user?.nama}</strong>! Anda memiliki akses
            penuh untuk mengelola event.
          </p>
        </header>

        <main className="app-main">
          {/* Komponen Statistik */}
          <StatistikEvent statistik={statistik} />

          {/* Error State */}
          {error && !loading && (
            <div
              className="alert alert-error"
              style={{
                padding: "12px",
                marginBottom: "20px",
                backgroundColor: "#f8d7da",
                borderColor: "#f5c6cb",
                color: "#721c24",
                border: "1px solid #f5c6cb",
                borderRadius: "4px",
              }}
            >
              <strong>Error:</strong> {error}
              <button
                onClick={() => reload()}
                style={{
                  marginLeft: "10px",
                  padding: "5px 10px",
                  cursor: "pointer",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div
              className="alert alert-info"
              style={{
                padding: "12px",
                marginBottom: "20px",
                backgroundColor: "#d1ecf1",
                borderColor: "#bee5eb",
                color: "#0c5460",
                border: "1px solid #bee5eb",
                borderRadius: "4px",
              }}
            >
              <strong>Loading...</strong> Memuat data event dari server...
            </div>
          )}

          {/* Komponen Form */}
          <div id="form-event">
            <FormTambahEvent
              onTambahEvent={handleTambahEvent}
              onUpdateEvent={handleUpdateEvent}
              eventToEdit={eventToEdit}
              onCancelEdit={handleCancelEdit}
            />
          </div>

          {/* Filter dan Pencarian */}
          <div className="filter-container">
            <SearchWithHistory
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari event..."
            />

            <div className="filter-group">
              <select
                className="filter-select"
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
              >
                <option value="semua">Semua Kategori</option>
                <option value="seminar">Seminar</option>
                <option value="workshop">Workshop</option>
                <option value="lomba">Lomba</option>
                <option value="pelatihan">Pelatihan</option>
                <option value="lainnya">Lainnya</option>
              </select>

              <select
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="semua">Semua Status</option>
                <option value="mendatang">Mendatang</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
          </div>

          {/* Komponen Daftar Event - hanya tampil jika tidak loading dan tidak error */}
          {!loading && !error && (
            <DaftarEvent
              events={filteredEvents}
              onHapusEvent={handleHapusEvent}
              onEditEvent={handleEditEvent}
              onViewDetail={handleViewDetail}
            />
          )}

          {/* Modal Detail Event */}
          {selectedEvent && (
            <div className="modal">
              <DetailEvent
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
              />
            </div>
          )}
        </main>

        <footer className="app-footer">
          <p>© 2025 Sistem Manajemen Event Kampus</p>
        </footer>
      </div>
    </>
  );
}

export default AdminPanel;
