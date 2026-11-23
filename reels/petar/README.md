# Reels PETAR – melhores momentos

Reels de 31s (1080×1920) feito com os 8 primeiros vídeos da pasta "Petar" no Google Drive
(DJI_20261120_0003, 0005, 0010–0015).

- `build.sh`: corta os trechos, aplica correção de cor, junta e coloca os textos (ffmpeg).
- O MP4 final (~83 MB) não vai para o git; fica em `output/` (ignorado).

Gradiente do topo: `ffmpeg -f lavfi -i "color=black:s=1080x760,format=rgba" -vf "geq=r=0:g=0:b=0:a='170*pow(1-Y/H,1.6)'" -frames:v 1 edit/grad.png`
