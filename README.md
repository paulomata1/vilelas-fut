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

## V6
- Registro de defesas difíceis diretamente no Modo Placar.
- A faixa de goleiros usa o mesmo contador do ranking e do Card da Noite.
- No placar móvel, o botão + registra a defesa rapidamente; correções continuam disponíveis na tela principal para preservar espaço.
- Tratamento específico para iPhone: o botão "Tela cheia" vira "Modo App".
- No Safari do iPhone, o app orienta a usar "Adicionar à Tela de Início".
- Quando aberto como PWA no iPhone, o botão mostra "Modo App ✓".
- Android e desktop continuam usando a Fullscreen API normalmente.
- Cache da PWA atualizado para V6.

## V6.1
- No Modo Placar, os goleiros permanecem na ordem fixa em que foram cadastrados.
- A quantidade de defesas difíceis continua atualizando, mas não muda a posição dos botões.
- O ranking dos goleiros na tela principal e no Card da Noite continua ordenado pelo desempenho.
- Os avisos de rotação e regras agora aparecem acima do Modo Placar.
- O tempo de exibição dos avisos foi aumentado para aproximadamente 3,6 segundos.
