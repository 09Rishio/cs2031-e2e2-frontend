import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTrip, getAvailableDrivers } from "../api/tripApi";
import type { User } from "../types";

function RequestTripPage() {
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState<User[]>([]);
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [error, setError] = useState("");

  function getApiError(err: any, fallback: string) {
    const data = err.response?.data;

    return (
      data?.error ||
      Object.values(data || {}).join(", ") ||
      fallback
    );
  }

  useEffect(() => {
    async function loadDrivers() {
      try {
        const data = await getAvailableDrivers();
        setDrivers(data);
      } catch (err: any) {
        setError(getApiError(err, "No se pudieron cargar los conductores disponibles."));
      }
    }

    loadDrivers();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!pickupAddress || !dropoffAddress) {
      setError("Completa origen y destino.");
      return;
    }

    try {
      const trip = await createTrip({ pickupAddress, dropoffAddress });
      navigate(`/trips/${trip.id}`);
    } catch (err: any) {
      setError(getApiError(err, "No se pudo crear el viaje."));
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Solicitar viaje</h1>

        {error && <div className="alert error">{error}</div>}

        <h3>Conductores disponibles</h3>

        {drivers.length === 0 && <p>No hay conductores disponibles.</p>}

        {drivers.map((driver) => (
          <div key={driver.id} className="trip-card">
            <p>
              {driver.firstName} {driver.lastName}
            </p>
            <p>Rating: {driver.rating}</p>
          </div>
        ))}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Origen
            <input
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Av. Javier Prado 100"
            />
          </label>

          <label>
            Destino
            <input
              value={dropoffAddress}
              onChange={(e) => setDropoffAddress(e.target.value)}
              placeholder="Miraflores, Lima"
            />
          </label>

          <button type="submit">Confirmar viaje</button>
        </form>
      </section>
    </main>
  );
}

export default RequestTripPage;