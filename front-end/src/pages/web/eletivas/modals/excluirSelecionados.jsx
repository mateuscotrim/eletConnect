import React, { useEffect, useState } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';

export default function ModalExcluirSelecionados({ eletivasSelecionadas, carregarEletivas, usuario }) {
    const [loading, setLoading] = useState(false);

    // Função para excluir eletivas selecionadas
    const excluirSelecionadas = async (e) => {
        e.preventDefault();
        setLoading(true); // Ativa o estado de carregamento
        try {
            const resposta = await axios.post('/eletivas/excluir-multiplas', {
                eletivas: eletivasSelecionadas,
                instituicao: usuario.instituicao
            });

            if (resposta.status === 200) {
                sessionStorage.setItem('mensagemSucesso', resposta.data.mensagem);
                window.location.reload();
            }
        } catch (erro) {
            showToast('danger', erro.response?.data?.mensagem || 'Erro ao excluir as eletivas selecionadas.');
        } finally {
            setLoading(false);
        }
    };

    // Função para retornar os nomes das eletivas selecionadas
    const getNomesEletivasSelecionadas = () => {
        return eletivasSelecionadas.length > 0 ? eletivasSelecionadas.map((eletiva) => {
            return eletiva.nome || 'Nome não disponível';
        }).join(', ') : 'Nenhuma eletiva selecionada';
    };

    return (
        <div className="modal fade" id="excluirSelecionadasModal" tabIndex="-1" aria-labelledby="excluirSelecionadasModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="d-flex align-items-center gap-2">
                            <span className='d-flex align-items-center gap-2'>
                                <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                <h4 className='m-0 fs-4'>Eletivas</h4>
                            </span>
                            <i className="bi bi-arrow-right-short fs-4"></i>
                            <h5 className="m-0">Excluir</h5>
                        </div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <p>Tem certeza que deseja excluir as eletivas selecionadas?</p>
                        <p><b>Eletivas selecionadas: </b>{getNomesEletivasSelecionadas()}</p> {/* Exibe os nomes das eletivas */}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" className="btn btn-danger" onClick={excluirSelecionadas} disabled={loading} >
                            {loading ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : (<> <i className="bi bi-trash3-fill"></i>&ensp;Excluir </>)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
