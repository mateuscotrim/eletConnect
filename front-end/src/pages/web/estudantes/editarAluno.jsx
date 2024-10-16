import React, { useState, useEffect } from 'react';
import axios from '../../../configs/axios';
import showToast from '../../../utills/toasts';
import supabase from '../../../configs/supabase';

export default function EditarAluno({ matricula }) {
    const [dadosAluno, setDadosAluno] = useState({ matricula: '', instituicao: '', nome: '', serie: '', turma: '', email: '', status: 'Ativo', foto: null, fotoUrl: '' });
    const [carregando, setCarregando] = useState(true);
    const [carregandoEletivas, setCarregandoEletivas] = useState(false);
    const [eletivasAluno, setEletivasAluno] = useState([]);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        if (matricula) {
            carregarDadosAluno();
        }
    }, [matricula]);

    useEffect(() => {
        if (dadosAluno.instituicao) {
            carregarEletivasAluno();
        }
    }, [dadosAluno.instituicao]);

    const carregarDadosAluno = async () => {
        try {
            setCarregando(true);
            const resposta = await axios.post(`/estudantes/consultar`, { matricula });
            if (resposta.status === 200 && resposta.data?.alunoData?.length > 0) {
                const aluno = resposta.data.alunoData[0];
                setDadosAluno({
                    matricula: aluno.matricula || '',
                    instituicao: aluno.instituicao || '',
                    nome: aluno.nome || '',
                    serie: aluno.serie || '',
                    turma: aluno.turma || '',
                    email: aluno.email || '',
                    status: aluno.status || 'Ativo',
                    fotoUrl: aluno.foto || 'https://th.bing.com/th/id/OIP.nIbVpOVMQV4rYGUVTKTbSQHaJ4?w=1200&h=1600&rs=1&pid=ImgDetMain',
                    foto: null,
                });
            }
        } catch (error) {
            showToast('danger', error.message || 'Erro ao buscar aluno.');
        } finally {
            setCarregando(false);
        }
    };

    const carregarEletivasAluno = async () => {
        try {
            setCarregandoEletivas(true);
            const resposta = await axios.post(`/eletivas/listar-eletivas-aluno`, { matricula, instituicao: dadosAluno.instituicao });
            if (resposta.status === 200 && Array.isArray(resposta.data)) {
                setEletivasAluno(resposta.data);
            } else {
                setEletivasAluno([]);
            }
        } catch (erro) {
            showToast('danger', erro.message || 'Erro ao buscar eletivas do aluno.');
        } finally {
            setCarregandoEletivas(false);
        }
    };

    const aoMudarFoto = (evento) => {
        const arquivo = evento.target.files[0];
        if (arquivo) {
            setDadosAluno((prevDados) => ({ ...prevDados, foto: arquivo, fotoUrl: URL.createObjectURL(arquivo) }));
        }
    };

    const armazenarFoto = async () => {
        if (!dadosAluno.foto) return dadosAluno.fotoUrl;

        const caminhoFoto = `FOTO_${Date.now()}`;

        try {
            const { data, error } = await supabase.storage.from('studentPhoto').upload(caminhoFoto, dadosAluno.foto);
            if (error) {
                showToast('danger', error.message);
                return null;
            }

            const { publicUrl, error: erroPublicUrl } = await supabase.storage.from('studentPhoto').getPublicUrl(caminhoFoto);
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

    const aoSalvar = async () => {
        setSalvando(true);
        try {
            const urlFoto = await armazenarFoto();
            if (!urlFoto) {
                setSalvando(false);
                return;
            }

            const resposta = await axios.post(`/estudantes/editar`, {
                matriculaAntiga: matricula,
                matriculaNova: dadosAluno.matricula,
                nome: dadosAluno.nome,
                serie: dadosAluno.serie,
                turma: dadosAluno.turma,
                email: dadosAluno.email,
                status: dadosAluno.status,
                foto: urlFoto,
            });

            if (resposta.status === 200) {
                showToast('success', 'O cadastro do aluno foi atualizado com sucesso');
                setDadosAluno((prevDados) => ({ ...prevDados, matricula: resposta.data.novaMatricula || prevDados.matricula }));
            } else {
                showToast('warning', 'Ocorreu um problema ao atualizar o aluno');
            }
        } catch (erro) {
            showToast('danger', 'Erro ao atualizar aluno');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <>
            <div id="toast-container" className="toast-container position-absolute bottom-0 start-50 translate-middle-x"></div>
            <div className="p-4">
                {(carregando || carregandoEletivas) ? (
                    <div className="d-flex justify-content-center my-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </div>
                    </div>
                ) : (
                    <div className="m-4 d-flex gap-4">
                        <div className="d-flex flex-column align-items-center gap-3">
                            <img width={150} height={200} src={dadosAluno.fotoUrl} alt="Foto do aluno" />
                            <input type="file" onChange={aoMudarFoto} aria-label="Alterar foto do aluno" />
                        </div>
                        <div className="w-75">
                            <form className="row g-3">
                                <div className="col-md-3">
                                    <label htmlFor="matricula" className="form-label">Matrícula <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" id="matricula" value={dadosAluno.matricula} onChange={(e) => setDadosAluno({ ...dadosAluno, matricula: e.target.value })} required />
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="serie" className="form-label">Série <span className="text-danger">*</span></label>
                                    <select className="form-select" id="serie" value={dadosAluno.serie} onChange={(e) => setDadosAluno({ ...dadosAluno, serie: e.target.value })} required >
                                        <option value="" disabled>Selecione...</option>
                                        <option value="1º ano">1º ano</option>
                                        <option value="2º ano">2º ano</option>
                                        <option value="3º ano">3º ano</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="turma" className="form-label">Turma <span className="text-danger">*</span></label>
                                    <select className="form-select" id="turma" value={dadosAluno.turma} onChange={(e) => setDadosAluno({ ...dadosAluno, turma: e.target.value })} required>
                                        <option value="" disabled>Selecione...</option>
                                        {[...Array(26)].map((_, i) => {
                                            const turma = String.fromCharCode(65 + i); // 65 é o código ASCII para 'A'
                                            return (
                                                <option key={turma} value={turma}>{turma}</option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="status" className="form-label">Status</label>
                                    <select className="form-select" id="status" value={dadosAluno.status} onChange={(e) => setDadosAluno({ ...dadosAluno, status: e.target.value })} required >
                                        <option value="" disabled>Selecione...</option>
                                        <option value="Ativo">Ativo</option>
                                        <option value="Inativo">Inativo</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="nomeCompleto" className="form-label">Nome completo <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" id="nomeCompleto" value={dadosAluno.nome} onChange={(e) => setDadosAluno({ ...dadosAluno, nome: e.target.value })} required />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="email" className="form-label">E-mail</label>
                                    <input type="email" className="form-control" id="email" value={dadosAluno.email} onChange={(e) => setDadosAluno({ ...dadosAluno, email: e.target.value })} />
                                </div>
                            </form>

                            <h5 className="mt-4">| Eletivas</h5>
                            <div>
                                {eletivasAluno.length > 0 ? (
                                    eletivasAluno.map((eletiva, index) => (
                                        <span key={index} className={`badge ${obterClasseBadge(eletiva.tipo)} me-1`} style={{ fontSize: '1rem' }}>
                                            {eletiva.nome}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-muted">Nenhuma eletiva encontrada</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!carregando && !carregandoEletivas && (
                    <div className="text-end">
                        <button className="btn btn-success" onClick={aoSalvar} disabled={salvando}>
                            <i className='bi bi-pencil-fill'></i>&ensp;{salvando ? 'Editando...' : 'Editar'}
                        </button>
                    </div>
                )}
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