import React, { useState, useRef } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';
import supabase from '../../../../configs/supabase';

export default function SettingsInstituicao() {
    const escola = JSON.parse(sessionStorage.getItem('escola')) || {};

    const [eNome, setENome] = useState(escola.nome || '');
    const [eCep, setECEP] = useState(escola.cep || '');
    const [eEndereco, setEEndereco] = useState(escola.endereco || '');
    const [eTelefone, setETelefone] = useState(escola.telefone || '');
    const [eCnpj, setECnpj] = useState(escola.cnpj || '');
    const [logo, setLogo] = useState(null);
    const [logotipoUrl, setLogotipoUrl] = useState(escola.logotipo || '');
    const [loading, setLoading] = useState(false);

    // Referência para o input de arquivo
    const inputFileRef = useRef(null);

    const verificarCEP = async (cep) => {
        if (!cep || cep.trim().length !== 8) return;
        try {
            const formattedCep = cep.trim().replace(/\D/g, '');
            const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${formattedCep}`);
            if (response.status === 200) {
                setEEndereco(response.data.street);
            }
        } catch {
            showToast('danger', 'Erro ao verificar CEP.');
        }
    };

    const alterarLogotipo = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('Arquivo selecionado:', file);
            setLogo(file);

            const previewUrl = URL.createObjectURL(file);
            setLogotipoUrl(previewUrl);

            return () => {
                URL.revokeObjectURL(previewUrl); // Libera a URL para evitar vazamentos de memória
            };
        }
    };

    const removerLogotipo = async () => {
        if (!logotipoUrl || logotipoUrl === 'https://via.placeholder.com/250') {
            showToast('info', 'Nenhuma foto para remover.');
            return;
        }

        try {
            const fotoPath = logotipoUrl.split('/').pop(); // Extraia o caminho do arquivo da URL
            const { error } = await supabase.storage.from('avatar').remove([fotoPath]);
            if (error) {
                console.error('Erro ao remover a foto:', error.message);
                showToast('danger', 'Erro ao remover a foto.');
                return;
            }

            setLogotipoUrl(null);
            setLogo(null); // Redefine a variável logo para permitir a adição de outra foto
            if (inputFileRef.current) {
                inputFileRef.current.value = ''; // Limpa o input de arquivo
            }
            sessionStorage.setItem('escola', JSON.stringify({ ...escola, logotipo: null }));
            showToast('success', 'Logotipo removido com sucesso.');
        } catch (error) {
            console.error('Erro inesperado ao remover o logotipo:', error);
            showToast('danger', 'Erro inesperado ao remover o logotipo.');
        }
    };

    const armazenarFoto = async () => {
        if (!logo) {
            console.warn('Nenhuma foto foi selecionada para upload.');
            return null;
        }

        const caminhoFoto = `LOGO_${Date.now()}`;

        try {
            console.log('Iniciando upload da foto...');
            const { error: uploadError } = await supabase.storage.from('avatar').upload(caminhoFoto, logo);

            if (uploadError) {
                console.error('Erro durante o upload da foto:', uploadError.message);
                showToast('danger', uploadError.message);
                return null;
            }

            console.log('Upload realizado com sucesso. Tentando obter a URL pública...');
            const { data, error: publicUrlError } = supabase.storage.from('avatar').getPublicUrl(caminhoFoto);

            if (publicUrlError) {
                console.error('Erro ao obter a URL pública da foto:', publicUrlError.message);
                showToast('danger', publicUrlError.message);
                return null;
            }

            console.log('URL pública da foto obtida:', data.publicUrl);
            return data.publicUrl;
        } catch (error) {
            console.error('Erro inesperado ao armazenar a foto:', error);
            showToast('danger', 'Erro ao armazenar a foto.');
            return null;
        }
    };

    const alterarInstituicao = async (e) => {
        e.preventDefault();
        setLoading(true);

        let fotoUrlAtualizado = logotipoUrl;
        if (logo) {
            fotoUrlAtualizado = await armazenarFoto();
            console.log('URL da foto atualizada:', fotoUrlAtualizado);
        }

        if (logo && !fotoUrlAtualizado) {
            console.warn('Nenhuma URL de foto válida foi gerada.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('/instituicao/editar', {
                cnpj: eCnpj,
                nome: eNome,
                cep: eCep,
                endereco: eEndereco,
                telefone: eTelefone,
                logotipo: fotoUrlAtualizado !== 'https://via.placeholder.com/250' ? fotoUrlAtualizado : null,
            });

            if (response.status === 200) {
                sessionStorage.setItem('escola', JSON.stringify({
                    ...escola,
                    nome: eNome,
                    cep: eCep,
                    endereco: eEndereco,
                    telefone: eTelefone,
                    logotipo: fotoUrlAtualizado !== 'https://via.placeholder.com/250' ? fotoUrlAtualizado : null,
                }));
                sessionStorage.setItem('mensagemSucesso', 'Instituição atualizada com sucesso.');
                window.location.reload();
            }
        } catch (error) {
            console.error('Erro na requisição:', error.response ? error.response.data : error);
            showToast('danger', error.response ? error.response.data.mensagem : 'Erro ao atualizar instituição.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="d-flex align-items-center gap-4">
                <div className='text-end'>
                    <div className="d-flex flex-column align-items-center gap-3">
                        <img width={250} src={logotipoUrl || 'https://via.placeholder.com/250'} alt="Logo da instituição" />
                        <input type="file" ref={inputFileRef} onChange={alterarLogotipo} />
                    </div>
                    {logotipoUrl && logotipoUrl !== 'https://via.placeholder.com/250' && (
                        <p className='m-0'><a href="#" className="pe-auto text-danger" onClick={removerLogotipo}>Remover logotipo</a></p>
                    )}
                </div>
                <div className='vr'></div>
                <form onSubmit={alterarInstituicao} className="w-100">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Inscrição estadual</label>
                            <input type="text" className="form-control" value={escola.inscricaoEstadual || ''} disabled />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">CNPJ</label>
                            <input
                                type="text"
                                className="form-control"
                                value={eCnpj}
                                disabled
                            />
                        </div>
                        <div className="col-9">
                            <label className="form-label">Nome da instituição</label>
                            <input type="text" className="form-control" value={eNome} onChange={(e) => setENome(e.target.value)} />
                        </div>
                        <div className="col-3">
                            <label className="form-label">Telefone (+55)</label>
                            <input
                                type="text"
                                className="form-control"
                                value={eTelefone}
                                onChange={(e) => setETelefone(e.target.value)}
                                pattern="^\d{2}\d{4,5}\d{4}$"
                                title="Digite um telefone válido, no formato DDD + Número"
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">CEP</label>
                            <input
                                type="text"
                                className="form-control"
                                value={eCep}
                                onChange={(e) => setECEP(e.target.value)}
                                onBlur={() => verificarCEP(eCep)}
                                pattern="^\d{8}$"
                                title="Digite um CEP válido com 8 dígitos"
                                required
                            />
                        </div>
                        <div className="col-md-9">
                            <label className="form-label">Endereço</label>
                            <input type="text" className="form-control" value={eEndereco} onChange={(e) => setEEndereco(e.target.value)} />
                        </div>
                        <div className="text-end">
                            <button type='submit' className="btn btn-success" disabled={loading}>
                                {loading ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : (<><i className="bi bi-pencil"></i>&ensp;Editar</>)}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
