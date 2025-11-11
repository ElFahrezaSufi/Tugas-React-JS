import { useEffect, useRef, useState, useCallback } from 'react';

function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}

function calculateTimeLeft(targetDate) {
  if (!isValidDate(targetDate)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, isExpired: true, isToday: false, isSoon: false };
  }
  
  const now = new Date();
  const total = targetDate - now;
  
  if (isNaN(total) || total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, isExpired: true, isToday: false, isSoon: false };
  }
  
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  const isToday = days === 0 && hours < 24;
  const isSoon = days === 0 && (hours < 2 || (hours === 2 && minutes === 0));
  
  return { 
    days, 
    hours, 
    minutes, 
    seconds, 
    total, 
    isExpired: false, 
    isToday, 
    isSoon 
  };
}

/**
 * useCountdown - Hook untuk menghitung countdown ke target waktu
 * @param {Date|string} targetDate - Tanggal target countdown
 * @returns {Object} Objek berisi waktu tersisa dan status countdown
 */
export default function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));
  const intervalRef = useRef(null);
  const targetDateRef = useRef(targetDate);

  // Update targetDateRef jika targetDate berubah
  useEffect(() => {
    targetDateRef.current = targetDate;
  }, [targetDate]);

  const updateTimeLeft = useCallback(() => {
    const newTimeLeft = calculateTimeLeft(targetDateRef.current);
    setTimeLeft(prev => {
      // Hanya update jika ada perubahan
      if (JSON.stringify(prev) !== JSON.stringify(newTimeLeft)) {
        return newTimeLeft;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    // Hanya jalankan jika targetDate valid
    if (!isValidDate(new Date(targetDateRef.current))) {
      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
        isExpired: true,
        isToday: false,
        isSoon: false
      });
      return;
    }

    // Update waktu segera
    updateTimeLeft();

    // Set interval untuk update setiap detik
    intervalRef.current = setInterval(updateTimeLeft, 1000);

    // Cleanup interval saat komponen di-unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateTimeLeft]);

  return timeLeft;
}
