const supabase = require('../../../configs/supabase');

exports.verificarDados = async (request, response) => {
    const { dados, instituicao } = request.body;

    if (!dados || dados.length === 0 || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados inválidos ou instituição não informada. Verifique e tente novamente.' });
    }

    try {
        const erros = {};
        const matriculasRecebidas = dados.map((aluno) => aluno.matricula);

        const { data: alunosExistentes, error: erroConsulta } = await supabase
            .from('alunos')
            .select('matricula')
            .in('matricula', matriculasRecebidas)
            .eq('instituicao', instituicao);

        if (erroConsulta) {
            return response.status(500).json({ mensagem: `Erro ao consultar banco de dados: ${erroConsulta.message}` });
        }

        const matriculasExistentes = alunosExistentes.map((aluno) => aluno.matricula);

        const isNumero = (valor) => /^\d+$/.test(valor);
        const isNomeValido = (valor) => /^[a-zA-Z\s]+$/.test(valor) && valor.length >= 3;
        const isTurmaValida = (valor) => /^[A-Z]$/.test(valor.trim().toUpperCase());

        const contadorMatriculas = {};

        dados.forEach((row, index) => {
            const errosLinha = {};

            const serie = row['serie']?.toString().trim();
            if (serie) {
                const seriesValidas = ['1', '2', '3', '1º ano', '2º ano', '3º ano', '1 ano', '2 ano', '3 ano'];

                if (!seriesValidas.includes(serie)) {
                    errosLinha['serie'] = 'Série inválida. Deve ser "1", "2", "3", "1º ano", "2º ano" ou "3º ano".';
                } else {
                    if (['1', '2', '3'].includes(serie)) {
                        row['serie'] = `${serie}º ano`;
                    }
                }
            } else {
                errosLinha['serie'] = 'Série é obrigatória.';
            }

            const matricula = row['matricula']?.toString().trim();
            if (!matricula) {
                errosLinha['matricula'] = 'Matrícula é obrigatória.';
            } else if (!isNumero(matricula)) {
                errosLinha['matricula'] = 'Matrícula deve conter apenas números.';
            } else {
                contadorMatriculas[matricula] = (contadorMatriculas[matricula] || 0) + 1;

                if (contadorMatriculas[matricula] > 1) {
                    errosLinha['matricula'] = `Matrícula "${matricula}" está duplicada na planilha.`;
                } else if (matriculasExistentes.includes(matricula)) {
                    errosLinha['matricula'] = `Matrícula "${matricula}" já está registrada no sistema.`;
                }
            }

            const nome = row['nome']?.toString().trim();
            if (!nome) {
                errosLinha['nome'] = 'Nome é obrigatório.';
            } else if (!isNomeValido(nome)) {
                errosLinha['nome'] = 'Nome deve ter pelo menos 3 caracteres e não pode conter números.';
            }

            const turma = row['turma']?.toString().trim().toUpperCase();
            if (!turma) {
                errosLinha['turma'] = 'Turma é obrigatória.';
            } else if (!isTurmaValida(turma)) {
                errosLinha['turma'] = 'Turma inválida. Deve ser uma letra maiúscula (A-Z).';
            } else {
                row['turma'] = turma;
            }

            if (Object.keys(errosLinha).length > 0) {
                erros[index] = errosLinha;
            }
        });

        return response.status(200).json({ erros });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro interno ao validar dados. Contate o suporte.', detalhe: error.message });
    }
};
