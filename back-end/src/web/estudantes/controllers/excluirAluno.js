const supabase = require('../../../configs/supabase');

exports.excluirAluno = async (request, response) => {
    const { matricula } = request.body;

    if (!matricula) {
        return response.status(400).json({ mensagem: 'Matrícula não informada' });
    }

    try {
        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .delete()
            .eq('matricula', matricula);

        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao excluir o aluno', detalhe: alunoError.message });
        }

        return response.status(200).json({ alunoData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao excluir o aluno', detalhe: error.message });
    }
};
