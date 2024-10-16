import React, { useState, useEffect } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';
import supabase from '../../../../configs/supabase';

export default function EditarColaborador({ matricula }) {
    const escola = JSON.parse(sessionStorage.getItem('escola'));
    const usuarioAtual = JSON.parse(sessionStorage.getItem('user')); 

    const [dadosColaborador, setDadosColaborador] = useState({
        matricula: '',
        instituicao: escola.cnpj,
        nome: '',
        cargo: '',
        email: '',
        status: 'Ativo',
        foto: null,
        fotoUrl: '',
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
            const resposta = await axios.post(`/colaboradores/consultar`, { matricula, instituicao: escola.cnpj });

            if (resposta.status === 200 && resposta.data?.colaboradorData?.length > 0) {
                const colaborador = resposta.data.colaboradorData[0];
                setDadosColaborador(prev => ({
                    ...prev,
                    matricula: colaborador.matricula || '',
                    nome: colaborador.nome || '',
                    cargo: colaborador.cargo || '',
                    email: colaborador.email || '',
                    status: colaborador.status || 'Ativo',
                    fotoUrl: colaborador.foto || 'https://th.bing.com/th/id/OIP.nIbVpOVMQV4rYGUVTKTbSQHaJ4?w=1200&h=1600&rs=1&pid=ImgDetMain',
                    fazerLogin: colaborador.fazerLogin, 
                }));

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

    const aoMudarFoto = (evento) => {
        const arquivo = evento.target.files[0];
        if (arquivo) {
            setDadosColaborador(prev => ({
                ...prev,
                foto: arquivo,
                fotoUrl: URL.createObjectURL(arquivo)
            }));
        }
    };

    const armazenarFoto = async () => {
        if (!dadosColaborador.foto) return dadosColaborador.fotoUrl;

        const caminhoFoto = `FOTO_${Date.now()}`;

        try {
            const { data, error } = await supabase.storage.from('colaboradorPhoto').upload(caminhoFoto, dadosColaborador.foto);
            if (error) {
                showToast('danger', error.message);
                return null;
            }

            const { publicUrl, error: erroPublicUrl } = await supabase.storage.from('colaboradorPhoto').getPublicUrl(caminhoFoto);
            if (erroPublicUrl) {
                showToast('danger', erroPublicUrl.message);
                return null;
            }

            return publicUrl;
        } catch (erro) {
            showToast('danger', 'Erro ao armazenar a foto.');
            return null;
        }
    };

    const aoSalvar = async (e) => {
        e.preventDefault();
        setCarregando(true);
        try {
            const urlFoto = await armazenarFoto();
            if (!urlFoto) {
                setCarregando(false);
                return;
            }

            const novaMatricula = e.target.matricula.value === dadosColaborador.matricula ? dadosColaborador.matricula : e.target.matricula.value;

            const colaboradorAtualizado = {
                instituicao: escola.cnpj,
                matricula: novaMatricula, 
                nome: e.target.nome.value,
                cargo: e.target.cargo.value,
                email: e.target.email.value,
                status: e.target.status.value,
                foto: urlFoto,
                fazerLogin: dadosColaborador.fazerLogin, 
            };

            const resposta = await axios.post(`/colaboradores/editar`, {
                matriculaAntiga: matricula,
                ...colaboradorAtualizado,
            });

            if (resposta.status === 200) {
                showToast('success', 'Colaborador atualizado com sucesso');
                setDadosColaborador(prev => ({ ...prev, matricula: novaMatricula })); 
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
        <>
            <div id='toast-container' className="toast-container position-fixed bottom-0 end-0 p-3"></div>
            {carregandoDados ? (
                <div className="d-flex justify-content-center p-2">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                </div>
            ) : (
                <div className="p-4">
                    <div className='d-flex gap-4'>
                        <div className="d-flex flex-column align-items-center gap-3">
                            <img width={150} height={200} src={dadosColaborador.fotoUrl} alt="Foto do colaborador" className="img-thumbnail" />
                            <input type="file" onChange={aoMudarFoto} aria-label="Alterar foto do colaborador" />
                        </div>
                        <div className="w-100">
                            <form className="row g-3" onSubmit={aoSalvar}>
                                <div className="col-md-4">
                                    <label htmlFor="matricula" className="form-label">Matrícula <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" id="matricula" name="matricula" value={dadosColaborador.matricula} onChange={(e) => setDadosColaborador({ ...dadosColaborador, matricula: e.target.value })} required />
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="cargo" className="form-label">Cargo <span className="text-danger">*</span></label>
                                    <select className="form-select" id="cargo" name="cargo" value={dadosColaborador.cargo} onChange={(e) => setDadosColaborador({ ...dadosColaborador, cargo: e.target.value })} required disabled={eMeuPerfil} >
                                        <option value="" disabled>Selecione...</option>
                                        <option value="Diretor">Diretor</option>
                                        <option value="Coordenador">Coordenador</option>
                                        <option value="Professor">Professor</option>
                                        <option value="Colaborador">Colaborador</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="status" className="form-label">Status <span className="text-danger">*</span></label>
                                    <select className="form-select" id="status" name="status" value={dadosColaborador.status} onChange={(e) => setDadosColaborador({ ...dadosColaborador, status: e.target.value })} required disabled={eMeuPerfil}  >
                                        <option value="Ativo">Ativo</option>
                                        <option value="Inativo">Inativo</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="nome" className="form-label">Nome completo <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" id="nome" name="nome" value={dadosColaborador.nome} onChange={(e) => setDadosColaborador({ ...dadosColaborador, nome: e.target.value })} required />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="email" className="form-label">E-mail</label>
                                    <input type="email" className="form-control" id="email" name="email" value={dadosColaborador.email} onChange={(e) => setDadosColaborador({ ...dadosColaborador, email: e.target.value })} disabled={eMeuPerfil} />
                                </div>
                                <div className="col-md-12">
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckLogin" checked={dadosColaborador.fazerLogin} onChange={(e) => setDadosColaborador({ ...dadosColaborador, fazerLogin: e.target.checked })} />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckLogin">Permitir que o colaborador faça login no sistema?</label>
                                    </div>
                                </div>
                                <div className="text-end mt-5">
                                    <button className='btn btn-success' type="submit" disabled={carregando}>
                                        <i className="bi bi-pencil">&ensp;</i>{carregando ? 'Editando...' : 'Editar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
