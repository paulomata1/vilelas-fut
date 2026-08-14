
const E=id=>document.getElementById(id);
const el={form:E('form'),name:E('name'),players:E('players'),count:E('count'),start:E('startBtn'),reset:E('resetBtn'),game:E('game'),queueSec:E('queueSec'),historySec:E('historySec'),summarySec:E('summarySec'),summaryGrid:E('summaryGrid'),statsBody:E('statsBody'),fourWinList:E('fourWinList'),teamA:E('teamA'),teamB:E('teamB'),streakA:E('streakA'),streakB:E('streakB'),match:E('match'),aWin:E('aWin'),bWin:E('bWin'),draw:E('draw'),undo:E('undo'),queue:E('queue'),queueCount:E('queueCount'),history:E('history'),toast:E('toast'),cadTitle:E('cadTitle'),cadSub:E('cadSub'),timer:E('timer'),timerToggle:E('timerToggle'),timerReset:E('timerReset'),rulesBtn:E('rulesBtn'),rulesModal:E('rulesModal'),rulesClose:E('rulesClose'),timerLimit:E('timerLimit'),nextTeamBox:E('nextTeamBox'),installBtn:E('installBtn'),installModal:E('installModal'),installClose:E('installClose'),installHelp:E('installHelp'),scoreboardBtn:E('scoreboardBtn'),scoreboard:E('scoreboard'),scoreClose:E('scoreClose'),scoreFullscreen:E('scoreFullscreen'),scoreMatch:E('scoreMatch'),scoreTimer:E('scoreTimer'),scoreTeamA:E('scoreTeamA'),scoreTeamB:E('scoreTeamB'),scoreStreakA:E('scoreStreakA'),scoreStreakB:E('scoreStreakB'),scoreNextTeam:E('scoreNextTeam'),scoreTimerToggle:E('scoreTimerToggle'),scoreAWin:E('scoreAWin'),scoreBWin:E('scoreBWin'),scoreDraw:E('scoreDraw'),shareCardBtn:E('shareCardBtn'),keeperForm:E('keeperForm'),keeperName:E('keeperName'),keeperList:E('keeperList'),keeperCount:E('keeperCount'),keeperRanking:E('keeperRanking')};

const blank=()=>({appVersion:5.4,goalkeepers:[],players:[],started:false,courtA:[],courtB:[],queue:[],streakA:0,streakB:0,match:1,history:[],snapshots:[],timerElapsed:0,timerRunning:false,timerStartedAt:null,timerLimitMinutes:8,timerAlerted:false,injuryEvents:[],fourWinEvents:[],matchParticipantsA:[],matchParticipantsB:[]});
const loaded=load();
let s={...blank(),...(loaded||{})};
if(!loaded){s.timerLimitMinutes=8}
if(Number(s.appVersion||0)<5.3)s.appVersion=5.3
s.injuryEvents=Array.isArray(s.injuryEvents)?s.injuryEvents:[];
s.fourWinEvents=Array.isArray(s.fourWinEvents)?s.fourWinEvents:[];
s.matchParticipantsA=Array.isArray(s.matchParticipantsA)?s.matchParticipantsA:[];
s.matchParticipantsB=Array.isArray(s.matchParticipantsB)?s.matchParticipantsB:[];
s.goalkeepers=Array.isArray(s.goalkeepers)?s.goalkeepers:[];
let timerInterval=null;
let deferredInstallPrompt=null;

