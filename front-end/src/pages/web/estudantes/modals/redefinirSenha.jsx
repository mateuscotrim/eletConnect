import React, { useState } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';

export default function ModalRedefinirSenha({ alunoSelecionado }) {
  const [enviando, setEnviando] = useState(false);

  const redefinirSenha = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const resposta = await axios.post('/estudantes/redefinir-senha', { matricula: alunoSelecionado.matricula });

      if (resposta.status === 200) {
        sessionStorage.setItem('mensagemSucesso', resposta.data.mensagem);
        window.location.reload(); // Recarregar a página para aplicar a alteração
      }
    } catch (error) {
      showToast('danger', error.response?.data.mensagem || 'Erro ao redefinir a senha do aluno.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="modal fade" id="redefinirSenha" tabIndex="-1" aria-labelledby="redefinirSenhaLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <div className="d-flex align-items-center gap-2">
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-person-arms-up fs-3"></i>
                <h4 className="m-0 fs-4">Estudantes</h4>
              </span>
              <i className="bi bi-arrow-right-short fs-4"></i>
              <h5 className="m-0">Redefinir senha</h5>
            </div>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form onSubmit={redefinirSenha}>
            <div className="modal-body">
              {alunoSelecionado ? (
                <p>
                  Você está prestes a redefinir a senha do(a) aluno(a) <b>{alunoSelecionado.nome}</b>, com matrícula <b>{alunoSelecionado.matricula}</b>.
                  Esta ação não pode ser desfeita. Deseja prosseguir?<br />
                  Senha padrão: <b>07654321</b>
                </p>
              ) : (
                <p>Carregando informações do aluno...</p>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={enviando || !alunoSelecionado}>
                {enviando ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <><i className="bi bi-key-fill"></i>&ensp;Redefinir</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  );
}
