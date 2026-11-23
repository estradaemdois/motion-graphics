# Reels PETAR – melhores momentos

Reels de 31s (1080×1920) feito com os 8 primeiros vídeos da pasta "Petar" no Google Drive
(DJI_20261120_0003, 0005, 0010–0015).

- `build.sh`: corta os trechos, aplica correção de cor, junta e coloca os textos (ffmpeg).
- O MP4 final (~83 MB) não vai para o git; fica em `output/` (ignorado).

Gradiente do topo: `ffmpeg -f lavfi -i "color=black:s=1080x760,format=rgba" -vf "geq=r=0:g=0:b=0:a='170*pow(1-Y/H,1.6)'" -frames:v 1 edit/grad.png`

## Versão 2 – design Estrada em Dois (Remotion, sem áudio)
Pasta `remotion/`: título "Melhores momentos · Petar", capítulos em pílula (Mata Atlântica, Rio e ponte pênsil,
Rumo à caverna, Dentro da caverna), barra de progresso âmbar e card final com a assinatura "Estrada em Dois".
Cores e fontes da ficha `marca-estradaemdois.md` (Bricolage Grotesque + DM Sans, #17302A / #F4EBDD / #F2B33D).

Para renderizar: coloque os trechos 01.mp4–11.mp4 (gerados pelo `build.sh`, pasta `edit/seg`) em `remotion/public/`,
rode `npm i remotion@4.0.546 @remotion/cli@4.0.546 react@18.3.1 react-dom@18.3.1` e `npm run render`.
