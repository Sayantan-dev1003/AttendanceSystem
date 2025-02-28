import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const [activeLink, setActiveLink] = useState('Dashboard');
    const navigate = useNavigate();

    const handleLinkClick = (link) => {
        setActiveLink(link);
        navigate(`/${link.toLowerCase()}`);
    };

    return (
        <div className="w-1/6 p-2 bg-[#00416A] text-white poppins text-base">
            <h2 className="font-bold text-3xl mb-10 montserrat p-2">Logo</h2>
            <ul className='flex flex-col w-full gap-1'>
                <li onClick={() => handleLinkClick('Dashboard') } className={`p-2 cursor-pointer hover:bg-[#0064a2] rounded-md transition ${activeLink === 'Dashboard' ? 'active bg-[#0064a2]' : ''}`}>
                    <div>Dashboard</div>
                </li>
                <li onClick={() => handleLinkClick('History') } className={`p-2 cursor-pointer hover:bg-[#0064a2] rounded-md transition ${activeLink === 'History' ? 'active bg-[#0064a2]' : ''}`}>
                    <div>History</div>
                </li>
                <li onClick={() => handleLinkClick('Settings') } className={`p-2 cursor-pointer hover:bg-[#0064a2] rounded-md transition ${activeLink === 'Settings' ? 'active bg-[#0064a2]' : ''}`}>
                    <div>Settings</div>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;