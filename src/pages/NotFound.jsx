import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

/**
 * NotFound - Halaman 404 untuk route yang tidak ditemukan
 */
function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <FaExclamationTriangle className="notfound-icon" />
        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">Halaman Tidak Ditemukan</h2>
        <p className="notfound-message">
          Maaf, halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
        </p>
        <Link to="/" className="notfound-button">
          <FaHome className="button-icon" />
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
