const supabase = require('../../../configs/supabase');
const bcrypt = require('bcrypt');

exports.cadastrarAluno = async (request, response) => {
    const { matricula, nome, serie, turma, instituicao, senha } = request.body;

    if (!matricula || !nome || !turma || !instituicao || !senha) {
        return response.status(400).json({ mensagem: 'Dados inválidos. Todos os campos obrigatórios devem ser preenchidos.' });
    }

    try {
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .insert([
                {
                    matricula,
                    nome,
                    serie,
                    turma,
                    senha: senhaCriptografada,
                    status: 'Ativo',
                    instituicao
                }
            ]);

        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao cadastrar o aluno', detalhe: alunoError.message });
        }

        return response.status(201).json({ mensagem: 'Aluno cadastrado com sucesso', dados: alunoData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro interno ao cadastrar o aluno', detalhe: error.message });
    }
};
