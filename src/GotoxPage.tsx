import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const C = {
  bg: '#0F0F12', bgCard: '#1A1A22', accent: '#C8A04A', accentLight: '#F5E6B8',
  green: '#22C55E', greenDark: '#16A34A', red: '#EF4444',
  textWhite: '#FAFAFA', textGray: '#A8A8B3', textDim: '#6B6B78', border: '#2A2A35',
};

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: C.border, background: C.bgCard }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left">
        <span className="text-[16px] font-bold pr-4" style={{ color: C.textWhite }}>{q}</span>
        <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: C.textDim }} />
      </button>
      {open && <div className="px-5 pb-5"><p className="text-[15px] leading-[1.7]" style={{ color: C.textGray }}>{a}</p></div>}
    </div>
  );
}

interface Kit {
  name: string; image: string; priceOld: string; priceInstallment: string;
  priceTotal: string; perUnit: string; badge?: string; link: string; highlight?: boolean;
}

const KITS: Kit[] = [
  {
    name: '1 Frasco', image: 'https://xyzgvsuttwrvbyyxdppq.supabase.co/storage/v1/object/public/imagens/gotox%20branco.png',
    priceOld: 'R$ 500,00', priceInstallment: '12x R$ 19,90', priceTotal: 'R$ 197,00 à vista',
    perUnit: '', link: 'https://seguro.vitago-suplements.shop/r/R7XI7HHFAU',
  },
  {
    name: '3 Frascos', image: 'https://xyzgvsuttwrvbyyxdppq.supabase.co/storage/v1/object/public/imagens/3%20pote.png',
    priceOld: 'R$ 990,00', priceInstallment: '12x R$ 29,90', priceTotal: 'R$ 297,00 à vista',
    perUnit: 'apenas R$ 99,00 cada', badge: '🎁 2 frascos grátis hoje',
    link: 'https://seguro.vitago-suplements.shop/r/72TDYYBWUV', highlight: true,
  },
  {
    name: '6 Frascos', image: 'https://xyzgvsuttwrvbyyxdppq.supabase.co/storage/v1/object/public/imagens/6%20poyr.png',
    priceOld: 'R$ 1.599,90', priceInstallment: '12x R$ 39,90', priceTotal: 'R$ 397,00 à vista',
    perUnit: 'apenas R$ 66,17 cada', badge: '🎁 2 frascos grátis hoje',
    link: 'https://seguro.vitago-suplements.shop/r/3XEWHWT294',
  },
];

function KitCard({ kit }: { kit: Kit }) {
  return (
    <div className={`rounded-3xl p-6 text-center transition-all ${kit.highlight ? 'ring-2 scale-[1.02]' : ''}`}
      style={{ background: C.bgCard, border: `2px solid ${kit.highlight ? C.accent : C.border}`, ringColor: C.accent }}>
      {kit.highlight && (
        <div className="text-[12px] font-black uppercase tracking-widest mb-3 py-1.5 px-4 rounded-full inline-block"
          style={{ background: C.accent, color: C.bg }}>⭐ MAIS VENDIDO</div>
      )}
      <img src={kit.image} alt={kit.name} className="h-40 mx-auto object-contain mb-4" />
      <p className="text-[20px] font-black mb-2" style={{ color: C.textWhite }}>{kit.name}</p>
      <p className="text-[14px] line-through mb-1" style={{ color: C.textDim }}>{kit.priceOld}</p>
      <p className="text-[28px] font-black mb-1" style={{ color: C.accent }}>{kit.priceInstallment}</p>
      <p className="text-[15px] font-medium mb-1" style={{ color: C.textGray }}>ou {kit.priceTotal}</p>
      {kit.perUnit && <p className="text-[13px] font-bold mb-2" style={{ color: C.green }}>({kit.perUnit})</p>}
      {kit.badge && (
        <div className="text-[13px] font-bold py-2 px-4 rounded-full inline-block mb-4"
          style={{ background: '#052E16', color: C.green }}>{kit.badge}</div>
      )}
      <a href={kit.link} target="_blank" rel="noopener noreferrer"
        className="block w-full py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wider transition-all active:scale-[0.97] shadow-lg mt-3"
        style={{ background: `linear-gradient(135deg, ${C.green}, ${C.greenDark})`, boxShadow: `0 6px 25px ${C.green}33` }}>
        COMPRAR AGORA
      </a>
    </div>
  );
}

