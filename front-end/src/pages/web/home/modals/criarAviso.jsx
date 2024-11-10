import React, { useState } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';

function CriarAvisoModal({ seriesOpcoes, setAvisos }) {
    const [loadingCriar, setLoadingCriar] = useState(false);
    const [avisoParaCriar, setAvisoParaCriar] = useState({
        titulo: '',
        conteudo: '',
        cor: 'primary', // Definindo uma cor padrão
        exclusivo: false,
        exclusividade: '',
        series: [],
        serie: '',
        turma: '',
    });
    const turmasOpcoes = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // Turmas de A a Z
    const user = JSON.parse(sessionStorage.getItem('user'));

    const criarAviso = async () => {
        setLoadingCriar(true);
        try {
            const avisoParaSalvar = {
                ...avisoParaCriar,
                author: user.matricula,
                instituicao: user.instituicao,
                exclusivo: avisoParaCriar.exclusivo || false,
            };

            const response = await axios.post('/home/criar-aviso', { avisoParaSalvar, instituicao: user.instituicao });
            if (response.status === 201) {
                sessionStorage.setItem('mensagemSucesso', 'Aviso criado com sucesso!');
                window.location.reload();
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem);
        } finally {
            setLoadingCriar(false);
        }
    };

    const handleInputChange = (field, value) => {
        setAvisoParaCriar(prev => ({ ...prev, [field]: value }));
    };

    const handleExclusividadeChange = (value) => {
        setAvisoParaCriar({
            ...avisoParaCriar,
            exclusividade: value,
            series: [],
            serie: '',
            turma: '',
        });
    };

    const handleExclusivoSwitch = (e) => {
        const isExclusivo = e.target.checked;
        setAvisoParaCriar({
            ...avisoParaCriar,
            exclusivo: isExclusivo,
            exclusividade: '',
            series: [],
            serie: '',
            turma: '',
        });
    };

    return (
        <div className="modal fade" id="criarAvisoModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="d-flex align-items-center gap-2">
                            <span className="d-flex align-items-center gap-2">
                                <i className="bi bi-megaphone fs-3"></i>
                                <h3 className="m-0 fs-4">Avisos</h3>
                            </span>
                            <i className="bi bi-arrow-right-short fs-4"></i>
                            <h5 className="m-0">Criar</h5>
                        </div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group mb-3">
                            <label>Título</label>
                            <input
                                type="text"
                                className="form-control"
                                value={avisoParaCriar.titulo}
                                onChange={(e) => handleInputChange('titulo', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label>Conteúdo</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                value={avisoParaCriar.conteudo}
                                onChange={(e) => handleInputChange('conteudo', e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <div className="form-group mb-3">
                            <label>Selecione a cor do card</label>
                            <div className="d-flex flex-wrap gap-2">
                                {['primary', 'info', 'secondary', 'success', 'warning', 'danger'].map((value) => (
                                    <div key={value}>
                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="cor"
                                            id={`btn-check-${value}`}
                                            autoComplete="off"
                                            checked={avisoParaCriar.cor === value}
                                            onChange={() => handleInputChange('cor', value)}
                                            required
                                        />
                                        <label className={`btn btn-outline-${value}`} htmlFor={`btn-check-${value}`}>
                                            {value.charAt(0).toUpperCase() + value.slice(1)}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="form-check form-switch">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="exclusivoSwitch"
                                checked={avisoParaCriar.exclusivo}
                                onChange={handleExclusivoSwitch}
                            />
                            <label className="form-check-label" htmlFor="exclusivoSwitch">Este aviso é exclusivo?</label>
                        </div>
                        {avisoParaCriar.exclusivo && (
                            <div className="form-group mb-3">
                                <div className="d-flex gap-3">
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id="exclusividadeSerie"
                                            name="exclusividade"
                                            value="serie"
                                            checked={avisoParaCriar.exclusividade === 'serie'}
                                            onChange={() => handleExclusividadeChange('serie')}
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
                                            checked={avisoParaCriar.exclusividade === 'turma'}
                                            onChange={() => handleExclusividadeChange('turma')}
                                        />
                                        <label className="form-check-label" htmlFor="exclusividadeTurma">Por turma</label>
                                    </div>
                                </div>
                            </div>
                        )}
                        {avisoParaCriar.exclusivo && avisoParaCriar.exclusividade === 'serie' && (
                            <div className="form-group">
                                <label>Selecione as séries</label>
                                <div className="d-flex gap-4">
                                    {seriesOpcoes.map(serieOp => (
                                        <div className="form-check" key={serieOp}>
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`serie-${serieOp}`}
                                                checked={avisoParaCriar.series.includes(serieOp)}
                                                onChange={() => {
                                                    const updatedSeries = avisoParaCriar.series.includes(serieOp)
                                                        ? avisoParaCriar.series.filter(s => s !== serieOp)
                                                        : [...avisoParaCriar.series, serieOp];
                                                    handleInputChange('series', updatedSeries);
                                                }}
                                            />
                                            <label className="form-check-label" htmlFor={`serie-${serieOp}`}>{serieOp}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {avisoParaCriar.exclusivo && avisoParaCriar.exclusividade === 'turma' && (
                            <div className='row'>
                                <div className="col">
                                    <label>Selecione o ano</label>
                                    <select
                                        className="form-select"
                                        value={avisoParaCriar.serie}
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
                                        value={avisoParaCriar.turma}
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
                        <button type="button" className="btn btn-primary" onClick={criarAviso} disabled={loadingCriar}>
                            {loadingCriar ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-plus-square-dotted"></i>&ensp;Criar</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CriarAvisoModal;
