import { useState, useEffect } from "react";

function FormTambahEvent({ onTambahEvent, eventToEdit, onUpdateEvent, onCancelEdit }) {
  // State untuk menyimpan data form
  const [formData, setFormData] = useState({
    id: "",
    nama: "",
    deskripsi: "",
    tanggal: "",
    waktu: "",
    lokasi: "",
    kategori: "seminar",
  });

  // Update form data when eventToEdit changes
  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        id: eventToEdit.id,
        nama: eventToEdit.nama || "",
        deskripsi: eventToEdit.deskripsi || "",
        tanggal: eventToEdit.tanggal || "",
        waktu: eventToEdit.waktu || "",
        lokasi: eventToEdit.lokasi || "",
        kategori: eventToEdit.kategori || "seminar",
      });
    } else {
      // Reset form when not in edit mode
      setFormData({
        id: "",
        nama: "",
        deskripsi: "",
        tanggal: "",
        waktu: "",
        lokasi: "",
        kategori: "seminar",
      });
    }
  }, [eventToEdit]);

  // State untuk validasi
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validasi form
  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split("T")[0];

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama event harus diisi";
    } else if (formData.nama.length < 5) {
      newErrors.nama = "Nama event minimal 5 karakter";
    }

    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = "Deskripsi harus diisi";
    } else if (formData.deskripsi.length < 20) {
      newErrors.deskripsi = "Deskripsi minimal 20 karakter";
    }

    // Get current date in local timezone (YYYY-MM-DD format)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;
    
    // Get current time in HH:MM format
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;
    
    if (!formData.tanggal) {
      newErrors.tanggal = "Tanggal harus diisi";
    } else if (formData.tanggal < currentDate) {
      newErrors.tanggal = "Tanggal tidak boleh di masa lalu";
    } else if (formData.tanggal === currentDate) {
      // If selected date is today, check if time is in the future
      if (!formData.waktu) {
        newErrors.waktu = "Waktu harus diisi";
      } else if (formData.waktu <= currentTime) {
        newErrors.waktu = "Waktu harus di masa depan";
      }
    }

    if (!formData.waktu) {
      newErrors.waktu = "Waktu harus diisi";
    }

    if (!formData.lokasi.trim()) {
      newErrors.lokasi = "Lokasi harus diisi";
    }

    return newErrors;
  };

  // Handler untuk perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error saat user mulai mengetik
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handler untuk submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true);
      
      // Simulasikan API call
      setTimeout(() => {
        if (eventToEdit) {
          onUpdateEvent(formData);
        } else {
          onTambahEvent(formData);
        }
        
        // Reset form jika bukan dalam mode edit
        if (!eventToEdit) {
          setFormData({
            id: "",
            nama: "",
            deskripsi: "",
            tanggal: "",
            waktu: "",
            lokasi: "",
            kategori: "seminar",
          });
        }
        
        setIsSubmitting(false);
        alert(`Event berhasil ${eventToEdit ? 'diperbarui' : 'ditambahkan'}!`);
      }, 1000);
    } else {
      setErrors(formErrors);
    }
  };

  // Handler untuk tombol batal edit
  const handleCancel = () => {
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <div className="form-container">
      <h2>{eventToEdit ? '✏️ Edit Event' : '📝 Tambah Event Baru'}</h2>
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="nama">Nama Event*</label>
          <input
            type="text"
            id="nama"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            className={errors.nama ? "error" : ""}
            placeholder="Contoh: Seminar Teknologi Terkini"
          />
          {errors.nama && <span className="error-message">{errors.nama}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="deskripsi">Deskripsi*</label>
          <textarea
            id="deskripsi"
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleChange}
            rows="4"
            className={errors.deskripsi ? "error" : ""}
            placeholder="Jelaskan detail acara secara lengkap..."
          ></textarea>
          {errors.deskripsi && (
            <span className="error-message">{errors.deskripsi}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tanggal">Tanggal*</label>
            <input
              type="date"
              id="tanggal"
              name="tanggal"
              value={formData.tanggal}
              onChange={handleChange}
              className={`form-input ${errors.tanggal ? "input-error" : ""}`}
              required
              min={(() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              })()}
            />
            {errors.tanggal && (
              <span className="error-message">{errors.tanggal}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="waktu">Waktu*</label>
            <input
              type="time"
              id="waktu"
              name="waktu"
              value={formData.waktu}
              onChange={handleChange}
              className={errors.waktu ? "error" : ""}
            />
            {errors.waktu && (
              <span className="error-message">{errors.waktu}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="lokasi">Lokasi*</label>
            <input
              type="text"
              id="lokasi"
              name="lokasi"
              value={formData.lokasi}
              onChange={handleChange}
              className={errors.lokasi ? "error" : ""}
              placeholder="Contoh: Aula Utama Kampus"
            />
            {errors.lokasi && (
              <span className="error-message">{errors.lokasi}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="kategori">Kategori*</label>
            <select
              id="kategori"
              name="kategori"
              value={formData.kategori}
              onChange={handleChange}
            >
              <option value="seminar">Seminar</option>
              <option value="workshop">Workshop</option>
              <option value="lomba">Lomba</option>
              <option value="pelatihan">Pelatihan</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          {eventToEdit && (
            <button 
              type="button" 
              className="cancel-button"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Batal Edit
            </button>
          )}
          <button 
            type="submit" 
            className="submit-button" 
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? 'Menyimpan...' 
              : eventToEdit ? 'Update Event' : 'Simpan Event'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormTambahEvent;
