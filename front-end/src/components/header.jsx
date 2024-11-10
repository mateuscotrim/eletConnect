import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from '../configs/axios';
axios.defaults.withCredentials = true;

import logo from '../assets/images/logo/azul.png';

export default function Header() {
    const location = useLocation();
    const user = JSON.parse(sessionStorage.getItem('user'));
    const escola = JSON.parse(sessionStorage.getItem('escola'));

    useEffect(() => {
        if (!user || !escola) {
            window.location.href = '/verification';
        }
    }, [user, escola]);

    const logout = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/auth/logout', { withCredentials: true });
            if (response.status === 200) {
                sessionStorage.clear();
                window.location.href = '/login';
            }
        } catch (error) {
            window.location.href = '/login';
        }
    };

    const menuItems = [
        { path: '/home', label: 'Início', icon: 'bi bi-bookmark-fill', roles: ['ADMIN', 'Diretor', 'Coordenador', 'Professor', 'Colaborador'] },
        { path: '/students', label: 'Estudantes', icon: 'bi bi-person-arms-up', roles: ['ADMIN', 'Diretor', 'Coordenador', 'Professor'] },
        { path: '/electives', label: 'Eletivas', icon: 'bi bi-journal-bookmark-fill', roles: ['ADMIN', 'Diretor', 'Coordenador'] },
        { path: '/settings', label: 'Configurações', icon: 'bi bi-gear-fill', roles: ['ADMIN', 'Diretor', 'Coordenador', 'Professor', 'Colaborador'] },
        { path: '/help', label: 'Ajuda', icon: 'bi bi-info-square', roles: ['ADMIN', 'Diretor', 'Coordenador', 'Professor', 'Colaborador'] }
    ];

    const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.cargo));

    return (
        <header id='header'>
            <div id='header-head' className='header-head'>
                <span className='logo-details gap-2 text-black'>
                    <img width={40} src={logo} alt='' />
                    <h1>eletConnect</h1>
                </span>
                <div className="d-flex">
                    <img height={50} className='image-school' src={escola?.logotipo || ""} alt="" />
                    <div className="profile-details">
                        <img src={user?.foto || "https://contas.acesso.gov.br/cdn/images/user-avatar.png"} alt="" />
                        <span className="admin_name">{user?.nome || ""}</span>
                    </div>
                </div>
            </div>
            <nav id='header-nav'>
                <ul>
                    {filteredMenuItems.map((item) => (
                        <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
                            <Link to={item.path}>
                                <i className={item.icon}></i>
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                    <li className="log_out" onClick={logout}>
                        <Link>
                            <i className="bi bi-box-arrow-left"></i>
                            <span>Deslogar</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}
