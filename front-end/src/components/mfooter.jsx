import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "../assets/styles/mMain.css";

const MenuItem = ({ path, label, icon, className }) => (
    <li className={`text-center ${className || ''}`}>
        <Link to={path} className='d-flex flex-column btn p-2'>
            <i className={icon}></i>
            <p className='m-0'>{label}</p>
        </Link>
    </li>
);

export default function MFooter() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => setMenuOpen(prev => !prev);

    const itensMenu = [
        { path: '/m/home', label: 'Home', icon: 'bi bi-house-fill fs-2' },
        { path: '/m/my-electives', label: 'Minhas eletivas', icon: 'bi bi-bookmark-star-fill fs-2' },
        { path: '/m/electives', label: 'Eletivas', icon: 'bi bi-journal-bookmark-fill fs-2' },
    ];

    const itensMenu_OVERLAY = [
        { path: '/m/home', label: 'Minhas Eletivas', icon: 'bi bi-bookmark-star-fill' },
        { path: '/m/home', label: 'Eletivas', icon: 'bi bi-journal-bookmark-fill' },
        { path: '/m/home', label: 'Configs...', icon: 'bi bi-gear-fill' },
    ];

    return (
        <footer id='mFooter'>
            <ul className='footer-menu d-flex justify-content-around align-items-center'>
                {itensMenu.map((item, index) => (
                    <MenuItem key={index} path={item.path} label={item.label} icon={item.icon} />
                ))}
                {/* <button 
                    onClick={toggleMenu} 
                    className='position-absolute top-0 start-50 translate-middle rounded-circle cor-menu'>
                    <i className="bi bi-list position-absolute top-50 start-50 translate-middle text-white fs-1"></i>
                </button> */}
            </ul>

            {/* <div className={`menu-overlay ${menuOpen ? 'show' : ''}`}>
                <ul className='footer-menu'>
                    {itensMenu_OVERLAY.map((item, index) => (
                        <MenuItem 
                            key={index}
                            path={item.path}
                            label={item.label}
                            icon={item.icon}
                            className="overlay-item"
                        />
                    ))}
                </ul>
            </div> */}
        </footer>
    );
}
