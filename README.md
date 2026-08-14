# Vilelas Fut V5

Mantém todas as regras e recursos validados na V4 e adiciona:

- PWA instalável no celular/desktop, com manifest, ícones e service worker.
- Funcionamento offline dos arquivos principais após o primeiro carregamento.
- Botão "Instalar" com suporte ao prompt do navegador e instruções quando necessário.
- Modo Placar dedicado com times, sequência de vitórias, cronômetro, próximo time e controles de resultado.
- Opção de tela cheia no modo placar.
- Card da noite gerado em PNG com resumo e destaques positivos da noite.
- Compartilhamento nativo do card em celulares compatíveis (incluindo WhatsApp quando disponível no menu de compartilhamento).
- Fallback para download do PNG quando o compartilhamento de arquivos não é suportado.
- Tempo padrão de nova noite continua em 8 minutos.

## Publicação
Suba todos os arquivos, incluindo `manifest.json`, `service-worker.js` e a pasta `icons/`, para a raiz do GitHub Pages.

> Observação: o PWA depende de HTTPS, requisito que o GitHub Pages já atende.

## V5.2 — ajuste do modo placar
- Modo placar passa a ocupar a altura útil inteira do aparelho sem rolagem.
- Em celulares na vertical, Time A e Time B permanecem lado a lado para caber na mesma tela.
- Cronômetro, nomes, sequência, próximo time e controles se adaptam à largura e altura disponíveis.
- Suporte a `100dvh` e áreas seguras de iPhone/PWA.
- Cache do service worker atualizado para `vilelas-fut-v5-2`.


## V5.3 · Ranking de goleiros e card ampliado
- Cadastro separado de goleiros fixos da noite.
- Registro de defesas difíceis com botão de correção.
- Ranking dos goleiros por quantidade de defesas difíceis.
- Card da noite com Top 5 e ranking dos goleiros, sem exibir os piores colocados.
- Mantidos os ajustes responsivos do modo placar da V5.2.

## V5.4 · Sequências de 4 vitórias no Card da Noite
- O Card da Noite agora mostra os times que alcançaram 4 vitórias consecutivas.
- Cada registro mostra o número do jogo e os cinco atletas que formavam o time.
- Quando houver várias sequências na noite, o card exibe as três mais recentes.


## V5.4.2 · Card somente com destaques positivos
- Removido do Card da Noite o ranking dos 5 piores jogadores.
- Mantidos Top 5, ranking dos goleiros e sequências de 4 vitórias.
- Layout do card foi recompactado após a remoção do bloco inferior do ranking.
