import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../configs/axios';
import Header from '../../../components/header';
import showToast from '../../../utills/toasts';

import CriarAvisoModal from './modals/criarAviso';
import EditarAvisoModal from './modals/editarAviso';
import ExcluirAvisoModal from './modals/excluirAviso';

export default function CentralAvisos() {
  const [carregando, setCarregando] = useState(true);
  const [avisos, setAvisos] = useState([]);
  const [avisoSelecionado, setAvisoSelecionado] = useState({});
  const seriesOpcoes = ['1º ano', '2º ano', '3º ano'];
  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    const mensagemSucesso = sessionStorage.getItem('mensagemSucesso');
    if (mensagemSucesso) {
      showToast('success', mensagemSucesso);
      sessionStorage.removeItem('mensagemSucesso');
    }
    carregarAvisos();
  }, []);

  const carregarAvisos = async () => {
    try {
      setCarregando(true);
      const response = await axios.post('/home/exibir-avisos', { instituicao: user.instituicao });
      setAvisos(response.data.filter(aviso => !aviso.deleted_at));
    } catch (error) {
      showToast('danger', error.response?.data?.mensagem || 'Erro ao carregar avisos.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <>
      <div id="toast-container" className="toast-container position-absolute bottom-0 end-0 m-2"></div>
      <Header />
      <main id="main-section">
        <section id="section">
          <div className="box">
            <div className="title d-flex justify-content-between align-items-center">
              <span className="d-flex align-items-center gap-2 text-black">
                <i className="bi bi-megaphone fs-3"></i>
                <h3 className="m-0 fs-4">Central de avisos</h3>
              </span>
              {!carregando && (
                <div className="d-flex gap-2">
                  <Link className="btn btn-outline-secondary" to="/home">
                    <i className="bi bi-arrow-return-left"></i>&ensp;Voltar
                  </Link>
                  <button className="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#criarAvisoModal" >
                    <i className="bi bi-plus-square-dotted"></i>&ensp;Criar
                  </button>
                </div>
              )}
            </div>
            <div className="p-4">
              {carregando ? (
                <div className="d-flex justify-content-center my-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                </div>
              ) : (
                <div className="m-4">
                  {avisos.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {avisos.map(aviso => (
                        <div key={aviso.id} className={`list-group-item list-group-item-action border-left-${aviso.cor}`} >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className={`text-${aviso.cor} m-0`}>{aviso.titulo}</h6>
                              <p className="m-0 text-muted">{aviso.conteudo}</p>
                            </div>
                            <div className="d-flex gap-2 mt-2">
                              <button className="btn btn-sm btn-success" data-bs-toggle="modal" data-bs-target="#editarAvisoModal" onClick={() => setAvisoSelecionado(aviso)} >
                                <i className="bi bi-pencil-fill"></i>&ensp;Editar
                              </button>
                              <button className="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#excluirAvisoModal" onClick={() => setAvisoSelecionado(aviso)} >
                                <i className="bi bi-trash-fill"></i>&ensp;Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted">Nenhum aviso disponível no momento.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <CriarAvisoModal setAvisos={setAvisos} seriesOpcoes={seriesOpcoes} user={user} />
      <EditarAvisoModal avisoSelecionado={avisoSelecionado} setAvisoSelecionado={setAvisoSelecionado} seriesOpcoes={seriesOpcoes} setAvisos={setAvisos} user={user} />
      <ExcluirAvisoModal avisoSelecionado={avisoSelecionado} setAvisos={setAvisos} user={user} />
    </>
  );
}
