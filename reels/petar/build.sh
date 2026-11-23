#!/bin/bash
set -e
S=${WORKDIR:-$(pwd)/work}  # raw/ = clips do Drive (pasta "Petar"), edit/grad.png = degradê do topo
R=$S/raw; O=$S/edit/seg; mkdir -p $O
B=/usr/share/fonts/opentype/inter/InterDisplay-Black.otf
M=/usr/share/fonts/opentype/inter/Inter-SemiBold.otf
GRADE="eq=contrast=1.06:saturation=1.18,unsharp=5:5:0.4"
# name src start dur orient text
segs=(
"01 0015 15.3 3.0 v"
"02 0003 8.6 2.0 v"
"03 0005 0.3 2.5 v"
"04 0005 26.5 3.0 v"
"05 0010 5.2 2.6 h"
"06 0010 23.0 3.2 h"
"07 0013 7.4 2.6 v"
"08 0014 3.6 2.4 v"
"09 0015 0.6 2.6 v"
"10 0015 6.0 3.4 v"
"11 0015 18.8 3.6 v"
)
i=0
for s in "${segs[@]}"; do
 read n src st d o <<<"$s"
 if [ $o = h ]; then V="crop=ih*9/16:ih,scale=1080:1920"; else V="scale=1080:1920"; fi
 ffmpeg -v error -y -ss $st -t $d -i $R/$src.mp4 -vf "$V,fps=30,$GRADE,format=yuv420p" \
  -af "aresample=48000,volume=0.5,afade=t=in:d=0.15,afade=t=out:st=$(python3 -c "print($d-0.15)"):d=0.15" -ac 2 \
  -c:v libx264 -preset fast -crf 17 -c:a aac -b:a 192k $O/$n.mp4
done
ls $O/*.mp4 | sed 's/^/file /' > $O/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $O/list.txt -c copy $S/edit/concat.mp4
# overlays
TXT="drawtext=fontfile=$B:fontcolor=white:borderw=0:shadowcolor=black@0.55:shadowx=0:shadowy=4:x=(w-tw)/2"
ffmpeg -v error -y -i $S/edit/concat.mp4 -i $S/edit/grad.png -filter_complex "[0:v][1:v]overlay=0:0,\
$TXT:text='PETAR':fontsize=170:y=h*0.17:enable='between(t,0.2,3)',\
drawtext=fontfile=$M:fontcolor=white:shadowcolor=black@0.6:shadowy=3:x=(w-tw)/2:text='Alto Ribeira · São Paulo':fontsize=52:y=h*0.17+190:enable='between(t,0.4,3)',\
$TXT:text='Mata Atlântica':fontsize=96:y=h*0.17:enable='between(t,3.2,8)',\
$TXT:text='trilha, rio':fontsize=96:y=h*0.17:enable='between(t,10.7,13)',\
$TXT:text='e ponte pênsil':fontsize=96:y=h*0.17:enable='between(t,13.3,16.5)',\
$TXT:text='até a caverna':fontsize=96:y=h*0.17:enable='between(t,16.5,21.5)',\
$TXT:text='vale cada degrau':fontsize=96:y=h*0.17:enable='between(t,28.6,31.5)',\
fade=t=out:st=31.0:d=0.5" -af "afade=t=out:st=30.8:d=0.7,loudnorm=I=-16:TP=-1.5" \
 -c:v libx264 -preset slow -crf 21 -profile:v high -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 192k -ar 48000 $S/edit/petar_reels.mp4
ffprobe -v error -show_entries format=duration,size -of csv=p=0 $S/edit/petar_reels.mp4
