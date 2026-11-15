"""Monta a página de um Reel 9:16 a partir das cenas de um roteiro APROVADO.

uso:
  python3 build_reel.py --cenas cenas.json --roteiro roteiro.md --out pagina.html
  python3 build_reel.py --cenas templates/exemplo.json --exemplo --out exemplo.html   # só para testar o modelo

Depois, para gravar o MP4 (motor do motion-broll, sem alterações):
  node ../motion-broll/engine/render.js pagina.html video.mp4 30
"""
import argparse, base64, json, pathlib, re, sys

AQUI = pathlib.Path(__file__).resolve().parent
MOTOR = AQUI.parent / 'motion-broll' / 'engine' / 'motion.js'
b64 = lambda p: base64.b64encode(p.read_bytes()).decode()

def status_do_roteiro(p: pathlib.Path) -> str:
    m = re.match(r'---\n(.*?)\n---', p.read_text(encoding='utf-8'), re.S)
    if not m:
        return ''
    s = re.search(r'^status:\s*(\S+)', m.group(1), re.M)
    return s.group(1) if s else ''

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cenas', required=True)
    ap.add_argument('--roteiro')
    ap.add_argument('--out', required=True)
    ap.add_argument('--exemplo', action='store_true', help='testa o modelo com cenas de exemplo (sem roteiro)')
    a = ap.parse_args()

    if not a.exemplo:
        if not a.roteiro:
            sys.exit('Falta --roteiro: o vídeo só é montado a partir de um roteiro aprovado.')
        st = status_do_roteiro(pathlib.Path(a.roteiro))
        if st != 'aprovado':
            sys.exit(f'Roteiro com status "{st or "sem status"}": aguarde a aprovação (status: aprovado) antes de produzir o vídeo.')

    reel = json.loads(pathlib.Path(a.cenas).read_text(encoding='utf-8'))
    cor = reel['cor']
    css = (AQUI / 'templates' / 'reel.css').read_text(encoding='utf-8')
    css = (css.replace('__SERIF__', b64(AQUI / 'fonts' / reel.get('fonteSerif', 'Newsreader-Variable.woff2')))
              .replace('__SERIF_I__', b64(AQUI / 'fonts' / reel.get('fonteSerifItalico', 'Newsreader-Italic-Variable.woff2')))
              .replace('__SANS__', b64(AQUI / 'fonts' / reel.get('fonteSans', 'Manrope-Variable.woff2'))))
    vars_ = f':root{{--cor-fundo:{cor["fundo"]};--cor-texto:{cor["texto"]};--cor-destaque:{cor["destaque"]}}}'
    alfa = ' class="alpha"' if any(c.get('fundoVideo') for c in reel['cenas']) else ''
    html = (f'<!doctype html><html{alfa}><head><meta charset="utf-8">'
            f'<title>{reel.get("titulo", "Reel")}</title><style>{vars_}{css}</style></head><body>'
            '<div id="wrap"><div id="stage"></div></div>'
            f'<script>window.REEL={json.dumps(reel, ensure_ascii=False)};</script>'
            f'<script>{MOTOR.read_text(encoding="utf-8")}</script>'
            f'<script>{(AQUI / "templates" / "reel.js").read_text(encoding="utf-8")}</script>'
            '</body></html>')
    out = pathlib.Path(a.out); out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding='utf-8')
    print('montado', out, f'({reel["cenas"][-1]["fim"]} s, {len(reel["cenas"])} cenas)')

if __name__ == '__main__':
    main()
