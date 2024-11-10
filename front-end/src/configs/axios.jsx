import axios from 'axios';

// URL da API na Render e localhost
const RENDER_API = import.meta.env.VITE_API;
const LOCAL_API = 'http://localhost:3001';

// Cria uma instância do Axios com a baseURL definida para a API da Render
const instance = axios.create({
  baseURL: RENDER_API,
});

// Função para verificar a conectividade com a API da Render e alternar para o localhost se necessário
async function verificarAPI() {
  try {
    // Tenta acessar o endpoint '/status' na API da Render
    await instance.get('/status');
    console.log('Conectado com sucesso à API da Render:', RENDER_API);
  } catch (error) {
    // Se a API da Render não estiver acessível, define a baseURL para o localhost
    instance.defaults.baseURL = LOCAL_API;
    console.warn('API da Render não acessível, mudando para localhost:', LOCAL_API);
  }
}

// Executa a verificação assim que o módulo é carregado
verificarAPI();

export default instance;
