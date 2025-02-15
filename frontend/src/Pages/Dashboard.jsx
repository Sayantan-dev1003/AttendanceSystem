import axios from 'axios';

const Dashboard = () => {
  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
      window.location.href = '/'; // Redirect to the home page after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <button className="bg-red-500 text-white py-2 px-4 rounded-lg cursor-pointer" onClick={handleLogout}>Logout</button>
    </>
  )
}

export default Dashboard