import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';

export default function ModalCadastrarPeriodo({ instituicao }) {
    const [periodoSelecionado, setPeriodoSelecionado] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
        },
    ]);
    const [enviando, setEnviando] = useState(false);

    const formatarData = (data) => {
        return data.toLocaleDateString('pt-BR', { weekday: 'long', month: 'long', day: 'numeric', });
    };

    const calcularDias = (startDate, endDate) => {
        return Math.ceil((endDate - startDate) / (1000 * 3600 * 24));
    };

    const definirPeriodo = async (dataInicio, dataFim) => {
        try {
            const response = await axios.post('/eletivas/definir-periodo', { instituicao, dataInicio: dataInicio.toISOString(), dataFim: dataFim.toISOString() });
            if (response.status === 200) {
                sessionStorage.setItem('mensagemSucesso', response.data.mensagem);
                window.location.reload();
            }
        } catch (error) {
            showToast('danger', error.response?.data.mensagem || 'Erro ao definir o período de inscrições.');
        }
    };

    const salvarPeriodo = async (e) => {
        e.preventDefault();
        setEnviando(true);

        const dataInicio = new Date(periodoSelecionado[0].startDate);
        const dataFim = new Date(periodoSelecionado[0].endDate);
        dataInicio.setUTCHours(0, 0, 0, 0);
        dataFim.setUTCHours(23, 59, 59, 999);

        await definirPeriodo(dataInicio, dataFim);
        setEnviando(false);
    };

    return (
        <div className="modal fade" id="definirPeriodo" tabIndex="-1" aria-labelledby="definirPeriodoLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-journal-bookmark-fill fs-3"></i>
                            <h4 className='m-0 fs-4'>Eletivas</h4>
                            <i className="bi bi-arrow-right-short fs-4"></i>
                            <h5 className="m-0">Definir período</h5>
                        </div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form onSubmit={salvarPeriodo}>
                        <div className="text-center m-2">
                            <p className='mx-4'>O período de inscrições vai de <strong>{formatarData(periodoSelecionado[0].startDate)}</strong> até <strong>{formatarData(periodoSelecionado[0].endDate)}</strong>, totalizando <strong>{calcularDias(periodoSelecionado[0].startDate, periodoSelecionado[0].endDate)}</strong> dias.</p>
                            <DateRange editableDateInputs={true} onChange={(item) => setPeriodoSelecionado([item.selection])} moveRangeOnFirstSelection={false} ranges={periodoSelecionado} />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={enviando}>
                                {enviando ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : (<> <i className="bi bi-calendar-check"></i>&ensp;Definir </>)}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
