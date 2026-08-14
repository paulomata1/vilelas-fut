# Vilelas Fut V5

Mantém todas as regras e recursos validados na V4 e adiciona:

- PWA instalável no celular/desktop, com manifest, ícones e service worker.
- Funcionamento offline dos arquivos principais após o primeiro carregamento.
- Botão "Instalar" com suporte ao prompt do navegador e instruções quando necessário.
- Modo Placar dedicado com times, sequência de vitórias, cronômetro, próximo time e controles de resultado.
- Opção de tela cheia no modo placar.
- Card da noite gerado em PNG (1080x1350) com resumo e Top 5 do ranking.
- Compartilhamento nativo do card em celulares compatíveis (incluindo WhatsApp quando disponível no menu de compartilhamento).
- Fallback para download do PNG quando o compartilhamento de arquivos não é suportado.
- Tempo padrão de nova noite continua em 8 minutos.

## Publicação
Suba todos os arquivos, incluindo `manifest.json`, `service-worker.js` e a pasta `icons/`, para a raiz do GitHub Pages.

> Observação: o PWA depende de HTTPS, requisito que o GitHub Pages já atende.
