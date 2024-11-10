import React, { useState, useEffect } from 'react';
import axios from '../../../../../configs/axios';
import showToast from '../../../../../utills/toasts';

export default function EditarColaboradorModal({ matricula, listarColaboradores, instituicao }) {
    const usuarioAtual = JSON.parse(sessionStorage.getItem('user'));

    const [dadosColaborador, setDadosColaborador] = useState({
        matricula: '',
        instituicao: instituicao,
        nome: '',
        cargo: '',
        email: '',
        status: 'Ativo',
        fazerLogin: false,
    });

    const [carregando, setCarregando] = useState(false);
    const [carregandoDados, setCarregandoDados] = useState(true);
    const [eMeuPerfil, setMeuPerfil] = useState(false);

    useEffect(() => {
        if (matricula) {
            carregarDadosColaborador(matricula);
        }
    }, [matricula]);

    const carregarDadosColaborador = async (matricula) => {
        try {
            setCarregandoDados(true);
            const resposta = await axios.post(`/colaboradores/consultar`, { matricula, instituicao });

            if (resposta.status === 200 && resposta.data?.colaboradorData?.length > 0) {
                const colaborador = resposta.data.colaboradorData[0];
                setDadosColaborador({
                    ...colaborador,
                });

                if (usuarioAtual.matricula === colaborador.matricula) {
                    setMeuPerfil(true);
                } else {
                    setMeuPerfil(false);
                }
            } else {
                showToast('warning', 'Colaborador não encontrado ou resposta inválida.');
            }
        } catch (erro) {
            console.error('Erro ao buscar dados do colaborador:', erro);
            showToast('danger', 'Erro ao buscar dados do colaborador.');
        } finally {
            setCarregandoDados(false);
        }
    };

    const aoSalvar = async (e) => {
        e.preventDefault();
        setCarregando(true);
        try {
            const novaMatricula = e.target.matricula.value === dadosColaborador.matricula ? dadosColaborador.matricula : e.target.matricula.value;

            const colaboradorAtualizado = {
                instituicao,
                matricula: novaMatricula,
                nome: e.target.nome.value,
                cargo: e.target.cargo.value,
                email: e.target.email.value,
                status: e.target.status.value,
                fazerLogin: dadosColaborador.fazerLogin,
            };

            const resposta = await axios.post(`/colaboradores/editar`, {
                matriculaAntiga: matricula,
                ...colaboradorAtualizado,
            });

            if (resposta.status === 200) {
                sessionStorage.setItem('mensagemSucesso', `O colaborador <b>${colaboradorAtualizado.nome}</b> foi atualizado com sucesso.`);
                window.location.reload();
            } else {
                showToast('warning', 'Ocorreu um problema ao atualizar o colaborador');
            }
        } catch (erro) {
            console.error('Erro ao atualizar colaborador:', erro);
            showToast('danger', 'Erro ao atualizar colaborador');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="modal fade" id="editarColaborador" tabIndex="-1" aria-labelledby="editarColaboradorLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-people-fill fs-3"></i>
                            <h4 className='m-0 fs-4'>Colaboradores</h4>
                            <i className="bi bi-arrow-right-short fs-4"></i>
                            <h5 className="m-0">Editar</h5>
                        </div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    {carregandoDados ? (
                        <div className="modal-body d-flex justify-content-center p-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Carregando...</span>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={aoSalvar}>
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label htmlFor="matricula" className="form-label">Matrícula <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="matricula"
                                            name="matricula"
                                            value={dadosColaborador.matricula}
                                            onChange={(e) => setDadosColaborador({ ...dadosColaborador, matricula: e.target.value })}
                                            pattern="[0-9]+" // Apenas números permitidos
                                            maxLength="11" // Limite de 10 caracteres
                                            title="Apenas números são permitidos"
                                            required
                                        />
                                        {dadosColaborador.matricula.length > 10 && (
                                            <div className="text-danger mt-1">
                                                <small>A matrícula não pode ultrapassar 10 caracteres.</small>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-4">
                                        <label htmlFor="cargo" className="form-label">Cargo <span className="text-danger">*</span></label>
                                        <select
                                            className="form-select"
                                            id="cargo"
                                            name="cargo"
                                            value={dadosColaborador.cargo}
                                            onChange={(e) => setDadosColaborador({ ...dadosColaborador, cargo: e.target.value })}
                                            required
                                            disabled={eMeuPerfil}
                                        >
                                            <option value="" disabled>Selecione...</option>
                                            <option value="Diretor">Diretor</option>
                                            <option value="Coordenador">Coordenador</option>
                                            <option value="Professor">Professor</option>
                                            <option value="Colaborador">Colaborador</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label htmlFor="status" className="form-label">Status <span className="text-danger">*</span></label>
                                        <select
                                            className="form-select"
                                            id="status"
                                            name="status"
                                            value={dadosColaborador.status}
                                            onChange={(e) => setDadosColaborador({ ...dadosColaborador, status: e.target.value })}
                                            required
                                            disabled={eMeuPerfil}
                                        >
                                            <option value="Ativo">Ativo</option>
                                            <option value="Inativo">Inativo</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="nome" className="form-label">Nome completo <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="nome"
                                            name="nome"
                                            value={dadosColaborador.nome}
                                            onChange={(e) => setDadosColaborador({ ...dadosColaborador, nome: e.target.value })}
                                            pattern="[A-Za-zÀ-ÿ\s]+" // Aceita letras com acentos e espaços
                                            maxLength="76" // Limite de 75 caracteres
                                            title="Apenas letras e espaços são permitidos"
                                            required
                                        />
                                        {dadosColaborador.nome.length > 75 && (
                                            <div className="text-danger mt-1">
                                                <small>O nome não pode ultrapassar 75 caracteres.</small>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="email" className="form-label">E-mail</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            value={dadosColaborador.email}
                                            onChange={(e) => setDadosColaborador({ ...dadosColaborador, email: e.target.value })}
                                            maxLength="101" // Limite de 100 caracteres
                                            title="Digite um endereço de e-mail válido"
                                            disabled={eMeuPerfil}
                                            required
                                        />
                                        {dadosColaborador.email.length > 100 && (
                                            <div className="text-danger mt-1">
                                                <small>O e-mail não pode ultrapassar 100 caracteres.</small>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id="flexSwitchCheckLogin"
                                                checked={dadosColaborador.fazerLogin}
                                                onChange={(e) => setDadosColaborador({ ...dadosColaborador, fazerLogin: e.target.checked })}
                                                disabled={eMeuPerfil}
                                            />
                                            <label className="form-check-label" htmlFor="flexSwitchCheckLogin">Permitir que o colaborador faça login no sistema?</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-success" disabled={carregando}>
                                    {carregando ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : (
                                        <> <i className="bi bi-pencil"></i>&ensp;Editar</>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
