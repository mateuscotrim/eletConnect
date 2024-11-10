import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from '../../../configs/axios';
import MHeader from '../../../components/mheader';
import MFooter from '../../../components/mfooter';
import showToast from '../../../utills/toasts';
import '../../../assets/styles/mMain.css';

const DAY_OPTIONS = ['Terça-feira', 'Quinta-feira'];
const TIME_OPTIONS = ['1º e 2º horário', '3º e 4º horário', '5º e 6º horário'];

export default function MHome() {
    const [eletivas, setEletivas] = useState([]);
    const [minhasEletivas, setMinhasEletivas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [abaSelecionada, setAbaSelecionada] = useState('Eletiva');
    const [inscricoesEncerradas, setInscricoesEncerradas] = useState(false);
    const [tempoRestante, setTempoRestante] = useState('');
    const [filtroDia, setFiltroDia] = useState([]);
    const [filtroHorario, setFiltroHorario] = useState('');
    const [dataEncerramento, setDataEncerramento] = useState(null);

    const aluno = useMemo(() => JSON.parse(sessionStorage.getItem('aluno')) || {}, []);

    const buscarPeriodo = useCallback(async () => {
        try {
            const { data, status } = await axios.post('/eletivas/obter-periodo', { instituicao: aluno.instituicao });
            if (status === 200 && data.dataEncerramento) {
                const dataEncerramentoBrasilia = new Date(new Date(data.dataEncerramento).getTime() + 3 * 60 * 60 * 1000);
                setDataEncerramento(dataEncerramentoBrasilia);
                const periodoEncerrado = new Date() >= dataEncerramentoBrasilia;
                setInscricoesEncerradas(periodoEncerrado);
                setTempoRestante(periodoEncerrado ? 'Inscrições encerradas' : '');
            } else {
                throw new Error('Erro ao buscar período de inscrições.');
            }
        } catch {
            setErro('Erro ao buscar período de inscrições. Verifique sua conexão e tente novamente.');
        } finally {
            setCarregando(false);
        }
    }, [aluno.instituicao]);

    const listarEletivas = useCallback(async () => {
        try {
            const { data, status } = await axios.post('/m/eletivas/listar', {
                instituicao: aluno.instituicao,
                matricula: aluno.matricula,
            });

            if (status === 200 && data.eletivas) {
                setEletivas(data.eletivas.map(eletiva => ({
                    ...eletiva,
                    professor: Array.isArray(eletiva.professor) ? eletiva.professor.join(', ') : eletiva.professor || 'N/A',
                })));
            } else {
                throw new Error('Falha ao obter eletivas.');
            }
        } catch (error) {
            setErro(`Erro ao listar eletivas. Detalhes: ${error.message}`);
        } finally {
            setCarregando(false);
        }
    }, [aluno.instituicao, aluno.matricula]);

    const listarMinhasEletivas = useCallback(async () => {
        try {
            const { data, status } = await axios.post('/m/eletivas/minhas-eletivas', {
                matricula: aluno.matricula,
                instituicao: aluno.instituicao,
            });

            if (status === 200 && data.eletivas) {
                setMinhasEletivas(data.eletivas.map(eletiva => eletiva.codigo));
            } else {
                throw new Error('Falha ao obter as eletivas do aluno.');
            }
        } catch (error) {
            setErro(`Erro ao listar as eletivas do aluno. Detalhes: ${error.message}`);
        }
    }, [aluno.matricula, aluno.instituicao]);

    useEffect(() => {
        buscarPeriodo();
    }, [buscarPeriodo]);

    useEffect(() => {
        if (aluno.instituicao) {
            listarEletivas();
            listarMinhasEletivas();
        }
    }, [aluno.instituicao, listarEletivas, listarMinhasEletivas]);

    useEffect(() => {
        if (!dataEncerramento || inscricoesEncerradas) return;

        const atualizarTempoRestante = () => {
            const tempoRestanteMs = dataEncerramento - new Date();
            if (tempoRestanteMs <= 0) {
                setInscricoesEncerradas(true);
                setTempoRestante('Inscrições encerradas');
            } else {
                const dias = Math.floor(tempoRestanteMs / (1000 * 60 * 60 * 24));
                const horas = Math.floor((tempoRestanteMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutos = Math.floor((tempoRestanteMs % (1000 * 60 * 60)) / (1000 * 60));
                const segundos = Math.floor((tempoRestanteMs % 60000) / 1000);
                setTempoRestante(`${dias} dias, ${horas} horas, ${minutos} minutos e ${segundos} segundos`);
            }
        };

        const intervalo = setInterval(atualizarTempoRestante, 1000);
        return () => clearInterval(intervalo);
    }, [dataEncerramento, inscricoesEncerradas]);

    const handleDiaChange = useCallback((dia) => {
        setFiltroDia(prev => {
            if (prev.includes(dia)) {
                return prev.filter(d => d !== dia);
            } else {
                return [...prev, dia];
            }
        });
    }, []);

    const handleHorarioChange = useCallback((horario) => {
        setFiltroHorario(prev => prev === horario ? '' : horario);
    }, []);

    const resetarFiltros = useCallback(() => {
        setFiltroDia([]);
        setFiltroHorario('');
    }, []);

    const eletivasFiltradas = useMemo(() => {
        return eletivas
            .map(eletiva => ({
                ...eletiva,
                matriculado: minhasEletivas.includes(eletiva.codigo),
            }))
            .filter(eletiva => eletiva.tipo === abaSelecionada)
            .filter(eletiva => {
                const eletivaExclusivaPorSerie = eletiva.exclusiva && eletiva.series && eletiva.series.includes(aluno.serie);
                const eletivaExclusivaPorTurma = eletiva.exclusiva && eletiva.serie === aluno.serie && eletiva.turma === aluno.turma;
                const eletivaValida = !eletiva.exclusiva || eletivaExclusivaPorSerie || eletivaExclusivaPorTurma;
                const diaValido = filtroDia.length === 0 || filtroDia.some(filtro => eletiva.dia.includes(filtro));
                const horarioValido = !filtroHorario || filtroHorario === eletiva.horario;

                return eletivaValida && diaValido && horarioValido;
            });
    }, [eletivas, minhasEletivas, filtroDia, filtroHorario, abaSelecionada, aluno.serie, aluno.turma]);

    const matricularEletiva = useCallback(async (codigo) => {
        if (inscricoesEncerradas) {
            showToast('warning', 'O período de inscrições já foi encerrado.');
            return;
        }

        try {
            const response = await axios.post('/eletivas/matricular-aluno', {
                codigo,
                matricula: aluno.matricula,
                instituicao: aluno.instituicao,
                tipo: abaSelecionada,
            });
            if (response.status === 201) {
                showToast('success', 'Matrícula realizada com sucesso!');
                listarMinhasEletivas(); // Atualiza a lista após a matrícula
            } else {
                throw new Error('Falha ao realizar matrícula.');
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao participar da eletiva!');
        }
    }, [abaSelecionada, aluno, inscricoesEncerradas, listarMinhasEletivas]);

    const desmatricularEletiva = useCallback(async (codigo) => {
        try {
            const response = await axios.post('/eletivas/desmatricular-aluno', {
                codigo,
                matricula: aluno.matricula,
                instituicao: aluno.instituicao,
                tipo: abaSelecionada,
            });
            if (response.status === 200) {
                showToast('success', 'Desmatrícula realizada com sucesso!');
                listarMinhasEletivas(); // Atualiza a lista após a desmatrícula
            } else {
                throw new Error('Falha ao realizar desmatrícula.');
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao desmatricular da eletiva!');
        }
    }, [abaSelecionada, aluno, listarMinhasEletivas]);

    const exibirAbaTrilha = useMemo(() => aluno.serie?.charAt(0) !== '1', [aluno.serie]);

    return (
        <>
            <div id='toast-container' className="toast-container position-absolute bottom-0 end-0 m-4"></div>
            <MHeader />
            <main id="mMain" className="d-flex flex-column align-items-center pt-2 position-relative" style={{ paddingBottom: '5em', overflowY: 'auto', minHeight: 'calc(100vh - 5em - 5em)' }} >
                {carregando ? (
                    <div className='d-flex flex-column align-items-center py-4'>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {!inscricoesEncerradas && (
                            <div className="text-center py-2">
                                <p id='period' className='m-0'>Período de inscrições acaba em</p>
                                <p id="timerPeriod" className="m-0 fw-bold"> {tempoRestante} </p>
                            </div>
                        )}

                        <ul className="nav nav-tabs justify-content-center w-100">
                            {['Eletiva', 'Projeto de Vida', exibirAbaTrilha && 'Trilha'].filter(Boolean).map(tab => (
                                <li className="nav-item" key={tab}>
                                    <button
                                        className={`nav-link text-black ${abaSelecionada === tab ? 'active' : ''}`}
                                        onClick={() => setAbaSelecionada(tab)}
                                    >
                                        {tab}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className='d-flex flex-column btn-group-sm gap-2 m-2'>
                            <div className="btn-group btn-group-sm" role="group">
                                {DAY_OPTIONS.map((dia, index) => (
                                    <React.Fragment key={dia}>
                                        <input
                                            type="checkbox"
                                            className="btn-check"
                                            id={`btncheck${index + 1}`}
                                            autoComplete="off"
                                            checked={filtroDia.includes(dia)}
                                            onChange={() => handleDiaChange(dia)}
                                        />
                                        <label className="btn btn-outline-secondary" htmlFor={`btncheck${index + 1}`}>{dia}</label>
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="btn-group btn-group-sm d-flex" role="group"  >
                                {TIME_OPTIONS.map((horario, index) => (
                                    <React.Fragment key={horario}>
                                        <input
                                            type="radio"
                                            className="btn-check"
                                            id={`btncheck${index + 3}`}
                                            autoComplete="off"
                                            checked={filtroHorario === horario}
                                            onChange={() => handleHorarioChange(horario)}
                                        />
                                        <label className="btn btn-outline-secondary m-0" htmlFor={`btncheck${index + 3}`}>{horario}</label>
                                    </React.Fragment>
                                ))}
                                <button className="btn btn-danger pb-0 mb-0" onClick={resetarFiltros}>
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                        </div>

                        <div className="accordion accordion-flush border" style={{ width: '95%' }} id="accordionFlushExample">
                            {eletivasFiltradas.length > 0 ? (
                                eletivasFiltradas.map(eletiva => (
                                    <div className="accordion-item" key={eletiva.id}>
                                        <h2 className="accordion-header">
                                            <button
                                                className="accordion-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target={`#flush-collapse${eletiva.id}`}
                                                aria-expanded="false"
                                                aria-controls={`flush-collapse${eletiva.id}`}
                                            >
                                                <div className='d-flex flex-column w-100'>
                                                    <span className='d-flex flex-column mb-3'>
                                                        <h4 className='m-0'>{eletiva.nome}</h4>
                                                        <p className='m-0'>{eletiva.alunos_cadastrados}/{eletiva.total_alunos} alunos</p>
                                                    </span>
                                                    <ul>
                                                        <li><b>Professor</b>: {eletiva.professor}</li>
                                                        <li><b>Sala</b>: {eletiva.sala}</li>
                                                        <li><b>Horário</b>: {eletiva.dia} | {eletiva.horario}</li>
                                                    </ul>
                                                </div>
                                            </button>
                                        </h2>
                                        <div
                                            id={`flush-collapse${eletiva.id}`}
                                            className="accordion-collapse collapse"
                                            data-bs-parent="#accordionFlushExample"
                                        >
                                            <div className="accordion-body">
                                                {eletiva.descricao}
                                                <div className='text-end'>
                                                    {eletiva.matriculado ? (
                                                        <button
                                                            className='btn btn-danger'
                                                            onClick={() => desmatricularEletiva(eletiva.codigo)}
                                                            disabled={inscricoesEncerradas}
                                                        >
                                                            {inscricoesEncerradas ? 'Período Encerrado' : 'Desmatricular'}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className='btn btn-success'
                                                            onClick={() => matricularEletiva(eletiva.codigo)}
                                                            disabled={inscricoesEncerradas}
                                                        >
                                                            {inscricoesEncerradas ? 'Período Encerrado' : 'Matricular'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className='m-0 text-center p-2'>Nenhuma {abaSelecionada.toLowerCase()} encontrada.</p>
                            )}
                        </div>
                    </>
                )}
            </main>
            <MFooter />
        </>
    );
}
