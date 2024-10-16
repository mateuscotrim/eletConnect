import React, { useEffect, useState } from 'react';
import axios from '../../../configs/axios';
import MHeader from '../../../components/mheader';
import MFooter from '../../../components/mfooter';
import "../../../assets/styles/mMain.css";
import showToast from '../../../utills/toasts';

export default function MHome() {
    const [eletivas, setEletivas] = useState([]);
    const [qnts, setQnts] = useState({});
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [abaSelecionada, setAbaSelecionada] = useState('Eletiva');
    const [inscricoesEncerradas, setInscricoesEncerradas] = useState(false);

    const aluno = JSON.parse(sessionStorage.getItem('aluno')) || {};

    useEffect(() => {
        const fetchEletivas = async () => {
            try {
                const [eletivasResponse, qntsResponse, periodoResponse] = await Promise.all([
                    axios.post('/m/eletivas/minhas-eletivas', { matricula: aluno.matricula, instituicao: aluno.instituicao }),
                    axios.post('/m/eletivas/qnts', { matricula: aluno.matricula, instituicao: aluno.instituicao }),
                    axios.post('/eletivas/obter-periodo', { instituicao: aluno.instituicao })
                ]);

                if (eletivasResponse.status === 200) {
                    setEletivas(formatarEletivas(eletivasResponse.data.eletivas));
                }
                if (qntsResponse.status === 200) {
                    setQnts(qntsResponse.data.qnts[0]);
                }

                if (periodoResponse.status === 200) {
                    const dataAtual = new Date();
                    let dataEncerramento = new Date(periodoResponse.data.dataEncerramento);

                    dataEncerramento = new Date(dataEncerramento.getTime() + 3 * 60 * 60 * 1000);

                    if (dataAtual >= dataEncerramento) {
                        setInscricoesEncerradas(true);
                    }
                }

            } catch (error) {
                showToast('danger', error.response?.data?.mensagem || 'Erro ao listar eletivas. Verifique sua conexão e tente novamente.');
            } finally {
                setCarregando(false);
            }
        };

        if (aluno.matricula && aluno.instituicao) {
            fetchEletivas();
        } else {
            showToast('danger', 'Informações do aluno não disponíveis.');
            setCarregando(false);
        }
    }, [aluno.matricula, aluno.instituicao]);

    const formatarEletivas = (eletivas) => {
        return eletivas.map(eletiva => ({ ...eletiva, professor: Array.isArray(eletiva.professor) ? eletiva.professor.join(', ') : eletiva.professor || 'N/A' }));
    };

    const exibirAbaTrilha = aluno.serie?.charAt(0) !== '1';
    const eletivasFiltradas = eletivas.filter(eletiva => eletiva.tipo === abaSelecionada);
    const tabs = [{ nome: 'Eletiva' }, { nome: 'Projeto de Vida' }, ...(exibirAbaTrilha ? [{ nome: 'Trilha' }] : [])];
    const limites = { Eletiva: exibirAbaTrilha ? 3 : 5, 'Projeto de Vida': 1, Trilha: exibirAbaTrilha ? 1 : 0 };

    const desmatricularEletiva = async (codigo) => {
        if (inscricoesEncerradas) {
            showToast('warning', 'O período de inscrições já foi encerrado.');
            return;
        }

        try {
            const response = await axios.post('/eletivas/desmatricular-aluno', { matricula: aluno.matricula, instituicao: aluno.instituicao, codigo, tipo: abaSelecionada });
            if (response.status === 200) {
                showToast('success', 'Desmatrícula realizada com sucesso!');
                setEletivas(eletivas.filter(eletiva => eletiva.codigo !== codigo));
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showToast('danger', 'Falha ao realizar desmatrícula. Tente novamente.');
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao desmatricular da eletiva!');
        }
    }

    return (
        <>
            <MHeader />
            {/* Ajuste de layout para que o conteúdo principal comece abaixo do cabeçalho */}
            <main
                id="mMain"
                style={{
                                paddingBottom: '5em', // Espaço para rodapé
                    overflowY: 'auto',
                    minHeight: 'calc(100vh - 4.5em - 5em)' // Calcula a altura correta entre cabeçalho e rodapé
                }}
            >
                {carregando ? (
                    <div className='d-flex flex-column align-items-center py-4'>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div id='toast-container' className="toast-container position-absolute bottom-0 start-50 translate-middle-x mb-2"></div>

                        <ul className='d-flex justify-content-evenly align-items-center p-2'>
                            <li className='btn btn-sm text-decoration-underline'>{qnts.qnt_projetoVida}/{limites['Projeto de Vida']} Projeto de Vida</li>
                            {exibirAbaTrilha && (
                                <li className='btn btn-sm text-decoration-underline'>{qnts.qnt_trilha}/{limites.Trilha} Trilha</li>
                            )}
                            <li className='btn btn-sm text-decoration-underline'>{qnts.qnt_eletiva}/{limites.Eletiva} Eletiva</li>
                        </ul>

                        <div className='d-flex flex-column align-items-center'>
                            <ul className="nav nav-tabs justify-content-center mb-4 w-100">
                                {tabs.map(tab => (
                                    <li className="nav-item" key={tab.nome}>
                                        <a className={`nav-link text-black ${abaSelecionada === tab.nome ? 'active' : ''}`} href="#" onClick={() => setAbaSelecionada(tab.nome)}>
                                            {tab.nome}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            <div className="accordion accordion-flush border" style={{ width: '95%' }} id="accordionFlushExample">
                                {eletivasFiltradas.length > 0 ? (
                                    eletivasFiltradas.map(eletiva => (
                                        <div className="accordion-item" key={eletiva.id}>
                                            <h2 className="accordion-header">
                                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#flush-collapse${eletiva.id}`} aria-expanded="false" aria-controls={`flush-collapse${eletiva.id}`}>
                                                    <div className='d-flex flex-column w-100'>
                                                        <span className='d-flex flex-column mb-3'>
                                                            <h4 className='m-0'>{eletiva.nome}</h4>
                                                            <p className='m-0'>{eletiva.alunos_cadastrados}/{eletiva.total_alunos} alunos</p>
                                                        </span>
                                                        <ul>
                                                            <li><b>Professor</b>: {eletiva.professor}</li>
                                                            <li><b>Sala</b>: {eletiva.sala}</li>
                                                            <li><b>Horário</b>: {eletiva.dia} | {eletiva.horario}</li>
                                                        </ul>
                                                    </div>
                                                </button>
                                            </h2>
                                            <div id={`flush-collapse${eletiva.id}`} className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                                <div className="accordion-body">
                                                    {eletiva.descricao}
                                                    <div className='text-end'>
                                                        <button className='btn btn-danger' onClick={() => desmatricularEletiva(eletiva.codigo)} disabled={inscricoesEncerradas}>
                                                            {inscricoesEncerradas ? 'Período Encerrado' : 'Desmatricular'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className='m-0 text-center p-2'>Nenhuma {abaSelecionada.toLowerCase()} encontrada.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
            <MFooter />
        </>
    );
}
