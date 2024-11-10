import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../../configs/axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap';
axios.defaults.withCredentials = true;

export default function Verification() {
    const [isLoading, setIsLoading] = useState(true);
    const [mensagem, setMensagem] = useState('Verificando...');
    const [subMensagem, setSubMensagem] = useState('');
    const navigate = useNavigate();

    const handleError = useCallback((error, subMsg) => {
        let errorMessage = 'Erro inesperado. Tente novamente.';
        if (error.response) {
            errorMessage = error.response.data?.mensagem || error.response.statusText;
        } else if (error.request) {
            errorMessage = 'Não foi possível se comunicar com o servidor. Verifique sua conexão.';
        } else {
            errorMessage = error.message;
        }
        setMensagem(errorMessage);
        setSubMensagem(subMsg || 'Redirecionando...');
        sessionStorage.clear();
        setTimeout(() => navigate('/login'), 2000);
    }, [navigate]);

    const verifyInstitution = useCallback(async (userId) => {
        const storedInstitution = sessionStorage.getItem('escola');
        if (!storedInstitution) {
            try {
                const responseInstitution = await axios.post('/instituicao/verificar', { id: userId });
                const institutionData = responseInstitution.data.userData;
                sessionStorage.setItem('escola', JSON.stringify(responseInstitution.data));
                navigateUser(!!institutionData?.instituicao);
            } catch (error) {
                handleError(error, 'Redirecionando...');
            }
        } else {
            const institutionData = JSON.parse(storedInstitution).userData;
            navigateUser(!!institutionData?.instituicao);
        }
    }, [handleError]);

    const verifySession = useCallback(async () => {
        try {
            const storedUser = sessionStorage.getItem('user');
            if (!storedUser) {
                const responseSession = await axios.get('/auth/check-session', { withCredentials: true });
                const user = responseSession.data;

                if (user.status === 'Inativo') {
                    handleError(new Error('Usuário inativo'), 'Redirecionando para login...');
                    return;
                }

                sessionStorage.setItem('user', JSON.stringify(user));
                await verifyInstitution(user.id);
            } else {
                const user = JSON.parse(storedUser);
                await verifyInstitution(user.id);
            }
        } catch (error) {
            handleError(error, 'Redirecionando para login...');
        }
    }, [handleError, verifyInstitution]);

    useEffect(() => {
        verifySession();
    }, [verifySession]);

    const navigateUser = (hasInstitution) => {
        setIsLoading(false);
        if (hasInstitution) {
            navigate('/home');
        } else {
            navigate('/first-access');
        }
    };

    if (isLoading) {
        return (
            <div className='position-absolute top-50 start-50 translate-middle text-center'>
                <div className="d-flex align-items-center gap-4">
                    <div className="spinner-border" role="status" aria-hidden="true"></div>
                    <strong>{subMensagem}</strong>
                </div>
                <p className='mt-3'>{mensagem}</p>
            </div>
        );
    }

    return null;
}
