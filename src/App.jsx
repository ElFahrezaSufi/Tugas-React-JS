import { useState, useMemo } from "react";
import "./App.css";
import DaftarEvent from "./components/DaftarEvent";
import FormTambahEvent from "./components/FormTambahEvent";
import StatistikEvent from "./components/StatistikEvent";
import { v4 as uuidv4 } from 'uuid';

function App() {
  // State untuk menyimpan daftar event
  const [events, setEvents] = useState([
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
  ]);

  // State untuk pencarian dan filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKategori, setFilterKategori] = useState("semua");
  const [filterStatus, setFilterStatus] = useState("semua");

  // Fungsi untuk menambah event baru
  const handleTambahEvent = (newEvent) => {
    const eventDenganId = {
      ...newEvent,
      id: uuidv4(),
    };
    setEvents([...events, eventDenganId]);
  };

  // Fungsi untuk menghapus event
  const handleHapusEvent = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus event ini?')) {
      setEvents(events.filter(event => event.id !== id));
    }
  };

  // Filter dan pencarian event
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesKategori = filterKategori === "semua" || 
                            event.kategori.toLowerCase() === filterKategori.toLowerCase();
      
      const today = new Date().toISOString().split('T')[0];
      const eventDate = event.tanggal;
      let matchesStatus = true;
      
      if (filterStatus === 'mendatang') {
        matchesStatus = eventDate >= today;
      } else if (filterStatus === 'selesai') {
        matchesStatus = eventDate < today;
      }
      
      return matchesSearch && matchesKategori && matchesStatus;
    });
  }, [events, searchTerm, filterKategori, filterStatus]);

  // Hitung statistik
  const statistik = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const total = events.length;
    const mendatang = events.filter(event => event.tanggal >= today).length;
    const selesai = events.filter(event => event.tanggal < today).length;
    
    return { total, mendatang, selesai };
  }, [events]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📅 Sistem Manajemen Event Kampus</h1>
      </header>

      <main className="app-main">
        {/* Komponen Statistik */}
        <StatistikEvent statistik={statistik} />

        {/* Komponen Form */}
        <FormTambahEvent onTambahEvent={handleTambahEvent} />

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
        />
      </main>

      <footer className="app-footer">
        <p>© 2025 Sistem Manajemen Event Kampus</p>
      </footer>
    </div>
  );
}

export default App;
