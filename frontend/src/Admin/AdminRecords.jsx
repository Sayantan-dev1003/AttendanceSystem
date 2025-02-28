const attendanceData = [
  {
    profilePhoto: "https://via.placeholder.com/50",
    employeeId: "EMP123",
    employeeName: "John Doe",
    date: "2025-02-22",
    checkInTime: "09:00 AM",
    status: "Present",
  },
  {
    profilePhoto: "https://via.placeholder.com/50",
    employeeId: "EMP124",
    employeeName: "Jane Smith",
    date: "2025-02-22",
    checkInTime: "09:30 AM",
    status: "Late",
  },
];

const AdminRecords = () => {
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Attendance Records</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Profile Photo</th>
              <th className="py-3 px-6 text-left">Employee ID</th>
              <th className="py-3 px-6 text-left">Employee Name</th>
              <th className="py-3 px-6 text-left">Date</th>
              <th className="py-3 px-6 text-left">Check-in Time</th>
              <th className="py-3 px-6 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {attendanceData.map((record, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left">
                  <img
                    src={record.profilePhoto}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                </td>
                <td className="py-3 px-6 text-left">{record.employeeId}</td>
                <td className="py-3 px-6 text-left">{record.employeeName}</td>
                <td className="py-3 px-6 text-left">{record.date}</td>
                <td className="py-3 px-6 text-left">{record.checkInTime}</td>
                <td className="py-3 px-6 text-left">
                  <span
                    className={`px-3 py-1 rounded-full text-white ${
                      record.status === "Present"
                        ? "bg-green-500"
                        : record.status === "Late"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRecords;
