import { FaCalendarAlt, FaCalendarCheck, FaCalendarTimes } from 'react-icons/fa';
import { useEffect, useState } from 'react';

function StatistikEvent({ statistik }) {
  const [localStatistik, setLocalStatistik] = useState(statistik);
  
  // Update local state when statistik prop changes
  useEffect(() => {
    setLocalStatistik(statistik);
  }, [statistik]);
  
  // Auto-update statistik every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setLocalStatistik(prev => ({...prev})); // Force re-render
    }, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="statistik-container">
      <div className="statistik-card total">
        <div className="statistik-icon">
          <FaCalendarAlt />
        </div>
        <div className="statistik-info">
          <h3>Total Event</h3>
          <p className="statistik-angka">{localStatistik.total}</p>
        </div>
      </div>
      
      <div className="statistik-card mendatang">
        <div className="statistik-icon">
          <FaCalendarCheck />
        </div>
        <div className="statistik-info">
          <h3>Mendatang</h3>
          <p className="statistik-angka">{localStatistik.mendatang}</p>
        </div>
      </div>
      
      <div className="statistik-card selesai">
        <div className="statistik-icon">
          <FaCalendarTimes />
        </div>
        <div className="statistik-info">
          <h3>Selesai</h3>
          <p className="statistik-angka">{localStatistik.selesai}</p>
        </div>
      </div>
    </div>
  );
}

export default StatistikEvent;
