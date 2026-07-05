import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMe } from "../api/authApi";
import { getDriverTrips, getPassengerTrips, getPendingTrips } from "../api/tripApi";
import type { Trip, TripStatus, User } from "../types";

function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filter, setFilter] = useState<TripStatus | "ALL">("ALL");

  useEffect(() => {
    async function loadData() {
      const currentUser = await getMe();
      setUser(currentUser);

      if (currentUser.role === "PASSENGER") {
        const data = await getPassengerTrips();
        setTrips(data);
      }

        if (currentUser.role === "DRIVER") {
        const mine = await getDriverTrips();
        const pending = await getPendingTrips();

        const allTrips = [...pending, ...mine];

        const uniqueTrips = allTrips.filter(
            (trip, index, self) => index === self.findIndex((t) => t.id === trip.id)
        );

        setTrips(uniqueTrips);
        }
    }

    loadData();
  }, []);

  const filteredTrips =
    filter === "ALL" ? trips : trips.filter((trip) => trip.status === filter);

  if (!user) return <main className="page">Cargando...</main>;

  return (
    <main className="page">
      <section className="card">
        <h1>Historial de viajes</h1>

        <Link to="/dashboard">Volver al dashboard</Link>

        <div className="form">
          <label>
            Filtrar por estado
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as TripStatus | "ALL")}
            >
              <option value="ALL">Todos</option>
              <option value="PENDING">Pendientes</option>
              <option value="IN_PROGRESS">En progreso</option>
              <option value="COMPLETED">Completados</option>
            </select>
          </label>
        </div>

        {filteredTrips.length === 0 && <p>No hay viajes para mostrar.</p>}

        {filteredTrips.map((trip) => (
          <div key={trip.id} className="trip-card">
            <p>ID: {trip.id}</p>
            <p>Origen: {trip.pickupAddress}</p>
            <p>Destino: {trip.dropoffAddress}</p>
            <p>Estado: {trip.status}</p>
            <Link to={`/trips/${trip.id}`}>Ver detalle</Link>
          </div>
        ))}
      </section>
    </main>
  );
}

export default HistoryPage;