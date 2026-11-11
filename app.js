const app = document.getElementById("app");
let answers = {}, idx = -1;

function show(html){ app.innerHTML = html; window.scrollTo({top:0}); const h = app.querySelector("h1,h2"); if(h){h.setAttribute("tabindex","-1"); h.focus({preventScroll:true});} }

function intro(){
  idx = -1; answers = {};
  show(`
    <p class="muted" style="margin:0">Orientação financeira</p>
    <h1>Sem saber o que fazer com seu dinheiro?</h1>
    <p>Responda 5 perguntas rápidas. No final, você vê em qual etapa está e qual é o seu próximo passo.</p>
    <button class="btn primary" id="go">Começar</button>
    <p class="foot">Conteúdo educativo. Não é recomendação de investimento. Nenhuma resposta é salva.</p>`);
  document.getElementById("go").onclick = () => question(0);
}

function question(i){
  idx = i; const q = QUESTIONS[i];
  show(`
    <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${QUESTIONS.length}" aria-valuenow="${i}"><i style="width:${(i/QUESTIONS.length)*100}%"></i></div>
    <p class="step">Pergunta ${i+1} de ${QUESTIONS.length}</p>
    <h2>${q.t}</h2>
    ${q.o.map(([v,l]) => `<button class="btn" data-v="${v}">${l}</button>`).join("")}
    ${i>0 ? `<button class="link" id="back">Voltar</button>` : ""}`);
  app.querySelectorAll("[data-v]").forEach(b => b.onclick = () => { answers[q.id] = b.dataset.v; i+1 < QUESTIONS.length ? question(i+1) : result(); });
  const back = document.getElementById("back"); if(back) back.onclick = () => question(i-1);
}

function stageOf(a){
  if(a.budget === "falta") return 0;
  if(a.debt === "sim" || a.debt === "naosei") return 1;
  if(a.reserve !== "3") return 2;
  return 3;
}

function result(){
  store.set("fl_answers", answers);
  const s = stageOf(answers), c = CONTENT[s];
  const steps = c.steps || GOAL_STEPS[answers.goal];
  const ladder = STAGES.map((st,i) => `<li class="${i<s?"done":i===s?"now":""}"><b>${i<s?"✓":i+1}</b><span>${st.name}<small>${st.sub}</small></span></li>`).join("");
  const hint = answers.exp === "nunca" ? `<p class="muted">Você disse que nunca investiu. Tudo bem: comece com valores pequenos e aprenda no caminho.</p>` : "";
  const debtNote = answers.debt === "naosei" && s === 1 ? `<div class="alert">Você não tem certeza se tem dívida cara. Vale conferir no app do banco as taxas do seu cartão e do limite do cheque especial.</div>` : "";
  const debtFact = s === 1 ? `<div class="alert"><b>Veja o tamanho do problema:</b> com juros de 12% ao mês, uma dívida de ${fmt(1000)} vira cerca de ${fmt(1000*Math.pow(1.12,12))} em um ano se ninguém pagar nada.</div>` : "";
  show(`
    <p class="muted" style="margin:0">Seu resultado</p>
    <h1>Seu próximo passo: ${STAGES[s].name.toLowerCase()}</h1>
    <p>${c.lead}</p>
    ${hint}
    <ol class="ladder" aria-label="Suas etapas">${ladder}</ol>
    ${debtNote}${debtFact}
    <div class="panel"><h3>O que fazer agora</h3><ul class="todo">${steps.map(x=>`<li>${x}</li>`).join("")}</ul></div>
    ${tools(s)}${s >= 2 ? simulator() : ""}
    <div class="panel"><h3>Conceitos rápidos</h3>${LESSONS.map(([t,d])=>`<details><summary>${t}</summary><p>${d}</p></details>`).join("")}</div>
    <button class="btn" id="again">Refazer as perguntas</button>
    <p class="foot">Conteúdo educativo, sem recomendação de produtos específicos. Cada situação é única: em caso de dúvida, converse com um profissional.</p>`);
  document.getElementById("again").onclick = () => { store.set("fl_answers", null); intro(); };
  wireTools(s); if(s >= 2) wireSim();
}

