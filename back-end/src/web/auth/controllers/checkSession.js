exports.checkSession = async (request, response) => {
    try {
        if (request.session && request.session.user) {
            const { id, matricula, nome, email, foto, cargo, status, instituicao } = request.session.user;

            return response.status(200).json({
                id,
                matricula,
                nome,
                email,
                foto,
                cargo,
                status,
                instituicao
            });
        } else {
            return response.status(401).json({ mensagem: 'Nenhuma sessão ativa foi encontrada.' });
        }
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao tentar verificar sua sessão.' });
    }
};
