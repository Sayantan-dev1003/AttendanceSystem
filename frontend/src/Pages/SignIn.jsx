import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
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
                alert("Invalid email or password. Please try again.");
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
                    Sign In
                </h1>
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 openSans">
                    <div className="w-full flex flex-col mobile:text-sm">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            required
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-700 focus:border-green-700"
                        />
                    </div>

                    <div className="flex flex-col w-full mobile:text-sm">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-700 focus:border-green-700"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#0064a2] text-white rounded-md py-2 hover:bg-[#00416A] transition cursor-pointer"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignIn;
