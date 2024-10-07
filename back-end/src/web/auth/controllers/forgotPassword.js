const supabase = require('../../../configs/supabase');
const { createToken } = require('../services/tokenService');
const { sendEmail } = require('../services/emailService');

exports.forgotPassword = async (request, response) => {
    const { email } = request.body;

    try {
        const { data: user, error: userERROR } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', email)
            .single();

        if (!user) {
            return response.status(401).json({ mensagem: 'E-mail não encontrado.' });
        }

        if (userERROR) {
            return response.status(401).json({ mensagem: 'Erro ao verificar o e-mail fornecido.' });
        }

        const token = createToken();
        if (!token) {
            return response.status(401).json({ mensagem: 'Erro ao gerar o token.' });
        }

        const { error: insertError } = await supabase
            .from('usuarios')
            .update({ token })
            .eq('id', user.id);

        if (insertError) {
            return response.status(401).json({ mensagem: 'Erro ao atualizar o token.' });
        }

        await sendEmail(email, 'Redefinição de senha', `Redefina sua senha clicando no link: http://localhost:5173/reset-password?tkn=${token}`);

        return response.status(200).json({ mensagem: 'E-mail de redefinição de senha enviado com sucesso!' });
    } catch (error) {
        response.status(500).json({ mensagem: 'Erro ao tentar enviar o e-mail de redefinição de senha.' });
    }
};
