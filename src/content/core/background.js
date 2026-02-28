/**
 * @fileoverview Service Worker (Background Script) da extensão UrbSync.
 * Atualizado para evitar corrupção de arquivos via ponte de storage.
 * @author Victor Kiss
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("[UrbSync Background] Mensagem recebida:", request.action); // <-- LOG DE DEBUG
    
    if (request.action === "save_excel") {
        
        /**
         * Em vez de confiar na URL vinda diretamente do request (que pode ser truncada),
         * buscamos o Base64 persistido no storage local para garantir integridade.
         */
        chrome.storage.local.get(["temp_excel_base64"], (result) => {
            
            const dataUrl = result.temp_excel_base64;

            if (!dataUrl) {
                console.error("[UrbSync] Falha: Buffer do Excel não encontrado no storage.");
                sendResponse({ status: "erro", msg: "Buffer do arquivo expirou ou é inexistente." });
                return;
            }

            try {
                chrome.downloads.download({
                    url: dataUrl,
                    filename: request.filename || "urbsync_extracao.xlsx",
                    saveAs: true 
                }, (downloadId) => {
                    
                    // Limpa o storage após o processamento para liberar memória do navegador
                    chrome.storage.local.remove("temp_excel_base64");

                    if (chrome.runtime.lastError) {
                        console.error("[UrbSync] Erro no download:", chrome.runtime.lastError);
                        sendResponse({ 
                            status: "erro", 
                            msg: chrome.runtime.lastError.message 
                        });
                    } else {
                        sendResponse({ status: "sucesso", id: downloadId });
                    }
                });
            } catch (error) {
                console.error("[UrbSync] Exceção crítica:", error);
                sendResponse({ status: "erro", msg: error.message });
            }
        });

        return true; // Mantém o canal assíncrono aberto
    }
});