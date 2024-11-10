import React, { useState } from 'react';
import showToast from '../../../../utills/toasts';
import axios from '../../../../configs/axios';

export default function ModalEntrarInstituicao({ user }) {
    const [codigo, setCodigo] = useState('');
    const [isLoadingEntrar, setIsLoadingEntrar] = useState(false);

    const entrarInstituicao = async (e) => {
        e.preventDefault();
        setIsLoadingEntrar(true);

        try {
            const response = await axios.post('/instituicao/entrar', { id: user.id, codigo });
            if (response.status === 200) {
                showToast('success', 'Usuário vinculado à instituição com sucesso!');
                sessionStorage.setItem('user', JSON.stringify({ ...user, cargo: 'Diretor', instituicao: "" }));
                setTimeout(() => window.location.href = '/verification', 5000);
            }
        } catch (error) {
            showToast('danger', error.response ? error.response.data.error : 'Erro ao vincular usuário à instituição.');
        } finally {
            setIsLoadingEntrar(false);
        }
    };

    return (
        <div className="modal fade" id="entrarEscola" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Entrar com Código da Instituição</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form onSubmit={entrarInstituicao}>
                        <div className="modal-body">
                            <input type="text" className="form-control" placeholder="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={isLoadingEntrar}>
                                {isLoadingEntrar ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : ('Entrar')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
