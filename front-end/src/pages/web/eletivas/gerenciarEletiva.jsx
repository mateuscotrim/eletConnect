import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../../../configs/axios';
import Header from '../../../components/header';
import showToast from '../../../utills/toasts';
import EditarEletiva from './editarEletiva';
import ChamadaComImpressao from './listaChamada';
import '../../../assets/styles/my-bootstrap.css';

export default function GerenciarEletiva() {
    const [searchParams] = useSearchParams();
    const codigoEletiva = searchParams.get('code');
    const user = JSON.parse(sessionStorage.getItem('user'));
    const navigate = useNavigate();

    const [carregando, setCarregando] = useState({ geral: true, modal: false });
    const [eletiva, setEletiva] = useState({});
    const [alunosMatriculados, setAlunosMatriculados] = useState([]);
    const [todosAlunos, setTodosAlunos] = useState([]);
    const [alunosMatriculadosOriginais, setAlunosMatriculadosOriginais] = useState([]);
    const [todosAlunosOriginais, setTodosAlunosOriginais] = useState([]);
    const [busca, setBusca] = useState({ termo: '', termoMatricula: '' });
    const [alunoSelecionado, setAlunoSelecionado] = useState({ matricula: '', nome: '' });
    const [alunosSelecionados, setAlunosSelecionados] = useState([]);
    const [mostrarOutrasTurmas, setMostrarOutrasTurmas] = useState(false);

    useEffect(() => {
        if (!codigoEletiva) {
            showToast('warning', 'Código da eletiva não encontrado.');
            setCarregando(prev => ({ ...prev, geral: false }));
            return;
        }

        const carregarDadosEletiva = async () => {
            try {
                await buscarDetalhesEletiva();
                await listarAlunosMatriculados();
            } catch (error) {
                showToast('danger', error.response?.data?.mensagem || 'Erro ao carregar dados da eletiva.');
            } finally {
                setCarregando(prev => ({ ...prev, geral: false }));
            }
        };

        carregarDadosEletiva();
    }, [codigoEletiva]);

    useEffect(() => {
        if (user && eletiva) {
            listarTodosAlunos();
        }
    }, [mostrarOutrasTurmas, eletiva]);

    const buscarDetalhesEletiva = async () => {
        try {
            const { data } = await axios.post('/eletivas/buscar', { instituicao: user.instituicao, codigo: codigoEletiva });
            const detalhes = data.find(e => e.codigo === codigoEletiva);
            if (detalhes) {
                setEletiva(detalhes);
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao buscar detalhes da eletiva.');
        }
    };

    const listarAlunosMatriculados = async () => {
        try {
            const { data } = await axios.post('/eletivas/listar-alunos-eletiva', { instituicao: user.instituicao, codigo: codigoEletiva });
            const alunosOrdenados = (data || []).sort((a, b) => a.nome.localeCompare(b.nome));
            setAlunosMatriculados(alunosOrdenados);
            setAlunosMatriculadosOriginais(alunosOrdenados);
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao listar alunos da eletiva.');
        }
    };

    const listarTodosAlunos = async () => {
        try {
            setCarregando(prev => ({ ...prev, modal: true }));
            const { data } = await axios.post('/estudantes/listar', { instituicao: user.instituicao });

            if (data?.alunosData) {
                let alunosDisponiveis = data.alunosData.filter(aluno => !alunosMatriculados.some(a => a.matricula === aluno.matricula));

                if (eletiva.exclusiva && !mostrarOutrasTurmas) {
                    alunosDisponiveis = alunosDisponiveis.filter(aluno => aluno.serie === eletiva.serie && aluno.turma === eletiva.turma);
                }

                alunosDisponiveis.sort((a, b) => a.nome.localeCompare(b.nome));
                setTodosAlunos(alunosDisponiveis);
                setTodosAlunosOriginais(alunosDisponiveis);
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao listar alunos disponíveis.');
        } finally {
            setCarregando(prev => ({ ...prev, modal: false }));
        }
    };

    const filtrarAlunos = (e) => {
        const termo = e.target.value.toLowerCase();
        setBusca(prev => ({ ...prev, termo }));

        if (termo === '') {
            setAlunosMatriculados(alunosMatriculadosOriginais);
        } else {
            const alunosFiltrados = alunosMatriculadosOriginais.filter(aluno =>
                aluno.nome.toLowerCase().includes(termo) ||
                aluno.matricula.toLowerCase().includes(termo)
            );
            alunosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));
            setAlunosMatriculados(alunosFiltrados);
        }
    };

    const filtrarAlunosMatricula = (e) => {
        const termoMatricula = e.target.value.toLowerCase();
        setBusca(prev => ({ ...prev, termoMatricula }));

        if (termoMatricula === '') {
            setTodosAlunos(todosAlunosOriginais);
        } else {
            const alunosFiltrados = todosAlunosOriginais.filter(aluno =>
                aluno.nome.toLowerCase().includes(termoMatricula) ||
                aluno.matricula.toLowerCase().includes(termoMatricula)
            );
            alunosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));
            setTodosAlunos(alunosFiltrados);
        }
    };

    const handleSelecaoAluno = (matricula) => {
        setAlunosSelecionados(prev => prev.includes(matricula) ? prev.filter(m => m !== matricula) : [...prev, matricula]);
    };

    const matricularAlunos = async () => {
        if (!user || alunosSelecionados.length === 0) {
            showToast('warning', 'É necessário selecionar pelo menos um aluno.');
            return;
        }

        try {
            const resposta = await axios.post('/eletivas/matricular-multiplos', {
                instituicao: user.instituicao,
                codigo: codigoEletiva,
                matriculas: alunosSelecionados,
                tipo: eletiva.tipo
            });

            if (resposta.status === 201) {
                showToast('success', `${alunosSelecionados.length} aluno(s) foram matriculados com sucesso.`);
                const novosAlunos = todosAlunos.filter(aluno => alunosSelecionados.includes(aluno.matricula));
                setAlunosMatriculados(prev => [...prev, ...novosAlunos]);
                setTodosAlunos(prev => prev.filter(aluno => !alunosSelecionados.includes(aluno.matricula)));
                setAlunosSelecionados([]);
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao matricular alunos.');
        }
    };

    const desmatricularAluno = async () => {
        if (!user || !alunoSelecionado.matricula) return;

        try {
            const resposta = await axios.post('/eletivas/desmatricular-aluno', {
                instituicao: user.instituicao,
                codigo: codigoEletiva,
                matricula: alunoSelecionado.matricula,
                tipo: eletiva.tipo
            });
            if (resposta.status === 200) {
                showToast('success', `O(a) aluno(a) <b>${alunoSelecionado.nome}</b> foi removido(a) da eletiva.`);
                setAlunosMatriculados(prev => prev.filter(a => a.matricula !== alunoSelecionado.matricula));
                setAlunoSelecionado({ matricula: '', nome: '' });
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao desmatricular aluno.');
        }
    };

    const excluirEletiva = async (e) => {
        e.preventDefault();
        try {
            const resposta = await axios.post('/eletivas/excluir', { codigo: codigoEletiva, instituicao: user.instituicao, tipo: eletiva.tipo });
            if (resposta.status === 200) {
                showToast('success', 'Eletiva excluída com sucesso!');
                setTimeout(() => navigate('/electives'), 2000);
            }
        } catch (error) {
            showToast('danger', error.response.data.mensagem);
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
                                <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                <h4 className='m-0 fs-4'>Eletivas</h4>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Gerenciar</h5>
                            </div>
                            {!carregando.geral && (
                                <div className='d-flex gap-2'>
                                    <Link to={"/electives"} className='btn btn-outline-secondary'>
                                        <i className="bi bi-arrow-return-left"></i>&ensp;Voltar
                                    </Link>
                                    <button className='btn btn-outline-secondary' data-bs-toggle="modal" data-bs-target="#gerarLista">
                                        <i className="bi bi-file-earmark-ruled"></i>&ensp;Gerar lista
                                    </button>
                                    <button className='btn btn-outline-success' data-bs-toggle="modal" data-bs-target="#editarEletiva">
                                        <i className="bi bi-pencil-fill"></i>&ensp;Editar
                                    </button>
                                    <button className='btn btn-outline-danger' data-bs-toggle="modal" data-bs-target="#excluirEletiva">
                                        <i className="bi bi-trash-fill"></i>&ensp;Excluir
                                    </button>
                                </div>
                            )}
                        </div>

                        {carregando.geral ? (
                            <div className="d-flex justify-content-center pt-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Carregando...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className='d-flex' style={{ height: "calc(100% - 4em)" }}>
                                    <div className="box-alunos w-50 p-4">
                                        <div className="d-flex justify-content-center align-items-center mb-4 gap-4">
                                            <div className='position-relative w-75'>
                                                <input type="text" placeholder="Buscar aluno... (Matricula ou Nome)" className="form-control" value={busca.termo} onChange={filtrarAlunos} />
                                                <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
                                            </div>
                                            <button className="btn btn-success" data-bs-toggle="modal" data-bs-target="#modalMatricularAluno" onClick={listarTodosAlunos}>
                                                <i className="bi bi-person-plus"></i>&ensp;Matricular
                                            </button>
                                        </div>
                                        {alunosMatriculados.length > 0 ? (
                                            <div id='tb-elet' className='table-responsive' style={{ height: `calc(100% - 4em)` }}>
                                                <table className="table table-hover table-sm align-middle">
                                                    <thead>
                                                        <tr>
                                                            <th>Matricula</th>
                                                            <th colSpan={2}>Nome</th>
                                                            <th>Série / Turma</th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {alunosMatriculados.map(aluno => (
                                                            <tr key={aluno.matricula}>
                                                                <td className='align-middle'>{aluno.matricula}</td>
                                                                <td className='align-middle' colSpan={2}>{aluno.nome}</td>
                                                                <td className='align-middle'>{aluno.serie} {aluno.turma}</td>
                                                                <td className="text-end">
                                                                    <button className="btn btn-sm btn-outline-danger" data-bs-toggle="modal" data-bs-target="#desmatricularAluno" onClick={() => setAlunoSelecionado(aluno)}>
                                                                        <i className="bi bi-person-dash-fill"></i>&ensp;Desmatricular
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-center m-0 mt-2 text-danger fw-bold">Nenhum aluno matriculado encontrado.</p>
                                        )}
                                    </div>
                                    <div className="vr"></div>
                                    <div className="box-gerenciamento w-50 px-4">
                                        <div className="p-4 my-4 shadow-sm border-left-primary bg-light-subtle">
                                            <div className="card-body">
                                                <h5 className="fw-bold text-primary">Detalhes da Eletiva</h5>
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <h6 className="text-secondary">Informações Gerais</h6>
                                                        <ul className="list-unstyled">
                                                            <li><b>Nome:</b> {eletiva.nome}</li>
                                                            <li><b>Descrição:</b> {eletiva.descricao}</li>
                                                            <li><b>Tipo:</b> {eletiva.tipo}</li>
                                                        </ul>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <h6 className="text-secondary">Professor e Sala</h6>
                                                        <ul className="list-unstyled">
                                                            <li><b>Professor:</b> {eletiva.professor}</li>
                                                            <li><b>Sala:</b> {eletiva.sala}</li>
                                                        </ul>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <h6 className="text-secondary">Horário e Dia</h6>
                                                        <ul className="list-unstyled">
                                                            <li><b>Dia:</b> {eletiva.dia}</li>
                                                            <li><b>Horário:</b> {eletiva.horario}</li>
                                                        </ul>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <h6 className="text-secondary">Alunos</h6>
                                                        <ul className="list-unstyled">
                                                            <li><b>Total de Alunos:</b> {alunosMatriculados.length}/{eletiva.total_alunos}</li>
                                                            {eletiva.exclusiva && eletiva.serie && eletiva.turma && (
                                                                <li><b>Exclusiva para:</b> {eletiva.serie} {eletiva.turma}</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </main>

            {/* Modal Matricular Aluno - Ajustado para selecionar múltiplos alunos */}
            <div className="modal fade" id="modalMatricularAluno" tabIndex="-1" aria-labelledby="modalMatricularAlunoLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                    <h4 className='m-0 fs-4'>Eletivas</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Matricular</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {carregando.modal ? (
                                <div className="d-flex justify-content-center pt-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Carregando...</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className='position-relative'>
                                        <input type="text" className="form-control" placeholder="Buscar aluno... (Matricula ou Nome)" value={busca.termoMatricula} onChange={filtrarAlunosMatricula} />
                                        <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
                                    </div>
                                    {eletiva.exclusiva && (
                                        <div className="form-check form-switch">
                                            <input className="form-check-input" type="checkbox" role="switch" id="toggleExibirOutrasTurmas" checked={mostrarOutrasTurmas} onChange={(e) => setMostrarOutrasTurmas(e.target.checked)} />
                                            <label className="form-check-label" htmlFor="toggleExibirOutrasTurmas">Mostrar alunos de outras turmas.</label>
                                        </div>
                                    )}
                                    {todosAlunos.length > 0 ? (
                                        <table className="table table-hover mt-4">
                                            <thead>
                                                <tr>
                                                    <th></th>
                                                    <th>Matrícula</th>
                                                    <th>Nome</th>
                                                    <th>Série / Turma</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {todosAlunos.map(aluno => (
                                                    <tr key={aluno.matricula}>
                                                        <td className='align-middle'>
                                                            <input
                                                                type="checkbox"
                                                                name="aluno"
                                                                id={aluno.matricula}
                                                                value={aluno.matricula}
                                                                onChange={() => handleSelecaoAluno(aluno.matricula)}
                                                                checked={alunosSelecionados.includes(aluno.matricula)}
                                                            />
                                                        </td>
                                                        <td className='align-middle'>{aluno.matricula}</td>
                                                        <td className='align-middle'>{aluno.nome}</td>
                                                        <td className='align-middle'>{aluno.serie} {aluno.turma}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-center m-0 mt-2 text-danger fw-bold">Nenhum aluno disponível para matrícula.</p>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-success" data-bs-dismiss="modal" onClick={matricularAlunos} >
                                <i className="bi bi-person-plus"></i>&ensp;Matricular Selecionados
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Confirmação de Desmatrícula */}
            <div className="modal fade" id="desmatricularAluno" tabIndex="-1" role="dialog">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                    <h4 className='m-0 fs-4'>Eletivas</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Desmatricular</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Tem certeza que deseja desmatricular o aluno {alunoSelecionado?.nome}?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={desmatricularAluno} >
                                <i className="bi bi-person-dash-fill"></i>&ensp;Desmatricular
                            </button>
                        </div>
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
                        <EditarEletiva codigo={codigoEletiva} />
                    </div>
                </div>
            </div>

            {/* Modal: Gerar lista de chamada */}
            <div className="modal fade" id="gerarLista" tabIndex="-1" aria-labelledby="gerarListaLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                    <h4 className='m-0 fs-4'>Eletivas</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Gerar lista de chamada</h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {/* Componente ListaChamada Renderizado dentro do Modal */}
                            <ChamadaComImpressao />
                        </div>
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
                                <p>Tem certeza de que deseja excluir a eletiva <b>{eletiva.nome}</b> Esta ação não poderá ser desfeita e todos os dados relacionados a esta eletiva serão <u>permanentemente</u> removidos.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type='submit' className='btn btn-danger' data-bs-dismiss="modal"><i className="bi bi-trash3-fill"></i>&ensp;Excluir</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}