function load(){try{return JSON.parse(localStorage.getItem('vilelasFutV2'))}catch(e){return null}}
function save(){localStorage.setItem('vilelasFutV2',JSON.stringify(s))}
function id(){return Math.random().toString(36).slice(2)+Date.now().toString(36)}
function esc(v){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;")}
function toast(t){el.toast.textContent=t;el.toast.classList.add('show');setTimeout(()=>el.toast.classList.remove('show'),2100)}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

function snap(){
  s.snapshots.push(JSON.parse(JSON.stringify({
    players:s.players,started:s.started,courtA:s.courtA,courtB:s.courtB,queue:s.queue,
    streakA:s.streakA,streakB:s.streakB,match:s.match,history:s.history,timerElapsed:currentElapsed(),timerRunning:s.timerRunning,timerStartedAt:s.timerRunning?Date.now():null,timerLimitMinutes:s.timerLimitMinutes,timerAlerted:s.timerAlerted,injuryEvents:s.injuryEvents,fourWinEvents:s.fourWinEvents,matchParticipantsA:s.matchParticipantsA,matchParticipantsB:s.matchParticipantsB
  })));
  if(s.snapshots.length>20)s.snapshots.shift();
}

function addGoalkeeper(name){
  name=name.trim();if(!name)return;
  s.goalkeepers.push({id:id(),name,difficultSaves:0});
  save();render();toast(`${name} adicionado aos goleiros.`);
}
function changeKeeperSave(kid,delta){
  const k=s.goalkeepers.find(x=>x.id===kid);if(!k)return;
  k.difficultSaves=Math.max(0,Number(k.difficultSaves||0)+delta);
  save();render();
  toast(delta>0?`Defesa difícil de ${k.name} registrada.`:`Contagem de ${k.name} corrigida.`);
}
function removeGoalkeeper(kid){
  const k=s.goalkeepers.find(x=>x.id===kid);if(!k)return;
  if(!confirm(`Remover ${k.name} do ranking de goleiros?`))return;
  s.goalkeepers=s.goalkeepers.filter(x=>x.id!==kid);save();render();toast(`${k.name} removido dos goleiros.`);
}
function keeperStats(){
  return [...s.goalkeepers].map(k=>({...k,difficultSaves:Number(k.difficultSaves||0)})).sort((a,b)=>b.difficultSaves-a.difficultSaves||a.name.localeCompare(b.name,'pt-BR'));
}

function addPlayer(name){
  name=name.trim(); if(!name)return;
  const p={id:id(),name};
  s.players.push(p);
  if(s.started)s.queue.push(p); // chega depois -> final da fila
  save();render();
  toast(s.started?`${name} entrou no final da fila.`:`${name} adicionado.`);
}

function editPlayer(pid){
  const p=s.players.find(x=>x.id===pid);if(!p)return;
  const newName=prompt('Editar nome do atleta:',p.name);
  if(newName===null)return;
  const name=newName.trim();if(!name){toast('O nome do atleta não pode ficar vazio.');return}
  const old=p.name;
  [s.players,s.courtA,s.courtB,s.queue].forEach(list=>list.forEach(x=>{if(x.id===pid)x.name=name}));
  s.history.forEach(h=>{
    (h.aParticipants||[]).forEach(x=>{if(x.id===pid)x.name=name});
    (h.bParticipants||[]).forEach(x=>{if(x.id===pid)x.name=name});
    if(Array.isArray(h.a))h.a=h.a.map(x=>x===old?name:x);
    if(Array.isArray(h.b))h.b=h.b.map(x=>x===old?name:x);
  });
  s.injuryEvents.forEach(e=>{if(e.injured?.id===pid)e.injured.name=name;if(e.replacement?.id===pid)e.replacement.name=name});
  s.fourWinEvents.forEach(e=>(e.players||[]).forEach(x=>{if(x.id===pid)x.name=name}));
  save();render();toast(old===name?'Nome mantido.':`${old} agora é ${name}.`);
}

function removePlayer(pid){
  const court=s.courtA.some(p=>p.id===pid)||s.courtB.some(p=>p.id===pid);
  if(court){toast('Atleta em quadra não pode desistir. Aguarde o fim da partida.');return}

  if(!s.started){
    s.players=s.players.filter(p=>p.id!==pid);
    save();render();return;
  }

  const p=s.queue.find(p=>p.id===pid);
  if(!p)return;
  s.queue=s.queue.filter(x=>x.id!==pid);
  s.players=s.players.filter(x=>x.id!==pid);
  save();render();
  toast(`${p.name} desistiu e saiu da fila.`);
}

function start(){
  if(s.players.length<10)return;
  const first=shuffle(s.players.slice(0,10));
  s.courtA=first.slice(0,5); s.courtB=first.slice(5);
  s.queue=s.players.slice(10); s.started=true;s.streakA=0;s.streakB=0;s.match=1;s.history=[];s.snapshots=[];s.timerElapsed=0;s.timerRunning=false;s.timerStartedAt=null;s.timerAlerted=false;s.injuryEvents=[];s.fourWinEvents=[];s.matchParticipantsA=s.courtA.map(p=>p.id);s.matchParticipantsB=s.courtB.map(p=>p.id);
  save();render();toast('Primeira partida sorteada.');
}

function participantsFor(ids,fallback){
  const all=[...s.players,...s.courtA,...s.courtB,...s.queue];
  const byId=new Map(all.map(p=>[p.id,p]));
  const out=(ids||[]).map(pid=>byId.get(pid)).filter(Boolean).map(p=>({id:p.id,name:p.name}));
  if(out.length)return out;
  return fallback.map(p=>({id:p.id,name:p.name}));
}
function hist(text,a,b,duration=currentElapsed(),meta={}){
  const aParticipants=participantsFor(s.matchParticipantsA,a);
  const bParticipants=participantsFor(s.matchParticipantsB,b);
  s.history.unshift({match:s.match,text,a:a.map(x=>x.name),b:b.map(x=>x.name),aParticipants,bParticipants,duration,...meta});
}
function setParticipantsForCurrentMatch(){
  s.matchParticipantsA=s.courtA.map(p=>p.id);
  s.matchParticipantsB=s.courtB.map(p=>p.id);
}
function currentElapsed(){return (s.timerElapsed||0)+(s.timerRunning&&s.timerStartedAt?Date.now()-s.timerStartedAt:0)}
function fmtTime(ms){const sec=Math.floor(ms/1000),m=Math.floor(sec/60),r=sec%60;return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`}
function playTimerAlert(){
  try{
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx)return;
    const ctx=new Ctx();
    const now=ctx.currentTime;
    [0,.22,.44].forEach((delay,i)=>{
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.type='sine';osc.frequency.value=i===2?1040:880;
      gain.gain.setValueAtTime(.0001,now+delay);
      gain.gain.exponentialRampToValueAtTime(.22,now+delay+.02);
      gain.gain.exponentialRampToValueAtTime(.0001,now+delay+.18);
      osc.connect(gain);gain.connect(ctx.destination);osc.start(now+delay);osc.stop(now+delay+.2);
    });
    setTimeout(()=>ctx.close(),1000);
  }catch(e){}
  if(navigator.vibrate)navigator.vibrate([180,100,180,100,260]);
}
function checkTimerLimit(){
  const limit=Number(s.timerLimitMinutes||0);
  if(!limit||s.timerAlerted)return;
  if(currentElapsed()>=limit*60000){
    s.timerAlerted=true;save();playTimerAlert();toast(`Tempo de ${limit} min atingido. A partida continua.`);
  }
}
function updateTimer(){const value=fmtTime(currentElapsed());if(el.timer)el.timer.textContent=value;if(el.scoreTimer)el.scoreTimer.textContent=value;checkTimerLimit()}
function pauseTimer(){if(s.timerRunning){s.timerElapsed=currentElapsed();s.timerRunning=false;s.timerStartedAt=null;save()}clearInterval(timerInterval);timerInterval=null;updateTimer()}
function resetTimerForNext(){pauseTimer();s.timerElapsed=0;s.timerAlerted=false;updateTimer()}
function toggleTimer(){if(!s.started)return;if(s.timerRunning){pauseTimer();render()}else{s.timerRunning=true;s.timerStartedAt=Date.now();timerInterval=setInterval(updateTimer,500);save();render()}}
function manualResetTimer(){if(s.timerRunning&&!confirm('Zerar o cronômetro enquanto ele está rodando?'))return;s.timerElapsed=0;s.timerStartedAt=s.timerRunning?Date.now():null;s.timerAlerted=false;save();updateTimer()}
function setTimerLimit(){s.timerLimitMinutes=Number(el.timerLimit.value||0);s.timerAlerted=false;save();updateTimer();toast(s.timerLimitMinutes?`Alerta configurado para ${s.timerLimitMinutes} minutos.`:'Cronômetro sem limite de tempo.');}

function take5(){return s.queue.length>=5?s.queue.splice(0,5):null}

function win(side){
  snap();

  const A=[...s.courtA], B=[...s.courtB];
  const winner=side==='A'?A:B;
  const loser=side==='A'?B:A;
  const streak=(side==='A'?s.streakA:s.streakB)+1;

  const duration=currentElapsed();
  pauseTimer();
  hist(`Vitória do Time ${side}`,A,B,duration,{result:'win',winner:side,streak});

  // REGRA DAS 4 VITÓRIAS:
  // Ao vencer a 4ª consecutiva, o vencedor obrigatoriamente sai.
  if(streak>=4){
    s.fourWinEvents.push({match:s.match,side,players:winner.map(p=>({id:p.id,name:p.name}))});

    // Caso existam pelo menos dois times completos FORA antes da troca:
    // vencedor e perdedor saem, e entram dois novos times da fila.
    if(s.queue.length>=10){
      const next1=s.queue.splice(0,5);
      const next2=s.queue.splice(0,5);

      // Os dois times que estavam em quadra vão para o final da fila.
      // O vencedor das 4 tem preferência sobre o perdedor, sem ultrapassar
      // os atletas que já estavam aguardando antes da troca.
      s.queue.push(...winner,...loser);

      s.courtA=next1;
      s.courtB=next2;
      s.streakA=0;
      s.streakB=0;

      toast('4ª vitória: os dois times saíram e entraram os dois próximos.');
    } else {
      // Se NÃO existem dois times completos fora:
      // somente o vencedor das 4 sai.
      // O perdedor permanece e enfrenta o próximo time formado pela fila
      // + jogadores do tetracampeão que acabou de sair.
      s.queue.push(...winner);

      const next=take5();

      if(next){
        if(side==='A'){
          // Time B perdeu, mas permanece.
          s.courtA=next;
          s.courtB=loser;
        }else{
          // Time A perdeu, mas permanece.
          s.courtA=loser;
          s.courtB=next;
        }

        // Ao ocorrer a saída pelas 4 vitórias, inicia nova sequência.
        s.streakA=0;
        s.streakB=0;

        toast('4ª vitória: vencedor saiu; perdedor permanece contra o próximo time.');
      }else{
        // Cenário extremo: não há atletas suficientes para formar adversário.
        // Mantemos a quadra sem alterar a fila de forma inconsistente.
        const ids=new Set(winner.map(x=>x.id));
        s.queue=s.queue.filter(x=>!ids.has(x.id));
        s.courtA=A;
        s.courtB=B;
        s.streakA=side==='A'?4:0;
        s.streakB=side==='B'?4:0;

        toast('4ª vitória registrada, mas ainda não há 5 atletas para formar o próximo time.');
      }
    }

    s.match++;
    setParticipantsForCurrentMatch();
    resetTimerForNext();
    save();
    render();
    return;
  }

  // REGRA NORMAL DE VITÓRIA (1ª, 2ª ou 3ª consecutiva):
  // perdedor vai para o final da fila; vencedor permanece.
  s.queue.push(...loser);
  const next=take5();

  if(next){
    if(side==='A'){
      s.courtA=winner;
      s.courtB=next;
      s.streakA=streak;
      s.streakB=0;
    }else{
      s.courtA=next;
      s.courtB=winner;
      s.streakA=0;
      s.streakB=streak;
    }
  }else{
    // Sem 5 esperando, não há como substituir o perdedor.
    // Desfaz a ida dele para a fila e mantém os dois times em quadra.
    const ids=new Set(loser.map(x=>x.id));
    s.queue=s.queue.filter(x=>!ids.has(x.id));
    s.courtA=A;
    s.courtB=B;

    if(side==='A'){
      s.streakA=streak;
      s.streakB=0;
    }else{
      s.streakA=0;
      s.streakB=streak;
    }

    toast('Ainda não há 5 atletas completos aguardando.');
  }

  s.match++;
  setParticipantsForCurrentMatch();
  resetTimerForNext();
  save();
  render();
}

function draw(){
  snap();
  const A=[...s.courtA],B=[...s.courtB];
  const duration=currentElapsed();
  pauseTimer();
  hist('Empate',A,B,duration,{result:'draw',streak:0});
  if(s.queue.length>=10){
    s.queue.push(...A,...B);
    s.courtA=take5();s.courtB=take5();s.streakA=0;s.streakB=0;
    toast('Empate: os dois times saíram.');
  }else{
    const keepA=confirm('Façam ímpar ou par.\n\nOK = Time A fica\nCancelar = Time B fica');
    const stay=keepA?A:B, leave=keepA?B:A;
    s.queue.push(...leave);
    const next=take5();
    if(next){
      if(keepA){s.courtA=stay;s.courtB=next}else{s.courtA=next;s.courtB=stay}
      s.streakA=0;s.streakB=0;
    }else{
      s.courtA=A;s.courtB=B;
      const ids=new Set(leave.map(x=>x.id));
      s.queue=s.queue.filter(x=>!ids.has(x.id));
    }
  }
  s.match++;setParticipantsForCurrentMatch();resetTimerForNext();save();render();
}

function injury(pid){
  if(!s.started)return;
  if(!s.queue.length){toast('Não há atleta na fila disponível para substituir.');return}
  const ai=s.courtA.findIndex(p=>p.id===pid), bi=s.courtB.findIndex(p=>p.id===pid);
  if(ai<0&&bi<0)return;
  const injured=ai>=0?s.courtA[ai]:s.courtB[bi];
  const replacement=s.queue.shift();
  if(ai>=0){s.courtA[ai]=replacement;if(!s.matchParticipantsA.includes(replacement.id))s.matchParticipantsA.push(replacement.id)}else{s.courtB[bi]=replacement;if(!s.matchParticipantsB.includes(replacement.id))s.matchParticipantsB.push(replacement.id)}
  s.queue.push(injured);
  s.injuryEvents.push({match:s.match,injured:{id:injured.id,name:injured.name},replacement:{id:replacement.id,name:replacement.name}});
  save();render();toast(`${injured.name} saiu por lesão. ${replacement.name} entrou no lugar.`);
}

function undo(){
  const x=s.snapshots.pop();if(!x)return;
  const remaining=s.snapshots;
  clearInterval(timerInterval);timerInterval=null;
  s={...s,...x,snapshots:remaining};
  if(s.timerRunning){s.timerStartedAt=Date.now();timerInterval=setInterval(updateTimer,500)}
  save();render();toast('Último resultado desfeito.');
}

function reset(){
  if(!confirm('Apagar a noite atual e começar de novo?'))return;
  clearInterval(timerInterval);timerInterval=null;s=blank();localStorage.removeItem('vilelasFutV2');render();
}

function renderGoalkeepers(){
  if(!el.keeperList)return;
  const ranked=keeperStats();
  el.keeperCount.textContent=`${ranked.length} goleiro${ranked.length===1?'':'s'}`;
  if(!ranked.length){
    el.keeperList.innerHTML='<p class="muted keeperEmpty">Cadastre os goleiros fixos da noite para registrar as defesas difíceis.</p>';
  }else{
    el.keeperList.innerHTML=ranked.map((k,i)=>`<div class="keeperRow ${i===0&&k.difficultSaves>0?'keeperLeader':''}">
      <span class="keeperPos">${i+1}º</span><span class="keeperName">🥅 ${esc(k.name)}</span>
      <span class="keeperSaves"><strong>${k.difficultSaves}</strong> defesa${k.difficultSaves===1?'':'s'} difícil${k.difficultSaves===1?'':'eis'}</span>
      <div class="keeperActions"><button class="primary keeperSaveBtn" data-ksave="${k.id}">+ Defesa difícil</button><button class="secondary keeperFixBtn" data-kfix="${k.id}" ${k.difficultSaves<=0?'disabled':''}>− Corrigir</button><button class="remove keeperRemoveBtn" data-krm="${k.id}">Remover</button></div>
    </div>`).join('');
    el.keeperList.querySelectorAll('[data-ksave]').forEach(b=>b.onclick=()=>changeKeeperSave(b.dataset.ksave,1));
    el.keeperList.querySelectorAll('[data-kfix]').forEach(b=>b.onclick=()=>changeKeeperSave(b.dataset.kfix,-1));
    el.keeperList.querySelectorAll('[data-krm]').forEach(b=>b.onclick=()=>removeGoalkeeper(b.dataset.krm));
  }
  if(el.keeperRanking){
    el.keeperRanking.innerHTML=ranked.length?ranked.map((k,i)=>`<div class="keeperRankRow ${i===0&&k.difficultSaves>0?'keeperLeader':''}"><span class="keeperMedal">${i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}º`}</span><strong>${esc(k.name)}</strong><span>${k.difficultSaves} defesa${k.difficultSaves===1?'':'s'} difícil${k.difficultSaves===1?'':'eis'}</span></div>`).join(''):'<p class="muted">Nenhum goleiro cadastrado.</p>';
  }
}

