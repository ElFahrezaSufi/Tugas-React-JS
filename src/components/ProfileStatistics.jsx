import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { FaCalendarCheck, FaClock, FaCheckCircle } from 'react-icons/fa';

function cekStatusEvent(tanggal, waktu = '00:00') {
  const now = new Date();
  const [year, month, day] = tanggal.split('-').map(Number);
  const [hours, minutes] = waktu.split(':').map(Number);
  const eventDate = new Date(year, month - 1, day, hours, minutes || 0);
  if (now < eventDate) return 'mendatang';
  if (now > new Date(eventDate.getTime() + 60 * 60 * 1000)) return 'selesai';
  return 'berlangsung';
}

function ProfileStatistics({ userId }) {
  const stats = useMemo(() => {
    const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const myRegs = registrations.filter((r) => r.userId === userId);

    let upcoming = 0;
    let completed = 0;
    let ongoing = 0;

    myRegs.forEach((r) => {
      const ev = events.find((e) => e.id === r.eventId);
      if (!ev) return;
      const st = cekStatusEvent(ev.tanggal, ev.waktu);
      if (st === 'mendatang') upcoming += 1;
      else if (st === 'selesai') completed += 1;
      else ongoing += 1;
    });

    return {
      total: myRegs.length,
      upcoming,
      ongoing,
      completed,
    };
  }, [userId]);

  return (
    <div className="profile-card">
      <h3>📊 Statistik Event Saya</h3>
      <div className="statistik-container">
        <div className="statistik-card">
          <div className="statistik-icon" style={{ backgroundColor: 'rgba(23, 162, 184, 0.1)' }}>
            <FaCalendarCheck />
          </div>
          <div className="statistik-info">
            <h3>Total Event</h3>
            <p className="statistik-angka">{stats.total}</p>
          </div>
        </div>
        <div className="statistik-card">
          <div className="statistik-icon" style={{ backgroundColor: 'rgba(255, 193, 7, 0.15)' }}>
            <FaClock />
          </div>
          <div className="statistik-info">
            <h3>Mendatang</h3>
            <p className="statistik-angka">{stats.upcoming}</p>
          </div>
        </div>
        <div className="statistik-card">
          <div className="statistik-icon" style={{ backgroundColor: 'rgba(40, 167, 69, 0.12)' }}>
            <FaCheckCircle />
          </div>
          <div className="statistik-info">
            <h3>Selesai</h3>
            <p className="statistik-angka">{stats.completed}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

ProfileStatistics.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default ProfileStatistics;
