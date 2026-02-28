import { saveData, getData, clearData } from "../../shared/utils/storage-manager.js";
import { detectRoute } from "../modules/detect-route.js";
import { ExcelService } from "../services/excel-service.js";

/**
 * @fileoverview Content Script principal do UrbSync.
 * Gerencia a execução no contexto das páginas do SEI e Aprova Digital.
 * Atua como uma ponte entre o Popup e os módulos de extração/armazenamento.
 * * @author Victor Kiss
 */

/**
 * Configuração de colunas para a aba do sistema SEI.
 * @type {Array<{header: string, key: string, width: number}>}
 */
const headers_sei = [
    { header: 'TÉCNICO', key: 'tecnico', width: 25 },
    { header: 'PROCESSO', key: 'processo', width: 25 },
    { header: 'REQUERIMENTO', key: 'requerimento', width: 25 },
    { header: 'REQUERENTE', key: 'requerente', width: 25 },
];

/**
 * Configuração de colunas para a aba geral do Aprova Digital.
 * @type {Array<{header: string, key: string, width: number}>}
 */
export const headers_ad_geral = [
    { header: 'SISTEMA', key: 'sistema', width: 20 },
    { header: 'PROCESSO', key: 'processo', width: 20 },
    { header: 'Nº SEI', key: 'num_sei', width: 20 }, // Verifique se no Scraper é 'num_sei'
    { header: 'REQUERIMENTO', key: 'requerimento', width: 20 },
    { header: 'REQUERENTE', key: 'requerente', width: 30 },
    { header: 'PROPRIETÁRIO', key: 'proprietario', width: 30 },
    { header: 'CRIADO EM', key: 'criado_em', width: 15 },
    { header: 'ÚLTIMA AÇÃO', key: 'ultima_acao', width: 15 },
    { header: 'STATUS', key: 'status', width: 25 },
    { header: 'DATA CONSULTA', key: 'data_consulta', width: 15 }
];

// headers_ad_usuarios (Certifique-se que o Scraper gera 'recebido_em' e 'tecnico')
export const headers_ad_usuarios = [
    { header: 'SISTEMA', key: 'sistema', width: 25 },
    { header: 'TÉCNICO', key: 'tecnico', width: 25 },
    { header: 'PROCESSO', key: 'processo', width: 20 },
    { header: 'REQUERIMENTO', key: 'requerimento', width: 20 },
    { header: 'REQUERENTE', key: 'requerente', width: 30 },
    { header: 'RECEBIDO EM', key: 'recebido_em', width: 25 },
    { header: 'DATA CONSULTA', key: 'data_consulta', width: 15 }
];

/**
 * Configuração de colunas para a caixa de entrada (Inbox) do Aprova Digital.
 * @type {Array<{header: string, key: string, width: number}>}
 */
const headers_ad_caixa = [
    { header: 'SISTEMA', key: 'sistema', width: 25 },
    { header: 'PROCESSO', key: 'processo', width: 20 },
    { header: 'NUM_SEI', key: 'num_sei', width: 25 },
    { header: 'TAXAS', key: 'taxas', width: 25 },
    { header: 'REQUERIMENTO', key: 'requerimento', width: 20 },
    { header: 'REQUERENTE', key: 'requerente', width: 30 },
    { header: 'RECEBIDO EM', key: 'recebido_em', width: 25 },
    { header: 'DATA CONSULTA', key: 'data_consulta', width: 15 }
];

/**
 * Listener de mensagens do Chrome Runtime.
 * Roteia as solicitações vindas do Popup para as funções de tratamento (handlers).
 * * @param {Object} request - Objeto contendo os dados da solicitação.
 * @param {string} request.action - Nome da ação a ser executada.
 * @param {chrome.runtime.MessageSender} sender - Informações sobre o remetente da mensagem.
 * @param {function} sendResponse - Função para enviar a resposta de volta ao remetente.
 * @returns {boolean} Retorna true para manter o canal de mensagem aberto para respostas assíncronas.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request) {
        console.log(`[UrbSync] Iniciando ação solicitada: ${request.action}`);
    }

    switch (request.action) {
        case "extract_data":
            (async () => await handleExtraction(sendResponse))();
            return true;

        case "clear_data":
            (async () => await handleClearData(sendResponse))();
            return true;

        case "save_excel":
            (async () => await handleSaveExcel(sendResponse))();
            return true;

        default:
            sendResponse({ status: "erro", msg: "Ação desconhecida solicitada." });
            return false;
    }
});

/**
 * Orquestra o processo de extração de dados da página ativa.
 * Detecta a rota, extrai os dados, compara com o cache local e persiste as novidades.
 * * @async
 * @function handleExtraction
 * @param {function} sendResponse - Callback para enviar o status e estatísticas da extração ao Popup.
 * @returns {Promise<void>}
 */
