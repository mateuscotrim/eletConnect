import "./auth.css";
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import showToast from '../../../utills/toasts';
import axios from '../../../configs/axios';

import InstallButton from '../../../configs/installButton';

import imgLogin from "../../../assets/images/mobile/Login-pana.png";
import escolaLogo from "../../../assets/images/mobile/Escola logo.png";

export default function Login() {
    const [matricula, setMatricula] = useState('');
    const [senha, setSenha] = useState('');

    const redirecionarParaPagina = (url) => {
        window.location.href = url;
    };

    const realizarLogin = async (event) => {
        event.preventDefault();

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
        }
    };

    return (
        <><div id='toast-container' className="toast-container position-absolute top-0 start-50 translate-middle-x mt-4"></div>
            <div className="emCima">
                <img src={imgLogin} alt="Imagem de Login" />
            </div>
            <div className="emBaixo">
                <div className="m-4 text-center d-flex flex-column justify-content-center">
                    <div className="text-center d-flex flex-column align-items-center mb-4">
                        <img width={50} src={escolaLogo} alt="Logo da Escola" />
                        <p className="m-0">CEM 03 TAGUATINGA</p>
                    </div>
                    <div className="d-flex flex-column justify-content-center">
                        <div className="mb-3">
                            <h2 className="m-0">Fazer login na sua conta</h2>
                            <small>Você precisa fazer login para selecionar as eletivas.</small>
                        </div>
                        <form className="mb-2" onSubmit={realizarLogin}>
                            <div className="form-floating mb-3">
                                <input type="text" className="form-control" id="inputMatricula" placeholder="Matrícula" value={matricula} onChange={(e) => setMatricula(e.target.value)} required />
                                <label htmlFor="inputMatricula">Matrícula</label>
                            </div>
                            <div className="form-floating">
                                <input type="password" className="form-control" id="inputSenha" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                                <label htmlFor="inputSenha">Senha</label>
                            </div>
                            <button className="btn btn-primary w-100 p-2 mt-4" type="submit">Continuar</button>
                        </form>
                        <p>Esqueceu a senha? <Link to="/m/forgot-password">Redefinir senha.</Link></p>
                        <InstallButton />
                    </div>
                </div>
            </div>
        </>
    );
}
