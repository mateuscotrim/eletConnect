import React, { useState } from 'react';
import showToast from '../../../../utills/toasts';
import axios from '../../../../configs/axios';

const INITIAL_STATE = {
    nome: '',
    tipo: '',
    dia: '',
    horario: '',
    professor: '',
    sala: '',
    totalAlunos: '',
    serie: '',
    turma: '',
    isExclusiva: false,
    exclusividade: '', // Adicionado para indicar a exclusividade
    series: [], // Adicionado para múltiplas séries
};

const seriesOpcoes = ['1º ano', '2º ano', '3º ano'];
const turmasOpcoes = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // Gera A-Z

export default function ModalCadastrarEletiva({ usuario }) {
    const [eletiva, setEletiva] = useState(INITIAL_STATE);
    const [enviando, setEnviando] = useState(false);

    const handleChange = ({ target: { name, value, type, checked } }) => {
        setEletiva(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
        }));
    };

    const handleExclusividadeChange = (tipo) => {
        setEletiva(prev => ({ ...prev, exclusividade: tipo, series: [], serie: '', turma: '' }));
    };

    const handleSeriesChange = (serie) => {
        setEletiva(prev => {
            const seriesAtualizadas = prev.series.includes(serie)
                ? prev.series.filter(s => s !== serie)
                : [...prev.series, serie];
            return { ...prev, series: seriesAtualizadas };
        });
    };

    const cadastrarEletiva = async (e) => {
        e.preventDefault();
        setEnviando(true);

        try {
            const resposta = await axios.post('/eletivas/cadastrar', {
                ...eletiva,
                instituicao: usuario.instituicao,
                status: 'Ativo',
                serie: eletiva.isExclusiva && eletiva.exclusividade === 'turma' ? eletiva.serie : null,
                turma: eletiva.isExclusiva && eletiva.exclusividade === 'turma' ? eletiva.turma : null,
                series: eletiva.isExclusiva && eletiva.exclusividade === 'serie' ? eletiva.series : null,
            });
            if (resposta.status === 201) {
                sessionStorage.setItem('mensagemSucesso', resposta.data.mensagem);
                window.location.reload();
            }
        } catch (erro) {
            showToast('danger', erro.response?.data.mensagem || 'Erro ao cadastrar a eletiva');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="modal fade" id="cadastrarEletiva" tabIndex="-1" aria-labelledby="cadastrarEletivaLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className='modal-title fs-4 d-flex align-items-center gap-2'>
                            <i className="bi bi-journal-bookmark-fill fs-3"></i> Eletivas
                            <i className="bi bi-arrow-right-short fs-4"></i> Cadastrar
                        </h4>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form onSubmit={cadastrarEletiva}>
                        <div className="modal-body">
                            <div className="row g-3">
                                <InputField size="6" name="nome" label="Nome da Eletiva" value={eletiva.nome} onChange={handleChange} required pattern="[A-Za-zÀ-ÿ\s]+" maxLength="75" feedback="O nome não pode ultrapassar 75 caracteres." />
                                <RadioGroup name="tipo" label="Tipo" value={eletiva.tipo} onChange={handleChange} options={['Eletiva', 'Projeto de Vida', 'Trilha']} required />
                                <SelectField name="dia" label="Dia da semana" value={eletiva.dia} onChange={handleChange} required options={['Terça-feira', 'Quinta-feira', 'Terça-feira e Quinta-feira']} />
                                <SelectField name="horario" label="Horário" value={eletiva.horario} onChange={handleChange} required options={['1º e 2º horário', '3º e 4º horário', '5º e 6º horário']} />
                                <InputField size="6" name="professor" label="Professor" value={eletiva.professor} onChange={handleChange} required pattern="[A-Za-zÀ-ÿ\s]+" maxLength="50" feedback="O nome do professor não pode ultrapassar 50 caracteres." />
                                <InputField size="3" name="sala" label="Sala" value={eletiva.sala} onChange={handleChange} required pattern="[A-Za-z0-9\s]+" maxLength="10" feedback="A sala não pode ultrapassar 10 caracteres." />
                                <InputField size="3" name="totalAlunos" label="Total de Alunos" value={eletiva.totalAlunos} onChange={handleChange} required type="number" min="1" max="100" feedback="O total de alunos deve estar entre 1 e 100." />
                                <SwitchField name="isExclusiva" label="Essa eletiva é exclusiva?" checked={eletiva.isExclusiva} onChange={handleChange} />
                                {eletiva.isExclusiva && (
                                    <>
                                        <div className="form-group mb-3">
                                            <div className="d-flex gap-3">
                                                <div className="form-check">
                                                    <input
                                                        type="radio"
                                                        className="form-check-input"
                                                        id="exclusividadeSerie"
                                                        name="exclusividade"
                                                        value="serie"
                                                        checked={eletiva.exclusividade === 'serie'}
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
                                                        checked={eletiva.exclusividade === 'turma'}
                                                        onChange={() => handleExclusividadeChange('turma')}
                                                    />
                                                    <label className="form-check-label" htmlFor="exclusividadeTurma">Por turma</label>
                                                </div>
                                            </div>
                                        </div>
                                        {eletiva.exclusividade === 'serie' && (
                                            <div className="form-group">
                                                <label>Selecione as séries</label>
                                                <div className="d-flex gap-4">
                                                    {seriesOpcoes.map(serieOp => (
                                                        <div className="form-check" key={serieOp}>
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`serie-${serieOp}`}
                                                                checked={eletiva.series.includes(serieOp)}
                                                                onChange={() => handleSeriesChange(serieOp)}
                                                            />
                                                            <label className="form-check-label" htmlFor={`serie-${serieOp}`}>{serieOp}</label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {eletiva.exclusividade === 'turma' && (
                                            <div className='row'>
                                                <div className="col">
                                                    <label>Selecione o ano</label>
                                                    <select
                                                        className="form-select"
                                                        value={eletiva.serie}
                                                        onChange={(e) => handleChange({ target: { name: 'serie', value: e.target.value } })}
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
                                                        value={eletiva.turma}
                                                        onChange={(e) => handleChange({ target: { name: 'turma', value: e.target.value } })}
                                                    >
                                                        <option value="">Selecione a turma</option>
                                                        {turmasOpcoes.map(turma => (
                                                            <option key={turma} value={turma}>{turma}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={enviando}>
                                {enviando ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : (<><i className="bi bi-clipboard-plus"></i>&ensp;Cadastrar</>)}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function InputField({ name, label, feedback, size, ...props }) {
    return (
        <div className={`col-md-${size}`}>
            <label htmlFor={name} className="form-label">{label} <span className="text-danger">*</span></label>
            <input name={name} id={name} className="form-control" {...props} />
            {props.value && props.value.length > props.maxLength && (
                <div className="text-danger mt-1">
                    <small>{feedback}</small>
                </div>
            )}
        </div>
    );
}

function SelectField({ name, label, options, ...props }) {
    return (
        <div className="col-md-6">
            <label htmlFor={name} className="form-label">{label} <span className="text-danger">*</span></label>
            <select name={name} id={name} className="form-select" {...props}>
                <option value="">Selecione...</option>
                {options.map((option, idx) => (
                    <option key={idx} value={option}>{option}</option>
                ))}
            </select>
        </div>
    );
}

function RadioGroup({ name, label, options, onChange, value, required }) {
    return (
        <div className="col-md-6">
            <label className="form-label">{label} <span className="text-danger">*</span></label>
            <div className="d-flex justify-content-between">
                {options.map((option, idx) => (
                    <div className="form-check" key={idx}>
                        <input className="form-check-input" type="radio" id={`${name}_${option}`} name={name} value={option} checked={value === option} onChange={onChange} required={required} />
                        <label className="form-check-label" htmlFor={`${name}_${option}`}>{option}</label>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SwitchField({ name, label, checked, onChange }) {
    return (
        <div className="col-md-12">
            <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id={name} name={name} checked={checked} onChange={onChange} />
                <label className="form-check-label" htmlFor={name}>{label}</label>
            </div>
        </div>
    );
}
