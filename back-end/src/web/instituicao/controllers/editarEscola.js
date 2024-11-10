const supabase = require('../../../configs/supabase');

exports.editarEscola = async (request, response) => {
    let { cnpj, nome, cep, endereco, telefone, logotipo } = request.body;

    // Verifique se todos os campos obrigatórios estão presentes (exceto logotipo)
    if (!cnpj || !nome || !cep || !endereco || !telefone) {
        return response.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    // Normalize o CNPJ para remover formatação
    cnpj = cnpj.replace(/\D/g, '');

    console.log('CNPJ recebido para atualização:', cnpj);

    try {
        // Verifique os registros existentes no banco de dados
        const { data: existingData, error: fetchError } = await supabase
            .from('instituicao')
            .select('cnpj')
            .eq('cnpj', cnpj);

        if (fetchError) {
            console.error('Erro ao buscar CNPJs:', fetchError);
            return response.status(500).json({ mensagem: 'Erro ao buscar instituição.' });
        }

        console.log('CNPJs encontrados no banco de dados:', existingData);

        if (!existingData || existingData.length === 0) {
            console.log('Nenhuma instituição encontrada com o CNPJ:', cnpj);
            return response.status(404).json({ mensagem: 'Instituição não encontrada.' });
        }

        // Prepare o objeto de atualização
        const updateData = { nome, cep, endereco, telefone };
        if (logotipo !== undefined) {
            updateData.logotipo = logotipo;
        }

        // Tenta atualizar a instituição pelo CNPJ fornecido
        const { data, error } = await supabase
            .from('instituicao')
            .update(updateData)
            .eq('cnpj', cnpj);

        if (error) {
            console.error('[Instituição] Erro ao atualizar:', error);
            return response.status(500).json({ mensagem: 'Erro ao editar a instituição', detalhe: error.message });
        }

        return response.status(200).json({ mensagem: 'Instituição de ensino atualizada com sucesso!' });
    } catch (error) {
        console.error('[Instituição] Erro inesperado na edição:', error.message);
        return response.status(500).json({ mensagem: 'Erro inesperado ao editar instituição de ensino' });
    }
};
