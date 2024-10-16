import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, allowedRoles }) => {
    const aluno = JSON.parse(sessionStorage.getItem('aluno')) || null;
    const user = JSON.parse(sessionStorage.getItem('user')) || null;

    const cargo = aluno ? 'Aluno' : user?.cargo;

    if (cargo) {
        // Verifica se o cargo é ADMIN, caso seja, permite o acesso sem restrições
        if (cargo === 'ADMIN') {
            return element;
        }

        // Se o cargo não for ADMIN, verifica se o cargo está entre os cargos permitidos
        if (allowedRoles.includes(cargo)) {
            return element;
        } else {
            // Redirecionamento condicional baseado no tipo de usuário
            const redirectPath = aluno ? '/m/home' : '/home';
            return <Navigate to={redirectPath} replace />;
        }
    } else {
        return <Navigate to="/" replace />;
    }
};

export default ProtectedRoute;
