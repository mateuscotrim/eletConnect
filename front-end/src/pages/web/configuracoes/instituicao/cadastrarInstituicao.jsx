import React, { useState, useEffect } from 'react';
import axios from '../../../../configs/axios';
import Header from "../../../../components/header";
import showToast from "../../../../utills/toasts";
import supabase from '../../../../configs/supabase';

export default function Instituicao() {
    const [cnpj, setCnpj] = useState('');
    const [nome, setNome] = useState('');
    const [cep, setCEP] = useState('');
    const [endereco, setEndereco] = useState('');
    const [telefone, setTelefone] = useState('');
    const [logo, setLogo] = useState(null);
    const [codigo, setCodigo] = useState('');
    const user = JSON.parse(sessionStorage.getItem('user'));

    useEffect(() => {
        if (!user || !user.id) {
            window.location.href = '/login';
        } else {
            document.querySelector('button[data-bs-target="#cadastrarEscola"]').click();
        }
    }, [user]);

    const verificarCNPJ = async (cnpj) => {
        try {
            const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, { withCredentials: false });
            if (response.status === 200) {
                setCnpj(response.data.cnpj);
            }
        } catch (error) {
            showToast('danger', 'Erro ao verificar o CNPJ.');
        }
    };

    const verificarCEP = async (cep) => {
        try {
            const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${cep}`, { withCredentials: false });
            if (response.status === 200) {
                setEndereco(response.data.street);
            }
        } catch (error) {
            showToast('danger', 'Erro ao verificar CEP.');
        }
    };

    const armazenarLogo = async (logo) => {
        const path = `LOGOTIPO_${Date.now()}`;
        try {
            const { error } = await supabase.storage.from('logotipo').upload(path, logo);
            if (error) throw new Error(error.message);
            const { data, error: publicUrlError } = supabase.storage.from('logotipo').getPublicUrl(path);
            if (publicUrlError) throw new Error(publicUrlError.message);
            return data.publicUrl;
        } catch (error) {
            throw error;
        }
    };

    const cadastrarInstituicao = async (e) => {
        e.preventDefault();

        if (!cnpj || !nome || !cep || !endereco || !telefone) {
            showFeedback('inputCNPJ', 'feedback1', 'Preencha o CNPJ corretamente.');
            showFeedback('inputNome', 'feedback2', 'Preencha o nome corretamente.');
            showFeedback('inputCEP', 'feedback3', 'Preencha o CEP corretamente.');
            showFeedback('inputEndereco', 'feedback4', 'Preencha o endereço corretamente.');
            showFeedback('inputTelefone', 'feedback5', 'Preencha o telefone corretamente.');
            return;
        }

        try {
            const logoUrl = logo ? await armazenarLogo(logo) : '';
            const response = await axios.post('/instituicao/cadastrar', {
                userID: user.id, cnpj, nome, cep, endereco, telefone, logotipo: logoUrl
            });

            showToast('success', response.data.mensagem);
            setTimeout(() => window.location.href = '/verification', 5000);
        } catch (error) {
            showToast('danger', error.response ? error.response.data.mensagem : 'Erro ao cadastrar instituição.');
        }
    };

    const entrarInstituicao = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('/instituicao/entrar', { id: user.id, codigo });
            showToast('success', 'Usuário vinculado a instituição com sucesso!');
            setTimeout(() => window.location.href = '/verification', 5000);
        } catch (error) {
            showToast('error', error.response ? error.response.data.error : 'Erro ao vincular usuário a instituição.');
        }
    };

    const showFeedback = (inputId, feedbackId, message) => {
        const inputElement = document.getElementById(inputId);
        const feedbackElement = document.getElementById(feedbackId);

        inputElement.classList.add('is-invalid');
        feedbackElement.innerHTML = message;

        setTimeout(() => {
            inputElement.classList.remove('is-invalid');
            feedbackElement.innerHTML = '';
        }, 5000);
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
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-gear-fill fs-3"></i>
                                    <h3 className='m-0 fs-4'>Configurações</h3>
                                </span>
                            </div>
                            <span className='d-flex gap-3'>
                                <button type="button" className="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#entrarEscola">Entrar em uma instituição</button>
                                <button type="button" className="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#cadastrarEscola">Cadastrar uma nova instituição</button>
                            </span>
                        </div>
                    </div>
                </section>
            </main>

            <div className="modal fade" id="cadastrarEscola" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-gear-fill fs-3"></i>
                                    <h3 className='m-0 fs-4'>Configurações</h3>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h4 className="m-0">Cadastrar</h4>
                            </div>
                        </div>
                        <form onSubmit={cadastrarInstituicao}>
                            <div className="modal-body">
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="inputCNPJ" placeholder="CNPJ" maxLength="18" value={cnpj} onChange={(e) => setCnpj(e.target.value)} onBlur={() => verificarCNPJ(cnpj)} required />
                                    <label htmlFor="inputCNPJ">CNPJ (apenas os números) </label>
                                    <div className="invalid-feedback" id="feedback1"></div>
                                </div>
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="inputNome" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                                    <label htmlFor="inputNome">Nome</label>
                                    <div className="invalid-feedback" id="feedback2"></div>
                                </div>
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="inputCEP" placeholder="CEP" value={cep} onChange={(e) => setCEP(e.target.value)} onBlur={() => verificarCEP(cep)} required />
                                    <label htmlFor="inputCEP">CEP</label>
                                    <div className="invalid-feedback" id="feedback3"></div>
                                </div>
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="inputEndereco" placeholder="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} required />
                                    <label htmlFor="inputEndereco">Endereço</label>
                                    <div className="invalid-feedback" id="feedback4"></div>
                                </div>
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="inputTelefone" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
                                    <label htmlFor="inputTelefone">Telefone</label>
                                    <div className="invalid-feedback" id="feedback5"></div>
                                </div>
                                <div className="mb-3 d-flex justify-content-center align-items-center gap-3">
                                    <div className="img-container">
                                        {logo ? (
                                            <img width={64} src={typeof logo === 'string' ? logo : URL.createObjectURL(logo)} alt="Logo" className="img-fluid" />
                                        ) : (
                                            <span></span>
                                        )}
                                    </div>
                                    <div>
                                        <label className="form-label">Logo da instituição</label>
                                        <input type="file" className="form-control" id="inputLogo" onChange={(e) => setLogo(e.target.files[0])} />
                                        <div className="invalid-feedback" id="feedback6"></div>
                                    </div>
                                </div>
                                <hr />
                                <div className="text-center">
                                    <button type="button" className="btn btn-outline-secondary" data-bs-target="#entrarEscola" data-bs-toggle="modal">Entrar em uma instituição de ensino</button>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-primary">Cadastrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="entrarEscola" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className='d-flex align-items-center gap-2'>
                                    <i className="bi bi-gear-fill fs-3"></i>
                                    <h3 className='m-0 fs-4'>Configurações</h3>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h4 className="m-0">Usar codigo</h4>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={entrarInstituicao}>
                            <div className="modal-body">
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="inputCodigo" placeholder="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
                                    <label htmlFor="inputCodigo">Código da instituição</label>
                                    <div className="invalid-feedback" id="feedback7"></div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-primary">Entrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
