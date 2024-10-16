import './auth.css';
import axios from '../../../configs/axios';
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import logo from '../../../assets/images/logo/azul.png';
import imgReset from '../../../assets/images/web/Reset password-cuate.png';

export default function ResetPassword() {
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [searchParams] = useSearchParams();

    const resetPass = async (e) => {
        e.preventDefault();

        if (senha.length < 6) {
            document.getElementById('inputSenha').classList.add('is-invalid');
            document.getElementById('feedback1').innerHTML = 'A senha inserida é muito curta. Use pelo menos 6 caracteres.';
            setTimeout(() => {
                document.getElementById('inputSenha').classList.remove('is-invalid');
                document.getElementById('feedback1').innerHTML = '';
            }, 5000);
            return;
        }

        if (senha !== confirmarSenha) {
            document.getElementById('inputConfirmarSenha').classList.add('is-invalid');
            document.getElementById('feedback2').innerHTML = 'As senhas não coincidem';
            setTimeout(() => {
                document.getElementById('inputConfirmarSenha').classList.remove('is-invalid');
                document.getElementById('feedback2').innerHTML = '';
            }, 5000);
            return;
        }

        try {
            const response = await axios.post('/auth/reset-password', { senha, token: searchParams.get('tkn') });
            if (response.status === 200) {
                document.getElementById('alert-message').innerHTML = `<div class="alert alert-success" role="alert">${response.data.mensagem}</div>`;
                setTimeout(() => {
                    window.location.href = '/login';
                }, 5000);
            }
        } catch (error) {
            document.getElementById('alert-message').innerHTML = `<div class="alert alert-danger" role="alert">${error.response.data.mensagem}</div>`;
        }
    }

    return (
        <>
            <div className="ladoEsquerdo">
                <img src={imgReset} alt="" />
            </div>
            <div className="ladoDireito d-flex flex-column justify-content-between align-items-center ">
                <Link to={"/"}>
                    <div className='logo d-flex align-items-center gap-2 mt-3'>
                        <img width={50} src={logo} alt="" />
                        <h1 className='m-0 text-black'>eletConnect</h1>
                    </div>
                </Link>
                <div className="container" style={{ padding: "4em" }}>
                    <div id='alert-message'></div>
                    <form onSubmit={resetPass}>
                        <div className="text-center">
                            <h3 className='fw-bold'>Redefinir sua senha</h3>
                            <p>Lembra da sua senha? <Link to={"/login"}>Fazer login</Link></p>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" id='inputSenha' className="form-control" placeholder="name@example.com" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                            <label>Senha</label>
                            <div id="feedback1" className="invalid-feedback"></div>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" id='inputConfirmarSenha' className="form-control" placeholder="name@example.com" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required />
                            <label>Confirmar senha</label>
                            <div id="feedback2" className="invalid-feedback"></div>
                        </div>
                        <div className="mt-3 d-flex justify-content-center align-items-center gap-2">
                            <button type="submit" className="btn btn-primary p-2 w-100">Continuar</button>
                            <Link className='btn btn-outline-secondary p-2' to={"/login"}>Cancelar</Link>
                        </div>
                    </form>
                </div>
                <div className="mb-4 text-center">
                    <p className='m-0 px-5'>Ao continuar concorda em cumprir os <Link>Termos de Serviço</Link> da eletConnect e sua <Link>Política de Privacidade</Link></p>
                </div>
            </div>
        </>
    );
}
