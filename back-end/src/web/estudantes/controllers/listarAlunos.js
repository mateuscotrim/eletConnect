const supabase = require('../../../configs/supabase');

exports.listarAlunos = async (request, response) => {
    const { instituicao } = request.body;

    if (!instituicao) {
        return response.status(400).json({ mensagem: 'Instituição não informada' });
    }

    try {
        const { data: alunosData, error: alunosError } = await supabase
            .from('alunos')
            .select('*')
            .eq('instituicao', instituicao);

        if (alunosError) {
            return response.status(500).json({ mensagem: 'Erro ao listar os alunos', detalhe: alunosError.message });
        }

        if (!alunosData) {
            return response.status(404).json({ mensagem: 'Nenhum aluno encontrado' });
        }

        return response.status(200).json({ alunosData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao listar os alunos', detalhe: error.message });
    }
};
