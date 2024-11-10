import React, { useState } from 'react';
import axios from '../../../../../configs/axios';
import showToast from '../../../../../utills/toasts';

export default function CadastrarColaboradorModal({ listarColaboradores, instituicao }) {
    const [dadosColaborador, setDadosColaborador] = useState({
        matricula: '',
        nome: '',
        email: '',
        cargo: '',
        status: 'Aguardando',
        fazerLogin: false
    });
    const [carregando, setCarregando] = useState(false);

    const cadastrarColaborador = async (e) => {
        e.preventDefault();
        if (dadosColaborador.email === '') {
            setDadosColaborador((prev) => ({ ...prev, fazerLogin: false }));
        }

        setCarregando(true);
        try {
            const response = await axios.post('/colaboradores/cadastrar', {
                ...dadosColaborador,
                instituicao
            });
            if (response.status === 200) {
                sessionStorage.setItem('mensagemSucesso', `O colaborador <b>${dadosColaborador.nome}</b> foi cadastrado com sucesso.`);
                window.location.reload();
            } else {
                throw new Error('Erro ao cadastrar colaborador.');
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao cadastrar colaborador.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="modal fade" id="cadastrarColaborador" tabIndex="-1" aria-labelledby="cadastrarColaboradorLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-people-fill fs-3"></i>
                            <h4 className='m-0 fs-4'>Colaboradores</h4>
                            <i className="bi bi-arrow-right-short fs-4"></i>
                            <h5 className="m-0">Cadastrar</h5>
                        </div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form onSubmit={cadastrarColaborador}>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <label htmlFor="matricula" className="form-label">Matrícula <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="matricula"
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
                                <div className="col-md-9">
                                    <label htmlFor="nome" className="form-label">Nome <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nome"
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
                                <div className="col-md-4">
                                    <label htmlFor="cargo" className="form-label">Cargo <span className="text-danger">*</span></label>
                                    <select
                                        className="form-select"
                                        id="cargo"
                                        value={dadosColaborador.cargo}
                                        onChange={(e) => setDadosColaborador({ ...dadosColaborador, cargo: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled>Selecione...</option>
                                        <option value="Diretor">Diretor</option>
                                        <option value="Coordenador">Coordenador</option>
                                        <option value="Professor">Professor</option>
                                        <option value="Colaborador">Colaborador</option>
                                    </select>
                                </div>
                                <div className="col-md-8">
                                    <label htmlFor="email" className="form-label">E-mail <span className="text-danger">*</span></label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        value={dadosColaborador.email}
                                        onChange={(e) => setDadosColaborador({ ...dadosColaborador, email: e.target.value })}
                                        maxLength="101" // Limite de 100 caracteres
                                        title="Digite um endereço de e-mail válido"
                                        required
                                    />
                                    {dadosColaborador.email.length > 100 && (
                                        <div className="text-danger mt-1">
                                            <small>O e-mail não pode ultrapassar 100 caracteres.</small>
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-8">
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            role="switch"
                                            id="flexSwitchCheckLogin"
                                            checked={dadosColaborador.fazerLogin}
                                            onChange={(e) => setDadosColaborador({ ...dadosColaborador, fazerLogin: e.target.checked })}
                                        />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckLogin">Permitir que o colaborador faça login no sistema?</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={carregando}>
                                {carregando ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : (<><i className="bi bi-person-add"></i>&ensp;Cadastrar</>)}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
