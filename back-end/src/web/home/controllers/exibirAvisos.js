const supabase = require('../../../configs/supabase');

exports.exibirAvisos = async (request, response) => {
    try {
        const { data: avisos, error } = await supabase
            .from('avisos')
            .select('*')
            .order('data', { ascending: false });

        if (error) {
            return response.status(500).json({ mensagem: `Erro ao consultar banco de dados: ${error.message}` });
        }

        return response.status(200).json(avisos);
    } catch (error) {
        return response.status(500).json({ mensagem: `Erro ao consultar banco de dados: ${error.message}` });
    }
}
