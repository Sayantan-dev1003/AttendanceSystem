import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminRecords = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch("/api/attendance", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("API Response:", data);

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

  const handleRowClick = (employeeId) => {
    navigate(`/userDashboard/${employeeId}`);
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
                <th className="py-3 px-4 text-center">Profile Photo</th>
                <th className="py-3 px-4 text-center">Employee ID</th>
                <th className="py-3 px-4 text-center">Name</th>
                <th className="py-3 px-4 text-center">Date</th>
                <th className="py-3 px-4 text-center">Check-In Time</th>
                <th className="py-3 px-4 text-center">Check-Out Time</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length > 0 ? (
                attendance.map((entry, index) => (
                  <tr key={index} className={`border-b border-b-gray-400 text-sm cursor-pointer hover:bg-gray-100 ${index === attendance.length - 1 ? "border-b-0" : ""}`} onClick={() => handleRowClick(entry.employee_id)}>
                    <td className="py-3 px-4 text-center flex items-center justify-center
                    "><img src={entry.profilePhoto ? `/uploads/${entry.profilePhoto}` : "https://via.placeholder.com/100"} alt="Profile" className="w-8 h-8 rounded-full bg-cover text-center" /></td>
                    <td className="py-3 px-4 text-center">{entry.employee_id}</td>
                    <td className="py-3 px-4 text-center">{entry.name}</td>
                    <td className="py-3 px-4 text-center">{formatDate(entry.date)}</td>
                    <td className="py-3 px-4 text-center">{formatTime(entry.check_in_time)}</td>
                    <td className="py-3 px-4 text-center">{entry.check_out_time ? formatTime(entry.check_out_time) : "—"}</td>
                    <td
                      className={`py-3 px-4 font-semibold text-center ${entry.status.toLowerCase() === "present"
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
                  <td colSpan="7" className="text-center py-3 text-gray-500">
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

export default AdminRecords;