function renderPlayers(){
  el.count.textContent=`${s.players.length} atleta${s.players.length===1?'':'s'}`;
  el.start.disabled=s.started||s.players.length<10;
  el.start.classList.toggle('hidden',s.started);
  el.cadTitle.textContent=s.started?'Adicionar atleta':'Ordem de chegada';
  el.cadSub.textContent=s.started?'Quem chegar agora entra automaticamente no final da fila.':'Cadastre na ordem em que os atletas chegarem.';

  if(!s.players.length){el.players.innerHTML='<p style="color:#94a3b8;text-align:center">Nenhum atleta cadastrado.</p>';return}

  el.players.innerHTML=s.players.map((p,i)=>{
    const onCourt=s.started&&(s.courtA.some(x=>x.id===p.id)||s.courtB.some(x=>x.id===p.id));
    const inQueue=s.started&&s.queue.some(x=>x.id===p.id);
    let action=`<button class="edit" data-edit="${p.id}">Editar</button>`;
    if(!s.started)action+=`<button class="remove" data-rm="${p.id}">Remover</button>`;
    else if(onCourt)action+=`<span class="locked">EM QUADRA</span><button class="injury" data-injury="${p.id}">Lesão</button>`;
    else if(inQueue)action+=`<button class="remove" data-rm="${p.id}">Desistiu</button>`;
    return `<div class="player"><span class="num">${i+1}</span><span class="pname">${esc(p.name)}</span><span class="playerActions">${action}</span></div>`;
  }).join('');
  el.players.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editPlayer(b.dataset.edit));
  el.players.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>removePlayer(b.dataset.rm));
  el.players.querySelectorAll('[data-injury]').forEach(b=>b.onclick=()=>injury(b.dataset.injury));
}

