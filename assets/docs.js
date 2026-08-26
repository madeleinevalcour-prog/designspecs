/* Design specs — shared documentation components (Soft notebook).
   Custom elements + rail / next-back / lightbox behavior. No build step.
   Load once per page:  <script src="../assets/docs.js" defer></script>  */
(function(){
  "use strict";
  var esc=function(s){return (s==null?"":String(s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");};
  function attr(el,name){return el.getAttribute(name);}

  /* ---- content blocks ---- */

  // <doc-callout type="do|dont|note" heading="Do">text/html</doc-callout>
  customElements.define("doc-callout", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var type=attr(this,"type")||"note", heading=attr(this,"heading")||"", inner=this.innerHTML.trim();
      this.innerHTML='<div class="callout '+type+'"><p>'+(heading?'<span class="k">'+esc(heading)+'</span> ':'')+inner+'</p></div>';
    }
  });

  // <doc-quote who="Name">verbatim</doc-quote>
  customElements.define("doc-quote", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var who=attr(this,"who")||"", inner=this.innerHTML.trim();
      this.innerHTML='<div class="quote">'+inner+(who?'<span class="who">'+esc(who)+'</span>':'')+'</div>';
    }
  });

  // <doc-spec><span class="pair"><b>Change:</b> ...</span></doc-spec>
  customElements.define("doc-spec", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      this.innerHTML='<p class="spec">'+this.innerHTML.trim()+'</p>';
    }
  });

  // <doc-swatch color="#fff" name="token/name" value="#fff · ~5:1" pending></doc-swatch>
  customElements.define("doc-swatch", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var color=attr(this,"color")||"#fff", name=attr(this,"name")||"", value=attr(this,"value")||"",
          pending=this.hasAttribute("pending");
      this.innerHTML='<div class="sw"><span class="box" style="background:'+esc(color)+'"></span>'+
        '<span class="txt"><b>'+esc(name)+'</b><br><span class="v">'+esc(value)+'</span>'+
        (pending?' <span class="pending">pending</span>':'')+'</span></div>';
    }
  });

  // <doc-swatches>…doc-swatch…</doc-swatches>
  customElements.define("doc-swatches", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var wrap=document.createElement("div"); wrap.className="swatches";
      while(this.firstChild) wrap.appendChild(this.firstChild);
      this.appendChild(wrap);
    }
  });

  // Foundations token: <doc-token color="#0D9488" name="color/accent/primary" value="…" pending>desc</doc-token>
  customElements.define("doc-token", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var color=attr(this,"color")||"var(--chip)", name=attr(this,"name")||"", value=attr(this,"value")||"",
          pending=this.hasAttribute("pending"), desc=this.innerHTML.trim();
      this.innerHTML='<div class="token"><div class="sw-color" style="background:'+esc(color)+'"></div>'+
        '<div><div class="name">'+esc(name)+(pending?' <span class="pending">pending rebind</span>':'')+'</div>'+
        (value?'<div class="val">'+esc(value)+'</div>':'')+
        (desc?'<div class="desc">'+desc+'</div>':'')+'</div></div>';
    }
  });

  // <doc-token-list>…doc-token…</doc-token-list>
  customElements.define("doc-token-list", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var wrap=document.createElement("div"); wrap.className="token-list";
      while(this.firstChild) wrap.appendChild(this.firstChild);
      this.appendChild(wrap);
    }
  });

  // <doc-recommendation status="pending" heading="…">why</doc-recommendation>
  customElements.define("doc-recommendation", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var heading=attr(this,"heading")||"", status=attr(this,"status")||"pending",
          badge=status==="final"?"Recommended":"Recommended — pending sign-off",
          inner=this.innerHTML.trim();
      this.innerHTML='<div class="rec"><span class="badge">'+esc(badge)+'</span>'+
        (heading?'<h3>'+esc(heading)+'</h3>':'')+inner+'</div>';
    }
  });

  // <doc-showcase src="images/x.png" alt="…" caption="Current state" href="figma-url" ph="export as images/x.png"></doc-showcase>
  customElements.define("doc-showcase", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var src=attr(this,"src")||"", alt=attr(this,"alt")||"", cap=attr(this,"caption")||"",
          href=attr(this,"href")||"", ph=attr(this,"ph")||"";
      var img='<img src="'+esc(src)+'" alt="'+esc(alt)+'"'+
        (ph?' onload="this.previousElementSibling.style.display=\'none\'"':'')+
        ' onerror="this.style.display=\'none\'">';
      var caption= cap||href ? '<figcaption>'+esc(cap)+
        (href?' · <a href="'+esc(href)+'" target="_blank" rel="noopener">Open frame in Figma ↗</a>':'')+
        '</figcaption>' : '';
      this.innerHTML='<figure class="showcase">'+(ph?'<div class="ph">'+esc(ph)+'</div>':'')+img+caption+'</figure>';
    }
  });

  /* ---- structure ---- */

  // <doc-section id="problem" label="The problem" desc="What prompted this">…</doc-section>
  customElements.define("doc-section", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var label=attr(this,"label");
      if(label){ var h=document.createElement("h2"); h.textContent=label; this.insertBefore(h,this.firstChild); }
    }
  });

  // <doc-page eyebrow="Component" title="Button" meta="…" [rail]>…doc-section…</doc-page>
  customElements.define("doc-page", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var eyebrow=attr(this,"eyebrow"), title=attr(this,"title"), meta=attr(this,"meta"), intro=attr(this,"intro"),
          hasRail=this.hasAttribute("rail");
      var kids=[]; while(this.firstChild) kids.push(this.removeChild(this.firstChild));

      var shell=document.createElement("div"); shell.className="shell";
      var rail=null;
      if(hasRail){
        rail=document.createElement("nav"); rail.className="rail"; rail.setAttribute("aria-label","On this page");
        rail.innerHTML='<p class="eyebrow">On this page</p><ol></ol>';
        shell.appendChild(rail);
      }
      var main=document.createElement("main"); main.className="page"+(hasRail?"":" narrow");
      if(eyebrow||title||meta||intro){
        var header=document.createElement("header");
        header.innerHTML=(eyebrow?'<p class="eyebrow">'+esc(eyebrow)+'</p>':'')+
          (title?'<h1>'+esc(title)+'</h1>':'')+(intro?'<p class="lead intro">'+esc(intro)+'</p>':'')+(meta?'<p class="meta">'+esc(meta)+'</p>':'');
        main.appendChild(header);
      }
      kids.forEach(function(k){ main.appendChild(k); });
      shell.appendChild(main); this.appendChild(shell);

      var self=this;
      requestAnimationFrame(function(){ if(window.__docsBuildNav) window.__docsBuildNav(main, rail); });
    }
  });

  /* ---- rail + next/back ---- */
  window.__docsBuildNav=function(main, rail){
    var secs=[].slice.call(main.querySelectorAll("doc-section[id]"));
    var items=secs.map(function(s){return {id:s.id,label:s.getAttribute("label")||s.id,desc:s.getAttribute("desc")||""};});

    if(rail){
      var ol=rail.querySelector("ol"), links={};
      items.forEach(function(it){
        var li=document.createElement("li"), a=document.createElement("a");
        a.href="#"+it.id; a.dataset.id=it.id;
        a.innerHTML='<span class="t">'+esc(it.label)+'</span>'+(it.desc?'<span class="d">'+esc(it.desc)+'</span>':'');
        li.appendChild(a); ol.appendChild(li); links[it.id]=a;
      });
      var io=new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(en.isIntersecting){
            Object.keys(links).forEach(function(k){links[k].classList.remove("is-active");});
            if(links[en.target.id]) links[en.target.id].classList.add("is-active");
          }
        });
      },{rootMargin:"-20% 0px -70% 0px",threshold:0});
      secs.forEach(function(s){io.observe(s);});
    }

    secs.forEach(function(s,i){
      var nav=document.createElement("div"); nav.className="secnav";
      if(i>0){ var p=items[i-1], b=document.createElement("a"); b.className="back"; b.href="#"+p.id;
        b.innerHTML='<span class="dir">← Back</span><span class="lbl">'+esc(p.label)+'</span>'; nav.appendChild(b); }
      else { var sp=document.createElement("span"); sp.className="spacer"; nav.appendChild(sp); }
      if(i<items.length-1){ var n=items[i+1], f=document.createElement("a"); f.className="next"; f.href="#"+n.id;
        f.innerHTML='<span class="dir">Next →</span><span class="lbl">'+esc(n.label)+'</span>'; nav.appendChild(f); }
      s.appendChild(nav);
    });
  };

  /* ---- smooth scroll for in-page anchors ---- */
  document.addEventListener("click", function(e){
    var a=e.target.closest && e.target.closest('a[href^="#"]');
    if(!a) return;
    var id=a.getAttribute("href").slice(1), el=id&&document.getElementById(id);
    if(el){ e.preventDefault(); el.scrollIntoView({behavior:"smooth",block:"start"}); history.replaceState(null,"","#"+id); }
  });

  /* ---- lightbox (shared, event-delegated) ---- */
  var lb, lbImg, lbCap, lbCount, lbPrev, lbNext, lbClose, lbFig, items=[], cur=0;
  function ensureLightbox(){
    if(lb) return;
    lb=document.createElement("div"); lb.className="lightbox"; lb.setAttribute("aria-hidden","true");
    lb.innerHTML='<span class="lb-count"></span><button class="lb-close" aria-label="Close">×</button>'+
      '<button class="lb-nav lb-prev" aria-label="Previous image">‹</button>'+
      '<figure class="lb-figure"><img alt=""><figcaption class="lb-cap"></figcaption></figure>'+
      '<button class="lb-nav lb-next" aria-label="Next image">›</button>';
    document.body.appendChild(lb);
    lbImg=lb.querySelector("img"); lbCap=lb.querySelector(".lb-cap"); lbCount=lb.querySelector(".lb-count");
    lbPrev=lb.querySelector(".lb-prev"); lbNext=lb.querySelector(".lb-next"); lbClose=lb.querySelector(".lb-close");
    lbFig=lb.querySelector(".lb-figure");
    lb.addEventListener("click", close);
    lbFig.addEventListener("click", function(e){e.stopPropagation();});
    lbPrev.addEventListener("click", function(e){e.stopPropagation(); step(-1);});
    lbNext.addEventListener("click", function(e){e.stopPropagation(); step(1);});
    lbClose.addEventListener("click", function(e){e.stopPropagation(); close();});
  }
  function render(){
    var it=items[cur]; if(!it) return;
    lbImg.src=it.src; lbImg.alt=it.alt; lbCap.innerHTML=it.cap;
    lbCount.textContent=items.length>1?(cur+1)+" / "+items.length:"";
    lbPrev.hidden=lbNext.hidden=items.length<2;
  }
  function build(){
    items=[];
    [].forEach.call(document.querySelectorAll("figure.showcase"), function(fig){
      var im=fig.querySelector("img"), cap=fig.querySelector("figcaption");
      if(im && im.offsetParent!==null) items.push({src:im.currentSrc||im.src, alt:im.alt||"", cap:cap?cap.innerHTML:""});
    });
  }
  function openAt(src){
    ensureLightbox(); build();
    cur=Math.max(0, items.findIndex(function(x){return x.src===src;}));
    render(); lb.classList.add("open"); lb.setAttribute("aria-hidden","false");
  }
  function step(d){ if(items.length) { cur=(cur+d+items.length)%items.length; render(); } }
  function close(){ if(lb){ lb.classList.remove("open"); lb.setAttribute("aria-hidden","true"); lbImg.removeAttribute("src"); } }

  document.addEventListener("click", function(e){
    var im=e.target.closest && e.target.closest("figure.showcase img");
    if(im) openAt(im.currentSrc||im.src);
  });
  document.addEventListener("keydown", function(e){
    if(!lb||!lb.classList.contains("open")) return;
    if(e.key==="Escape") close(); else if(e.key==="ArrowLeft") step(-1); else if(e.key==="ArrowRight") step(1);
  });
})();

