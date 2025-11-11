import { useState, useEffect, useMemo } from "react";
import DaftarEvent from "../components/DaftarEvent";
import StatistikEvent from "../components/StatistikEvent";
import DetailEvent from "../components/DetailEvent";
import Navbar from "../components/Navbar";
import SearchWithHistory from "../components/SearchWithHistory";
import { useAuth } from "../contexts/AuthContext";

// Fungsi helper untuk memeriksa status event
const cekStatusEvent = (tanggal, waktu = "00:00") => {
  const now = new Date();
  const [year, month, day] = tanggal.split("-").map(Number);
  const [hours, minutes] = waktu.split(":").map(Number);
  const eventDate = new Date(year, month - 1, day, hours, minutes);
  
  return {
    status: now < eventDate ? "mendatang" : "selesai",
    timeUntilStatusChange: Math.max(0, now < eventDate ? 
      eventDate - now : 
      Number.MAX_SAFE_INTEGER
    )
  };
};

/**
 * Dashboard - Halaman utama untuk melihat event (User View - Read Only)
 */
function Dashboard() {
  const { user } = useAuth();

  // Load events from localStorage
  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem("events");
    return savedEvents ? JSON.parse(savedEvents) : [];
  });

  // State untuk pencarian dan filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKategori, setFilterKategori] = useState("semua");
  const [filterStatus, setFilterStatus] = useState("semua");
  
  // State untuk manajemen event yang sedang dilihat
  const [selectedEvent, setSelectedEvent] = useState(null);

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
      const matchesStatus = filterStatus === "semua" || statusInfo.status === filterStatus;

      return matchesSearch && matchesKategori && matchesStatus;
    });
  }, [events, searchTerm, filterKategori, filterStatus, statusUpdateTrigger]);

  // Effect untuk mengupdate status event secara real-time
  useEffect(() => {
    const now = new Date();
    const nextUpdates = events.map(event => {
      const statusInfo = cekStatusEvent(event.tanggal, event.waktu);
      return statusInfo.timeUntilStatusChange;
    }).filter(time => time > 0 && time < Number.MAX_SAFE_INTEGER);

    if (nextUpdates.length > 0) {
      const nextUpdate = Math.min(...nextUpdates);
      const timer = setTimeout(() => {
        setStatusUpdateTrigger(prev => prev + 1);
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
          if (statusInfo.status === 'mendatang') {
            acc.mendatang += 1;
          } else {
            acc.selesai += 1;
          }
        } catch (error) {
          console.error('Error processing event:', event, error);
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
    setStatistik(prev => {
      return JSON.stringify(prev) !== JSON.stringify(newStats) ? newStats : prev;
    });
  }, [events, statusUpdateTrigger]);

  // Effect untuk update periodik (setiap menit) sebagai fallback
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusUpdateTrigger(prev => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Fungsi untuk melihat detail event
  const handleViewDetail = (event) => {
    setSelectedEvent(event);
  };

  // Dummy functions untuk user (tidak bisa edit/hapus)
  const handleHapusEvent = () => {
    alert("Anda tidak memiliki akses untuk menghapus event. Hanya admin yang bisa menghapus event.");
  };

  const handleEditEvent = () => {
    alert("Anda tidak memiliki akses untuk mengedit event. Hanya admin yang bisa mengedit event.");
  };

  return (
    <>
      <Navbar />
      <div className="app-container">
        <header className="app-header">
          <h1>📅 Dashboard Event Kampus</h1>
          <p className="welcome-message">
            Selamat datang, <strong>{user?.nama}</strong>! 
            {user?.role === 'user' && ' Anda dapat melihat daftar event yang tersedia.'}
          </p>
        </header>

        <main className="app-main">
          {/* Komponen Statistik */}
          <StatistikEvent statistik={statistik} />

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

          {/* Info untuk user biasa */}
          {user?.role === 'user' && (
            <div className="alert alert-info user-info">
              <strong>Info:</strong> Anda login sebagai User. Untuk mengelola event (tambah, edit, hapus), 
              silakan hubungi administrator.
            </div>
          )}

          {/* Komponen Daftar Event */}
          <DaftarEvent
            events={filteredEvents}
            onHapusEvent={handleHapusEvent}
            onEditEvent={handleEditEvent}
            onViewDetail={handleViewDetail}
            showEditDelete={false}
          />

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

export default Dashboard;