function renderGame(){
  el.game.classList.toggle('hidden',!s.started);el.queueSec.classList.toggle('hidden',!s.started);el.historySec.classList.toggle('hidden',!s.started);
  if(!s.started)return;
  el.match.textContent=`Jogo ${s.match}`;
  el.teamA.innerHTML=s.courtA.map(p=>`<li>${esc(p.name)} <button class="injury" data-injury="${p.id}">Lesão</button></li>`).join('');
  el.teamB.innerHTML=s.courtB.map(p=>`<li>${esc(p.name)} <button class="injury" data-injury="${p.id}">Lesão</button></li>`).join('');
  [...el.teamA.querySelectorAll('[data-injury]'),...el.teamB.querySelectorAll('[data-injury]')].forEach(b=>b.onclick=()=>injury(b.dataset.injury));
  el.streakA.textContent=`${s.streakA} vitória${s.streakA===1?'':'s'}`;
  el.streakB.textContent=`${s.streakB} vitória${s.streakB===1?'':'s'}`;
  el.undo.disabled=!s.snapshots.length;
  el.timerToggle.textContent=s.timerRunning?'Pausar':(currentElapsed()>0?'Continuar':'Iniciar');
  el.timerLimit.value=String(s.timerLimitMinutes||0);
  updateTimer();
}

