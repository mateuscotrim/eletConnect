import './auth.css';
import axios from '../../../configs/axios';
import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import logo from '../../../assets/images/logo/azul.png';
import imgConfirm from '../../../assets/images/web/Confirmed-cuate.png';

export default function ConfirmRegistration() {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const confirmRegistration = async () => {
            try {
                const response = await axios.post('/auth/confirm-registration', { token: searchParams.get('tkn') });
                if (response.status === 200) {
                    document.getElementById('title').innerHTML = `${response.data.mensagem}`;
                    document.getElementById('subtitle').innerHTML = 'Redirecionando para a página de login.';
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 5000);
                }
            } catch (error) {
                document.getElementById('title').innerHTML = `${error.response?.data?.mensagem}`;
                setTimeout(() => {
                    window.location.href = '/login';
                }, 5000);
            }
        };

        confirmRegistration();
    }, [location.search]);

    return (
        <div className="d-flex">
            <div className="ladoEsquerdo">
                <img src={imgConfirm} alt="" />
            </div>
            <div className="ladoDireito d-flex flex-column justify-content-between align-items-center">
                <Link to="/">
                    <div className='logo d-flex align-items-center gap-2 mt-3'>
                        <img width={50} src={logo} alt="" />
                        <h1 className='m-0 text-black'>eletConnect</h1>
                    </div>
                </Link>
                <div className="container" style={{ padding: "4em" }}>
                    <div id="alert-message"></div>
                    <div className='text-center'>
                        <h4 id='title'></h4>
                        <p id='subtitle'></p>
                    </div>
                </div>
                <div className="mb-4 text-center">
                    <p className='m-0 px-5'>Ao continuar concorda em cumprir os <Link>Termos de Serviço</Link> da eletConnect e sua <Link>Política de Privacidade</Link></p>
                </div>
            </div>
        </div>
    );
}
