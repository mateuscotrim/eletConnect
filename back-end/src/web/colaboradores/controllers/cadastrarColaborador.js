const bcrypt = require('bcrypt');
const supabase = require('../../../configs/supabase');
const { createToken } = require('../../auth/services/tokenService');
const { sendEmail } = require('../../auth/services/emailService');
const crypto = require('crypto');

function gerarSenhaAleatoria() {
    return crypto.randomBytes(8).toString('hex'); 
}

exports.cadastrarColaborador = async (request, response) => {
    const { nome, email, matricula, cargo, instituicao, fazerLogin } = request.body;

    try {
        const { data: verificarEmail, error: verificarEmailError } = await supabase
            .from('usuarios')
            .select('email')
            .eq('email', email)
            .eq('instituicao', instituicao);

        if (verificarEmail && verificarEmail.length > 0) {
            return response.status(401).json({ mensagem: 'Este e-mail já está registrado.' });
        }

        if (verificarEmailError) {
            return response.status(401).json({ mensagem: 'Erro ao verificar o e-mail fornecido.' });
        }

        const { data: verificarMatricula, error: verificarMatriculaError } = await supabase
            .from('usuarios')
            .select('matricula')
            .eq('matricula', matricula)
            .eq('instituicao', instituicao);

        if (verificarMatricula && verificarMatricula.length > 0) {
            return response.status(401).json({ mensagem: 'Esta matrícula já está registrada.' });
        }

        if (verificarMatriculaError) {
            return response.status(401).json({ mensagem: 'Erro ao verificar a matrícula fornecida.' });
        }

        const senhaGerada = gerarSenhaAleatoria();
        const senhaCriptografada = await bcrypt.hash(senhaGerada, 10);

        const token = createToken();
        if (!token) {
            return response.status(401).json({ mensagem: 'Erro ao gerar o token.' });
        }

        const { error } = await supabase
            .from('usuarios')
            .insert([{ nome, email, matricula, senha: senhaCriptografada, cargo, instituicao, token, status: 'Aguardando', fazerLogin }]);

        if (error) {
            return response.status(401).json({ mensagem: 'Erro ao salvar os dados do colaborador.' });
        }

        await sendEmail(email, 'Ative sua conta', `Olá ${nome},\n\nSua conta foi criada com sucesso!\n\nAqui estão suas credenciais de acesso:\nUsuário: ${email}\nSenha: ${senhaGerada}\n\nPara ativar sua conta, clique no link abaixo:\nhttp://localhost:5173/confirm-registration?tkn=${token}\n\nApós ativar a conta, você poderá fazer login no sistema.`);

        return response.status(200).json({ mensagem: 'Colaborador cadastrado com sucesso! Verifique seu e-mail para ativar a conta.' });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao tentar cadastrar o colaborador.' });
    }
};
