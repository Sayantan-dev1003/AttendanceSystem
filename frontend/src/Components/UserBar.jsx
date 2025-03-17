import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useParams } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserBar = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [employeeName, setEmployeeName] = useState("");
    const [loading, setLoading] = useState(true);
    const { employeeId } = useParams();
    
    const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await fetch("/api/user/attendance");
                const data = await response.json();
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

    if (loading) {
        return <p>Loading attendance data...</p>;
    }

    // Update generateWorkingDates to use month and year from state
    const generateWorkingDates = () => {
        const monthIndex = new Date(Date.parse(month + " 1, 2021")).getMonth(); // Get month index
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        let workingDates = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDay = new Date(year, monthIndex, day).getDay();
            if (currentDay !== 0 && currentDay !== 6) {
                workingDates.push(new Date(year, monthIndex, day).toLocaleDateString('en-IN', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric', 
                    timeZone: 'Asia/Kolkata' 
                }));
            }
        }

        return workingDates;
    };

    const workingDates = generateWorkingDates();
    const filteredAttendanceData = workingDates.map(date => {
        const record = attendanceData.find(data => new Date(data.date).toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric', 
            timeZone: 'Asia/Kolkata' 
        }) === date);
        return record || { date, status: "Absent" };
    });

    const barColors = filteredAttendanceData.map((data) =>
        data.status === "Present" ? "#4CAF50" : data.status === "Late" ? "#FFC107" : "#F44336"
    );

    const tooltipLabelCallback = (tooltipItem) => {
        const index = tooltipItem.dataIndex;
        const record = filteredAttendanceData[index];

        if (record.status === "Absent") {
            return "Absent";
        }
        return `Check-In: ${record.check_in_time || "N/A"}\nCheck-Out: ${record.check_out_time || "N/A"}`;
    };

    const data = {
        labels: workingDates,
        datasets: [
            {
                label: "Working Hours",
                data: filteredAttendanceData.map((date) => {
                    if (!date.check_in_time || !date.check_out_time) {
                        return 0;
                    }
                    const checkIn = new Date(`${date.date}T${date.check_in_time}Z`);
                    const checkOut = new Date(`${date.date}T${date.check_out_time}Z`);
                    return isNaN(checkIn) || isNaN(checkOut) ? 0 : (checkOut - checkIn) / (1000 * 60 * 60);
                }),
                backgroundColor: barColors,
                borderRadius: 5,
            },
        ],
    };

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

    // Function to handle month and year change
    const handleMonthChange = (e) => {
        setMonth(e.target.value);
    };

    const handleYearChange = (e) => {
        setYear(e.target.value);
    };

    return (
        <>
            <div className="bg-white p-4 shadow-lg rounded-lg w-full">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {employeeName}&apos; Attendance Overview ({month} {year})
                </h2>
                
                {/* Input fields for month and year */}
                <div className="mb-4 flex gap-4">
                    <label className="block mb-2">
                        Month:
                        <input
                            type="text"
                            value={month}
                            onChange={handleMonthChange}
                            placeholder="Enter month (e.g., January)"
                            className="border rounded p-2 w-full"
                        />
                    </label>
                    <label className="block mb-2">
                        Year:
                        <input
                            type="number"
                            value={year}
                            onChange={handleYearChange}
                            placeholder="Enter year (e.g., 2023)"
                            className="border rounded p-2 w-full"
                        />
                    </label>
                </div>

                <Bar data={data} options={options} />
            </div>
        </>
    );
};

export default UserBar;