import React, { useState } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';

export default function ModalMatricularAluno({
    carregando,
    busca,
    eletiva,
    todosAlunos,
    setTodosAlunos,
    setTodosAlunosOriginais,
    alunosMatriculados,
    setAlunosMatriculados,
    alunosSelecionados,
    setAlunosSelecionados,
    mostrarOutrasTurmas,
    filtrarAlunosMatricula,
    setMostrarOutrasTurmas
}) {
    const [enviando, setEnviando] = useState(false); // Estado para controle do loading


    // Função para realizar a matrícula
    const matricularAlunos = async () => {
        if (!eletiva || alunosSelecionados.length === 0) {
            showToast('warning', 'É necessário selecionar pelo menos um aluno.');
            return;
        }

        setEnviando(true); // Ativa o estado de envio (loading)

        try {
            const resposta = await axios.post('/eletivas/matricular-multiplos', {
                instituicao: eletiva.instituicao,
                codigo: eletiva.codigo,
                matriculas: alunosSelecionados,
                tipo: eletiva.tipo
            });

            if (resposta.status === 201) {
                sessionStorage.setItem('mensagemSucesso', `${alunosSelecionados.length} aluno(s) foram matriculados com sucesso.`);
                window.location.reload(); // Recarrega a página para refletir as mudanças
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao matricular alunos.');
        } finally {
            setEnviando(false); // Desativa o loading após a operação
        }
    };

    const handleSelecaoAluno = (matricula) => {
        setAlunosSelecionados(prev =>
            prev.includes(matricula) ? prev.filter(m => m !== matricula) : [...prev, matricula]
        );
    };

    return (
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
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Buscar aluno... (Matricula ou Nome)"
                                        value={busca.termoMatricula}
                                        onChange={filtrarAlunosMatricula}
                                    />
                                    <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
                                </div>
                                {eletiva.exclusiva && (
                                    <div className="form-check form-switch mt-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            role="switch"
                                            id="toggleExibirOutrasTurmas"
                                            checked={mostrarOutrasTurmas}
                                            onChange={(e) => setMostrarOutrasTurmas(e.target.checked)}
                                        />
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
                        <button type="button" className="btn btn-success" disabled={enviando} onClick={matricularAlunos} >
                            {enviando ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : (<> <i className="bi bi-person-plus"></i>&ensp;Matricular  </>)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
