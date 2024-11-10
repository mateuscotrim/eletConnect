import React, { useState } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';

export default function ModalExcluirEletiva({ codigo, tipo, instituicao }) {
    const [excluindo, setExcluindo] = useState(false); // Estado para o botão de exclusão

    const excluirEletiva = async (e) => {
        e.preventDefault();
        setExcluindo(true); // Ativa o estado de carregamento

        try {
            const resposta = await axios.post('/eletivas/excluir', { codigo, tipo, instituicao });
            if (resposta.status === 200) {
                sessionStorage.setItem('mensagemSucesso', resposta.data.mensagem); // Armazenar a mensagem de sucesso no sessionStorage
                window.location.href = '/electives' // Recarregar a página para aplicar a exclusão
            }
        } catch (erro) {
            showToast('danger', erro.response?.data.mensagem || 'Erro ao excluir a eletiva.');
        } finally {
            setExcluindo(false); // Desativa o estado de carregamento
        }
    };

    return (
        <div className="modal fade" id="excluirEletiva" tabIndex="-1" aria-labelledby="excluirEletivaLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-journal-bookmark-fill fs-3"></i>
                            <h4 className='m-0 fs-4'>Eletivas</h4>
                            <i className="bi bi-arrow-right-short fs-4"></i>
                            <h5 className="m-0">Excluir</h5>
                        </div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form onSubmit={excluirEletiva}>
                        <div className="modal-body">
                            <p>Tem certeza de que deseja excluir a eletiva? Esta ação não pode ser desfeita.</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type='submit' className='btn btn-danger' disabled={excluindo} >
                                {excluindo ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : (<><i className="bi bi-trash3-fill"></i>&ensp;Excluir </>)}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
