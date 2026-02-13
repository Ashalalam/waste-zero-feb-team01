import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", recycled: 120 },
  { month: "Feb", recycled: 200 },
  { month: "Mar", recycled: 150 },
  { month: "Apr", recycled: 300 },
  { month: "May", recycled: 250 },
];

const ChartCard = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-72">
      <h3 className="text-lg font-semibold mb-4 text-green-700">
        Monthly Recycling Trend (kg)
      </h3>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />
          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="recycled"
            stroke="#16a34a"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartCard;
