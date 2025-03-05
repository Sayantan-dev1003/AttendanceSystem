import { useState, useEffect } from "react";

const History = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch("/api/user/history", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
  
        const data = await response.json();
        console.log("API Response:", data); // Debugging line
  
        if (response.ok) {
          setAttendance(data);
        } else {
          setError(data.error || "Failed to fetch attendance data.");
        }
      } catch (error) {
        setError(`Error fetching data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAttendance();
  }, []);  

  // Function to format date as YYYY-MM-DD
  const formatDate = (isoString) => {
    if (!isoString) return "—";
    const currentDate = new Date(isoString)
      .toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", year: 'numeric', month: 'long', day: 'numeric' });
    return currentDate;
  };

  // Function to format time as HH:MM:SS
  const formatTime = (isoString) => {
    if (!isoString) return "—";
    const date = new Date();
    const [hours, minutes, seconds] = isoString.split(":").map(Number); // Extract time parts
    const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, seconds);
    if (isNaN(newDate.getTime())) return "Invalid Time";
    return newDate.toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      hour12: false,
    });
  };  

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-[#00416A] mb-4 montserrat">Attendance History</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto openSans rounded-lg">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-[#00416A] text-white">
              <tr>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Check-In Time</th>
                <th className="py-3 px-4 text-left">Check-Out Time</th>
                <th className="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length > 0 ? (
                attendance.map((entry, index) => (
                  <tr key={index} className={`border-b border-b-gray-400 hover:bg-gray-100 ${index === attendance.length - 1 ? "border-b-0" : ""}`}>
                    <td className="py-3 px-4">{formatDate(entry.date)}</td>
                    <td className="py-3 px-4">{formatTime(entry.check_in_time)}</td>
                    <td className="py-3 px-4">{entry.check_out_time ? formatTime(entry.check_out_time) : "—"}</td>
                    <td
                      className={`py-3 px-4 font-semibold ${
                        entry.status.toLowerCase() === "present"
                          ? "text-green-600"
                          : entry.status.toLowerCase() === "late"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {entry.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-3 text-gray-500">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default History;