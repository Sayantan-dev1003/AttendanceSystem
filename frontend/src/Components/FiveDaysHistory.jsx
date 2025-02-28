// FiveDaysHistory.js
const FiveDaysHistory = () => {
    return (
        <div className="w-full flex justify-center items-start">
            <div className=" w-full p-8 rounded-lg shadow flex justify-center items-start flex-col gap-4 cursor-pointer transition">
                <h2 className="font-semibold text-2xl montserrat">Last 5 Days Attendance</h2>
                <ul className="w-full flex flex-col gap-2 poppins text-sm">
                    <div className="bg-blue-50 flex justify-between items-center py-2 px-4 rounded-md hover:transition hover:scale-105 hover:bg-blue-100">
                        <li>Day 1 - Present</li>
                        <p className="bg-red-500 rounded-full w-2 h-2"></p>
                    </div>
                    <div className="bg-blue-50 flex justify-between items-center py-2 px-4 rounded-md hover:transition hover:scale-105 hover:bg-blue-100">
                        <li>Day 1 - Present</li>
                        <p className="bg-red-500 rounded-full w-2 h-2"></p>
                    </div>
                    <div className="bg-blue-50 flex justify-between items-center py-2 px-4 rounded-md hover:transition hover:scale-105 hover:bg-blue-100">
                        <li>Day 1 - Present</li>
                        <p className="bg-red-500 rounded-full w-2 h-2"></p>
                    </div>
                    <div className="bg-blue-50 flex justify-between items-center py-2 px-4 rounded-md hover:transition hover:scale-105 hover:bg-blue-100">
                        <li>Day 1 - Present</li>
                        <p className="bg-red-500 rounded-full w-2 h-2"></p>
                    </div>
                    <div className="bg-blue-50 flex justify-between items-center py-2 px-4 rounded-md hover:transition hover:scale-105 hover:bg-blue-100">
                        <li>Day 1 - Present</li>
                        <p className="bg-red-500 rounded-full w-2 h-2"></p>
                    </div>
                </ul>
            </div>
        </div>
    );
};

export default FiveDaysHistory;