import './auth.css';
import axios from '../../../configs/axios';
import React, { useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

import logo from '../../../assets/images/logo/azul.png';
import imgConfirm from '../../../assets/images/web/Confirmed-cuate.png';

export default function ConfirmRegistration() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const confirmarRegistration = async () => {
            const token = searchParams.get('tkn');
            if (!token) {
                document.getElementById('title').textContent = 'Token de verificação inválido.';
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
                return;
            }

            try {
                const response = await axios.post('/auth/confirm-registration', { token });
                if (response.status === 200) {
                    document.getElementById('title').textContent = response.data.mensagem;
                    document.getElementById('subtitle').textContent = 'Redirecionando para a página de login.';
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                }
            } catch (error) {
                document.getElementById('title').textContent = error.response?.data?.mensagem || 'Erro ao confirmar o registro.';
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        };

        confirmarRegistration();
    }, [searchParams, navigate]);

    return (
        <div className="d-flex">
            <div className="ladoEsquerdo">
                <img src={imgConfirm} alt="Confirmação" />
            </div>
            <div className="ladoDireito d-flex flex-column justify-content-between align-items-center">
                <Link to="/">
                    <div className="logo d-flex align-items-center gap-2 mt-3">
                        <img width={50} src={logo} alt="eletConnect Logo" />
                        <h1 className="m-0 text-black">eletConnect</h1>
                    </div>
                </Link>
                <div className="container" style={{ padding: '4em' }}>
                    <div id="alert-message"></div>
                    <div className="text-center">
                        <h4 id="title"></h4>
                        <p id="subtitle"></p>
                    </div>
                </div>
                <div className="mb-4 text-center">
                    <p className="m-0 px-5">
                        Ao continuar, você concorda em cumprir os <Link to="#">Termos de Serviço</Link> da eletConnect e a nossa <Link to="#">Política de Privacidade</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
