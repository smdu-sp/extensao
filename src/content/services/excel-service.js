/**
 * @fileoverview Serviço de geração e manipulação de planilhas Excel para o UrbSync.
 * * Esta classe encapsula a biblioteca externa ExcelJS para estruturar, estilizar 
 * e exportar os dados extraídos dos sistemas municipais. Foi projetada para 
 * converter os dados em Base64, permitindo o tráfego de arquivos entre o 
 * Content Script e o Background Script de forma íntegra.
 * * @author Victor Kiss
 */

import '../../../vendor/exceljs.min.js';

/**
 * @class ExcelService
 * @classdesc Provedor de serviços para criação de arquivos .xlsx.
 */
export class ExcelService {
    
    /**
     * Inicializa uma nova instância do serviço e cria um Workbook (livro de trabalho).
     * Configura os metadados do documento e resolve a referência global da biblioteca.
     * * @constructor
     * @throws {Error} Caso a biblioteca ExcelJS não seja encontrada no escopo global.
     */
    constructor() {
        /** * Busca a referência do ExcelJS de forma resiliente em diferentes contextos 
         * (Window, Global ou Worker).
         * @type {Object} 
         */
        const Excel = typeof ExcelJS !== 'undefined' ? ExcelJS : (self.ExcelJS || globalThis.ExcelJS);
        
        if (!Excel) {
            throw new Error("[UrbSync] Biblioteca ExcelJS não carregada.");
        }

        /** @type {Object} Instância do Workbook do ExcelJS */
        this.workbook = new Excel.Workbook();
        
        // Configuração de metadados para auditoria e propriedades do arquivo
        this.workbook.creator = 'UrbSync Extrator por Victor Kiss';
        this.workbook.lastModifiedBy = 'UrbSync';
        this.workbook.created = new Date();
    }

    /**
     * Adiciona uma nova aba (Worksheet) à planilha com configurações de cabeçalho e dados.
     * * @param {string} sheetName - O nome da aba (Ex: 'SEI' ou 'Aprova Digital').
     * @param {Array<Object>} headers - Configuração das colunas (contendo header, key e width).
     * @param {Array<Object>} data - Array de objetos com os processos extraídos.
     * @returns {void}
     * @throws {Error} Se o Workbook não estiver devidamente instanciado.
     */
    addSheet(sheetName, headers, data) {
        if (!this.workbook) throw new Error("Workbook não inicializado.");
        if (!data || data.length === 0) return;

        /** @type {Object} Referência para a nova aba criada */
        const sheet = this.workbook.addWorksheet(sheetName);
        
        /** * Mapeia as colunas garantindo a estrutura exigida pelo ExcelJS.
         * Define a largura padrão caso não seja especificada.
         */
        sheet.columns = headers.map(h => ({
            header: h.header,
            key: h.key,
            width: h.width || 30
        }));

        /** * Estilização Visual do Cabeçalho (Linha 1).
         * Aplica fundo azul e texto branco em negrito.
         */
        const firstRow = sheet.getRow(1);
        firstRow.font = { bold: true, color: { argb: 'FFFFFF' } };
        firstRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '1d4ed8' }, // Azul padrão UrbSync
        };

        /** Inserção em lote para melhor performance */
        sheet.addRows(data);
    }

    /**
     * Converte o Workbook atual em um buffer binário e, posteriormente, em uma Data URL (Base64).
     * * Este processo é fundamental no Manifest V3 para transferir arquivos binários pesados 
     * entre contextos isolados (Content Script -> Background) sem corromper os dados 
     * ou violar políticas de segurança.
     * * @async
     * @function getBase64
     * @returns {Promise<string>} Promessa que resolve em uma string Base64 tipada (.xlsx).
     * @throws {Error} Caso ocorra erro na geração do buffer ou na leitura do arquivo.
     */
    async getBase64() {
        try {
            const buffer = await this.workbook.xlsx.writeBuffer();
        
            // Use Uint8Array para garantir que o Blob seja construído 
            // a partir de uma visão correta do buffer binário
            const blob = new Blob([new Uint8Array(buffer)], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
    
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result;
                    console.log('reader',reader.result)
                    // Log para debug: se o tamanho for muito pequeno (ex: < 1000 bytes), 
                    // algo deu errado na geração
                    console.log("[UrbSync] Tamanho do Base64 gerado:", base64data.length);
                    resolve(base64data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            
            });
        } catch (error) {
            console.error("[UrbSync - ExcelService] Erro ao gerar buffer Excel:", error);
            throw error;
        }
    }
}