function simulator(){
  return `<div class="panel"><h3>O que o tempo faz pelo seu dinheiro</h3>
    <p class="muted">Simule guardar um valor todo mês. A taxa é só um exemplo e pode ser mudada.</p>
    <label for="m">Por mês <span id="mv"></span></label><input id="m" type="range" min="50" max="2000" step="50" value="200">
    <label for="y">Tempo <span id="yv"></span></label><input id="y" type="range" min="1" max="20" step="1" value="5">
    <label for="r">Rendimento ao ano (exemplo) <span id="rv"></span></label><input id="r" type="range" min="2" max="15" step="1" value="8">
    <div class="bars"><div class="bar a" id="ba"></div><div class="bar b" id="bb"></div></div>
    <p id="sum" style="margin:0"></p></div>`;
}

function wireSim(){
  const $ = id => document.getElementById(id);
  const calc = () => {
    const m = +$("m").value, y = +$("y").value, r = +$("r").value/100;
    const i = Math.pow(1+r,1/12)-1, n = y*12;
    const total = m*n, fv = m*((Math.pow(1+i,n)-1)/i);
    $("mv").textContent = fmt(m); $("yv").textContent = y + (y===1?" ano":" anos"); $("rv").textContent = (r*100).toFixed(0) + "%";
    $("ba").style.width = (total/fv*100) + "%"; $("ba").textContent = "Você guardou " + fmt(total);
    $("bb").style.width = "100%"; $("bb").textContent = "Total: " + fmt(fv);
    $("sum").textContent = "Os juros adicionaram cerca de " + fmt(fv-total) + " ao que você guardou.";
  };
  ["m","y","r"].forEach(id => $(id).addEventListener("input", calc)); calc();
}

const num = (id) => Math.max(0, +document.getElementById(id).value || 0);
const bind = (ids, fn) => { ids.forEach(id => document.getElementById(id).addEventListener("input", fn)); fn(); };

function tools(s){
  if(s === 0) return `<div class="panel"><h3>Divida sua renda</h3>
    <p class="muted">Um ponto de partida: necessidades, desejos e futuro. Ajuste ao seu caso.</p>
    <label for="inc">Renda mensal líquida</label><input id="inc" type="number" inputmode="decimal" min="0" step="50" value="3000">
    <label for="np">Necessidades <span id="npv"></span></label><input id="np" type="range" min="30" max="80" value="50">
    <label for="wp">Desejos <span id="wpv"></span></label><input id="wp" type="range" min="0" max="50" value="30">
    <div class="out" id="bout"></div></div>`;
  if(s === 1) return `<div class="panel"><h3>Em quanto tempo você quita?</h3>
    <p class="muted">Informe o saldo, os juros e quanto consegue pagar por mês.</p>
    <label for="bal">Saldo da dívida</label><input id="bal" type="number" inputmode="decimal" min="0" step="100" value="3000">
    <label for="rt">Juros ao mês <span id="rtv"></span></label><input id="rt" type="range" min="1" max="20" value="12">
    <label for="pay">Pagamento mensal</label><input id="pay" type="number" inputmode="decimal" min="0" step="50" value="400">
    <div class="out" id="dout"></div></div>`;
  if(s === 2) return `<div class="panel"><h3>Quanto falta para sua reserva?</h3>
    <p class="muted">Use só seus gastos essenciais: moradia, comida, transporte, saúde e contas básicas.</p>
    <label for="ex">Gastos essenciais por mês</label><input id="ex" type="number" inputmode="decimal" min="0" step="50" value="2000">
    <label for="mo">Meta em meses de gastos <span id="mov"></span></label><input id="mo" type="range" min="3" max="12" value="3">
    <label for="sv">Já guardado</label><input id="sv" type="number" inputmode="decimal" min="0" step="50" value="0">
    <label for="ms">Quanto guarda por mês</label><input id="ms" type="number" inputmode="decimal" min="0" step="50" value="200">
    <div class="out" id="rout"></div></div>`;
  return "";
}

