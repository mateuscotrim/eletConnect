import './auth.css';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../configs/axios';

import logo from '../../../assets/images/logo/azul.png';
import imgForgot from '../../../assets/images/web/Forgot password-cuate.png';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);

    const forgotPass = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/auth/forgot-password', { email });
            if (response.status === 200) {
                setAlertMessage({ type: 'success', message: response.data.mensagem });
            }
        } catch (error) {
            setAlertMessage({ type: 'danger', message: error.response?.data?.mensagem || 'Erro ao solicitar a redefinição de senha.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex">
            <div className="ladoEsquerdo">
                <img src={imgForgot} alt="Esqueceu sua senha?" />
            </div>
            <div className="ladoDireito d-flex flex-column justify-content-between align-items-center">
                <Link to="/">
                    <div className="logo d-flex align-items-center gap-2 mt-3">
                        <img width={50} src={logo} alt="eletConnect Logo" />
                        <h1 className="m-0 text-black">eletConnect</h1>
                    </div>
                </Link>
                <div className="container" style={{ padding: '4em' }}>
                    {alertMessage && (
                        <div className={`alert alert-${alertMessage.type}`} role="alert">
                            {alertMessage.message}
                        </div>
                    )}
                    <form onSubmit={forgotPass}>
                        <div className="text-center">
                            <h3 className="fw-bold">Esqueceu sua senha?</h3>
                            <p>Lembrou sua senha? <Link to="/login">Fazer login.</Link></p>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="email" className="form-control" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <label>E-mail</label>
                            <p><small>Nunca compartilharemos seu e-mail com mais ninguém.</small></p>
                        </div>
                        <div className="text-center mt-3">
                            <button type="submit" className="btn btn-primary p-2 w-100" disabled={loading}>
                                {loading ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : ('Redefinir senha')}
                            </button>
                        </div>
                    </form>
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
