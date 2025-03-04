import NavBar from '../Components/Navbar';
import WelcomeNote from '../Components/WelcomeNote';
import DataTile from '../Components/DataTile';
import CalendarComp from "../Components/CalendarComp";
import FiveDaysHistory from '../Components/FiveDaysHistory';

const Dashboard = () => {
  return (
    <>
      <div className='w-full h-screen flex'>
        <div className='w-full'>
          <NavBar />
          <div className='w-full flex justify-start items-start gap-10 px-12'>
            <div className='w-1/2 flex flex-col gap-6'>
              <div className=' shadow rounded-lg cursor-pointer transition'>
                <WelcomeNote />
                <DataTile />
              </div>
              <CalendarComp />
            </div>
            <div className='w-1/2'>
              <FiveDaysHistory />
            </div>
          </div>
        </div>
      </div>

    </>
  )
}

export default Dashboard