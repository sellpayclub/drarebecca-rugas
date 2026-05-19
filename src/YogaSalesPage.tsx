import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import YogaSalesBottom from './YogaSalesBottom';

const C = {
  bg: '#FBF7F4', bgCard: '#FFFFFF', rose: '#C4787E', roseLight: '#F5E1E4',
  roseMedium: '#E8B4BC', roseDark: '#9B4D56', roseDeep: '#7A3A42',
  textDark: '#2D1F21', textMedium: '#5A3D40', textLight: '#8A6B6E', border: '#F0E4E6',
};
const ff = { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" };
const CHECKOUT = 'https://seguro.vitago-suplements.shop/r/FI42VC9BQ8';

const leftAnnotations = [
  { label: 'Músculo zigomático enfraquecido', desc: 'bochecha caindo' },
  { label: 'Músculo orbicular sem sustentação', desc: 'pálpebra pesada' },
  { label: 'Músculo platisma flácido', desc: 'pescoço e mandíbula cedendo' },
  { label: 'Perda de sustentação muscular', desc: 'bigode chinês aprofundando' },
  { label: 'Músculo frontal enfraquecido', desc: 'testa marcada' },
];

const rightAnnotations = [
  { label: 'Músculo reativado', desc: 'maçã do rosto elevada' },
  { label: 'Contorno facial redefinido', desc: 'mandíbula firme' },
  { label: 'Pálpebra sustentada', desc: 'olhar mais aberto e jovem' },
  { label: 'Pescoço firme', desc: 'ângulo jawline restaurado' },
  { label: 'Linhas de expressão', desc: 'suavizadas naturalmente' },
];

interface Props { agedImage: string; treatedImage: string; }

export default function YogaSalesPage({ agedImage, treatedImage }: Props) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const scrollToCheckout = () => {
    const el = document.getElementById('yoga-pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center" style={{ background: C.bg, ...ff }}>
      <div className="w-full max-w-[520px] mx-auto flex flex-col relative" style={{ background: C.bg }}>

        {/* ═══ RESULT HEADER ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 pt-8 pb-4">
          <div className="text-center mb-8">
            <span className="inline-block text-[14px] font-bold uppercase tracking-wider px-5 py-2 rounded-full"
              style={{ background: C.roseLight, color: C.roseDark }}>Resultado da Sua Análise</span>
          </div>

          {/* ── PHOTO 1: DAQUI 5 ANOS ── */}
          <div className="mb-10">
            <h3 className="text-[22px] font-extrabold text-center mb-4" style={{ color: '#B91C1C' }}>
              ⚠️ SEU ROSTO DAQUI 5 ANOS
            </h3>
            <div className="rounded-2xl overflow-hidden border-3 shadow-lg mb-5" style={{ borderColor: '#FCA5A5', borderWidth: 3 }}>
              <img src={agedImage} alt="Seu rosto daqui 5 anos" className="w-full aspect-[3/4] object-cover" />
            </div>
            {/* Annotations - BIG and CLEAR */}
            <div className="space-y-3">
              {leftAnnotations.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-black text-white shrink-0 mt-0.5" style={{ background: '#DC2626', minWidth: 32, minHeight: 32 }}>{i+1}</span>
                  <div>
                    <p className="text-[16px] font-bold leading-snug" style={{ color: '#991B1B' }}>{a.label}</p>
                    <p className="text-[15px] leading-snug mt-0.5" style={{ color: '#7F1D1D' }}>→ {a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── PHOTO 2: FAZENDO YOGA FACIAL ── */}
          <div className="mb-10">
            <h3 className="text-[22px] font-extrabold text-center mb-4" style={{ color: '#059669' }}>
              ✨ Seu Rosto fazendo Yoga Facial
            </h3>
            <div className="rounded-2xl overflow-hidden border-3 shadow-lg mb-5" style={{ borderColor: '#6EE7B7', borderWidth: 3 }}>
              <img src={treatedImage} alt="Seu rosto fazendo Yoga Facial" className="w-full aspect-[3/4] object-cover" />
            </div>
            {/* Annotations - BIG and CLEAR */}
            <div className="space-y-3">
              {rightAnnotations.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-black text-white shrink-0 mt-0.5" style={{ background: '#059669', minWidth: 32, minHeight: 32 }}>{i+1}</span>
                  <div>
                    <p className="text-[16px] font-bold leading-snug" style={{ color: '#065F46' }}>{a.label}</p>
                    <p className="text-[15px] leading-snug mt-0.5" style={{ color: '#047857' }}>→ {a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation Text */}
          <div className="rounded-2xl p-6 mb-8" style={{ background: C.bgCard, border: `2px solid ${C.roseMedium}` }}>
            <p className="text-[17px] leading-[1.7]" style={{ color: C.textDark }}>
              Nossa análise identificou que o seu envelhecimento é <strong style={{ color: C.roseDark }}>predominantemente muscular</strong> — não da pele.
            </p>
            <p className="text-[17px] leading-[1.7] mt-3" style={{ color: C.textDark }}>
              Isso significa que cremes e séruns <strong>nunca vão resolver</strong>.
            </p>
            <p className="text-[17px] leading-[1.7] mt-3" style={{ color: C.textDark }}>
              Mas também significa que <strong style={{ color: '#059669' }}>tem solução</strong>: músculo fraco pode ser reativado. E quando ele volta a sustentar, <strong>a pele volta junto.</strong>
            </p>
          </div>

          {/* YOGA FACIAL INTRO */}
          <div className="text-center space-y-4 mb-8">
            <span className="text-4xl block">💆‍♀️</span>
            <h2 className="text-[30px] font-black" style={{ color: C.textDark }}>YOGA FACIAL!</h2>
            <p className="text-[19px] font-bold" style={{ color: '#B91C1C' }}>❌ Suas rugas não são falta de creme…</p>
            <p className="text-[19px] font-bold" style={{ color: C.roseDark }}>👉 São músculos faciais fracos!</p>
          </div>

          {/* Logo + description */}
          <div className="text-center space-y-5 mb-8">
            <div className="rounded-2xl overflow-hidden shadow-lg mb-2" style={{ border: `2px solid ${C.border}` }}>
              <div dangerouslySetInnerHTML={{ __html: `
                <div id="ifr_6a0c55feef36953d22529ee1_wrapper" style="margin: 0 auto; width: 100%; max-width: 400px;">
                  <div style="position: relative; padding: 177.77777777777777% 0 0 0;" id="ifr_6a0c55feef36953d22529ee1_aspect">
                    <iframe frameborder="0" allowfullscreen src="about:blank" id="ifr_6a0c55feef36953d22529ee1" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" referrerpolicy="origin" onload="this.onload=null, this.src='https://scripts.converteai.net/ceaefeeb-feef-4b52-8911-9ec9de0d5b6b/players/6a0c55feef36953d22529ee1/v4/embed.html' +(location.search||'?') +'&vl=' +encodeURIComponent(location.href)"></iframe>
                  </div>
                </div>
              `}} />
            </div>
            <p className="text-[17px] leading-[1.7]" style={{ color: C.textMedium }}>
              Participe do melhor método de Yoga Facial do Brasil e descubra o método simples de exercícios faciais que <strong style={{ color: C.textDark }}>fortalece, levanta e redefine</strong> seu rosto naturalmente.
            </p>
            <button onClick={scrollToCheckout}
              className="w-full py-5 rounded-2xl text-white font-extrabold text-[17px] uppercase tracking-wider shadow-lg active:scale-[0.97] transition-transform"
              style={{ background: `linear-gradient(135deg, ${C.rose}, ${C.roseDark})`, boxShadow: `0 8px 30px ${C.rose}44` }}>
              QUERO MEU ROSTO MAIS FIRME
            </button>
          </div>
        </motion.div>

        {/* Problem Section */}
        <div className="px-5 py-8" style={{ background: C.bgCard }}>
          <h3 className="text-[22px] font-extrabold text-center mb-6" style={{ color: C.textDark }}>Você já comprou:</h3>
          <div className="space-y-3 mb-8">
            {['Cremes anti-idade','Séruns caros','Tratamentos estéticos','Máscaras milagrosas','Aparelhos faciais'].map((item,i) => (
              <div key={i} className="flex items-center gap-4 py-4 px-5 rounded-xl" style={{ background: C.roseLight }}>
                <span className="text-[18px]">❌</span>
                <span className="text-[17px] font-bold" style={{ color: C.textDark }}>{item}</span>
              </div>
            ))}
          </div>
          <div className="text-center space-y-5 mb-8">
            <p className="text-[18px] font-bold leading-relaxed" style={{ color: C.textDark }}>
              E mesmo assim...<br/>As rugas continuam ali. A flacidez aumenta.<br/>O rosto parece mais "caído" a cada ano.
            </p>
            <p className="text-[22px] font-extrabold" style={{ color: C.roseDark }}>Sabe por quê?</p>
            <p className="text-[17px] leading-[1.7]" style={{ color: C.textMedium }}>
              Porque te ensinaram a tratar a pele, quando o verdadeiro problema está <strong style={{ color: C.textDark }}>embaixo</strong> dela.
            </p>
          </div>
          <div className="rounded-2xl p-6 space-y-4" style={{ background: C.bg, border: `2px solid ${C.border}` }}>
            <p className="text-[18px] font-bold" style={{ color: C.roseDark }}>👉 O problema NÃO é superficial.</p>
            <p className="text-[18px] font-bold" style={{ color: C.roseDark }}>👉 O problema está nos MÚSCULOS FACIAIS enfraquecidos.</p>
            <p className="text-[16px] leading-[1.7] mt-2" style={{ color: C.textMedium }}>
              Assim como o corpo fica flácido quando você não treina, o rosto também perde sustentação quando os músculos não são estimulados.
            </p>
            <p className="text-[17px] font-bold mt-2" style={{ color: C.textDark }}>
              Nenhum creme consegue fortalecer músculo.<br/>É por isso que você não vê resultado real.
            </p>
          </div>
        </div>

        <YogaSalesBottom checkoutUrl={CHECKOUT} colors={C} />
      </div>
    </div>
  );
}
