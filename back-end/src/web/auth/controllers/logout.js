exports.logout = async (request, response) => {
    try {
        request.session.destroy((error) => {
            if (error) {
                return response.status(500).json({ mensagem: 'Erro ao finalizar a sessão.' });
            }

            return response.status(200).json({ mensagem: 'Logout efetuado com sucesso!' });
        });
    } catch (error) {
        response.status(500).json({ mensagem: 'Erro ao tentar finalizar a sessão.' });
    }
};
