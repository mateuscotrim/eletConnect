import React, { useState, useEffect } from 'react';
import axios from '../../../configs/axios';
import MHeader from '../../../components/mheader';
import MFooter from '../../../components/mfooter';
import '../../../assets/styles/my-bootstrap.css';

export default function Home() {
    const [aulas, setAulas] = useState([]);
    const [avisos, setAvisos] = useState([]); // Estado para os avisos
    const [carregando, setCarregando] = useState(true);

    const aluno = JSON.parse(sessionStorage.getItem('aluno'));

    useEffect(() => {
        const carregarDados = async () => {
            setCarregando(true);
            try {
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

        carregarDados();
    }, [aluno.instituicao, aluno.serie, aluno.turma]);

    return (
        <>
            <MHeader />
            <main id="mMain" className="p-4" style={{ paddingBottom: '5em', overflowY: 'auto' }}>
                {carregando ? (
                    <div className="d-flex justify-content-center align-items-center mb-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </div>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-4">
                        {/* Quadro de Avisos */}
                        <div id="AREA-QUADRO">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center gap-2">
                                    <i className="bi bi-bell h4 mb-0"></i>
                                    <h6 className="mb-0">QUADRO DE AVISOS</h6>
                                    {/* Mostrar badge apenas se houver mais de um aviso */}
                                    {avisos.length > 1 && (
                                        <span className="badge text-bg-danger">{avisos.length}</span>
                                    )}
                                </div>
                                <a href="/m/home"><i className="bi bi-arrow-return-left h4 m-0 text-black"></i></a>
                            </div>

                            {avisos.length > 0 ? (
                                avisos.map((aviso, index) => (
                                    <div
                                        key={index}
                                        className={`shadow-sm border-left-${aviso.cor || 'primary'} bg-light-subtle p-3 mb-3`}
                                    >
                                        <h6 className={`text-${aviso.cor || 'primary'}`}>
                                            {aviso.titulo || 'Sem título'}
                                        </h6>
                                        <p className="text-muted m-0">{aviso.conteudo || 'Sem conteúdo'}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted">Nenhum aviso disponível.</p>
                            )}
                        </div>
                    </div>
                )}
            </main>
            <MFooter />
        </>
    );
}