function wireTools(s){
  const $ = id => document.getElementById(id), put = (id, h, bad) => { $(id).innerHTML = h; $(id).classList.toggle("bad", !!bad); };
  if(s === 0) bind(["inc","np","wp"], () => {
    const i = num("inc"), n = +$("np").value, w = +$("wp").value, f = 100 - n - w;
    $("npv").textContent = n + "%"; $("wpv").textContent = w + "%";
    if(f < 0) return put("bout", "Necessidades e desejos passam de 100%. Reduza um deles.", true);
    put("bout", `Necessidades: <b>${fmt(i*n/100)}</b><br>Desejos: <b>${fmt(i*w/100)}</b><br>Futuro (${f}%): <b>${fmt(i*f/100)}</b>` + (n > 60 ? `<br><br>Se as necessidades passam de 60%, o foco é reduzir custos fixos antes de pensar em guardar.` : ""));
  });
  if(s === 1) bind(["bal","rt","pay"], () => {
    const b = num("bal"), r = +$("rt").value/100, p = num("pay");
    $("rtv").textContent = (r*100) + "%";
    if(b === 0) return put("dout", "Sem dívida, sem problema.");
    if(p <= b*r) return put("dout", `Com esse pagamento, a dívida não diminui: só os juros do mês já são ${fmt(b*r)}. Aumente o valor ou renegocie a taxa.`, true);
    const n = Math.ceil(-Math.log(1 - b*r/p) / Math.log(1 + r)), tot = n*p;
    put("dout", `Você quita em cerca de <b>${n} ${n === 1 ? "mês" : "meses"}</b>.<br>Vai pagar ${fmt(tot)} no total, sendo <b>${fmt(tot-b)}</b> só de juros.`);
  });
  if(s === 2) bind(["ex","mo","sv","ms"], () => {
    const e = num("ex"), k = +$("mo").value, v = num("sv"), m = num("ms"), meta = e*k, falta = Math.max(0, meta-v);
    $("mov").textContent = k + " meses";
    if(falta === 0) return put("rout", `Meta de <b>${fmt(meta)}</b> atingida. Você já pode seguir para a próxima etapa.`);
    if(m === 0) return put("rout", `Sua meta é <b>${fmt(meta)}</b> e faltam ${fmt(falta)}. Informe quanto consegue guardar por mês.`, true);
    const n = Math.ceil(falta/m);
    put("rout", `Meta: <b>${fmt(meta)}</b>. Faltam ${fmt(falta)}.<br>Guardando ${fmt(m)} por mês, você chega lá em <b>${n >= 12 ? Math.floor(n/12) + " ano(s) e " + (n%12) + " mês(es)" : n + " mês(es)"}</b>.`);
  });
}

const store = {
  get(k, d){ try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch { return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

function toolsPage(){
  show(`<h1>Ferramentas</h1><p>Simule antes de decidir. Nada do que você digita é enviado ou salvo.</p>${tools(0)}${tools(1)}${tools(2)}${simulator()}`);
  [0,1,2].forEach(wireTools); wireSim();
}

function learnPage(){
  const done = store.get("fl_done", []), pct = Math.round(done.length / TRAIL.length * 100);
  show(`<h1>Aprender</h1><p>${TRAIL.length} lições curtas. Leia no seu ritmo: o progresso fica salvo neste aparelho.</p>
    <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div>
    <p class="step">${done.length} de ${TRAIL.length} concluídas</p>
    <div class="panel">${TRAIL.map(([t,d],i) => `<details><summary>${done.includes(i) ? "✓ " : ""}${t}</summary><p>${d}</p><button class="btn sm" data-i="${i}">${done.includes(i) ? "Desmarcar" : "Marcar como concluída"}</button></details>`).join("")}</div>`);
  app.querySelectorAll("[data-i]").forEach(b => b.onclick = () => {
    const n = +b.dataset.i, d = store.get("fl_done", []), y = scrollY;
    store.set("fl_done", d.includes(n) ? d.filter(x => x !== n) : [...d, n]);
    learnPage(); scrollTo(0, y); app.querySelector(`[data-i="${n}"]`).closest("details").open = true;
  });
}

function route(){
  const h = location.hash.replace("#/", "");
  document.querySelectorAll("nav a").forEach(l => l.setAttribute("aria-current", l.dataset.r === h ? "page" : "false"));
  if(h === "ferramentas") return toolsPage();
  if(h === "aprender") return learnPage();
  const saved = store.get("fl_answers", null);
  if(saved){ answers = saved; result(); } else intro();
}

const root = document.documentElement;
root.setAttribute("data-theme", store.get("fl_theme", matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
document.getElementById("theme").onclick = () => { const t = root.dataset.theme === "dark" ? "light" : "dark"; root.setAttribute("data-theme", t); store.set("fl_theme", t); };
document.querySelectorAll("nav a").forEach(l => l.addEventListener("click", () => setTimeout(route, 0)));
addEventListener("hashchange", route);
route();
