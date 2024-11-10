import React, { useState, useEffect } from 'react';
import axios from '../../../../configs/axios';
import Header from '../../../../components/header';
import showToast from '../../../../utills/toasts';
import CadastrarColaboradorModal from './modals/cadastrarColaborador';
import EditarColaboradorModal from './modals/editarColaborador';
import ExcluirColaboradorModal from './modals/excluirColaborador';
import ExcluirSelecionadosModal from './modals/excluirSelecionados';

export default function Colaboradores() {
    const [sortBy, setSortBy] = useState({ column: '', asc: true });
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState([]);
    const [selectedColaboradores, setSelectedColaboradores] = useState([]);
    const [matriculaParaEditar, setMatriculaParaEditar] = useState('');
    const [matriculaParaExcluir, setMatriculaParaExcluir] = useState('');
    const [nomeParaExcluir, setNomeParaExcluir] = useState('');
    const [carregando, setCarregando] = useState(false);
    const itemsPerPage = 10;
    const user = JSON.parse(sessionStorage.getItem('user'));
    const escola = JSON.parse(sessionStorage.getItem('escola'));

    useEffect(() => {
        listarColaboradores();

        // Verificar se há uma mensagem de sucesso no sessionStorage e exibi-la
        const mensagemSucesso = sessionStorage.getItem('mensagemSucesso');
        if (mensagemSucesso) {
            showToast('success', mensagemSucesso);  // Exibe o toast com a mensagem de sucesso
            sessionStorage.removeItem('mensagemSucesso');  // Remove a mensagem após exibir
        }
    }, []);

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
            showToast('danger', error.response?.data?.mensagem || 'Erro ao buscar colaboradores.');
            setData([]);
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
        return isNumeric(aValue) && isNumeric(bValue)
            ? (asc ? aValue - bValue : bValue - aValue)
            : asc
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
    };

    const isNumeric = (value) => !isNaN(value) && !isNaN(parseFloat(value));

    const handleInputChange = (e) => {
        setFilterText(e.target.value);
        setCurrentPage(1);
    };

    const filteredAndSortedData = Array.isArray(data)
        ? data
            .filter((item) =>
                [item.nome, item.matricula, item.cargo]
                    .map((val) => val.toLowerCase())
                    .some((val) => val.includes(filterText.toLowerCase()))
            )
            .sort((a, b) => compareValues(a, b, sortBy.asc))
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
            <div id='toast-container' className="toast-container position-absolute bottom-0 end-0 m-2"></div>
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
                                            <i className="bi bi-trash3-fill"></i>&ensp;Excluir selecionados
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
                                                <input type="text" className="form-control" placeholder="Buscar colaborador... (Matrícula ou Nome)" onChange={handleInputChange} />
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

            {/* Modais */}
            <CadastrarColaboradorModal listarColaboradores={listarColaboradores} instituicao={escola.cnpj} />
            <EditarColaboradorModal matricula={matriculaParaEditar} listarColaboradores={listarColaboradores} instituicao={escola.cnpj} />
            <ExcluirColaboradorModal nome={nomeParaExcluir} matricula={matriculaParaExcluir} listarColaboradores={listarColaboradores} instituicao={escola.cnpj} />
            <ExcluirSelecionadosModal selectedColaboradores={selectedColaboradores} getSelectedColaboradoresNames={getSelectedColaboradoresNames} listarColaboradores={listarColaboradores} instituicao={escola.cnpj} />
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
