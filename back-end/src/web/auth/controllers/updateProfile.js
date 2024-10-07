const supabase = require('../../../configs/supabase');

exports.updateProfile = async (request, response) => {
    const { id, nome, email, avatar } = request.body;
    
    try {
        const { data: user, error: userERROR } = await supabase
            .from('usuarios')
            .select('id')
            .eq('id', id)
            .single();

        if (!user) {
            return response.status(401).json({ mensagem: 'O usuário fornecido não foi encontrado.' });
        }

        if (userERROR) {
            return response.status(401).json({ mensagem: 'Erro ao verificar o usuário fornecido.' });
        }

        const { error } = await supabase
            .from('usuarios')
            .update({ nome, email, avatar })
            .eq('id', id);

        if (error) {
            return response.status(500).json({ mensagem: 'Erro ao atualizar o perfil do usuário.' });
        }

        return response.status(200).json({ mensagem: 'Perfil atualizado com sucesso!' });
    } catch (error) {
        response.status(500).json({ mensagem: 'Erro ao tentar atualizar o perfil do usuário.' });
    }
};
