import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaInfoCircle,
  FaEdit,
  FaEye,
  FaUserFriends,
} from "react-icons/fa";
import EventCountdown from "./EventCountdown";
import RegistrationList from "./RegistrationList";
import { getEventRegistrations } from "../services/registrationsApi";

// Komponen untuk menampilkan daftar event
function DaftarEvent({
  events,
  onHapusEvent,
  onEditEvent,
  onViewDetail,
  showEditDelete = true,
}) {
  const navigate = useNavigate();
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [registrationsModal, setRegistrationsModal] = useState(null);
  const [registrationTrigger, setRegistrationTrigger] = useState(0);
  const [regCounts, setRegCounts] = useState({});

  // Fungsi untuk memeriksa status event
  const getStatusEvent = useCallback((tanggal, waktu = "00:00") => {
    const now = new Date();
    const [year, month, day] = tanggal.split("-").map(Number);
    const [hours, minutes] = waktu.split(":").map(Number);
    const eventDate = new Date(year, month - 1, day, hours, minutes);
    return now < eventDate ? "mendatang" : "selesai";
  }, []);

  // Update filtered events when events prop changes
  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  // Auto-update status event setiap menit
  useEffect(() => {
    const interval = setInterval(() => {
      setFilteredEvents((prevEvents) => [...prevEvents]); // Memicu re-render
    }, 60000); // Setiap 1 menit

    return () => clearInterval(interval); // Cleanup
  }, []);

  // Fetch registration counts from server
  useEffect(() => {
    if (!events || events.length === 0) return;
    (async () => {
      try {
        const counts = {};
        await Promise.all(
          events.map(async (evt) => {
            try {
              const regs = await getEventRegistrations(evt.id, null).catch(
                () => []
              );
              counts[evt.id] = (regs || []).length;
            } catch {
              counts[evt.id] = 0;
            }
          })
        );
        setRegCounts(counts);
      } catch (err) {
        console.warn("Failed to fetch registration counts", err);
      }
    })();
  }, [events, registrationTrigger]);

  // Handler untuk menutup modal dan update badge count
  const handleCloseModal = () => {
    setRegistrationsModal(null);
    setRegistrationTrigger((prev) => prev + 1); // Force update badge counts
  };

  // Hitung jumlah pendaftar per event dari server API
  const getRegistrationCount = useCallback(
    (eventId) => regCounts[eventId] || 0,
    [regCounts]
  );

  // Format tanggal ke format Indonesia
  const formatTanggal = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Format waktu ke format 24 jam
  const formatWaktu = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5); // Ambil hanya jam dan menit
  };

  // Dapatkan class CSS berdasarkan kategori (case insensitive)
  const getKategoriClass = (kategori) => {
    if (!kategori) return "kategori-lainnya";

    const kategoriLower = kategori.toLowerCase();
    const kategoriMap = {
      seminar: "kategori-seminar",
      workshop: "kategori-workshop",
      lomba: "kategori-lomba",
      pelatihan: "kategori-pelatihan",
      lainnya: "kategori-lainnya",
    };
    return kategoriMap[kategoriLower] || "kategori-lainnya";
  };

  // Tampilkan pesan jika tidak ada event
  if (filteredEvents.length === 0) {
    return (
      <div className="daftar-event kosong">
        <div className="empty-state">
          <FaInfoCircle className="empty-icon" />
          <h3>Tidak Ada Event</h3>
          <p>Belum ada event yang tersedia. Silakan tambahkan event baru.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="daftar-event">
      <h2>📅 Daftar Event Kampus</h2>
      <p className="total-event">Menampilkan {filteredEvents.length} event</p>

      <div className="event-grid">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className={`event-card ${getStatusEvent(
              event.tanggal,
              event.waktu
            )}`}
          >
            <div className="event-header">
              <span
                className={`kategori-badge ${getKategoriClass(event.kategori)}`}
              >
                {event.kategori}
              </span>
              <div className="event-actions">
                <button
                  className="action-button view-button"
                  onClick={() => navigate(`/event/${event.id}`)}
                  aria-label="Lihat detail"
                  title="Lihat Detail"
                >
                  <FaEye />
                </button>
                {showEditDelete && (
                  <>
                    <button
                      className="action-button view-button"
                      onClick={() => setRegistrationsModal(event)}
                      aria-label="Lihat peserta"
                      title="Lihat Peserta"
                      style={{ position: "relative" }}
                    >
                      <FaUserFriends />
                      <span className="badge-count">
                        {getRegistrationCount(event.id)}
                      </span>
                    </button>
                    <button
                      className="action-button edit-button"
                      onClick={() => onEditEvent(event)}
                      aria-label="Edit event"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-button delete-button"
                      onClick={() => onHapusEvent(event.id)}
                      aria-label="Hapus event"
                      title="Hapus"
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="event-body">
              {/* Countdown badge untuk event mendatang */}
              {getStatusEvent(event.tanggal, event.waktu) === "mendatang" && (
                <EventCountdown tanggal={event.tanggal} waktu={event.waktu} />
              )}
              <h3 className="event-judul">{event.nama}</h3>
              <p className="event-deskripsi">{event.deskripsi}</p>

              <div className="event-detail">
                <div className="detail-item">
                  <FaCalendarAlt className="detail-icon" />
                  <span>{formatTanggal(event.tanggal)}</span>
                </div>

                {event.waktu && (
                  <div className="detail-item">
                    <FaClock className="detail-icon" />
                    <span>{formatWaktu(event.waktu)} WIB</span>
                  </div>
                )}

                <div className="detail-item">
                  <FaMapMarkerAlt className="detail-icon" />
                  <span>{event.lokasi}</span>
                </div>
              </div>
            </div>

            <div className="event-footer">
              <span
                className={`status-badge ${getStatusEvent(
                  event.tanggal,
                  event.waktu
                )}`}
              >
                {getStatusEvent(event.tanggal, event.waktu) === "mendatang"
                  ? "Mendatang"
                  : "Selesai"}
              </span>
            </div>
          </div>
        ))}
      </div>
      {registrationsModal && (
        <RegistrationList
          eventId={registrationsModal.id}
          eventName={registrationsModal.nama}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default DaftarEvent;
