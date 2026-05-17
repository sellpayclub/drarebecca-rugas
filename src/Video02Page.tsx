import React, { useEffect } from 'react';

// VSL Player for Video 02 - NEW video embed
const VSLPlayer02 = React.memo(() => (
  <div className="w-full">
    <div dangerouslySetInnerHTML={{ __html: `
      <div id="ifr_6a0a1868dca0bf66780dbe8f_wrapper" style="margin: 0 auto; width: 100%; ">
        <div style="position: relative; padding: 56.25% 0 0 0;" id="ifr_6a0a1868dca0bf66780dbe8f_aspect">
          <iframe frameborder="0" allowfullscreen src="about:blank" id="ifr_6a0a1868dca0bf66780dbe8f" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" referrerpolicy="origin" onload="this.onload=null, this.src='https://scripts.converteai.net/ceaefeeb-feef-4b52-8911-9ec9de0d5b6b/players/6a0a1868dca0bf66780dbe8f/v4/embed.html' +(location.search||'?') +'&vl=' +encodeURIComponent(location.href)"></iframe>
        </div>
      </div>
    `}} />
  </div>
));

export default function Video02Page() {
  // Load SmartPlayer script
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js";
    s.async = true;
    document.head.appendChild(s);
    return () => {
      document.head.removeChild(s);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-emerald-100 flex flex-col items-center">
      {/* 100% Mobile App Container Constraint */}
      <div className="w-full max-w-[440px] mx-auto bg-slate-50 min-h-[100dvh] flex flex-col relative shadow-2xl shadow-slate-300">
        
        {/* HEADER SITE DE NOTÍCIAS - GLOBO NEWS STYLE */}
        <header className="bg-red-700 py-3 px-6 flex flex-col gap-1 shrink-0 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500 opacity-50"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white text-red-700 px-1.5 py-0.5 rounded-sm font-black text-xs">S+40</div>
              <span className="font-black text-[18px] tracking-tighter text-white uppercase italic">SAÚDE +40</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="text-[10px] font-bold text-red-100 uppercase tracking-widest opacity-80">
              programa de hoje com: <span className="text-white font-black italic">Rebecca Trajano</span>
            </div>
            <div className="text-[9px] font-black text-white bg-red-800 px-2 py-0.5 rounded uppercase tracking-tighter">
              Disponível até {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        </header>

        <main className="flex-1 w-full px-6 py-8 flex flex-col relative overflow-y-auto">
          <div className="flex-1 flex flex-col">
            <div className="mb-6 space-y-3 px-1">
              <h1 className="text-[22px] sm:text-[26px] font-black text-slate-900 leading-snug text-center text-balance">
                Especialista revela <span className="text-red-600">verdadeiro motivo escondido na pele</span>, que está causando <span className="underline decoration-red-500 decoration-[3px] underline-offset-4">envelhecimento precoce</span>, e revela como se livrar das bactérias para <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-lg">parecer até 5 anos mais jovem</span> usando vinagre de maçã!
              </h1>
            </div>

            <div className="relative w-full rounded-3xl overflow-hidden shadow-xl shadow-slate-200 border border-slate-200 bg-black min-h-[200px] flex items-center justify-center">
              <VSLPlayer02 />
            </div>

            {/* REFERÊNCIAS CIENTÍFICAS */}
            <div className="mt-8 space-y-3">
              <h3 className="text-[13px] font-black text-slate-500 uppercase tracking-widest text-center">Referências Científicas</h3>
              <div className="space-y-3">
                <a href="https://pubmed.ncbi.nlm.nih.gov/31329307/" target="_blank" rel="noopener noreferrer" className="block bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[11px] text-slate-700 leading-relaxed font-medium">LUU, Lydia A. et al. Apple cider vinegar soaks (0.5%) as a treatment for atopic dermatitis do not improve skin barrier integrity. <em>Pediatric Dermatology</em>, v. 36, n. 5, p. 634-639, 2019.</p>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 block">📎 pubmed.ncbi.nlm.nih.gov</span>
                </a>
                <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC2883372/" target="_blank" rel="noopener noreferrer" className="block bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[11px] text-slate-700 leading-relaxed font-medium">CHO, Soyun et al. Dietary Aloe Vera Supplementation Improves Facial Wrinkles and Elasticity and It Increases the Type I Procollagen Gene Expression in Human Skin in vivo. <em>Annals of Dermatology</em>, v. 21, n. 1, p. 6-11, 2009.</p>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 block">📎 pmc.ncbi.nlm.nih.gov</span>
                </a>
                <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4321565/" target="_blank" rel="noopener noreferrer" className="block bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[11px] text-slate-700 leading-relaxed font-medium">QIRAOUANI BOUCETTA, Kenza et al. The effect of dietary and/or cosmetic argan oil on postmenopausal skin elasticity. <em>Clinical Interventions in Aging</em>, v. 10, p. 339-349, 2015.</p>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 block">📎 pmc.ncbi.nlm.nih.gov</span>
                </a>
                <a href="https://pubmed.ncbi.nlm.nih.gov/20523108/" target="_blank" rel="noopener noreferrer" className="block bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[11px] text-slate-700 leading-relaxed font-medium">NEVIN, K. G.; RAJAMOHAN, T. Effect of topical application of virgin coconut oil on skin components and antioxidant status in dermal wound healing in young rats. <em>Skin Pharmacology and Physiology</em>, v. 23, n. 6, p. 290-297, 2010.</p>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 block">📎 pubmed.ncbi.nlm.nih.gov</span>
                </a>
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="px-6 py-8 bg-slate-100 border-t border-slate-200 text-center space-y-6">
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            Este vídeo não se destina a diagnosticar, tratar, curar ou prevenir qualquer doença. Os resultados podem variar de pessoa para pessoa. Este site não é afiliado ao Facebook, Google, YouTube ou a qualquer de suas entidades. Depois que você sair do Facebook, Google ou YouTube, a responsabilidade não é deles e sim do nosso site.
          </p>
          <div className="space-y-1">
            <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
              Gp Negocios Digitais LTDA - CNPJ: 40.170.238/0001-80
            </p>
            <p className="text-[10px] text-slate-500">
              Rua Jose Maria Barbosa 31, Jardim Portal da Colina, Sorocaba SP, 18047-380
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
