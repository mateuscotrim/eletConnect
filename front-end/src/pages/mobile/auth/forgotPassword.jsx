import "./auth.css";
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import showToast from '../../../utills/toasts';
import axios from '../../../configs/axios';

import escolaLogo from "../../../assets/images/mobile/Escola logo.png";

export default function ForgotPassword() {
    const [matricula, setMatricula] = useState('');
    const [carregando, setCarregando] = useState(false);

    const solicitarRedefinicao = async (event) => {
        event.preventDefault();
        setCarregando(true);

        try {
            const response = await axios.post('/m/auth/forgot-password', { matricula });

            if (response.status === 200) {
                showToast('success', 'Solicitação enviada com sucesso! Verifique seu e-mail para redefinir sua senha.');
            } else {
                showToast('danger', 'Erro ao enviar a solicitação. Tente novamente.');
            }
        } catch (error) {
            const mensagemErro = error.response?.data?.mensagem || 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
            showToast('danger', mensagemErro);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="vh-100 d-flex flex-column justify-content-center align-items-center px-3" style={{ overflow: "hidden" }}>
            <div className="text-center mb-4">
                <img width={75} src={escolaLogo} alt="Logo da Escola" className="mb-2" />
                <h1 className="h4 fw-bold">CEM 03 TAGUATINGA</h1>
            </div>
            <div className="w-100 p-4 rounded shadow-sm bg-white">
                <div className="mb-3">
                    <h2 className="h6">| Redefinição de Senha</h2>
                    <p className="text-muted small">Digite sua matrícula para solicitar a redefinição de senha.</p>
                </div>
                <form onSubmit={solicitarRedefinicao}>
                    <div className="form-floating mb-3">
                        <input
                            type="text"
                            className="form-control"
                            id="inputMatricula"
                            placeholder="Matrícula"
                            value={matricula}
                            onChange={(e) => setMatricula(e.target.value)}
                            required
                        />
                        <label htmlFor="inputMatricula">Matrícula</label>
                    </div>
                    <button className="btn btn-primary w-100 p-2" type="submit" disabled={carregando}>
                        {carregando ? ( <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> ) : 'Solicitar Redefinição'}
                    </button>
                </form>
                <div className="text-center mt-3">
                    <p className="small m-0">Lembrou sua senha? <Link to="/m/login">Entrar</Link></p>
                </div>
            </div>
        </div>
    );
}
