import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../assets/stylesheets/calendar.css";

const CalendarComp = () => {
  const [date, setDate] = useState(new Date());
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch("/api/user/attendance", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data = await response.json();
        console.log("Fetched Attendance Data:", data);

        if (response.ok) {
          const attendanceMap = {};
          data.forEach((entry) => {
            const correctedDate = new Date(entry.date);
            const formattedDate = correctedDate.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }).split("/").reverse().join("-");
            attendanceMap[formattedDate] = {
              status: entry.status,
              checkInTime: entry.check_in_time,
              checkOutTime: entry.check_out_time,
            };
          });
          setAttendance(attendanceMap);
        } else {
          console.error("Error fetching attendance:", data.error);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchAttendance();
  }, []);

  return (
    <Calendar
      onChange={setDate}
      value={date}
      tileClassName={({ date }) => {
        const dateString = date.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }).split("/").reverse().join("-");
        const status = attendance[dateString];

        if (status) {
          return `status-${status.status.toLowerCase()}`;
        }
        return "";
      }}
      tileContent={({ date }) => {
        const dateString = date.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }).split("/").reverse().join("-");
        const status = attendance[dateString];

        return status ? (
          <div className={`attendance-dot dot-${status.status.toLowerCase()}`} title={`Status: ${status.status}\nCheck In Time: ${status.checkInTime}\nCheck Out Time: ${status.checkOutTime}`}></div>
        ) : null;
      }}
    />
  );
};

export default CalendarComp;
