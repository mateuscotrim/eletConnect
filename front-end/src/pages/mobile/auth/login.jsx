import "./auth.css";
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import showToast from '../../../utills/toasts';
import axios from '../../../configs/axios';

import InstallButton from '../../../configs/installButton';

import escolaLogo from "../../../assets/images/mobile/Escola logo.png";

export default function Login() {
    const [matricula, setMatricula] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);

    const redirecionarParaPagina = (url) => {
        window.location.href = url;
    };

    const realizarLogin = async (event) => {
        event.preventDefault();
        setCarregando(true);

        try {
            const response = await axios.post('/m/auth/login', { matricula, senha });
            if (response.status === 200) {
                if (response.data.senha_temporaria) {
                    showToast('warning', 'Sua senha é temporária. Por favor, altere sua senha para continuar.');
                    setTimeout(() => redirecionarParaPagina('/m/change-password'), 1500);
                } else {
                    showToast('success', 'Login realizado com sucesso!');
                    setTimeout(() => redirecionarParaPagina('/m/verification'), 1500);
                }
            }
        } catch (error) {
            const mensagemErro = error.response?.data?.mensagem || 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
            showToast('danger', mensagemErro);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-fixed bottom-0 end-0 p-3"></div>
            <div className="vh-100 d-flex flex-column justify-content-center align-items-center px-3" style={{ overflow: "hidden" }}>
                <div className="text-center mb-4">
                    <img width={75} src={escolaLogo} alt="Logo da Escola" className="mb-2" />
                    <h1 className="h4 fw-bold">CEM 03 TAGUATINGA</h1>
                </div>
                <div className="w-100 p-4 rounded shadow-sm bg-white">
                    <div className="mb-3">
                        <h2 className="h6">| Área do Aluno</h2>
                        <p className="text-muted small">Acesse para escolher suas disciplinas eletivas e acompanhar o progresso.</p>
                    </div>
                    <form onSubmit={realizarLogin}>
                        <div className="form-floating mb-3">
                            <input type="text" className="form-control" id="inputMatricula" placeholder="Matrícula" value={matricula} onChange={(e) => setMatricula(e.target.value)} required />
                            <label htmlFor="inputMatricula">Matrícula</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" className="form-control" id="inputSenha" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                            <label htmlFor="inputSenha">Senha</label>
                        </div>
                        <button className="btn btn-primary w-100 p-2" type="submit" disabled={carregando}>
                            {carregando ? (<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>) : 'Continuar'}
                        </button>
                    </form>
                    <div className="text-center mt-3">
                        <p className="small m-0">Esqueceu a senha? <Link to="/m/forgot-password">Redefinir</Link></p>
                    </div>
                </div>
                <div className="m-2">
                    <InstallButton />
                </div>
            </div>
        </>
    );
}
