import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut } from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="hidden md:flex w-64 min-h-screen bg-slate-800 text-white flex-col p-6">

      {/* Profile Section */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-bold">
          {user?.name?.charAt(0) || "U"}
        </div>

        <h2 className="mt-4 font-semibold text-lg">
          {user?.name || "User"}
        </h2>

        <p className="text-sm text-gray-400 capitalize">
          {user?.role || "role"}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>
      </nav>

      {/* Logout */}
      <div className="mt-auto">
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="flex items-center gap-2 text-red-400 hover:text-red-500 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
