import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        department: "",
        designation: "",
        profilePhotos: [], // Changed to an array to hold multiple images
        password: ""
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files); // Convert FileList to an array
        const filesArray = files.map(file => file); // Map each file to an array
        setFormData(prevState => ({
            ...prevState,
            profilePhotos: filesArray, // Update profilePhoto with the array of files
        }));
    };

    const generateEmployeeId = () => {
        return `EMP-${Date.now()}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const employee_id = generateEmployeeId();
        const formDataToSend = new FormData();
    
        Object.keys(formData).forEach(key => {
            if (key === 'profilePhotos') {
                formData[key].forEach((file) => {
                    formDataToSend.append("profilePhotos", file);
                });
            } else {
                formDataToSend.append(key, formData[key]);
            }
        });
        formDataToSend.append("employee_id", employee_id);
        
        try {
            const response = await fetch("/register", {
                method: "POST",
                body: formDataToSend, // Send formDataToSend to the API
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log(data.message);
                if (data.designation.toLowerCase() === "admin") {
                    navigate("/records");
                } else {
                    navigate("/dashboard");
                }
            } else {
                const errorData = await response.json();
                console.error(errorData.message);
                alert("Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center">
            <div className="bg-white shadow-lg rounded-lg mx-4 p-6 w-full max-w-lg">
                <h1 className="text-2xl montserrat font-bold text-center text-[#0064a2] mb-6">
                    Sign Up
                </h1>
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 openSans">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-700 focus:border-green-700" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-700 focus:border-green-700" />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-700 focus:border-green-700" />
                    <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="Department" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-700 focus:border-green-700" />
                    <input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="Designation" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-700 focus:border-green-700" />
                    <input type="file" name="profilePhotos" onChange={handleFileChange} key={formData.profilePhotos.length} accept="image/*" multiple required className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-700 focus:border-green-700" />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-700 focus:border-green-700" />
                    <button type="submit" className="w-full bg-[#0064a2] text-white rounded-md py-2 hover:bg-[#00416A]">Register</button>
                </form>
            </div>
        </div>
    );
};

export default SignUp;