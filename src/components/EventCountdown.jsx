import PropTypes from 'prop-types';
import { FaClock, FaExclamationCircle } from 'react-icons/fa';
import useCountdown from '../hooks/useCountdown';

function EventCountdown({ tanggal, waktu }) {
  const [year, month, day] = tanggal.split('-').map(Number);
  const [hh, mm] = (waktu || '00:00').split(':').map(Number);
  const targetDate = new Date(year, (month - 1), day, hh || 0, mm || 0);

  const { days, hours, minutes, seconds, isExpired, isToday, isSoon } = useCountdown(targetDate);

  if (isExpired) return null;

  let text = '';
  let cls = 'countdown-badge countdown-normal';

  if (isSoon) {
    cls = 'countdown-badge countdown-urgent';
    text = `${hours}j ${minutes}m ${seconds}d lagi`;
  } else if (isToday) {
    cls = 'countdown-badge countdown-today';
    text = `${hours} jam ${minutes} menit lagi`;
  } else if (days < 7) {
    cls = 'countdown-badge countdown-soon';
    text = `${days} hari ${hours} jam lagi`;
  } else {
    text = `${days} hari lagi`;
  }

  return (
    <div className={cls} aria-label="Countdown ke mulai event">
      {isSoon ? <FaExclamationCircle /> : <FaClock />}
      <span>{text}</span>
    </div>
  );
}

EventCountdown.propTypes = {
  tanggal: PropTypes.string.isRequired,
  waktu: PropTypes.string,
};

export default EventCountdown;
