import './auth.css';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../configs/axios';
import 'bootstrap';

import logo from '../../../assets/images/logo/azul.png';
import imgRegister from '../../../assets/images/web/Sign up-cuate.png';

export default function Register() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [senhaConfirm, setSenhaConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);
    const [inputErrors, setInputErrors] = useState({ senha: '', senhaConfirm: '' });

    const realizarCadastro = async (event) => {
        event.preventDefault();
        setLoading(true);

        let hasError = false;
        const errors = { senha: '', senhaConfirm: '' };

        if (senha.length < 6) {
            errors.senha = 'A senha inserida é muito curta. Use pelo menos 6 caracteres.';
            hasError = true;
        }

        if (senha !== senhaConfirm) {
            errors.senhaConfirm = 'As senhas não coincidem.';
            hasError = true;
        }

        setInputErrors(errors);

        if (hasError) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('/auth/register', { nome, email, senha });
            if (response.status === 201) {
                setAlertMessage({ type: 'success', message: response.data.mensagem });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.mensagem || 'Erro ao registrar. Tente novamente.';
            setAlertMessage({ type: 'danger', message: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex">
            <div className="ladoEsquerdo">
                <img src={imgRegister} alt="Registrar" />
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
                    <form onSubmit={realizarCadastro}>
                        <div className="text-center">
                            <h3 className="fw-bold">Criar uma nova conta</h3>
                            <p>Você já tem uma conta? <Link to="/login">Fazer login.</Link></p>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="text" className="form-control" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required />
                            <label>Nome completo</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="email"className="form-control" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <label>E-mail</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" className={`form-control ${inputErrors.senha ? 'is-invalid' : ''}`} placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                            <label>Senha</label>
                            {inputErrors.senha && <div className="invalid-feedback">{inputErrors.senha}</div>}
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" className={`form-control ${inputErrors.senhaConfirm ? 'is-invalid' : ''}`} placeholder="Confirmar senha" value={senhaConfirm} onChange={(e) => setSenhaConfirm(e.target.value)} required />
                            <label>Confirmar senha</label>
                            {inputErrors.senhaConfirm && <div className="invalid-feedback">{inputErrors.senhaConfirm}</div>}
                        </div>
                        <div className="text-center mt-3">
                            <button type="submit" className="btn btn-primary p-2 w-100" disabled={loading}>
                                {loading ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : ("Continuar")}
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
