import React, { useState } from 'react';
import MHeader from '../../../components/mheader';
import MFooter from '../../../components/mfooter';
import axios from '../../../configs/axios';
import "../../../assets/styles/mMain.css";
import "./auth.css";

export default function ChangePassword() {
    const [senha, setSenha] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [email, setEmail] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');

    const aluno = JSON.parse(sessionStorage.getItem('aluno'));

    const handleChangePassword = async (event) => {
        event.preventDefault();

        if (novaSenha !== confirmarSenha) {
            setAlertMessage('As senhas digitadas não coincidem. Verifique e tente novamente.');
            setAlertType('danger');
            return;
        }

        try {
            const response = await axios.post('/m/auth/change-password', {
                matricula: aluno.matricula,
                senhaAtual: senha,
                senhaNova: confirmarSenha
            });

            if (response.status === 200) {
                setAlertMessage('Sua senha foi alterada com sucesso! Você será redirecionado em instantes.');
                setAlertType('success');
                setTimeout(() => {
                    window.location.href = '/m/home';
                }, 1500);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.mensagem || 'Não foi possível alterar a senha. Por favor, tente novamente mais tarde.';
            setAlertMessage(errorMessage);
            setAlertType('danger');
        }
    };

    const handleRegisterEmail = async () => {
        if (!email) {
            setAlertMessage('O campo de e-mail não pode estar vazio. Por favor, insira um e-mail válido.');
            setAlertType('danger');
            return;
        }

        try {
            const response = await axios.post('/m/auth/register-email', {
                matricula: aluno.matricula,
                email
            });

            if (response.status === 200) {
                setAlertMessage('E-mail cadastrado com sucesso! Agora você pode usar este e-mail para redefinição de senha.');
                setAlertType('success');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.mensagem || 'Não foi possível cadastrar o e-mail. Por favor, tente novamente mais tarde.';
            setAlertMessage(errorMessage);
            setAlertType('danger');
        }
    };

    return (
        <>
            <MHeader />
            <main id='mMain' className="d-flex flex-column align-items-center justify-content-center overflow-hidden">
                <div className="p-4 w-100">
                    <h2 className="mb-4 text-center">Alterar Senha</h2>
                    <form onSubmit={handleChangePassword}>
                        <div className="form-floating mb-3">
                            <input
                                type="password"
                                className="form-control"
                                id="senhaAtual"
                                placeholder="Senha Atual"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />
                            <label htmlFor="senhaAtual">Senha Atual</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input
                                type="password"
                                className="form-control"
                                id="novaSenha"
                                placeholder="Nova Senha"
                                value={novaSenha}
                                onChange={(e) => setNovaSenha(e.target.value)}
                                required
                            />
                            <label htmlFor="novaSenha">Nova Senha</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input
                                type="password"
                                className="form-control"
                                id="confirmarSenha"
                                placeholder="Confirmar Senha"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                required
                            />
                            <label htmlFor="confirmarSenha">Confirmar Senha</label>
                        </div>
                        <button className="btn btn-primary w-100 p-2 mt-3" type="submit">Alterar Senha</button>
                    </form>
                </div>

                <div className="accordion accordion-flush w-100 mt-4" id="accordionFlushExample" style={{ maxWidth: '600px' }}>
                    <div className="accordion-item">
                        <h2 className="accordion-header" id="flush-headingEmail">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseEmail" aria-expanded="false" aria-controls="flush-collapseEmail">
                                Cadastrar E-mail para Redefinição de Senha
                            </button>
                        </h2>
                        <div id="flush-collapseEmail" className="accordion-collapse collapse" aria-labelledby="flush-headingEmail" data-bs-parent="#accordionFlushExample">
                            <div className="accordion-body">
                                <div className="form-floating mb-3">
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        placeholder="E-mail"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="email">E-mail</label>
                                </div>
                                <button className="btn btn-secondary w-100 p-2" onClick={handleRegisterEmail}>Cadastrar E-mail</button>
                            </div>
                        </div>
                    </div>
                </div>

                {alertMessage && (
                    <div className={`alert alert-${alertType} mt-4 w-100`} style={{ maxWidth: '600px' }} role="alert">
                        {alertMessage}
                    </div>
                )}
            </main>
            <MFooter />
        </>
    );
}
