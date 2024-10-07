const supabase = require('../../../configs/supabase');
const { desmatricularAluno } = require('./desmatricularAluno');

exports.excluirEletiva = async (request, response) => {
    const { codigo, instituicao, tipo } = request.body;

    if (!codigo || !instituicao || !tipo) {
        return response.status(400).json({ mensagem: 'Dados incompletos. Certifique-se de fornecer o código, instituição e tipo.' });
    }

    try {
        const { data: alunosData, error: alunosError } = await supabase
            .from('aluno_eletiva')
            .select('matricula_aluno')
            .eq('codigo_eletiva', codigo)
            .eq('instituicao', instituicao);

        if (alunosError) {
            return response.status(500).json({ mensagem: 'Erro ao buscar alunos matriculados', detalhe: alunosError.message });
        }

        if (alunosData && alunosData.length > 0) {
            for (const aluno of alunosData) {
                const desmatriculaRequest = {
                    body: {
                        matricula: aluno.matricula_aluno,
                        codigo,
                        tipo,
                        instituicao,
                    }
                };

                const desmatriculaResponse = {
                    status: (statusCode) => ({
                        json: (jsonData) => {
                            if (statusCode >= 400) { 
                                throw new Error(jsonData.mensagem || 'Erro desconhecido na desmatrícula');
                            }
                        }
                    })
                };

                try {
                    await desmatricularAluno(desmatriculaRequest, desmatriculaResponse);
                } catch (desmatriculaError) {
                    return response.status(500).json({ mensagem: `Erro ao desmatricular o aluno ${aluno.matricula_aluno}`, detalhe: desmatriculaError.message });
                }
            }
        }
        
        const { error: eletivaError } = await supabase
            .from('eletivas')
            .delete()
            .eq('codigo', codigo)
            .eq('instituicao', instituicao);

        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao excluir a eletiva', detalhe: eletivaError.message });
        }

        return response.status(200).json({ mensagem: 'Eletiva excluída com sucesso' });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro interno ao excluir a eletiva', detalhe: error.message });
    }
};
