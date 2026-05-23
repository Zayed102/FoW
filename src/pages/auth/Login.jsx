import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <Heart className="w-12 h-12 text-brandPink fill-brandPink" />
          <h1 className="text-2xl font-extrabold tracking-tight text-brandNavy">
            friendshipOnWheels
          </h1>
          <p className="text-sm text-gray-500">smiles and meals at your door</p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate("/login/coordinator")}
            className="bg-brandPink hover:bg-brandPink/90 text-white rounded-lg min-h-10 px-4 py-3 text-sm font-semibold w-full transition"
          >
            Login as Coordinator
          </button>
          <button
            type="button"
            onClick={() => navigate("/login/volunteer")}
            className="bg-brandTeal hover:bg-brandTeal/90 text-white rounded-lg min-h-10 px-4 py-3 text-sm font-semibold w-full transition"
          >
            Login as Volunteer
          </button>
        </div>
      </div>
    </div>
  );
}
