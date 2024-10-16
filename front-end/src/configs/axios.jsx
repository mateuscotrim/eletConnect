import axios from 'axios';

const IP_API = `http://${window.location.hostname}:3001`;
const LOCALHOST_API = import.meta.env.VITE_API || 'http://localhost:3001';

// Cria uma instância do Axios com a baseURL inicialmente definida para o IP local
const instance = axios.create({
  baseURL: IP_API,
});

// Função para verificar se o IP local está acessível
async function verificarIPLocal() {
  try {
    // Tenta acessar o endpoint '/status' no IP local
    await instance.get('/status');
    console.log('Conectado ao IP local com sucesso.', IP_API);
  } catch (error) {
    // Se houver erro, altera a baseURL para usar o localhost
    instance.defaults.baseURL = LOCALHOST_API;
    console.warn('IP local não acessível, mudando para localhost:', LOCALHOST_API);
  }
}

// Executa a verificação assim que o módulo é carregado
verificarIPLocal();

export default instance;
