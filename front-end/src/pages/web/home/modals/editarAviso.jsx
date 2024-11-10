import React, { useState, useEffect } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';

function EditarAvisoModal({ avisoSelecionado, setAvisoSelecionado, seriesOpcoes, setAvisos }) {
    const [avisoParaEditar, setAvisoParaEditar] = useState({});
    const [loadingEditar, setLoadingEditar] = useState(false);
    const turmasOpcoes = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // Turmas de A a Z
    const user = JSON.parse(sessionStorage.getItem('user'));

    useEffect(() => {
        if (avisoSelecionado) {
            abrirModalEditar(avisoSelecionado);
        }
    }, [avisoSelecionado]);

    const abrirModalEditar = (aviso) => {
        setAvisoParaEditar({
            id: aviso.id,
            titulo: aviso.titulo,
            conteudo: aviso.conteudo,
            author: aviso.author,
            exclusivo: !!aviso.turma || (aviso.series && aviso.series.length > 0),
            exclusividade: aviso.turma ? 'turma' : aviso.series?.length > 0 ? 'serie' : '',
            series: aviso.series ? aviso.series.split(', ') : [],
            serie: aviso.serie || '',
            turma: aviso.turma || '',
            cor: aviso.cor || 'primary',
        });
    };

    const editarAviso = async () => {
        setLoadingEditar(true);
        try {
            const response = await axios.post('/home/editar-aviso', { avisoParaSalvar: avisoParaEditar, instituicao: user.instituicao, });
            if (response.status === 200) {
                sessionStorage.setItem('mensagemSucesso', 'Aviso editado com sucesso!');
                window.location.reload();
            } else {
                showToast('danger', 'Erro ao editar aviso.');
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao editar aviso.');
        } finally {
            setLoadingEditar(false);
        }
    };

    const handleInputChange = (field, value) => {
        setAvisoParaEditar(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    // Função para lidar com a mudança de exclusividade
    const handleExclusividadeChange = (value) => {
        // Atualiza a exclusividade e redefine os campos relacionados
        setAvisoParaEditar(prev => ({
            ...prev,
            exclusividade: value,
            series: value === 'serie' ? [] : prev.series, // Limpa as séries se a exclusividade não for 'serie'
            serie: value === 'turma' ? '' : prev.serie,  // Limpa a série se a exclusividade não for 'turma'
            turma: value === 'turma' ? '' : prev.turma,  // Limpa a turma se a exclusividade não for 'turma'
        }));
    };

    // Função para lidar com o switch de "exclusivo"
    const handleExclusivoSwitch = (e) => {
        const isExclusivo = e.target.checked;
        setAvisoParaEditar({
            ...avisoParaEditar,
            exclusivo: isExclusivo,
            exclusividade: '',
            series: [],
            serie: '',
            turma: '',
        });
    };

    return (
        <div className="modal fade" id="editarAvisoModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="d-flex align-items-center gap-2">
                            <span className="d-flex align-items-center gap-2">
                                <i className="bi bi-megaphone fs-3"></i>
                                <h3 className="m-0 fs-4">Avisos</h3>
                            </span>
                            <i className="bi bi-arrow-right-short fs-4"></i>
                            <h5 className="m-0">Editar</h5>
                        </div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group mb-3">
                            <label>Título</label>
                            <input
                                type="text"
                                className="form-control"
                                value={avisoParaEditar?.titulo || ''}
                                onChange={(e) => handleInputChange('titulo', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label>Conteúdo</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                value={avisoParaEditar?.conteudo || ''}
                                onChange={(e) => handleInputChange('conteudo', e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <div className="form-group mb-3">
                            <label>Selecione a cor do card</label>
                            <div className="d-flex flex-wrap gap-2">
                                <input
                                    type="radio"
                                    className="btn-check"
                                    name="options-outlined"
                                    id="primary-outlined"
                                    autoComplete="off"
                                    checked={avisoParaEditar.cor === 'primary'}
                                    onChange={() => handleInputChange('cor', 'primary')}
                                />
                                <label className="btn btn-outline-primary" htmlFor="primary-outlined">
                                    Primary
                                </label>

                                <input
                                    type="radio"
                                    className="btn-check"
                                    name="options-outlined"
                                    id="info-outlined"
                                    autoComplete="off"
                                    checked={avisoParaEditar.cor === 'info'}
                                    onChange={() => handleInputChange('cor', 'info')}
                                />
                                <label className="btn btn-outline-info" htmlFor="info-outlined">
                                    Info
                                </label>

                                <input
                                    type="radio"
                                    className="btn-check"
                                    name="options-outlined"
                                    id="secondary-outlined"
                                    autoComplete="off"
                                    checked={avisoParaEditar.cor === 'secondary'}
                                    onChange={() => handleInputChange('cor', 'secondary')}
                                />
                                <label className="btn btn-outline-secondary" htmlFor="secondary-outlined">
                                    Secondary
                                </label>

                                <input
                                    type="radio"
                                    className="btn-check"
                                    name="options-outlined"
                                    id="success-outlined"
                                    autoComplete="off"
                                    checked={avisoParaEditar.cor === 'success'}
                                    onChange={() => handleInputChange('cor', 'success')}
                                />
                                <label className="btn btn-outline-success" htmlFor="success-outlined">
                                    Success
                                </label>

                                <input
                                    type="radio"
                                    className="btn-check"
                                    name="options-outlined"
                                    id="warning-outlined"
                                    autoComplete="off"
                                    checked={avisoParaEditar.cor === 'warning'}
                                    onChange={() => handleInputChange('cor', 'warning')}
                                />
                                <label className="btn btn-outline-warning" htmlFor="warning-outlined">
                                    Warning
                                </label>

                                <input
                                    type="radio"
                                    className="btn-check"
                                    name="options-outlined"
                                    id="danger-outlined"
                                    autoComplete="off"
                                    checked={avisoParaEditar.cor === 'danger'}
                                    onChange={() => handleInputChange('cor', 'danger')}
                                />
                                <label className="btn btn-outline-danger" htmlFor="danger-outlined">
                                    Danger
                                </label>
                            </div>
                        </div>
                        <div className="form-check form-switch">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="exclusivoSwitch"
                                checked={avisoParaEditar?.exclusivo || false}
                                onChange={handleExclusivoSwitch}
                            />
                            <label className="form-check-label" htmlFor="exclusivoSwitch">Este aviso é exclusivo?</label>
                        </div>

                        {avisoParaEditar?.exclusivo && (
                            <div className="form-group mb-3">
                                <div className="d-flex gap-3">
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id="exclusividadeSerie"
                                            name="exclusividade"
                                            value="serie"
                                            checked={avisoParaEditar?.exclusividade === 'serie'}
                                            onChange={() => handleExclusividadeChange('serie')} // Chamada correta da função
                                        />
                                        <label className="form-check-label" htmlFor="exclusividadeSerie">Por série</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id="exclusividadeTurma"
                                            name="exclusividade"
                                            value="turma"
                                            checked={avisoParaEditar?.exclusividade === 'turma'}
                                            onChange={() => handleExclusividadeChange('turma')} // Chamada correta da função
                                        />
                                        <label className="form-check-label" htmlFor="exclusividadeTurma">Por turma</label>
                                    </div>
                                </div>
                            </div>
                        )}
                        {avisoParaEditar?.exclusivo && avisoParaEditar.exclusividade === 'serie' && (
                            <div className="form-group mb-3">
                                <label>Selecione as séries</label>
                                <div className="d-flex gap-4">
                                    {seriesOpcoes.map(serieOp => (
                                        <div className="form-check" key={serieOp}>
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`serie-${serieOp}`}
                                                checked={avisoParaEditar?.series?.includes(serieOp)}
                                                onChange={() => {
                                                    const updatedSeries = avisoParaEditar?.series?.includes(serieOp)
                                                        ? avisoParaEditar.series.filter(s => s !== serieOp)
                                                        : [...avisoParaEditar.series, serieOp];
                                                    handleInputChange('series', updatedSeries);
                                                }}
                                            />
                                            <label className="form-check-label" htmlFor={`serie-${serieOp}`}>{serieOp}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {avisoParaEditar?.exclusivo && avisoParaEditar.exclusividade === 'turma' && (
                            <div className="row">
                                <div className="col">
                                    <label>Selecione o ano</label>
                                    <select
                                        className="form-select"
                                        value={avisoParaEditar?.serie || ''}
                                        onChange={(e) => handleInputChange('serie', e.target.value)}
                                    >
                                        <option value="">Selecione o ano</option>
                                        {seriesOpcoes.map(serieOp => (
                                            <option key={serieOp} value={serieOp}>{serieOp}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col">
                                    <label>Selecione a turma</label>
                                    <select
                                        className="form-select"
                                        value={avisoParaEditar?.turma || ''}
                                        onChange={(e) => handleInputChange('turma', e.target.value)}
                                    >
                                        <option value="">Selecione a turma</option>
                                        {turmasOpcoes.map(turma => (
                                            <option key={turma} value={turma}>{turma}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        <button type="button" className="btn btn-success" onClick={editarAviso} disabled={loadingEditar}>
                            {loadingEditar ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-pencil-fill"></i>&ensp;Editar</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditarAvisoModal;
