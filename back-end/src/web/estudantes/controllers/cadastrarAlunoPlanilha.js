const supabase = require('../../../configs/supabase');
const bcrypt = require('bcrypt');

exports.cadastrarAlunoPlanilha = async (request, response) => {
    const { dados, instituicao } = request.body;

    if (!dados || dados.length === 0 || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados inválidos ou instituição não informada. Verifique e tente novamente.' });
    }

    try {
        let totalCadastrados = 0, totalDuplicados = 0, totalDadosIncompletos = 0, totalErrosInternos = 0;
        const camposFaltantes = { matricula: 0, nome: 0, serie: 0, turma: 0 };
        const detalhesDadosIncompletos = [];
        const alunosParaCadastro = [];

        const isNumero = (valor) => /^\d+$/.test(valor);
        const isNomeValido = (valor) => /^[a-zA-Z\s]+$/.test(valor) && valor.length >= 3;
        const isTurmaValida = (valor) => /^[A-Z]$/.test(valor.trim().toUpperCase());

        const validarAluno = (aluno) => {
            let { matricula, nome, serie, turma } = aluno;
            let motivo = '';

            if (!matricula) {
                camposFaltantes.matricula += 1;
                motivo += 'Matrícula ausente; ';
            } else if (!isNumero(matricula)) {
                motivo += 'Matrícula deve conter apenas números; ';
            }

            if (!nome || !isNomeValido(nome)) {
                camposFaltantes.nome += 1;
                motivo += 'Nome inválido (deve ter ao menos 3 caracteres e não pode conter números); ';
            }

            const seriesValidas = ['1', '2', '3', '1º ano', '2º ano', '3º ano', '1 ano', '2 ano', '3 ano'];
            if (serie === undefined || !seriesValidas.includes(serie.toString())) {
                camposFaltantes.serie += 1;
                motivo += 'Série inválida (deve ser "1", "2", "3", "1º ano", "2º ano" ou "3º ano"); ';
            } else {
                if (['1', '2', '3'].includes(serie)) {
                    serie = `${serie}º ano`;
                }
            }

            if (!turma || !isTurmaValida(turma)) {
                camposFaltantes.turma += 1;
                motivo += 'Turma inválida (deve ser uma letra maiúscula de "A" a "H"); ';
            } else {
                turma = turma.toUpperCase();
            }

            if (motivo) {
                const descricaoAluno = nome ? nome : `Aluno com matrícula ${matricula || 'desconhecida'}`;
                detalhesDadosIncompletos.push({ matricula: matricula || 'N/A', nome: descricaoAluno, motivo: motivo.trim() });
                return false;
            }

            return { matricula, nome, serie, turma };
        };

        dados.forEach((aluno) => {
            const alunoValidado = validarAluno(aluno);
            if (!alunoValidado) {
                totalDadosIncompletos += 1;
                return;
            }
            alunosParaCadastro.push(alunoValidado);
        });

        if (alunosParaCadastro.length === 0) {
            return response.status(400).json({
                mensagem: 'Nenhum aluno válido para cadastro. Verifique os erros nos dados e tente novamente.',
                detalhesDadosIncompletos
            });
        }

        const matriculas = alunosParaCadastro.map((aluno) => aluno.matricula);
        const { data: alunosExistentes, error: erroConsulta } = await supabase
            .from('alunos')
            .select('matricula')
            .in('matricula', matriculas)
            .eq('instituicao', instituicao);

        if (erroConsulta) {
            return response.status(500).json({ mensagem: 'Erro ao verificar duplicidade de matrículas.', detalhe: erroConsulta.message });
        }

        const matriculasExistentes = alunosExistentes.map((aluno) => aluno.matricula);
        const novosAlunos = alunosParaCadastro.filter((aluno) => !matriculasExistentes.includes(aluno.matricula));

        const senhaPadrao = '01234567';
        const senhaCriptografada = await bcrypt.hash(senhaPadrao, 10);

        const alunosComSenha = novosAlunos.map((aluno) => ({
            ...aluno,
            senha: senhaCriptografada,
            status: 'Ativo',
            instituicao
        }));

        const { error: erroInsercao } = await supabase
            .from('alunos')
            .insert(alunosComSenha);

        if (erroInsercao) {
            return response.status(500).json({ mensagem: 'Erro ao inserir novos alunos no banco de dados.', detalhe: erroInsercao.message });
        }

        totalCadastrados = alunosComSenha.length;
        totalDuplicados = matriculasExistentes.length;

        const mensagem = `
            || Processo de cadastro concluído! || \n
            - Total de alunos processados: ${dados.length}\n
            - Alunos cadastrados com sucesso: ${totalCadastrados}\n
            - Matrículas duplicadas (ignoradas): ${totalDuplicados}\n
            - Alunos ignorados por dados incompletos: ${totalDadosIncompletos}\n
        `;

        return response.status(201).json({
            mensagem: mensagem.trim(),
            resumo: { totalCadastrados, duplicados: totalDuplicados, dadosIncompletos: totalDadosIncompletos, errosInternos: totalErrosInternos, detalhesDadosIncompletos }
        });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro interno ao processar o cadastro dos alunos. Contate o suporte.', detalhe: error.message });
    }
};
