// ==UserScript==
// @name         Caminhão do Lixo
// @namespace    http://sangoi.dev
// @version      1.0.0
// @description  Recolhe e elimina todas as porcarias que atrapalham a navegação.
// @author       Sangoi.exe
// @match        *://*.folha.uol.com.br/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  const siteConfig = {
    name: "Folha de S.Paulo",
    // seletores atuais dos elementos de bloqueio que precisam ser exorcizados [31/07/2025]
    blockerSelectors: [
      "#paywall-flutuante",
      "#paywall-screen",
      "#paywall-fill",
      ".fc-ab-root",
    ],
    // seletores daquele monte de bosta que polui a UI [31/07/2025]
    clutterSelectors: [
      "#barrauol", // barra superior UOL
      "#comentarios", // seção de comentários
      "#top-signup-close",
      "#taboola-below-article-thumbnails", // recomendações Taboola (abaixo)
      "#taboola-right-rail-thumbnails", // recomendações Taboola (lateral)
      ".c-top-signup", // banner de assinatura no topo
      ".c-elastic-header", // banner de assinatura no topo
      ".c-subscribe-ads", // MAIS UM FUCKING banner de assinatura
      ".c-advertising", // contêineres de anúncios
      ".c-tools-share", // barras de compartilhamento
      ".c-topics", // tópicos relacionados
      ".c-most-read", // seção "Mais Lidas"
      ".player_dynad_tv", // anúncios de vídeo
      ".l-footer",
      ".js-c-elastic-header",
    ],
    // seletor do contêiner de conteúdo principal
    contentContainerSelector: ".j-paywall",
    // seletor do contêiner que aplica o travamento inicial
    scrollLockerSelector: "#paywall-content",
  };

  // first step: injetar o CSS
  const selectorsToHide = [
    ...siteConfig.blockerSelectors.map(
      (sel) => `${sel}[data-userscript-blocked='true']`
    ),
    ...siteConfig.clutterSelectors,
  ].join(",\n");

  GM_addStyle(`
        /* forçar a liberação do scroll nem que seja arrombando o css */
        html, body {
            overflow: auto !important;
            height: auto !important;
            position: static !important;
            touch-action: auto !important;
            overscroll-behavior: auto !important;
        }

        /* neutraliza os overlays de bloqueio de remove o lixo visual */
        ${selectorsToHide} {
            display: none !important;
            pointer-events: none !important;
        }

        /* garante que o conteúdo principal seja sempre visível */
        .j-paywall {
            visibility: visible !important;
        }
    `);

  let isProcessing = false;
  let scheduled = false;

  /**
   * Função principal que processa o DOM em busca de bloqueios.
   */
  const processDOM = () => {
    if (isProcessing) return;
    isProcessing = true;

    // marca os overlays de bloqueio para serem escondidos pelo CSS
    siteConfig.blockerSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (el.dataset.userscriptBlocked !== "true") {
          el.dataset.userscriptBlocked = "true";
        }
      });
    });

    // remove a a bosta da classe/id que trava o scroll
    const scrollLocker = document.querySelector(
      siteConfig.scrollLockerSelector
    );
    if (scrollLocker) {
      scrollLocker.removeAttribute("id");
    }

    isProcessing = false;
    scheduled = false;
  };

  // observer
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(processDOM);
  });

  const startObserver = () => {
    if (document.body) {
      processDOM();
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
      console.log("[Removedor v3.1] Modo Foco ativado.");
    } else {
      setTimeout(startObserver, 50);
    }
  };

  startObserver();
})();
