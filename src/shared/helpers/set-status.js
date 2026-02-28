/**
 * @fileoverview Utilitário de manipulação da interface do Popup UrbSync.
 * * Este módulo é responsável por gerenciar o feedback visual em tempo real para o usuário.
 * Ele controla as cores dos indicadores (dots) e os textos de status utilizando as 
 * classes utilitárias do Tailwind CSS, garantindo uma experiência de uso fluida 
 * durante operações assíncronas de extração e salvamento.
 * * @author Victor Kiss
 */

/**
 * Atualiza dinamicamente o estado visual e textual na interface do Popup.
 * * A função alterna entre estados de sucesso, erro e carregamento, realizando a 
 * limpeza de classes anteriores para evitar conflitos de estilo no DOM.
 * * @function setStatus
 * @param {('sucesso'|'erro'|'loading')} tipo - O estado semântico da operação atual.
 * @param {string} mensagem - O texto descritivo que será exibido no elemento de status.
 * @returns {void}
 * * @example
 * setStatus('loading', 'Extraindo dados...');
 * setStatus('sucesso', 'Processo concluído!');
 */
export function setStatus(tipo, mensagem) {
    /** @type {HTMLElement|null} Elemento de texto do status */
    const statusDiv = document.querySelector("#status-text");
    /** @type {HTMLElement|null} Indicador visual circular (dot) */
    const statusDot = document.querySelector(".status-dot");

    // Previne falhas de execução caso os elementos do DOM ainda não estejam disponíveis
    if (!statusDiv || !statusDot) return;

    /** * Configuração de mapeamento de classes Tailwind CSS para cada estado.
     * @type {Object.<string, {text: string, dot: string}>} 
     */
    const statusConfig = {
        sucesso: { text: "text-emerald-400", dot: "bg-emerald-400" },
        erro:    { text: "text-red-400",     dot: "bg-red-400" },
        loading: { text: "text-yellow-400",  dot: "bg-yellow-400" }
    };

    /** @type {{text: string, dot: string}|undefined} Configuração selecionada */
    const config = statusConfig[tipo];
    if (!config) return;

    // Desestruturação para facilitar a limpeza de estados anteriores
    const { sucesso, erro, loading } = statusConfig;

    /**
     * 1. Limpeza de Estado (Reset).
     * Remove todas as possíveis classes de cor do Tailwind e os estilos 
     * padrão de inicialização (zinco/branco translúcido).
     */
    statusDiv.classList.remove(
        sucesso.text, erro.text, loading.text, 'text-zinc-300'
    );
    statusDot.classList.remove(
        sucesso.dot, erro.dot, loading.dot, 'bg-white/60'
    );

    /**
     * 2. Aplicação do Novo Estado.
     * Adiciona as classes correspondentes ao tipo de status solicitado.
     */
    statusDiv.classList.add(config.text);
    statusDot.classList.add(config.dot);
    
    /** 3. Atualização do Conteúdo Textual. */
    statusDiv.innerText = mensagem; 
    
    /** Log de depuração específico para o contexto do Popup */
    console.log(`[UrbSync - UI] Status: ${tipo.toUpperCase()} | ${mensagem}`);
}