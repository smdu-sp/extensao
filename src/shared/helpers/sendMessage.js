import { setStatus } from "./set-status.js";

/**
 * @fileoverview Helper de mensageria da extensão UrbSync.
 * * Este módulo encapsula a API nativa `chrome.tabs.sendMessage` em Promises,
 * facilitando o uso de `async/await` no restante da aplicação. Além disso,
 * centraliza o tratamento de erros para casos onde o Content Script ainda não 
 * foi injetado ou a aba foi invalidada.
 * * @author Victor Kiss
 */

/**
 * Envia uma mensagem assíncrona do Popup ou Background para o Content Script 
 * injetado na aba ativa do navegador.
 * * @async
 * @function sendMessageToContent
 * @param {string} action - O nome da ação a ser executada no destino (ex: 'extract_data', 'clear_data').
 * @param {Object} [payload={}] - Objeto contendo dados adicionais necessários para a execução da ação.
 * @returns {Promise<Object|null>} Retorna a resposta enviada pelo Content Script ou `null` em caso de erro de conexão.
 * * @example
 * const response = await sendMessageToContent('extract_data', { system: 'SEI' });
 * if (response) console.log(response.msg);
 */
export async function sendMessageToContent(action, payload = {}) {
    try {
        /** * 1. Identificação da Aba Ativa.
         * Busca a aba que está atualmente focada e na janela atual do usuário.
         * @type {chrome.tabs.Tab[]} 
         */
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        /** * 2. Validação de Segurança.
         * Garante que existe uma aba válida antes de tentar a comunicação.
         */
        if (!tab) {
            setStatus("erro", "Nenhuma aba ativa encontrada.");
            return null;
        }

        /** * 3. Promisificação da API Chrome.
         * Transforma o padrão de callback da API `chrome.tabs.sendMessage` em uma Promise.
         */
        return new Promise((resolve) => {
            chrome.tabs.sendMessage(tab.id, { action, ...payload }, (response) => {
                
                /** * 4. Tratamento de Erro de Conexão (Runtime LastError).
                 * Ocorre principalmente quando o Content Script não está presente na página.
                 * Isso acontece se a página foi carregada antes da extensão ser instalada
                 * ou se é uma página restrita do navegador (ex: chrome:// settings).
                 */
                if (chrome.runtime.lastError) {
                    console.warn(
                        "[UrbSync - Helper] Erro de conexão com a aba:", 
                        chrome.runtime.lastError.message
                    );
                    
                    // Instrução amigável para o usuário final
                    setStatus("erro", "Erro: Atualize a página (F5) para ativar a extensão.");
                    resolve(null);
                } else {
                    /** * 5. Sucesso na Comunicação.
                     * Retorna os dados processados pelo Content Script.
                     */
                    resolve(response);
                }
            });
        });

    } catch (error) {
        /** * Captura falhas críticas na própria API de abas do Chrome ou erros inesperados.
         */
        console.error("[UrbSync - Helper] Erro fatal ao buscar abas:", error);
        setStatus("erro", "Falha interna ao acessar o navegador.");
        return null;
    }
}