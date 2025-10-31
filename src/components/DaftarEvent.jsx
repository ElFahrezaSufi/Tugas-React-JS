import { useState, useEffect } from 'react';
import { FaTrash, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaInfoCircle } from 'react-icons/fa';

// Komponen untuk menampilkan daftar event
function DaftarEvent({ events, onHapusEvent }) {
  const [filteredEvents, setFilteredEvents] = useState(events);
  
  // Update filtered events when events prop changes
  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  // Format tanggal ke format Indonesia
  const formatTanggal = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Format waktu ke format 24 jam
  const formatWaktu = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Ambil hanya jam dan menit
  };

  // Tentukan status event (mendatang/sudah lewat)
  const getStatusEvent = (tanggal) => {
    const today = new Date().toISOString().split('T')[0];
    return tanggal >= today ? 'mendatang' : 'selesai';
  };

  // Dapatkan class CSS berdasarkan kategori (case insensitive)
  const getKategoriClass = (kategori) => {
    if (!kategori) return 'kategori-lainnya';
    
    const kategoriLower = kategori.toLowerCase();
    const kategoriMap = {
      'seminar': 'kategori-seminar',
      'workshop': 'kategori-workshop',
      'lomba': 'kategori-lomba',
      'pelatihan': 'kategori-pelatihan',
      'lainnya': 'kategori-lainnya'
    };
    return kategoriMap[kategoriLower] || 'kategori-lainnya';
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
            className={`event-card ${getStatusEvent(event.tanggal)}`}
          >
            <div className="event-header">
              <span className={`kategori-badge ${getKategoriClass(event.kategori)}`}>
                {event.kategori}
              </span>
              <button 
                className="hapus-button"
                onClick={() => onHapusEvent(event.id)}
                aria-label="Hapus event"
              >
                <FaTrash />
              </button>
            </div>
            
            <div className="event-body">
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
              <span className={`status-badge ${getStatusEvent(event.tanggal)}`}>
                {getStatusEvent(event.tanggal) === 'mendatang' ? 'Mendatang' : 'Selesai'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DaftarEvent;
