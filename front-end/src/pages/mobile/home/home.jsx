import React, { useState, useEffect } from 'react';
import axios from '../../../configs/axios';
import MHeader from '../../../components/mheader';
import MFooter from '../../../components/mfooter';
import '../../../assets/styles/my-bootstrap.css'; // Certifique-se de que o arquivo de estilos seja carregado

const diasSemana = [
    { key: 'Terça-feira', label: 'Terça-feira' },
    { key: 'Quinta-feira', label: 'Quinta-feira' }
];

const obterPrioridadeHorario = (horario) => {
    if (horario.includes('1º e 2º')) return 1;
    if (horario.includes('3º e 4º')) return 2;
    if (horario.includes('5º e 6º')) return 3;
    return 4;
};

export default function Home() {
    const [aulas, setAulas] = useState([]);
    const [avisos, setAvisos] = useState([]);  // Estado para os avisos
    const [diaSelecionado, setDiaSelecionado] = useState('');
    const [carregando, setCarregando] = useState(true);

    const aluno = JSON.parse(sessionStorage.getItem('aluno'));

    useEffect(() => {
        const carregarDados = async () => {
            setCarregando(true);
            try {
                // Carregar eletivas
                const { data: eletivasData } = await axios.post('/m/eletivas/minhas-eletivas', {
                    matricula: aluno.matricula,
                    instituicao: aluno.instituicao
                });
                setAulas(eletivasData.eletivas || []);

                // Carregar avisos
                const { data: avisosData } = await axios.post('/m/avisos/exibir-avisos', {
                    instituicao: aluno.instituicao,
                    serie: aluno.serie,
                    turma: aluno.turma
                });
                // Ordena avisos mais recentes primeiro
                const avisosOrdenados = avisosData.avisos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setAvisos(avisosOrdenados || []);
            } catch (error) {
                showToast('danger', 'Erro ao buscar dados. Tente novamente mais tarde!');
            } finally {
                setCarregando(false);
            }
        };

        const diaAtual = new Date().getDay();
        const diaSemana = diaAtual === 2 ? 'Terça-feira' : diaAtual === 4 ? 'Quinta-feira' : 'SemAula';
        setDiaSelecionado(diaSemana);

        carregarDados();
    }, [aluno.matricula, aluno.instituicao]);

    const eletivasFiltradas = aulas
        .filter((aula) => aula.dia === diaSelecionado || aula.dia === 'Terça-feira e Quinta-feira')
        .sort((a, b) => obterPrioridadeHorario(a.horario) - obterPrioridadeHorario(b.horario));

    return (
        <>
            <MHeader />
            <main id="mMain" className='container pt-3' style={{ paddingBottom: '5em', overflowY: 'auto' }}>
                {carregando ? (
                    <div className="d-flex justify-content-center align-items-center mb-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </div>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-4">
                        {/* Quadro de Avisos */}
                        <div id='AREA-QUADRO'>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center gap-2">
                                    <i className="bi bi-bell h4 mb-0"></i>
                                    <h6 className="mb-0">QUADRO DE AVISOS</h6>
                                    {/* Mostrar badge apenas se houver mais de um aviso */}
                                    {avisos.length > 1 && (
                                        <span className="badge text-bg-danger">{avisos.length}</span>
                                    )}
                                </div>
                                <a href="/m/warnings"><i className="bi bi-arrow-right h4 m-0 text-black"></i></a>
                            </div>

                            <div className={`shadow-sm border-left-${avisos[0]?.cor || 'primary'} bg-light-subtle p-3`}>
                                {avisos.length > 0 ? (
                                    <div>
                                        <h6 className={`text-${avisos[0]?.cor || 'primary'}`}>{avisos[0]?.titulo || 'Sem título'}</h6>
                                        <p className="text-muted m-0">{avisos[0]?.conteudo || 'Sem conteúdo'}</p>
                                    </div>
                                ) : (
                                    <p className="text-muted">Nenhum aviso disponível.</p>
                                )}
                            </div>

                        </div>

                        {/* Aulas */}
                        <div id='AREA-AULAS'>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center gap-2">
                                    <i className="bi bi-backpack h4 m-0"></i>
                                    <h6 className="mb-0">AULAS</h6>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-3 mb-4">
                                    <div className="d-flex gap-2">
                                        {diasSemana.map((dia, index) => (
                                            <button key={index} className={`btn btn-outline-primary w-100 ${diaSelecionado === dia.key ? 'active' : ''}`} onClick={() => setDiaSelecionado(dia.key)}> {dia.label}</button>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-md-9">
                                    {diaSelecionado === 'SemAula' ? (
                                        <p className="text-muted">Sem aula hoje</p>
                                    ) : (
                                        eletivasFiltradas.length > 0 ? (
                                            eletivasFiltradas.map((aula, index) => (
                                                <div key={index} className="mb-2 border shadow-sm">
                                                    <div className="p-3" style={{ backgroundColor: '#4e73df' }}>
                                                        <p className='m-0 text-white h5'><i className="bi bi-clock h5"></i>&ensp;{aula.horario}</p>
                                                    </div>
                                                    <div className="p-2">
                                                        <h4 className="card-title mb-2">{aula.nome}</h4>
                                                        <div className='d-flex justify-content-between w-100'>
                                                            <div className='w-50'>
                                                                <i className="bi bi-person"></i>&ensp;Professor <br />
                                                                <b>{aula.professor}</b>
                                                            </div>
                                                            <div className='w-50'>
                                                                <i className="bi bi-geo-alt"></i>&ensp;Sala <br />
                                                                <b>{aula.sala}</b>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted">Sem aulas para {diaSelecionado}</p>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <MFooter />
        </>
    );
}
