import React, { useState } from 'react';
import axios from '../../../../../configs/axios';
import showToast from '../../../../../utills/toasts';

export default function ExcluirColaboradorModal({ matricula, nome, listarColaboradores, instituicao }) {
    const [carregando, setCarregando] = useState(false);

    const excluirColaborador = async () => {
        setCarregando(true);
        try {
            const response = await axios.post('/colaboradores/excluir', { matricula, instituicao });
            if (response.status === 200) {
                showToast('success', `O colaborador <b>${nome}</b> foi excluído com sucesso.`);
                window.location.reload();
            } else {
                throw new Error('Erro ao excluir colaborador.');
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao excluir colaborador.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="modal fade" id="excluirColaborador" tabIndex="-1" aria-labelledby="excluirColaboradorLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-people-fill fs-3"></i>
                            <h4 className='m-0 fs-4'>Colaboradores</h4>
                            <i className="bi bi-arrow-right-short fs-4"></i>
                            <h5 className="m-0">Excluir</h5>
                        </div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <p>Você está prestes a excluir todos os dados do colaborador <b>{nome}</b>, com matrícula <b>{matricula}</b>. Esta ação não pode ser desfeita. Deseja continuar?</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" className="btn btn-danger" onClick={excluirColaborador} disabled={carregando}>
                            {carregando ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : (<> <i className="bi bi-trash3-fill"></i>&ensp;Excluir </>)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
