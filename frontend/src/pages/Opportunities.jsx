import { useState, useEffect } from "react";
import {
  getAllOpportunities,
  applyToOpportunity,
  getMyApplications,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";

const Opportunities = () => {
  const { user } = useAuth();

  const [opportunities, setOpportunities] = useState([]);
  const [applicationStatus, setApplicationStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);

  const isNgo = user?.role?.toLowerCase() === "ngo";

  useEffect(() => {
    fetchOpportunities();
    fetchMyApplications();
  }, []);

  const fetchOpportunities = async () => {
    const res = await getAllOpportunities();
    setOpportunities(res?.data?.opportunities || []);
    setLoading(false);
  };

  const fetchMyApplications = async () => {
    const res = await getMyApplications();
    const map = {};
    res?.data?.applications?.forEach(app => {
      map[app.opportunityId || app._id] = app.applicationStatus;
    });
    setApplicationStatus(map);
  };

  const handleApply = async (id) => {
    try {
      await applyToOpportunity(id);

      setApplicationStatus(prev => ({
        ...prev,
        [id]: "pending"
      }));

      setToast("Applied successfully ✅");

    } catch {
      setToast("Error applying ❌");
    }
  };

  const filtered = opportunities.filter(o =>
    o.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <main style={{
        padding: 30,
        width: "100%",
        minHeight: "100vh",
        background: darkMode ? "#121212" : "#f3f4f6",
        color: darkMode ? "#fff" : "#000"
      }}>

        {/* HEADER */}
        <h2 style={{ fontSize: 24, fontWeight: "bold" }}>
          Opportunities
        </h2>

        {/* DARK MODE */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            marginBottom: 15,
            padding: "8px 14px",
            borderRadius: 8,
            background: "#2e7d32",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        {/* SEARCH */}
        <input
          placeholder="🔍 Search opportunities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            marginBottom: 20,
            background: darkMode ? "#1e1e1e" : "#fff",
            color: darkMode ? "#fff" : "#000"
          }}
        />

        {toast && (
          <p style={{ color: "green", marginBottom: 10 }}>
            {toast}
          </p>
        )}

        {/* CARDS */}
        {filtered.map((opp) => (
          <div
            key={opp._id}
            style={{
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              background: darkMode ? "#1e1e1e" : "#fff",
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
              transition: "0.3s"
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-4px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <h3 style={{ marginBottom: 6 }}>
              {opp.title}
            </h3>

            <p style={{
              color: darkMode ? "#bbb" : "#555",
              marginBottom: 10
            }}>
              {opp.description}
            </p>

            <div style={{ fontSize: 13, marginBottom: 10 }}>
              {opp.location && <span>📍 {opp.location} </span>}
              {opp.duration && <span>⏱ {opp.duration} </span>}
              {opp.ngo?.name && <span>🏢 {opp.ngo.name}</span>}
            </div>

            {!isNgo && (
              <button
                onClick={() => handleApply(opp._id)}
                disabled={applicationStatus[opp._id]}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: applicationStatus[opp._id]
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #2e7d32, #43a047)",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: applicationStatus[opp._id]
                    ? "not-allowed"
                    : "pointer"
                }}
              >
                {applicationStatus[opp._id]
                  ? "Applied ✅"
                  : "Apply Now"}
              </button>
            )}
          </div>
        ))}
      </main>
    </div>
  );
};

export default Opportunities;