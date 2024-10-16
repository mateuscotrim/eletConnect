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

    const realizarCadastro = async (event) => {
        event.preventDefault();

        if (senha.length < 6) {
            document.getElementById('inputSenha').classList.add('is-invalid');
            document.getElementById('feedback2').innerHTML = 'A senha inserida é muito curta. Use pelo menos 6 caracteres.';
            setTimeout(() => {
                document.getElementById('inputSenha').classList.remove('is-invalid');
                document.getElementById('feedback2').innerHTML = '';
            }, 5000);
            return;
        }

        if (senha !== senhaConfirm) {
            document.getElementById('inputConfirmarSenha').classList.add('is-invalid');
            document.getElementById('feedback3').innerHTML = 'As senhas não coincidem';
            setTimeout(() => {
                document.getElementById('inputConfirmarSenha').classList.remove('is-invalid');
                document.getElementById('feedback3').innerHTML = '';
            }, 5000);
            return;
        }

        try {
            const response = await axios.post('/auth/register', { nome, email, senha });
            if (response.status === 200) {
                document.getElementById('alert-message').innerHTML = `<div class="alert alert-success" role="alert">${response.data.mensagem}</div>`;
            }
        } catch (error) {
            document.getElementById('alert-message').innerHTML = `<div class="alert alert-danger" role="alert">${error.response.data.mensagem}</div>`;
        }
    };

    return (
        <>
            <div className="ladoEsquerdo">
                <img src={imgRegister} alt="" />
            </div>
            <div className="ladoDireito d-flex flex-column justify-content-between align-items-center">
                <Link to={"/"}>
                    <div className='logo d-flex align-items-center gap-2 mt-3'>
                        <img width={50} src={logo} alt="" />
                        <h1 className='m-0 text-black'>eletConnect</h1>
                    </div>
                </Link>
                <div className="container" style={{ padding: "4em" }}>
                    <div id="alert-message"></div>
                    <form onSubmit={realizarCadastro}>
                        <div className="text-center">
                            <h3 className='fw-bold'>Criar uma nova conta</h3>
                            <p>Você já tem uma conta? <Link to={"/login"}>Fazer login.</Link></p>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="text" className="form-control" id='inputNome' placeholder="name@example.com" value={nome} onChange={(e) => setNome(e.target.value)} required />
                            <label>Nome completo</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="email" className="form-control" id='inputEmail' placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <label>E-mail</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" className="form-control" id='inputSenha' placeholder="Password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                            <label>Senha</label>
                            <div id="feedback2" className="invalid-feedback"></div>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" className="form-control" id='inputConfirmarSenha' placeholder="Password" value={senhaConfirm} onChange={(e) => setSenhaConfirm(e.target.value)} required />
                            <label>Confirmar senha</label>
                            <div id="feedback3" className="invalid-feedback"></div>
                        </div>
                        <div className="text-center mt-3">
                            <button type="submit" className="btn btn-primary p-2 w-100">Continuar</button>
                        </div>
                    </form>
                </div>
                <div className="mb-4 text-center">
                    <p className='m-0 px-5'>Ao continuar concorda em cumprir os <Link>Termos de Serviço</Link> da EletivaConnect e sua <Link>Política de Privacidade</Link></p>
                </div>
            </div>
        </>
    );
}

