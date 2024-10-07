const bcrypt = require('bcrypt');
const supabase = require('../../../configs/supabase');
const { verifyToken } = require('../services/tokenService');

exports.resetPassword = async (request, response) => {
    const { senha, token } = request.body;

    const { status, message } = await verifyToken(token);
    if (status !== true) {
        return response.status(401).json({ mensagem: message });
    }

    try {
        const { data: user, error: userERROR } = await supabase
            .from('usuarios')
            .select('id, senha')
            .eq('token', token)
            .single();

        if (!user) {
            return response.status(401).json({ mensagem: 'Token inválido.' });
        }

        if (userERROR) {
            return response.status(401).json({ mensagem: 'Erro ao verificar o token.' });
        }

        if (senha.length < 6) {
            return response.status(401).json({ mensagem: 'A senha deve ter pelo menos 6 caracteres.' });
        }

        if (await bcrypt.compare(senha, user.senha)) {
            return response.status(401).json({ mensagem: 'A nova senha não pode ser igual à anterior.' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);
        const { error } = await supabase
            .from('usuarios')
            .update({ senha: hashedPassword })
            .eq('id', user.id);

        if (error) {
            return response.status(500).json({ mensagem: 'Erro ao redefinir a senha.' });
        }

        return response.status(200).json({ mensagem: 'Senha redefinida com sucesso!' });
    } catch (error) {
        response.status(500).json({ mensagem: 'Erro ao tentar redefinir a senha.' });
    }
};
