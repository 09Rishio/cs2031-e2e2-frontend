import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMe } from "../api/authApi";
import {
  acceptTrip,
  completeTrip,
  getDriverTrips,
  getPassengerTrips,
  getPendingTrips,
} from "../api/tripApi";
import type { Trip, User } from "../types";

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [pendingTrips, setPendingTrips] = useState<Trip[]>([]);
  const [driverTrips, setDriverTrips] = useState<Trip[]>([]);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const currentUser = await getMe();
      setUser(currentUser);

      if (currentUser.role === "PASSENGER") {
        const data = await getPassengerTrips();
        setTrips(data);
      }

      if (currentUser.role === "DRIVER") {
        const pending = await getPendingTrips();
        const mine = await getDriverTrips();
        setPendingTrips(pending);
        setDriverTrips(mine);
      }
    } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
        }

        setError("No se pudo cargar la información.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  async function handleAccept(id: number) {
    await acceptTrip(id);
    loadData();
  }

  async function handleComplete(id: number) {
    await completeTrip(id);
    loadData();
  }

  if (!user) return <main className="page">Cargando...</main>;

  const activeTrip = driverTrips.find((trip) => trip.status === "IN_PROGRESS");
  const completedTrips = driverTrips.filter((trip) => trip.status === "COMPLETED");

  return (
    <main className="page">
      <section className="card">
        <h1>Dashboard</h1>
        <p>
          Hola, {user.firstName} {user.lastName}
        </p>
        <p>Rol: {user.role}</p>

        <button onClick={logout}>Cerrar sesión</button>

        {error && <div className="alert error">{error}</div>}

        {user.role === "PASSENGER" && (
          <>
            <h2>Pasajero</h2>

            <Link to="/request-trip">
              <button>Pedir viaje</button>
            </Link>

            <Link to="/history">
              <button>Ver historial</button>
            </Link>

            <h3>Mis viajes</h3>

            {trips.length === 0 && <p>No tienes viajes registrados.</p>}

            {trips.map((trip) => (
              <div key={trip.id} className="trip-card">
                <p>Origen: {trip.pickupAddress}</p>
                <p>Destino: {trip.dropoffAddress}</p>
                <p>Estado: {trip.status}</p>
                <Link to={`/trips/${trip.id}`}>Ver detalle</Link>
              </div>
            ))}
          </>
        )}

        {user.role === "DRIVER" && (
          <>
            <h2>Conductor</h2>
            <p>Rating: {user.rating}</p>

            <Link to="/history">
              <button>Ver historial</button>
            </Link>

            <h3>Viaje activo</h3>

            {!activeTrip && <p>No tienes viaje activo.</p>}

            {activeTrip && (
              <div className="trip-card">
                <p>Origen: {activeTrip.pickupAddress}</p>
                <p>Destino: {activeTrip.dropoffAddress}</p>
                <p>Pasajero: {activeTrip.passenger.firstName}</p>
                <button onClick={() => handleComplete(activeTrip.id)}>
                  Completar viaje
                </button>
                <br />
                <Link to={`/trips/${activeTrip.id}`}>Ver detalle</Link>
              </div>
            )}

            <h3>Viajes pendientes</h3>

            {pendingTrips.length === 0 && <p>No hay viajes pendientes.</p>}

            {pendingTrips.map((trip) => (
              <div key={trip.id} className="trip-card">
                <p>Origen: {trip.pickupAddress}</p>
                <p>Destino: {trip.dropoffAddress}</p>
                <p>Pasajero: {trip.passenger.firstName}</p>
                <button onClick={() => handleAccept(trip.id)}>Aceptar</button>
              </div>
            ))}

            <h3>Viajes completados</h3>

            {completedTrips.map((trip) => (
              <div key={trip.id} className="trip-card">
                <p>Origen: {trip.pickupAddress}</p>
                <p>Destino: {trip.dropoffAddress}</p>
                <Link to={`/trips/${trip.id}`}>Ver detalle</Link>
              </div>
            ))}
          </>
        )}
      </section>
    </main>
  );
}

export default DashboardPage;