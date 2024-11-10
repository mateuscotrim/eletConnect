import React, { useState } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';

export default function ModalCadastrarAluno({ escola }) {
  const [matricula, setMatricula] = useState('');
  const [nome, setNome] = useState('');
  const [serie, setSerie] = useState('');
  const [turma, setTurma] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cadastrarAluno = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const resposta = await axios.post('/estudantes/cadastrar', {
        instituicao: escola.cnpj,
        matricula,
        nome,
        serie,
        turma,
      });
      if (resposta.status === 201) {
        sessionStorage.setItem('mensagemSucesso', resposta.data.mensagem);
        window.location.reload(); // Recarregar a página para aplicar a alteração
      }
    } catch (erro) {
      showToast('danger', erro.response?.data.mensagem || 'Erro ao cadastrar o aluno');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="modal fade" id="cadastrarAluno" tabIndex="-1" aria-labelledby="cadastrarAlunoLabel" aria-hidden="true">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <div className="d-flex align-items-center gap-2">
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-person-arms-up fs-3"></i>
                <h4 className="m-0 fs-4">Estudantes</h4>
              </span>
              <i className="bi bi-arrow-right-short fs-4"></i>
              <h5 className="m-0">Cadastrar</h5>
            </div>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form onSubmit={cadastrarAluno}>
            <div className="modal-body">
              <div className="row g-3">
                {/* Matrícula */}
                <div className="col-md-3">
                  <label htmlFor="matricula" className="form-label">
                    Matrícula <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="matricula"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    maxLength="11"
                    pattern="\d+" // Aceita apenas números
                    title="Somente números são permitidos"
                    required
                  />
                  {/* Verifica se o comprimento da matrícula excede o limite */}
                  {matricula.length > 10 && (
                    <div className="text-danger mt-1">
                      <small>A matrícula não pode ultrapassar 10 caracteres.</small>
                    </div>
                  )}
                </div>

                {/* Nome completo */}
                <div className="col-md-9">
                  <label htmlFor="nome" className="form-label">
                    Nome completo <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    pattern="[A-Za-zÀ-ÿ\s]+" // Aceita letras com acentos e espaços
                    maxLength="76" // Limite de 60 caracteres
                    title="Apenas letras e espaços são permitidos"
                    required
                  />
                  {/* Verifica se o comprimento do nome excede o limite */}
                  {nome.length > 75 && (
                    <div className="text-danger mt-1">
                      <small>O nome não pode ultrapassar 75 caracteres.</small>
                    </div>
                  )}
                </div>

                {/* Série */}
                <div className="col-md-6">
                  <label htmlFor="serie" className="form-label">
                    Série <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="serie"
                    value={serie}
                    onChange={(e) => setSerie(e.target.value)}
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="1º ano">1º ano</option>
                    <option value="2º ano">2º ano</option>
                    <option value="3º ano">3º ano</option>
                  </select>
                </div>

                {/* Turma */}
                <div className="col-md-6">
                  <label htmlFor="turma" className="form-label">
                    Turma <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="turma"
                    value={turma}
                    onChange={(e) => setTurma(e.target.value)}
                    required
                  >
                    <option value="">Selecione...</option>
                    {[...Array(26)].map((_, i) => {
                      const turmaLetra = String.fromCharCode(65 + i); // Turmas de 'A' a 'Z'
                      return (
                        <option key={turmaLetra} value={turmaLetra}>
                          {turmaLetra}
                        </option>
                      );
                    })}
                  </select>
                </div>

              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={enviando}>
                {enviando ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <><i className="bi bi-person-add"></i>&ensp;Cadastrar</>}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
