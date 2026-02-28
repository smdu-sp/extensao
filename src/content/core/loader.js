/**
 * @fileoverview Bootstrapper / Loader do Content Script principal do UrbSync.
 * * Este arquivo resolve uma limitação do Google Chrome (Manifest V3), onde Content Scripts
 * injetados diretamente via manifest não suportam nativamente a sintaxe de ES Modules 
 * (import/export) de forma isolada no contexto da página. 
 * * O Loader atua como um carregador dinâmico que injeta a biblioteca ExcelJS e, 
 * em seguida, importa o módulo principal de ações, permitindo uma arquitetura 
 * modular e limpa.
 * * @author Victor Kiss
 */

/**
 * Função autoexecutável (IIFE) assíncrona que prepara o ambiente da extensão.
 * * Realiza as seguintes etapas:
 * 1. Verifica a existência da biblioteca ExcelJS no escopo global.
 * 2. Injeta dinamicamente a biblioteca via DOM caso necessário.
 * 3. Importa o módulo 'actions.js' como um ECMAScript Module (ESM).
 * * @async
 * @function
 * @throws {Error} Lança um erro caso o carregamento do script vendor ou do módulo principal falhe.
 */
(async () => {
    try {
        /**
         * Verificação de Dependência: ExcelJS.
         * * Por ser uma biblioteca pesada e utilizada para manipulação de arquivos,
         * garantimos que ela esteja disponível no `window` antes de carregar a lógica de negócio.
         */
        if (typeof ExcelJS === 'undefined') {
            console.log("[UrbSync] ExcelJS não detectado. Injetando via DOM...");
            
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                /** @type {string} Busca a URL interna da extensão para o recurso web acessível */
                script.src = chrome.runtime.getURL('vendor/exceljs.min.js');
                script.onload = resolve;
                script.onerror = reject;
                
                // Injeta no início do documento para garantir disponibilidade
                (document.head || document.documentElement).appendChild(script);
            });
        }

        /**
         * Carregamento do Módulo Principal.
         * * Utilizamos o dynamic import() para carregar o arquivo actions.js.
         * Para que isso funcione, o arquivo deve estar listado em 'web_accessible_resources' no manifest.json.
         */
        const src = chrome.runtime.getURL('src/content/core/actions.js');
        await import(src);
        
        console.log("[UrbSync] Ambiente pronto e módulo 'actions' carregado.");
    } catch (err) {
        /**
         * Tratamento de Erros Críticos.
         * * Captura falhas de rede, permissões de segurança (CSP) ou erros de sintaxe
         * nos arquivos carregados.
         */
        console.error("[UrbSync - Loader] Erro crítico no carregamento:", err);
    }
})();