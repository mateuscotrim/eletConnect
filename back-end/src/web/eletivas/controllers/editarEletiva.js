const supabase = require('../../../configs/supabase');

exports.editarEletiva = async (request, response) => {
    const { codigo, instituicao, nome, descricao, tipo, professor, dia, horario, sala, total_alunos, status, serie, turma, exclusiva } = request.body;

    if (!codigo || !instituicao || !nome || !tipo || !professor || !dia || !horario || !sala || !total_alunos || !status) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    if (exclusiva && (!serie || !turma)) {
        return response.status(400).json({ mensagem: 'Dados da série e turma são necessários para eletivas exclusivas' });
    }

    try {
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .update({
                nome,
                descricao,
                tipo,
                professor,
                horario,
                dia,
                total_alunos,
                sala,
                status,
                exclusiva,
                serie, 
                turma 
            })
            .eq('codigo', codigo)
            .eq('instituicao', instituicao);

        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao editar a eletiva', detalhe: eletivaError.message });
        }

        return response.status(200).json({ mensagem: 'Eletiva editada com sucesso', eletiva: eletivaData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao editar a eletiva', detalhe: error.message });
    }
};
