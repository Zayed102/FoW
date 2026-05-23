import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function LoginForm() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useApp();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const resolvedRole = role === "coordinator" ? "coordinator" : "volunteer";
  const heading = resolvedRole === "coordinator" ? "Coordinator login" : "Volunteer login";

  function handleSubmit(e) {
    e.preventDefault();
    login(resolvedRole);
    navigate(
      resolvedRole === "coordinator"
        ? "/coordinator/dashboard"
        : "/volunteer/visits"
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <Heart className="w-10 h-10 text-brandPink fill-brandPink" />
          <h1 className="text-xl font-extrabold tracking-tight text-brandNavy">
            {heading}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-brandNavy">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full min-h-10 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandPink/40 focus:border-brandPink transition"
              placeholder="Enter username"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-brandNavy">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-10 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandPink/40 focus:border-brandPink transition"
              placeholder="Enter password"
            />
          </label>

          <button
            type="submit"
            className="bg-brandPink hover:bg-brandPink/90 text-white rounded-lg min-h-10 px-4 py-2.5 text-sm font-semibold w-full transition"
          >
            Login
          </button>
        </form>

        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-brandPink hover:underline min-h-10"
        >
          <ArrowLeft className="w-4 h-4" /> Choose a different role
        </Link>
      </div>
    </div>
  );
}
