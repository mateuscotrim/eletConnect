import React from 'react';
import Header from "../../../components/header";
import ModalCadastrarInstituicao from './modals/criarInstituicao';
import ModalEntrarInstituicao from './modals/entrarInstituicao';

export default function Instituicao() {
    const user = JSON.parse(sessionStorage.getItem('user'));

    return (
        <>
            <div id="toast-container" className="toast-container position-absolute bottom-0 end-0 m-2"></div>
            <Header />
            <main id="main-section">
                <section id='section'>
                    <div className="box">
                        <div className="title">
                            <span className="d-flex align-items-center gap-2 text-black">
                                <i className="bi bi-grid-1x2 fs-3"></i>
                                <h3 className="m-0 fs-4">Primeiro acesso</h3>
                            </span>
                        </div>
                        <div className="p-4">
                            <div className="d-flex justify-content-between align-items-center gap-3">
                                <h5 className="m-0">Cadastrar nova instituição</h5>
                                <button type="button" className="btn btn-outline-secondary" data-bs-target="#cadastrarEscola" data-bs-toggle="modal">
                                    Cadastrar instituição
                                </button>
                            </div>
                            <p className="mt-2">Para cadastrar uma nova instituição de ensino, preencha as informações nos campos abaixo.</p>
                            
                            <hr />

                            <div className="d-flex justify-content-between align-items-center gap-3 mt-4">
                                <h5 className="m-0">Entrar em uma instituição</h5>
                                <button type="button" className="btn btn-outline-secondary" data-bs-target="#entrarEscola" data-bs-toggle="modal">
                                    Entrar com código da instituição
                                </button>
                            </div>
                            <p className="mt-2">Já tem um código de instituição? Insira o código para se associar a uma instituição existente.</p>
                        </div>
                    </div>
                </section>
            </main>
            <ModalCadastrarInstituicao user={user} />
            <ModalEntrarInstituicao user={user} />
        </>
    );
}
