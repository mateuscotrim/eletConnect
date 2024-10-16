import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from '../src/configs/protectedRoute';

// -- Importação das Páginas --
import LandingPage from "./pages/web/landingPage/landingPage";
import PageNotFound from "./pages/web/404";

import HomePage from "./pages/web/home/home";
import CentralAvisos from "./pages/web/home/centralAvisos";

import AlunosPage from "./pages/web/estudantes/alunos";
import EditarAlunoPage from "./pages/web/estudantes/editarAluno";

import EletivasPage from "./pages/web/eletivas/eletivas";
import EditarEletivaPage from "./pages/web/eletivas/editarEletiva";
import GerenciarEletivaPage from "./pages/web/eletivas/gerenciarEletiva";
import ListaChamada from "./pages/web/eletivas/listaChamada";

import ConfiguracoesPage from "./pages/web/configuracoes/settings";
import EditarPerfilPage from "./pages/web/configuracoes/perfil/perfil";
import EditarSenhaPage from "./pages/web/auth/changePassword";
import CadastrarInstituicaoPage from "./pages/web/configuracoes/instituicao/cadastrarInstituicao";
import EditarInstituicaoPage from "./pages/web/configuracoes/instituicao/editarInstituicao";
import ColaboradoresPage from "./pages/web/configuracoes/colaboradores/colaboradores";

import LoginPage from "./pages/web/auth/Login";
import RegisterPage from "./pages/web/auth/Register";
import ConfirmarRegistroPage from "./pages/web/auth/confirmRegistration";
import EsqueciSenhaPage from "./pages/web/auth/forgotPassword";
import ResetarSenhaPage from "./pages/web/auth/resetPassword";
import VerificacaoPage from "./pages/web/auth/verification";

// -- Importação das Páginas Mobile --
import MLoginPage from "./pages/mobile/auth/login";
import MEsqueciSenhaPage from "./pages/mobile/auth/forgotPassword";
import MAlterarSenhaPage from "./pages/mobile/auth/changePassword";
import MVerificacaoPage from "./pages/mobile/auth/verification";

import MHomePage from "./pages/mobile/home/home";

import MAvisos from "./pages/mobile/home/avisos";

import MEletivasPage from "./pages/mobile/eletivas/eletivas";
import MMinhasEletivasPage from "./pages/mobile/eletivas/minhasEletivas";

// -- Definir Constantes para Cargos --
const CARGOS_WEB = ['Diretor', 'Coordenador', 'Professor', 'Colaborador'];
const CARGOS_MOBILE = ['Diretor', 'Coordenador', 'Professor', 'Aluno'];
const SOMENTE_DIRETOR = ['Diretor'];
const SOMENTE_ALUNO = ['Aluno'];

// -- Função para Criar Rotas Protegidas --
function rotaProtegida(caminho, componente, cargosPermitidos) {
    return { path: caminho, element: <ProtectedRoute element={componente} allowedRoles={cargosPermitidos} /> };
}

// -- Configuração das Rotas --
const rotas = createBrowserRouter([
    { path: '/', element: <LandingPage /> },
    { path: '*', element: <PageNotFound /> },

    // Páginas WEB
    rotaProtegida('/home', <HomePage />, CARGOS_WEB),
    rotaProtegida('/warnings', <CentralAvisos />, CARGOS_WEB),
    rotaProtegida('/students', <AlunosPage />, CARGOS_WEB),
    rotaProtegida('/student/edit', <EditarAlunoPage />, CARGOS_WEB),
    rotaProtegida('/electives', <EletivasPage />, CARGOS_WEB),
    rotaProtegida('/electives/edit', <EditarEletivaPage />, SOMENTE_DIRETOR),
    rotaProtegida('/electives/manage', <GerenciarEletivaPage />, SOMENTE_DIRETOR),
    rotaProtegida('/electives/attendance', <ListaChamada />, ['Professor']),
    rotaProtegida('/settings', <ConfiguracoesPage />, CARGOS_WEB),
    rotaProtegida('/settings/profile', <EditarPerfilPage />, CARGOS_WEB),
    rotaProtegida('/settings/security', <EditarSenhaPage />, CARGOS_WEB),
    rotaProtegida('/settings/institution', <CadastrarInstituicaoPage />, ['Diretor', 'Coordenador']),
    rotaProtegida('/settings/institution/edit', <EditarInstituicaoPage />, SOMENTE_DIRETOR),
    rotaProtegida('/settings/collaborators', <ColaboradoresPage />, SOMENTE_DIRETOR),

    // Páginas de Autenticação
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: '/confirm-registration', element: <ConfirmarRegistroPage /> },
    { path: '/forgot-password', element: <EsqueciSenhaPage /> },
    { path: '/reset-password', element: <ResetarSenhaPage /> },
    { path: '/verification', element: <VerificacaoPage /> },

    // Páginas MOBILE
    rotaProtegida('/m/home', <MHomePage />, CARGOS_MOBILE),
    rotaProtegida('/m/warnings', <MAvisos />, CARGOS_MOBILE),
    rotaProtegida('/m/electives', <MEletivasPage />, CARGOS_MOBILE),
    rotaProtegida('/m/my-electives', <MMinhasEletivasPage />, SOMENTE_ALUNO),

    // Páginas de Autenticação MOBILE
    { path: '/m/login', element: <MLoginPage /> },
    { path: '/m/forgot-password', element: <MEsqueciSenhaPage /> },
    { path: '/m/change-password', element: <MAlterarSenhaPage /> },
    { path: '/m/verification', element: <MVerificacaoPage /> },
]);

export default rotas;
