import React, { useState } from 'react';
import supabase from '../../../../configs/supabase';
import showToast from '../../../../utills/toasts';
import axios from '../../../../configs/axios';

export default function ModalCadastrarInstituicao({ user }) {
    const [cnpj, setCnpj] = useState('');
    const [nome, setNome] = useState('');
    const [cep, setCEP] = useState('');
    const [endereco, setEndereco] = useState('');
    const [telefone, setTelefone] = useState('');
    const [logo, setLogo] = useState(null);
    const [isLoadingCadastrar, setIsLoadingCadastrar] = useState(false);

    const verificarCEP = async (cep) => {
        if (!cep) return;
        try {
            const formattedCep = cep.replace(/\D/g, '');
            const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${formattedCep}`, { withCredentials: false });
            if (response.status === 200) {
                setEndereco(response.data.street);
            }
        } catch {
            showToast('danger', 'Erro ao verificar CEP.');
        }
    };

    const validarCNPJ = async (cnpj) => {
        if (!cnpj) return;
        try {
            const formattedCnpj = cnpj.replace(/\D/g, '');
            const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${formattedCnpj}`, { withCredentials: false });
            if (response.status === 200) {
                const cnpjData = response.data;
                setNome(cnpjData.nome_fantasia || cnpjData.razao_social);
                setEndereco(cnpjData.logradouro);
                setTelefone(cnpjData.ddd_telefone_1);
                const cnpjCep = cnpjData.cep.replace(/\D/g, '');
                setCEP(cnpjCep);
                await verificarCEP(cnpjCep);
            }
        } catch {
            showToast('danger', 'Erro ao validar o CNPJ.');
        }
    };

    const armazenarLogo = async (logo) => {
        const path = `LOGOTIPO_${Date.now()}`;
        try {
            const { error } = await supabase.storage.from('logotipo').upload(path, logo);
            if (error) throw new Error(error.message);
            const { data, error: publicUrlError } = supabase.storage.from('logotipo').getPublicUrl(path);
            if (publicUrlError) throw new Error(publicUrlError.message);
            return data.publicUrl;
        } catch (error) {
            throw error;
        }
    };

    const cadastrarInstituicao = async (e) => {
        e.preventDefault();
        setIsLoadingCadastrar(true);

        try {
            const logoUrl = logo ? await armazenarLogo(logo) : '';
            const formattedCnpj = cnpj.replace(/\D/g, '');
            const response = await axios.post('/instituicao/cadastrar', {
                userID: user.id,
                cnpj: formattedCnpj,
                nome,
                cep,
                endereco,
                telefone,
                logotipo: logoUrl
            });

            if (response.status === 200) {
                showToast('success', 'Instituição cadastrada com sucesso!');
                sessionStorage.setItem('user', JSON.stringify({ ...user, cargo: 'Diretor', instituicao: formattedCnpj }));
                sessionStorage.setItem('escola', JSON.stringify(response.data));

                setTimeout(() => window.location.href = '/verification', 5000);
            } else {
                showToast('danger', 'Erro inesperado. Tente novamente mais tarde.');
            }
        } catch (error) {
            showToast('danger', error.response ? error.response.data.mensagem : 'Erro ao cadastrar instituição.');
        } finally {
            setIsLoadingCadastrar(false);
        }
    };

    return (
        <div className="modal fade" id="cadastrarEscola" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Cadastrar Instituição</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form onSubmit={cadastrarInstituicao}>
                        <div className="modal-body">
                            <div className="d-flex gap-4">
                                {/* Seção da Logo */}
                                <div className="d-flex flex-column align-items-center gap-3">
                                    <img width={250} src={logo ? URL.createObjectURL(logo) : 'https://via.placeholder.com/250'} alt="Logo da instituição" />
                                    <input type="file" className="form-control" onChange={(e) => setLogo(e.target.files[0])} />
                                </div>

                                <div className="vr"></div>

                                {/* Seção do Formulário */}
                                <div className="w-100">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">CNPJ</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="inputCNPJ"
                                                placeholder="CNPJ"
                                                maxLength="18"
                                                value={cnpj}
                                                onChange={(e) => setCnpj(e.target.value)}
                                                onBlur={() => validarCNPJ(cnpj)}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Telefone</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="inputTelefone"
                                                placeholder="Telefone"
                                                value={telefone}
                                                onChange={(e) => setTelefone(e.target.value)}
                                                pattern="^\d{2}\d{4,5}\d{4}$"
                                                title="Digite um telefone válido, no formato DDD + Número"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label">Nome da Instituição</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="inputNome"
                                                placeholder="Nome"
                                                value={nome}
                                                onChange={(e) => setNome(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">CEP</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="inputCEP"
                                                placeholder="CEP"
                                                value={cep}
                                                onChange={(e) => setCEP(e.target.value)}
                                                onBlur={() => verificarCEP(cep)}
                                                pattern="^\d{8}$"
                                                title="Digite um CEP válido com 8 dígitos"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-8">
                                            <label className="form-label">Endereço</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="inputEndereco"
                                                placeholder="Endereço"
                                                value={endereco}
                                                onChange={(e) => setEndereco(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={isLoadingCadastrar}>
                                {isLoadingCadastrar ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : ('Cadastrar')}
                            </button>

                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
