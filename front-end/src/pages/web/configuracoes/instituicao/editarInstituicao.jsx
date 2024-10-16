import React, { useState } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';
import supabase from '../../../../configs/supabase';

export default function SettingsInstituicao() {
    const escola = JSON.parse(sessionStorage.getItem('escola'));

    const [eNome, setENome] = useState(escola?.nome || '');
    const [eCep, setECEP] = useState(escola?.cep || '');
    const [eEndereco, setEEndereco] = useState(escola?.endereco || '');
    const [eTelefone, setETelefone] = useState(escola?.telefone || '');
    const [logo, setLogo] = useState(null);
    const [logotipoUrl, setLogotipoUrl] = useState(escola?.logotipo || '');
    const [loading, setLoading] = useState(false);

    const verificarCEP = async (cep) => {
        if (!cep) return;
        try {
            const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${cep}`, { withCredentials: false });
            if (response.status === 200) {
                setEEndereco(response.data.street);
            }
        } catch (error) {
            showToast('danger', 'Erro ao verificar CEP.');
        }
    };

    const alterarLogotipo = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            const previewUrl = URL.createObjectURL(file);
            setLogotipoUrl(previewUrl);
        }
    };

    const armazenarLogotipo = async () => {
        if (!logo) return logotipoUrl;

        const pathF = `LOGOTIPO_${Date.now()}`;

        try {
            const { error } = await supabase.storage.from('logotipo').upload(pathF, logo);
            if (error) {
                showToast('danger', error.message);
                return null;
            }

            const { data, error: publicUrlError } = supabase.storage.from('logotipo').getPublicUrl(pathF);
            if (publicUrlError) {
                showToast('danger', publicUrlError.message);
                return null;
            }

            return data.publicUrl;
        } catch (error) {
            showToast('danger', 'Erro ao armazenar a logo.');
            return null;
        }
    };

    const alterarInstituicao = async (e) => {
        e.preventDefault();
        setLoading(true);
        const logotipoUrlAtualizado = await armazenarLogotipo();
        if (!logotipoUrlAtualizado) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('/instituicao/editar', { cnpj: escola.cnpj, nome: eNome, cep: eCep, endereco: eEndereco, telefone: eTelefone, logotipo: logotipoUrlAtualizado });
            if (response.status === 200) {
                showToast('success', 'Instituição atualizada com sucesso!');
                sessionStorage.setItem('escola', JSON.stringify({ ...escola, nome: eNome, cep: eCep, endereco: eEndereco, telefone: eTelefone, logotipo: logotipoUrlAtualizado }));
            }
        } catch (error) {
            showToast('danger', error.response ? error.response.data.mensagem : 'Erro ao atualizar instituição.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-absolute bottom-0 start-50 translate-middle-x p-3"></div>
            <div className="d-flex gap-4">
                <div className="d-flex flex-column align-items-center gap-3">
                    <img width={250} src={logotipoUrl || 'https://via.placeholder.com/150'} alt="Logo da instituição" />
                    <input type="file" onChange={alterarLogotipo} />
                </div>
                <form onSubmit={alterarInstituicao} className="w-100">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Inscrição estadual</label>
                            <input type="text" className="form-control" value={escola?.inscricaoEstadual} disabled />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">CNPJ</label>
                            <input type="text" className="form-control" value={escola?.cnpj} disabled />
                        </div>
                        <div className="col-9">
                            <label className="form-label">Nome da instituição</label>
                            <input type="text" className="form-control" value={eNome} onChange={(e) => setENome(e.target.value)} />
                        </div>
                        <div className="col-3">
                            <label className="form-label">Telefone (+55)</label>
                            <input type="text" className="form-control" value={eTelefone} onChange={(e) => setETelefone(e.target.value)} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">CEP</label>
                            <input type="text" className="form-control" value={eCep} onChange={(e) => setECEP(e.target.value)} onBlur={() => verificarCEP(eCep)} />
                        </div>
                        <div className="col-md-9">
                            <label className="form-label">Endereço</label>
                            <input type="text" className="form-control" value={eEndereco} onChange={(e) => setEEndereco(e.target.value)} />
                        </div>
                        <div className="text-end mt-4">
                            <button type='submit' className="btn btn-success" disabled={loading}>
                                <i className="bi bi-pencil"></i>&ensp;{loading ? 'Editando...' : 'Editar'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
