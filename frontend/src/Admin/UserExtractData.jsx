import { useParams } from "react-router-dom";
import * as XLSX from 'xlsx';
import { useState } from "react";

const UserExtractData = () => {
    const { employeeId } = useParams();
    const [loading, setLoading] = useState(false);

    const handleExtractData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/attendance/employee/${employeeId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to fetch attendance data.");

            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(data.attendance);
            XLSX.utils.book_append_sheet(workbook, worksheet, data.name); // Use employee name as sheet name

            XLSX.writeFile(workbook, `${data.name}.xlsx`); // Save file with employee name
        } catch (error) {
            console.error('Error extracting data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <button
                onClick={handleExtractData}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0064a2] hover:bg-[#00416A] focus:outline-none cursor-pointer"
                disabled={loading}
            >
                {loading ? "Extracting..." : "Extract Data"}
            </button>
        </div>
    );
};

export default UserExtractData;