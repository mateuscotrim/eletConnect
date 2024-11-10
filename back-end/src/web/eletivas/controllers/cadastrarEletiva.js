const { v4: uuidv4 } = require('uuid');
const supabase = require('../../../configs/supabase');

exports.cadastrarEletiva = async (request, response) => {
    const {
        instituicao,
        nome,
        tipo,
        dia,
        horario,
        professor,
        sala,
        totalAlunos,
        isExclusiva, // Campo que define se a eletiva é exclusiva
        series, // Array de séries (para exclusividade por série)
        serie, // Série (para exclusividade por turma)
        turma, // Turma (para exclusividade por turma)
        status
    } = request.body;

    // Log dos dados recebidos
    console.log('Dados recebidos:', request.body);

    try {
        // Validações iniciais de campos obrigatórios
        if (!instituicao || !nome || !tipo || !dia || !horario || !professor || !sala || !totalAlunos || !status) {
            return response.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser preenchidos.' });
        }

        // Validações adicionais para exclusividade
        if (isExclusiva) {
            if ((!series || series.length === 0) && (!serie || !turma)) {
                return response.status(400).json({ mensagem: 'Os dados de exclusividade devem ser fornecidos (séries ou série e turma).' });
            }
        }

        // Geração de um código único
        const codigo = uuidv4();

        // Inserção no banco de dados
        const { data, error } = await supabase
            .from('eletivas')
            .insert([
                {
                    codigo,
                    instituicao,
                    nome,
                    tipo,
                    dia,
                    horario,
                    professor,
                    sala,
                    total_alunos: totalAlunos,
                    status,
                    exclusiva: isExclusiva,
                    series: isExclusiva && series ? series : null,
                    serie: isExclusiva && serie ? serie : null,
                    turma: isExclusiva && turma ? turma : null,
                }
            ]);

        if (error) {
            console.error('Erro ao inserir no banco de dados:', error);
            return response.status(500).json({ mensagem: 'Erro ao cadastrar a eletiva.', detalhes: error.message });
        }

        // Resposta de sucesso
        return response.status(201).json({ mensagem: 'Eletiva cadastrada com sucesso!', data });
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return response.status(500).json({ mensagem: 'Erro interno do servidor.', detalhes: erro.message });
    }
};
