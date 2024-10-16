import React, { useState, useEffect, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';


function InstallButton() {
  // Estados para instalação
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Estados para atualização do PWA
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);

  // Registro de Service Worker usando virtual:pwa-register
  const { updateServiceWorker } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (r?.active?.state === 'activated') {
        setOfflineReady(true);
      }
      r?.installing?.addEventListener('statechange', (e) => {
        if (e.target?.state === 'activated') {
          setOfflineReady(true);
        }
      });
    },
    onNeedRefresh() {
      setNeedRefresh(true);
    },
    onOfflineReady() {
      setOfflineReady(true);
    },
  });

  // Lida com o evento beforeinstallprompt para exibir o botão de instalação
  const handleBeforeInstallPrompt = useCallback((e) => {
    e.preventDefault();
    setDeferredPrompt(e);
    setShowInstallButton(true);
  }, []);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [handleBeforeInstallPrompt]);

  // Lida com o clique no botão de instalação
  const handleInstallClick = () => {
    if (deferredPrompt) {
      setIsButtonDisabled(true);  // Desativa o botão temporariamente
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuário aceitou a instalação');
        } else {
          console.log('Usuário rejeitou a instalação');
        }
        setDeferredPrompt(null);
        setShowInstallButton(false);
        setIsButtonDisabled(false); // Reativa o botão após a escolha
      });
    }
  };

  // Lida com o botão de recarregar quando há novas atualizações
  const handleReloadClick = () => {
    updateServiceWorker(true);
  };

  // Lida com o botão de fechar notificação
  const handleCloseClick = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  return (
    <div className="PWABadge">
      {/* Botão de Instalação */}
      {showInstallButton && (
        <button className='btn' onClick={handleInstallClick} disabled={isButtonDisabled}>
          <i className="bi bi-download"></i> Instalar Aplicativo
        </button>
      )}

      {/* Notificações de Atualização e Offline */}
      {(offlineReady || needRefresh) && (
        <div className="PWABadge-toast" role="alert" aria-labelledby="toast-message">
          <div className="PWABadge-message">
            {offlineReady ? (
              <span id="toast-message">Aplicativo pronto para funcionar offline.</span>
            ) : (
              <span id="toast-message">Novo conteúdo disponível, clique em "Recarregar" para atualizar.</span>
            )}
          </div>
          <div className="PWABadge-buttons">
            {needRefresh && (
              <button className="PWABadge-toast-button" onClick={handleReloadClick}>
                Recarregar
              </button>
            )}
            <button className="PWABadge-toast-button" onClick={handleCloseClick}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstallButton;
