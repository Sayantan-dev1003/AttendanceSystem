import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useParams } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AttendanceBarChart = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [employeeName, setEmployeeName] = useState("");
    const [loading, setLoading] = useState(true);
    const { employeeId } = useParams();

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await fetch(`/api/admin/attendance/${employeeId}`);
                const data = await response.json();
                console.log("bar data", data);
                if (response.ok) {
                    setAttendanceData(data);
                    setEmployeeName(data.length > 0 ? data[0].name : "Employee");
                } else {
                    console.error("Error fetching attendance:", data.error);
                }
            } catch (error) {
                console.error("Error fetching attendance:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [employeeId]);

    console.log("bar data", attendanceData)
    if (loading) {
        return <p>Loading attendance data...</p>;
    }

    // Generate all working dates for the month
    const generateWorkingDates = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let workingDates = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDay = new Date(year, month, day).getDay();
            if (currentDay !== 0 && currentDay !== 6) {
                workingDates.push(new Date(year, month, day).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }));
            }
        }

        return workingDates;
    };

    // Colors based on status
    const barColors = attendanceData.map((data) =>
        data.status === "Present" ? "#4CAF50" : data.status === "Late" ? "#FFC107" : "#F44336"
    );

    // Tooltip customization
    const tooltipLabelCallback = (tooltipItem) => {
        const index = tooltipItem.dataIndex;
        const record = attendanceData[index];

        if (record.status === "Absent") {
            return "Absent";
        }
        return `Check-In: ${record.check_in || "N/A"}\nCheck-Out: ${record.check_out || "N/A"}`;
    };

    // Chart Data
    const data = {
        labels: generateWorkingDates(),
        datasets: [
            {
                label: "Working Hours",
                data: attendanceData.map((date) => {
                    if (!date.check_in_time || !date.check_out_time) {
                        return 0; // Default to 0 hours if data is missing
                    }
                    const checkIn = new Date(date.check_in_time);
                    const checkOut = new Date(date.check_out_time);
                    return isNaN(checkIn) || isNaN(checkOut) ? 0 : (checkOut - checkIn) / (1000 * 60 * 60);
                }),
                backgroundColor: barColors,
                borderRadius: 5,
            },
        ],
    };
    console.log("main data", data)

    // Chart Options
    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: tooltipLabelCallback,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 10,
                title: {
                    display: true,
                    text: "Working Hours",
                },
            },
        },
    };

    return (
        <div className="bg-white p-4 shadow-lg rounded-lg w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
                {employeeName}&apos; Attendance Overview (March)
            </h2>
            <Bar data={data} options={options} />
        </div>
    );
};

export default AttendanceBarChart;
