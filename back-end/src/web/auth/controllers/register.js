const bcrypt = require('bcrypt');
const supabase = require('../../../configs/supabase');
const { generateToken } = require('../services/tokenService');

exports.register = async (request, response) => {
    const { nome, email, senha } = request.body;

    if (!nome || !email || !senha) {
        return response.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(senha, 10);

        const token = generateToken({ email });

        const { data: newUser, error } = await supabase
            .from('usuarios')
            .insert([{
                nome,
                email,
                senha: hashedPassword,
                status: 'Aguardando',
                token,
                confirmed_at: null
            }]);

        if (error) {
            return response.status(500).json({ mensagem: 'Erro ao registrar usuário.' });
        }

        return response.status(201).json({ mensagem: 'Registro bem-sucedido. Verifique seu e-mail para confirmar sua conta.' });

    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao registrar usuário. Por favor, tente novamente mais tarde.' });
    }
};
