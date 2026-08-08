
const E=id=>document.getElementById(id);
const el={form:E('form'),name:E('name'),players:E('players'),count:E('count'),start:E('startBtn'),reset:E('resetBtn'),game:E('game'),queueSec:E('queueSec'),historySec:E('historySec'),teamA:E('teamA'),teamB:E('teamB'),streakA:E('streakA'),streakB:E('streakB'),match:E('match'),aWin:E('aWin'),bWin:E('bWin'),draw:E('draw'),undo:E('undo'),queue:E('queue'),queueCount:E('queueCount'),history:E('history'),toast:E('toast'),cadTitle:E('cadTitle'),cadSub:E('cadSub')};

const blank=()=>({players:[],started:false,courtA:[],courtB:[],queue:[],streakA:0,streakB:0,match:1,history:[],snapshots:[]});
let s=load()||blank();

function load(){try{return JSON.parse(localStorage.getItem('vilelasFutV2'))}catch(e){return null}}
function save(){localStorage.setItem('vilelasFutV2',JSON.stringify(s))}
function id(){return Math.random().toString(36).slice(2)+Date.now().toString(36)}
function esc(v){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;")}
function toast(t){el.toast.textContent=t;el.toast.classList.add('show');setTimeout(()=>el.toast.classList.remove('show'),2100)}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

function snap(){
  s.snapshots.push(JSON.parse(JSON.stringify({
    players:s.players,started:s.started,courtA:s.courtA,courtB:s.courtB,queue:s.queue,
    streakA:s.streakA,streakB:s.streakB,match:s.match,history:s.history
  })));
  if(s.snapshots.length>20)s.snapshots.shift();
}

function addPlayer(name){
  name=name.trim(); if(!name)return;
  const p={id:id(),name};
  s.players.push(p);
  if(s.started)s.queue.push(p); // chega depois -> final da fila
  save();render();
  toast(s.started?`${name} entrou no final da fila.`:`${name} adicionado.`);
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
  s.queue=s.players.slice(10); s.started=true;s.streakA=0;s.streakB=0;s.match=1;s.history=[];s.snapshots=[];
  save();render();toast('Primeira partida sorteada.');
}

function hist(text,a,b){
  s.history.unshift({match:s.match,text,a:a.map(x=>x.name),b:b.map(x=>x.name)});
}
function take5(){return s.queue.length>=5?s.queue.splice(0,5):null}

function win(side){
  snap();

  const A=[...s.courtA], B=[...s.courtB];
  const winner=side==='A'?A:B;
  const loser=side==='A'?B:A;
  const streak=(side==='A'?s.streakA:s.streakB)+1;

  hist(`Vitória do Time ${side}`,A,B);

  // REGRA DAS 4 VITÓRIAS:
  // Ao vencer a 4ª consecutiva, o vencedor obrigatoriamente sai.
  if(streak>=4){

    // Caso existam pelo menos dois times completos FORA antes da troca:
    // vencedor e perdedor saem, e entram dois novos times da fila.
    if(s.queue.length>=10){
      const next1=s.queue.splice(0,5);
      const next2=s.queue.splice(0,5);

      // Os dois times que estavam em quadra vão para o final da fila.
      // Colocamos primeiro o perdedor e depois o vencedor das 4,
      // preservando a rotação sem impedir a entrada dos dois times que já aguardavam.
      s.queue.push(...loser,...winner);

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
  save();
  render();
}

function draw(){
  snap();
  const A=[...s.courtA],B=[...s.courtB];
  hist('Empate',A,B);
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
  s.match++;save();render();
}

function undo(){
  const x=s.snapshots.pop();if(!x)return;
  const remaining=s.snapshots;
  s={...s,...x,snapshots:remaining};save();render();toast('Último resultado desfeito.');
}

function reset(){
  if(!confirm('Apagar a noite atual e começar de novo?'))return;
  s=blank();localStorage.removeItem('vilelasFutV2');render();
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
    let action='';
    if(!s.started)action=`<button class="remove" data-rm="${p.id}">Remover</button>`;
    else if(onCourt)action='<span class="locked">EM QUADRA</span>';
    else if(inQueue)action=`<button class="remove" data-rm="${p.id}">Desistiu</button>`;
    return `<div class="player"><span class="num">${i+1}</span><span class="pname">${esc(p.name)}</span>${action}</div>`;
  }).join('');
  el.players.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>removePlayer(b.dataset.rm));
}

function renderGame(){
  el.game.classList.toggle('hidden',!s.started);el.queueSec.classList.toggle('hidden',!s.started);el.historySec.classList.toggle('hidden',!s.started);
  if(!s.started)return;
  el.match.textContent=`Jogo ${s.match}`;
  el.teamA.innerHTML=s.courtA.map(p=>`<li>${esc(p.name)}</li>`).join('');
  el.teamB.innerHTML=s.courtB.map(p=>`<li>${esc(p.name)}</li>`).join('');
  el.streakA.textContent=`${s.streakA} vitória${s.streakA===1?'':'s'}`;
  el.streakB.textContent=`${s.streakB} vitória${s.streakB===1?'':'s'}`;
  el.undo.disabled=!s.snapshots.length;
}

function renderQueue(){
  el.queueCount.textContent=`${s.queue.length} esperando`;
  if(!s.queue.length){el.queue.innerHTML='<p style="color:#94a3b8;text-align:center">Ninguém na fila.</p>';return}
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

function renderHistory(){
  if(!s.history.length){el.history.innerHTML='<p style="color:#94a3b8;text-align:center">Nenhuma partida finalizada.</p>';return}
  el.history.innerHTML=s.history.map(h=>`<div class="hist"><strong>Jogo ${h.match} · ${esc(h.text)}</strong><br><span>A: ${h.a.map(esc).join(', ')}</span><br><span>B: ${h.b.map(esc).join(', ')}</span></div>`).join('');
}

function render(){renderPlayers();renderGame();if(s.started){renderQueue();renderHistory()}save()}

el.form.onsubmit=e=>{e.preventDefault();addPlayer(el.name.value);el.name.value='';el.name.focus()};
el.start.onclick=start;el.aWin.onclick=()=>win('A');el.bWin.onclick=()=>win('B');el.draw.onclick=draw;el.undo.onclick=undo;el.reset.onclick=reset;
render();
