import { FaCalendarAlt, FaCalendarCheck, FaCalendarTimes } from 'react-icons/fa';

function StatistikEvent({ statistik }) {
  return (
    <div className="statistik-container">
      <div className="statistik-card total">
        <div className="statistik-icon">
          <FaCalendarAlt />
        </div>
        <div className="statistik-info">
          <h3>Total Event</h3>
          <p className="statistik-angka">{statistik.total}</p>
        </div>
      </div>

      <div className="statistik-card mendatang">
        <div className="statistik-icon">
          <FaCalendarCheck />
        </div>
        <div className="statistik-info">
          <h3>Mendatang</h3>
          <p className="statistik-angka">{statistik.mendatang}</p>
        </div>
      </div>

      <div className="statistik-card selesai">
        <div className="statistik-icon">
          <FaCalendarTimes />
        </div>
        <div className="statistik-info">
          <h3>Selesai</h3>
          <p className="statistik-angka">{statistik.selesai}</p>
        </div>
      </div>
    </div>
  );
}

export default StatistikEvent;
