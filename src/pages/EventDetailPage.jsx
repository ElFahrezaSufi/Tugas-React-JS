import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaArrowLeft, FaUserPlus } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

/**
 * EventDetailPage - Halaman detail event dengan dynamic route /event/:id
 * Menggunakan useParams() untuk ambil ID dari URL
 */
function EventDetailPage() {
  const { id } = useParams(); // useParams untuk ambil dynamic route parameter
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Load event dari localStorage berdasarkan ID
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const foundEvent = events.find(e => e.id === id);
    
    if (foundEvent) {
      setEvent(foundEvent);
      
      // Check apakah user sudah daftar event ini
      const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
      const userRegistered = registrations.some(
        reg => reg.eventId === id && reg.userId === user?.id && reg.status === 'registered'
      );
      setIsRegistered(userRegistered);
    }
    
    setLoading(false);
  }, [id, user]);

  // Format tanggal
  const formatTanggal = (dateString) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Format waktu
  const formatWaktu = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  // Check status event
  const getStatusEvent = (tanggal, waktu = '00:00') => {
    const now = new Date();
    const [year, month, day] = tanggal.split('-').map(Number);
    const [hours, minutes] = waktu.split(':').map(Number);
    const eventDate = new Date(year, month - 1, day, hours, minutes);
    return now < eventDate ? 'mendatang' : 'selesai';
  };

  // Handler untuk registrasi event
  const handleRegister = () => {
    if (!user) {
      alert('Anda harus login terlebih dahulu');
      return;
    }

    const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
    
    const newRegistration = {
      id: Date.now().toString(),
      eventId: id,
      userId: user.id,
      userName: user.nama,
      userEmail: user.email,
      registeredAt: new Date().toISOString(),
      status: 'registered',
    };

    registrations.push(newRegistration);
    localStorage.setItem('eventRegistrations', JSON.stringify(registrations));
    
    setIsRegistered(true);
    alert('Berhasil mendaftar ke event!');
  };

  // Handler untuk cancel registrasi
  const handleCancelRegistration = () => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan pendaftaran?')) {
      const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
      const updatedRegistrations = registrations.filter(
        reg => !(reg.eventId === id && reg.userId === user?.id)
      );
      localStorage.setItem('eventRegistrations', JSON.stringify(updatedRegistrations));
      
      setIsRegistered(false);
      alert('Pendaftaran berhasil dibatalkan');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar />
        <div className="app-container">
          <div className="notfound-content">
            <h2>Event Tidak Ditemukan</h2>
            <p>Event yang Anda cari tidak ada atau telah dihapus.</p>
            <Link to="/" className="notfound-button">
              <FaArrowLeft className="button-icon" />
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </>
    );
  }

  const status = getStatusEvent(event.tanggal, event.waktu);

  return (
    <>
      <Navbar />
      <div className="app-container">
        <div className="event-detail-page">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link to="/">Dashboard</Link>
            <span className="breadcrumb-separator">/</span>
            <span>Detail Event</span>
          </nav>

          {/* Back Button */}
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Kembali
          </button>

          {/* Event Header */}
          <div className="event-detail-header">
            <div className="event-detail-title-section">
              <h1>{event.nama}</h1>
              <span className={`status-badge-large ${status}`}>
                {status === 'mendatang' ? 'Akan Datang' : 'Sudah Selesai'}
              </span>
            </div>
            <span className="kategori-badge-large">{event.kategori}</span>
          </div>

          {/* Event Details */}
          <div className="event-detail-content">
            <div className="event-detail-card">
              <h3>Tentang Event</h3>
              <p className="event-description-full">{event.deskripsi}</p>
            </div>

            <div className="event-detail-card">
              <h3>Informasi Acara</h3>
              <div className="event-info-grid">
                <div className="info-item">
                  <FaCalendarAlt className="info-icon" />
                  <div>
                    <h4>Tanggal</h4>
                    <p>{formatTanggal(event.tanggal)}</p>
                  </div>
                </div>

                <div className="info-item">
                  <FaClock className="info-icon" />
                  <div>
                    <h4>Waktu</h4>
                    <p>{formatWaktu(event.waktu)} WIB</p>
                  </div>
                </div>

                <div className="info-item">
                  <FaMapMarkerAlt className="info-icon" />
                  <div>
                    <h4>Lokasi</h4>
                    <p>{event.lokasi}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Section - hanya untuk user biasa dan event mendatang */}
            {user?.role !== 'admin' && status === 'mendatang' && (
              <div className="event-registration-card">
                <h3>Pendaftaran</h3>
                {isRegistered ? (
                  <div className="registration-status">
                    <p className="registered-message">
                      ✓ Anda sudah terdaftar di event ini
                    </p>
                    <button
                      className="cancel-registration-button"
                      onClick={handleCancelRegistration}
                    >
                      Batalkan Pendaftaran
                    </button>
                  </div>
                ) : (
                  <div className="registration-action">
                    <p>Daftarkan diri Anda untuk mengikuti event ini</p>
                    <button
                      className="register-button"
                      onClick={handleRegister}
                    >
                      <FaUserPlus /> Daftar Sekarang
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default EventDetailPage;
