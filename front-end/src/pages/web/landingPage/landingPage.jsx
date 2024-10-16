import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';
import emailjs from '@emailjs/browser';
import "./landingPage.css";
import logo from '../../../assets/images/logo/azul.png';
import imgSelect from '../../../assets/images/Digital transformation-cuate.png';
import step1Image from '../../../assets/images/logo/azul.png';
import step2Image from '../../../assets/images/logo/azul.png';
import step3Image from '../../../assets/images/logo/azul.png';

export default function LandingPage() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [mensagem, setMensagem] = useState('');

    const enviarEmail = (e) => {
        e.preventDefault();

        const templateParams = { from_name: nome, from_email: email, message: mensagem };
        emailjs.send('service_penom2m', 'template_gp9c4bv', templateParams, 'sFI71YOCUv276jh3s')
            .then(() => {
                alert('Mensagem enviada com sucesso!');
                setNome('');
                setEmail('');
                setMensagem('');
            })
            .catch(() => {
                alert('Erro ao enviar mensagem. Tente novamente mais tarde.');
            });
    };

    const etapas = [
        { id: 1, title: 'Cadastro e Configuração', description: 'Configure a escola, organize as turmas e cadastre disciplinas de maneira fácil. O sistema permite um gerenciamento completo e prático das informações.', color: 'primary' },
        { id: 2, title: 'Inscrição de Alunos', description: 'Os alunos escolhem suas disciplinas preferidas e se inscrevem diretamente na plataforma, garantindo uma experiência simples e intuitiva para todos.', color: 'success' },
        { id: 3, title: 'Organização das Turmas', description: 'Gerencie as turmas conforme as escolhas dos alunos e disponibilidade de vagas. Confirme a formação das turmas de acordo com a demanda e capacidade.', color: 'info' },
        { id: 4, title: 'Acompanhamento de Matrículas', description: 'Veja o número de alunos matriculados e monitorize as inscrições em tempo real. Evite sobrecarga nas turmas e mantenha o controle de vagas.', color: 'warning' },
        { id: 5, title: 'Controle de Presença', description: 'Gere listas de presença e controle a assiduidade dos alunos. Acompanhe a frequência e garanta a participação dos estudantes em cada disciplina.', color: 'danger' },
        { id: 6, title: 'Visualização de Desempenho', description: 'Monitore o desempenho das turmas e dos alunos em cada disciplina. Obtenha insights e informações para apoiar a evolução educacional.', color: 'primary' },
        { id: 7, title: 'Atualização de Informações', description: 'Atualize facilmente informações sobre disciplinas, turmas e alunos. Mantenha a base de dados sempre organizada e correta.', color: 'success' },
        { id: 8, title: 'Acesso Restrito', description: 'Controle o acesso dos usuários conforme o cargo e função. Permita que cada um veja apenas o que for necessário, garantindo a segurança das informações.', color: 'info' },
        { id: 9, title: 'Relatórios Simples', description: 'Gere relatórios de maneira rápida para ter uma visão geral das disciplinas e turmas. Facilite a tomada de decisões com base em informações atualizadas.', color: 'warning' },
        { id: 10, title: 'Suporte Personalizado', description: 'Conte com um suporte ágil e dedicado para solucionar dúvidas e acompanhar a utilização do sistema da melhor forma possível.', color: 'danger' },
    ];

    return (
        <>
            <nav className="navbar fixed-top bg-body-tertiary">
                <div id='navbar-menu' className="d-flex justify-content-between w-100">
                    <div id='menu-logo' className="d-flex align-items-center gap-2">
                        <img width={40} src={logo} alt="logo" />
                        <h2 className='m-0 fw-bold'>eletConnect</h2>
                    </div>
                    <div id='menu-itens' className="d-flex align-items-center">
                        <ul id='menu-ul' className="nav fw-bold">
                            <li className="nav-item">
                                <a className="nav-link text-black" href="#funcionalidades"><p className='m-0'>FUNCIONALIDADES</p></a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-black" href="#como-funciona"><p className='m-0'>COMO FUNCIONA</p></a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-black" href="#clientes"><p className='m-0'>CLIENTES</p></a>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link text-black" data-bs-toggle="modal" data-bs-target="#contato"><p className='m-0'>CONTATO</p></button>
                            </li>
                        </ul>
                        <div className='d-flex align-items-center gap-2'>
                            <a className="btn btn-primary" href="/m/login" title='Área do aluno'>
                                <i className="bi bi-person"></i>
                            </a>
                            <a className="btn btn-primary" href={isMobile ? "/m/login" : "/login"} title='Acesso restrito'>
                                <i className="bi bi-person-lock"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                {/* Seção Principal */}
                <section id='painel' className='container-fluid'>
                    <div id='painel-text' className="row text-white">
                        <div className="col-md-6">
                            <h1 className="fw-bold">Simplificando a gestão de disciplinas eletivas!</h1>
                            <p className="fs-5">A eletConnect é uma plataforma intuitiva que transforma a gestão de disciplinas eletivas. Com apenas alguns cliques, os alunos podem realizar suas matrículas diretamente pelo celular, de maneira rápida e independente. Enquanto isso, as instituições têm controle total sobre a organização das turmas e o acompanhamento de vagas, tornando o processo mais ágil, eficiente e acessível para todos.</p>
                            <a className="btn btn-primary" href={isMobile ? "/m/login" : "/login"}>Começar</a>
                        </div>
                        <div className="col-md-6 text-center robot">
                            <img className='' src={imgSelect} width={400} alt="Imagem de transformação digital" />
                        </div>
                    </div>
                </section>

                {/* Seção de Funcionalidades */}
                <section id='funcionalidades' className='bg-body-tertiary p-5'>
                    <div className="painel d-flex justify-content-between gap-4">
                        <div className="w-25">
                            <h4 className="fw-bold text-decoration-underline">Inscrições Simples </h4>
                            <p className="fs-5 m-0">Permita que os estudantes escolham suas eletivas de forma fácil e digital pelo smartphone.</p>
                        </div>
                        <div className="w-25">
                            <h4 className="fw-bold text-decoration-underline">Visualização de Matrículas</h4>
                            <p className="fs-5 m-0">Tenha um controle total sobre o número de estudantes matriculados em cada eletiva.</p>
                        </div>
                        <div className='w-25'>
                            <h4 className="fw-bold text-decoration-underline">Acompanhamento de Vagas</h4>
                            <p className="fs-5 m-0">Monitore as vagas disponíveis em cada eletiva e evite sobrecarga nas turmas.</p>
                        </div>
                        <div className='w-25'>
                            <h4 className="fw-bold text-decoration-underline">Personalização de Eletivas</h4>
                            <p className="fs-5 m-0">Monitore as vagas disponíveis em cada eletiva e evite sobrecarga nas turmas.</p>
                        </div>
                    </div>
                </section>

                {/* Seção Como Funciona */}
                <section id='como-funciona' className='bg-light p-5'>
                    <h2 className='m-0 fw-bold text-primary'>| COMO O SISTEMA FUNCIONA?</h2>
                    <h4 className='m-0'>Veja como a plataforma eletConnect facilita a gestão das disciplinas eletivas de sua instituição.</h4>
                    <div className="mt-4">
                        <div id='scroll-etapa' className="d-flex gap-2 overflow-x-scroll">
                            {etapas.map(etapa => (
                                <div key={etapa.id} className={`col-md-4 d-flex flex-column bg-white shadow-sm p-4 `}>
                                    <h5 className={`fw-bold text-${etapa.color}`}>{etapa.id}. {etapa.title}</h5>
                                    <p className="fs-6 text-muted m-0">{etapa.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Seção Clientes */}
                <section id='clientes' className='bg-body-tertiary p-5'>
                    <h2 className='m-0 fw-bold text-primary'>| CLIENTES</h2>
                    <h4 className='m-0'>Nosso maior orgulho</h4>
                    <div className='mt-4'>
                        <ul>
                            <li><h1 className='m-0'>CEM 03 TAGUATINGA</h1></li>
                        </ul>
                    </div>
                </section>
            </main>

            {/* Modal de Contato */}
            <div className="modal fade" id="contato" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Formulário de Contato</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form id="formContato" onSubmit={enviarEmail}>
                                <div className="mb-3">
                                    <label htmlFor="nome" className="form-label">Nome</label>
                                    <input type="text" className="form-control" id="nome" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input type="email" className="form-control" id="email" placeholder="seuemail@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="mensagem" className="form-label">Mensagem</label>
                                    <textarea className="form-control" id="mensagem" rows="3" placeholder="Sua mensagem" value={mensagem} onChange={(e) => setMensagem(e.target.value)} required />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                            <button type="submit" form="formContato" className="btn btn-primary">Enviar</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
