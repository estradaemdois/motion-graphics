---
name: reels-verticais
description: Monta e grava Reels verticais 9:16 (1080x1920) de motion graphics a partir de um roteiro APROVADO — gancho com pêndulo, busca com métrica, gráfico circular, ondas, cartões ✓/✗ e encerramento com assinatura — reaproveitando o motor do motion-broll (motion.js e render.js). Use quando pedirem para produzir o vídeo de um roteiro aprovado, como os do agente de conteúdo de radiestesia do @trechoquecura.
---

# Reels verticais

Produz o vídeo de um roteiro **já aprovado**.
- Cada Reel é uma página HTML que desenha qualquer quadro a partir do tempo (`seek(t)`).
- O MP4 é gravado pelo `render.js` do motion-broll, com desfoque de movimento.
- O motor (`../motion-broll/engine/`) **não é alterado**. Esta habilidade só usa o `motion.js` (molas) e o `render.js`.

## Arquivos
- `build_reel.py`: monta a página. **Recusa** roteiros cujo cabeçalho não tenha `status: aprovado`.
- `templates/reel.js`: as cenas. `templates/reel.css`: o estilo.
- `templates/exemplo.json`: cenas de teste do modelo.
- `quadros.js`: folha de quadros em formato vertical (o `beats.js` do motion-broll usa 16:9).
- `fonts/`: Newsreader e Manrope (SIL Open Font License), embutidas na página.

## Cenas (`cenas.json`)
```json
{"titulo":"…","cor":{"fundo":"#164A4E","texto":"#FBFAF7","destaque":"#E2C07E","luz":"rgba(226,192,126,0.16)"},
 "cenas":[{"tipo":"gancho","ini":0,"fim":3,"rotulo":"…","titulo":"texto com *destaque em itálico*"}, …]}
```

| tipo | campos | arte |
|---|---|---|
| `gancho` | rotulo, titulo | título grande + traço + pêndulo balançando |
| `busca` | rotulo, consulta, metrica, metricaLegenda, fonte | barra digitando a busca + número grande |
| `grafico` | rotulo, titulo, texto | gráfico circular que se desenha e gira |
| `ondas` | rotulo, titulo, texto | ondas que pulsam do centro |
| `cartoes` | rotulo, titulo, itens [{ok, texto}] | cartões com ✓ (ok) ou ✗ |
| `final` | titulo, assinatura, perfil, nota | traço + assinatura da marca |

`*texto*` vira itálico na cor de destaque.

Regras de conteúdo:
- **número só com fonte** (campo `fonte`);
- texto entre y≈330 e 1450 e à esquerda de x 960, fora das áreas da interface do Instagram;
- uma ideia por cena, de 4 a 6 s cada.

## Passo a passo
```bash
python3 build_reel.py --cenas cenas.json --roteiro roteiro.md --out work/pagina.html
node quadros.js work/pagina.html work/folha.png 1.5 6 11 17 23 29     # conferir antes de gravar
node ../motion-broll/engine/render.js work/pagina.html work/video-mudo.mp4 30
ffmpeg -i work/video-mudo.mp4 -f lavfi -i anullsrc=r=48000:cl=stereo -map 0:v -map 1:a -c:v copy -c:a aac -shortest -movflags +faststart video.mp4
```
- A gravação usa 4 subquadros por quadro, então é mais lenta que o tempo real (minutos).
- O áudio mudo é colocado porque alguns apps recusam vídeo sem faixa de som. A música é escolhida no Instagram.
- **Vídeo de fundo** (Pexels ou vídeos próprios): em cada cena, use `fundoVideo` (link ou arquivo), `fundoInicio`, `veu` (0–1) e `creditoFundo`. Com isso a página sai transparente. Grave em `.mov` e junte com o `compor.py`:
  ```bash
  node ../motion-broll/engine/render.js work/pagina.html work/animacao.mov 30
  python3 compor.py --cenas cenas.json --animacao work/animacao.mov --out video.mp4 --cache work/fundos
  ```
  O `compor.py` baixa os vídeos com curl (o Pexels recusa outros clientes), recorta para 9:16, aplica o véu na cor da marca, coloca a animação por cima e lista os créditos.
  Não use imagens que pareçam uma sessão real que não aconteceu.
- **Sons:** use a habilidade `sound-effects` deste repositório.

Requisitos: Node com Playwright e Chromium, Python 3 e ffmpeg (`../motion-broll/scripts/setup.sh`).
