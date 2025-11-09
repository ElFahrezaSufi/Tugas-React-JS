import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaInfoCircle, FaTimes } from 'react-icons/fa';

// Komponen untuk menampilkan detail event dalam modal
function DetailEvent({ event, onClose }) {
  if (!event) return null;

  // Format tanggal ke format Indonesia
  const formatTanggal = (dateString) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Format waktu ke format 24 jam
  const formatWaktu = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Ambil hanya jam dan menit
  };

  // Dapatkan class CSS berdasarkan kategori
  const getKategoriClass = (kategori) => {
    if (!kategori) return 'kategori-lainnya';
    const kategoriLower = kategori.toLowerCase();
    const kategoriMap = {
      seminar: 'kategori-seminar',
      workshop: 'kategori-workshop',
      lomba: 'kategori-lomba',
      pelatihan: 'kategori-pelatihan',
      lainnya: 'kategori-lainnya',
    };
    return kategoriMap[kategoriLower] || 'kategori-lainnya';
  };

  // Tentukan status event
  const getStatusEvent = (tanggal, waktu = '00:00') => {
    const now = new Date();
    const [year, month, day] = tanggal.split('-').map(Number);
    const [hours, minutes] = waktu.split(':').map(Number);
    const eventDate = new Date(year, month - 1, day, hours, minutes);
    return now < eventDate ? 'mendatang' : 'selesai';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="event-header">
          <h2>{event.nama}</h2>
          <span className={`kategori-badge ${getKategoriClass(event.kategori)}`}>
            {event.kategori}
          </span>
        </div>

        <div className="event-detail-section">
          <h3>Detail Acara</h3>
          <p className="event-description">{event.deskripsi}</p>

          <div className="detail-grid">
            <div className="detail-item">
              <FaCalendarAlt className="detail-icon" />
              <div>
                <h4>Tanggal</h4>
                <p>{formatTanggal(event.tanggal)}</p>
              </div>
            </div>

            <div className="detail-item">
              <FaClock className="detail-icon" />
              <div>
                <h4>Waktu</h4>
                <p>{formatWaktu(event.waktu)} WIB</p>
              </div>
            </div>

            <div className="detail-item">
              <FaMapMarkerAlt className="detail-icon" />
              <div>
                <h4>Lokasi</h4>
                <p>{event.lokasi}</p>
              </div>
            </div>

            <div className="detail-item">
              <FaInfoCircle className="detail-icon" />
              <div>
                <h4>Status</h4>
                <p className={`status-text ${getStatusEvent(event.tanggal, event.waktu)}`}>
                  {getStatusEvent(event.tanggal, event.waktu) === 'mendatang' ? 'Akan Datang' : 'Sudah Selesai'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailEvent;