function renderQueue(){
  el.queueCount.textContent=`${s.queue.length} esperando`;
  const next=s.queue.slice(0,5);
  if(!s.queue.length){
    el.nextTeamBox.innerHTML='<div class="nextTeamEmpty"><strong>Nenhum atleta aguardando</strong><span>O próximo time ainda não começou a ser formado.</span></div>';
    el.queue.innerHTML='<p style="color:#94a3b8;text-align:center">Ninguém na fila.</p>';return
  }
  if(next.length===5){
    el.nextTeamBox.innerHTML=`<div class="nextTeamReady"><div><small>PRÓXIMO TIME</small><strong>${next.map(p=>esc(p.name)).join(' · ')}</strong></div><span class="readyBadge">PRONTO</span></div>`;
  }else{
    const missing=5-next.length;
    el.nextTeamBox.innerHTML=`<div class="nextTeamWaiting"><div><small>PRÓXIMO TIME</small><strong>${next.map(p=>esc(p.name)).join(' · ')}</strong></div><span class="missingBadge">Faltam ${missing}</span></div>`;
  }
  let groups=[];for(let i=0;i<s.queue.length;i+=5)groups.push(s.queue.slice(i,i+5));
  el.queue.innerHTML=groups.map((g,gi)=>{
    const full=g.length===5;
    const title=gi===0&&full?'Próximo time':full?`Time na fila ${gi+1}`:'Aguardando completar';
    return `<div class="group"><h3>${title}</h3>${g.map((p,j)=>`
      <div class="qrow ${gi===0&&full?'next':''}">
        <span class="num">${gi*5+j+1}</span>
        <span class="pname">${esc(p.name)}</span>
        ${gi===0&&full?'<span class="nexttag">PRÓXIMO</span>':''}
        <button class="remove" data-qrm="${p.id}">Desistiu</button>
      </div>`).join('')}</div>`;
  }).join('');
  el.queue.querySelectorAll('[data-qrm]').forEach(b=>b.onclick=()=>removePlayer(b.dataset.qrm));
}

