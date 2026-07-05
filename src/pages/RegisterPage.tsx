import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/authApi";
import type { Role } from "../types";

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "PASSENGER" as Role,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function getApiError(err: any, fallback: string) {
    const status = err.response?.status;
    const data = err.response?.data;

    if (status === 500) {
      return "El correo ya está registrado o los datos no son válidos.";
    }

    return (
      data?.error ||
      Object.values(data || {}).join(", ") ||
      fallback
    );
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("Completa todos los campos.");
      return;
    }

    try {
      setLoading(true);

      await register(form);
      setSuccess("Registro exitoso. Ahora puedes iniciar sesión.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err: any) {
      setError(getApiError(err, "No se pudo registrar el usuario."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Crear cuenta</h1>
        <p>Regístrate como pasajero o conductor.</p>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Nombre
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Ej: Adriana"
            />
          </label>

          <label>
            Apellido
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Ej: Matumay"
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
            />
          </label>

          <label>
            Contraseña
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
            />
          </label>

          <label>
            Rol
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="PASSENGER">Pasajero</option>
              <option value="DRIVER">Conductor</option>
            </select>
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrarme"}
          </button>
        </form>

        <p>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;