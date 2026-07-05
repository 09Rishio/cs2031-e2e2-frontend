import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMe } from "../api/authApi";
import { completeTrip, getTripById, rateTrip } from "../api/tripApi";
import type { Trip, User } from "../types";

function TripDetailPage() {
  const { id } = useParams();

  const [user, setUser] = useState<User | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadTrip() {
    if (!id) return;

    try {
      const currentUser = await getMe();
      const tripData = await getTripById(Number(id));

      setUser(currentUser);
      setTrip(tripData);
    } catch {
      setError("No se pudo cargar el detalle del viaje.");
    }
  }

  useEffect(() => {
    loadTrip();
  }, [id]);

  useEffect(() => {
    if (!trip) return;

    if (trip.status === "PENDING" || trip.status === "IN_PROGRESS") {
      const interval = setInterval(() => {
        loadTrip();
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [trip?.status]);

  async function handleRate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!trip) return;

    try {
      const updatedTrip = await rateTrip(trip.id, { rating, comment });
      setTrip(updatedTrip);
      setSuccess("Viaje calificado correctamente.");
    } catch (err: any) {
      setError(err.response?.data?.error || "No se pudo calificar el viaje.");
    }
  }

  async function handleComplete() {
    if (!trip) return;

    try {
      const updatedTrip = await completeTrip(trip.id);
      setTrip(updatedTrip);
      setSuccess("Viaje completado correctamente.");
    } catch (err: any) {
      setError(err.response?.data?.error || "No se pudo completar el viaje.");
    }
  }

  if (!trip || !user) return <main className="page">Cargando...</main>;

  const canRate =
    user.role === "PASSENGER" &&
    trip.status === "COMPLETED" &&
    trip.passengerRating === null;

  const canComplete =
    user.role === "DRIVER" && trip.status === "IN_PROGRESS";

  return (
    <main className="page">
      <section className="card">
        <h1>Detalle del viaje</h1>

        <Link to="/dashboard">Volver al dashboard</Link>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <p>ID: {trip.id}</p>
        <p>Estado: {trip.status}</p>
        <p>Origen: {trip.pickupAddress}</p>
        <p>Destino: {trip.dropoffAddress}</p>

        <h3>Pasajero</h3>
        <p>
          {trip.passenger.firstName} {trip.passenger.lastName}
        </p>

        <h3>Conductor</h3>

        {trip.driver ? (
          <>
            <p>
              {trip.driver.firstName} {trip.driver.lastName}
            </p>
            <p>Rating: {trip.driver.rating}</p>
          </>
        ) : (
          <p>Buscando conductor...</p>
        )}

        {canComplete && (
          <button onClick={handleComplete}>Completar viaje</button>
        )}

        {trip.passengerRating !== null && (
          <>
            <h3>Calificación</h3>
            <p>Rating: {trip.passengerRating}</p>
            <p>Comentario: {trip.ratingComment || "Sin comentario"}</p>
          </>
        )}

        {canRate && (
          <form onSubmit={handleRate} className="form">
            <h3>Calificar viaje</h3>

            <label>
              Estrellas
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value={1}>1 estrella</option>
                <option value={2}>2 estrellas</option>
                <option value={3}>3 estrellas</option>
                <option value={4}>4 estrellas</option>
                <option value={5}>5 estrellas</option>
              </select>
            </label>

            <label>
              Comentario
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comentario opcional"
              />
            </label>

            <button type="submit">Enviar calificación</button>
          </form>
        )}
      </section>
    </main>
  );
}

export default TripDetailPage;