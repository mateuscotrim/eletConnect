const supabase = require('../../../configs/supabase');
const bcrypt = require('bcrypt');

exports.login = async (request, response) => {
    const { matricula, senha } = request.body;

    try {
        const { data: aluno, error } = await supabase
            .from('alunos')
            .select('*')
            .eq('matricula', matricula)
            .single();

        if (error) {
            return response.status(500).send({ mensagem: 'Erro ao consultar o banco de dados' });
        }

        if (!aluno) {
            return response.status(400).send({ mensagem: 'Matrícula ou senha inválida' });
        }

        const senhaValida = await bcrypt.compare(senha, aluno.senha);
        if (!senhaValida) {
            return response.status(400).send({ mensagem: 'Matrícula ou senha inválida' });
        }

        request.session.user = {
            matricula: aluno.matricula,
            nome: aluno.nome,
            email: aluno.email,
            serie: aluno.serie,
            turma: aluno.turma,
            instituicao: aluno.instituicao,
            foto: aluno.foto,
            status: aluno.status,
            qnt_eletiva: aluno.qnt_eletiva,
            qnt_trilha: aluno.qnt_trilha,
            qnt_projetoVida: aluno.qnt_projetoVida,
            senha_temporaria: aluno.senha_temporaria,
            cargo: aluno.cargo,
        };

        return response.status(200).send({ mensagem: 'Login realizado com sucesso' });
    } catch (error) {
        return response.status(500).send({ mensagem: 'Erro ao realizar login' });
    }
};
