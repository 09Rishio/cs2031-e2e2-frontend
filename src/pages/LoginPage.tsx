import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/authApi";

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function getApiError(err: any, fallback: string) {
    const data = err.response?.data;

    return (
      data?.error ||
      Object.values(data || {}).join(", ") ||
      fallback
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Completa todos los campos.");
      return;
    }

    try {
      setLoading(true);

      const data = await login(form);
      localStorage.setItem("token", data.token);

      navigate("/dashboard");
    } catch (err: any) {
      setError(getApiError(err, "Credenciales incorrectas."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Iniciar sesión</h1>
        <p>Ingresa con tu cuenta registrada.</p>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
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

          <button type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;