import React, { useState } from 'react';
import MHeader from '../../../components/mheader';
import MFooter from '../../../components/mfooter';
import axios from '../../../configs/axios';
import "../../../assets/styles/mMain.css";

export default function ChangePassword() {
    const [senha, setSenha] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');

    const aluno = JSON.parse(sessionStorage.getItem('aluno'));

    const handleChangePassword = async (event) => {
        event.preventDefault();

        if (novaSenha !== confirmarSenha) {
            setAlertMessage('As senhas não coincidem. Tente novamente.');
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
                setAlertMessage('Senha alterada com sucesso!');
                setAlertType('success');
                setTimeout(() => {
                    window.location.href = '/m/home';
                }, 1500);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.mensagem || 'Ocorreu um erro ao alterar a senha. Tente novamente mais tarde.';
            setAlertMessage(errorMessage);
            setAlertType('danger');
        }
    };

    return (
        <>
            <MHeader />
            <main id='mMain' className="d-flex flex-column align-items-center justify-content-center">
                <h2 className="mb-4">Alterar Senha</h2>
                <form className="w-75" onSubmit={handleChangePassword}>
                    <div className="form-floating mb-3">
                        <input
                            type="password"
                            className="form-control"
                            id="novaSenha"
                            placeholder="Nova Senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                        />
                        <label htmlFor="novaSenha">Senha Atual</label>
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
                {alertMessage && (
                    <div className={`alert alert-${alertType} mt-4`} role="alert">
                        {alertMessage}
                    </div>
                )}
            </main>
            <MFooter />
        </>
    );
}
