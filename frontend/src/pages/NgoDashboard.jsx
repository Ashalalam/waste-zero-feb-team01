import Sidebar from "../components/layout/Sidebar";

const NgoDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8 space-y-8">
        <h1 className="text-3xl font-bold">NGO Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-2">Create Opportunity</h3>
            <p className="text-gray-500">Coming in Milestone 2 🚀</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-2">My Opportunities</h3>
            <p className="text-gray-500">No opportunities yet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NgoDashboard;
