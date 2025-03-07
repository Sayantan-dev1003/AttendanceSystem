import { useEffect, useState } from "react"; 
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useParams } from "react-router-dom";

const UserDataTile = () => {
  const { employeeId } = useParams();
  const [attendanceData, setAttendanceData] = useState([]);
  const [userName, setUserName] = useState("");
  // const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        if (!employeeId) return;
        const response = await axios.get(`/api/admin/attendance/${employeeId}`);
        
        if (response.data) {
          setUserName(response.data.name); // Correctly setting user name
          setAttendanceData(response.data.attendance);
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchAttendance();
  }, [employeeId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "#4CAF50"; // Green
      case "Absent":
        return "#FF5733"; // Red
      case "Late":
        return "#FFC107"; // Yellow
      case "Weekend":
        return "#444"; // Dark Gray
      default:
        return "#D3D3D3"; // Light Gray (Future Working Days)
    }
  };

  const monthName = new Date().toLocaleString("default", { month: "long" });

  const legendData = [
    { name: "Present", color: "#4CAF50" },
    { name: "Absent", color: "#FF5733" },
    { name: "Late", color: "#FFC107" },
    { name: "Weekend", color: "#444" },
    { name: "Future Working Days", color: "#D3D3D3" },
  ];

  return (
    <div className="w-full flex flex-col justify-between items-center bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold text-gray-700">
        Attendance Summary for {monthName}
      </h2>
      <PieChart width={300} height={300}>
        <Pie
          data={attendanceData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={30}
          dataKey={() => 1} // Ensures equal distribution
        >
          {attendanceData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
          ))}
        </Pie>
        <Tooltip />
        <Legend
          layout="horizontal"
          align="center"
          verticalAlign="bottom"
          iconType="circle"
          payload={legendData.map((item) => ({
            value: item.name,
            type: "circle",
            color: item.color,
          }))}
        />
      </PieChart>
    </div>
  );
};

export default UserDataTile;
