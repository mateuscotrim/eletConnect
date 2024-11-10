import React, { useState, useEffect } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';
import ExcelJS from 'exceljs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Tooltip } from 'bootstrap';

export default function ModalCadastrarPlanilha({ escola }) {
    const [dados, setDados] = useState([]);
    const [erros, setErros] = useState({});
    const [loading, setLoading] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [progresso, setProgresso] = useState(0);

    useEffect(() => {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map((tooltipTriggerEl) => new Tooltip(tooltipTriggerEl));
    }, [dados, erros]);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        if (!file) {
            showToast('danger', 'Nenhum arquivo selecionado.');
            return;
        }

        const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
        if (!validTypes.includes(file.type)) {
            showToast('danger', 'Formato de arquivo não suportado!');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('danger', 'O arquivo excede o tamanho máximo permitido (5MB).');
            return;
        }

        lerArquivo(file);
    };

    const lerArquivo = async (file) => {
        setLoading(true);

        const workbook = new ExcelJS.Workbook();
        const reader = new FileReader();

        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            await workbook.xlsx.load(arrayBuffer);

            const worksheet = workbook.worksheets[0]; // Obtém a primeira aba da planilha
            const headers = worksheet.getRow(1).values.slice(1).map(header => header.toString().trim().toLowerCase());

            const normalizedData = [];
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) { // Ignora o cabeçalho
                    const normalizedRow = {};
                    row.values.slice(1).forEach((value, index) => {
                        normalizedRow[headers[index]] = value;
                    });
                    normalizedData.push(normalizedRow);
                }
            });

            setDados(normalizedData);
            validarDadosNoBackend(normalizedData);
        };

        reader.readAsArrayBuffer(file);
    };

    const validarDadosNoBackend = async (dados) => {
        try {
            setLoading(true);
            const response = await axios.post('/estudantes/verificar-dados', { dados, instituicao: escola.cnpj });
            if (response.data.erros) {
                setErros(response.data.erros);
            } else {
                setErros({});
            }
        } catch (error) {
            showToast('danger', 'Erro ao validar dados no servidor.');
        } finally {
            setLoading(false);
        }
    };

    const cadastrarPlanilha = async () => {
        if (Object.keys(erros).length > 0) {
            showToast('danger', 'Existem erros de validação. Corrija antes de prosseguir.');
            return;
        }

        setEnviando(true);
        try {
            const response = await axios.post('/estudantes/cadastrar-planilha', { dados, instituicao: escola.cnpj }, {
                onUploadProgress: progressEvent => {
                    setProgresso(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                }
            });

            if (response.status === 201) {
                sessionStorage.setItem('mensagemSucesso', response.data.mensagem);
                window.location.reload();
            }
        } catch (error) {
            showToast('danger', error.response?.data.mensagem || 'Erro ao cadastrar alunos.');
        } finally {
            setEnviando(false);
            setProgresso(0);
        }
    };

    const gerarPDF = async () => {
        const doc = await PDFDocument.create();
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const titleFontSize = 16;
        const textFontSize = 12;
        const pageMargin = 50;
        let currentPage = doc.addPage([595.28, 841.89]);
        let yPosition = currentPage.getHeight() - pageMargin;

        const addNewPageIfNeeded = () => {
            if (yPosition < pageMargin) {
                currentPage = doc.addPage();
                yPosition = currentPage.getHeight() - pageMargin;
            }
        };

        // Cabeçalho do PDF
        currentPage.drawText('Relatório de Erros de Validação', {
            x: pageMargin,
            y: yPosition,
            size: titleFontSize,
            font: font,
            color: rgb(0, 0, 0.8),
        });

        // Data atual
        currentPage.drawText(`Data: ${new Date().toLocaleDateString('pt-BR')}`, {
            x: currentPage.getWidth() - pageMargin - 100,
            y: yPosition,
            size: textFontSize,
            font: font,
            color: rgb(0, 0, 0),
        });

        yPosition -= 40;
        addNewPageIfNeeded();

        if (Object.keys(erros).length > 0) {
            currentPage.drawText('Alunos com Erros de Validação:', {
                x: pageMargin,
                y: yPosition,
                size: textFontSize,
                font: font,
                color: rgb(0.8, 0, 0),
            });

            yPosition -= 20;
            addNewPageIfNeeded();

            Object.entries(erros).forEach(([index, erro]) => {
                const aluno = dados[index] || {};
                currentPage.drawText(`Matrícula: ${aluno.matricula || 'N/A'}, Nome: ${aluno.nome || 'N/A'}, Erros: ${Object.values(erro).join(', ')}`, {
                    x: pageMargin,
                    y: yPosition,
                    size: textFontSize,
                    font: font,
                    color: rgb(0, 0, 0),
                });

                yPosition -= 20;
                addNewPageIfNeeded();
            });
        } else {
            currentPage.drawText('Nenhum erro encontrado nos dados fornecidos.', {
                x: pageMargin,
                y: yPosition,
                size: textFontSize,
                font: font,
                color: rgb(0, 0.6, 0),
            });
        }

        // Salva o PDF e faz o download
        const pdfBytes = await doc.save();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
        link.download = 'Relatorio_Erros_Validacao.pdf';
        link.click();
    };

    return (
        <>
            <div className="modal fade" id="cadastrarLista" tabIndex="-1" aria-labelledby="cadastrarListaLabel" aria-hidden="true">
                <div className={`modal-dialog ${loading || dados.length > 0 ? 'modal-dialog-scrollable modal-xl' : ''}`}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className="d-flex align-items-center gap-2">
                                    <i className="bi bi-person-arms-up fs-3"></i>
                                    <h4 className="m-0 fs-4">Estudantes</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Cadastrar via <b className='text-success'>Planilha</b></h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <input type="file" className="form-control" accept=".xls,.xlsx,.csv" onChange={handleFileUpload} />
                            <small className="form-text text-muted">Selecione um arquivo no formato .xls, .xlsx ou .csv</small>

                            {loading && (
                                <div className="text-center my-3">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Carregando...</span>
                                    </div>
                                </div>
                            )}

                            {dados.length > 0 && (
                                <>
                                    <div className='d-flex align-items-center gap-2 mt-4'>
                                        <i className="bi bi-eye h5 m-0"></i>
                                        <h5 className='m-0'>Pré-visualização</h5>
                                        <span className='separator mx-1'>|</span>
                                        <p className='m-0'><strong>{dados.length}</strong> aluno(s) encontrado(s)</p>
                                    </div>

                                    <div className='d-flex flex-wrap gap-2 align-items-center py-2'>
                                        <p className={`m-0 p-1 d-flex align-items-center gap-1 ${dados.length - Object.keys(erros).length > 0 ? 'bg-success-subtle text-success' : ''}`}>
                                            <i className="bi bi-check-circle me-1"></i>
                                            <strong>{dados.length - Object.keys(erros).length}</strong> aluno(s) sem erros de validação.
                                        </p>
                                        <p className={`m-0 p-1 d-flex align-items-center gap-1 ${Object.keys(erros).length > 0 ? 'bg-danger-subtle text-danger' : ''}`}>
                                            <i className="bi bi-exclamation-circle me-1"></i>
                                            <strong>{Object.keys(erros).length}</strong> aluno(s) com erros de validação.
                                        </p>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover mt-3">
                                            <thead className="table-light">
                                                <tr>
                                                    {Object.keys(dados[0]).map((key) => (
                                                        <th key={key}>{key}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dados.map((row, index) => (
                                                    <tr key={index}>
                                                        {Object.entries(row).map(([campo, valor], i) => (
                                                            <td key={i} className={erros[index] && erros[index][campo] ? 'table-danger' : ''} data-bs-toggle={erros[index] && erros[index][campo] ? 'tooltip' : ''} title={erros[index] && erros[index][campo] ? erros[index][campo] : ''} >
                                                                {valor}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => window.location.reload()}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary" disabled={dados.length === 0} data-bs-toggle="modal" data-bs-target="#confirmarCadastro">
                                <i className="bi bi-arrow-bar-right"></i>&ensp;Continuar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Confirmar Cadastro via Planilha */}
            <div className="modal fade" id="confirmarCadastro" tabIndex="-1" aria-labelledby="confirmarCadastroLabel" aria-hidden="true">
                <div className={`modal-dialog ${erros && Object.keys(erros).length > 0 ? 'modal-lg modal-dialog-scrollable' : ''}`}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className="d-flex align-items-center gap-2">
                                    <i className="bi bi-person-arms-up fs-3"></i>
                                    <h4 className="m-0 fs-4">Estudantes</h4>
                                </span>
                                <i className="bi bi-arrow-right-short fs-4"></i>
                                <h5 className="m-0">Cadastrar via <b className='text-success'>Planilha</b></h5>
                            </div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {Object.keys(erros).length > 0 ? (
                                <>
                                    <p>
                                        Foram encontrados <strong className="text-danger">{Object.keys(erros).length} alunos</strong> com erros de validação, e <strong className="text-success">{dados.length - Object.keys(erros).length} alunos</strong> sem erros. É necessário corrigir os erros antes de prosseguir com o cadastro.
                                    </p>
                                    <div className="alert alert-danger" role="alert">
                                        <strong>Alunos com erros:</strong>
                                        <ul className="m-0 mt-2">
                                            {Object.entries(erros).map(([index, erro]) => (
                                                <li key={index}>
                                                    <strong>Matrícula:</strong> {dados[index]?.matricula || 'N/A'} -
                                                    <strong> Erros:</strong> {Object.values(erro).join(', ')}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <p>Todos os dados foram validados corretamente. Deseja prosseguir com o cadastro?</p>
                            )}
                        </div>
                        <div className="modal-footer d-flex justify-content-between">
                            {/* Se houver erros, exibe o botão de download, senão ocupa espaço com um span invisível */}
                            {Object.keys(erros).length > 0 ? (
                                <button type="button" className="btn btn-danger" onClick={gerarPDF} title='Baixar arquivo PDF'>
                                    <i className="bi bi-file-arrow-down"></i>&ensp;Relatório de Erros - (PDF)
                                </button>
                            ) : (
                                <span></span>
                            )}

                            <div className="d-flex gap-2">
                                <button type="button" className="btn btn-secondary" onClick={() => window.location.reload()}>
                                    Cancelar
                                </button>

                                {/* Renderizar o botão de cadastrar somente se não houver erros */}
                                {Object.keys(erros).length === 0 && (
                                    <button className="btn btn-primary" onClick={cadastrarPlanilha} disabled={enviando}>
                                        {enviando ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <><i className="bi bi-person-add"></i>&ensp;Cadastrar</>}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra de progresso customizada */}
            {enviando && (
                <div className="progress mt-3" style={{ height: '25px' }}>
                    <div
                        className="progress-bar progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        style={{ width: `${progresso}%` }}
                        aria-valuenow={progresso}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    >
                        {progresso}%
                    </div>
                </div>
            )}
        </>
    );
}

