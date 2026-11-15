"""Junta a animação transparente (.mov com alfa, gravada pelo render.js) com vídeos de fundo por cena.

uso:
  python3 compor.py --cenas cenas.json --animacao work/animacao.mov --out video.mp4 [--cache work/fundos]

Em cada cena do cenas.json, opcional:
  "fundoVideo": "https://videos.pexels.com/...mp4"  (ou caminho local)
  "fundoInicio": 2.0      segundo do clipe onde começa (padrão 0)
  "veu": 0.55             opacidade do véu na cor de fundo da marca sobre o vídeo (padrão 0.55)
Cena sem fundoVideo usa a cor de fundo da marca.
Os créditos de cada vídeo de fundo vão em "creditoFundo" e o script os lista no final.
"""
import argparse, json, pathlib, subprocess, hashlib

def run(*a):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *a], check=True)

def baixar(src, cache: pathlib.Path) -> str:
    if not src.startswith('http'):
        return src
    cache.mkdir(parents=True, exist_ok=True)
    dst = cache / (hashlib.sha1(src.encode()).hexdigest()[:12] + '.mp4')
    if not dst.exists():
        subprocess.run(['curl', '-sSfL', '-m', '300', '-o', str(dst), src], check=True)  # o Pexels recusa clientes sem navegador/curl
    return str(dst)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cenas', required=True); ap.add_argument('--animacao', required=True)
    ap.add_argument('--out', required=True); ap.add_argument('--cache', default='work/fundos')
    a = ap.parse_args()
    reel = json.loads(pathlib.Path(a.cenas).read_text(encoding='utf-8'))
    cor = reel['cor']['fundo'].lstrip('#')
    cache = pathlib.Path(a.cache); tmp = cache / 'segmentos'; tmp.mkdir(parents=True, exist_ok=True)
    segs, creditos = [], []
    for i, c in enumerate(reel['cenas']):
        dur = c['fim'] - c['ini']; seg = tmp / f'{i:02d}.mp4'
        cover = 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1'
        if c.get('fundoVideo'):
            src = baixar(c['fundoVideo'], cache)
            veu = c.get('veu', 0.55)
            run('-stream_loop', '-1', '-ss', str(c.get('fundoInicio', 0)), '-i', src,
                '-f', 'lavfi', '-i', f'color=c=0x{cor}:s=1080x1920:r=30',
                '-filter_complex', f'[0:v]{cover},format=yuv420p[v];[1:v]format=yuva420p,colorchannelmixer=aa={veu}[c];'
                                   f'[v][c]overlay=shortest=1,fade=in:st=0:d=0.35:color=0x{cor},format=yuv420p',
                '-t', f'{dur:.3f}', '-an', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', str(seg))
            if c.get('creditoFundo'):
                creditos.append(c['creditoFundo'])
        else:
            run('-f', 'lavfi', '-i', f'color=c=0x{cor}:s=1080x1920:r=30', '-t', f'{dur:.3f}',
                '-vf', 'format=yuv420p', '-c:v', 'libx264', '-crf', '16', str(seg))
        segs.append(seg)
    lista = tmp / 'lista.txt'; lista.write_text(''.join(f"file '{s.resolve()}'\n" for s in segs))
    fundo = tmp / 'fundo.mp4'
    run('-f', 'concat', '-safe', '0', '-i', str(lista), '-c', 'copy', str(fundo))
    run('-i', str(fundo), '-i', a.animacao, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
        '-filter_complex', '[0:v][1:v]overlay=shortest=1:format=auto,format=yuv420p[v]',
        '-map', '[v]', '-map', '2:a', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium',
        '-c:a', 'aac', '-shortest', '-movflags', '+faststart', a.out)
    print('composto', a.out)
    if creditos:
        print('Créditos dos vídeos de fundo:'); [print(' -', x) for x in dict.fromkeys(creditos)]

if __name__ == '__main__':
    main()
