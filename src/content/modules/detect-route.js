import { AprovaScraper } from "../scraping/aprovaScraper.js";
import { SeiScraper } from '../scraping/seiScraper.js';

/**
 * @fileoverview Orquestrador de Rotas e Identificação de Contexto do UrbSync.
 * Este módulo é responsável por identificar em qual sistema (SEI ou Aprova Digital) 
 * e em qual sub-página o usuário se encontra, instanciando o Scraper adequado 
 * para cada situação.
 */

/**
 * URLs base dos sistemas municipais suportados.
 * @type {{sei: string, aprova_digital: string}}
 */
const baseUrls = {
    sei: 'https://sei.prefeitura.sp.gov.br/sei/',
    aprova_digital: 'https://portaldolicenciamentosp.com.br/'
};

/** @type {RegExp} Valida se a URL atual refere-se ao perfil de um usuário/técnico. */
const userUrlValidantion = /.*\/usuarios\/[^\/]+\/perfil/; 

/** @type {RegExp} Valida se a URL atual refere-se à caixa de entrada (inbox) de um usuário específico. */
const userInboxValidation = /.*\/usuarios\/[^\/]+\/inbox/; 

/** @type {string} Padrão para verificação de rotas de inbox geral. */
const urlInboxValidation = '/.*\/inbox/';

/**
 * Analisa a URL atual do navegador e dispara o método de extração correspondente ao contexto.
 * * @async
 * @function detectRoute
 * @description Funciona como um roteador central que mapeia padrões de URL para 
 * métodos específicos das classes AprovaScraper ou SeiScraper.
 * @returns {Promise<Array<Object>|string>} Retorna uma lista de processos extraídos, 
 * o nome de um técnico ou um array vazio caso a rota não seja reconhecida.
 */
export async function detectRoute() {
    const url = window.location.href;

    switch (true) {
        // 1. SEI (Prioridade por domínio)
        case url.includes(baseUrls.sei):
            return new SeiScraper().extract();

        // 2. Aprova Digital - PERFIL (Regex específico)
        case url.startsWith(baseUrls.aprova_digital) && userUrlValidantion.test(url):
            const scraper = new AprovaScraper('Aprova Digital - Usuários');
            return await scraper.getTechniciansName();

        // 3. Aprova Digital - INBOX DE USUÁRIO (Regex específico)
        // DEVE VIR ANTES DO INBOX GENÉRICO
        case url.startsWith(baseUrls.aprova_digital) && userInboxValidation.test(url):
            return await new AprovaScraper('Aprova Digital - Usuários').extractByUser();

        // 4. Aprova Digital - INBOX GENÉRICO (Menos específico)
        case url.startsWith(baseUrls.aprova_digital) && url.includes('/inbox'):
            return await new AprovaScraper('Aprova Digital - Caixas (Inbox)').extractByInbox();

        // 5. Aprova Digital - TODOS OS PROCESSOS
        case url.startsWith(baseUrls.aprova_digital) && url.includes('processos/todos'): 
            return new AprovaScraper('Aprova Digital - Todos os Processos').extract();

        // 6. Localhost
        case url.includes('localhost') || url.includes('127.0.0.1'):
            return [];

        default:
            console.warn('UrbSync: Site ou rota não reconhecida.');
            return [];
    }
}

/**
 * Monitoramento de mudanças de URL para Single Page Applications (SPA).
 * * Como o Aprova Digital utiliza frameworks modernos (Angular), a navegação entre 
 * abas não recarrega a página. O MutationObserver detecta mudanças no DOM que 
 * indicam troca de rota e reexecuta a detecção.
 * * @type {number|undefined} debounceTimer - Controla o atraso da execução para aguardar renderização.
 * @type {string} lastUrl - Armazena a última URL processada para evitar execuções duplicadas.
 */
let debounceTimer;
let lastUrl = location.href;

new MutationObserver(async () => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;

        clearTimeout(debounceTimer);

        // Delay de 500ms: Garante que o framework da página terminou de renderizar os novos elementos.
        debounceTimer = setTimeout(() => {
            detectRoute();
        }, 500);
    }
}).observe(document, { subtree: true, childList: true });

/**
 * Execução Inicial.
 * Dispara a detecção assim que o script é carregado pela primeira vez na aba.
 */
detectRoute();