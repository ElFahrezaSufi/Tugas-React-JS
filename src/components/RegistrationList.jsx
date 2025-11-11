import { useMemo, useState } from 'react';
import { FaUserFriends, FaSearch, FaTimes } from 'react-icons/fa';
import PropTypes from 'prop-types';

function RegistrationList({ eventId, eventName, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');

  const registrations = useMemo(() => {
    const allRegistrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const eventRegs = allRegistrations.filter((reg) => reg.eventId === eventId);

    return eventRegs.map((reg) => {
      const user = users.find((u) => u.id === reg.userId);
      return {
        ...reg,
        userName: user?.nama || 'Unknown',
        userEmail: user?.email || 'Unknown',
      };
    });
  }, [eventId]);

  const filteredRegistrations = useMemo(() => {
    if (!searchTerm) return registrations;
    const term = searchTerm.toLowerCase();
    return registrations.filter(
      (r) => r.userName.toLowerCase().includes(term) || r.userEmail.toLowerCase().includes(term)
    );
  }, [registrations, searchTerm]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content registration-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FaUserFriends /> Daftar Peserta
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            <FaTimes />
          </button>
        </div>

        <div className="registration-list-info">
          <h3>{eventName}</h3>
          <p>
            Total Peserta: <strong>{registrations.length}</strong>
          </p>
        </div>

        <div className="registration-list-actions">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Cari peserta..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="registration-list-table">
          {filteredRegistrations.length === 0 ? (
            <div className="empty-state">
              <p>{searchTerm ? 'Tidak ada peserta yang cocok.' : 'Belum ada peserta.'}</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Tanggal Daftar</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((r, idx) => (
                  <tr key={r.id}>
                    <td>{idx + 1}</td>
                    <td>{r.userName}</td>
                    <td>{r.userEmail}</td>
                    <td>{new Date(r.registeredAt).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

RegistrationList.propTypes = {
  eventId: PropTypes.string.isRequired,
  eventName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default RegistrationList;
