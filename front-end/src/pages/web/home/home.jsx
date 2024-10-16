import Header from "../../../components/header";
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chart } from 'primereact/chart';
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
    const [chartAlunosData, setChartAlunosData] = useState(null);
    const [chartEletivasData, setChartEletivasData] = useState(null);
    const [chartOptionsAlunos, setChartOptionsAlunos] = useState(null);
    const [chartOptionsEletivas, setChartOptionsEletivas] = useState(null);
    const [totalAlunos, setTotalAlunos] = useState(0);
    const [totalEletivas, setTotalEletivas] = useState(0);
    const [totalProjetosVida, setTotalProjetosVida] = useState(0);
    const [totalTrilhas, setTotalTrilhas] = useState(0);
    const [totalTurmas, setTotalTurmas] = useState(0);
    const [totalColaboradores, setTotalColaboradores] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const escola = JSON.parse(sessionStorage.getItem('escola'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resposta = await axios.post('/home/qnt', { instituicao: escola.cnpj });
                if (resposta.status === 200) {
                    const { quantidadeAlunos1Ano, quantidadeAlunos2Ano, quantidadeAlunos3Ano, quantidadeMatriculados1Ano, quantidadeMatriculados2Ano, quantidadeMatriculados3Ano, quantidadeEletivas, quantidadeProjetosVida, quantidadeTrilhas, quantidadeTotalTurmas, totalAlunos, totalColaboradores } = resposta.data;
                    setTotalAlunos(totalAlunos || 0);
                    setTotalEletivas(quantidadeEletivas || 0);
                    setTotalProjetosVida(quantidadeProjetosVida || 0);
                    setTotalTrilhas(quantidadeTrilhas || 0);
                    setTotalTurmas(quantidadeTotalTurmas || 0);
                    setTotalColaboradores(totalColaboradores || 0);

                    const alunosData = {
                        labels: ['1º ano', '2º ano', '3º ano'],
                        datasets: [
                            {
                                type: 'bar',
                                label: 'Matriculados em eletivas',
                                backgroundColor: 'rgba(66, 165, 245, 0.7)',
                                data: [quantidadeMatriculados1Ano, quantidadeMatriculados2Ano, quantidadeMatriculados3Ano]
                            },
                            {
                                type: 'bar',
                                label: 'Não Matriculados em eletivas',
                                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                                data: [quantidadeAlunos1Ano - quantidadeMatriculados1Ano, quantidadeAlunos2Ano - quantidadeMatriculados2Ano, quantidadeAlunos3Ano - quantidadeMatriculados3Ano]
                            }
                        ]
                    };

                    const eletivasData = {
                        labels: ['Eletivas', 'Projetos de Vida', 'Trilhas'],
                        datasets: [{
                            type: 'bar',
                            label: '‎',
                            backgroundColor: ['rgba(13, 110, 253, 0.7)', 'rgba(25, 135, 84, 0.7)', 'rgba(220, 53, 69, 0.7)'],
                            data: [quantidadeEletivas, quantidadeProjetosVida, quantidadeTrilhas]
                        }]
                    };

                    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
                    const textColorSecondary = getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary');
                    const surfaceBorder = getComputedStyle(document.documentElement).getPropertyValue('--surface-border');

                    const maxAlunos = Math.max(...alunosData.datasets.map(dataset => Math.max(...dataset.data)));
                    const maxEletivas = Math.max(...eletivasData.datasets[0].data);

                    setChartOptionsAlunos({
                        maintainAspectRatio: false,
                        plugins: { legend: { labels: { color: textColor } } },
                        scales: {
                            x: { stacked: true, ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
                            y: { stacked: false, ticks: { color: textColorSecondary }, grid: { color: surfaceBorder }, max: maxAlunos + 1 }
                        }
                    });

                    setChartOptionsEletivas({
                        maintainAspectRatio: false,
                        plugins: { legend: { labels: { color: textColor } } },
                        scales: {
                            x: { stacked: false, ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
                            y: { stacked: false, ticks: { color: textColorSecondary }, grid: { color: surfaceBorder }, max: maxEletivas + 1 }
                        }
                    });

                    setChartAlunosData(alunosData);
                    setChartEletivasData(eletivasData);
                } else {
                    console.error('Erro ao buscar dados: Status não é 200.');
                }
            } catch (erro) {
                console.error('Erro ao buscar dados da API:', erro);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [escola.cnpj]);

    const infoCards = [
        { title: 'Total de Alunos', value: `${totalAlunos} alunos`, icon: 'bi-person-arms-up', color: 'primary', link: '/students' },
        { title: 'Total de Turmas', value: `${totalTurmas} turmas`, icon: 'bi-people-fill', color: 'secondary', link: '/students' },
        { title: 'Total de Eletivas', value: `${totalEletivas} eletivas`, icon: 'bi-bookmark-star-fill', color: 'success', link: '/electives' },
        { title: 'Total de Projetos de Vida', value: `${totalProjetosVida} projetos de vida`, icon: 'bi-bookmark-heart-fill', color: 'warning', link: '/electives' },
        { title: 'Total de Trilhas', value: `${totalTrilhas} trilhas`, icon: 'bi-bookmark-check-fill', color: 'danger', link: '/electives' },
        { title: 'Total de Colaboradores', value: `${totalColaboradores} colaboradores`, icon: 'bi-person-lines-fill', color: 'info', link: '/settings/collaborators' }
    ];

    return (
        <>
            <Header />
            <main id="main-section">
                <section id='section'>
                    <div className="box">
                        <div className="title">
                            <span className="d-flex align-items-center gap-2">
                                <img className='image-school' width={50} src={escola?.logotipo || ""} alt="" />
                                <h3 className="m-0 fs-4">{escola?.nome || "Instituição"}</h3>
                            </span>
                            <a className="btn btn-outline-secondary" href="/warnings">
                                <i className="bi bi-megaphone"></i>&ensp;Central de avisos
                            </a>
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
                                                <Chart className="p-1" type="bar" data={chartAlunosData} options={chartOptionsAlunos} style={{ height: '28em' }} />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="border shadow-sm">
                                                <div className="p-2 bg-body-tertiary">
                                                    <h5 className="m-0">Distribuição de Eletivas</h5>
                                                </div>
                                                <Chart className="p-1" type="bar" data={chartEletivasData} options={chartOptionsEletivas} style={{ height: '28em' }} />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
