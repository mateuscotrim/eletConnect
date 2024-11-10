import React, { useState } from 'react';
import axios from '../../../configs/axios';
import showToast from '../../../utills/toasts';

export default function ChangePassword() {
    const user = JSON.parse(sessionStorage.getItem('user'));

    const [id] = useState(user?.id || '');
    const [username, setUsername] = useState(user?.username || '');
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [showPassword, setShowPassword] = useState({ atual: false, nova: false, confirmar: false });
    const [loading, setLoading] = useState(false);

    const togglePasswordVisibility = (field) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const alterarSenha = async (event) => {
        event.preventDefault();

        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            showToast('danger', 'Preencha todos os campos.');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            showToast('danger', 'As senhas não coincidem.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/auth/change-password', { id, senhaAtual, novaSenha });
            if (response.status === 200) {
                sessionStorage.setItem('mensagemSucesso', response.data.mensagem);
                windows.location.reload();
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao alterar a senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-absolute bottom-0 start-50 translate-middle-x p-3"></div>
            <form onSubmit={alterarSenha}>
                <input type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" style={{ display: 'none' }} />

                <div className="mb-3">
                    <label htmlFor="senhaAtual" className="form-label">Senha atual</label>
                    <div className="input-group">
                        <input type={showPassword.atual ? 'text' : 'password'} className="form-control" id="senhaAtual" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} autoComplete="current-password" minLength="6" title="A senha atual deve ter no mínimo 6 caracteres." required />
                        <button type="button" className="btn btn-outline-secondary" onClick={() => togglePasswordVisibility('atual')} >
                            <i className={`bi ${showPassword.atual ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label htmlFor="novaSenha" className="form-label">Senha nova</label>
                        <div className="input-group">
                            <input type={showPassword.nova ? 'text' : 'password'} className="form-control" id="novaSenha" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} autoComplete="new-password" pattern="(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}" title="A nova senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números." required />
                            <button type="button" className="btn btn-outline-secondary" onClick={() => togglePasswordVisibility('nova')} >
                                <i className={`bi ${showPassword.nova ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                        </div>
                        {novaSenha && !novaSenha.match(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}/) && (
                            <div className="text-danger mt-1">
                                <small>A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números.</small>
                            </div>
                        )}
                    </div>

                    <div className="col">
                        <label htmlFor="confirmarSenha" className="form-label">Confirmar senha</label>
                        <div className="input-group">
                            <input type={showPassword.confirmar ? 'text' : 'password'} className="form-control" id="confirmarSenha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} autoComplete="new-password" required />
                            <button type="button" className="btn btn-outline-secondary" onClick={() => togglePasswordVisibility('confirmar')} >
                                <i className={`bi ${showPassword.confirmar ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                        </div>
                        {confirmarSenha && confirmarSenha !== novaSenha && (
                            <div className="text-danger mt-1">
                                <small>As senhas não coincidem.</small>
                            </div>
                        )}
                    </div>
                </div>

                <div className='text-end pt-4'>
                    <button type='submit' className="btn btn-success" disabled={loading}>
                        {loading ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : (<><i className="bi bi-key-fill"></i>&ensp;Alterar senha</>)}
                    </button>
                </div>
            </form>
        </>
    );
}
