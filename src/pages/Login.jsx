import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaCalendarAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

/**
 * Login Page - Halaman untuk login user
 */
function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // useRef untuk focus management
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Redirect jika sudah login
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Auto-focus email input saat component mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // Initialize sample users jika belum ada
  // Note: user accounts are managed by backend; no sample users are created here.

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email harus diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Password harus diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error saat user mengetik
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    if (loginError) {
      setLoginError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true);
      setLoginError("");

      try {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          const from = location.state?.from?.pathname || "/";
          navigate(from, { replace: true });
        } else {
          setLoginError(result.message);
        }
      } catch (err) {
        console.error("Login failed", err);
        setLoginError("Terjadi kesalahan saat login");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(formErrors);
      // Focus ke field pertama yang error
      if (formErrors.email) {
        emailInputRef.current?.focus();
      } else if (formErrors.password) {
        passwordInputRef.current?.focus();
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <FaCalendarAlt className="auth-logo" />
          <h1>Event Kampus</h1>
          <p>Masuk ke akun Anda</p>
        </div>

        {loginError && <div className="alert alert-error">{loginError}</div>}

        {/* Info kredensial demo */}
        <div className="alert alert-info">
          <strong>Demo Credentials:</strong>
          <br />
          Admin: admin@example.com / admin123
          <br />
          User: budi@example.com / password
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="form-icon" />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              placeholder="nama@email.com"
              autoComplete="email"
              ref={emailInputRef}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="form-icon" />
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                placeholder="Masukkan password"
                autoComplete="current-password"
                ref={passwordInputRef}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Belum punya akun?{" "}
            <Link to="/register" className="auth-link">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
