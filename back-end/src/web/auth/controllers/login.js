const bcrypt = require('bcrypt');
const supabase = require('../../../configs/supabase');

exports.login = async (request, response) => {
    const { email, senha } = request.body;

    try {
        const { data: user, error: userERROR } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();

        if (userERROR) {
            return response.status(500).json({ mensagem: 'Erro ao tentar fazer login. Por favor, tente novamente mais tarde.' });
        }

        if (!user) {
            return response.status(401).json({ mensagem: 'Credenciais inválidas.' });
        }

        if (!user.fazerLogin) {
            return response.status(403).json({ mensagem: 'Este usuário não está autorizado a fazer login no sistema.' });
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            return response.status(401).json({ mensagem: 'Credenciais inválidas.' });
        }

        if (!user.confirmed_at) {
            return response.status(406).json({ mensagem: 'Seu e-mail ainda não foi confirmado.' });
        }

        if (user.status === 'Aguardando') {
            return response.status(403).json({ mensagem: 'Sua conta está aguardando confirmação. Verifique sua caixa de entrada para ativar sua conta.' });
        }

        if (user.status === 'Inativo') {
            return response.status(403).json({ mensagem: 'Sua conta está inativa. Entre em contato com o administrador.' });
        }

        request.session.user = {
            id: user.id,
            matricula: user.matricula,
            nome: user.nome,
            email,
            status: user.status,
            cargo: user.cargo,
            foto: user.foto,
            instituicao: user.instituicao
        };

        return response.status(200).json({ mensagem: 'Login efetuado com sucesso!' });

    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao tentar fazer login. Por favor, tente novamente mais tarde.' });
    }
};
 