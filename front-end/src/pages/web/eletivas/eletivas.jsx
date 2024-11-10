import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../configs/axios';
import Header from '../../../components/header';
import showToast from '../../../utills/toasts';
import ModalCadastrarPeriodo from './modals/cadastrarPeriodo';
import ModalCadastrarEletiva from './modals/cadastrarEletiva';
import ModalEditarEletiva from './modals/editarEletiva';
import ModalExcluirEletiva from './modals/excluirEletiva';
import ModalExcluirSelecionados from './modals/excluirSelecionados';

export default function Eletiva() {
    const [ordenacao, setOrdenacao] = useState({ coluna: '', ascendente: true });
    const [textoFiltro, setTextoFiltro] = useState('');
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [eletivas, setEletivas] = useState([]);
    const [eletivaSelecionada, setEletivaSelecionada] = useState({ codigo: '', nome: '', tipo: '' });
    const [eletivasSelecionadas, setEletivasSelecionadas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const usuario = JSON.parse(sessionStorage.getItem('user'));

    const itensPorPagina = 10;

    useEffect(() => {
        carregarEletivas();
    }, []);

    useEffect(() => {
        // Verifica se há uma mensagem de sucesso armazenada no sessionStorage
        const mensagem = sessionStorage.getItem('mensagemSucesso');
        if (mensagem) {
            setMensagemSucesso(mensagem);
            showToast('success', mensagem); // Exibe a mensagem com um toast
            sessionStorage.removeItem('mensagemSucesso'); // Remove a mensagem após exibir
        }
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

    const toggleSelectEletiva = (codigo, tipo, nome) => {
        const isSelected = eletivasSelecionadas.some(sel => sel.codigo === codigo && sel.tipo === tipo && sel.nome === nome);

        if (isSelected) {
            // Remove a eletiva da lista de selecionadas
            setEletivasSelecionadas(prev =>
                prev.filter(sel => !(sel.codigo === codigo && sel.tipo === tipo && sel.nome === nome))
            );
        } else {
            // Adiciona a eletiva à lista de selecionadas
            setEletivasSelecionadas(prev => [...prev, { codigo, tipo, nome }]);
        }
    };


    const handleSelectAll = (e) => {
        if (e.target.checked) {
            // Seleciona todas as eletivas visíveis na página atual
            const selecoes = eletivasPaginadas.map((eletiva) => ({
                codigo: eletiva.codigo,
                tipo: eletiva.tipo,
                nome: eletiva.nome,
            }));
            setEletivasSelecionadas(selecoes);
        } else {
            // Remove todas as seleções visíveis na página atual
            setEletivasSelecionadas([]);
        }
    };

    // Verificação de todas as eletivas visíveis estarem selecionadas
    const todasSelecionadas = eletivasPaginadas.length > 0 && eletivasPaginadas.every(
        (eletiva) => eletivasSelecionadas.some(
            (sel) => sel.codigo === eletiva.codigo && sel.tipo === eletiva.tipo && sel.nome === eletiva.nome
        )
    );

    return (
        <>
            <div id='toast-container' className="toast-container position-absolute bottom-0 end-0 m-2"></div>
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
                                            <i className="bi bi-trash3-fill"></i>&ensp;Excluir selecionadas
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
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                onChange={handleSelectAll}
                                                                checked={todasSelecionadas}
                                                            />
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
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="checkbox"
                                                                        checked={eletivasSelecionadas.some(sel => sel.codigo === eletiva.codigo && sel.tipo === eletiva.tipo && sel.nome === eletiva.nome)}
                                                                        onChange={() => toggleSelectEletiva(eletiva.codigo, eletiva.tipo, eletiva.nome)}
                                                                    />
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

            <ModalCadastrarPeriodo instituicao={usuario.instituicao} />
            <ModalCadastrarEletiva usuario={usuario} />
            <ModalEditarEletiva codigo={eletivaSelecionada.codigo} instituicao={usuario.instituicao} />
            <ModalExcluirEletiva codigo={eletivaSelecionada.codigo} tipo={eletivaSelecionada.tipo} instituicao={usuario.instituicao} />
            <ModalExcluirSelecionados eletivasSelecionadas={eletivasSelecionadas} usuario={usuario} />
        </>
    );
}
