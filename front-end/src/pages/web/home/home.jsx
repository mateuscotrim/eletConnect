import Header from "../../../components/header";
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from '../../../configs/axios';
import '../../../assets/styles/my-bootstrap.css';

function InfoCard({ title, value, icon, color, link }) {
    return (
        <div className={`card text-center shadow-sm border-left-${color}`}>
            <div className="card-body d-flex align-items-center gap-5">
                <span>
                    <p className={`card-title text-${color} m-0`}><small>{title}</small></p>
                    <p className="card-text text-start">{value}</p>
                </span>
                <Link to={link}>
                    <i className={`bi ${icon} fs-1 text-${color} opacity-75`}></i>
                </Link>
            </div>
        </div>
    );
}

export default function Home() {
    const [chartAlunosData, setChartAlunosData] = useState([]);
    const [chartEletivasData, setChartEletivasData] = useState([]);
    const [totals, setTotals] = useState({
        totalAlunos: 0,
        totalEletivas: 0,
        totalProjetosVida: 0,
        totalTrilhas: 0,
        totalTurmas: 0,
        totalColaboradores: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const escola = JSON.parse(sessionStorage.getItem('escola'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post('/home/qnt', { instituicao: escola.cnpj });
                if (response.status === 200) {
                    const {
                        quantidadeAlunos1Ano, quantidadeAlunos2Ano, quantidadeAlunos3Ano,
                        quantidadeMatriculados1Ano, quantidadeMatriculados2Ano, quantidadeMatriculados3Ano,
                        quantidadeEletivas, quantidadeProjetosVida, quantidadeTrilhas, quantidadeTotalTurmas,
                        totalAlunos, totalColaboradores
                    } = response.data;

                    setTotals({
                        totalAlunos: totalAlunos || 0,
                        totalEletivas: quantidadeEletivas || 0,
                        totalProjetosVida: quantidadeProjetosVida || 0,
                        totalTrilhas: quantidadeTrilhas || 0,
                        totalTurmas: quantidadeTotalTurmas || 0,
                        totalColaboradores: totalColaboradores || 0
                    });

                    setChartAlunosData([
                        { ano: '1º ano', Matriculados: quantidadeMatriculados1Ano, 'Não Matriculados': quantidadeAlunos1Ano - quantidadeMatriculados1Ano },
                        { ano: '2º ano', Matriculados: quantidadeMatriculados2Ano, 'Não Matriculados': quantidadeAlunos2Ano - quantidadeMatriculados2Ano },
                        { ano: '3º ano', Matriculados: quantidadeMatriculados3Ano, 'Não Matriculados': quantidadeAlunos3Ano - quantidadeMatriculados3Ano }
                    ]);

                    setChartEletivasData([
                        { tipo: 'Eletivas', Quantidade: quantidadeEletivas },
                        { tipo: 'Projetos de Vida', Quantidade: quantidadeProjetosVida },
                        { tipo: 'Trilhas', Quantidade: quantidadeTrilhas }
                    ]);
                }
            } catch (error) {
                console.error('Erro ao buscar dados da API:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [escola.cnpj]);

    const infoCards = [
        { title: 'Total de Alunos', value: `${totals.totalAlunos} alunos`, icon: 'bi-person-arms-up', color: 'primary', link: '/students' },
        { title: 'Total de Turmas', value: `${totals.totalTurmas} turmas`, icon: 'bi-people-fill', color: 'secondary', link: '/students' },
        { title: 'Total de Eletivas', value: `${totals.totalEletivas} eletivas`, icon: 'bi-bookmark-star-fill', color: 'success', link: '/electives' },
        { title: 'Total de Projetos de Vida', value: `${totals.totalProjetosVida} projetos de vida`, icon: 'bi-bookmark-heart-fill', color: 'warning', link: '/electives' },
        { title: 'Total de Trilhas', value: `${totals.totalTrilhas} trilhas`, icon: 'bi-bookmark-check-fill', color: 'danger', link: '/electives' },
        { title: 'Total de Colaboradores', value: `${totals.totalColaboradores} colaboradores`, icon: 'bi-person-lines-fill', color: 'info', link: '/settings/collaborators' }
    ];

    return (
        <>
            <Header />
            <div id="toast-container" className="toast-container position-absolute bottom-0 end-0 m-2"></div>
            <main id="main-section">
                <section id='section'>
                    <div className="box">
                        <div className="title">
                            <span className="d-flex align-items-center gap-2">
                                {escola?.logotipo ? (<img className='image-school' height={50} src={escola.logotipo} alt="Logotipo da Escola" />) : null}
                                <h3 className="m-0 fs-4">{escola?.nome || "Instituição"}</h3>
                            </span>
                            <Link className="btn btn-outline-secondary" to="/warnings">
                                <i className="bi bi-megaphone"></i>&ensp;Central de avisos
                            </Link>
                        </div>

                        <div className="p-4">
                            {isLoading ? (
                                <div className="d-flex justify-content-center">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Carregando...</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="d-flex flex-wrap justify-content-between gap-2 mb-4">
                                        {infoCards.map((card, index) => (
                                            <InfoCard key={index} {...card} />
                                        ))}
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="border shadow-sm">
                                                <div className="p-2 bg-body-tertiary">
                                                    <h5 className="m-0">Distribuição de Alunos</h5>
                                                </div>
                                                <ResponsiveContainer width="100%" height={400}>
                                                    <BarChart data={chartAlunosData}>
                                                        <XAxis dataKey="ano" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Bar dataKey="Matriculados" fill="#42a5f5" />
                                                        <Bar dataKey="Não Matriculados" fill="#ff6384" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="border shadow-sm">
                                                <div className="p-2 bg-body-tertiary">
                                                    <h5 className="m-0">Distribuição de Eletivas</h5>
                                                </div>
                                                <ResponsiveContainer width="100%" height={400}>
                                                    <BarChart data={chartEletivasData}>
                                                        <XAxis dataKey="tipo" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Bar dataKey="Quantidade" fill="#13b455" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </main >
        </>
    );
}
