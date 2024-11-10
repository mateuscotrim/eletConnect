import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../../../configs/axios';
import Header from '../../../components/header';
import showToast from '../../../utills/toasts';
import ModalMatricularAluno from './modals/matricularAluno';
import ModalDesmatricularAluno from './modals/desmatricularAluno';
import ModalEditarEletiva from './modals/editarEletiva';
import ModalExcluirEletiva from './modals/excluirEletiva';
import ChamadaComImpressao from './modals/listaChamada';
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
        const carregarDados = async () => {
            if (!codigoEletiva) {
                setCarregando(prev => ({ ...prev, geral: false }));
                return;
            }

            try {
                await buscarDetalhesEletiva();
                await listarAlunosMatriculados();
                if (user) {
                    await listarAlunosNaoMatriculados();
                }
            } catch (error) {
                showToast('danger', error.response?.data?.mensagem || 'Erro ao carregar dados da eletiva.');
            } finally {
                setCarregando(prev => ({ ...prev, geral: false }));
            }
        };

        carregarDados();
    }, []);

    useEffect(() => {
        listarAlunosNaoMatriculados();
    }, [mostrarOutrasTurmas]);

    const buscarDetalhesEletiva = async () => {
        try {
            const { data } = await axios.post('/eletivas/buscar', { instituicao: user.instituicao, codigo: codigoEletiva });
            if (data.length > 0) {
                const detalhes = data.find(e => e.codigo === codigoEletiva);
                if (detalhes) {
                    setEletiva(detalhes);

                }
            } else {
                showToast('warning', 'Detalhes da eletiva não encontrados.');
            }
        } catch (error) {
            console.error('Erro ao buscar detalhes da eletiva:', error);
            showToast('danger', error.response?.data?.mensagem || 'Erro ao buscar detalhes da eletiva.');
        }
    };

    const listarAlunosMatriculados = async () => {
        try {
            const { data } = await axios.post('/eletivas/listar-alunos-eletiva', { instituicao: user.instituicao, codigo: codigoEletiva });
            if (data.length > 0) {
                const alunosOrdenados = data.sort((a, b) => a.nome.localeCompare(b.nome));
                setAlunosMatriculados(alunosOrdenados);
                setAlunosMatriculadosOriginais(alunosOrdenados);
            }
        } catch (error) {
            console.error('Erro ao listar alunos da eletiva:', error);
            showToast('danger', error.response?.data?.mensagem || 'Erro ao listar alunos da eletiva.');
        }
    };

    const listarAlunosNaoMatriculados = async () => {
        try {
            setCarregando(prev => ({ ...prev, modal: true }));

            const { data: alunosNaoMatriculados } = await axios.post('/eletivas/listar-alunos-nao-matriculados', {
                instituicao: user.instituicao,
                codigoEletiva: codigoEletiva
            });

            if (alunosNaoMatriculados.length > 0) {
                let alunosDisponiveis = alunosNaoMatriculados;

                if (eletiva.exclusiva && !mostrarOutrasTurmas) {
                    if (eletiva.series && typeof eletiva.series === 'string') {
                        // Faz o parse da string JSON para um array
                        const seriesArray = JSON.parse(eletiva.series);

                        if (Array.isArray(seriesArray) && seriesArray.length > 0) {
                            // Filtra alunos que pertencem às séries exclusivas, considerando apenas o número da série
                            alunosDisponiveis = alunosDisponiveis.filter(aluno => {
                                const serieAluno = aluno.serie.split(' ')[0].trim().toLowerCase(); // Extrai apenas o número da série do aluno
                                return seriesArray.map(serie => serie.split(' ')[0].trim().toLowerCase()).includes(serieAluno);
                            });
                        }
                    } else if (eletiva.serie && eletiva.turma) {
                        // Mantém a lógica existente para filtrar por série e turma
                        alunosDisponiveis = alunosDisponiveis.filter(aluno =>
                            aluno.serie.split(' ')[0].trim().toLowerCase() === eletiva.serie.split(' ')[0].trim().toLowerCase() &&
                            aluno.turma.trim().toLowerCase() === eletiva.turma.trim().toLowerCase()
                        );
                    }
                }

                if (mostrarOutrasTurmas) {
                    alunosDisponiveis = alunosNaoMatriculados;
                }

                setTodosAlunos(alunosDisponiveis);
                setTodosAlunosOriginais(alunosDisponiveis);
            } 
        } catch (error) {
            console.error('Erro ao listar alunos não matriculados:', error);
            showToast('danger', error.response?.data?.mensagem || 'Erro ao listar alunos não matriculados.');
        } finally {
            setCarregando(prev => ({ ...prev, modal: false }));
        }
    };

    const filtrarLista = (termo, lista) => {
        if (!termo) return lista;
        const termoLower = termo.toLowerCase().replace(/º/g, ''); // Remove o símbolo 'º' do termo de busca

        return lista.filter(aluno => {
            const nomeMatch = aluno.nome.toLowerCase().includes(termoLower);
            const matriculaMatch = aluno.matricula.toLowerCase().includes(termoLower);

            // Normaliza a série e a turma, removendo o 'º'
            const serieTurmaAluno = `${aluno.serie} ${aluno.turma}`.toLowerCase().replace(/º/g, '');
            const serieTurmaMatch = serieTurmaAluno.includes(termoLower);

            return nomeMatch || matriculaMatch || serieTurmaMatch;
        }).sort((a, b) => a.nome.localeCompare(b.nome));
    };

    const filtrarAlunos = (e) => {
        const termo = e.target.value;
        setBusca(prev => ({ ...prev, termo }));
        setAlunosMatriculados(filtrarLista(termo, alunosMatriculadosOriginais));
    };

    const filtrarAlunosMatricula = (e) => {
        const termoMatricula = e.target.value;
        setBusca(prev => ({ ...prev, termoMatricula: termoMatricula }));
        setTodosAlunos(filtrarLista(termoMatricula, todosAlunosOriginais));
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
                                            <button className="btn btn-success" data-bs-toggle="modal" data-bs-target="#modalMatricularAluno" onClick={listarAlunosNaoMatriculados}>
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
                                    <div className="vr "></div>
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
                                                            <li><b>Total de Alunos:</b> {alunosMatriculados.length}/{eletiva.total_alunos || 'N/A'}</li>
                                                            {eletiva.exclusiva && (
                                                                <li>
                                                                    <b>Exclusividade: </b>
                                                                    {eletiva.series && typeof eletiva.series === 'string' && eletiva.series.trim() !== ''
                                                                        ? (() => {
                                                                            try {
                                                                                const seriesArray = JSON.parse(eletiva.series);
                                                                                return `${seriesArray.join(', ')}`;
                                                                            } catch (error) {
                                                                                return `${eletiva.series}`;
                                                                            }
                                                                        })()
                                                                        : (eletiva.serie && eletiva.turma) ? `${eletiva.serie} ${eletiva.turma}` : 'Não especificada'}
                                                                </li>
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

            <ModalMatricularAluno carregando={carregando} busca={busca} eletiva={eletiva} todosAlunos={todosAlunos} setTodosAlunos={setTodosAlunos} setTodosAlunosOriginais={setTodosAlunosOriginais} alunosMatriculados={alunosMatriculados} setAlunosMatriculados={setAlunosMatriculados} alunosSelecionados={alunosSelecionados} setAlunosSelecionados={setAlunosSelecionados} mostrarOutrasTurmas={mostrarOutrasTurmas} filtrarAlunosMatricula={filtrarAlunosMatricula} setMostrarOutrasTurmas={setMostrarOutrasTurmas} />

            <ModalDesmatricularAluno eletiva={eletiva} alunoSelecionado={alunoSelecionado} setAlunoSelecionado={setAlunoSelecionado} alunosMatriculados={alunosMatriculados} setAlunosMatriculados={setAlunosMatriculados} />

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
                                <h5 className="m-0">Lista de chamada</h5>
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

            <ModalEditarEletiva codigo={eletiva.codigo} instituicao={user.instituicao} />
            <ModalExcluirEletiva codigo={eletiva.codigo} tipo={eletiva.tipo} instituicao={user.instituicao} />

        </>
    );
}
