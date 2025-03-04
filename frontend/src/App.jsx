import { Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";
import SignIn from "./Pages/SignIn";
import Dashboard from "./Pages/Dashboard"
import SignUp from "./Pages/SignUp";
import History from "./Pages/History";
import Settings from "./Pages/Settings";
import Sidebar from "./Components/Sidebar"; 
import AdminRecords from "./Admin/AdminRecords";
import AdminSidebar from "./Admin/AdminSidebar";
import AdminSettings from "./Admin/AdminSettings";
import UserDashboard from "./Admin/UserDashboard";

const App = () => {
  const location = useLocation();

  return (
    <>
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        {location.pathname === '/dashboard' || location.pathname === '/history' || location.pathname === '/settings' ? <Sidebar style={{ height: '100%' }} /> : null}
        {location.pathname === '/userDashboard' || location.pathname === '/records' || location.pathname === '/adminSettings' ? <AdminSidebar style={{ height: '100%' }} /> : null}
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<SignIn />}></Route>
            <Route path="/signup" element={<SignUp />}></Route>
            <Route path="/dashboard" element={<Dashboard />}></Route>
            <Route path="/userDashboard" element={<UserDashboard />}></Route>
            <Route path="/records" element={<AdminRecords />}></Route>
            <Route path="/history" element={<History />}></Route>
            <Route path="/settings" element={<Settings />}></Route>
            <Route path="/adminSettings" element={<AdminSettings />}></Route>
          </Routes>
        </div>
      </div>
    </>
  )
}

export default App