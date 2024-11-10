import './auth.css';
import axios from '../../../configs/axios';
import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

import logo from '../../../assets/images/logo/azul.png';
import imgReset from '../../../assets/images/web/Reset password-cuate.png';

export default function ResetPassword() {
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);
    const [inputErrors, setInputErrors] = useState({ senha: '', confirmarSenha: '' });
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const resetPass = async (e) => {
        e.preventDefault();
        setLoading(true);

        let hasError = false;
        const errors = { senha: '', confirmarSenha: '' };

        if (senha.length < 6) {
            errors.senha = 'A senha inserida é muito curta. Use pelo menos 6 caracteres.';
            hasError = true;
        }

        if (senha !== confirmarSenha) {
            errors.confirmarSenha = 'As senhas não coincidem.';
            hasError = true;
        }

        setInputErrors(errors);

        if (hasError) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('/auth/reset-password', { senha, token: searchParams.get('tkn') });
            if (response.status === 200) {
                setAlertMessage({ type: 'success', message: response.data.mensagem });
                setTimeout(() => {
                    navigate('/login');
                }, 5000);
            }
        } catch (error) {
            setAlertMessage({ type: 'danger', message: error.response?.data?.mensagem || 'Erro ao redefinir a senha.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex">
            <div className="ladoEsquerdo">
                <img src={imgReset} alt="Redefinir Senha" />
            </div>
            <div className="ladoDireito d-flex flex-column justify-content-between align-items-center">
                <Link to="/">
                    <div className="logo d-flex align-items-center gap-2 mt-3">
                        <img width={50} src={logo} alt="Logo eletConnect" />
                        <h1 className="m-0 text-black">eletConnect</h1>
                    </div>
                </Link>
                <div className="container" style={{ padding: '4em' }}>
                    {alertMessage && (
                        <div className={`alert alert-${alertMessage.type}`} role="alert">
                            {alertMessage.message}
                        </div>
                    )}
                    <form onSubmit={resetPass}>
                        <div className="text-center">
                            <h3 className="fw-bold">Redefinir sua senha</h3>
                            <p>Lembra da sua senha? <Link to="/login">Fazer login</Link></p>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" id="inputSenha" className={`form-control ${inputErrors.senha ? 'is-invalid' : ''}`} placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                            <label>Senha</label>
                            {inputErrors.senha && <div className="invalid-feedback">{inputErrors.senha}</div>}
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" id="inputConfirmarSenha" className={`form-control ${inputErrors.confirmarSenha ? 'is-invalid' : ''}`} placeholder="Confirmar Senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required />
                            <label>Confirmar senha</label>
                            {inputErrors.confirmarSenha && <div className="invalid-feedback">{inputErrors.confirmarSenha}</div>}
                        </div>
                        <div className="mt-3 d-flex justify-content-center align-items-center gap-2">
                            <button type="submit" className="btn btn-primary p-2 w-100" disabled={loading}>
                                {loading ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : ("Continuar")}
                            </button>
                            <Link className="btn btn-outline-secondary p-2" to="/login">Cancelar</Link>
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
