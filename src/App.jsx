import { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css";
import DaftarEvent from "./components/DaftarEvent";
import FormTambahEvent from "./components/FormTambahEvent";
import StatistikEvent from "./components/StatistikEvent";
import DetailEvent from "./components/DetailEvent";
import { v4 as uuidv4 } from "uuid";

// Fungsi helper untuk memeriksa status event
const cekStatusEvent = (tanggal, waktu = "00:00") => {
  const now = new Date();
  const [year, month, day] = tanggal.split("-").map(Number);
  const [hours, minutes] = waktu.split(":").map(Number);
  const eventDate = new Date(year, month - 1, day, hours, minutes);
  
  return {
    status: now < eventDate ? "mendatang" : "selesai",
    // Waktu tersisa dalam milidetik sampai event berubah status
    timeUntilStatusChange: Math.max(0, now < eventDate ? 
      eventDate - now : 
      // If event is in the past, return a very large number
      Number.MAX_SAFE_INTEGER
    )
  };
};

function App() {
  // Load events from localStorage on initial render
  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem("events");
    if (savedEvents) {
      return JSON.parse(savedEvents);
    }
    // Default events jika belum ada data di localStorage
    return [
      {
        id: uuidv4(),
        nama: "Seminar Teknologi",
        deskripsi: "Seminar tentang perkembangan teknologi terbaru di dunia IT",
        tanggal: "2025-11-01",
        waktu: "09:00",
        lokasi: "Aula Utama",
        kategori: "Seminar",
      },
      {
        id: uuidv4(),
        nama: "Workshop Programming",
        deskripsi: "Belajar dasar-dasar pemrograman untuk pemula",
        tanggal: "2025-11-15",
        waktu: "13:00",
        lokasi: "Lab Komputer",
        kategori: "Workshop",
      },
    ];
  });

  // Simpan ke localStorage setiap kali events berubah
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  // State untuk pencarian dan filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKategori, setFilterKategori] = useState("semua");
  const [filterStatus, setFilterStatus] = useState("semua");
  
  // State untuk manajemen event yang sedang dilihat/diedit
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);

  // Fungsi untuk menambah event baru
  const handleTambahEvent = useCallback((newEvent) => {
    const eventDenganId = {
      ...newEvent,
      id: uuidv4(),
    };
    setEvents((prevEvents) => [...prevEvents, eventDenganId]);
  }, []);

  // Fungsi untuk mengupdate event yang ada
  const handleUpdateEvent = useCallback((updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    setEventToEdit(null); // Keluar dari mode edit
  }, []);

  // Fungsi untuk melihat detail event
  const handleViewDetail = useCallback((event) => {
    setSelectedEvent(event);
  }, []);

  // Fungsi untuk memulai mode edit
  const handleEditEvent = useCallback((event) => {
    setEventToEdit(event);
    // Scroll ke form edit
    document.getElementById('form-event').scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fungsi untuk membatalkan edit
  const handleCancelEdit = useCallback(() => {
    setEventToEdit(null);
  }, []);

  // Fungsi untuk menghapus event
  const handleHapusEvent = useCallback((id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus event ini?")) {
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
    }
  }, []);

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
    // Cari event terdekat yang akan berubah status
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
      // Only update if stats actually changed
      return JSON.stringify(prev) !== JSON.stringify(newStats) ? newStats : prev;
    });
  }, [events, statusUpdateTrigger]); // Add statusUpdateTrigger as dependency

  // Effect untuk update periodik (setiap menit) sebagai fallback
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusUpdateTrigger(prev => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📅 Sistem Manajemen Event Kampus</h1>
      </header>

      <main className="app-main">
        {/* Komponen Statistik */}
        <StatistikEvent statistik={statistik} />

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
          <input
            type="text"
            placeholder="Cari event..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* Komponen Daftar Event */}
        <DaftarEvent
          events={filteredEvents}
          onHapusEvent={handleHapusEvent}
          onEditEvent={handleEditEvent}
          onViewDetail={handleViewDetail}
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
        <p> 2025 Sistem Manajemen Event Kampus</p>
      </footer>
    </div>
  );
}

export default App;
