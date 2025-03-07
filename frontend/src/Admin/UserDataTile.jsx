import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useParams } from 'react-router-dom';

const UserDataTile = () => {
  const { employeeId } = useParams();
  const [attendance, setAttendance] = useState({
    Present: 0,
    Absent: 0,
    Late: 0,
  });
  const [totalWorkingDays, setTotalWorkingDays] = useState(0);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(`/api/admin/attendance/${employeeId}`);
        const attendanceData = response.data;

        const summary = {
          Present: attendanceData.filter((item) => item.status === "Present").length,
          Absent: attendanceData.filter((item) => item.status === "Absent").length,
          Late: attendanceData.filter((item) => item.status === "Late").length,
        };

        setAttendance(summary);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    const calculateWorkingDays = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth(); // 0-indexed (0 = January)
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let workingDays = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDay = new Date(year, month, day).getDay();
        if (currentDay !== 0 && currentDay !== 6) {
          // Excluding Sundays (0) & Saturdays (6)
          workingDays++;
        }
      }

      setTotalWorkingDays(workingDays);
    };

    fetchAttendance();
    calculateWorkingDays();
  }, [employeeId]);

  const data = [
    { name: "Present", value: attendance.Present },
    { name: "Absent", value: attendance.Absent },
    { name: "Late", value: attendance.Late },
  ];

  const COLORS = ["#4CAF50", "#FF5733", "#FFC107"];
  const monthName = new Date().toLocaleString("default", { month: "long" });

  return (
    <div className="w-full flex flex-col justify-between items-center bg-white p-4 rounded-xl shadow-md openSans">
      <h2 className="text-lg font-semibold text-gray-700">
        Attendance Summary of {monthName}
      </h2>
      <div className="w-full flex justify-between items-end">
        <div className="flex flex-col justify-center items-center">
          <PieChart width={230} height={230}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={75}
              innerRadius={37}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", padding: "8px", border: "none" }} />
            <Legend align="center" verticalAlign="bottom" layout="horizontal" iconSize={12} wrapperStyle={{ paddingTop: "12px" }} />
          </PieChart>
        </div>

        <div className="mt-4 text-xs text-gray-600 text-right w-full flex flex-col items-end justify-end">
          <p>Total Working Days: {totalWorkingDays}</p>
          <p>Present: {attendance.Present} days</p>
          <p>Absent: {attendance.Absent} days</p>
          <p>Late: {attendance.Late} days</p>
        </div>
      </div>
    </div>
  );
};

export default UserDataTile;
