import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const FiveDaysHistory = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const { employeeId } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/admin/attendance/${employeeId}`);
    
                let data = response.data;
    
                if (typeof data === 'string') {
                    try {
                        data = JSON.parse(data);
                    } catch (parseError) {
                        console.error('Failed to parse attendance data:', parseError);
                        return;
                    }
                }
    
                if (Array.isArray(data)) {
                    setAttendanceData(data);
                } else {
                    console.error('Expected an array of attendance data, but got:', typeof data);
                }
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            }
        };
    
        fetchData();
    }, [employeeId]);

    const formatDate = (isoString) => {
        if (!isoString) return "—";
        const currentDate = new Date(isoString)
          .toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", year: 'numeric', month: 'long', day: 'numeric' });
        return currentDate;
      };    

    return (
        <div className="w-full flex justify-center items-start openSans">
            <div className="w-full p-8 rounded-lg shadow flex justify-center items-start flex-col gap-4 cursor-pointer transition">
                <h2 className="font-semibold text-2xl montserrat">Last 5 Days Attendance</h2>
                <ul className="w-full flex flex-col gap-2 text-sm">
                    {attendanceData.map((attendance) => (
                        <div key={attendance.id} className="w-full bg-blue-50 flex justify-between items-center py-2 px-4 rounded-md hover:transition hover:scale-105 hover:bg-blue-100">
                            <div className="w-2/3 flex flex-col items-start justify-start">
                                <li className="font-semibold text-lg">{formatDate(attendance.date)}</li>
                                <div className="flex">
                                    <span className="text-xs font-light">{attendance.check_in_time}</span>
                                    <span className="text-xs font-light">&nbsp;-&nbsp;</span>
                                    <span className="text-xs font-light">{attendance.check_out_time ? attendance.check_out_time : 'N/A'}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 items-center justify-center">
                                <p className={`font-medium text-${attendance.status === 'Present' ? 'green' : attendance.status === 'Late' ? 'yellow' : 'red'}-500`}>{attendance.status}</p>
                            </div>
                        </div>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default FiveDaysHistory;