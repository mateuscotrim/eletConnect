import React, { useState, useEffect } from 'react';
import axios from '../../../configs/axios';
import Header from '../../../components/header';
import showToast from '../../../utills/toasts';

import CadastrarAluno from './modals/cadastrarAluno';
import RedefinirSenha from './modals/redefinirSenha';
import EditarAluno from './modals/editarAluno';
import ExcluirAluno from './modals/excluirAluno';
import ExcluirSelecionados from './modals/excluirSelecionados';
import CadastrarPlanilha from './modals/cadastrarPlanilha';


export default function Alunos() {
    const [alunos, setAlunos] = useState([]);
    const [alunoSelecionado, setAlunoSelecionado] = useState(null);
    const [alunosSelecionados, setAlunosSelecionados] = useState([]);
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [textoFiltro, setTextoFiltro] = useState('');
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [ordenacao, setOrdenacao] = useState({ coluna: '', ascendente: true });

    const itensPorPagina = 10;
    const escola = JSON.parse(sessionStorage.getItem('escola'));

    useEffect(() => {
        carregarAlunos();
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

    const carregarAlunos = async () => {
        setCarregando(true);
        try {
            const resposta = await axios.post('/estudantes/listar-alunos', { instituicao: escola.cnpj });
            if (resposta.status === 200) {
                setAlunos(resposta.data);
            }
        } catch (error) {
            showToast('danger', error.response?.data.mensagem || 'Erro ao carregar os alunos.');
        } finally {
            setCarregando(false);
        }
    };

    const alternarOrdenacao = (coluna) => {
        setOrdenacao((prevState) => ({
            coluna,
            ascendente: prevState.coluna === coluna ? !prevState.ascendente : true,
        }));
        setPaginaAtual(1); // Reiniciar para a primeira página após alterar a ordenação
    };

    const compararValores = (a, b) => {
        const valorA = a[ordenacao.coluna] || '';
        const valorB = b[ordenacao.coluna] || '';
        const numA = Number(valorA);
        const numB = Number(valorB);

        // Comparar como número se possível, caso contrário comparar como string
        if (!isNaN(numA) && !isNaN(numB)) {
            return ordenacao.ascendente ? numA - numB : numB - numA;
        }

        return ordenacao.ascendente ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
    };

    // Filtro e ordenação dos alunos
    const alunosFiltradosEOrdenados = alunos
        .filter(({ nome, matricula }) =>
            nome.toLowerCase().includes(textoFiltro.toLowerCase()) ||
            matricula.toLowerCase().includes(textoFiltro.toLowerCase())
        )
        .sort((a, b) => compararValores(a, b));


    // Paginação
    const totalPaginas = Math.ceil(alunosFiltradosEOrdenados.length / itensPorPagina);
    const alunosPaginados = alunosFiltradosEOrdenados.slice(
        (paginaAtual - 1) * itensPorPagina,
        paginaAtual * itensPorPagina
    );

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

    // Manipular a seleção/deseleção de um aluno
    const toggleSelecionarAluno = (matricula) => {
        setAlunosSelecionados((prevSelecionados) =>
            prevSelecionados.includes(matricula)
                ? prevSelecionados.filter((id) => id !== matricula)
                : [...prevSelecionados, matricula]
        );
    };

    // Selecionar ou desmarcar todos os alunos da página atual
    const toggleSelecionarTodos = (selecionar) => {
        const matriculasPaginaAtual = alunosPaginados.map((aluno) => aluno.matricula);
        if (selecionar) {
            setAlunosSelecionados((prevSelecionados) => [
                ...prevSelecionados,
                ...matriculasPaginaAtual.filter((mat) => !prevSelecionados.includes(mat)),
            ]);
        } else {
            setAlunosSelecionados((prevSelecionados) =>
                prevSelecionados.filter((mat) => !matriculasPaginaAtual.includes(mat))
            );
        }
    };

    // Renderizar a lista de alunos
    const renderAlunos = () => {
        if (alunosPaginados.length === 0) {
            return (
                <tr>
                    <td colSpan="6" className="text-center text-muted">
                        Nenhum aluno encontrado.
                    </td>
                </tr>
            );
        }

        return alunosPaginados.map((aluno) => (
            <tr key={aluno.matricula}>
                <td className='align-middle'> 
                    <input type="checkbox" checked={alunosSelecionados.includes(aluno.matricula)} onChange={() => toggleSelecionarAluno(aluno.matricula)} />
                </td>
                <td className='align-middle'>{aluno.matricula}</td>
                <td className='align-middle'>{aluno.nome}</td>
                <td className='align-middle'>{`${aluno.serie} ${aluno.turma}`}</td>
                <td className='align-middle'>
                    {aluno.eletivas && aluno.eletivas.length > 0 ? (
                        aluno.eletivas.map((eletiva, index) => (
                            <span key={`${aluno.matricula}-${index}`} className={`badge ${obterClasseBadge(eletiva.tipo)} me-1`}>
                                {eletiva.nome}
                            </span>
                        ))
                    ) : (
                        <p className="m-0 text-muted">Nenhuma eletiva</p>
                    )}
                </td>
                <td className="d-flex justify-content-end gap-2">
                    <button className="btn btn-sm btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#redefinirSenha"
                        onClick={() => setAlunoSelecionado(aluno)}>
                        <i className="bi bi-key-fill"></i>&ensp;Redefinir Senha
                    </button>

                    <button className="btn btn-sm btn-success"
                        data-bs-toggle="modal"
                        data-bs-target="#editarAluno"
                        onClick={() => setAlunoSelecionado(aluno)}>
                        <i className="bi bi-pencil-fill"></i>&ensp;Editar
                    </button>

                    <button className="btn btn-sm btn-danger"
                        data-bs-toggle="modal"
                        data-bs-target="#excluirAluno"
                        onClick={() => setAlunoSelecionado(aluno)}>
                        <i className="bi bi-trash3-fill"></i>&ensp;Excluir
                    </button>
                </td>
            </tr>
        ));
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-absolute bottom-0 end-0 m-2"></div>
            <Header />
            <main id="main-section">
                <section id="section">
                    <div className="box">
                        <div className="title d-flex justify-content-between align-items-center">
                            <span className="d-flex align-items-center gap-2 text-black">
                                <i className="bi bi-person-arms-up fs-3"></i>
                                <h3 className="m-0 fs-4">Estudantes</h3>
                            </span>
                            {!carregando && (
                                <span className="d-flex align-items-center gap-2">
                                    <button className="btn p-0" data-bs-toggle="modal" data-bs-target="#cadastrarLista">
                                        <i className="bi bi-file-earmark-arrow-up fs-4"></i>
                                    </button>
                                    <button className="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#cadastrarAluno">
                                        <i className="bi bi-person-add"></i>&ensp;Cadastrar
                                    </button>
                                    {alunosSelecionados.length > 0 && (
                                        <button
                                            className="btn btn-danger"
                                            data-bs-toggle="modal"
                                            data-bs-target="#excluirSelecionadosModal"
                                        >
                                            <i className="bi bi-trash3-fill"></i>&ensp;Excluir Selecionados
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
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Buscar aluno... (Matrícula ou Nome)"
                                                    onChange={(e) => {
                                                        setTextoFiltro(e.target.value);
                                                        setPaginaAtual(1);
                                                    }}
                                                />
                                                <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-striped table-hover align-middle">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <input
                                                            type="checkbox"
                                                            onChange={(e) => toggleSelecionarTodos(e.target.checked)}
                                                            checked={
                                                                alunosPaginados.length > 0 &&
                                                                alunosPaginados.every((aluno) => alunosSelecionados.includes(aluno.matricula))
                                                            }
                                                        />
                                                    </th>
                                                    {['matricula', 'nome'].map((coluna) => (
                                                        <th
                                                            key={coluna}
                                                            onClick={() => alternarOrdenacao(coluna)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <span className="d-flex align-items-center gap-2">
                                                                {ordenacao.coluna === coluna ? (
                                                                    <i className={`bi bi-arrow-${ordenacao.ascendente ? 'down' : 'up'}`}></i>
                                                                ) : (
                                                                    <i className="bi bi-arrow-down-up"></i>
                                                                )}
                                                                <p className="m-0">
                                                                    {coluna.charAt(0).toUpperCase() + coluna.slice(1)}
                                                                </p>
                                                            </span>
                                                        </th>
                                                    ))}
                                                    <th>Turma</th>
                                                    <th>Eletivas</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>{renderAlunos()}</tbody>
                                        </table>
                                    </div>
                                    <nav aria-label="Page navigation example" className="d-flex align-items-center justify-content-between">
                                        <div className="text-center">
                                            Mostrando {obterIntervaloAtual()} de {alunosFiltradosEOrdenados.length} resultados
                                        </div>
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

            {/* Modais */}
            <CadastrarAluno escola={escola} />
            <CadastrarPlanilha escola={escola} />

            <RedefinirSenha alunoSelecionado={alunoSelecionado} />

            <EditarAluno alunoSelecionado={alunoSelecionado} escola={escola} />

            <ExcluirAluno alunoSelecionado={alunoSelecionado} escola={escola} />

            {alunosSelecionados.length > 0 && (
                <ExcluirSelecionados alunosSelecionados={alunosSelecionados} alunos={alunos} escola={escola} setAlunosSelecionados={setAlunosSelecionados} />
            )}
        </>
    );
}

// Função para obter a classe CSS do badge de acordo com o tipo
const obterClasseBadge = (tipo) => {
    const classes = {
        'Trilha': 'text-bg-primary',
        'Eletiva': 'text-bg-success',
        'Projeto de Vida': 'text-bg-danger',
        'default': 'text-bg-secondary',
    };
    return classes[tipo] || classes['default'];
};
