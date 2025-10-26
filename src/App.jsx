import { useState } from "react";
import "./App.css";
import DaftarEvent from "./components/DaftarEvent";
import FormTambahEvent from "./components/FormTambahEvent";

function App() {
  // State untuk menyimpan daftar event
  const [events, setEvents] = useState([
    {
      nama: "Seminar Teknologi",
      tanggal: "2025-11-01",
      lokasi: "Aula Utama",
    },
    {
      nama: "Workshop Programming",
      tanggal: "2025-11-15",
      lokasi: "Lab Komputer",
    },
  ]);

  // Handler untuk menambah event baru
  const handleTambahEvent = (newEvent) => {
    setEvents([...events, newEvent]);
  };

  return (
    <div className="app-container">
      <h1>Sistem Manajemen Event Kampus</h1>

      {/* Komponen Form untuk menambah event - menggunakan props untuk callback function */}
      <FormTambahEvent onTambahEvent={handleTambahEvent} />

      {/* Komponen untuk menampilkan daftar event - menggunakan props untuk data */}
      <DaftarEvent events={events} />
    </div>
  );
}

export default App;
