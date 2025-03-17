import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminSettings = () => {
  const [name, setName] = useState("");
  const [empID, setEmpID] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/user');
        const { name, employee_id, email, phone, department, designation, profilePhoto } = response.data;
        setName(name);
        setEmpID(employee_id);
        setEmail(email);
        setPhone(phone);
        setDepartment(department);
        setDesignation(designation);
        setProfilePic(profilePhoto);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, []);

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];

    if (file) {
        const formData = new FormData();
        formData.append("profilePhoto", file);

        axios.post("/api/updateProfilePhoto", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
        .then(response => {
            console.log("Profile picture updated successfully:", response.data);
            alert("Profile picture updated successfully!");
        })
        .catch(error => {
            console.error("Error updating profile picture:", error);
            alert("Failed to update profile picture.");
        });
    }
};


  const handleSaveChanges = () => {
    const updateData = { name, phone };

    if (oldPassword && newPassword) {
      updateData.oldPassword = oldPassword;
      updateData.newPassword = newPassword;
    }

    axios.patch("/api/users/update", updateData)
      .then(response => {
        alert("Changes saved successfully!");
        console.log("User details updated successfully:", response.data);
      })
      .catch(error => {
        console.error("Error saving changes:", error);
        alert(error.response?.data?.error || "Failed to update user details.");
      });
  };

  const handleLogout = () => {
    axios.post('/logout')
      .then(response => {
        console.log("Logged out successfully:", response.data);
        navigate('/');
      })
      .catch(error => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <div className="w-full flex justify-end items-start openSans">
      <div className="w-5/6 min-h-screen flex flex-col overflow-y-auto p-8">
        <h2 className="text-3xl font-bold text-[#00416A] mb-4 montserrat">Settings</h2>
        
        <div className="flex gap-10 items-end w-full justify-between bg-[#daf1ff] rounded-2xl p-4 mb-10 shadow-lg">
          <div className="flex gap-10 items-center w-full justify-start">
            <div>
              <img
                src={profilePic ? `/uploads/${profilePic}` : "https://via.placeholder.com/100"}
                alt="Profile"
                className="w-28 h-28 rounded-full mb-2 shadow"
              />
              <div className="text-sm relative">
                <FontAwesomeIcon icon={faPencil} className="bg-[#0064a2] hover:bg-[#00416A] p-2.5 rounded-full text-white absolute bottom-1 left-20 shadow-md hover:transition hover:scale-105 cursor-pointer" onClick={() => document.getElementById('profilePicInput').click()} />
                <input id="profilePicInput" type="file" onChange={handleProfilePicChange} className="hidden" />
              </div>
            </div>
            <div className="poppins">
                <p className="text-3xl font-semibold">{name} <span className="text-xs italic font-light text-gray-500">{designation}</span></p>
                <p className="text-sm font-light text-gray-500">{empID}</p>
                <p className="text-sm font-light text-gray-500">{email}</p>
                <p className="text-sm font-light text-gray-500">{phone}</p>
            </div>
          </div>
          <div className="w-[10vw] flex justify-end items-end">
            <button className="bg-[#0064a2] hover:bg-[#00416A] hover:transition hover:scale-105 text-white font-medium py-2 px-4 rounded cursor-pointer" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="w-full mb-4 flex justify-between text-gray-700">
          <div className="w-1/2 mr-2">
            <label className="block font-medium">Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="w-1/2 ml-2">
            <label className="block font-medium">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="w-[39.2vw] mb-4 text-gray-700">
          <label className="block font-medium">Phone</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="w-full mb-4 flex justify-between text-gray-400">
          <div className="w-1/2 mr-2">
            <label className="block font-medium">Department</label>
            <input
              type="text"
              className="w-full p-2 border rounded cursor-not-allowed"
              value={department}
              disabled
            />
          </div>
          <div className="w-1/2 ml-2">
            <label className="block font-medium">Designation</label>
            <input
              type="text"
              className="w-full p-2 border rounded cursor-not-allowed"
              value={designation}
              disabled
            />
          </div>
        </div>

        <div className="w-full mb-4 flex justify-between text-gray-700">
          <div className="w-1/2 mr-2">
            <label className="block font-medium">Old Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="w-1/2 ml-2">
            <label className="block font-medium">New Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleSaveChanges}
          className="bg-[#0064a2] cursor-pointer text-white px-4 py-2 rounded mt-4 hover:bg-[#00416A]"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
