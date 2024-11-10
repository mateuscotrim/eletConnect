import React, { useEffect, useState, useRef } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';
import supabase from '../../../../configs/supabase';

export default function SettingsPerfil() {
    const user = JSON.parse(sessionStorage.getItem('user'));

    const [id] = useState(user?.id || '');
    const [uMatricula] = useState(user?.matricula || '');
    const [uNome, setUNome] = useState(user?.nome || '');
    const [uEmail, setUEmail] = useState(user?.email || '');
    const [uCargo] = useState(user?.cargo || '');
    const [foto, setFoto] = useState(null);
    const [fotoUrl, setFotoUrl] = useState(user?.foto && user.foto !== 'https://via.placeholder.com/250' ? user.foto : null);
    const [loading, setLoading] = useState(false);

    // Referência para o input de arquivo
    const inputFileRef = useRef(null);

    useEffect(() => {
        if (!user || !user.id) window.location.href = '/verification';
    }, [user]);

    const alterarFoto = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('Arquivo selecionado:', file);
            setFoto(file);

            const previewUrl = URL.createObjectURL(file);
            setFotoUrl(previewUrl);

            return () => {
                URL.revokeObjectURL(previewUrl); // Libera a URL para evitar vazamentos de memória
            };
        }
    };

    const removerFoto = async () => {
        if (!fotoUrl || fotoUrl === 'https://via.placeholder.com/250') {
            showToast('info', 'Nenhuma foto para remover.');
            return;
        }

        try {
            const fotoPath = fotoUrl.split('/').pop(); // Extraia o caminho do arquivo da URL
            const { error } = await supabase.storage.from('avatar').remove([fotoPath]);
            if (error) {
                console.error('Erro ao remover a foto:', error.message);
                showToast('danger', 'Erro ao remover a foto.');
                return;
            }

            setFotoUrl(null);
            setFoto(null); // Redefine a variável foto
            if (inputFileRef.current) {
                inputFileRef.current.value = ''; // Limpa o input de arquivo
            }
            sessionStorage.setItem('user', JSON.stringify({ ...user, foto: null }));
            showToast('success', 'Foto removida com sucesso.');
        } catch (error) {
            console.error('Erro inesperado ao remover a foto:', error);
            showToast('danger', 'Erro inesperado ao remover a foto.');
        }
    };

    const armazenarFoto = async () => {
        if (!foto) {
            console.warn('Nenhuma foto foi selecionada para upload.');
            return null; // Retorna null para indicar que nenhuma nova foto foi carregada
        }

        const caminhoFoto = `FOTO_${Date.now()}`;

        try {
            console.log('Iniciando upload da foto...');
            const { error: uploadError } = await supabase.storage.from('avatar').upload(caminhoFoto, foto);

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

    const alterarPerfil = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log('Iniciando envio de dados para o backend...');

        let fotoUrlAtualizado = fotoUrl; // Preserva a URL atual da foto
        if (foto) {
            fotoUrlAtualizado = await armazenarFoto();
            console.log('URL da foto atualizada:', fotoUrlAtualizado);
        }

        if (foto && !fotoUrlAtualizado) {
            console.warn('Nenhuma URL de foto válida foi gerada.');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                id,
                nome: uNome,
                email: uEmail,
                avatar: fotoUrlAtualizado !== 'https://via.placeholder.com/250' ? fotoUrlAtualizado : null, // Trate a URL de placeholder como null
            };
            console.log('Payload enviado para o backend:', payload);

            const response = await axios.post('/auth/update-profile', payload);
            console.log('Resposta da API:', response); // Log para verificar a resposta da API

            if (response.status === 200) {
                sessionStorage.setItem('user', JSON.stringify({ ...user, nome: uNome, email: uEmail, foto: fotoUrlAtualizado }));
                setFotoUrl(fotoUrlAtualizado);
                sessionStorage.setItem('mensagemSucesso', response.data.mensagem);
                window.location.reload();
            }
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error); // Log detalhado do erro
            showToast('danger', error.response?.data?.mensagem || 'Erro ao atualizar o perfil.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="d-flex gap-4">
                <div className='text-end'>
                    <div className="d-flex flex-column align-items-center gap-3">
                        <img width={250} src={fotoUrl || 'https://via.placeholder.com/250'} alt="Foto do usuário" />
                        <input type="file" ref={inputFileRef} onChange={alterarFoto} />
                    </div>
                    {fotoUrl && fotoUrl !== 'https://via.placeholder.com/250' && (
                        <p className='m-0'><a href="#" className="pe-auto text-danger" onClick={removerFoto}>Remover foto</a></p>
                    )}
                </div>
                <div className="vr"></div>
                <form onSubmit={alterarPerfil} className="w-100">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label">Matrícula</label>
                            <input type="text" className="form-control" id="idMatricula" name='nameMatricula' value={uMatricula} disabled />
                        </div>
                        <div className="col-md-9">
                            <label className="form-label">Nome completo</label>
                            <input type="text" className="form-control" id="idNome" name='nameNome' value={uNome} onChange={(e) => setUNome(e.target.value)} pattern="[A-Za-zÀ-ÿ\s]+" maxLength="76" title="Apenas letras e espaços são permitidos" required />
                            {uNome.length > 75 && (
                                <div className="text-danger mt-1">
                                    <small>O nome não pode ultrapassar 75 caracteres.</small>
                                </div>
                            )}
                        </div>
                        <div className="col-md-8">
                            <label className="form-label">E-mail</label>
                            <input type="email" className="form-control" id="idEmail" name='nameEmail' value={uEmail} onChange={(e) => setUEmail(e.target.value)} maxLength="101" required />
                            {uEmail.length > 100 && (
                                <div className="text-danger mt-1">
                                    <small>O e-mail não pode ultrapassar 100 caracteres.</small>
                                </div>
                            )}
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Cargo</label>
                            <input type="text" className="form-control" id="idCargo" name='nameCargo' value={uCargo} disabled />
                        </div>
                    </div>
                    <div className=' d-flex justify-content-end gap-2 mt-5'>
                        <button type='submit' className="btn btn-success" disabled={loading}>
                            {loading ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : (<><i className="bi bi-pencil"></i>&ensp;Editar</>)}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
