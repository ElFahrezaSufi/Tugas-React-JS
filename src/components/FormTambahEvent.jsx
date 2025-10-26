import { useState } from "react";

// Komponen untuk menambah event baru
function FormTambahEvent({ onTambahEvent }) {
  // State untuk menyimpan data form
  const [formData, setFormData] = useState({
    nama: "",
    tanggal: "",
    lokasi: "",
  });

  // Handler untuk perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handler untuk submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    onTambahEvent(formData);
    // Reset form setelah submit
    setFormData({
      nama: "",
      tanggal: "",
      lokasi: "",
    });
  };

  return (
    <div className="form-tambah-event">
      <h2>Tambah Event Baru</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nama">Nama Event:</label>
          <input
            type="text"
            id="nama"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="tanggal">Tanggal:</label>
          <input
            type="date"
            id="tanggal"
            name="tanggal"
            value={formData.tanggal}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lokasi">Lokasi:</label>
          <input
            type="text"
            id="lokasi"
            name="lokasi"
            value={formData.lokasi}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Tambah Event</button>
      </form>
    </div>
  );
}

export default FormTambahEvent;
