import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import {
  getMyRegistrations,
  cancelRegistrationById,
} from "../services/registrationsApi";

/**
 * MyRegistrations - Halaman untuk melihat event yang sudah didaftarkan user
 */
function MyRegistrations() {
  const { user } = useAuth();
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const loadRegistrations = async () => {
      try {
        const token = user?.token;
        const regs = await getMyRegistrations(token).catch(() => []);
        if (cancelled) return;
        const allEvents = JSON.parse(localStorage.getItem("events") || "[]");

        const registrationsWithEventData = regs
          .map((reg) => {
            const event = allEvents.find((e) => e.id === reg.eventId);
            return { ...reg, event: event || null };
          })
          .filter((reg) => reg.event !== null);

        setMyRegistrations(registrationsWithEventData);
        setEvents(allEvents);
      } catch (err) {
        if (!cancelled) {
          setMyRegistrations([]);
          setEvents(JSON.parse(localStorage.getItem("events") || "[]"));
        }
      }
    };

    // Initial load
    loadRegistrations();

    const handleCustomEvent = () => {
      loadRegistrations();
    };

    window.addEventListener("eventRegistrationsChanged", handleCustomEvent);
    return () => {
      cancelled = true;
      window.removeEventListener(
        "eventRegistrationsChanged",
        handleCustomEvent
      );
    };
  }, [user]);

  const handleCancelRegistration = (registrationId, eventName) => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin membatalkan pendaftaran event "${eventName}"?`
      )
    ) {
      (async () => {
        try {
          const token = user?.token;
          // find the registration to get its eventId (we have it in state)
          const reg = myRegistrations.find((r) => r.id === registrationId);
          if (!reg) {
            alert("Registrasi tidak ditemukan");
            return;
          }
          await cancelRegistrationById(reg.eventId, registrationId, token);
          setMyRegistrations((prev) =>
            prev.filter((r) => r.id !== registrationId)
          );
          try {
            window.dispatchEvent(new Event("eventRegistrationsChanged"));
          } catch (_) {}
          alert("Pendaftaran berhasil dibatalkan");
        } catch (err) {
          console.error("Failed to cancel registration", err);
          alert(err.message || "Gagal membatalkan pendaftaran");
        }
      })();
    }
  };

  // Format tanggal
  const formatTanggal = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Format waktu
  const formatWaktu = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  // Check status event
  const getStatusEvent = (tanggal, waktu = "00:00") => {
    const now = new Date();
    const [year, month, day] = tanggal.split("-").map(Number);
    const [hours, minutes] = waktu.split(":").map(Number);
    const eventDate = new Date(year, month - 1, day, hours, minutes);
    return now < eventDate ? "mendatang" : "selesai";
  };

  return (
    <>
      <Navbar />
      <div className="app-container">
        <header className="app-header">
          <h1>📋 Event Saya</h1>
          <p className="welcome-message">
            Daftar event yang telah Anda daftarkan
          </p>
        </header>

        <main className="app-main">
          {myRegistrations.length === 0 ? (
            <div className="empty-state">
              <FaCalendarAlt className="empty-icon" />
              <h3>Belum Ada Event Terdaftar</h3>
              <p>
                Anda belum mendaftar ke event manapun. Silakan lihat daftar
                event yang tersedia.
              </p>
              <Link to="/" className="notfound-button">
                Lihat Daftar Event
              </Link>
            </div>
          ) : (
            <div className="registrations-grid">
              {myRegistrations.map((registration) => {
                const event = registration.event;
                const status = getStatusEvent(event.tanggal, event.waktu);

                return (
                  <div
                    key={registration.id}
                    className={`registration-card ${status}`}
                  >
                    <div className="registration-header">
                      <span className="kategori-badge">{event.kategori}</span>
                      <span className={`status-badge ${status}`}>
                        {status === "mendatang" ? "Mendatang" : "Selesai"}
                      </span>
                    </div>

                    <div className="registration-body">
                      <h3>{event.nama}</h3>
                      <p className="registration-description">
                        {event.deskripsi}
                      </p>

                      <div className="registration-details">
                        <div className="detail-item">
                          <FaCalendarAlt className="detail-icon" />
                          <span>{formatTanggal(event.tanggal)}</span>
                        </div>

                        <div className="detail-item">
                          <FaClock className="detail-icon" />
                          <span>{formatWaktu(event.waktu)} WIB</span>
                        </div>

                        <div className="detail-item">
                          <FaMapMarkerAlt className="detail-icon" />
                          <span>{event.lokasi}</span>
                        </div>
                      </div>

                      <div className="registration-date">
                        <small>
                          Didaftarkan pada:{" "}
                          {new Date(
                            registration.registeredAt
                          ).toLocaleDateString("id-ID")}
                        </small>
                      </div>
                    </div>

                    <div className="registration-actions">
                      <Link
                        to={`/event/${event.id}`}
                        className="action-button view-button"
                        title="Lihat Detail"
                      >
                        <FaEye /> Detail
                      </Link>
                      {status === "mendatang" && (
                        <button
                          className="action-button cancel-button"
                          onClick={() =>
                            handleCancelRegistration(
                              registration.id,
                              event.nama
                            )
                          }
                          title="Batalkan Pendaftaran"
                        >
                          <FaTimes /> Batalkan
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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

export default MyRegistrations;
