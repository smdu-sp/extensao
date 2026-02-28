/**
 * @fileoverview Dicionário de seletores CSS para a extensão UrbSync.
 * * Este módulo centraliza todos os identificadores (classes, IDs e atributos) utilizados 
 * pelos Scrapers para localizar dados nas tabelas do SEI e Aprova Digital.
 * A organização em sub-objetos (usuarios_page, inbox_page) permite que o 
 * AprovaScraper adapte a extração conforme a rota ativa.
 * * @author Victor Kiss
 */

/**
 * Armazena as classes e seletores alvo da extração (estrutura: table -> row -> cell).
 * * @typedef {Object} ScraperTargets
 * @property {Object} sei - Seletores específicos para o Sistema Eletrônico de Informações.
 * @property {Object} aprova_digital - Seletores para o portal Aprova Digital (incluindo sub-páginas).
 * @property {Object} slce - Espaço reservado para futura implementação do sistema SLCE.
 * * @type {ScraperTargets}
 */
export const scraperTargets = {
    /**
     * Seletores para o sistema SEI.
     * Focados em atributos 'data-label' que são mais estáveis que classes dinâmicas.
     */
    sei: {
        parent: 'tbody tr',
        processo: '[data-label="Processo"]',
        requerimento: '[data-label="Tipo"]',
        requerente: '[data-label="Interessados"] .divItemCelula .divRotuloItemCelula',
        tecnico: 'a.ancoraSigla',
    },

    /**
     * Seletores para o sistema Aprova Digital.
     * Organizados por contexto de navegação devido à natureza SPA do sistema.
     */
    aprova_digital: {
        /** Seletor da linha da tabela (Common SDK do Angular) */
        parent: 'table.cdk-table tbody tr.cdk-row',
        
        // Colunas da visão "Todos os Processos"
        processo: '.cdk-column-N--PROCESSO',
        num_sei: '.cdk-column-N--SEI',
        requerimento: '.cdk-column-REQUERIMENTO',
        requerente: '.cdk-column-REQUERENTE ',
        proprietario: '.cdk-column-PROPRIET-RIO',
        criado_em: '.cdk-column-CRIADO-EM',
        ultima_acao: '.cdk-column--LTIMA-A--O ',
        status: '.cdk-column-STATUS-ATUAL ',

        /** * Seletores para a página de perfil e processos de usuários específicos.
         */
        usuarios_page: {
            processo: '.cdk-column-NP',
            /** Seletor complexo para capturar o nome do técnico no grid de informações */
            tecnico: 'div.grid-cols-3 div.flex:nth-child(7) span:nth-child(2)',
            requerimento: '.cdk-column-REQUERIMENTO',
            requerente: '.cdk-column-REQUERENTE',
            proprietario: '.cdk-column-PROPRIET-RIO .ng-star-inserted',
            recebido_em: '.cdk-column-RECEBIDO-EM',
        },

        /** * Seletores para a visualização de Inbox (Caixas de entrada).
         */
        inbox_page: {
            /** Seletores das abas de navegação lateral/superior */
            caixa: 'tw-h-menu-list nav span',
            processo: '.cdk-column-N--DO--PROCESSO',
            num_sei: '.cdk-column-N--SEI',
            taxas: '.cdk-column-TAXAS',
            requerimento: '.cdk-column-REQUERIMENTO',
            requerente: '.cdk-column-REQUERENTE ',
            proprietario: '.cdk-column-PROPRIET-RIO',
            criado_em: '.cdk-column-CRIADO-EM',
            recebido_em: '.cdk-column-RECEBIDO-EM '
        }
    },

    /** @type {Object} Reservado para implementação futura do sistema SLCE */
    slce: {}
};