async function handleExtraction(sendResponse) {
    try {
        const newData = await detectRoute();

        if (!newData || newData.length === 0) {
            sendResponse({ status: "erro", msg: "Nenhum processo encontrado nesta página." });
            return;
        }

        const oldData = await getData();
        const oldTotal = oldData.length;

        const newTotal = await saveData(newData);
        const insertedNow = newTotal - oldTotal;

        console.log(newData);

        sendResponse({
            status: "sucesso",
            total: newTotal,
            inserted: insertedNow,
            msg: "Sucesso! Dados extraídos."
        });
    } catch (error) {
        console.error("[UrbSync] Erro no processo de extração:", error);
        sendResponse({ status: "erro", msg: "Erro técnico ao extrair dados da página." });
    }
}

/**
 * Executa a limpeza total do armazenamento local da extensão.
 * * @async
 * @function handleClearData
 * @param {function} sendResponse - Callback para informar o sucesso ou erro da limpeza ao Popup.
 * @returns {Promise<void>}
 */
async function handleClearData(sendResponse) {
    try {
        await clearData();
        sendResponse({ status: "sucesso", msg: "Memória limpa com sucesso!" });
    } catch (error) {
        console.error("[UrbSync] Erro ao limpar memória:", error);
        sendResponse({ status: "erro", msg: "Erro interno ao excluir os dados salvos." });
    }
}

/**
 * Gera um arquivo Excel a partir dos dados armazenados e solicita o download.
 * Converte o Workbook em Base64 e envia para o Background Script (Service Worker) 
 * para processar o download via API de Downloads do Chrome.
 * * @async
 * @function handleSaveExcel
 * @param {function} sendResponse - Callback para informar o Popup sobre o início do download ou falha na geração.
 * @returns {Promise<void>}
 */
async function handleSaveExcel(sendResponse) {

    
    try {
        const data = await getData();
        console.log("[UrbSync] Dados recuperados para Excel:", data?.length);
        console.log(data.length)

        if (!data || data.length === 0) {
            sendResponse({ status: "erro", msg: "Não há dados para exportar. Extraia algo primeiro!" });
            return;
        }

        // Limpa cache anterior para evitar conflitos de arquivos corrompidos
        chrome.storage.local.remove("temp_excel_base64");

        console.log("[UrbSync] Inicializando ExcelService...");
        const workBook = new ExcelService();

        const sei = data.filter((proc) => proc.sistema === "SEI");
        
        const ad_geral = data.filter((proc) => proc.sistema === "Aprova Digital - Todos os Processos");
        const ad_usuarios = data.filter((proc) => proc.sistema === "Aprova Digital - Usuários");
        const ad_caixa = data.filter((proc) => proc.sistema.includes('Aprova Digital - Caixa'));

        workBook.addSheet('SEI', headers_sei, sei);
        workBook.addSheet('Aprova Digital - Geral', headers_ad_geral, ad_geral);
        workBook.addSheet('Aprova Digital - Usuários', headers_ad_usuarios, ad_usuarios);
        workBook.addSheet('Aprova Digital - Caixas', headers_ad_caixa, ad_caixa);

        console.log("[UrbSync] Gerando Base64...");
        const dataUrl = await workBook.getBase64();

        // Persistência robusta: O storage local suporta strings massivas sem truncar
        console.log("[UrbSync] Persistindo buffer no storage...");
        await chrome.storage.local.set({ temp_excel_base64: dataUrl });

        console.log("[UrbSync] Solicitando download ao Background...");
        chrome.runtime.sendMessage({
            action: "save_excel",
            filename: `urbsync_extracao_${new Date().getTime()}.xlsx`
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("[UrbSync] Erro de runtime:", chrome.runtime.lastError);
                sendResponse({ status: "erro", msg: "Erro de conexão com o serviço de download." });
            } else if (response && response.status === "erro") {
                sendResponse({ status: "erro", msg: response.msg });
            } else {
                sendResponse({ status: "sucesso", msg: "Planilha gerada!" });
            }
        });

    } catch (error) {
        console.error("[UrbSync] Erro crítico no handleSaveExcel:", error);
        sendResponse({ status: "erro", msg: `Erro técnico: ${error.message}` });
    }
}