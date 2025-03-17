import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminRecords = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState("employee_id");
  const [searchValue, setSearchValue] = useState("");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]); // Default to today
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter]); // Fetch today's records by default

  const fetchAttendance = async (filters = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ date: dateFilter, ...filters }).toString();
      const response = await fetch(`/api/attendance?${queryParams}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
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

  const handleSearch = () => {
    if (!searchValue) return fetchAttendance(); // If empty, reset to default
    fetchAttendance({ [searchType]: searchValue });
  };

  return (
    <div className="w-full flex justify-end items-start openSans">
      <div className="w-5/6 min-h-screen flex flex-col overflow-y-auto p-8">
        <h2 className="text-3xl font-bold text-[#00416A] mb-4 montserrat">Attendance History</h2>

        {/* Search and Filter Controls */}
        <div className="w-full flex flex-wrap justify-between items-center mb-4">
          <div className="w-full flex items-center gap-3">
            <select
              className="border border-gray-300 bg-white h-10 px-3 py-1.5 rounded-lg cursor-pointer text-sm focus:outline-none"
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="employee_id">Employee ID</option>
              <option value="name">Name</option>
              <option value="department">Department</option>
              <option value="designation">Designation</option>
              <option value="date">Date</option>
            </select>

            {/* Search Input */}
            <input
              type={searchType === "date" ? "date" : "text"}
              placeholder={searchType === "date" ? "" : "Search"}
              value={searchValue}
              className="w-1/3 border border-gray-300 bg-white h-10 px-3 rounded-lg text-sm focus:outline-none"
              onChange={(e) => setSearchValue(e.target.value)}
            />

            {/* Date Filter */}
            <input
              type="date"
              className="border cursor-pointer border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />

            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0064a2] hover:bg-[#00416A] focus:outline-none cursor-pointer"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>

        {/* Attendance Table */}
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
                  <th className="py-3 px-4 text-center">Department</th>
                  <th className="py-3 px-4 text-center">Designation</th>
                  <th className="py-3 px-4 text-center">Date</th>
                  <th className="py-3 px-4 text-center">Check-In Time</th>
                  <th className="py-3 px-4 text-center">Check-Out Time</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length > 0 ? (
                  attendance.map((entry, index) => (
                    <tr key={index} className="border-b border-b-gray-400 text-sm cursor-pointer hover:bg-gray-100"
                      onClick={() => navigate(`/userDashboard/${entry.employee_id}`)}
                    >
                      <td className="py-3 px-4 text-center">
                        <img src={entry.profilePhoto ? `/uploads/${entry.profilePhoto}` : "https://via.placeholder.com/100"} 
                            alt="Profile" className="w-8 h-8 rounded-full bg-cover text-center" />
                      </td>
                      <td className="py-3 px-4 text-center">{entry.employee_id}</td>
                      <td className="py-3 px-4 text-center">{entry.name}</td>
                      <td className="py-3 px-4 text-center">{entry.department}</td>
                      <td className="py-3 px-4 text-center">{entry.designation}</td>
                      <td className="py-3 px-4 text-center">{entry.date}</td>
                      <td className="py-3 px-4 text-center">{entry.check_in_time || "—"}</td>
                      <td className="py-3 px-4 text-center">{entry.check_out_time || "—"}</td>
                      <td className={`py-3 px-4 font-semibold text-center ${
                        entry.status.toLowerCase() === "present" ? "text-green-600"
                          : entry.status.toLowerCase() === "late" ? "text-yellow-600"
                          : "text-red-600"
                      }`}>
                        {entry.status}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-3 text-gray-500">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRecords;
