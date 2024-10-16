import React, { useState, useEffect } from 'react';
import { Tooltip } from 'bootstrap';
import axios from '../../../configs/axios';
import Header from '../../../components/header';
import showToast from '../../../utills/toasts';
import EditarAluno from './editarAluno';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function Alunos() {
    const [ordenacao, setOrdenacao] = useState({ coluna: '', ascendente: true });
    const [dados, setDados] = useState([]);
    const [alunos, setAlunos] = useState([]);
    const [alunoSelecionado, setAlunoSelecionado] = useState({ matricula: '', nome: '' });
    const [alunosSelecionados, setAlunosSelecionados] = useState([]);
    const [erros, setErros] = useState({});
    const [textoFiltro, setTextoFiltro] = useState('');
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [carregando, setCarregando] = useState(true);
    const [loading, setLoading] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const itensPorPagina = 10;
    const senhaPadrao = '76543210';
    const escola = JSON.parse(sessionStorage.getItem('escola'));

    useEffect(() => {
        carregarAlunosComEletivas();
    }, []);

    useEffect(() => {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map((tooltipTriggerEl) => new Tooltip(tooltipTriggerEl));
    }, [dados, erros]);

    const carregarAlunosComEletivas = async () => {
        setCarregando(true);
        try {
            const resposta = await axios.post('/eletivas/listar-todos-alunos', { instituicao: escola.cnpj });
            if (resposta.status === 200) {
                setAlunos(resposta.data);
            }
        } catch (error) {
            showToast('danger', error.response?.data.mensagem || 'Erro ao carregar as eletivas dos alunos!');
        } finally {
            setCarregando(false);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        lerArquivo(file);
    };

    const lerArquivo = async (file) => {
        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const headers = jsonData[0].map((header) => header.toString().trim().toLowerCase());
            const normalizedData = jsonData.slice(1).map((row) => {
                const normalizedRow = {};
                row.forEach((value, index) => { normalizedRow[headers[index]] = value; });
                return normalizedRow;
            });

            const errosValidacao = await verificarDados(normalizedData);
            setDados(normalizedData);
            setErros(errosValidacao);
            setLoading(false);
        };
        reader.readAsArrayBuffer(file);
    };

    const verificarDados = async (dados) => {
        try {
            const response = await axios.post('/estudantes/verificar-dados', { dados, instituicao: escola.cnpj });
            return response.data.erros || {};
        } catch (error) {
            showToast('danger', error.response?.data.mensagem || 'Erro ao validar os dados da planilha.');
            return {};
        }
    };

    const cadastrarPlanilha = async () => {
        setEnviando(true);
        try {
            const response = await axios.post('/estudantes/cadastrar-planilha', { dados, instituicao: escola.cnpj });
            if (response.status === 201) {
                showToast('success', response.data.mensagem);
                carregarAlunosComEletivas();
            }
        } catch (error) {
            showToast('danger', error.response?.data.mensagem || 'Erro ao cadastrar alunos.');
        } finally {
            setEnviando(false);
        }
    };

    const gerarPDF = () => {
        const doc = new jsPDF();

        // Definindo título e estilo
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Relatório de Erros de Validação', 105, 15, null, null, 'center');

        // Adicionando subtítulo com a data atual
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        doc.text(`Data: ${dataAtual}`, 200, 15, null, null, 'right');

        // Verifica se há erros
        if (erros && Object.keys(erros).length > 0) {
            let yPosition = 30; // Posição inicial no eixo Y
            const tableRows = [];
            const tableHeaders = ['Matrícula', 'Nome', 'Erros de Validação'];

            Object.entries(erros).forEach(([index, erro]) => {
                const aluno = dados[index] || {};
                const alunoInfo = aluno.matricula ? `Matrícula: ${aluno.matricula} - Nome: ${aluno.nome}` : 'Dados do aluno não encontrados';
                const errosTexto = Object.values(erro).join(', ');

                // Adiciona cada linha ao array de linhas da tabela
                tableRows.push([aluno.matricula || 'N/A', aluno.nome || 'N/A', errosTexto]);
            });

            // Adiciona tabela ao PDF usando autoTable
            doc.autoTable({
                head: [tableHeaders],
                body: tableRows,
                startY: yPosition,
                margin: { top: 30 },
                styles: { fontSize: 10, cellPadding: 5, overflow: 'linebreak' },
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [241, 241, 241] },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 50 },
                    2: { cellWidth: 100 },
                },
            });

            yPosition = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(12);
            doc.text(`Total de alunos com erros: ${Object.keys(erros).length}`, 14, yPosition);
        } else {
            doc.setFontSize(12);
            doc.text('Nenhum erro encontrado nos dados fornecidos.', 105, 30, null, null, 'center');
        }

        // Adiciona rodapé
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(`Página ${i} de ${pageCount}`, 105, 290, null, null, 'center');
        }

        // Salva o PDF
        doc.save('Relatorio_Erros_Validacao.pdf');
    };

    const cadastrarAluno = async (e) => {
        e.preventDefault();

        const { matricula, nome, serie, turma } = e.target;

        if (!matricula.value || !nome.value || !serie.value || !turma.value) {
            showToast('danger', 'Preencha todos os campos obrigatórios.');
            return;
        }

        if (alunos.some((aluno) => aluno.matricula === matricula.value)) {
            showToast('danger', 'Já existe um aluno com esta matrícula!');
            return;
        }

        try {
            const resposta = await axios.post('/estudantes/cadastrar', { instituicao: escola.cnpj, matricula: matricula.value, nome: nome.value, serie: serie.value, turma: turma.value, senha: senhaPadrao, });
            if (resposta.status === 201) {
                e.target.reset();
                showToast('success', resposta.data.mensagem);
                carregarAlunosComEletivas();
            }
        } catch (erro) {
            showToast('danger', erro.response?.data.mensagem || 'Erro ao cadastrar o aluno');
        }
    };

    const redefinirSenha = async (e) => {
        e.preventDefault();

        try {
            const resposta = await axios.post('/estudantes/redefinir-senha', { matricula: alunoSelecionado.matricula, senha: senhaPadrao });
            if (resposta.status === 200) {
                showToast('success', resposta.data.mensagem);
                carregarAlunosComEletivas();
            }
        } catch (error) {
            showToast('danger', error.response?.data.mensagem || 'Erro ao redefinir a senha do aluno.');
        }
    };

    const excluirAluno = async (e) => {
        e.preventDefault();
        try {
            const resposta = await axios.post('/estudantes/excluir', { matricula: alunoSelecionado.matricula });
            if (resposta.status === 200) {
                showToast('success', resposta.data.mensagem);
                carregarAlunosComEletivas();
            }
        } catch (error) {
            showToast('danger', error.response?.data.mensagem || 'Erro ao excluir o aluno.');
        }
    };

    const excluirSelecionados = async () => {
        try {
            const resposta = await axios.post('/estudantes/excluir-multiplos', { matriculas: alunosSelecionados, instituicao: escola.cnpj });
            if (resposta.status === 200) {
                showToast('success', resposta.data.mensagem);
                setAlunosSelecionados([]);
                carregarAlunosComEletivas();
            }
        } catch (erro) {
            showToast('danger', erro.response?.data.mensagem || 'Erro ao excluir alunos!');
        }
    };

    const alternarOrdenacao = (coluna) => {
        setOrdenacao((prevOrdenacao) => ({ coluna, ascendente: prevOrdenacao.coluna === coluna ? !prevOrdenacao.ascendente : true }));
        setPaginaAtual(1);
    };

    const compararValores = (a, b) => {
        const valorA = a[ordenacao.coluna] || '';
        const valorB = b[ordenacao.coluna] || '';
        const numA = Number(valorA);
        const numB = Number(valorB);

        if (!isNaN(numA) && !isNaN(numB)) {
            return ordenacao.ascendente ? numA - numB : numB - numA;
        }

        return ordenacao.ascendente ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
    };

    const alunosFiltradosEOrdenados = alunos
        .filter(({ nome, matricula }) => nome.toLowerCase().includes(textoFiltro.toLowerCase()) || matricula.toLowerCase().includes(textoFiltro.toLowerCase()))
        .sort((a, b) => compararValores(a, b));

    const totalPaginas = Math.ceil(alunosFiltradosEOrdenados.length / itensPorPagina);
    const alunosPaginados = alunosFiltradosEOrdenados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

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
        if (alunosFiltradosEOrdenados.length === 0) {
            return '0 - 0';
        }

        const inicio = (paginaAtual - 1) * itensPorPagina + 1;
        const fim = Math.min(paginaAtual * itensPorPagina, alunosFiltradosEOrdenados.length);
        return `${inicio} - ${fim}`;
    };

    return (
        <>
            <div id="toast-container" className="toast-container position-fixed bottom-0 end-0 p-3"></div>
            <Header />
            <main id='main-section'>
                <section id="section">
                    <div className="box">
                        <div className="title d-flex justify-content-between align-items-center">
                            <span className="d-flex align-items-center gap-2 text-black">
                                <i className="bi bi-person-arms-up fs-3"></i>
                                <h3 className="m-0 fs-4">Estudantes</h3>
                            </span>
                            {!carregando && (
                                <span className='d-flex align-items-center gap-2'>
                                    <button className='btn fw-normal text-secondary p-0' data-bs-toggle="modal" data-bs-target="#cadastrarLista">
                                        <i className="bi bi-file-earmark-arrow-up fs-4"></i>
                                    </button>
                                    <button className="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#cadastrarAluno">
                                        <i className="bi bi-person-add"></i>&ensp;Cadastrar
                                    </button>
                                    {alunosSelecionados.length > 0 && (
                                        <button className='btn btn-danger' data-bs-toggle="modal" data-bs-target="#excluirSelecionadosModal">
                                            <i className="bi bi-trash3-fill"></i>&ensp;Excluir alunos
                                        </button>
                                    )}
                                </span>
                            )}
                        </div>
                        <div className="p-4">
                            {carregando ? (
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
                                                <input type="text" className="form-control" placeholder="Buscar aluno... (Matricula ou Nome)" onChange={(e) => setTextoFiltro(e.target.value)} />
                                                <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-striped table-hover align-middle">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <span className='form-check m-0'>
                                                            <input className="form-check-input" type="checkbox" onChange={(e) => setAlunosSelecionados(e.target.checked ? alunosPaginados.map((aluno) => aluno.matricula) : [])} checked={alunosPaginados.length > 0 && alunosSelecionados.length === alunosPaginados.length} />
                                                        </span>
                                                    </th>
                                                    {['matricula', 'nome'].map((coluna) => (
                                                        <th key={coluna} onClick={() => alternarOrdenacao(coluna)} style={{ cursor: 'pointer' }}>
                                                            <span className="d-flex align-items-center gap-2">
                                                                {ordenacao.coluna === coluna ? (
                                                                    <i className={`bi bi-arrow-${ordenacao.asc ? 'down' : 'up'}`}></i>
                                                                ) : (
                                                                    <i className="bi bi-arrow-down-up"></i>
                                                                )}
                                                                <p className="m-0">{coluna.charAt(0).toUpperCase() + coluna.slice(1)}</p>
                                                            </span>
                                                        </th>
                                                    ))}
                                                    <th>Turma</th>
                                                    <th>Eletivas</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {alunosPaginados.length > 0 ? (
                                                    alunosPaginados.map((aluno) => (
                                                        <tr key={aluno.matricula}>
                                                            <td className='align-middle'>
                                                                <span className='form-check m-0'>
                                                                    <input className="form-check-input" type="checkbox" checked={alunosSelecionados.includes(aluno.matricula)} onChange={() => setAlunosSelecionados((prev) => prev.includes(aluno.matricula) ? prev.filter((mat) => mat !== aluno.matricula) : [...prev, aluno.matricula])} />
                                                                </span>
                                                            </td>
                                                            <td className='align-middle'>{aluno.matricula}</td>
                                                            <td className='align-middle'>{aluno.nome}</td>
                                                            <td className='align-middle'>{`${aluno.serie} ${aluno.turma}`}</td>
                                                            <td className='align-middle'>
                                                                {aluno.eletivas.length > 0 ? (
                                                                    aluno.eletivas.map((eletiva, index) => (
                                                                        <span key={index} className={`badge ${obterClasseBadge(eletiva.tipo)} me-1`}>
                                                                            {eletiva.nome}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <p className="m-0 text-muted">Nenhuma eletiva</p>
                                                                )}
                                                            </td>
                                                            <td className="d-flex justify-content-end gap-2">
                                                                <button className="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#redefinirSenha" onClick={() => setAlunoSelecionado(aluno)} >
                                                                    <i className="bi bi-key-fill"></i>&ensp;Redefinir Senha
                                                                </button>
                                                                <button className="btn btn-sm btn-success" data-bs-toggle="modal" data-bs-target="#editarAluno" onClick={() => setAlunoSelecionado(aluno)} >
                                                                    <i className="bi bi-pencil-fill"></i>&ensp;Editar
                                                                </button>
                                                                <button className="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#excluirAluno" onClick={() => setAlunoSelecionado(aluno)} >
                                                                    <i className="bi bi-trash3-fill"></i>&ensp;Excluir
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="7" className="text-center text-muted">Nenhum aluno cadastrado.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <nav aria-label="Page navigation example" className="d-flex align-items-center justify-content-between">
                                        <div className="text-center">Mostrando {obterIntervaloAtual()} de {alunosFiltradosEOrdenados.length} resultados</div>
                                        <ul className="pagination justify-content-end">
                                            <li className={`page-item ${paginaAtual === 1 ? 'disabled' : ''}`}>
                                                <button className="page-link" onClick={paginacaoAnterior}>&laquo; Anterior</button>
                                            </li>
                                            <li className={`page-item ${paginaAtual === 1 ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => setPaginaAtual(1)}>1</button>
                                            </li>
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

            {/* Modal: Cadastrar Aluno */}
            <div className="modal fade" id="cadastrarAluno" tabIndex="-1" aria-labelledby="cadastrarAlunoLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className="d-flex align-items-center gap-2">
                                    <i className="bi bi-person-arms-up fs-3"></i>
                                    <h4 className="m-0 fs-4">Estudantes</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Cadastrar</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={cadastrarAluno}>
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label htmlFor="matricula" className="form-label">Matrícula <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" id="matricula" name="matricula" required />
                                    </div>
                                    <div className="col-md-9">
                                        <label htmlFor="nome" className="form-label">Nome completo <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" id="nome" name="nome" required />
                                    </div>

                                    <div className='col-md-6'>
                                        <label htmlFor="serie" className="form-label">Série <span className="text-danger">*</span></label>
                                        <select className="form-select" id="serie" name="serie" required >
                                            <option value="">Selecione...</option>
                                            <option value="1º ano">1º ano</option>
                                            <option value="2º ano">2º ano</option>
                                            <option value="3º ano">3º ano</option>
                                        </select>
                                    </div>
                                    <div className='col-md-6'>
                                        <label htmlFor="turma" className="form-label">Turma <span className="text-danger">*</span></label>
                                        <select className="form-select" id="turma" name="turma" required >
                                            <option value="">Selecione...</option>
                                            {[...Array(26)].map((_, i) => {
                                                const turma = String.fromCharCode(65 + i); // 65 é o código ASCII para 'A'
                                                return (
                                                    <option key={turma} value={turma}>{turma}</option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close">Cancelar</button>
                                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal" aria-label="Close"><i className="bi bi-person-add"></i>&ensp;Cadastrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal: Cadastrar via planilha */}
            <div className="modal fade" id="cadastrarLista" tabIndex="-1" aria-labelledby="cadastrarListaLabel" aria-hidden="true">
                <div className={`modal-dialog ${loading || dados.length > 0 ? 'modal-dialog-scrollable modal-xl' : ''}`}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-person-arms-up fs-3"></i>
                                <h4 className="m-0 fs-4">Estudantes</h4>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Cadastrar via <span className='text-success text-decoration-underline'>Planilha</span></h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="container">
                                <input type="file" className="form-control" accept=".xls,.xlsx,.csv" onChange={handleFileUpload} />
                                <small className="form-text text-muted">Selecione um arquivo no formato .xls, .xlsx ou .csv</small>

                                {loading ? (
                                    <div className="text-center my-3">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Carregando...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {dados.length > 0 && (
                                            <>
                                                <div className='d-flex align-items-center gap-2 mt-4 '>
                                                    <i className="bi bi-eye h5 m-0"></i>
                                                    <h5 className='m-0'>Pré-visualização</h5>
                                                    <span className='separator mx-1'>|</span>
                                                    <p className='m-0 '><strong>{dados.length}</strong> aluno(s) encontrado(s)</p>
                                                </div>
                                                <div className='d-flex flex-wrap gap-2 align-items-center py-2'>
                                                    <p className={`m-0 p-1 d-flex align-items-center gap-1 ${dados.length - Object.keys(erros).length > 0 ? 'bg-success-subtle text-success' : ''}`}>
                                                        <i className="bi bi-check-circle me-1"></i><strong>{dados.length - Object.keys(erros).length}</strong> aluno(s) sem erros de validação.
                                                    </p>
                                                    <p className={`m-0 p-1 d-flex align-items-center gap-1 ${Object.keys(erros).length > 0 ? 'bg-danger-subtle text-danger' : ''}`}>
                                                        <i className="bi bi-exclamation-circle me-1"></i><strong>{Object.keys(erros).length}</strong> aluno(s) com erros de validação.
                                                    </p>
                                                </div>

                                                <div className="table-responsive">
                                                    <table className="table table-bordered table-hover mt-3">
                                                        <thead className="table-light">
                                                            <tr>
                                                                {Object.keys(dados[0]).map((key) => (
                                                                    <th key={key}>{key}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {dados.map((row, index) => (
                                                                <tr key={index}>
                                                                    {Object.entries(row).map(([campo, valor], i) => (
                                                                        <td key={i} className={erros[index] && erros[index][campo] ? 'table-danger' : ''} data-bs-toggle={erros[index] && erros[index][campo] ? 'tooltip' : ''} data-bs-placement="top" title={erros[index] && erros[index][campo] ? erros[index][campo] : ''} >
                                                                            {valor}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button className="btn btn-primary" disabled={dados.length === 0} data-bs-target="#confirmarCadastro" data-bs-toggle="modal">
                                <i className="bi bi-person-add"></i>&ensp;Cadastrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Confirmar Cadastro via Planilha */}
            <div className="modal fade" id="confirmarCadastro" tabIndex="-1" aria-labelledby="confirmarCadastroLabel" aria-hidden="true">
                <div className={`modal-dialog ${erros && Object.keys(erros).length > 0 ? 'modal-lg modal-dialog-scrollable' : ''}`}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-person-arms-up fs-3"></i>
                                <h4 className="m-0 fs-4">Estudantes</h4>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Confirmar Cadastro</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {erros && Object.keys(erros).length > 0 ? (
                                <>
                                    <p>Foram encontrados <strong>{Object.keys(erros).length}</strong> alunos com erros de validação. Deseja ignorar esses alunos e prosseguir com o cadastro?</p>
                                    <div className="alert alert-danger" role="alert">
                                        <strong>Alunos com erros:</strong>
                                        <ul className="m-0 mt-2">
                                            {Object.entries(erros).map(([index, erro]) => (
                                                <li key={index}>
                                                    <strong>Matrícula:</strong> {dados[index]?.matricula || 'N/A'} -
                                                    <strong> Erros:</strong> {Object.values(erro).join(', ')}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <p>Todos os dados foram validados corretamente. Deseja prosseguir com o cadastro?</p>
                            )}
                        </div>
                        <div className={`modal-footer ${erros && Object.keys(erros).length > 0 ? 'd-flex justify-content-between' : ''} `}>
                            {erros && Object.keys(erros).length ? (
                                <button type="button" className="btn btn-danger" onClick={gerarPDF}>
                                    <i className="bi bi-file-arrow-down"></i>&ensp;Baixar PDF
                                </button>
                            ) : null}

                            <span className='d-flex gap-2'>
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close">Cancelar</button>
                                <button className="btn btn-primary" data-bs-dismiss="modal" onClick={cadastrarPlanilha}>
                                    <i className="bi bi-person-add"></i>&ensp;Cadastrar
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Redefinir Senha */}
            <div className="modal fade" id="redefinirSenha" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className="d-flex align-items-center gap-2">
                                    <i className="bi bi-person-arms-up fs-3"></i>
                                    <h4 className="m-0 fs-4">Estudantes</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Redefinir senha</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={redefinirSenha}>
                            <div className="modal-body">
                                <p>Você está prestes a redefinir a senha do(a) aluno(a) <b>{alunoSelecionado.nome}</b>, com matrícula <b>{alunoSelecionado.matricula}</b>. Esta ação não pode ser desfeita. Deseja prosseguir?<br />Senha padrão: <b>{senhaPadrao}</b></p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal"><i className="bi bi-key-fill"></i>&ensp;Redefinir</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal: Editar Aluno */}
            <div className="modal fade" id="editarAluno" tabIndex="-1" aria-labelledby="editarAlunoLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className="d-flex align-items-center gap-2">
                                    <i className="bi bi-person-arms-up fs-3"></i>
                                    <h3 className="m-0 fs-4">Estudantes</h3>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h4 className="m-0">Editar</h4>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <EditarAluno matricula={alunoSelecionado.matricula} />
                    </div>
                </div>
            </div>

            {/* Modal: Excluir Aluno */}
            <div className="modal fade" id="excluirAluno" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className="d-flex align-items-center gap-2">
                                    <i className="bi bi-person-arms-up fs-3"></i>
                                    <h4 className="m-0 fs-4">Estudantes</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Excluir</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={excluirAluno}>
                            <div className="modal-body">
                                <p>Você está prestes a excluir todos os dados do(a) aluno(a) <b>{alunoSelecionado.nome}</b>, com matrícula <b>{alunoSelecionado.matricula}</b>. Esta ação não pode ser desfeita. Deseja prosseguir?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-danger" data-bs-dismiss="modal"><i className="bi bi-trash3-fill"></i>&ensp;Excluir</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal: Confirmar exclusão dos alunos selecionados */}
            <div className="modal fade" id="excluirSelecionadosModal" tabIndex="-1" aria-labelledby="excluirSelecionadosModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="excluirSelecionadosModalLabel">Excluir Alunos Selecionados</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Você está prestes a excluir os seguintes alunos:</p>
                            <ul>
                                {alunosSelecionados.map((matricula) => {
                                    const aluno = alunos.find((aluno) => aluno.matricula === matricula);
                                    return <li key={matricula}>{aluno?.nome || 'Nome não encontrado'} (Matrícula: {matricula})</li>;
                                })}
                            </ul>
                            <p>Esta ação não pode ser desfeita. Deseja continuar?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={excluirSelecionados} data-bs-dismiss="modal">Excluir</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

const obterClasseBadge = (tipo) => {
    const classes = {
        'Trilha': 'text-bg-primary',
        'Eletiva': 'text-bg-success',
        'Projeto de Vida': 'text-bg-danger',
        'default': 'text-bg-secondary',
    };
    return classes[tipo] || classes['default'];
};
