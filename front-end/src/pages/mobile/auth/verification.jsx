import React, { useState, useEffect } from 'react';
import axios from '../../../configs/axios';
import 'bootstrap';
import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true;

export default function Verificacao() {
    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState('Verificando...');
    const [subMensagem, setSubMensagem] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const verificarSessao = async () => {
            try {
                const respostaSessao = await axios.get('/m/auth/check-session');
                if (respostaSessao.status === 200) {
                    sessionStorage.setItem('aluno', JSON.stringify(respostaSessao.data));
                    verificarSenha(respostaSessao.data);
                }
            } catch (erro) {
                tratarErro(erro, 'Redirecionando...');
            }
        };

        verificarSessao();
    }, []);

    const verificarSenha = (dadosUsuario) => {
        setCarregando(false);
        if (dadosUsuario.senha_temporaria) {
            navigate('/m/change-password');
        } else {
            navigate('/m/home');
        }
    };

    const tratarErro = (erro, subMsg) => {
        setMensagem('Ocorreu um erro');
        setSubMensagem(subMsg);
        sessionStorage.clear();
        setTimeout(() => {
            navigate('/m/login');
        }, 1000);
    };

    return (
        carregando && (
            <div className='position-absolute top-50 start-50 translate-middle text-center'>
                <div className="spinner-grow text-primary" style={{ width: '5rem', height: '5rem' }} role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
                <div>
                    <p id="mensagem">{mensagem}</p>
                    <p id='sub-mensagem'>{subMensagem}</p>
                </div>
            </div>
        )
    );
};
