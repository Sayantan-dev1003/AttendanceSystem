import axios from "axios";
import { useEffect, useState } from "react";

const WelcomeNote = () => {
    const [name, setName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/user/name');
                setName(response.data.name);
            } catch (error) {
                console.error('Error fetching name:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="w-full flex flex-col items-center px-4">
            <h1 className="text-2xl font-bold text-gray-800 montserrat">
                Welcome, {name} 👋
            </h1>
        </div>
    );
};

export default WelcomeNote;
