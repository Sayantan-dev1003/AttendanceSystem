import NavBar from '../Components/Navbar';
import WelcomeNote from '../Components/WelcomeNote';
import DataTile from '../Components/DataTile';
import CalendarComp from "../Components/CalendarComp";

const Dashboard = () => {
  return (
    <>
      <div className='w-full flex justify-end items-start'>
        <div className='w-5/6 min-h-screen flex flex-col overflow-y-auto'>
          <NavBar />
          <div className='w-full flex justify-start items-start gap-10 px-12'>
            <div className='w-full flex gap-6'>
              <div className='w-1/2 rounded-lg cursor-pointer transition'>
                <WelcomeNote />
                <DataTile />
              </div>
              <CalendarComp />
            </div>
          </div>
        </div>
      </div>

    </>
  )
}

export default Dashboard