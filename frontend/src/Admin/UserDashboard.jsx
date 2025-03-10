import NavBar from '../Components/Navbar';
// import User5DaysHistory from './User5DaysHistory';
import UserWelcome from './UserWelcome';
import UserDataTile from './UserDataTile';
import UserCalendar from './UserCalendar';
import { useParams } from 'react-router-dom';

const UserDashboard = () => {
  const { employeeId } = useParams();
  return (
    <>
      <div className='w-full h-screen flex'>
        <div className='w-full'>
          <NavBar />
          <div className='w-full flex justify-start items-start gap-10 px-12'>
            <div className='w-full flex gap-6'>
              <div className='w-1/2 rounded-lg cursor-pointer transition'>
                <UserWelcome employeeId={employeeId} />
                <UserDataTile employeeId={employeeId} />
              </div>
              <UserCalendar employeeId={employeeId} />
            </div>
            {/* <div className='w-1/2'>
              <User5DaysHistory employeeId={employeeId} />
            </div> */}
          </div>
        </div>
      </div>
    </>
  )
}

export default UserDashboard