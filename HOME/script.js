(function(){
  const DEFAULTS = {
    spawnRate:350,  // ← COPOS MODERADOS
    colors:['#FFFFFF','#E6F0FF','#F3F6FF'],
    minSize:8,
    maxSize:22,
    speedRange:[7,14],
    windRange:[-120,120],
    emojiList:['❄','❅','❆'],
    containerId:'snow-overlay'
  };

  let cfg={};
  let running=false;
  let snowIdCounter=0;

  function rand(min,max){ return Math.random()*(max-min)+min; }
  function pick(a){ return a[Math.floor(Math.random()*a.length)]; }

  function createFlake(){
    const el=document.createElement('div');
    el.className='snowflake';
    el.id="nieve-"+(snowIdCounter++);

    const size=Math.round(rand(cfg.minSize,cfg.maxSize));
    el.style.fontSize=size+'px';
    el.textContent=pick(cfg.emojiList);
    el.style.color=pick(cfg.colors);

    const vw=Math.max(document.documentElement.clientWidth||0,window.innerWidth||0);
    el.style.left=rand(0,vw)+'px';

    const wind=Math.round(rand(cfg.windRange[0],cfg.windRange[1]));
    el.style.setProperty('--x-end',wind+'px');

    const rot=Math.round(rand(-720,720));
    el.style.setProperty('--rotation',rot+'deg');

    const duration=rand(cfg.speedRange[0],cfg.speedRange[1]);
    el.style.animation=`fall ${duration}s linear forwards`;
    el.style.animationDelay=rand(0,duration)+'s';

    el.addEventListener("animationend",()=>{ 
      if(el.parentNode) el.parentNode.removeChild(el);
    });

    return el;
  }

  function startSnowfall(userCfg){
    if(running) return;
    cfg=Object.assign({},DEFAULTS,userCfg||{});
    running=true;

    const container=document.getElementById(cfg.containerId)||document.body;
    container.style.pointerEvents='none';

    function spawn(){
      if(!running) return;
      const flake=createFlake();
      container.appendChild(flake);

      // ↓ Generación más estable y controlada ↓
      setTimeout(spawn, cfg.spawnRate + rand(50,140));
    }
    spawn();
  }

  function stopSnowfall(){ running=false; }

  window.startSnowfall=startSnowfall;
  window.stopSnowfall=stopSnowfall;
})();