/* doc-carousel — horizontal scroll-snap strip of doc-showcase; integrates with the shared lightbox */
(function(){
  customElements.define("doc-carousel", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var slides=[].slice.call(this.children);
      var track=document.createElement("div"); track.className="carousel-track";
      slides.forEach(function(s){var d=document.createElement("div");d.className="carousel-slide";d.appendChild(s);track.appendChild(d);});
      var nav=document.createElement("div"); nav.className="carousel-nav";
      nav.innerHTML='<button class="cr-prev" aria-label="Previous screen">‹</button><span class="cr-count"></span><button class="cr-next" aria-label="Next screen">›</button>';
      this.appendChild(track); this.appendChild(nav);
      var count=nav.querySelector(".cr-count"),prev=nav.querySelector(".cr-prev"),next=nav.querySelector(".cr-next"),n=slides.length,i=0;
      function upd(){count.textContent=(i+1)+" / "+n;prev.disabled=i<=0;next.disabled=i>=n-1;}
      function go(x){i=Math.max(0,Math.min(n-1,x));track.scrollTo({left:track.clientWidth*i,behavior:"smooth"});upd();}
      prev.addEventListener("click",function(){go(i-1);});
      next.addEventListener("click",function(){go(i+1);});
      var t;track.addEventListener("scroll",function(){clearTimeout(t);t=setTimeout(function(){i=Math.round(track.scrollLeft/track.clientWidth);upd();},90);});
      upd();
    }
  });
})();

