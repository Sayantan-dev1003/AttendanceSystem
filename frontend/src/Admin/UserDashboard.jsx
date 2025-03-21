import NavBar from '../Components/Navbar';
// import User5DaysHistory from './User5DaysHistory';
import UserWelcome from './UserWelcome';
import UserDataTile from './UserDataTile';
import UserCalendar from './UserCalendar';
import UserExtractData from "./UserExtractData"
import AdminBar from './AdminBar'
import { useParams } from 'react-router-dom';

const UserDashboard = () => {
  const { employeeId } = useParams();
  return (
    <>
      <div className='w-full flex justify-end items-start'>
        <div className='w-5/6 min-h-screen flex flex-col overflow-y-auto'>
          <NavBar />
          <div className='w-full flex flex-col justify-start items-start gap-10 px-12'>
            <div className='w-full flex gap-6'>
              <div className='w-1/2 rounded-lg'>
                <UserWelcome employeeId={employeeId} />
                <UserDataTile employeeId={employeeId} />
                <UserExtractData employeeId={employeeId} />
              </div>
              <UserCalendar employeeId={employeeId} />
            </div>
            <AdminBar employeeId={employeeId} />
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