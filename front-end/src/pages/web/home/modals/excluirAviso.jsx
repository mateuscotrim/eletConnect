import React, { useState } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';

function ExcluirAvisoModal({ avisoSelecionado, user, setAvisos }) {
  const [loadingExcluir, setLoadingExcluir] = useState(false);

  const excluirAviso = async () => {
    setLoadingExcluir(true); // Inicia o indicador de carregamento
    try {
      const response = await axios.post('/home/excluir-aviso', { id: avisoSelecionado.id, instituicao: user.instituicao });
      if (response.status = 200) {
        sessionStorage.setItem('mensagemSucesso', 'Aviso excluido com sucesso!');
        window.location.reload();
      }
    } catch (error) {
      showToast('danger', error.response?.data?.mensagem || 'Erro ao excluir aviso.');
    } finally {
      setLoadingExcluir(false); // Finaliza o indicador de carregamento
    }
  };

  return (
    <div className="modal fade" id="excluirAvisoModal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <div className="d-flex align-items-center gap-2">
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-megaphone fs-3"></i>
                <h3 className="m-0 fs-4">Avisos</h3>
              </span>
              <i className="bi bi-arrow-right-short fs-4"></i>
              <h5 className="m-0">Excluir</h5>
            </div>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>Tem certeza de que deseja excluir o aviso <strong>{avisoSelecionado?.titulo}</strong>?</p>
            <p className="text-muted">Esta ação não pode ser desfeita.</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button type="button" className="btn btn-danger" onClick={excluirAviso} disabled={loadingExcluir}>
              {loadingExcluir ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-trash-fill"></i>&ensp;Excluir</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExcluirAvisoModal;
