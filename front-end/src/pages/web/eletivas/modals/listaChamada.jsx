import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';
import { DateTime } from 'luxon';
import '../../../../assets/styles/my-bootstrap.css';
import '../../../../assets/styles/listaChamada.css';

const BotaoImprimir = ({ texto = "Imprimir", className = "btn btn-primary btn-sm", style = {}, onClick }) => {
    return (
        <button className={className} style={style} onClick={onClick}>
            <i className="bi bi-printer"></i> {texto}
        </button>
    );
};

const ListaChamada = React.forwardRef((props, ref) => {
    const [searchParams] = useSearchParams();
    const codigoEletiva = searchParams.get('code');

    const [alunosMatriculados, setAlunosMatriculados] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [detalhesEletiva, setDetalhesEletiva] = useState({});

    const user = JSON.parse(sessionStorage.getItem('user'));
    const escola = JSON.parse(sessionStorage.getItem('escola'));

    useEffect(() => {
        if (codigoEletiva) {
            listarAlunosMatriculados();
            buscarDetalhesEletiva();
        }
    }, [codigoEletiva]);

    const listarAlunosMatriculados = async () => {
        try {
            setCarregando(true);
            const { data } = await axios.post('/eletivas/listar-alunos-eletiva', { instituicao: user.instituicao, codigo: codigoEletiva });
            const alunosOrdenados = (data || []).sort((a, b) => a.nome.localeCompare(b.nome));
            setAlunosMatriculados(alunosOrdenados);
        } catch (error) {
            showToast('danger', 'Erro ao listar alunos da eletiva.');
        } finally {
            setCarregando(false);
        }
    };

    const buscarDetalhesEletiva = async () => {
        try {
            setCarregando(true);
            const { data } = await axios.post('/eletivas/buscar', { instituicao: user.instituicao, codigo: codigoEletiva });
            const detalhes = data.find(e => e.codigo === codigoEletiva);
            if (detalhes) {
                setDetalhesEletiva(detalhes);
            }
        } catch (error) {
            showToast('danger', error.response?.data?.mensagem || 'Erro ao buscar detalhes da eletiva.');
        } finally {
            setCarregando(false);
        }
    };

    const obterDataInicioSemestre = () => {
        const hoje = DateTime.now().setZone('America/Sao_Paulo');
        const anoAtual = hoje.year;
        return hoje.month < 6
            ? DateTime.fromObject({ year: anoAtual, month: 1, day: 1 }, { zone: 'America/Sao_Paulo' }).setLocale('pt-BR')
            : DateTime.fromObject({ year: anoAtual, month: 7, day: 1 }, { zone: 'America/Sao_Paulo' }).setLocale('pt-BR');
    };

    const mapearDiaSemana = (dia) => {
        switch (dia.toLowerCase()) {
            case 'terça-feira':
            case 'terca-feira':
                return 2;
            case 'quinta-feira':
                return 4;
            default:
                return null;
        }
    };

    const ajustarParaDiaSemana = (data, diaSemana) => {
        const diferenca = diaSemana - data.weekday;
        return diferenca >= 0 ? data.plus({ days: diferenca }) : data.plus({ days: diferenca + 7 });
    };

    const gerarDiasSemestre = (diasSemana, inicioSemestre) => {
        const diasSemanaArray = diasSemana.split(' e ').map(dia => mapearDiaSemana(dia)).filter(dia => dia !== null);
        const diasSemestre = [];
        let dataInicio = inicioSemestre;

        for (let semana = 0; semana < 24; semana++) {
            diasSemanaArray.forEach(diaSemana => {
                const diaAula = ajustarParaDiaSemana(dataInicio, diaSemana);
                const diaFormatado = diaAula.setLocale('pt-BR').toFormat('dd/MM/yyyy');
                diasSemestre.push(diaFormatado);
            });
            dataInicio = dataInicio.plus({ weeks: 1 });
        }

        return diasSemestre;
    };

    const diasSemestre = detalhesEletiva.dia ? gerarDiasSemestre(detalhesEletiva.dia, obterDataInicioSemestre()) : [];

    const agruparDiasPorMes = (dias) => {
        const meses = {};
        dias.forEach(dia => {
            const [day, month, year] = dia.split('/');
            const nomeMes = DateTime.fromObject({ day: parseInt(day), month: parseInt(month), year: parseInt(year) }, { zone: 'America/Sao_Paulo' }).setLocale('pt-BR').toFormat('MMMM');
            if (!meses[nomeMes]) {
                meses[nomeMes] = [];
            }
            meses[nomeMes].push(day);
        });
        return meses;
    };

    const mesesComDias = agruparDiasPorMes(diasSemestre);

    return (
        <div className="container lista-chamada-container" ref={ref}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <span className='d-flex align-items-center gap-2'>
                        {escola.logotipo && (
                            <img src={escola.logotipo} width={50} alt="Logotipo da escola" />
                        )}
                        <h4 className='m-0'>{escola.nome}</h4>
                    </span>
                    <h5 className='m-0'>| Lista de Chamada</h5>
                    <p className='m-0'><small><strong>Nome</strong>: {detalhesEletiva.nome}</small></p>
                    <p className='m-0'><small><strong>Professor</strong>: {detalhesEletiva.professor}</small></p>
                    <p className='m-0'><small><strong>Sala:</strong> {detalhesEletiva.sala}</small></p>
                </div>
                <BotaoImprimir texto="Imprimir Lista" className="btn btn-primary btn-print" onClick={props.onPrint} />
            </div>

            {carregando ? (
                <div className="d-flex justify-content-center my-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                </div>
            ) : (
                <div className="table-responsive no-scroll">
                    <table className="table table-bordered lista-chamada-table" style={{ width: '100%', tableLayout: 'fixed', fontSize: '8px' }}>
                        <thead className="table-dark">
                            <tr>
                                <th scope="col" className="align-middle text-center" rowSpan="2" style={{ width: '30px', fontSize: '10px' }}>#</th>
                                <th scope="col" className="align-middle text-left" rowSpan="2" style={{ width: '200px', fontSize: '10px' }}>Nome do Aluno</th>
                                {Object.keys(mesesComDias).map((mes, index) => (
                                    <th key={index} scope="col" colSpan={mesesComDias[mes].length} className="text-center align-middle" style={{ fontSize: '8px' }}>
                                        {mes.charAt(0).toUpperCase() + mes.slice(1)}
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                {Object.values(mesesComDias).flat().map((dia, index) => (
                                    <th key={index} scope="col" className="rotated-header text-center align-middle" style={{ width: '10px', height: '20px', fontSize: '8px', padding: '0', margin: '0' }}>
                                        <span className="date-span" style={{ display: 'block', lineHeight: '20px', textAlign: 'center' }}>{dia}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {alunosMatriculados.length > 0 ? (
                                alunosMatriculados.map((aluno, index) => (
                                    <tr key={aluno.matricula}>
                                        {/* Mostrar número sequencial em vez da matrícula */}
                                        <th scope="row" className="align-middle text-center" style={{ fontSize: '10px' }}>{index + 1}</th>
                                        <td className="align-middle text-left" style={{ wordWrap: 'break-word', fontSize: '10px', whiteSpace: 'normal', overflowWrap: 'break-word' }}>{aluno.nome}</td>
                                        {Object.values(mesesComDias).flat().map((dia, diaIndex) => (
                                            <td key={diaIndex} className="text-center align-middle" style={{ height: '20px', fontSize: '8px', padding: '0px' }}>
                                                {/* Célula vazia para preenchimento manual */}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2 + diasSemestre.length} className="text-center" style={{ fontSize: '8px' }}>
                                        Nenhum aluno matriculado encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
});

export default function ChamadaComImpressao() {
    const componentRef = useRef();

    const handlePrint = () => {
        const conteudoOriginal = document.body.innerHTML;
        const conteudoParaImprimir = componentRef.current.innerHTML;

        document.body.innerHTML = conteudoParaImprimir;
        window.print();

        document.body.innerHTML = conteudoOriginal;
        window.location.reload();
    };

    return (
        <div>
            {/* Passa a referência para o componente ListaChamada */}
            <ListaChamada ref={componentRef} onPrint={handlePrint} />
        </div>
    );
}
