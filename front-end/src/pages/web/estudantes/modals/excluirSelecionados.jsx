import React, { useState } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';

export default function ModalExcluirSelecionados({ alunosSelecionados, escola, alunos }) {
  const [enviando, setEnviando] = useState(false);

  const excluirSelecionados = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const matriculas = alunosSelecionados.map((matricula) => matricula); // Coletando as matrículas dos alunos selecionados
      const resposta = await axios.post('/estudantes/excluir-multiplos', {
        matriculas,
        instituicao: escola.cnpj
      });

      if (resposta.status === 200) {
        sessionStorage.setItem('mensagemSucesso', resposta.data.mensagem);
        window.location.reload(); // Recarregar a página para aplicar a alteração
      }
    } catch (error) {
      showToast('danger', error.response?.data.mensagem || 'Erro ao excluir alunos selecionados.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="modal fade" id="excluirSelecionadosModal" tabIndex="-1" aria-labelledby="excluirSelecionadosModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <div className="d-flex align-items-center gap-2">
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-person-arms-up fs-3"></i>
                <h4 className="m-0 fs-4">Estudantes</h4>
              </span>
              <i className="bi bi-arrow-right-short fs-4"></i>
              <h5 className="m-0">Excluir</h5>
            </div>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>Você está prestes a excluir os seguintes alunos:</p>
            <ul>
              {alunosSelecionados.map((matricula) => {
                const aluno = alunos.find((aluno) => aluno.matricula === matricula);
                return <li key={matricula}>{aluno?.nome || 'Nome não encontrado'} (Matrícula: {matricula})</li>;
              })}
            </ul>
            <p>Esta ação não pode ser desfeita. Deseja continuar?</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" className="btn btn-danger" onClick={excluirSelecionados} disabled={enviando}>
              {enviando ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <><i className="bi bi-trash3-fill"></i>&ensp;Excluir</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
