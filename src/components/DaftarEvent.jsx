// Komponen untuk menampilkan daftar event
function DaftarEvent({ events }) {
  return (
    <div className="daftar-event">
      <h2>Daftar Event Kampus</h2>
      <div className="event-list">
        {events.map((event, index) => (
          <div key={index} className="event-item">
            <h3>{event.nama}</h3>
            <p>Tanggal: {event.tanggal}</p>
            <p>Lokasi: {event.lokasi}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DaftarEvent;
