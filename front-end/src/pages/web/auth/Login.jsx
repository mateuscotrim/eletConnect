import "./auth.css";
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../../configs/axios';

import logo from '../../../assets/images/logo/azul.png';
import imgLogin from '../../../assets/images/web/Computer login-cuate.png';

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);
    const navigate = useNavigate();

    const realizarLogin = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post('/auth/login', { email, senha });
            if (response.status === 200) {
                setAlertMessage({ type: 'success', message: response.data.mensagem });
                setTimeout(() => {
                    navigate('/verification');
                }, 1000);
            }
        } catch (error) {
            setAlertMessage({ type: 'danger', message: error.response?.data?.mensagem || 'Erro ao fazer login.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="d-flex">
            <div className="ladoEsquerdo">
                <img src={imgLogin} alt="Tela de login" />
            </div>
            <div className="ladoDireito d-flex flex-column justify-content-between align-items-center">
                <Link to="/">
                    <div className="d-flex align-items-center gap-2 mt-3">
                        <img width={50} src={logo} alt="Logo eletConnect" />
                        <h1 className="m-0 text-black fonte">eletConnect</h1>
                    </div>
                </Link>
                <div className="container" style={{ padding: "4em" }}>
                    {alertMessage && (
                        <div className={`alert alert-${alertMessage.type}`} role="alert">
                            {alertMessage.message}
                        </div>
                    )}
                    <form onSubmit={realizarLogin}>
                        <div className="text-center pb-3">
                            <h3 className="fw-bold">Fazer login na sua conta</h3>
                            <p className="m-0">
                                Você não tem uma conta? <Link to="/register">Criar conta.</Link>
                            </p>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="email"className="form-control" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <label>E-mail</label>
                        </div>
                        <div className="form-floating">
                            <input type="password" className="form-control" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required/>
                            <label>Senha</label>
                            <p className="pt-1">
                                Esqueceu sua senha? <Link to="/forgot-password">Redefinir senha.</Link>
                            </p>
                        </div>
                        <div className="text-center">
                            <button type="submit" className="btn btn-primary p-2 w-100" disabled={isLoading}>
                                {isLoading ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : ("Continuar")}
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
