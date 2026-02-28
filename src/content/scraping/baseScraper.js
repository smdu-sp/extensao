/**
 * @fileoverview Classe base para a arquitetura de scraping do UrbSync.
 * Fornece métodos utilitários de manipulação de DOM e define a interface
 * obrigatória para todos os extratores de dados da extensão.
 * * @author Victor Kiss
 */

/**
 * @class BaseScraper
 * @abstract
 * @classdesc Classe base abstrata para os extratores de dados.
 * Define os métodos comuns e a interface para os scrapers específicos, 
 * garantindo consistência na extração de texto e logs.
 */
export class BaseScraper {
  
  /**
   * Cria uma instância do BaseScraper.
   * @param {string} siteName - O nome do sistema alvo (ex: 'SEI', 'Aprova Digital').
   */
  constructor(siteName) {
    /** @type {string} */
    this.siteName = siteName;
  }

  /**
   * Busca, extrai e sanitiza o texto de um elemento dentro do DOM.
   * Realiza a limpeza de espaços em branco e fornece um valor padrão caso o dado esteja ausente.
   * * @param {HTMLElement} element - O elemento pai (container) onde a busca será realizada.
   * @param {string} selector - O seletor CSS do elemento alvo contendo o dado.
   * @returns {string} O texto limpo do elemento ou 'Não Informado' se o elemento/texto for inválido.
   */
  getText(element, selector) {
    /** @type {HTMLElement|null} */
    const el = element.querySelector(selector);

    if (!el) return 'Não Informado';
    
    /** @type {string} */
    const text = el.innerText.trim();

    if (text.length > 0) {
      return text;
    } else {
      return 'Não Informado';
    }
  }

  /**
   * Registra no console o início da operação de extração para fins de depuração.
   * @function logStart
   * @returns {void}
   */
  logStart() {
    console.log(`[UrbSync] Iniciando extração no ambiente: ${this.siteName}...`);
  }

  /**
   * Método principal de extração de dados. 
   * Este método atua como um contrato de interface e deve ser obrigatoriamente 
   * sobrescrito pelas classes especializadas.
   * * @abstract
   * @method extract
   * @throws {Error} Lança um erro se for chamado diretamente da classe base sem implementação na classe filha.
   * @returns {Array<Object>|Object} Deve retornar os dados estruturados do sistema alvo.
   */
  extract() {
    throw new Error("O método extract() deve ser implementado na classe especializada (filha).");
  }
}