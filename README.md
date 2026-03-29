
# 🏙️ UrbSync - Automação e Extração de Processos

<p align="center">
  <img src="src/assets/images/project_humb.png" alt="UrbSync Cover" width="800">
</p>

<p align="center">
  <a href="https://urbsync.vercel.app/">🌐 Site Oficial</a> • 
</p>

## 💡 O Problema e a Solução

Analisar processos urbanísticos exige a compilação de dezenas de dados espalhados por diferentes portais governamentais. Fazer isso manualmente gera perda de tempo, inconsistência de dados e retrabalho.

O **UrbSync** nasceu dentro da Secretaria Municipal de Urbanismo e Licenciamento de São Paulo (SMUL - SP) para resolver exatamente isso. Ele atua como uma ponte de **interoperabilidade de dados**, transformando horas de cópia e cola manual em um fluxo automatizado de apenas um clique. A extensão extrai, higieniza e estrutura as informações dos portais **Aprova Digital** e **SEI**, gerando planilhas Excel prontas para uso.

## ✨ Principais Recursos

* **🚀 Extração em Um Clique:** Captura dezenas de campos complexos de processos em milissegundos.
* **📊 Exportação Nativa (.xlsx):** Gera planilhas Excel formatadas, com dados tipados e limpos, prontos para análise.
* **🧠 Acúmulo de Contexto:** Capacidade de navegar por múltiplas páginas de processos e extrair todos para um único arquivo unificado.
* **🔒 100% Client-Side:** Todo o processamento ocorre no navegador do usuário. Zero dados enviados para a nuvem. Conformidade total com a LGPD.
* **🎨 UI/UX Integrada:** Interface limpa, minimalista e desenhada com a identidade visual institucional, garantindo facilidade de uso para qualquer servidor ou usuário.

---

## 🛠️ Engenharia e Arquitetura

O UrbSync não é apenas um script de raspagem de dados; ele foi desenhado com **Programação Orientada a Objetos (POO)** e padrões de projeto para garantir escalabilidade e resistência a mudanças nos portais alvo.

* **Tech Stack:** JavaScript (ES6+), Manifest V3, Tailwind CSS, ExcelJS.
* **Factory Pattern & Polimorfismo:** A inteligência da extensão reside na `ScraperFactory`. Ela identifica dinamicamente o portal (Aprova ou SEI) e invoca a classe correspondente. Todas herdam de `BaseScraper`, mantendo o contrato do método `.extract()` intacto.
* **Manifest V3 Ready:** Contornamos as pesadas restrições do Manifest V3 delegando o processamento do *ExcelJS* para o **Background Service Worker** e garantindo isolamento total de contexto (Isolated Worlds) para não conflitar com as páginas da prefeitura.

---

## 👨‍💻 Para Desenvolvedores e Equipe de TI

Abaixo, os passos para rodar o projeto localmente ou realizar manutenções nas regras de negócio.

### Instalação e Build Local

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Gere a build de produção:
   ```bash
   npm run build
   ```
3. No Chrome, acesse `chrome://extensions/`, ative o **Modo do Desenvolvedor**, clique em **Carregar sem compactação** e selecione a pasta raiz do projeto.

### Guia Rápido de Manutenção

Como os portais governamentais podem sofrer atualizações de interface, o UrbSync foi feito para ser fácil de consertar:

* **Os seletores pararam de funcionar?**
  Não mexa na lógica de extração. Basta ir no dicionário central em `/src/shared/constants/scraper.js` e atualizar a string do seletor CSS correspondente.
* **Como adicionar um novo sistema (ex: SLCE)?**
  1. Crie `SlceScraper.js` na pasta `/scrapers/`, estendendo `BaseScraper`.
  2. Implemente a regra específica no método `extract()`.
  3. Registre a nova rota no `detect-route.js`.

---

## 🛡️ Segurança e Privacidade

O UrbSync lida com processos públicos, mas foi construído sob o princípio de "Privacy by Design":
* A extensão não possui servidores de backend (Backendless).
* Só é ativada em domínios estritamente necessários (`*.prefeitura.sp.gov.br`).
* O armazenamento (`chrome.storage.local`) é volátil, mantido apenas durante a sessão de extração e pode ser apagado com um clique na interface.

---

**Criado e mantido por:** [Victor Kiss](https://www.linkedin.com/in/victor-kiss) 
*Desenvolvedor Front-end*

---
