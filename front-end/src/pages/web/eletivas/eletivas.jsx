import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Estilos básicos
import 'react-date-range/dist/theme/default.css'; // Tema padrão
import axios from '../../../configs/axios';
import Header from '../../../components/header';
import showToast from '../../../utills/toasts';
import EditarEletiva from './editarEletiva';

export default function Eletiva() {
    const [ordenacao, setOrdenacao] = useState({ coluna: '', ascendente: true });
    const [textoFiltro, setTextoFiltro] = useState('');
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [eletivas, setEletivas] = useState([]);
    const [eletivaSelecionada, setEletivaSelecionada] = useState({ codigo: '', nome: '', tipo: '' });
    const [eletivasSelecionadas, setEletivasSelecionadas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExclusiva, setIsExclusiva] = useState(false);
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    const [periodoSelecionado, setPeriodoSelecionado] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
        },
    ]);

    const itensPorPagina = 10;
    const usuario = JSON.parse(sessionStorage.getItem('user'));

    useEffect(() => {
        carregarEletivas();
    }, []);

    const carregarEletivas = async () => {
        setIsLoading(true);
        try {
            const resposta = await axios.post('/eletivas/listar', { instituicao: usuario.instituicao });
            if (resposta.status === 200) {
                setEletivas(resposta.data);
            }
        } catch (erro) {
            showToast('danger', erro.response?.data.mensagem || 'Erro ao carregar as eletivas.');
        } finally {
            setIsLoading(false);
        }
    };

    const cadastrarEletiva = async (e) => {
        e.preventDefault();
        const novaEletiva = {
            instituicao: usuario.instituicao,
            nome: e.target.nome.value,
            tipo: e.target.tipo.value,
            dia: e.target.dia.value,
            horario: e.target.horario.value,
            professor: e.target.professor.value,
            sala: e.target.sala.value,
            total_alunos: e.target.totalAlunos.value,
            status: 'Ativo',
            exclusiva: isExclusiva,
            serie: isExclusiva ? e.target.serie.value : null,
            turma: isExclusiva ? e.target.turma.value : null,
        };

        try {
            const resposta = await axios.post('/eletivas/cadastrar', novaEletiva);
            if (resposta.status === 201) {
                e.target.reset();
                setIsExclusiva(false);
                showToast('success', resposta.data.mensagem);
                setTimeout(() => carregarEletivas(), 500);
            }
        } catch (erro) {
            showToast('danger', erro.response?.data.mensagem || 'Erro ao cadastrar a eletiva');
        }
    };

    const excluirEletiva = async (e) => {
        e.preventDefault();
        try {
            const resposta = await axios.post('/eletivas/excluir', { codigo: eletivaSelecionada.codigo, instituicao: usuario.instituicao, tipo: eletivaSelecionada.tipo });
            if (resposta.status === 200) {
                showToast('success', resposta.data.mensagem);
                setTimeout(() => carregarEletivas(), 500);
            }
        } catch (erro) {
            showToast('danger', erro.response?.data.mensagem || 'Erro ao excluir a eletiva.');
        }
    };

    const excluirSelecionadas = async (e) => {
        e.preventDefault();
        try {
            const resposta = await axios.post('/eletivas/excluir-multiplas', { eletivas: eletivasSelecionadas, instituicao: usuario.instituicao });
            if (resposta.status === 200) {
                showToast('success', resposta.data.mensagem);
                setEletivasSelecionadas([]);
                setTimeout(() => carregarEletivas(), 500);
            }
        } catch (erro) {
            showToast('danger', erro.response?.data.mensagem || 'Erro ao excluir as eletivas selecionadas.');
        }
    };

    const salvarPeriodo = async (e) => {
        e.preventDefault();
        try {
            const dataInicioEscolhida = periodoSelecionado[0].startDate;
            const dataFimEscolhida = periodoSelecionado[0].endDate;

            // Definir o início do dia (00:00) para data de início
            const dataInicioBrasilia = new Date(dataInicioEscolhida);
            dataInicioBrasilia.setUTCHours(0, 0, 0, 0); // Hora de início do dia

            // Definir o fim do dia (23:59) para data de fim
            const dataFimBrasilia = new Date(dataFimEscolhida);
            dataFimBrasilia.setUTCHours(23, 59, 59, 999); // Último minuto do dia

            const response = await axios.post('/eletivas/definir-periodo', {
                instituicao: usuario.instituicao,
                dataInicio: dataInicioBrasilia.toISOString(), // Hora de início do dia
                dataFim: dataFimBrasilia.toISOString(),       // Última hora do dia
            });

            if (response.status === 200) {
                showToast('success', response.data.mensagem);
            }
        } catch (error) {
            showToast('danger', error.response?.data.mensagem || 'Erro ao definir o período de inscrições.');
        }
    };


    const alternarOrdenacao = (coluna) => {
        setOrdenacao((prevState) => ({
            coluna,
            ascendente: prevState.coluna === coluna ? !prevState.ascendente : true,
        }));
        setPaginaAtual(1);
    };

    const compararValores = (a, b) => {
        const valorA = a[ordenacao.coluna] || '';
        const valorB = b[ordenacao.coluna] || '';
        return ordenacao.ascendente ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
    };

    const eletivasFiltradasEOrdenadas = eletivas
        .filter((eletiva) => ['nome', 'professor', 'tipo'].some((key) => eletiva[key]?.toLowerCase().includes(textoFiltro.toLowerCase())))
        .sort((a, b) => compararValores(a, b));

    const totalPaginas = Math.ceil(eletivasFiltradasEOrdenadas.length / itensPorPagina);
    const eletivasPaginadas = eletivasFiltradasEOrdenadas.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

    const paginacaoAnterior = () => {
        if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1);
    };

    const paginacaoProxima = () => {
        if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1);
    };

    const paginasVisiveis = () => {
        const totalPaginasVisiveis = 3;
        let inicioPagina = Math.max(1, paginaAtual - Math.floor(totalPaginasVisiveis / 2));
        let fimPagina = Math.min(totalPaginas, inicioPagina + totalPaginasVisiveis - 1);

        if (fimPagina - inicioPagina + 1 < totalPaginasVisiveis) {
            inicioPagina = Math.max(1, fimPagina - totalPaginasVisiveis + 1);
        }

        return Array.from({ length: fimPagina - inicioPagina + 1 }, (_, i) => inicioPagina + i);
    };

    const obterIntervaloAtual = () => {
        if (eletivasFiltradasEOrdenadas.length === 0) {
            return '0 - 0';
        }

        const inicio = (paginaAtual - 1) * itensPorPagina + 1;
        const fim = Math.min(paginaAtual * itensPorPagina, eletivasFiltradasEOrdenadas.length);
        return `${inicio} - ${fim}`;
    };

    const toggleSelectEletiva = (codigo, tipo) => {
        setEletivasSelecionadas((prevState) =>
            prevState.some((sel) => sel.codigo === codigo && sel.tipo === tipo) ? prevState.filter((sel) => sel.codigo !== codigo) : [...prevState, { codigo, tipo }]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const selecoes = eletivasPaginadas.map((eletiva) => ({ codigo: eletiva.codigo, tipo: eletiva.tipo }));
            setEletivasSelecionadas(selecoes);
        } else {
            setEletivasSelecionadas([]);
        }
    };

    const getNomesEletivasSelecionadas = () => {
        return eletivas.filter((eletiva) => eletivasSelecionadas.some((sel) => sel.codigo === eletiva.codigo)).map((eletiva) => eletiva.nome).join(', ');
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-fixed bottom-0 end-0 p-3"></div>
            <Header />
            <main id='main-section'>
                <section id='section'>
                    <div className="box">
                        <div className="title d-flex justify-content-between align-items-center">
                            <span className='d-flex align-items-center gap-2 text-black'>
                                <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                <h3 className='m-0 fs-4'>Eletivas</h3>
                            </span>
                            {!isLoading && (
                                <div className='d-flex gap-2'>
                                    <button className='btn btn-outline-secondary' data-bs-toggle="modal" data-bs-target="#definirPeriodo">
                                        <i className="bi bi-calendar-check"></i>&ensp;Definir período
                                    </button>
                                    <button className='btn btn-outline-secondary' data-bs-toggle="modal" data-bs-target="#cadastrarEletiva">
                                        <i className="bi bi-clipboard-plus"></i>&ensp;Cadastrar
                                    </button>
                                    {eletivasSelecionadas.length > 0 && (
                                        <button className='btn btn-danger' data-bs-toggle="modal" data-bs-target="#excluirSelecionadasModal">
                                            <i className="bi bi-trash3-fill"></i>&ensp;Excluir eletivas
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            {isLoading ? (
                                <div className="d-flex justify-content-center">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Carregando...</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="d-flex justify-content-end">
                                        <div className="w-50 ms-auto mb-2">
                                            <form className="position-relative">
                                                <input type="text" className="form-control" placeholder="Buscar eletiva... (Nome, Tipo ou Professor)" onChange={e => { setTextoFiltro(e.target.value); setPaginaAtual(1); }} />
                                                <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
                                            </form>
                                        </div>
                                    </div>

                                    <div className='table-responsive'>
                                        <table className='table table-striped table-sm table-hover align-middle'>
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <span className='form-check m-0'>
                                                            <input className="form-check-input" type="checkbox" onChange={handleSelectAll} checked={eletivasSelecionadas.length === eletivasPaginadas.length} />
                                                        </span>
                                                    </th>
                                                    {['nome', 'tipo'].map(coluna => (
                                                        <th key={coluna} onClick={() => alternarOrdenacao(coluna)} style={{ cursor: 'pointer' }} >
                                                            <span className='d-flex align-items-center gap-2'>
                                                                <i className={`bi bi-arrow-${ordenacao.coluna === coluna ? (ordenacao.ascendente ? 'down' : 'up') : 'down-up'}`}></i>
                                                                <p className='m-0'>{coluna.charAt(0).toUpperCase() + coluna.slice(1)}</p>
                                                            </span>
                                                        </th>
                                                    ))}
                                                    <th>Professor</th>
                                                    <th>Sala</th>
                                                    <th>Horário</th>
                                                    <th>Total alunos</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {eletivasPaginadas.length > 0 ? (
                                                    eletivasPaginadas.map(eletiva => (
                                                        <tr key={eletiva.codigo}>
                                                            <td className='align-middle'>
                                                                <span className='form-check m-0'>
                                                                    <input className="form-check-input" type="checkbox" checked={eletivasSelecionadas.some(sel => sel.codigo === eletiva.codigo && sel.tipo === eletiva.tipo)} onChange={() => toggleSelectEletiva(eletiva.codigo, eletiva.tipo)} />
                                                                </span>
                                                            </td>
                                                            <td className='align-middle'>{eletiva.nome}</td>
                                                            <td className='align-middle'>{eletiva.tipo}</td>
                                                            <td className='align-middle'>{eletiva.professor}</td>
                                                            <td className='align-middle'>{eletiva.sala}</td>
                                                            <td className='align-middle'>{eletiva.dia} | {eletiva.horario}</td>
                                                            <td className='align-middle'>{eletiva.alunos_cadastrados}/{eletiva.total_alunos}</td>
                                                            <td className='d-flex justify-content-end gap-2'>
                                                                <button className='btn btn-sm btn-success' data-bs-toggle="modal" data-bs-target="#editarEletiva" onClick={() => setEletivaSelecionada({ codigo: eletiva.codigo, nome: eletiva.nome, tipo: eletiva.tipo })} >
                                                                    <i className="bi bi-pencil-fill"></i>&ensp;Editar
                                                                </button>
                                                                <Link to={`/electives/manage?code=${eletiva.codigo}`} className='btn btn-sm btn-secondary' >
                                                                    <i className="bi bi-gear-fill"></i>&ensp;Gerenciar
                                                                </Link>
                                                                <button className='btn btn-sm btn-danger' data-bs-toggle="modal" data-bs-target="#excluirEletiva" onClick={() => setEletivaSelecionada({ codigo: eletiva.codigo, nome: eletiva.nome, tipo: eletiva.tipo })} >
                                                                    <i className="bi bi-trash3-fill"></i>&ensp;Excluir
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="7" className='text-center'>
                                                            Nenhuma eletiva cadastrada.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <nav aria-label="Page navigation example" className="d-flex align-items-center justify-content-between">
                                        <div className="text-center">Mostrando {obterIntervaloAtual()} de {eletivasFiltradasEOrdenadas.length} resultados</div>
                                        <ul className="pagination justify-content-end">
                                            <li className={`page-item ${paginaAtual === 1 ? 'disabled' : ''}`}>
                                                <button className="page-link" onClick={paginacaoAnterior}>
                                                    &laquo; Anterior
                                                </button>
                                            </li>
                                            {totalPaginas > 0 && (
                                                <li className={`page-item ${paginaAtual === 1 ? 'active' : ''}`}>
                                                    <button className="page-link" onClick={() => setPaginaAtual(1)}>1</button>
                                                </li>
                                            )}
                                            {paginaAtual > 3 && (
                                                <li className="page-item disabled">
                                                    <span className="page-link">...</span>
                                                </li>
                                            )}
                                            {paginasVisiveis().map((numeroPagina) =>
                                                numeroPagina !== 1 && numeroPagina !== totalPaginas ? (
                                                    <li key={numeroPagina} className={`page-item ${paginaAtual === numeroPagina ? 'active' : ''}`}>
                                                        <button className="page-link" onClick={() => setPaginaAtual(numeroPagina)}>
                                                            {numeroPagina}
                                                        </button>
                                                    </li>
                                                ) : null
                                            )}
                                            {paginaAtual < totalPaginas - 2 && (
                                                <li className="page-item disabled">
                                                    <span className="page-link">...</span>
                                                </li>
                                            )}
                                            {totalPaginas > 1 && (
                                                <li className={`page-item ${paginaAtual === totalPaginas ? 'active' : ''}`}>
                                                    <button className="page-link" onClick={() => setPaginaAtual(totalPaginas)}>
                                                        {totalPaginas}
                                                    </button>
                                                </li>
                                            )}
                                            <li className={`page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}`}>
                                                <button className="page-link" onClick={paginacaoProxima}>
                                                    Próximo &raquo;
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>

                                </>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Modal: Cadastrar Eletiva */}
            <div className="modal fade" id="cadastrarEletiva" tabIndex="-1" aria-labelledby="cadastrarEletivaLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                <h4 className='m-0 fs-4'>Eletivas</h4>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Cadastrar</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={cadastrarEletiva} className="needs-validation" noValidate>
                            <div className="modal-body">
                                <div className="row g-3">
                                    {/* Nome e Tipo */}
                                    <div className="col-md-6">
                                        <label htmlFor="nome" className="form-label">Nome <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" id="nome" name="nome" required />
                                        <div className="invalid-feedback">Por favor, insira o nome da eletiva.</div>
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="tipo" className="form-label">Tipo <span className="text-danger">*</span></label>
                                        <div className="d-flex justify-content-between">
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" id="eletivaRadio" name="tipo" value="Eletiva" required />
                                                <label className="form-check-label" htmlFor="eletivaRadio">Eletiva</label>
                                            </div>
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" id="projetoVidaRadio" name="tipo" value="Projeto de Vida" />
                                                <label className="form-check-label" htmlFor="projetoVidaRadio">Projeto de Vida</label>
                                            </div>
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" id="trilhaRadio" name="tipo" value="Trilha" />
                                                <label className="form-check-label" htmlFor="trilhaRadio">Trilha</label>
                                            </div>
                                        </div>
                                        <div className="invalid-feedback">Por favor, selecione o tipo da eletiva.</div>
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="dia" className="form-label">Dia da semana <span className="text-danger">*</span></label>
                                        <select className="form-select" id="dia" name="dia" required>
                                            <option value="">Selecione...</option>
                                            <option value="Terça-feira">Terça-feira</option>
                                            <option value="Quinta-feira">Quinta-feira</option>
                                            <option value="Terça-feira e Quinta-feira">Terça-feira e Quinta-feira</option>
                                        </select>
                                        <div className="invalid-feedback">Por favor, selecione o dia da semana.</div>
                                    </div>
                                    <div className="col-md-3">
                                        <label htmlFor="horario" className="form-label">Horário <span className="text-danger">*</span></label>
                                        <select className="form-select" id="horario" name="horario" required>
                                            <option value="">Selecione...</option>
                                            <option value="1º e 2º horário">1º e 2º horário</option>
                                            <option value="3º e 4º horário">3º e 4º horário</option>
                                            <option value="5º e 6º horário">5º e 6º horário</option>
                                        </select>
                                        <div className="invalid-feedback">Por favor, selecione o horário.</div>
                                    </div>
                                    <div className="col-md-3">
                                        <label htmlFor="totalAlunos" className="form-label">Total de alunos <span className="text-danger">*</span></label>
                                        <input type="number" className="form-control" id="totalAlunos" name="totalAlunos" required />
                                        <div className="invalid-feedback">Por favor, insira o total de alunos.</div>
                                    </div>
                                    <div className="col-md-9">
                                        <label htmlFor="professor" className="form-label">Professor <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" id="professor" name="professor" required />
                                        <div className="invalid-feedback">Por favor, insira o nome do professor.</div>
                                    </div>
                                    <div className="col-md-3">
                                        <label htmlFor="sala" className="form-label">Sala <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" id="sala" name="sala" required />
                                        <div className="invalid-feedback">Por favor, insira a sala.</div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-check form-switch">
                                            <input className="form-check-input" type="checkbox" id="exclusivaSwitch" checked={isExclusiva === true} onChange={() => setIsExclusiva(isExclusiva === true ? false : true)} />
                                            <label className="form-check-label" htmlFor="exclusivaSwitch">Exclusiva para uma turma?</label>
                                        </div>
                                        {isExclusiva === true && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <label htmlFor="serie" className="form-label">Série <span className="text-danger">*</span></label>
                                                    <select className="form-select" id="serie" name="serie" required>
                                                        <option value="">Selecione...</option>
                                                        <option value="1º ano">1º ano</option>
                                                        <option value="2º ano">2º ano</option>
                                                        <option value="3º ano">3º ano</option>
                                                    </select>
                                                    <div className="invalid-feedback">Por favor, selecione a série.</div>
                                                </div>
                                                <div className="col-md-6">
                                                    <label htmlFor="turma" className="form-label">Turma <span className="text-danger">*</span></label>
                                                    <select className="form-select" id="turma" name="turma" required>
                                                        <option value="">Selecione...</option>
                                                        {[...Array(26)].map((_, i) => {
                                                            const turma = String.fromCharCode(65 + i); // 65 é o código ASCII para 'A'
                                                            return (
                                                                <option key={turma} value={turma}>{turma}</option>
                                                            );
                                                        })}
                                                    </select>
                                                    <div className="invalid-feedback">Por favor, selecione a turma.</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal"><i className="bi bi-clipboard-plus"></i>&ensp;Cadastrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal: Editar Eletiva */}
            <div className="modal fade" id="editarEletiva" tabIndex="-1" aria-labelledby="editarEletivaLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                    <h4 className='m-0 fs-4'>Eletivas</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Editar</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <EditarEletiva codigo={eletivaSelecionada.codigo} />
                    </div>
                </div>
            </div>

            {/* Modal: Excluir Eletiva */}
            <div className="modal fade" id="excluirEletiva" tabIndex="-1" aria-labelledby="excluirEletivaLabel" aria-hidden="true">
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
                        <form onSubmit={excluirEletiva}>
                            <div className="modal-body">
                                <p>Tem certeza de que deseja excluir a eletiva <b>{eletivaSelecionada.nome}</b> Esta ação não poderá ser desfeita e todos os dados relacionados a esta eletiva serão <u>permanentemente</u> removidos.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type='submit' className='btn btn-danger' data-bs-dismiss="modal"><i className="bi bi-trash3-fill"></i>&ensp;Excluir</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal: Excluir Eletivas Selecionadas */}
            <div className="modal fade" id="excluirSelecionadasModal" tabIndex="-1" aria-labelledby="excluirSelecionadasModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="excluirSelecionadasModalLabel">Excluir Eletivas Selecionadas</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Tem certeza que deseja excluir as eletivas selecionadas?</p>
                            <p><b>Eletivas selecionadas: </b>{getNomesEletivasSelecionadas()}</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={excluirSelecionadas} data-bs-dismiss="modal">Excluir</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Definir Período */}
            <div className="modal fade" id="definirPeriodo" tabIndex="-1" aria-labelledby="definirPeriodoLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                    <h4 className='m-0 fs-4'>Eletivas</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Definir período</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={salvarPeriodo}>
                            <div className="text-center m-2">
                                <p className='mx-4'>
                                    O período de inscrições vai de <strong>{periodoSelecionado[0].startDate.toLocaleDateString('pt-BR', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                    })}</strong> até <strong>{periodoSelecionado[0].endDate.toLocaleDateString('pt-BR', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                    })}</strong>, totalizando <strong>
                                        {
                                            Math.ceil(
                                                (periodoSelecionado[0].endDate.getTime() - periodoSelecionado[0].startDate.getTime()) / (1000 * 3600 * 24)
                                            )
                                        }</strong> dias.
                                </p>
                                <DateRange editableDateInputs={true} onChange={(item) => setPeriodoSelecionado([item.selection])} moveRangeOnFirstSelection={false} ranges={periodoSelecionado} />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">
                                    <i className="bi bi-calendar-check"></i>&ensp;Definir
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
