import React, { useState, useEffect } from 'react';
import axios from '../../../configs/axios';
import Header from '../../../components/header';
import showToast from '../../../utills/toasts';

export default function CentralAvisos() {
  const [carregando, setCarregando] = useState(true);
  const [avisos, setAvisos] = useState([]);
  const [avisoSelecionado, setAvisoSelecionado] = useState({ id: null, titulo: '', conteudo: '', author: '', exclusivo: false, exclusividade: '', series: [], serie: '', turma: '', cor: 'primary' });
  const seriesOpcoes = ['1º ano', '2º ano', '3º ano'];
  const user = JSON.parse(sessionStorage.getItem('user'));

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

  const salvarOuCriarAviso = async (isEdit = false) => {
    const { titulo, conteudo, exclusivo, exclusividade, series, serie, turma, cor } = avisoSelecionado;

    if (!titulo || !conteudo) {
      showToast('warning', 'Título e conteúdo são obrigatórios.');
      return;
    }

    try {
      const avisoParaSalvar = {
        ...avisoSelecionado,
        author: user.matricula,
        cor, // Adicionando a cor selecionada ao aviso
        series: exclusivo && exclusividade === 'serie' ? series : [],
        serie: exclusivo && exclusividade === 'turma' ? serie : '',
        turma: exclusivo && exclusividade === 'turma' ? turma : '',
      };

      const endpoint = isEdit ? '/home/editar-aviso' : '/home/criar-aviso';
      const response = await axios.post(endpoint, { avisoParaSalvar, instituicao: user.instituicao });

      if (isEdit) {
        setAvisos(avisos.map(aviso => aviso.id === avisoSelecionado.id ? response.data : aviso));
        showToast('success', 'Aviso atualizado com sucesso!');
      } else {
        setAvisos([...avisos, response.data]);
        showToast('success', 'Aviso criado com sucesso!');
      }

      resetForm();
    } catch (error) {
      showToast('danger', error.response?.data?.mensagem || 'Erro ao salvar aviso.');
    }
  };

  const excluirAviso = async (id) => {
    try {
      await axios.post(`/home/excluir-aviso`, { id, instituicao: user.instituicao });
      setAvisos(avisos.filter(aviso => aviso.id !== id));
      showToast('success', 'Aviso excluído com sucesso!');
    } catch (error) {
      showToast('danger', 'Erro ao excluir aviso.');
    }
  };

  const abrirModalCriar = () => resetForm();

  const abrirModalEditar = (aviso) => {
    setAvisoSelecionado({
      id: aviso.id || null,
      titulo: aviso.titulo || '',
      conteudo: aviso.conteudo || '',
      author: aviso.author || '',
      exclusivo: aviso.turma || (aviso.series && aviso.series.length > 0),
      exclusividade: aviso.turma ? 'turma' : (aviso.series && aviso.series.length > 0 ? 'serie' : ''),
      series: aviso.series ? aviso.series.split(', ') : [],
      serie: aviso.serie || (aviso.series && aviso.series.split(', ')[0]) || '',
      turma: aviso.turma || '',
      cor: aviso.cor || 'primary',
    });
  };

  const resetForm = () => {
    setAvisoSelecionado({
      id: null,
      titulo: '',
      conteudo: '',
      author: '',
      exclusivo: false,
      exclusividade: '',
      series: [],
      serie: '',
      turma: '',
      cor: 'primary',
    });
  };

  useEffect(() => {
    carregarAvisos();
  }, []);

  return (
    <>
      <div id="toast-container" className="toast-container position-absolute bottom-0 start-50 translate-middle-x"></div>
      <Header />
      <main id="main-section">
        <section id="section">
          <div className="box">
            <div className="title">
              <span className="d-flex align-items-center gap-2 text-black">
                <i className="bi bi-megaphone fs-3"></i>
                <h3 className="m-0 fs-4">Central de avisos</h3>
              </span>
              {!carregando && (
                <div className="d-flex gap-2">
                  <a className="btn btn-outline-secondary" href="/home">
                    <i className="bi bi-arrow-return-left"></i>&ensp;Voltar
                  </a>
                  <button className="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#criarAvisoModal" onClick={abrirModalCriar} >
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
                  <div className="list-group list-group-flush"> 
                    {avisos.map((aviso, index) => (
                      <div key={index} className={`list-group-item list-group-item-action border-left-${aviso.cor}`} >
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className={`text-${aviso.cor} m-0`} title={aviso.conteudo}>{aviso.titulo}</h6>
                          <div className="d-flex gap-2 mt-2">
                            <button className="btn btn-sm btn-success" data-bs-toggle="modal" data-bs-target="#editarAvisoModal" onClick={() => abrirModalEditar(aviso)} >
                              <i className="bi bi-pencil-fill"></i>&ensp;Editar
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => excluirAviso(aviso.id)} >
                              <i className="bi bi-trash-fill"></i>&ensp;Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Modal: Criar Aviso */}
      <ModalAviso
        id="criarAvisoModal"
        tituloModal="Criar um novo aviso"
        avisoSelecionado={avisoSelecionado}
        setAvisoSelecionado={setAvisoSelecionado}
        seriesOpcoes={seriesOpcoes}
        salvarAviso={() => salvarOuCriarAviso(false)}
      />

      {/* Modal: Editar Aviso */}
      <ModalAviso
        id="editarAvisoModal"
        tituloModal="Editar aviso"
        avisoSelecionado={avisoSelecionado}
        setAvisoSelecionado={setAvisoSelecionado}
        seriesOpcoes={seriesOpcoes}
        salvarAviso={() => salvarOuCriarAviso(true)}
      />
    </>
  );
}

function ModalAviso({ id, tituloModal, avisoSelecionado, setAvisoSelecionado, seriesOpcoes, salvarAviso }) {
  return (
    <div className="modal fade" id={id} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{tituloModal}</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <AvisoForm
              avisoSelecionado={avisoSelecionado}
              setAvisoSelecionado={setAvisoSelecionado}
              seriesOpcoes={seriesOpcoes}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={salvarAviso}
              data-bs-dismiss="modal"
            >
              {id === 'criarAvisoModal' ? 'Criar aviso' : 'Editar aviso'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AvisoForm({ avisoSelecionado, setAvisoSelecionado, seriesOpcoes }) {
  const { titulo, conteudo, exclusivo, exclusividade, series, serie, turma, cor } = avisoSelecionado;

  const handleExclusividadeChange = (e) => {
    const isExclusivo = e.target.checked;
    setAvisoSelecionado({
      ...avisoSelecionado,
      exclusivo: isExclusivo,
      exclusividade: '',
      series: [],
      serie: '',
      turma: '',
    });
  };

  const handleCorChange = (corSelecionada) => {
    setAvisoSelecionado({ ...avisoSelecionado, cor: corSelecionada });
  };

  const handleSerieChange = (serie) => {
    const seriesAtualizadas = series.includes(serie) ? series.filter(s => s !== serie) : [...series, serie];
    setAvisoSelecionado({ ...avisoSelecionado, series: seriesAtualizadas });
  };

  return (
    <>
      <div className="form-group mb-3">
        <label>Título</label>
        <input
          type="text"
          className="form-control"
          value={titulo || ''}
          onChange={(e) => setAvisoSelecionado({ ...avisoSelecionado, titulo: e.target.value })}
        />
      </div>
      <div className="form-group mb-3">
        <label>Conteúdo</label>
        <textarea
          className="form-control"
          rows="3"
          value={conteudo || ''}
          onChange={(e) => setAvisoSelecionado({ ...avisoSelecionado, conteudo: e.target.value })}
        ></textarea>
      </div>

      {/* Botões de seleção de cor */}
      <div className="form-group mb-3">
        <label>Selecione a cor do card</label>
        <div className="d-flex flex-wrap gap-2">
          {[
            { name: 'Azul', value: 'primary' },
            { name: 'Ciano', value: 'info' },
            { name: 'Cinza', value: 'secondary' },
            { name: 'Verde', value: 'success' },
            { name: 'Amarelo', value: 'warning' },
            { name: 'Vermelho', value: 'danger' },
          ].map((color) => (
            <div key={color.value}>
              <input
                type="radio"
                className="btn-check"
                name="cor"
                id={`btn-check-${color.value}`}
                autoComplete="off"
                checked={cor === color.value}
                onChange={() => handleCorChange(color.value)}
              />
              <label className={`btn btn-outline-${color.value}`} htmlFor={`btn-check-${color.value}`}>
                {color.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Switch para definir se o aviso é exclusivo */}
      <div className="form-check form-switch mb-4">
        <input
          className="form-check-input"
          type="checkbox"
          id="exclusivoSwitch"
          checked={exclusivo || false}
          onChange={handleExclusividadeChange}
        />
        <label className="form-check-label" htmlFor="exclusivoSwitch">Este aviso é exclusivo?</label>
      </div>

      {/* Se o aviso for exclusivo, exibir o select para escolher entre série ou turma */}
      {exclusivo && (
        <div className="form-group mb-3">
          <label>Tipo de Exclusividade</label>
          <select
            className="form-select"
            value={exclusividade || ''}
            onChange={(e) => setAvisoSelecionado({ ...avisoSelecionado, exclusividade: e.target.value })}
          >
            <option value="">Selecione...</option>
            <option value="serie">Exclusivo para Séries</option>
            <option value="turma">Exclusivo para Turmas</option>
          </select>
        </div>
      )}

      {/* Se a exclusividade for para série, permitir múltipla seleção de séries */}
      {exclusivo && exclusividade === 'serie' && (
        <div className="form-group mb-3">
          <label>Selecione as séries</label>
          {seriesOpcoes.map(serieOp => (
            <div className="form-check" key={serieOp}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`serie-${serieOp}`}
                checked={series.includes(serieOp)}
                onChange={() => handleSerieChange(serieOp)}
              />
              <label className="form-check-label" htmlFor={`serie-${serieOp}`}>{serieOp}</label>
            </div>
          ))}
        </div>
      )}

      {/* Se a exclusividade for para turma, exibir seleção de série e turma */}
      {exclusivo && exclusividade === 'turma' && (
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="serie" className="form-label">Série</label>
            <select
              className="form-select"
              id="serie"
              value={serie || ''}
              onChange={(e) => setAvisoSelecionado({ ...avisoSelecionado, serie: e.target.value })}
            >
              <option value="">Selecione...</option>
              {seriesOpcoes.map(serieOp => (
                <option key={serieOp} value={serieOp}>{serieOp}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label htmlFor="turma" className="form-label">Turma</label>
            <select
              className="form-select"
              id="turma"
              value={turma || ''}
              onChange={(e) => setAvisoSelecionado({ ...avisoSelecionado, turma: e.target.value })}
            >
              <option value="">Selecione...</option>
              {[...Array(26)].map((_, i) => {
                const turmaOp = String.fromCharCode(65 + i); // Código ASCII para 'A'
                return <option key={turmaOp} value={turmaOp}>{turmaOp}</option>;
              })}
            </select>
          </div>
        </div>
      )}
    </>
  );
}
