import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../assets/stylesheets/calendar.css";
import { useParams } from 'react-router-dom';

const UserCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [attendance, setAttendance] = useState({});
  const { employeeId } = useParams();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch(`/api/admin/attendance/${employeeId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
  
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log("Fetched Attendance Data:", data);
  
        if (data.attendance) {
          const attendanceMap = {};
          data.attendance.forEach((entry) => {
            const formattedDate = new Date(entry.date).toISOString().split("T")[0]; // Format as YYYY-MM-DD
            attendanceMap[formattedDate] = entry.status;
          });
          setAttendance(attendanceMap);
        }
      } catch (error) {
        console.error("Error fetching attendance:", error.message);
      }
    };
  
    fetchAttendance();
  }, [employeeId]);
  

  return (
    <Calendar
      onChange={setDate}
      value={date}
      tileClassName={({ date }) => {
        const dateString = date.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }).split("/").reverse().join("-");
        const status = attendance[dateString];
      
        if (status) {
          return `status-${status.toLowerCase()}`;
        }
        return "";
      }}
      tileContent={({ date }) => {
        const dateString = date.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }).split("/").reverse().join("-");
        const status = attendance[dateString];
      
        return status ? (
          <div className={`attendance-dot dot-${status.toLowerCase()}`} title={status}></div>
        ) : null;
      }}
    />
  );
};

export default UserCalendar;