export default function GotoxPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const s = document.createElement('script');
    s.src = 'https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js';
    s.async = true; document.head.appendChild(s);
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet'; document.head.appendChild(link);
    return () => { document.head.removeChild(s); document.head.removeChild(link); };
  }, []);

  const ff = { fontFamily: "'Inter', -apple-system, sans-serif" };

  return (
    <div className="min-h-screen flex flex-col items-center" style={{ background: C.bg, ...ff }}>
      <div className="w-full max-w-[520px] mx-auto flex flex-col" style={{ background: C.bg }}>

        {/* ═══ HERO ═══ */}
        <div className="px-5 pt-8 pb-6 text-center">
          <div className="inline-block text-[11px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-5"
            style={{ background: C.accent, color: C.bg }}>FÓRMULA EXCLUSIVA</div>
          <h1 className="text-[26px] sm:text-[30px] font-black leading-[1.2] mb-4" style={{ color: C.textWhite }}>
            GOTOX — Fórmula Concentrada de <span style={{ color: C.accent }}>Ácido Clorogênico</span>
          </h1>
          <p className="text-[16px] leading-[1.6]" style={{ color: C.textGray }}>
            O único tratamento no Brasil com extrato japonês de alta concentração para <strong style={{ color: C.textWhite }}>eliminação das bactérias envelhecedoras</strong>.
          </p>
        </div>

        {/* ═══ KITS ═══ */}
        <div className="px-5 pb-8 space-y-5">
          {KITS.map((kit, i) => <KitCard key={i} kit={kit} />)}
        </div>

        {/* ═══ FORMULA ═══ */}
        <div className="px-5 py-10" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="text-center mb-8">
            <p className="text-[13px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: C.accent }}>Fórmula Completa</p>
            <h2 className="text-[24px] font-black" style={{ color: C.textWhite }}>O que tem dentro de cada pote:</h2>
          </div>

          <div className="space-y-4">
            {[
              ['🔬', 'Ácido Clorogênico Concentrado', 'Extrato importado do Japão, 40x mais absorvível que o vinagre de maçã comum. Age diretamente nas bactérias envelhecedoras do intestino.'],
              ['🌿', 'Pectina Prebiótica', 'Alimenta as bactérias boas do intestino acelerando a eliminação das envelhecedoras e restaurando o equilíbrio da microbiota.'],
              ['💊', 'Colágeno Verisol Hidrolisado', 'Partículas menores que qualquer colágeno de farmácia. Absorção direta, estimula produção natural de colágeno na pele em até 4 semanas.'],
              ['💧', 'Ácido Hialurônico de Baixo Peso Molecular', 'Penetra profundamente na pele, preenche espaços entre células, reduz linhas finas e reforça elasticidade do rosto, pescoço e corpo.'],
            ].map(([icon, title, desc], i) => (
              <div key={i} className="p-5 rounded-2xl" style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{icon}</span>
                  <p className="text-[17px] font-bold" style={{ color: C.textWhite }}>{title}</p>
                </div>
                <p className="text-[15px] leading-[1.6] ml-10" style={{ color: C.textGray }}>{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            <img src="https://xyzgvsuttwrvbyyxdppq.supabase.co/storage/v1/object/public/imagens/gotox%20modelo%20medica1.png"
              alt="Gotox Fórmula" className="w-full object-cover" />
          </div>
        </div>

        {/* ═══ MODO DE USO ═══ */}
        <div className="px-5 py-10" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="text-center mb-6">
            <p className="text-[13px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: C.accent }}>Modo de Uso</p>
            <h2 className="text-[24px] font-black" style={{ color: C.textWhite }}>Simples e Rápido</h2>
          </div>
          <div className="rounded-2xl overflow-hidden mb-5" style={{ border: `1px solid ${C.border}` }}>
            <img src="https://xyzgvsuttwrvbyyxdppq.supabase.co/storage/v1/object/public/imagens/modmo%20uso%20sublingual%20gotox.png"
              alt="Modo de uso sublingual" className="w-full object-cover" />
          </div>
          <p className="text-[17px] leading-[1.7] text-center" style={{ color: C.textGray }}>
            Tome <strong style={{ color: C.textWhite }}>10 gotinhas abaixo da língua</strong> todas as manhãs, em jejum ou após o café. Uso contínuo por <strong style={{ color: C.accent }}>90 dias</strong> para resultado completo.
          </p>
        </div>

        {/* ═══ AVISOS ═══ */}
        <div className="px-5 py-10" style={{ borderTop: `1px solid ${C.border}` }}>
          <h2 className="text-[20px] font-black text-center mb-6" style={{ color: C.textWhite }}>Avisos Importantes</h2>
          <div className="space-y-3">
            {[
              '100% Natural — sem químicos, sem parabenos, sem conservantes artificiais',
              'Sem contraindicação — pode ser usado por mulheres de qualquer idade, inclusive com diabetes, pressão alta, distúrbios hormonais e na menopausa',
              'Aprovado pela ANVISA — fórmula registrada, testada e certificada para comercialização no Brasil',
              'Não interfere com medicamentos — ingredientes naturais sem interação medicamentosa conhecida',
              'Vegano e livre de glúten — sem ingredientes de origem animal',
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#052E16' }}>
                <span className="text-[16px] shrink-0 mt-0.5" style={{ color: C.green }}>✅</span>
                <span className="text-[15px] font-medium leading-[1.5]" style={{ color: C.textGray }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ GARANTIA ═══ */}
        <div className="px-5 py-10" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="rounded-3xl p-7 text-center" style={{ background: C.bgCard, border: `2px solid ${C.accent}44` }}>
            <div className="text-5xl mb-4">🛡️</div>
            <h2 className="text-[22px] font-black mb-4" style={{ color: C.textWhite }}>Garantia Incondicional de 60 Dias</h2>
            <p className="text-[16px] leading-[1.7] mb-4" style={{ color: C.textGray }}>
              Você usa o Gotox por 60 dias completos. Se não perceber diferença visível na firmeza, rugas e aparência da pele — manda um email e devolvemos <strong style={{ color: C.textWhite }}>100% do valor pago.</strong>
            </p>
            <div className="flex flex-col items-center gap-2 mb-4">
              {['Sem perguntas', 'Sem burocracia', 'Sem devolver os potes'].map((t, i) => (
                <span key={i} className="px-5 py-2 rounded-full text-[13px] font-bold" style={{ background: `${C.accent}15`, color: C.accent }}>{t}</span>
              ))}
            </div>
            <p className="text-[15px] italic font-medium" style={{ color: C.textDim }}>
              Porque eu sei que funciona. E por isso não tenho medo de garantir.
            </p>
          </div>
        </div>

        {/* ═══ ENTREGA ═══ */}
        <div className="px-5 py-10" style={{ borderTop: `1px solid ${C.border}` }}>
          <h2 className="text-[20px] font-black text-center mb-6" style={{ color: C.textWhite }}>Entrega</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-2xl" style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
              <p className="text-[17px] font-bold mb-1" style={{ color: C.textWhite }}>📦 Entrega Discreta pelos Correios</p>
              <p className="text-[15px]" style={{ color: C.textGray }}>Enviado em embalagem sem identificação do produto. Ninguém sabe o que você comprou.</p>
            </div>
            <div className="p-5 rounded-2xl" style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
              <p className="text-[17px] font-bold mb-1" style={{ color: C.textWhite }}>🚚 Prazo: 5 a 10 dias úteis</p>
              <p className="text-[15px]" style={{ color: C.textGray }}>Para todo o Brasil.</p>
            </div>
            <div className="p-5 rounded-2xl" style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
              <p className="text-[17px] font-bold mb-1" style={{ color: C.textWhite }}>📱 Rastreio enviado por email e WhatsApp</p>
              <p className="text-[15px]" style={{ color: C.textGray }}>Código de rastreamento enviado após postagem.</p>
            </div>
          </div>
        </div>

        {/* ═══ URGÊNCIA + KITS FINAL ═══ */}
        <div className="px-5 py-10" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="rounded-2xl p-6 text-center mb-8" style={{ background: '#1C1007', border: `2px solid ${C.accent}44` }}>
            <p className="text-2xl mb-3">⚠️</p>
            <h3 className="text-[20px] font-black mb-3" style={{ color: C.accent }}>Atenção: estoque limitado</h3>
            <p className="text-[15px] leading-[1.7]" style={{ color: C.textGray }}>
              Produzimos em lotes pequenos para garantir a qualidade do extrato japonês. O próximo lote leva entre <strong style={{ color: C.textWhite }}>3 e 6 meses</strong> para chegar ao Brasil.
            </p>
            <p className="text-[15px] font-bold mt-3" style={{ color: C.textWhite }}>
              Se o botão abaixo estiver ativo, ainda temos unidades disponíveis. Quando acabar, o sistema fecha automaticamente.
            </p>
          </div>

          <div className="space-y-5">
            {KITS.map((kit, i) => <KitCard key={i} kit={kit} />)}
          </div>
        </div>

        {/* ═══ FOOTER ═══ */}
        <footer className="px-5 py-8 text-center space-y-4" style={{ borderTop: `1px solid ${C.border}` }}>
          <p className="text-[18px] font-black" style={{ color: C.accent }}>GOTOX®</p>
          <p className="text-[12px] leading-[1.7]" style={{ color: C.textDim }}>
            Este produto não se destina a diagnosticar, tratar, curar ou prevenir qualquer doença. Os resultados podem variar. Consulte seu médico antes de usar qualquer suplemento.
          </p>
          <p className="text-[11px]" style={{ color: C.textDim }}>© 2026 Gotox. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
}
