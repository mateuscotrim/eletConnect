import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from '../../../configs/axios';
import MHeader from '../../../components/mheader';
import MFooter from '../../../components/mfooter';
import showToast from '../../../utills/toasts';
import "../../../assets/styles/mMain.css";

export default function MHome() {
    const [eletivas, setEletivas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [abaSelecionada, setAbaSelecionada] = useState('Eletiva');
    const [inscricoesEncerradas, setInscricoesEncerradas] = useState(false);
    const [tempoRestante, setTempoRestante] = useState("");
    const [filtroDia, setFiltroDia] = useState([]);
    const [filtroHorario, setFiltroHorario] = useState('');

    const aluno = useMemo(() => JSON.parse(sessionStorage.getItem('aluno')) || {}, []);
    const [dataEncerramento, setDataEncerramento] = useState(null);

    const buscarPeriodo = useCallback(async () => {
        try {
            const { data, status } = await axios.post('/eletivas/obter-periodo', { instituicao: aluno.instituicao });
            if (status === 200) {
                const dataEncerramentoBrasilia = new Date(new Date(data.dataEncerramento).getTime() + 3 * 60 * 60 * 1000);
                setDataEncerramento(dataEncerramentoBrasilia);

                if (new Date() >= dataEncerramentoBrasilia) {
                    setInscricoesEncerradas(true);
                    setTempoRestante("Inscrições encerradas");
                    setCarregando(false);
                }
            } else {
                throw new Error('Erro ao buscar período de inscrições.');
            }
        } catch (error) {
            setErro('Erro ao buscar período de inscrições. Verifique sua conexão e tente novamente.');
            setCarregando(false);
        }
    }, [aluno.instituicao]);

    const listarEletivas = useCallback(async () => {
        if (inscricoesEncerradas) return;

        try {
            const { data, status } = await axios.post('/m/eletivas/listar', { instituicao: aluno.instituicao, matricula: aluno.matricula });
            if (status === 200 && data.eletivas) {
                const eletivasFormatadas = data.eletivas.map(eletiva => ({
                    ...eletiva,
                    professor: Array.isArray(eletiva.professor) ? eletiva.professor.join(', ') : eletiva.professor || 'N/A',
                    matriculado: data.matriculas ? data.matriculas.some(e => e.codigo_eletiva === eletiva.codigo) : false
                }));
                setEletivas(eletivasFormatadas);
            } else {
                throw new Error('Falha ao obter eletivas.');
            }
        } catch (error) {
            setErro(`Erro ao listar eletivas. Verifique sua conexão e tente novamente. Detalhes: ${error.message}`);
        } finally {
            setCarregando(false);
        }
    }, [aluno.instituicao, aluno.matricula, inscricoesEncerradas]);

    useEffect(() => {
        buscarPeriodo();
    }, [buscarPeriodo]);

    useEffect(() => {
        if (aluno.instituicao && !inscricoesEncerradas) {
            listarEletivas();
        }
    }, [aluno.instituicao, inscricoesEncerradas, listarEletivas]);

    useEffect(() => {
        if (!dataEncerramento || inscricoesEncerradas) return;

        const atualizarTempoRestante = () => {
            const tempoRestanteMs = dataEncerramento - new Date();

            if (tempoRestanteMs <= 0) {
                setInscricoesEncerradas(true);
                setTempoRestante("Inscrições encerradas");
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
            if (abaSelecionada === 'Trilha') {
                if (prev.includes(dia)) {
                    return prev.filter(d => d !== dia);
                } else {
                    return [...prev, dia]; 
                }
            } else {
                return prev.includes(dia) ? [] : [dia];  
            }
        });
    }, [abaSelecionada]);

    const handleHorarioChange = useCallback((horario) => {
        setFiltroHorario(prev => prev === horario ? '' : horario);
    }, []);

    useEffect(() => {
        setFiltroDia([]);
        setFiltroHorario('');
    }, [abaSelecionada]);

    const eletivasFiltradas = useMemo(() => {
        return eletivas
            .filter(eletiva => eletiva.tipo === abaSelecionada)
            .filter(eletiva => {
                const { dia, horario } = eletiva;

                const diaValido = filtroDia.length === 0 || filtroDia.some(filtro => dia.includes(filtro));
                const horarioValido = !filtroHorario || filtroHorario === horario;

                return diaValido && horarioValido;
            });
    }, [eletivas, filtroDia, filtroHorario, abaSelecionada]);

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
                tipo: abaSelecionada
            });
            if (response.status === 201) {
                showToast('success', 'Matrícula realizada com sucesso!');
                listarEletivas(); // Recarrega a lista para atualizar o estado
            } else {
                throw new Error('Falha ao realizar matrícula.');
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao participar da eletiva!');
        }
    }, [abaSelecionada, aluno, inscricoesEncerradas, listarEletivas]);

    const desmatricularEletiva = useCallback(async (codigo) => {
        try {
            const response = await axios.post('/eletivas/desmatricular-aluno', {
                codigo,
                matricula: aluno.matricula,
                instituicao: aluno.instituicao,
                tipo: abaSelecionada
            });
            if (response.status === 200) {
                showToast('success', 'Desmatrícula realizada com sucesso!');
                listarEletivas(); // Recarrega a lista para atualizar o estado
            } else {
                throw new Error('Falha ao realizar desmatrícula.');
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao desmatricular da eletiva!');
        }
    }, [abaSelecionada, aluno, listarEletivas]);

    const exibirAbaTrilha = useMemo(() => aluno.serie?.charAt(0) !== '1', [aluno.serie]);

    const tabs = useMemo(() => [
        { nome: 'Eletiva' },
        { nome: 'Projeto de Vida' },
        ...(exibirAbaTrilha ? [{ nome: 'Trilha' }] : [])
    ], [exibirAbaTrilha]);

    return (
        <>
            <MHeader />
            <main
                id="mMain"
                className="d-flex flex-column align-items-center pt-2 position-relative"
                style={{
                    paddingBottom: '5em',
                    overflowY: 'auto',
                    minHeight: 'calc(100vh - 4.5em - 5em)'
                }}
            >
                {carregando ? (
                    <div className='d-flex flex-column align-items-center py-4'>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div id='toast-container' className="toast-container position-absolute top-100 start-50 translate-middle"></div>

                        {!inscricoesEncerradas && (
                            <div className="text-center py-2">
                                <p id='period' className='m-0'>Período de inscrições acaba em</p>
                                <p id="timerPeriod" className="m-0"><small className='fw-bold'>{tempoRestante}</small></p>
                            </div>
                        )}

                        <ul className={`nav nav-tabs justify-content-center w-100 ${!inscricoesEncerradas ? '' : 'mt-2'}`}>
                            {tabs.map(tab => (
                                <li className="nav-item" key={tab.nome}>
                                    <button 
                                        className={`nav-link text-black ${abaSelecionada === tab.nome ? 'active' : ''}`} 
                                        onClick={() => setAbaSelecionada(tab.nome)}>
                                        {tab.nome}
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <div className='d-flex flex-column btn-group-sm gap-2 m-2'>
                            <div className="btn-group btn-group-sm" role="group" aria-label="Basic checkbox toggle button group">
                                <input type="checkbox" className="btn-check" id="btncheck1" autoComplete="off" checked={filtroDia.includes('Terça-feira')} onChange={() => handleDiaChange('Terça-feira')} />
                                <label className="btn btn-outline-secondary" htmlFor="btncheck1">Terça-feira</label>

                                <input type="checkbox" className="btn-check" id="btncheck2" autoComplete="off" checked={filtroDia.includes('Quinta-feira')} onChange={() => handleDiaChange('Quinta-feira')} />
                                <label className="btn btn-outline-secondary" htmlFor="btncheck2">Quinta-feira</label>
                            </div>
                            <div className="btn-group btn-group-sm" role="group" aria-label="Basic checkbox toggle button group">
                                <input type="radio" className="btn-check" id="btncheck3" autoComplete="off" checked={filtroHorario === '1º e 2º horário'} onChange={() => handleHorarioChange('1º e 2º horário')} />
                                <label className="btn btn-outline-secondary" htmlFor="btncheck3">1º e 2º horário</label>

                                <input type="radio" className="btn-check" id="btncheck4" autoComplete="off" checked={filtroHorario === '3º e 4º horário'} onChange={() => handleHorarioChange('3º e 4º horário')} />
                                <label className="btn btn-outline-secondary" htmlFor="btncheck4">3º e 4º horário</label>

                                <input type="radio" className="btn-check" id="btncheck5" autoComplete="off" checked={filtroHorario === '5º e 6º horário'} onChange={() => handleHorarioChange('5º e 6º horário')} />
                                <label className="btn btn-outline-secondary" htmlFor="btncheck5">5º e 6º horário</label>
                            </div>
                        </div>

                        <div className="accordion accordion-flush border" style={{ width: '95%' }} id="accordionFlushExample">
                            {eletivasFiltradas.length > 0 ? (
                                eletivasFiltradas.map(eletiva => (
                                    <div className="accordion-item" key={eletiva.id}>
                                        <h2 className="accordion-header">
                                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#flush-collapse${eletiva.id}`} aria-expanded="false" aria-controls={`flush-collapse${eletiva.id}`} >
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
                                        <div id={`flush-collapse${eletiva.id}`} className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample" >
                                            <div className="accordion-body">
                                                {eletiva.descricao}
                                                <div className='text-end'>
                                                    {eletiva.matriculado ? (
                                                        <button className='btn btn-danger' onClick={() => desmatricularEletiva(eletiva.codigo)} disabled={inscricoesEncerradas}>
                                                            {inscricoesEncerradas ? 'Período Encerrado' : 'Desmatricular'}
                                                        </button>
                                                    ) : (
                                                        <button className='btn btn-success' onClick={() => matricularEletiva(eletiva.codigo)} disabled={inscricoesEncerradas}>
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
