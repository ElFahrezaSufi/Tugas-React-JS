import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaSave,
  FaTimes,
  FaCamera,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaCalendarAlt,
  FaRegCalendarCheck,
  FaAward,
  FaSpinner,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { getMyRegistrations } from "../services/registrationsApi";
import { FaRegCalendarXmark } from "react-icons/fa6";

// Helper function to get event status
const getEventStatus = (date, time = "00:00") => {
  const now = new Date();
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const eventDate = new Date(year, month - 1, day, hours, minutes);
  return now < eventDate ? "mendatang" : "selesai";
};

// Statistic Card Component
const StatCard = ({ icon: Icon, value, label, loading }) => (
  <div className="stat-card">
    <div className="stat-icon">
      {loading ? <FaSpinner className="spin" /> : <Icon />}
    </div>
    <div className="stat-content">
      <div className="stat-value">{loading ? "-" : value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

function UserProfile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    eventsCreated: 0,
    eventsAttended: 0,
    completed: 0,
    upcoming: 0,
    loading: true,
  });

  const [profileData, setProfileData] = useState({
    nama: user?.nama || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPwd, setShowPwd] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const namaInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch user statistics
  const fetchUserStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const events = JSON.parse(localStorage.getItem("events") || "[]");
      const registrations = await getMyRegistrations(user?.token).catch(
        () => []
      );

      // Count events created by user
      const createdEvents = events.filter((event) => event.userId === user?.id);

      // Count events user has registered for
      const userRegistrations = registrations.filter(
        (reg) => reg.userId === user?.id
      );

      // Count completed and upcoming events for this user
      const { completed, upcoming } = userRegistrations.reduce(
        (acc, reg) => {
          const event = events.find((e) => e.id === reg.eventId);
          if (!event) return acc;
          const status = getEventStatus(event.tanggal, event.waktu);
          if (status === "selesai") acc.completed += 1;
          else if (status === "mendatang") acc.upcoming += 1;
          return acc;
        },
        { completed: 0, upcoming: 0 }
      );

      setStats({
        eventsCreated: createdEvents.length,
        eventsAttended: userRegistrations.length,
        completed,
        upcoming,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      setStats((prev) => ({ ...prev, loading: false }));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.token]);

  // Load user stats on component mount
  useEffect(() => {
    if (user?.id) {
      fetchUserStats();
    }
  }, [user?.id, fetchUserStats]);

  useEffect(() => {
    if (user) {
      setProfileData({
        nama: user.nama || "",
        email: user.email || "",
      });
      setAvatar(user.avatar || null);
    }
  }, [user]);

  useEffect(() => {
    if (isEditing) {
      namaInputRef.current?.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isChangingPassword) {
      currentPasswordRef.current?.focus();
    }
  }, [isChangingPassword]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateProfile = () => {
    const newErrors = {};

    if (!profileData.nama.trim()) {
      newErrors.nama = "Nama harus diisi";
    } else if (profileData.nama.length < 3) {
      newErrors.nama = "Nama minimal 3 karakter";
    }

    if (!profileData.email.trim()) {
      newErrors.email = "Email harus diisi";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    return newErrors;
  };

  const validatePassword = () => {
    const newErrors = {};
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const currentUser = users.find((u) => u.id === user.id);

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Password lama harus diisi";
    } else if (
      currentUser &&
      passwordData.currentPassword !== currentUser.password
    ) {
      newErrors.currentPassword = "Password lama salah";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "Password baru harus diisi";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password minimal 6 karakter";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password harus diisi";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    return newErrors;
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const validationErrors = validateProfile();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = updateProfile({ ...profileData, avatar });
    if (result.success) {
      setSuccessMessage("Profile berhasil diupdate!");
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    const validationErrors = validatePassword();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, password: passwordData.newPassword } : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    setSuccessMessage("Password berhasil diubah!");
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const getInitials = (name) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimum 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <h1>Profil Saya</h1>
          <p>
            Kelola informasi profil Anda dan lihat statistik partisipasi event
          </p>
        </div>

        {successMessage && (
          <div className="success-message fade-in">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            {successMessage}
          </div>
        )}

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="avatar-upload">
              <div className="profile-avatar">
                {avatar || avatarPreview ? (
                  <img
                    src={avatarPreview || avatar}
                    alt="Profile"
                    className="avatar-image"
                  />
                ) : (
                  <span className="avatar-initials">
                    {getInitials(profileData.nama)}
                  </span>
                )}
              </div>

              <h3>{profileData.nama || "Pengguna"}</h3>
              <p>{profileData.email || "email@contoh.com"}</p>

              <div className="profile-actions">
                {!isEditing && !isChangingPassword ? (
                  <div className="button-group">
                    <button
                      className="action-button primary"
                      onClick={() => {
                        setIsEditing(true);
                        setIsChangingPassword(false);
                      }}
                    >
                      <FaEdit /> Edit Profil
                    </button>
                    <button
                      className="action-button secondary"
                      onClick={() => {
                        setIsChangingPassword(true);
                        setIsEditing(false);
                      }}
                    >
                      <FaLock /> Ganti Password
                    </button>
                  </div>
                ) : isEditing ? (
                  <div className="button-group">
                    <button
                      className="action-button primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FaCamera /> Ubah Foto Profil
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                    {(avatar || avatarPreview) && (
                      <button
                        className="action-button danger"
                        onClick={handleRemoveAvatar}
                      >
                        <FaTimes /> Hapus Foto
                      </button>
                    )}
                    <button
                      className="action-button secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setErrors({});
                        setAvatarPreview(null);
                      }}
                    >
                      <FaTimes /> Batal Edit
                    </button>
                  </div>
                ) : (
                  <button
                    className="action-button secondary"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setErrors({});
                    }}
                  >
                    <FaTimes /> Batal Ganti Password
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="profile-main">
            {isEditing ? (
              <div className="edit-section">
                <h2 className="section-title">Edit Profil</h2>
                <form onSubmit={handleSaveProfile} className="profile-form">
                  <div className="form-group">
                    <label htmlFor="nama" className="form-label">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      id="nama"
                      name="nama"
                      value={profileData.nama}
                      onChange={handleProfileChange}
                      className={`form-control ${errors.nama ? "error" : ""}`}
                      ref={namaInputRef}
                      placeholder="Masukkan nama lengkap"
                    />
                    {errors.nama && (
                      <span className="error-message">{errors.nama}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Alamat Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className={`form-control ${errors.email ? "error" : ""}`}
                      ref={emailInputRef}
                      placeholder="contoh@email.com"
                    />
                    {errors.email && (
                      <span className="error-message">{errors.email}</span>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="action-button primary">
                      <FaSave /> Simpan Perubahan
                    </button>
                  </div>
                </form>
              </div>
            ) : isChangingPassword ? (
              <div className="password-section">
                <h2 className="section-title">Ganti Password</h2>
                <form onSubmit={handleChangePassword} className="profile-form">
                  <div className="form-group">
                    <label htmlFor="currentPassword" className="form-label">
                      Password Saat Ini
                    </label>
                    <div className="password-input-group">
                      <input
                        type={showPwd.current ? "text" : "password"}
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`form-control ${
                          errors.currentPassword ? "error" : ""
                        }`}
                        ref={currentPasswordRef}
                        placeholder="Masukkan password saat ini"
                      />
                      <span
                        className="password-toggle"
                        onClick={() =>
                          setShowPwd({ ...showPwd, current: !showPwd.current })
                        }
                      >
                        {showPwd.current ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    {errors.currentPassword && (
                      <span className="error-message">
                        {errors.currentPassword}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword" className="form-label">
                      Password Baru
                    </label>
                    <div className="password-input-group">
                      <input
                        type={showPwd.new ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`form-control ${
                          errors.newPassword ? "error" : ""
                        }`}
                        placeholder="Minimal 6 karakter"
                      />
                      <span
                        className="password-toggle"
                        onClick={() =>
                          setShowPwd({ ...showPwd, new: !showPwd.new })
                        }
                      >
                        {showPwd.new ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    {errors.newPassword && (
                      <span className="error-message">
                        {errors.newPassword}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">
                      Konfirmasi Password Baru
                    </label>
                    <div className="password-input-group">
                      <input
                        type={showPwd.confirm ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`form-control ${
                          errors.confirmPassword ? "error" : ""
                        }`}
                        placeholder="Ketik ulang password baru"
                      />
                      <span
                        className="password-toggle"
                        onClick={() =>
                          setShowPwd({ ...showPwd, confirm: !showPwd.confirm })
                        }
                      >
                        {showPwd.confirm ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    {errors.confirmPassword && (
                      <span className="error-message">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="action-button primary">
                      <FaSave /> Simpan Password Baru
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="profile-info">
                <h2 className="section-title">Informasi Profil</h2>
                <div className="info-grid">
                  <div className="info-group">
                    <label>Nama Lengkap</label>
                    <p>{profileData.nama || "Belum diisi"}</p>
                  </div>
                  <div className="info-group">
                    <label>Email</label>
                    <p>{profileData.email || "Belum diisi"}</p>
                  </div>
                  {user?.role !== "admin" && (
                    <div className="info-group">
                      <label>Bergabung Sejak</label>
                      <p>
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "Tidak tersedia"}
                      </p>
                    </div>
                  )}
                </div>

                {user?.role !== "admin" && (
                  <div className="stats-section">
                    <h3 className="section-title">Statistik Anda</h3>
                    <div className="stats-grid">
                      <StatCard
                        icon={FaCalendarAlt}
                        value={stats.eventsAttended}
                        label="Event Diikuti"
                        loading={stats.loading}
                      />
                      <StatCard
                        icon={FaRegCalendarCheck}
                        value={stats.completed}
                        label="Event Selesai"
                        loading={stats.loading}
                      />
                      <StatCard
                        icon={FaRegCalendarXmark}
                        value={stats.upcoming}
                        label="Event Mendatang"
                        loading={stats.loading}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
