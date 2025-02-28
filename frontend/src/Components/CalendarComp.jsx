import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../assets/stylesheets/calendar.css";

const CalendarComp = () => {
  const [date, setDate] = useState(new Date());

  return (
    <Calendar
      onChange={setDate}
      value={date}
      className="shadow-md"
    />
  );
};

export default CalendarComp;
