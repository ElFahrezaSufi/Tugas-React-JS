import { useEffect, useRef, useLayoutEffect } from "react";
import useFormReducer from "../hooks/useFormReducer";

const initialFormData = {
  id: "",
  nama: "",
  deskripsi: "",
  tanggal: "",
  waktu: "",
  lokasi: "",
  kategori: "seminar",
};

function FormTambahEvent({ onTambahEvent, eventToEdit, onUpdateEvent, onCancelEdit }) {
  // Gunakan useFormReducer untuk mengelola state form
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    setFieldValue,
    setErrors,
    setSubmitting,
    resetForm
  } = useFormReducer(initialFormData);

  // Auto-focus nama input saat component mount atau saat edit mode
  useEffect(() => {
    namaInputRef.current?.focus();
  }, [eventToEdit]);

  // Auto-resize textarea
  const prevDeskripsiRef = useRef('');
  
  useLayoutEffect(() => {
    const textarea = deskripsiInputRef.current;
    if (!textarea) return;

    // Hanya jalankan jika deskripsi berubah
    if (prevDeskripsiRef.current !== formData.deskripsi) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      prevDeskripsiRef.current = formData.deskripsi;
    }
  });
  
  // Handler khusus untuk textarea dengan auto-resize
  const handleTextareaChange = (e) => {
    const { name, value } = e.target;
    setFieldValue(name, value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  // Update form data when eventToEdit changes
  useEffect(() => {
    if (eventToEdit) {
      const dataToLoad = {
        id: eventToEdit.id,
        nama: eventToEdit.nama || "",
        deskripsi: eventToEdit.deskripsi || "",
        tanggal: eventToEdit.tanggal || "",
        waktu: eventToEdit.waktu || "",
        lokasi: eventToEdit.lokasi || "",
        kategori: eventToEdit.kategori || "seminar",
      };
      
      // Gunakan resetForm untuk mengatur ulang form dengan data baru
      resetForm(dataToLoad);
      
      // Setelah reset, atur ulang tinggi textarea
      if (deskripsiInputRef.current) {
        deskripsiInputRef.current.style.height = 'auto';
        deskripsiInputRef.current.style.height = 
          `${Math.min(deskripsiInputRef.current.scrollHeight, 200)}px`;
      }
    } else if (eventToEdit === null) {
      // Hanya reset form jika benar-benar keluar dari mode edit
      resetForm(initialFormData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventToEdit?.id]); // Hanya jalankan ulang jika ID eventToEdit berubah

  // State untuk validasi dan form handling sudah dihandle oleh useFormReducer

  // useRef untuk focus management dan scroll
  const namaInputRef = useRef(null);
  const deskripsiInputRef = useRef(null);
  const tanggalInputRef = useRef(null);
  const waktuInputRef = useRef(null);
  const lokasiInputRef = useRef(null);
  const formContainerRef = useRef(null);

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

  // handleChange sudah dihandle oleh useFormReducer
  // handleChange di sini hanya untuk override jika diperlukan

  // Handler untuk submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length === 0) {
      setSubmitting(true);
      
      // Simulasikan API call
      setTimeout(() => {
        if (eventToEdit) {
          onUpdateEvent(formData);
        } else {
          onTambahEvent(formData);
        }
        
        // Reset form jika bukan dalam mode edit
        if (!eventToEdit) {
          resetForm(initialFormData);
        }
        
        setSubmitting(false);
        alert(`Event berhasil ${eventToEdit ? 'diperbarui' : 'ditambahkan'}!`);
      }, 1000);
    } else {
      setErrors(formErrors);
      // Focus ke field pertama yang error dan scroll
      if (formErrors.nama) {
        namaInputRef.current?.focus();
      } else if (formErrors.deskripsi) {
        deskripsiInputRef.current?.focus();
      } else if (formErrors.tanggal) {
        tanggalInputRef.current?.focus();
      } else if (formErrors.waktu) {
        waktuInputRef.current?.focus();
      } else if (formErrors.lokasi) {
        lokasiInputRef.current?.focus();
      }
      // Scroll ke form container
      formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handler untuk tombol batal edit
  const handleCancel = () => {
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <div className="form-container" ref={formContainerRef}>
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
            ref={namaInputRef}
          />
          {errors.nama && <span className="error-message">{errors.nama}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="deskripsi">Deskripsi*</label>
          <textarea
            id="deskripsi"
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleTextareaChange}
            className={`form-textarea ${errors.deskripsi ? "error" : ""}`}
            placeholder="Jelaskan detail acara secara lengkap..."
            ref={deskripsiInputRef}
            style={{ resize: 'none', overflow: 'hidden', minHeight: '100px' }}
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
              ref={tanggalInputRef}
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
              ref={waktuInputRef}
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
              ref={lokasiInputRef}
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
