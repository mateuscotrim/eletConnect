import React, { useState, useEffect } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';

export default function ModalEditarAluno({ alunoSelecionado, escola }) {
  const [dadosAluno, setDadosAluno] = useState({
    matricula: '',
    instituicao: escola.cnpj || '',
    nome: '',
    serie: '',
    turma: '',
    email: '',
    status: 'Ativo',
  });

  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Função para carregar os dados do aluno quando o alunoSelecionado mudar
  useEffect(() => {
    if (alunoSelecionado) {
      setDadosAluno({
        matricula: alunoSelecionado.matricula || '',
        nome: alunoSelecionado.nome || '',
        serie: alunoSelecionado.serie || '',
        turma: alunoSelecionado.turma || '',
        email: alunoSelecionado.email || '',
        status: alunoSelecionado.status || 'Ativo',
        instituicao: escola.cnpj || ''
      });
    }
  }, [alunoSelecionado, escola.cnpj]);

  const editarAluno = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const resposta = await axios.post('/estudantes/editar', {
        matriculaAntiga: alunoSelecionado.matricula,
        matriculaNova: dadosAluno.matricula,
        nome: dadosAluno.nome,
        serie: dadosAluno.serie,
        turma: dadosAluno.turma,
        email: dadosAluno.email,
        status: dadosAluno.status,
        instituicao: escola.cnpj,
      });

      if (resposta.status === 200) {
        sessionStorage.setItem('mensagemSucesso', 'O cadastro do aluno foi atualizado com sucesso.');
        window.location.reload(); // Recarregar a página para aplicar a alteração
      }
    } catch (error) {
      showToast('danger', error.response?.data.mensagem || 'Erro ao editar o aluno.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="modal fade" id="editarAluno" tabIndex="-1" aria-labelledby="editarAlunoLabel" aria-hidden="true">
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <div className="d-flex align-items-center gap-2">
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-person-arms-up fs-3"></i>
                <h4 className="m-0 fs-4">Estudantes</h4>
              </span>
              <i className="bi bi-arrow-right-short fs-4"></i>
              <h5 className="m-0">Editar</h5>
            </div>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form onSubmit={editarAluno}>
            <div className="modal-body">
              {carregando ? (
                <div className="d-flex justify-content-center my-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                </div>
              ) : (
                <div className="row g-3">
                  {/* Matrícula */}
                  <div className="col-md-3">
                    <label htmlFor="matricula" className="form-label">
                      Matrícula <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="matricula"
                      value={dadosAluno.matricula}
                      onChange={(e) => setDadosAluno({ ...dadosAluno, matricula: e.target.value })}
                      pattern="\d+" // Aceita apenas números
                      maxLength="11"
                      required
                    />
                    {/* Verifica se o comprimento da matrícula excede o limite */}
                    {dadosAluno.matricula.length > 10 && (
                      <div className="text-danger mt-1">
                        <small>A matrícula não pode ultrapassar 10 caracteres.</small>
                      </div>
                    )}
                  </div>

                  {/* Série */}
                  <div className="col-md-3">
                    <label htmlFor="serie" className="form-label">
                      Série <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="serie"
                      value={dadosAluno.serie}
                      onChange={(e) => setDadosAluno({ ...dadosAluno, serie: e.target.value })}
                      required
                    >
                      <option value="" disabled>Selecione...</option>
                      <option value="1º ano">1º ano</option>
                      <option value="2º ano">2º ano</option>
                      <option value="3º ano">3º ano</option>
                      <option value="4º ano">4º ano</option>
                    </select>
                  </div>

                  {/* Turma */}
                  <div className="col-md-3">
                    <label htmlFor="turma" className="form-label">
                      Turma <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="turma"
                      value={dadosAluno.turma}
                      onChange={(e) => setDadosAluno({ ...dadosAluno, turma: e.target.value })}
                      required
                    >
                      <option value="" disabled>Selecione...</option>
                      {[...Array(26)].map((_, i) => {
                        const turma = String.fromCharCode(65 + i); // Gera opções de 'A' a 'Z'
                        return <option key={turma} value={turma}>{turma}</option>;
                      })}
                    </select>
                  </div>

                  {/* Status */}
                  <div className="col-md-3">
                    <label htmlFor="status" className="form-label">Status</label>
                    <select
                      className="form-select"
                      id="status"
                      value={dadosAluno.status}
                      onChange={(e) => setDadosAluno({ ...dadosAluno, status: e.target.value })}
                      required
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>

                  {/* Nome completo */}
                  <div className="col-md-6">
                    <label htmlFor="nomeCompleto" className="form-label">
                      Nome completo <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="nomeCompleto"
                      value={dadosAluno.nome}
                      onChange={(e) => setDadosAluno({ ...dadosAluno, nome: e.target.value })}
                      maxLength="75"
                      required
                    />
                    {/* Verifica se o comprimento do nome excede o limite */}
                    {dadosAluno.nome.length > 76 && (
                      <div className="text-danger mt-1">
                        <small>O nome não pode ultrapassar 75 caracteres.</small>
                      </div>
                    )}
                  </div>

                  {/* E-mail */}
                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label">E-mail</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={dadosAluno.email}
                      onChange={(e) => setDadosAluno({ ...dadosAluno, email: e.target.value })}
                      maxLength="101"
                      placeholder="email@exemplo.com"
                    />
                    {/* Verifica se o comprimento do e-mail excede o limite */}
                    {dadosAluno.email.length > 101 && (
                      <div className="text-danger mt-1">
                        <small>O e-mail não pode ultrapassar 100 caracteres.</small>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer com botões */}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" className="btn btn-success" disabled={enviando || carregando}>
                {enviando ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <><i className="bi bi-pencil-fill"></i>&ensp;Editar</>}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
