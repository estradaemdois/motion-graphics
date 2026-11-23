import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig, Easing} from 'remotion';
import {continueRender, delayRender} from 'remotion';

const TITLE = 'Bricolage Grotesque';
const BODY = 'DM Sans';
const FONTS: [string, string, string][] = [
  [TITLE, '700', 'BG700'], [TITLE, '800', 'BG800'], [BODY, '600', 'DM600'], [BODY, '700', 'DM700'],
];
if (typeof document !== 'undefined') {
  const h = delayRender('fonts');
  Promise.all(FONTS.map(([fam, w, file]) => {
    const ff = new FontFace(fam, `url(${staticFile(`fonts/${file}.woff2`)}) format('woff2')`, {weight: w});
    return ff.load().then((x) => document.fonts.add(x));
  })).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
}

const C = {verde: '#17302A', noite: '#0E1F1A', creme: '#F4EBDD', ambar: '#F2B33D', laranja: '#E8794A', salvia: '#8CC7A1'};
const FPS = 30;
// clip, seconds
const CLIPS: [string, number][] = [
  ['01', 3.0], ['02', 2.0], ['03', 2.5], ['04', 3.0], ['05', 2.6], ['06', 3.2],
  ['07', 2.6], ['08', 2.4], ['09', 2.6], ['10', 3.4], ['11', 3.6],
];
const starts: number[] = [];
let acc = 0;
for (const [, d] of CLIPS) { starts.push(acc); acc += Math.round(d * FPS); }
const VIDEO_END = acc;
const END_CARD = 90;
export const TOTAL = VIDEO_END + END_CARD;

// chapters: [label, startClipIdx, endClipIdxExclusive]
const CHAPTERS: [string, number, number][] = [
  ['Mata Atlântica', 1, 4],
  ['Rio e ponte pênsil', 4, 6],
  ['Rumo à caverna', 6, 8],
  ['Dentro da caverna', 8, 11],
];

const Clip: React.FC<{src: string; dur: number; idx: number}> = ({src, dur, idx}) => {
  const f = useCurrentFrame();
  const punch = interpolate(f, [0, 8], [1.12, 1.0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const drift = interpolate(f, [0, dur], [1, 1.06]);
  const dir = idx % 2 === 0 ? 1 : -1;
  const x = interpolate(f, [0, dur], [0, 18 * dir]);
  // white-ish flash into cut
  const flash = interpolate(f, [0, 4], [0.35, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: C.noite}}>
      <AbsoluteFill style={{transform: `scale(${punch * drift}) translateX(${x}px)`}}>
        <OffthreadVideo src={staticFile(`${src}.mp4`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      {idx > 0 && <AbsoluteFill style={{backgroundColor: C.creme, opacity: flash}} />}
    </AbsoluteFill>
  );
};

const Scrims: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(14,31,26,0.55) 0%, rgba(14,31,26,0) 30%, rgba(14,31,26,0) 75%, rgba(14,31,26,0.55) 100%)'}} />
  </AbsoluteFill>
);

const Pill: React.FC<{children: React.ReactNode; bg: string; color: string; size?: number}> = ({children, bg, color, size = 40}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 16, background: bg, color, borderRadius: 999,
    padding: `${size * 0.42}px ${size * 0.9}px`, fontFamily: BODY, fontWeight: 700, fontSize: size, letterSpacing: size * 0.06}}>
    {children}
  </div>
);

const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pill = spring({frame: f - 4, fps, config: {damping: 14, mass: 0.7}});
  const t1 = spring({frame: f - 10, fps, config: {damping: 13}});
  const sub = spring({frame: f - 20, fps, config: {damping: 16}});
  const out = interpolate(f, [80, 92], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const roadW = interpolate(f, [16, 40], [0, 420], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 330, opacity: out}}>
      <div style={{transform: `translateY(${(1 - pill) * -40}px) scale(${0.8 + pill * 0.2})`, opacity: pill}}>
        <Pill bg={C.ambar} color={C.verde} size={42}>MELHORES MOMENTOS</Pill>
      </div>
      <div style={{fontFamily: TITLE, fontWeight: 800, fontSize: 250, color: C.creme, lineHeight: 1, marginTop: 30,
        letterSpacing: -6, transform: `translateY(${(1 - t1) * 80}px)`, opacity: t1, textShadow: '0 8px 40px rgba(14,31,26,0.55)'}}>
        Petar
      </div>
      <div style={{height: 10, width: roadW, marginTop: 26, borderRadius: 99,
        background: `repeating-linear-gradient(90deg, ${C.ambar} 0 46px, transparent 46px 70px)`}} />
      <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 40, color: C.creme, marginTop: 30, opacity: sub,
        transform: `translateY(${(1 - sub) * 20}px)`, textShadow: '0 4px 20px rgba(14,31,26,0.7)'}}>
        Alto Ribeira · São Paulo
      </div>
    </AbsoluteFill>
  );
};