function historyParticipants(h,side){
  const rich=side==='A'?h.aParticipants:h.bParticipants;
  if(Array.isArray(rich)&&rich.length)return rich;
  const names=side==='A'?(h.a||[]):(h.b||[]);
  return names.map(name=>({id:`legacy:${name}`,name}));
}
function computeStats(){
  const map=new Map();
  const ensure=p=>{const key=p.id||`legacy:${p.name}`;if(!map.has(key))map.set(key,{id:key,name:p.name,jogos:0,vitorias:0,empates:0,derrotas:0,lesoes:0,tetras:0});return map.get(key)};
  s.players.forEach(ensure);
  s.history.forEach(h=>{
    const A=historyParticipants(h,'A'),B=historyParticipants(h,'B');
    [...A,...B].forEach(p=>ensure(p).jogos++);
    if(h.result==='win'||String(h.text||'').startsWith('Vitória')){
      const winner=h.winner||((h.text||'').includes('Time A')?'A':'B');
      A.forEach(p=>winner==='A'?ensure(p).vitorias++:ensure(p).derrotas++);
      B.forEach(p=>winner==='B'?ensure(p).vitorias++:ensure(p).derrotas++);
    }else{
      A.forEach(p=>ensure(p).empates++);B.forEach(p=>ensure(p).empates++);
    }
  });
  s.injuryEvents.forEach(e=>{if(e.injured)ensure(e.injured).lesoes++});
  s.fourWinEvents.forEach(e=>(e.players||[]).forEach(p=>ensure(p).tetras++));
  return [...map.values()].map(x=>({...x,aproveitamento:x.jogos?((x.vitorias*3+x.empates)/(x.jogos*3))*100:0})).sort((a,b)=>b.vitorias-a.vitorias||b.aproveitamento-a.aproveitamento||b.jogos-a.jogos||a.name.localeCompare(b.name,'pt-BR'));
}
function renderSummary(){
  if(!el.summarySec)return;
  el.summarySec.classList.toggle('hidden',!s.started);if(!s.started)return;
  const stats=computeStats();
  const totalDuration=s.history.reduce((sum,h)=>sum+Number(h.duration||0),0);
  const maxStreak=Math.max(0,...s.history.map(h=>Number(h.streak||0)));
  const known=new Set(stats.map(x=>x.id));
  el.summaryGrid.innerHTML=`
    <div class="summaryKpi"><span>Partidas</span><strong>${s.history.length}</strong></div>
    <div class="summaryKpi"><span>Atletas</span><strong>${known.size}</strong></div>
    <div class="summaryKpi"><span>Tempo jogado</span><strong>${fmtTime(totalDuration)}</strong></div>
    <div class="summaryKpi"><span>Maior sequência</span><strong>${maxStreak} vitórias</strong></div>
    <div class="summaryKpi"><span>Lesões</span><strong>${s.injuryEvents.length}</strong></div>
    <div class="summaryKpi"><span>4 vitórias</span><strong>${s.fourWinEvents.length}</strong></div>`;
  const active=stats.filter(x=>x.jogos>0||x.lesoes>0||x.tetras>0);
  el.statsBody.innerHTML=active.length?active.map((x,i)=>`<tr><td><span class="rankPos">${i+1}</span>${esc(x.name)}</td><td>${x.jogos}</td><td>${x.vitorias}</td><td>${x.empates}</td><td>${x.derrotas}</td><td>${Math.round(x.aproveitamento)}%</td><td>${x.tetras}</td><td>${x.lesoes}</td></tr>`).join(''):'<tr><td colspan="8" class="emptyCell">As estatísticas aparecem após a primeira partida.</td></tr>';
  el.fourWinList.innerHTML=s.fourWinEvents.length?s.fourWinEvents.slice().reverse().map(e=>`<div class="achievement">🔥 <strong>Jogo ${e.match}</strong> · ${e.players.map(p=>esc(p.name)).join(', ')}</div>`).join(''):'<p class="muted">Nenhuma sequência de 4 vitórias registrada ainda.</p>';
}


function renderScoreboard(){
  if(!el.scoreboard)return;
  el.scoreboardBtn.classList.toggle('hidden',!s.started);
  if(!s.started)return;
  el.scoreMatch.textContent=`Jogo ${s.match}`;
  el.scoreTeamA.innerHTML=s.courtA.map(p=>`<li>${esc(p.name)}</li>`).join('');
  el.scoreTeamB.innerHTML=s.courtB.map(p=>`<li>${esc(p.name)}</li>`).join('');
  el.scoreStreakA.textContent=`${s.streakA} vitória${s.streakA===1?'':'s'}`;
  el.scoreStreakB.textContent=`${s.streakB} vitória${s.streakB===1?'':'s'}`;
  const next=s.queue.slice(0,5);
  el.scoreNextTeam.textContent=next.length===5?next.map(p=>p.name).join(' · '):next.length?`${next.map(p=>p.name).join(' · ')} — faltam ${5-next.length}`:'Ninguém aguardando';
  el.scoreTimerToggle.textContent=s.timerRunning?'Pausar':(currentElapsed()>0?'Continuar':'Iniciar');
  updateTimer();
}
function openScoreboard(){if(!s.started){toast('Inicie a primeira partida antes de abrir o placar.');return}el.scoreboard.classList.remove('hidden');renderScoreboard()}
function closeScoreboard(){el.scoreboard.classList.add('hidden');if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})}
async function toggleScoreFullscreen(){try{if(!document.fullscreenElement){await el.scoreboard.requestFullscreen?.()}else{await document.exitFullscreen?.()}}catch(e){toast('Tela cheia não disponível neste navegador.')}}

