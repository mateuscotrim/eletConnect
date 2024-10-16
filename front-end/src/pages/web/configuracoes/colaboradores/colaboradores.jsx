import React, { useState, useEffect } from 'react';
import axios from '../../../../configs/axios';
import Header from '../../../../components/header';
import showToast from '../../../../utills/toasts';
import EditarColaborador from './editarColaborador';

export default function Colaboradores() {
    const [sortBy, setSortBy] = useState({ column: '', asc: true });
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState([]);
    const [selectedColaboradores, setSelectedColaboradores] = useState([]);
    const [dadosColaborador, setDadosColaborador] = useState({ matricula: '', nome: '', email: '', cargo: '', status: 'Aguardando', fazerLogin: false });
    const [matriculaParaEditar, setMatriculaParaEditar] = useState('');
    const [matriculaParaExcluir, setMatriculaParaExcluir] = useState('');
    const [nomeParaExcluir, setNomeParaExcluir] = useState('');
    const [carregando, setCarregando] = useState(false);

    const itemsPerPage = 10;
    const user = JSON.parse(sessionStorage.getItem('user'));
    const escola = JSON.parse(sessionStorage.getItem('escola'));

    useEffect(() => {
        listarColaboradores();
    }, []);

    useEffect(() => {
        if (dadosColaborador.email === '') {
            setDadosColaborador(prev => ({ ...prev, fazerLogin: false }));
        }
    }, [dadosColaborador.email]);

    const listarColaboradores = async () => {
        setCarregando(true);
        try {
            const response = await axios.post('/colaboradores/listar', { instituicao: escola.cnpj });
            if (response.status === 200) {
                setData(response.data.colaboradoresData);
            } else {
                throw new Error('Erro ao buscar colaboradores.');
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem);
            setData([]);
        } finally {
            setCarregando(false);
        }
    };

    const cadastrarColaborador = async (e) => {
        e.preventDefault();

        if (dadosColaborador.email === '') {
            setDadosColaborador((prev) => ({ ...prev, fazerLogin: false }));
        }

        setCarregando(true);
        try {
            const response = await axios.post('/colaboradores/cadastrar', { ...dadosColaborador, instituicao: escola.cnpj });
            if (response.status === 200) {
                e.target.reset();
                showToast('success', `O colaborador <b>${dadosColaborador.nome}</b> foi cadastrado com sucesso`);
                listarColaboradores();
            } else {
                throw new Error('Erro ao cadastrar colaborador.');
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem);
        } finally {
            setCarregando(false);
        }
    };

    const excluirColaborador = async (e) => {
        e.preventDefault();
        setCarregando(true);
        try {
            const response = await axios.post('/colaboradores/excluir', { matricula: matriculaParaExcluir, instituicao: escola.cnpj });
            if (response.status === 200) {
                showToast('success', `O colaborador <b>${nomeParaExcluir}</b> foi excluído com sucesso`);
                listarColaboradores();
            } else {
                throw new Error('Erro ao excluir colaborador.');
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem);
        } finally {
            setCarregando(false);
        }
    };

    const excluirSelecionados = async () => {
        if (selectedColaboradores.includes(user.matricula)) {
            showToast('warning', 'Você não pode excluir a si mesmo.');
            return;
        }

        if (selectedColaboradores.length === 0) {
            showToast('warning', 'Selecione pelo menos um colaborador para excluir');
            return;
        }

        setCarregando(true);
        try {
            const response = await axios.post('/colaboradores/excluir-multiplos', { matriculas: selectedColaboradores, instituicao: escola.cnpj });
            if (response.status === 200) {
                showToast('success', 'Colaboradores selecionados foram excluídos com sucesso');
                setSelectedColaboradores([]);
                listarColaboradores();
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem);
        } finally {
            setCarregando(false);
        }
    };

    const toggleSort = (coluna) => {
        if (sortBy.column === coluna) {
            setSortBy({ ...sortBy, asc: !sortBy.asc });
        } else {
            setSortBy({ column: coluna, asc: true });
        }
        setCurrentPage(1);
    };

    const compareValues = (a, b, asc) => {
        const aValue = a[sortBy.column] || '';
        const bValue = b[sortBy.column] || '';
        return isNumeric(aValue) && isNumeric(bValue) ? (asc ? aValue - bValue : bValue - aValue) : asc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    };

    const isNumeric = (value) => !isNaN(value) && !isNaN(parseFloat(value));

    const handleInputChange = (e) => {
        setFilterText(e.target.value);
        setCurrentPage(1);
    };

    const filteredAndSortedData = Array.isArray(data)
        ? data.filter((item) =>
            [item.nome, item.matricula, item.cargo]
                .map((val) => val.toLowerCase())
                .some((val) => val.includes(filterText.toLowerCase()))
        ).sort((a, b) => compareValues(a, b, sortBy.asc))
        : [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
    const totalPaginas = Math.ceil(filteredAndSortedData.length / itemsPerPage);

    const obterIntervaloAtual = () => {
        if (filteredAndSortedData.length === 0) {
            return '0 - 0 de 0 resultados';
        }

        const inicio = (currentPage - 1) * itemsPerPage + 1;
        const fim = Math.min(currentPage * itemsPerPage, filteredAndSortedData.length);
        return `${inicio} - ${fim}`;
    };

    const paginacaoAnterior = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const paginacaoProxima = () => {
        if (currentPage < totalPaginas) setCurrentPage(currentPage + 1);
    };

    const paginasVisiveis = () => {
        const totalPaginasVisiveis = 3;
        let inicioPagina = Math.max(1, currentPage - Math.floor(totalPaginasVisiveis / 2));
        let fimPagina = Math.min(totalPaginas, inicioPagina + totalPaginasVisiveis - 1);

        if (fimPagina - inicioPagina + 1 < totalPaginasVisiveis) {
            inicioPagina = Math.max(1, fimPagina - totalPaginasVisiveis + 1);
        }

        return Array.from({ length: fimPagina - inicioPagina + 1 }, (_, i) => inicioPagina + i);
    };

    const getSelectedColaboradoresNames = () => {
        return data
            .filter((colaborador) => selectedColaboradores.includes(colaborador.matricula))
            .map((colaborador) => colaborador.nome)
            .join(', ');
    };

    const handleCheckboxChange = (e, matricula) => {
        if (matricula === user.matricula) {
            showToast('warning', 'Você não pode selecionar a si mesmo.');
            return;
        }

        setSelectedColaboradores((prevSelected) =>
            e.target.checked ? [...prevSelected, matricula] : prevSelected.filter((id) => id !== matricula)
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allMatriculas = paginatedData.map((item) => item.matricula).filter((matricula) => matricula !== user.matricula);
            setSelectedColaboradores(allMatriculas);
        } else {
            setSelectedColaboradores([]);
        }
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-fixed bottom-0 end-0 p-3"></div>
            <Header />
            <main id='main-section'>
                <section id='section'>
                    <div className="box">
                        <div className="title d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-gear-fill fs-3"></i>
                                    <h3 className='m-0 fs-4'>Configurações</h3>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h4 className="m-0">Colaboradores</h4>
                            </div>
                            {!carregando && (
                                <div className="d-flex gap-2">
                                    <button className='btn btn-outline-secondary' data-bs-toggle="modal" data-bs-target="#cadastrarColaborador">
                                        <i className="bi bi-person-add"></i>&ensp;Cadastrar
                                    </button>
                                    {selectedColaboradores.length > 0 && (
                                        <button className='btn btn-danger' data-bs-toggle="modal" data-bs-target="#excluirSelecionadosModal">
                                            <i className="bi bi-trash3-fill"></i>&ensp;Excluir colaboradores
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            {carregando ? (
                                <div className="d-flex justify-content-center pt-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Carregando...</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="d-flex justify-content-end">
                                        <div className="w-50 ms-auto mb-2">
                                            <form className="position-relative">
                                                <input type="text" className="form-control" placeholder="Buscar colaborador... (Matricula ou Nome)" onChange={handleInputChange} />
                                                <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
                                            </form>
                                        </div>
                                    </div>
                                    <div className='table-responsive'>
                                        <table className='table table-sm table-striped table-hover align-middle'>
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <span className='form-check m-0'>
                                                            <input className="form-check-input" type="checkbox" checked={paginatedData.length > 0 && selectedColaboradores.length === paginatedData.length - 1} onChange={handleSelectAll} />
                                                        </span>
                                                    </th>
                                                    {['matricula', 'nome', 'cargo'].map((coluna) => (
                                                        <th key={coluna} onClick={() => toggleSort(coluna)} style={{ cursor: 'pointer' }}>
                                                            <span className='d-flex align-items-center gap-2'>
                                                                {sortBy.column === coluna ? (
                                                                    <i className={`bi bi-arrow-${sortBy.asc ? 'down' : 'up'}`}></i>
                                                                ) : (
                                                                    <i className="bi bi-arrow-down-up"></i>
                                                                )}
                                                                <p className='m-0'>{coluna.charAt(0).toUpperCase() + coluna.slice(1)}</p>
                                                            </span>
                                                        </th>
                                                    ))}
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedData.length > 0 ? (
                                                    paginatedData.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className='align-middle'>
                                                                <span className='form-check m-0'>
                                                                    <input className="form-check-input" type="checkbox" checked={selectedColaboradores.includes(item.matricula)} onChange={(e) => handleCheckboxChange(e, item.matricula)} disabled={item.matricula === user.matricula} />
                                                                </span>
                                                            </td>
                                                            <td className='align-middle'>{item.matricula}</td>
                                                            <td className='align-middle'>
                                                                {renderStatusIcon(item.status)}&emsp;
                                                                {item.nome}&emsp;
                                                                {item.matricula === user.matricula && (<i className="bi bi-star-fill text-warning"></i>)}
                                                            </td>
                                                            <td className='align-middle'>{item.cargo}</td>
                                                            <td className='d-flex justify-content-end gap-2'>
                                                                <button className='btn btn-sm btn-success d-flex align-items-center' data-bs-toggle="modal" data-bs-target="#editarColaborador" onClick={() => setMatriculaParaEditar(item.matricula)}>
                                                                    <i className="bi bi-pencil"></i>&ensp;Editar
                                                                </button>
                                                                <button className='btn btn-sm btn-danger d-flex align-items-center' data-bs-toggle="modal" data-bs-target="#excluirColaborador" onClick={() => { setMatriculaParaExcluir(item.matricula); setNomeParaExcluir(item.nome); }} disabled={item.matricula === user.matricula} >
                                                                    <i className="bi bi-trash3-fill"></i>&ensp;Excluir
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" className='text-center text-muted'>
                                                            Nenhum colaborador encontrado.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <nav aria-label="Page navigation example" className='d-flex align-items-center justify-content-between'>
    <div className="text-center">
        Mostrando {obterIntervaloAtual()} de {filteredAndSortedData.length} resultados
    </div>
    <ul className="pagination justify-content-end">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={paginacaoAnterior}>
                &laquo; Anterior
            </button>
        </li>
        {totalPaginas > 0 && (
            <li className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(1)}>
                    1
                </button>
            </li>
        )}
        {currentPage > 3 && (
            <li className="page-item disabled">
                <span className="page-link">...</span>
            </li>
        )}
        {paginasVisiveis().map((numeroPagina) =>
            numeroPagina !== 1 && numeroPagina !== totalPaginas ? (
                <li key={numeroPagina} className={`page-item ${currentPage === numeroPagina ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(numeroPagina)}>
                        {numeroPagina}
                    </button>
                </li>
            ) : null
        )}
        {currentPage < totalPaginas - 2 && (
            <li className="page-item disabled">
                <span className="page-link">...</span>
            </li>
        )}
        {totalPaginas > 1 && (
            <li className={`page-item ${currentPage === totalPaginas ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(totalPaginas)}>
                    {totalPaginas}
                </button>
            </li>
        )}
        <li className={`page-item ${currentPage === totalPaginas ? 'disabled' : ''}`}>
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

            {/* Modal: Cadastrar Colaborador */}
            <div className="modal fade" id="cadastrarColaborador" tabIndex="-1" aria-labelledby="cadastrarColaboradorLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-people-fill fs-3"></i>
                                    <h4 className='m-0 fs-4'>Colaboradores</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Cadastrar</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={cadastrarColaborador} >
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label htmlFor="matricula" className="form-label">Matrícula <span className='text-danger'>*</span></label>
                                        <input type="text" className="form-control" id="matricula" value={dadosColaborador.matricula} onChange={(e) => setDadosColaborador({ ...dadosColaborador, matricula: e.target.value })} required />
                                    </div>
                                    <div className="col-md-9">
                                        <label htmlFor="nome" className="form-label">Nome <span className='text-danger'>*</span></label>
                                        <input type="text" className="form-control" id="nome" value={dadosColaborador.nome} onChange={(e) => setDadosColaborador({ ...dadosColaborador, nome: e.target.value })} required />
                                    </div>
                                    <div className="col-md-4">
                                        <label htmlFor="cargo" className="form-label">Cargo <span className="text-danger">*</span></label>
                                        <select className="form-select" id="cargo" value={dadosColaborador.cargo} onChange={(e) => setDadosColaborador({ ...dadosColaborador, cargo: e.target.value })} required >
                                            <option value="" disabled>Selecione...</option>
                                            <option value="Diretor">Diretor</option>
                                            <option value="Coordenador">Coordenador</option>
                                            <option value="Professor">Professor</option>
                                            <option value="Colaborador">Colaborador</option>
                                        </select>
                                    </div>
                                    <div className="col-md-8">
                                        <label htmlFor="email" className="form-label">E-mail <span className="text-danger">*</span></label>
                                        <input type="email" className="form-control" id="email" value={dadosColaborador.email} onChange={(e) => setDadosColaborador({ ...dadosColaborador, email: e.target.value })} />
                                    </div>
                                    <div className="col-md-8">
                                        <div className="form-check form-switch">
                                            <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckLogin" checked={dadosColaborador.fazerLogin} onChange={(e) => setDadosColaborador({ ...dadosColaborador, fazerLogin: e.target.checked })} />
                                            <label className="form-check-label" htmlFor="flexSwitchCheckLogin">Permitir que o colaborador faça login no sistema?</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type='submit' className='btn btn-primary' data-bs-dismiss="modal">
                                    <i className="bi bi-person-add"></i>&ensp;Cadastrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal: Editar Colaborador */}
            <div className="modal fade" id="editarColaborador" tabIndex="-1" aria-labelledby="editarColaboradorLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-people-fill fs-3"></i>
                                    <h4 className='m-0 fs-4'>Colaboradores</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Editar</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <EditarColaborador matricula={matriculaParaEditar} />
                    </div>
                </div>
            </div>

            {/* Modal: Excluir Colaborador */}
            <div className="modal fade" id="excluirColaborador" tabIndex="-1" aria-labelledby="excluirColaboradorLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-people-fill fs-3"></i>
                                    <h4 className='m-0 fs-4'>Colaboradores</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Excluir</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Você está prestes a excluir todos os dados do(a) colaborador(a) <b>{nomeParaExcluir}</b>, com matrícula <b>{matriculaParaExcluir}</b>. Esta ação não pode ser desfeita. Deseja prosseguir?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={excluirColaborador} data-bs-dismiss="modal">
                                <i className="bi bi-trash3-fill"></i>&ensp;Excluir
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Excluir Múltiplos Colaboradores */}
            <div className="modal fade" id="excluirSelecionadosModal" tabIndex="-1" aria-labelledby="excluirSelecionadosModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="excluirSelecionadosModalLabel">Excluir Colaboradores Selecionados</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Você está prestes a excluir os seguintes colaboradores: <b>{getSelectedColaboradoresNames()}</b>. Esta ação não pode ser desfeita. Deseja prosseguir?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={excluirSelecionados} data-bs-dismiss="modal">
                                <i className="bi bi-trash3-fill"></i>&ensp;Excluir Selecionados
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

const renderStatusIcon = (status) => {
    switch (status) {
        case 'Ativo':
            return <small><i className="bi bi-1-square" title='Status da conta: Ativa'></i></small>;
        case 'Inativo':
            return <small><i className="bi bi-0-square" title='Status da conta: Inativa'></i></small>;
        case 'Aguardando':
            return <small><i className="bi bi-question-square" title='Aguardando confirmação...'></i></small>;
        default:
            return null;
    }
};