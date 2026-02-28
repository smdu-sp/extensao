import { getData } from '../shared/utils/storage-manager.js';
import { setStatus } from '../shared/helpers/set-status.js';
import { sendMessageToContent } from '../shared/helpers/sendMessage.js';

/**
 * @fileoverview Script controlador da interface (Popup) da extensão UrbSync.
 * * Este módulo gerencia a interação do usuário com o popup, disparando comandos 
 * para os Content Scripts injetados nas abas e atualizando o estado visual 
 * da extensão (loading, sucesso, erro e contadores).
 * * @author Victor Kiss
 */

/**
 * Listener para o botão de extração de dados.
 * * Solicita ao Content Script a varredura da página atual (SEI ou Aprova Digital) 
 * para identificar e salvar novos processos no armazenamento local.
 * * @async
 * @listens click
 * @returns {Promise<void>}
 */
document.querySelector("#extractBtn").addEventListener("click", async () => {
    // Fornece feedback visual imediato para evitar cliques duplicados
    setStatus("loading", "Iniciando extração...");

    try {
        /** @type {Object|null} Resposta da extração contendo o status e total de itens */
        const response = await sendMessageToContent('extract_data');

        if (response && response.status === "sucesso") {
            const news = response.inserted;
            setStatus("sucesso", `Sucesso! +${news} processos extraídos!`);
            await updateCounter();
        } else {
            // Exibe mensagem de erro específica do scraper ou fallback genérico
            setStatus("erro", response?.msg || "Erro na extração.");
        }
    } catch (error) {
        console.error("[UrbSync - Popup] Erro na comunicação de extração:", error);
        setStatus("erro", "Falha na comunicação com a aba.");
    }
});

/**
 * Listener para o botão de geração de planilha Excel.
 * * Aciona o serviço de Excel no Content Script, que compila os dados do storage, 
 * gera um arquivo binário e solicita o download ao Background Script.
 * * @async
 * @listens click
 * @returns {Promise<void>}
 */
document.querySelector("#saveExcelBtn").addEventListener("click", async () => {
    setStatus("loading", "Gerando planilha Excel...");

    try {
        /** @type {Object|null} */
        const response = await sendMessageToContent('save_excel');

        if (response && response.status === "sucesso") {
            setStatus("sucesso", response.msg);
        } else {
            setStatus("erro", response?.msg || "Erro ao salvar Excel.");
        }
    } catch (error) {
        console.error("[UrbSync - Popup] Erro na comunicação de download:", error);
        setStatus('erro', "Erro inesperado ao baixar.");
    }
});

/**
 * Listener para o botão de limpeza de dados.
 * * Remove todos os registros salvos no `chrome.storage.local` após confirmação 
 * explícita do usuário para evitar perda acidental de dados.
 * * @async
 * @listens click
 * @returns {Promise<void>}
 */
document.querySelector("#clearDataBtn").addEventListener("click", async () => {
    
    /** @type {boolean} Confirmação de segurança via diálogo nativo */
    const confirmacao = confirm("Tem certeza que deseja apagar todos os processos salvos?");
    if (!confirmacao) return;

    setStatus("loading", "Limpando memória...");

    try {
        /** @type {Object|null} */
        const response = await sendMessageToContent('clear_data');

        if (response && response.status === "sucesso") {
            setStatus("sucesso", response.msg);
            await updateCounter();
        } else {
            setStatus("erro", response?.msg || "Erro ao excluir dados.");
        }
    } catch (error) {
        console.error("[UrbSync - Popup] Erro na comunicação de limpeza:", error);
        setStatus('erro', "Erro ao tentar limpar memória.");
    }
});

/**
 * Atualiza o contador de processos exibido no Popup.
 * * Consulta o Storage Manager para obter a quantidade total de processos 
 * armazenados e renderiza o valor no elemento de texto da interface.
 * * @async
 * @function updateCounter
 * @returns {Promise<void>}
 */
async function updateCounter() {
    /** @type {HTMLElement|null} Elemento que exibe o total de processos */
    const statusDiv = document.querySelector("#process-text");
    if (!statusDiv) return;

    try {
        /** @type {Array<Object>} Dados recuperados do storage local */
        const dados = await getData();
        const count = dados ? dados.length : 0;
        
        // Renderização com destaque no numeral
        statusDiv.innerHTML = `<strong>${count}</strong> Processos salvos na memória.`;
    } catch (error) {
        console.error("[UrbSync - Popup] Erro ao atualizar contador:", error);
        statusDiv.innerText = "Erro ao carregar contador.";
    }
}

/**
 * Inicialização da interface.
 * * Garante que o contador esteja atualizado assim que o popup for aberto.
 * @listens DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
    updateCounter();
});