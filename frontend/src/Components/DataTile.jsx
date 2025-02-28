import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const DataTile = () => {
  const data = [
    { name: "Present", value: 10 },
    { name: "Absent", value: 2 },
    { name: "Late", value: 1 },
  ];

  const COLORS = ["#4CAF50", "#FF5733", "#FFC107"];

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <PieChart width={228} height={228}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={70}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default DataTile;
