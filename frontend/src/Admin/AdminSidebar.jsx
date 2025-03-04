import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
    const [activeLink, setActiveLink] = useState('Dashboard');
    const navigate = useNavigate();

    const handleLinkClick = (link) => {
        setActiveLink(link);
        navigate(`/${link}`);
    };

    return (
        <div className="w-1/6 p-2 bg-[#00416A] text-white poppins text-base">
            <h2 className="font-bold text-3xl mb-10 montserrat p-2">Logo</h2>
            <ul className='flex flex-col w-full gap-1'>
                <li onClick={() => handleLinkClick('records')} className={`p-2 cursor-pointer hover:bg-[#0064a2] rounded-md transition ${activeLink === 'records' ? 'active bg-[#0064a2]' : ''}`}>
                    <div>Records</div>
                </li>
                <li onClick={() => handleLinkClick('adminSettings')} className={`p-2 cursor-pointer hover:bg-[#0064a2] rounded-md transition ${activeLink === 'adminSettings' ? 'active bg-[#0064a2]' : ''}`}>
                    <div>Settings</div>
                </li>
            </ul>
        </div>
    );
};

export default AdminSidebar;