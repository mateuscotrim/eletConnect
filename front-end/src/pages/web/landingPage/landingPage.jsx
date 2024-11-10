import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../configs/axios';
import { isMobile } from 'react-device-detect';
import "./landingPage.css";
import logo from '../../../assets/images/logo/azul.png';
import imgSelect from '../../../assets/images/Digital transformation-cuate.png';

export default function LandingPage() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [mensagem, setMensagem] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            navigate(isMobile ? '/m/login' : '/login');
        }
    }, [navigate]);

    const enviarEmail = async (e) => {
        e.preventDefault();

        const templateParams = { from_name: nome, from_email: email, message: mensagem };

        try {
            const response = await axios.post('/home/enviar-email', templateParams);

            if (response.status === 200) {
                alert('Mensagem enviada com sucesso!');
                setNome('');
                setEmail('');
                setMensagem('');
            } else {
                alert('Erro ao enviar mensagem. Tente novamente mais tarde.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao enviar mensagem. Tente novamente mais tarde.');
        }
    };

    const etapas = [
        { id: 1, title: 'Cadastro e Configuração', description: 'Configure a escola, organize as turmas e cadastre disciplinas de maneira fácil.', color: 'primary' },
        { id: 2, title: 'Inscrição de Alunos', description: 'Os alunos escolhem suas disciplinas preferidas e se inscrevem diretamente na plataforma.', color: 'success' },
        { id: 3, title: 'Organização das Turmas', description: 'Gerencie as turmas conforme as escolhas dos alunos e disponibilidade de vagas.', color: 'info' },
        { id: 4, title: 'Acompanhamento de Matrículas', description: 'Veja o número de alunos matriculados e monitorize as inscrições em tempo real.', color: 'warning' },
        { id: 5, title: 'Controle de Presença', description: 'Gere listas de presença e controle a assiduidade dos alunos.', color: 'danger' },
        { id: 6, title: 'Visualização de Desempenho', description: 'Monitore o desempenho das turmas e dos alunos em cada disciplina.', color: 'primary' },
        { id: 7, title: 'Atualização de Informações', description: 'Atualize facilmente informações sobre disciplinas, turmas e alunos.', color: 'success' },
        { id: 8, title: 'Acesso Restrito', description: 'Controle o acesso dos usuários conforme o cargo e função.', color: 'info' },
        { id: 9, title: 'Relatórios Simples', description: 'Gere relatórios de maneira rápida para ter uma visão geral das disciplinas e turmas.', color: 'warning' },
        { id: 10, title: 'Suporte Personalizado', description: 'Conte com um suporte ágil e dedicado para solucionar dúvidas.', color: 'danger' },
    ];

    return (
        <>
            <nav className="navbar fixed-top bg-body-tertiary p-0">
                <div id='navbar-menu' className="d-flex justify-content-between w-100">
                    <div id='menu-logo' className="d-flex align-items-center gap-2 m-0">
                        <img width={40} src={logo} alt="logo" />
                        <h2 className='m-0 fw-bold'>eletConnect</h2>
                    </div>
                    <div id='menu-itens' className="d-flex align-items-center">
                        <ul id='menu-ul' className="nav fw-bold">
                            <li className="nav-item">
                                <button className="nav-link text-black" data-bs-toggle="modal" data-bs-target="#contato"><p className='m-0'>CONTATO</p></button>
                            </li>
                        </ul>
                        <div className='d-flex align-items-center gap-2'>
                            <a className="btn btn-primary" href="/m/login" title='Área do aluno'>
                                <i className="bi bi-person"></i>&ensp;Sou aluno
                            </a>
                            {!isMobile && (
                                <a className="btn btn-primary" href="/login" title="Acesso restrito">
                                    <i className="bi bi-person-lock"></i>&ensp;Sou professor
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                {/* Seção Principal */}
                <section id='painel'>
                    <div id='painel-text' className="row text-white">
                        <div className="col-md-6">
                            <h1 className="fw-bold">Simplificando a gestão de disciplinas eletivas!</h1>
                            <p className="fs-5">A eletConnect é uma plataforma intuitiva que transforma a gestão de disciplinas eletivas.</p>
                            <a className="btn btn-primary" href={isMobile ? "/m/login" : "/login"}>Começar</a>
                        </div>
                        <div className="col-md-6 text-center robot">
                            <img src={imgSelect} width={350} alt="Imagem de transformação digital" />
                        </div>
                        <div id='scroll-etapa' className="d-flex gap-2 overflow-x-scroll">
                            {etapas.map(etapa => (
                                <div key={etapa.id} className={`col-md-4 d-flex flex-column bg-white shadow-sm p-4`}>
                                    <h5 className={`fw-bold text-${etapa.color}`}>{etapa.id}. {etapa.title}</h5>
                                    <p className="fs-6 text-muted m-0">{etapa.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Seção de Funcionalidades */}
                <section id='funcionalidades' className='bg-body-tertiary p-5'>
                    <div className="painel d-flex justify-content-between gap-4">
                        <div className={isMobile ? 'w-100' : 'w-25'}>
                            <h4 className="fw-bold text-decoration-underline">Inscrições Simples</h4>
                            <p className="fs-5 m-0">Permita que os estudantes escolham suas eletivas de forma fácil e digital pelo smartphone.</p>
                        </div>
                        <div className={isMobile ? 'w-100' : 'w-25'}>
                            <h4 className="fw-bold text-decoration-underline">Visualização de Matrículas</h4>
                            <p className="fs-5 m-0">Tenha um controle total sobre o número de estudantes matriculados em cada eletiva.</p>
                        </div>
                        <div className={isMobile ? 'w-100' : 'w-25'}>
                            <h4 className="fw-bold text-decoration-underline">Acompanhamento de Vagas</h4>
                            <p className="fs-5 m-0">Monitore as vagas disponíveis em cada eletiva e evite sobrecarga nas turmas.</p>
                        </div>
                        <div className={isMobile ? 'w-100' : 'w-25'}>
                            <h4 className="fw-bold text-decoration-underline">Personalização de Eletivas</h4>
                            <p className="fs-5 m-0">Monitore as vagas disponíveis em cada eletiva e evite sobrecarga nas turmas.</p>
                        </div>
                    </div>
                    <div className="arrow-container text-center m-4 mb-0">
                        <span className="arrow"></span>
                    </div>
                </section>

                {/* Seção Clientes */}
                <section id='clientes' className='bg-body-tertiary p-5 pt-0'>
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