import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../configs/axios';
import "../assets/styles/mMain.css";

import logo from '../assets/images/mobile/Escola logo-s.png';

export default function MHeader() {
    const aluno = JSON.parse(sessionStorage.getItem('aluno'));

    useEffect(() => {
        if (!aluno) {
            window.location.href = '/m/verification';
        }
    }, []);

    const logout = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/m/auth/logout', { withCredentials: true });
            if (response.status === 200) {
                sessionStorage.clear();
                window.location.href = '/m/login';
            }
        } catch (error) {
            console.error('Erro ao deslogar:', error);
        }
    };

    return (
        <header id='mheader'>
            <div className='header-content d-flex justify-content-between align-items-center w-100'>
                <Link to={'/m/home'} className='logo d-flex align-items-center gap-2 text-black'>
                    <img width={50} src={logo} alt='Logo CEM 03 TAGUATINGA' />
                    <p className='m-0 fw-bold text-white'>CEM 03 TAGUATINGA</p>
                </Link>
                {aluno && (
                    <div className="dropdown">
                        <img width={50} src='https://www.gov.br/cdn/sso-status-bar/src/image/user.png' alt='Foto de perfil' className='rounded-circle' data-bs-toggle="dropdown" />
                        <ul className="dropdown-menu">
                            <li className='dropdown-item text-white p-3' style={{ backgroundColor: '#1d3c76' }}>
                                <p className='m-0'><b>Matricula</b>: {aluno.matricula}</p>
                                <p className='m-0'><b>Nome</b>: {aluno.nome} </p>
                                <p className='m-0'><b>Serie/Turma:</b> {aluno.serie} {aluno.turma}</p>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><a href="/m/change-password" className='dropdown-item'><i className="bi bi-shield-lock-fill"></i>&ensp;Alterar senha</a></li>
                            <li><a className="dropdown-item" onClick={logout}><i className="bi bi-door-open-fill"></i>&ensp;Deslogar</a></li>
                        </ul>
                    </div>
                )}
            </div>
        </header>
    );
}
