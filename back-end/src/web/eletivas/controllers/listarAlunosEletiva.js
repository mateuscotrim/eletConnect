const supabase = require('../../../configs/supabase');

exports.listarAlunosEletiva = async (request, response) => {
    const { codigo, instituicao } = request.body;

    if (!codigo || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        const { data: alunoEletivaData, error: alunoEletivaError } = await supabase
            .from('aluno_eletiva')
            .select('matricula_aluno')
            .eq('codigo_eletiva', codigo)
            .eq('instituicao', instituicao);

        if (alunoEletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao listar as matrículas dos alunos da eletiva', detalhe: alunoEletivaError.message });
        }

        if (!alunoEletivaData || alunoEletivaData.length === 0) {
            return response.status(200).json([]);
        }

        const matriculas = alunoEletivaData.map(item => item.matricula_aluno);

        const { data: alunosData, error: alunosError } = await supabase
            .from('alunos')
            .select('*')
            .in('matricula', matriculas);

        if (alunosError) {
            return response.status(500).json({ mensagem: 'Erro ao listar os alunos da eletiva', detalhe: alunosError.message });
        }

        return response.status(200).json(alunosData);
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro interno ao listar os alunos da eletiva', detalhe: error.message });
    }
};