function isStandalone(){return window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true}
function showInstallHelp(){
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  el.installHelp.innerHTML=ios?'<p>No iPhone/iPad: toque no botão <strong>Compartilhar</strong> do Safari e escolha <strong>Adicionar à Tela de Início</strong>.</p>':'<p>No navegador, abra o menu e procure <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>. No Chrome/Edge, o ícone de instalação também pode aparecer na barra de endereço.</p>';
  el.installModal.classList.remove('hidden');
}
async function installApp(){
  if(isStandalone()){toast('Vilelas Fut já está instalado como aplicativo.');return}
  if(deferredInstallPrompt){
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice.catch(()=>null);
    deferredInstallPrompt=null;
    return;
  }
  showInstallHelp();
}

function roundRect(ctx,x,y,w,h,r,fill,stroke){
  const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,rr):(ctx.rect(x,y,w,h));
  if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}
}
function fitText(ctx,text,maxWidth,startSize,minSize=22){let size=startSize;while(size>minSize){ctx.font=`700 ${size}px Arial`;if(ctx.measureText(text).width<=maxWidth)break;size-=2}return size}
function drawCard(){
  if(!s.history.length){toast('Finalize pelo menos uma partida para gerar o card.');return null}
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=2280;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#08111f';ctx.fillRect(0,0,1080,2280);
  const grad=ctx.createLinearGradient(0,0,1080,0);grad.addColorStop(0,'#22c55e');grad.addColorStop(1,'#16a34a');ctx.fillStyle=grad;ctx.fillRect(0,0,1080,18);
  ctx.fillStyle='#22c55e';ctx.font='800 26px Arial';ctx.fillText('QUINTA DO FUT',64,82);
  ctx.fillStyle='#f8fafc';ctx.font='900 64px Arial';ctx.fillText('Vilelas Fut',64,148);
  ctx.fillStyle='#94a3b8';ctx.font='28px Arial';ctx.fillText(`Resumo da noite · ${new Date().toLocaleDateString('pt-BR')}`,64,195);
  const stats=computeStats();const totalDuration=s.history.reduce((sum,h)=>sum+Number(h.duration||0),0);const maxStreak=Math.max(0,...s.history.map(h=>Number(h.streak||0)));
  const keepers=keeperStats();
  const activeAll=stats.filter(x=>x.jogos>0||x.lesoes>0||x.tetras>0);
  const top5=activeAll.slice(0,5);
  const worst5=[...activeAll].reverse().slice(0,5);
  const kpis=[['PARTIDAS',s.history.length],['ATLETAS',activeAll.length],['TEMPO',fmtTime(totalDuration)],['MAIOR SEQUÊNCIA',`${maxStreak} vit.`],['LESÕES',s.injuryEvents.length],['GOLEIROS',keepers.length]];
  kpis.forEach((k,i)=>{const col=i%3,row=Math.floor(i/3),x=64+col*318,y=245+row*128;roundRect(ctx,x,y,286,104,18,'#111827','#253147');ctx.fillStyle='#94a3b8';ctx.font='800 18px Arial';ctx.fillText(k[0],x+20,y+31);ctx.fillStyle='#f8fafc';ctx.font='900 34px Arial';ctx.fillText(String(k[1]),x+20,y+76)});

  function drawPlayerSection(title,subtitle,items,startY,best){
    ctx.fillStyle=best?'#22c55e':'#f59e0b';ctx.font='800 22px Arial';ctx.fillText(title,64,startY);
    ctx.fillStyle='#f8fafc';ctx.font='900 34px Arial';ctx.fillText(subtitle,64,startY+44);
    items.forEach((x,i)=>{const y=startY+72+i*76;roundRect(ctx,64,y,952,62,14,best&&i===0?'#10271b':'#111827',best&&i===0?'#166534':'#253147');ctx.fillStyle=best&&i===0?'#86efac':'#cbd5e1';ctx.font='900 22px Arial';ctx.fillText(`${i+1}º`,84,y+39);ctx.fillStyle='#f8fafc';const fs=fitText(ctx,x.name,400,25,18);ctx.font=`800 ${fs}px Arial`;ctx.fillText(x.name,140,y+39);ctx.fillStyle='#94a3b8';ctx.font='700 18px Arial';ctx.fillText(`${x.jogos}J  ${x.vitorias}V  ${x.empates}E  ${x.derrotas}D`,575,y+27);ctx.fillStyle=best?'#86efac':'#fbbf24';ctx.font='900 21px Arial';ctx.fillText(`${Math.round(x.aproveitamento)}%`,888,y+42)});
  }
  drawPlayerSection('RANKING DA NOITE','Top 5 jogadores',top5,525,true);
  drawPlayerSection('PARTE DE BAIXO DO RANKING','5 piores jogadores',worst5,1020,false);

  const keeperY=1515;
  ctx.fillStyle='#38bdf8';ctx.font='800 22px Arial';ctx.fillText('🥅 RANKING DOS GOLEIROS',64,keeperY);
  ctx.fillStyle='#f8fafc';ctx.font='900 34px Arial';ctx.fillText('Defesas difíceis',64,keeperY+44);
  if(keepers.length){
    keepers.slice(0,3).forEach((k,i)=>{const y=keeperY+72+i*78;roundRect(ctx,64,y,952,64,14,i===0&&k.difficultSaves>0?'#0d2330':'#111827',i===0&&k.difficultSaves>0?'#0369a1':'#253147');ctx.fillStyle='#f8fafc';ctx.font='900 24px Arial';ctx.fillText(i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}º`,84,y+41);const fs=fitText(ctx,k.name,500,26,18);ctx.font=`800 ${fs}px Arial`;ctx.fillText(k.name,150,y+41);ctx.textAlign='right';ctx.fillStyle='#7dd3fc';ctx.font='900 23px Arial';ctx.fillText(`${k.difficultSaves} defesa${k.difficultSaves===1?'':'s'} difícil${k.difficultSaves===1?'':'eis'}`,990,y+41);ctx.textAlign='left'});
  }else{
    ctx.fillStyle='#94a3b8';ctx.font='22px Arial';ctx.fillText('Nenhum goleiro cadastrado nesta noite.',64,keeperY+92);
  }
  // Times que conseguiram 4 vitórias consecutivas
  const fourY=1870;
  ctx.fillStyle='#f97316';ctx.font='800 22px Arial';ctx.fillText('🔥 SEQUÊNCIAS DE 4 VITÓRIAS',64,fourY);
  if(s.fourWinEvents.length){
    s.fourWinEvents.slice(-3).reverse().forEach((e,i)=>{
      const y=fourY+28+i*86;
      roundRect(ctx,64,y,952,72,14,'#111827','#7c2d12');
      ctx.fillStyle='#fdba74';ctx.font='900 20px Arial';ctx.fillText(`Jogo ${e.match}`,84,y+29);
      ctx.fillStyle='#f8fafc';
      const names=e.players.map(p=>p.name).join(' · ');
      const fs=fitText(ctx,names,790,23,16);
      ctx.font=`800 ${fs}px Arial`;
      ctx.fillText(names,84,y+56);
    });
  }else{
    ctx.fillStyle='#94a3b8';ctx.font='22px Arial';ctx.fillText('Nenhum time conseguiu 4 vitórias seguidas nesta noite.',64,fourY+48);
  }

  const footerY=2230;ctx.fillStyle='#94a3b8';ctx.font='22px Arial';ctx.fillText('Gerado pelo Vilelas Fut',64,footerY);ctx.fillStyle='#22c55e';ctx.font='800 22px Arial';ctx.textAlign='right';ctx.fillText('Desenvolvido por Paulo Victor',1016,footerY);ctx.textAlign='left';
  return canvas;
}

function downloadBlob(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function shareNightCard(){
  const canvas=drawCard();if(!canvas)return;
  canvas.toBlob(async blob=>{
    if(!blob){toast('Não foi possível gerar o card.');return}
    const name=`vilelas-fut-${new Date().toISOString().slice(0,10)}.png`;const file=new File([blob],name,{type:'image/png'});
    try{
      if(navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({title:'Vilelas Fut · Resumo da noite',text:'Resumo da pelada no Vilelas Fut',files:[file]});return}
    }catch(e){if(e?.name==='AbortError')return}
    downloadBlob(blob,name);toast('Card baixado. Agora é só enviar no WhatsApp.');
  },'image/png');
}

function registerPWA(){
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e});
  window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;toast('Vilelas Fut instalado com sucesso.');});
}

function renderHistory(){
  if(!s.history.length){el.history.innerHTML='<p style="color:#94a3b8;text-align:center">Nenhuma partida finalizada.</p>';return}
  el.history.innerHTML=s.history.map(h=>`<div class="hist"><strong>Jogo ${h.match} · ${esc(h.text)}${h.duration!=null?` · ${fmtTime(h.duration)}`:''}</strong><br><span>A: ${h.a.map(esc).join(', ')}</span><br><span>B: ${h.b.map(esc).join(', ')}</span></div>`).join('');
}

function render(){renderGoalkeepers();renderPlayers();renderGame();renderSummary();renderScoreboard();if(s.started){renderQueue();renderHistory()}save()}

el.form.onsubmit=e=>{e.preventDefault();addPlayer(el.name.value);el.name.value='';el.name.focus()};
if(el.keeperForm)el.keeperForm.onsubmit=e=>{e.preventDefault();addGoalkeeper(el.keeperName.value);el.keeperName.value='';el.keeperName.focus()};
el.start.onclick=start;el.aWin.onclick=()=>win('A');el.bWin.onclick=()=>win('B');el.draw.onclick=draw;el.undo.onclick=undo;el.reset.onclick=reset;el.timerToggle.onclick=toggleTimer;el.timerReset.onclick=manualResetTimer;el.timerLimit.onchange=setTimerLimit;el.rulesBtn.onclick=()=>el.rulesModal.classList.remove('hidden');el.rulesClose.onclick=()=>el.rulesModal.classList.add('hidden');el.rulesModal.onclick=e=>{if(e.target===el.rulesModal)el.rulesModal.classList.add('hidden')};
el.installBtn.onclick=installApp;el.installClose.onclick=()=>el.installModal.classList.add('hidden');el.installModal.onclick=e=>{if(e.target===el.installModal)el.installModal.classList.add('hidden')};
el.scoreboardBtn.onclick=openScoreboard;el.scoreClose.onclick=closeScoreboard;el.scoreFullscreen.onclick=toggleScoreFullscreen;el.scoreTimerToggle.onclick=toggleTimer;el.scoreAWin.onclick=()=>win('A');el.scoreBWin.onclick=()=>win('B');el.scoreDraw.onclick=draw;el.shareCardBtn.onclick=shareNightCard;
if(s.timerRunning){s.timerStartedAt=Date.now();timerInterval=setInterval(updateTimer,500)}
registerPWA();
render();