/* Site side nav — collapsible drawer, injected on every content page that loads this file.
   Single source of truth for the page list; mirrors the homepage grouping. Root-absolute
   links so it works from any folder depth. Edit SITE here when adding or moving a page. */
(function(){
  var SITE=[
    {label:"Foundations", pages:[
      {t:"Principles", href:"/docs/foundations/principles.html"},
      {t:"Color", href:"/docs/foundations/color.html"},
      {t:"Spacing", href:"/docs/foundations/spacing.html"},
      {t:"Elevation", href:"/docs/foundations/elevation.html"},
      {t:"Typography", href:"/docs/foundations/typography.html"}
    ]},
    {label:"Design Decisions", pages:[
      {t:"Tab contrast — candidate record", href:"/docs/tab-contrast.html"},
      {t:"Form pages — design decisions", href:"/docs/form-pages-design-decisions.html"}
    ]},
    {label:"Resources", pages:[
      {t:"Resources", href:"/docs/resources.html"}
    ]}
  ];
  var e=function(s){return (s==null?"":String(s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");};
  function here(href){
    var p=location.pathname;
    return p===href || p.replace(/index\.html$/,"")===href.replace(/index\.html$/,"") || p.split("/").pop()===href.split("/").pop();
  }
  function store(open){ try{ localStorage.setItem("sn-open", open?"1":"0"); }catch(_){} }
  function restored(){ try{ return localStorage.getItem("sn-open")==="1"; }catch(_){ return false; } }

  function build(){
    if(document.querySelector(".sn-drawer")) return;
    var toggle=document.createElement("button");
    toggle.className="sn-toggle"; toggle.setAttribute("aria-label","Open navigation"); toggle.setAttribute("aria-expanded","false");
    toggle.innerHTML='<span class="sn-bars"><span></span><span></span><span></span></span>Pages';

    var scrim=document.createElement("div"); scrim.className="sn-scrim";

    var drawer=document.createElement("nav"); drawer.className="sn-drawer"; drawer.setAttribute("aria-label","Documentation");
    var html='<div class="sn-head"><a class="sn-home" href="/index.html">Design documentation</a>'+
             '<button class="sn-close" aria-label="Close navigation">&times;</button></div>';
    SITE.forEach(function(g){
      html+='<div class="sn-group">'+e(g.label)+'</div>';
      g.pages.forEach(function(pg){
        html+='<a class="sn-link'+(here(pg.href)?" is-here":"")+'" href="'+e(pg.href)+'">'+e(pg.t)+'</a>';
      });
    });
    drawer.innerHTML=html;

    document.body.appendChild(toggle);
    document.body.appendChild(scrim);
    document.body.appendChild(drawer);

    function open(){ document.body.classList.add("sn-open"); toggle.setAttribute("aria-expanded","true"); store(true); }
    function close(){ document.body.classList.remove("sn-open"); toggle.setAttribute("aria-expanded","false"); store(false); }
    toggle.addEventListener("click", open);
    scrim.addEventListener("click", close);
    drawer.querySelector(".sn-close").addEventListener("click", close);
    document.addEventListener("keydown", function(ev){ if(ev.key==="Escape" && document.body.classList.contains("sn-open")) close(); });
    if(restored()) open();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
