const supabase = require('../../../configs/supabase');

exports.listarEletivasTodosAlunos = async (req, res) => {
    const { instituicao } = req.body;
  
    try {
      const { data: alunosData, error: alunosError } = await supabase
        .from('alunos')
        .select('matricula, nome, serie, turma')
        .eq('instituicao', instituicao);
  
      if (alunosError) {
        return res.status(500).json({ mensagem: 'Erro ao buscar alunos.', detalhe: alunosError.message });
      }
  
      const { data: alunoEletivasData, error: alunoEletivasError } = await supabase
        .from('aluno_eletiva')
        .select('matricula_aluno, codigo_eletiva')
        .eq('instituicao', instituicao);
  
      if (alunoEletivasError) {
        return res.status(500).json({ mensagem: 'Erro ao buscar eletivas dos alunos.', detalhe: alunoEletivasError.message });
      }
  
      const codigosEletivas = [...new Set(alunoEletivasData.map((item) => item.codigo_eletiva))];
      const { data: eletivasData, error: eletivasError } = await supabase
        .from('eletivas')
        .select('*')
        .in('codigo', codigosEletivas);
  
      if (eletivasError) {
        return res.status(500).json({ mensagem: 'Erro ao buscar detalhes das eletivas.', detalhe: eletivasError.message });
      }
  
      const eletivasPorAluno = alunoEletivasData.reduce((acc, item) => {
        const { matricula_aluno, codigo_eletiva } = item;
        const eletiva = eletivasData.find((e) => e.codigo === codigo_eletiva);
  
        if (eletiva) {
          if (!acc[matricula_aluno]) {
            acc[matricula_aluno] = [];
          }
          acc[matricula_aluno].push(eletiva);
        }
  
        return acc;
      }, {});
  
      const alunosComEletivas = alunosData.map((aluno) => ({
        ...aluno,
        eletivas: eletivasPorAluno[aluno.matricula] || [], 
      }));
  
      return res.status(200).json(alunosComEletivas);
    } catch (error) {
      return res.status(500).json({ mensagem: 'Erro ao buscar alunos com eletivas.', detalhe: error.message });
    }
  };
  