const Chapter: React.FC<{label: string; dur: number; num: number}> = ({label, dur, num}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inn = spring({frame: f, fps, config: {damping: 15, mass: 0.6}});
  const out = interpolate(f, [dur - 8, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const v = inn * out;
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 300}}>
      <div style={{opacity: v, transform: `translateY(${(1 - inn) * -30}px)`}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 22, background: 'rgba(23,48,42,0.78)', borderRadius: 999,
          padding: '20px 44px 20px 22px', boxShadow: '0 10px 40px rgba(14,31,26,0.35)'}}>
          <div style={{width: 64, height: 64, borderRadius: 999, background: C.ambar, color: C.verde, display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontFamily: TITLE, fontWeight: 800, fontSize: 34}}>{num}</div>
          <div style={{fontFamily: TITLE, fontWeight: 800, fontSize: 70, color: C.creme, letterSpacing: -1}}>{label}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Progress: React.FC = () => {
  const f = useCurrentFrame();
  const p = Math.min(1, f / VIDEO_END);
  const op = interpolate(f, [0, 10, VIDEO_END - 5, VIDEO_END], [0, 1, 1, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 250, opacity: op}}>
      <div style={{width: 760, height: 8, borderRadius: 99, background: 'rgba(244,235,221,0.3)', position: 'relative'}}>
        <div style={{width: `${p * 100}%`, height: '100%', borderRadius: 99, background: C.ambar}} />
        <div style={{position: 'absolute', left: `calc(${p * 100}% - 13px)`, top: -9, width: 26, height: 26, borderRadius: 99,
          background: C.ambar, border: `5px solid ${C.verde}`}} />
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const wipe = interpolate(f, [0, 12], [0, 100], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const a = spring({frame: f - 8, fps, config: {damping: 14}});
  const b = spring({frame: f - 16, fps, config: {damping: 14}});
  const c = spring({frame: f - 26, fps, config: {damping: 16}});
  const road = interpolate(f, [14, 44], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: C.verde, clipPath: `circle(${wipe * 1.2}% at 50% 50%)`}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{opacity: a, transform: `scale(${0.85 + 0.15 * a})`}}>
          <Pill bg={C.ambar} color={C.verde} size={38}>MELHORES MOMENTOS</Pill>
        </div>
        <div style={{fontFamily: TITLE, fontWeight: 800, fontSize: 210, color: C.creme, letterSpacing: -5, lineHeight: 1.05,
          marginTop: 24, opacity: b, transform: `translateY(${(1 - b) * 50}px)`}}>Petar</div>
        <svg width="560" height="120" viewBox="0 0 560 120" style={{marginTop: 10}}>
          <path d="M10 90 C 140 10, 260 120, 380 50 S 540 30, 550 30" fill="none" stroke={C.ambar} strokeWidth="9"
            strokeLinecap="round" strokeDasharray="700" strokeDashoffset={700 * (1 - road)} />
          <circle cx="550" cy="30" r={14 * road} fill={C.laranja} />
        </svg>
        <div style={{fontFamily: TITLE, fontWeight: 700, fontSize: 64, color: C.ambar, marginTop: 40, opacity: c,
          transform: `translateY(${(1 - c) * 20}px)`}}>Estrada em Dois</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Petar: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.noite}}>
    {CLIPS.map(([src, d], i) => (
      <Sequence key={src} from={starts[i]} durationInFrames={Math.round(d * FPS)}>
        <Clip src={src} dur={Math.round(d * FPS)} idx={i} />
      </Sequence>
    ))}
    <Sequence durationInFrames={VIDEO_END}><Scrims /></Sequence>
    <Sequence durationInFrames={95}><Intro /></Sequence>
    {CHAPTERS.map(([label, a, b], i) => {
      const from = starts[a] + 4;
      const to = b < CLIPS.length ? starts[b] : VIDEO_END - 2;
      return (
        <Sequence key={label} from={from} durationInFrames={to - from}>
          <Chapter label={label} dur={to - from} num={i + 1} />
        </Sequence>
      );
    })}
    <Progress />
    <Sequence from={VIDEO_END - 6} durationInFrames={END_CARD + 6}><EndCard /></Sequence>
  </AbsoluteFill>
);
