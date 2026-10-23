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

  // <doc-showcase src="images/x.png" alt="…" caption="Current state" href="figma-url" live="/examples/… or /prototypes/…" ph="export as images/x.png"></doc-showcase>
  // href = the Figma frame; live = the live example or HTML prototype it shows ("Open live preview").
  customElements.define("doc-showcase", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var src=attr(this,"src")||"", alt=attr(this,"alt")||"", cap=attr(this,"caption")||"",
          href=attr(this,"href")||"", live=attr(this,"live")||"", ph=attr(this,"ph")||"";
      var img='<img src="'+esc(src)+'" alt="'+esc(alt)+'"'+
        (ph?' onload="this.previousElementSibling.style.display=\'none\'"':'')+
        ' onerror="this.style.display=\'none\'">';
      var links=[];
      if(href) links.push('<a href="'+esc(href)+'" target="_blank" rel="noopener">Open frame in Figma ↗</a>');
      if(live) links.push('<a href="'+esc(live)+'" target="_blank" rel="noopener">Open live preview ↗</a>');
      var caption= cap||links.length ? '<figcaption>'+esc(cap)+(cap&&links.length?' · ':'')+links.join(' · ')+'</figcaption>' : '';
      this.innerHTML='<figure class="showcase">'+(ph?'<div class="ph">'+esc(ph)+'</div>':'')+img+caption+'</figure>';
    }
  });

  // Live component from the ats-ui showcase (built into /examples/ — see repo README).
  // <doc-example src="button?theme=primary&label=Save" caption="Primary states" height="120"></doc-example>
  // The embedded page reports its height, so `height` is only the initial size.
  // viewport="1440": render a whole screen at that width and scale it down to fit the column
  // (full-page layouts), with `height` as the screen height at that width.
  // figma="url": adds an "Open in Figma" link next to "Open live example".
  // Numbered markers on parts of the example (tooltip on hover/focus, click jumps to href):
  //   <doc-example src="…"><doc-marker n="2" for=".css-selector-inside-the-example" href="#part-2">Identity</doc-marker></doc-example>
  // A marker is hidden while its element isn't rendered (e.g. a selection bar with nothing selected).
  customElements.define("doc-example", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var src=attr(this,"src")||"", cap=attr(this,"caption")||"", h=attr(this,"height")||"120", vw=parseInt(attr(this,"viewport")||"",10),
          figma=attr(this,"figma")||"";
      var marks=[].slice.call(this.querySelectorAll("doc-marker")).map(function(m){
        return {n:attr(m,"n")||"", sel:attr(m,"for")||"", href:attr(m,"href")||"", tip:m.textContent.replace(/\s+/g," ").trim()};
      });
      var frame='<iframe src="/examples/'+esc(src)+'" title="'+esc(cap||"Live example")+'"'+
        ' loading="lazy" style="height:'+esc(h)+'px'+(vw?';width:'+vw+'px;transform-origin:0 0':'')+'"></iframe>';
      this.innerHTML='<figure class="showcase example'+(vw?' example--viewport':'')+'">'+(vw?'<div class="example__viewport">'+frame+'</div>':frame)+
        '<figcaption>'+(cap?esc(cap)+' · ':'')+'<a href="/examples/'+esc(src)+'" target="_blank" rel="noopener">Open live example ↗</a>'+
        (figma?' · <a href="'+esc(figma)+'" target="_blank" rel="noopener">Open in Figma ↗</a>':'')+'</figcaption></figure>';
      if(marks.length) markExample(this.querySelector("figure"), marks);
      if(vw){
        var box=this.querySelector(".example__viewport"), ifr=box.querySelector("iframe");
        var fit=function(){ var s=box.clientWidth/vw; ifr.style.transform="scale("+s+")"; box.style.height=(parseFloat(ifr.style.height)*s)+"px"; };
        ifr._fit=fit; fit(); if(window.ResizeObserver) new ResizeObserver(fit).observe(box); window.addEventListener("resize",fit);
      }
    }
  });
  // A standalone HTML prototype (not a showcase route), embedded at a fixed screen size and
  // scaled to the column. src is a site path, e.g. /prototypes/amplify-tab/index.html?embed=1&page=scheduled
  // <doc-prototype src="…" caption="…" viewport="1440" height="900" full="/prototypes/amplify-tab/index.html" figma="figma-url"></doc-prototype>
  // figma="url": adds an "Open in Figma" link to the frame or sample page this view matches.
  customElements.define("doc-prototype", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var src=attr(this,"src")||"", cap=attr(this,"caption")||"", vw=parseInt(attr(this,"viewport")||"1440",10),
          h=parseInt(attr(this,"height")||"900",10), full=attr(this,"full")||src.split("?")[0], figma=attr(this,"figma")||"";
      this.innerHTML='<figure class="showcase example example--viewport"><div class="example__viewport">'+
        '<iframe src="'+esc(src)+'" title="'+esc(cap||"Prototype")+'" loading="lazy" style="height:'+h+'px;width:'+vw+'px;transform-origin:0 0"></iframe></div>'+
        '<figcaption>'+(cap?esc(cap)+' · ':'')+'<a href="'+esc(src)+'" target="_blank" rel="noopener">Open this view ↗</a> · '+
        '<a href="'+esc(full)+'" target="_blank" rel="noopener">Open full prototype ↗</a>'+
        (figma?' · <a href="'+esc(figma)+'" target="_blank" rel="noopener">Open in Figma ↗</a>':'')+'</figcaption></figure>';
      var box=this.querySelector(".example__viewport"), ifr=box.querySelector("iframe");
      var fit=function(){ var s=box.clientWidth/vw; ifr.style.transform="scale("+s+")"; box.style.height=(h*s)+"px"; };
      fit(); if(window.ResizeObserver) new ResizeObserver(fit).observe(box); window.addEventListener("resize",fit);
    }
  });

  // Tabs between alternative views (e.g. several live examples of one pattern).
  // <doc-tabs label="Reply examples"><doc-tab label="Data table">…</doc-tab><doc-tab label="…">…</doc-tab></doc-tabs>
  // Panels stay in place (only hidden), so their live examples don't reload.
  var tabsSeq=0;
  customElements.define("doc-tabs", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var self=this, uid="doctabs"+(++tabsSeq), panels=[].slice.call(this.children).filter(function(c){return c.tagName==="DOC-TAB";});
      var list=document.createElement("div"); list.className="doc-tabs__list"; list.setAttribute("role","tablist");
      if(attr(this,"label")) list.setAttribute("aria-label", attr(this,"label"));
      var tabs=panels.map(function(p,i){
        var b=document.createElement("button"); b.type="button"; b.className="doc-tabs__tab"; b.setAttribute("role","tab");
        b.id=uid+"-tab-"+i; b.textContent=attr(p,"label")||("Tab "+(i+1));
        p.id=p.id||uid+"-panel-"+i; p.setAttribute("role","tabpanel"); p.setAttribute("aria-labelledby", b.id); p.tabIndex=0;
        b.setAttribute("aria-controls", p.id);
        b.addEventListener("click",function(){ select(i, false); });
        list.appendChild(b); return b;
      });
      function select(i, focus){
        tabs.forEach(function(b,j){ var on=j===i; b.setAttribute("aria-selected", on?"true":"false"); b.tabIndex=on?0:-1; panels[j].hidden=!on; });
        if(focus) tabs[i].focus();
        // An example that loaded while hidden measured itself at 0 tall: re-measure it now (same-origin).
        setTimeout(function(){
          [].forEach.call(panels[i].querySelectorAll("figure.example iframe"),function(f){
            if(f._fit) return; try{ var b=f.contentDocument&&f.contentDocument.body; if(b&&b.getBoundingClientRect().height) f.style.height=Math.ceil(b.getBoundingClientRect().height)+"px"; }catch(_){}
          });
          window.dispatchEvent(new Event("resize")); // markers re-place
        },0);
      }
      list.addEventListener("keydown",function(e){
        var i=tabs.indexOf(document.activeElement); if(i<0) return;
        var n={ArrowRight:i+1, ArrowLeft:i-1, Home:0, End:tabs.length-1}[e.key];
        if(n==null) return; e.preventDefault(); select((n+tabs.length)%tabs.length, true);
      });
      this.insertBefore(list, this.firstChild);
      select(0, false);
    }
  });
  // Code sample. Write the code HTML-escaped (&lt; &gt;); indentation is normalized.
  // <doc-code caption="Angular">&lt;button ats-button theme="primary"&gt;Save&lt;/button&gt;</doc-code>
  customElements.define("doc-code", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var cap=attr(this,"caption")||"", lines=this.textContent.replace(/^\n+|\s+$/g,"").split("\n");
      var indent=Math.min.apply(null,lines.filter(function(l){return l.trim();}).map(function(l){return l.match(/^\s*/)[0].length;}));
      var code=lines.map(function(l){return l.slice(indent);}).join("\n");
      this.innerHTML='<figure class="code">'+(cap?'<figcaption>'+esc(cap)+'</figcaption>':'')+'<pre><code>'+esc(code)+'</code></pre></figure>';
    }
  });
  // Places doc-marker dots just left of their element inside a same-origin example iframe.
  // Uses setTimeout rather than rAF: the preview tab is often hidden, where rAF doesn't fire.
  function markExample(fig, marks){
    var ifr=fig.querySelector("iframe"), layer=document.createElement("div");
    layer.className="example__marks";
    marks.forEach(function(m){
      var a=document.createElement("a"); a.className="example__mark"; a.href=m.href; a.hidden=true;
      a.setAttribute("aria-label", m.n+". "+m.tip); a.dataset.tip=m.tip; a.textContent=m.n;
      a.addEventListener("click",function(){
        var t=m.href.charAt(0)==="#"&&document.getElementById(m.href.slice(1));
        if(t){ t.classList.add("is-flash"); setTimeout(function(){t.classList.remove("is-flash");},1600); }
      });
      m.el=a; layer.appendChild(a);
    });
    fig.classList.add("example--marked"); fig.insertBefore(layer, fig.querySelector("figcaption"));
    var pending=false;
    function place(){
      pending=false;
      var doc; try{ doc=ifr.contentDocument; }catch(_){ return; }
      if(!doc||!doc.body) return;
      var fr=fig.getBoundingClientRect(), ir=ifr.getBoundingClientRect(), s=ir.width/(ifr.offsetWidth||ir.width||1);
      layer.style.top=(ir.top-fr.top)+"px"; layer.style.height=ir.height+"px";
      marks.forEach(function(m){
        var t=m.sel&&doc.querySelector(m.sel), r=t&&t.getBoundingClientRect();
        if(!r||(!r.width&&!r.height)){ m.el.hidden=true; return; }
        m.el.hidden=false;
        m.el.style.left=Math.max(2, (ir.left-fr.left)+r.left*s-22)+"px";
        m.el.style.top=Math.max(0, r.top*s+Math.min(r.height*s,20)/2-9)+"px";
      });
    }
    function schedule(){ if(!pending){ pending=true; setTimeout(place,30); } }
    function hook(){
      var doc; try{ doc=ifr.contentDocument; }catch(_){ return; }
      if(!doc||!doc.body) return;
      new MutationObserver(schedule).observe(doc.body,{subtree:true,childList:true,attributes:true});
      var RO=ifr.contentWindow&&ifr.contentWindow.ResizeObserver;
      if(RO) new RO(schedule).observe(doc.documentElement);
      for(var i=1;i<=6;i++) setTimeout(place, i*400); // Angular renders after load
    }
    ifr.addEventListener("load", hook); if(ifr.contentDocument&&ifr.contentDocument.readyState==="complete") hook();
    if(window.ResizeObserver) new ResizeObserver(schedule).observe(fig);
    window.addEventListener("resize", schedule);
  }
  window.addEventListener("message",function(e){
    var d=e.data; if(!d||d.type!=="ats-example-height")return;
    var frames=document.querySelectorAll("figure.example iframe");
    for(var i=0;i<frames.length;i++){ if(frames[i].contentWindow===e.source){
      if(frames[i]._fit) return; // viewport examples keep their fixed screen height
      frames[i].style.height=Math.ceil(d.height)+"px"; } }
  });

  /* ---- structure ---- */

  // <doc-section id="problem" label="The problem" desc="What prompted this">…</doc-section>
  customElements.define("doc-section", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var label=attr(this,"label");
      if(label){ var h=document.createElement("h2"); h.textContent=label;
        // optional badge="…": a small status pill after the heading (yellow; badge-tone="success" = green)
        var badge=attr(this,"badge"); if(badge){ var b=document.createElement("span"); b.className="status-pill status-pill--sm"+(attr(this,"badge-tone")==="success"?" status-pill--success":""); b.textContent=badge; h.appendChild(b); }
        this.insertBefore(h,this.firstChild); }
    }
  });

  // <doc-page eyebrow="Component" title="Button">…doc-section…</doc-page>
  customElements.define("doc-page", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var eyebrow=attr(this,"eyebrow"), title=attr(this,"title"), meta=attr(this,"meta"), intro=attr(this,"intro"), status=attr(this,"status");
      // "On this page" rail sits on the right of any page with more than one section.
      var hasRail=this.querySelectorAll("doc-section[id]").length>1;
      var kids=[]; while(this.firstChild) kids.push(this.removeChild(this.firstChild));

      var shell=document.createElement("div"); shell.className="shell"+(hasRail?" has-rail":"");
      var main=document.createElement("main"); main.className="page"+(hasRail?"":" narrow"); main.id="content";
      if(eyebrow||title||meta||intro){
        var header=document.createElement("header"); header.className="page-head";
        header.innerHTML=(eyebrow?'<p class="eyebrow">'+esc(eyebrow)+'</p>':'')+
          (status?'<p class="status-pill" data-status="'+esc(status.toLowerCase().replace(/\s+/g,"-"))+'">'+esc(status)+'</p>':'')+
          (title?'<h1>'+esc(title)+'</h1>':'')+(intro?'<p class="lead intro">'+esc(intro)+'</p>':'')+(meta?'<p class="meta">'+esc(meta)+'</p>':'');
        main.appendChild(header);
      }
      kids.forEach(function(k){ main.appendChild(k); });
      shell.appendChild(main);
      var rail=null;
      if(hasRail){
        rail=document.createElement("nav"); rail.className="rail"; rail.setAttribute("aria-label","On this page");
        rail.innerHTML='<p class="eyebrow">On this page</p><ol></ol>';
        shell.appendChild(rail);
      }
      this.appendChild(shell);

      requestAnimationFrame(function(){ if(window.__docsBuildNav) window.__docsBuildNav(main, rail); });
    }
  });

  /* ---- rail + next/back ---- */
  window.__docsBuildNav=function(main, rail){
    var secs=[].slice.call(main.querySelectorAll("doc-section[id]"));
    var items=secs.map(function(s){return {id:s.id,label:s.getAttribute("label")||s.id,desc:s.getAttribute("desc")||"",done:s.getAttribute("badge")==="Done"?"Done":""};});

    if(rail){
      var ol=rail.querySelector("ol"), links={};
      items.forEach(function(it){
        var li=document.createElement("li"), a=document.createElement("a");
        a.href="#"+it.id; a.dataset.id=it.id;
        a.innerHTML='<span class="t">'+esc(it.label)+(it.done?' <span class="status-pill status-pill--sm status-pill--success">'+esc(it.done)+'</span>':'')+'</span>'+(it.desc?'<span class="d">'+esc(it.desc)+'</span>':'');
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

/* Site chrome — header (logo, nav toggle, search), push side nav, section overview cards.
   SITE is the single source of truth for the page list: the side nav, the section overview
   pages, the home page cards and search are all built from it. Root-absolute links so it
   works from any folder depth. Edit SITE when adding or moving a page (t = title, d = card text). */
(function(){
  var SITE=[
    {label:"Foundations", href:"/docs/foundations/index.html",
     d:"Principles and the token foundations: color, spacing, elevation and typography.", pages:[
      {t:"Principles", href:"/docs/foundations/principles.html", d:"Why the redesign happened, the clean / modern / consistent principles, and how to use the system."},
      {t:"Color", href:"/docs/foundations/color.html", d:"Neutral scale, status families, entity accents, the Amplify gradient, and semantic tokens."},
      {t:"Spacing", href:"/docs/foundations/spacing.html", d:"The 8-based scale and the padding, gap, and layout tokens."},
      {t:"Elevation", href:"/docs/foundations/elevation.html", d:"Diffuse elevation levels, radius, and border-width."},
      {t:"Typography", href:"/docs/foundations/typography.html", d:"Inter, role-based text styles, and the role-bound weight system."}
    ]},
    {label:"Components", href:"/docs/components/index.html",
     d:"The ats-ui components, each with live examples of the built component.", pages:[
      {t:"Bowling Alley", href:"/docs/components/bowling-alley.html", d:"The main navigation: nav states, Fast Find, and the Menu, Add, Help and user overlays."},
      {t:"Breadcrumb", href:"/docs/components/breadcrumb.html", d:"Where you are inside a page area: a root link, a separator and the current page. Used in the Amplify header."},
      {t:"Button", href:"/docs/components/button.html", d:"Themes, sizes, states and colors, with live examples of the ats-ui component."},
      {t:"Button with count", href:"/docs/components/button-with-count.html", d:"A Button with a count badge pinned to its top-right corner: the Chats toggle in the Amplify header."},
      {t:"Card", href:"/docs/components/card.html", d:"Card frame, header actions, detail rows, resume and record-details bodies, with live examples."},
      {t:"Check List", href:"/docs/components/check-list.html", d:"Checkbox + label rows laid out inline or as a column, with a disabled option."},
      {t:"Checkbox", href:"/docs/components/checkbox.html", d:"Unchecked, checked and indeterminate, in every state, on a native checkbox."},
      {t:"Checkbox + label", href:"/docs/components/checkbox-label.html", d:"A checkbox with its label: every state, plus the gripper variant."},
      {t:"Count badge", href:"/docs/components/count-badge.html", d:"A small round count of new items for the corner of a control. Shows 99+ above 99."},
      {t:"Data Table", href:"/docs/components/data-table.html", d:"Sticky header, banded rows, sort and filter headers, with live examples of the ats-ui table."},
      {t:"Dropdown", href:"/docs/components/dropdown.html", d:"The ATS dropdown: panel, option groups and options, with keyboard support."},
      {t:"Icon", href:"/docs/components/icon.html", d:"The icon set, rendered in token colors."},
      {t:"Icon Button - no container", href:"/docs/components/icon-button-no-container.html", d:"The 24×24 icon-only button with no resting container: states and glyphs."},
      {t:"Icon Container", href:"/docs/components/icon-container.html", d:"The entity-colored square behind a glyph: ten themes in three sizes."},
      {t:"Menu", href:"/docs/components/menu.html", d:"The app Menu (with its Edit Menu), Add and user menus, and their parts: Menu Header, Menu Item, Menu Option, Menu Edit."},
      {t:"Novo Chip", href:"/docs/components/novo-chip.html", d:"The chip: default and link types, three sizes, five colors, hover and focus, with an optional remove button."},
      {t:"Novo List", href:"/docs/components/novo-list.html", d:"The record list, its four item variants and building blocks, with live examples."},
      {t:"Record Header", href:"/docs/components/record-header.html", d:"The record Overview header: toolbar, field summary and section tabs, with tab overflow into More."},
      {t:"Search Input", href:"/docs/components/search-input.html", d:"The search field: the Fast Find field and the Menu filter pill."},
      {t:"Sophia FAB", href:"/docs/components/sophia-fab.html", d:"The Sophia chatbot button: placement options A, B and C, drag-to-snap spots, and live examples."},
      {t:"Switch", href:"/docs/components/switch.html", d:"The on/off switch: on, off and disabled, with or without a label."},
      {t:"Workflow Stepper", href:"/docs/components/workflow-stepper.html", d:"The placement pipeline: complete, current and upcoming steps, with overflow scrolling."}
    ]},
    {label:"Patterns", href:"/docs/patterns/index.html",
     d:"How components come together into pages and flows across the ATS.", pages:[
      {t:"Entity Records", href:"/docs/patterns/entity-records.html", s:"In progress", d:"The record pages for each entity, starting with the shell candidate record."}
    ]},
    {label:"Amplify", href:"/docs/amplify/index.html",
     d:"Everything about Amplify UI in one place: foundations, components, patterns and resources.", pages:[
      {t:"About Amplify UI", href:"/docs/amplify/about.html", d:"What Amplify is, the principles for Amplify UI, and how the Amplify icon identifies Amplify features."},
      {t:"AI interaction guidelines", href:"/docs/amplify/ai-interaction-guidelines.html", d:"The design principles for AI software that Amplify follows, and what good looks like in practice."}
    ], groups:[
      {label:"Foundations", pages:[
        {t:"Color", href:"/docs/amplify/foundations/color.html", d:"The Amplify gradient and tints, and what they mean."},
        {t:"Surfaces and elevation", href:"/docs/amplify/foundations/surfaces-and-elevation.html", d:"Full page, docked and pop-over: when each surface is used, and the elevation it sits at."},
        {t:"Text styles", href:"/docs/amplify/foundations/text-styles.html", d:"Headings, lists, emphasis and entity links in Amplify replies."},
        {t:"Spacing and layout", href:"/docs/amplify/foundations/spacing-and-layout.html", d:"Spacing and column width in Amplify chat."},
        {t:"Voice and tone", href:"/docs/amplify/foundations/voice-and-tone.html", d:"How Amplify writes."}
      ]},
      {label:"Components", pages:[
        {t:"Amplify icon", href:"/docs/amplify/components/amplify-icon.html", cat:"Amplify indicators", d:"The Amplify icon: filled and line variants, sizes, color, and where it’s used."},
        {t:"Button (amplify)", href:"/docs/components/button.html#amplify", cat:"Amplify indicators", d:"The amplify color: AI actions powered by Amplify."},
        {t:"Icon Container (amplify)", href:"/docs/components/icon-container.html#amplify", cat:"Amplify indicators", d:"The amplify theme: the Amplify Radial gradient behind the amplify glyph."},
        {t:"Full-page chat", href:"/docs/amplify/components/amplify-chat-full-page.html", cat:"Surfaces", d:"The standalone chat and the shell for prototyping Amplify conversations."},
        {t:"Amplify header", href:"/docs/amplify/components/amplify-header.html", cat:"Surfaces", d:"The one-row header for the full-page Amplify tab: breadcrumb, Chats with its unread count, and Close."},
        {t:"Docked chat", href:"/docs/amplify/components/amplify-chat-docked.html", cat:"Surfaces", d:"The docked panel and pop-over window, and the shared conversation layout."},
        {t:"Chats panel", href:"/docs/amplify/components/amplify-chat-chats-panel.html", cat:"Surfaces", d:"The Amplify tab’s chat history: chat cards, Scheduled, history by time, and search."},
        {t:"User messages", href:"/docs/amplify/components/amplify-chat-user-messages.html", cat:"Conversation", d:"The recruiter’s message: the user bubble, long messages and tagged records."},
        {t:"Reply", href:"/docs/amplify/components/amplify-chat-reply.html", cat:"Conversation", d:"The full Amplify reply: identity, body, sources, follow-ups, controls and thinking state."},
        {t:"Text", href:"/docs/amplify/components/amplify-chat-text.html", cat:"Conversation", d:"Headings, paragraphs, inline record links, the status line and numbered lists in an Amplify reply."},
        {t:"Sources", href:"/docs/amplify/components/amplify-chat-sources.html", cat:"Conversation", d:"The sources row: what a reply was based on, expandable to the records."},
        {t:"Blocks", href:"/docs/amplify/components/amplify-chat-blocks.html", cat:"Response content", d:"Draft and literal value blocks: text Amplify writes for the recruiter to use or copy."},
        {t:"Data table", href:"/docs/amplify/components/amplify-chat-data-table.html", cat:"Response content", d:"Chat tables of records with selection, In Bullhorn status and Reveal links."},
        {t:"Cards", href:"/docs/amplify/components/amplify-chat-cards.html", cat:"Response content", d:"Record cards and Prospect contact cards, with selection and paging."},
        {t:"Relevance signals", href:"/docs/amplify/components/amplify-chat-relevance-signals.html", cat:"Response content", d:"Why Amplify picked a prospect: a label and one small chip per signal."},
        {t:"Selection", href:"/docs/amplify/components/amplify-chat-selection.html", cat:"Response content", d:"The selection bar and split button for bulk actions on records."},
        {t:"Chat input", href:"/docs/amplify/components/amplify-chat-input.html", cat:"Input", d:"The input, context bar, button row with Stop, and the full-page starting point."},
        {t:"Clarifying questions", href:"/docs/amplify/components/amplify-chat-clarifying-questions.html", cat:"Input", d:"The card Amplify uses to narrow a request: options, number keys, Something else."},
        {t:"Prompt library", href:"/docs/amplify/components/amplify-chat-prompt-library.html", cat:"Input", d:"Saved prompts opened from the chat input: prompt cards, tabs, search, and empty and loading states."}
      ]},
      {label:"Patterns", pages:[
        {t:"Response structure", href:"/docs/amplify/patterns/response-structure.html", d:"How an Amplify reply is put together, and how to choose a format for it."},
        {t:"Records and sources", href:"/docs/amplify/patterns/records-and-sources.html", d:"How records and sources appear in Amplify replies."},
        {t:"Status and loading", href:"/docs/amplify/patterns/status-and-loading.html", d:"Status lines and loading in Amplify chat."},
        {t:"Record actions in chat", href:"/docs/amplify/patterns/record-actions.html", d:"Acting on records from a chat reply, in the list and card variants."},
        {t:"Adding prospect contacts", href:"/docs/amplify/patterns/adding-prospect-contacts.html", d:"Adding Prospect contacts to Bullhorn from an Amplify reply."},
        {t:"Workflow examples", href:"/docs/amplify/patterns/workflow-examples.html", d:"Worked examples: prioritize open jobs, match candidates to a job, look up a company, build pipeline."},
        {t:"Amplify in the page layout", href:"/docs/amplify/patterns/amplify-in-layout.html", d:"Where Amplify sits in the ATS: the Amplify tab, the record header button, the right pane and pop-overs."}
      ]},
      {label:"Resources", pages:[
        {t:"Resources", href:"/docs/amplify/resources.html", d:"Amplify reference documents and Figma source files."},
        {t:"Background and open questions", href:"/docs/amplify/background.html", d:"Open questions, the research summary and the current state analysis."}
      ]}
    ]},
    {label:"Design Decisions", href:"/docs/design-decisions.html",
     d:"Options compared and the decisions taken, with the reasoning behind them.", pages:[
      {t:"Tab contrast — candidate record", href:"/docs/tab-contrast.html", d:"Contrast options for the record tab bar, compared."},
      {t:"Form pages — design decisions", href:"/docs/form-pages-design-decisions.html", d:"Current states, guidelines, analysis, proposed changes, and the new designs."},
      {t:"Amplify tab: scheduled prompts, navigation and chats", href:"/docs/amplify-tab-design-decisions.html", s:"In progress", d:"Scheduled prompts (AMP-922), the new Amplify header and menu, the Chats panel, and an agent-driven homepage concept."},
      {t:"Amplify chat and the candidate preview", href:"/docs/amplify-preview-design-decisions.html", s:"Complete", d:"The preview slideout covers the docked chat. Three options compared; Option 2 (a popover next to the row) is recommended."},
      {t:"Ace", href:"/docs/ace-design-decisions.html", s:"In progress", d:"An agent-driven Amplify Home: to-dos, suggestions, need to know and today’s meetings."}
    ]},
    {label:"Demos", href:"/docs/demos/index.html",
     d:"Images and small prototypes for marketing to use in decks, videos and events.", pages:[
      {t:"VFI Engage London 2026", href:"/docs/demos/vfi-engage-london-2026.html", s:"In progress", d:"Fourteen scenes of the Advisor day, from the Ace homepage through placement and audit."}
    ]},
    {label:"Contributing", href:"/docs/contributing.html", d:"Setup, rules, the component workflow and how review works."},
    {label:"Resources", href:"/docs/resources.html", d:"Reference documents and Figma source files for the design system."}
  ];
  var e=function(s){return (s==null?"":String(s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");};
  // Page status (SITE `s`, e.g. "In progress"): a small pill on the nav link and the card.
  var pill=function(pg){ return pg.s?'<span class="status-pill status-pill--sm" data-status="'+e(pg.s.toLowerCase().replace(/\s+/g,"-"))+'">'+e(pg.s)+'</span>':''; };
  // Match on the whole path: the same file names live in several folders (index.html,
  // color.html, resources.html). Opened from disk (file://) the root differs, so there the
  // path is compared by its trailing segments instead.
  var norm=function(p){return p.replace(/index\.html$/,"").replace(/\.html$/,"");};
  function here(href){
    if(href.indexOf("#")>-1) return false; // links into another page's section
    var p=norm(location.pathname), h=norm(href);
    return location.protocol==="file:" ? p.slice(-h.length)===h : p===h;
  }
  function pagesOf(g){ var out=(g.pages||[]).slice(); (g.groups||[]).forEach(function(sg){ out=out.concat(sg.pages); }); return out; }
  function holds(g){ return here(g.href) || pagesOf(g).some(function(pg){return here(pg.href);}); }

  // Card grid: rows three cards wide; fewer than three cards stretch to fill the row.
  function cards(list){
    return '<div class="cards cards--'+Math.min(3,list.length)+'">'+list.map(function(pg){
      return '<a class="doc card-link" href="'+e(pg.href)+'"><span class="title">'+e(pg.t)+'</span>'+pill(pg)+
        (pg.d?'<span class="desc">'+e(pg.d)+'</span>':'')+'</a>';
    }).join("")+'</div>';
  }
  // A group whose pages carry `cat` is split into sub-headed rows, one per cat, in SITE order.
  function groupCards(list){
    if(!list.some(function(pg){return pg.cat;})) return cards(list);
    var order=[], by={};
    list.forEach(function(pg){ var c=pg.cat||""; if(!by[c]){ by[c]=[]; order.push(c); } by[c].push(pg); });
    return order.map(function(c){ return (c?'<h4 class="cards-sublabel">'+e(c)+'</h4>':'')+cards(by[c]); }).join("");
  }
  function sectionCards(g){
    var html=g.pages&&g.pages.length?cards(g.pages):"";
    (g.groups||[]).forEach(function(sg){ html+='<h3 class="cards-label">'+e(sg.label)+'</h3>'+groupCards(sg.pages); });
    return html;
  }

  // <doc-overview section="Foundations"></doc-overview> — that section's pages as cards.
  // <doc-overview></doc-overview> — every section (the home page), each headed by a link to its overview.
  customElements.define("doc-overview", class extends HTMLElement{
    connectedCallback(){
      if(this._done)return; this._done=true;
      var name=this.getAttribute("section");
      if(name){ var g=SITE.filter(function(x){return x.label===name;})[0]; this.innerHTML=g?sectionCards(g):""; return; }
      this.innerHTML=SITE.map(function(g){
        return '<section class="ov-group"><h2><a href="'+e(g.href)+'">'+e(g.label)+'</a></h2>'+
          (g.pages?'<p class="lead">'+e(g.d)+'</p>'+sectionCards(g):cards([{t:g.label,href:g.href,d:g.d}]))+'</section>';
      }).join("");
    }
  });

  function get(k){ try{ return localStorage.getItem(k); }catch(_){ return null; } }
  function set(k,v){ try{ localStorage.setItem(k,v); }catch(_){} }
  var wide=window.matchMedia("(min-width: 1024px)");
  var CHEV='<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function link(pg, cls){
    var on=here(pg.href);
    return '<a class="sn-link'+(cls?" "+cls:"")+(on?" is-here":"")+'" href="'+e(pg.href)+'"'+(on?' aria-current="page"':'')+'>'+e(pg.t)+pill(pg)+'</a>';
  }
  function collapsible(key, open, headHtml, bodyHtml, cls){
    return '<div class="'+cls+(open?" is-open":"")+'" data-key="'+e(key)+'">'+headHtml.replace("{exp}",open?"true":"false")+
      '<div class="'+cls+'-body">'+bodyHtml+'</div></div>';
  }
  function navHtml(){
    return SITE.map(function(g){
      var on=here(g.href), cur=' aria-current="page"';
      var head='<a class="sn-sec-link'+(on?" is-here":"")+'" href="'+e(g.href)+'"'+(on?cur:'')+'>'+e(g.label)+'</a>';
      if(!g.pages) return '<div class="sn-sec sn-sec--leaf">'+'<div class="sn-sec-head">'+head+'</div></div>';
      var key="sn-sec:"+g.label, open=holds(g)||get(key)==="1";
      var body=g.pages.map(function(pg){return link(pg);}).join("");
      (g.groups||[]).forEach(function(sg){
        var sk=key+"/"+sg.label, sopen=sg.pages.some(function(pg){return here(pg.href);})||get(sk)==="1";
        body+=collapsible(sk, sopen,
          '<button class="sn-sub-head" type="button" aria-expanded="{exp}">'+CHEV+'<span>'+e(sg.label)+'</span></button>',
          sg.pages.map(function(pg){return link(pg,"sn-sublink");}).join(""), "sn-sub");
      });
      return collapsible(key, open,
        '<div class="sn-sec-head">'+head+'<button class="sn-caret" type="button" aria-expanded="{exp}" aria-label="Show or hide '+e(g.label)+' pages">'+CHEV+'</button></div>',
        body, "sn-sec");
    }).join("");
  }
  function headerHtml(){
    return '<button class="sh-toggle" type="button" aria-controls="site-nav" aria-label="Toggle navigation">'+
        '<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>'+
      '<a class="sh-logo" href="/index.html" aria-label="Design documentation home">'+
        '<svg class="sh-mark" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><rect x="2" y="2" width="9" height="9" rx="2.5" fill="#296cc3"/><rect x="13" y="2" width="9" height="9" rx="2.5" fill="#76a9ed"/><rect x="2" y="13" width="9" height="9" rx="2.5" fill="#76a9ed"/><rect x="13" y="13" width="9" height="9" rx="4.5" fill="#1450a0"/></svg>'+
        '<span class="sh-name">Modern UI</span><span class="sh-sub">Design documentation</span></a>'+
      '<div class="sh-search" role="search">'+
        '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="7" cy="7" r="4.75" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'+
        '<input type="search" placeholder="Search documentation" aria-label="Search documentation" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="sh-results">'+
        '<kbd>/</kbd><div class="sh-results" id="sh-results" role="listbox" hidden></div></div>';
  }

  // Search: page titles and card text from SITE, plus each page's section headings
  // (fetched once, the first time the search field is focused).
  var INDEX=[], sectionsLoaded=false;
  SITE.forEach(function(g){
    INDEX.push({t:g.label, c:"Overview", d:g.d, href:g.href, w:3});
    (g.pages||[]).forEach(function(pg){ INDEX.push({t:pg.t, c:g.label, d:pg.d, href:pg.href, w:2}); });
    (g.groups||[]).forEach(function(sg){ sg.pages.forEach(function(pg){ INDEX.push({t:pg.t, c:g.label+" › "+sg.label, d:pg.d, href:pg.href, w:2}); }); });
  });
  function loadSections(){
    if(sectionsLoaded) return; sectionsLoaded=true;
    INDEX.filter(function(it){return it.w===2 && it.href.indexOf("#")<0;}).forEach(function(it){
      fetch(it.href).then(function(r){return r.ok?r.text():"";}).then(function(html){
        var doc=new DOMParser().parseFromString(html,"text/html");
        [].forEach.call(doc.querySelectorAll("doc-section[id][label]"), function(s){
          INDEX.push({t:s.getAttribute("label"), c:it.t, d:s.getAttribute("desc")||"", href:it.href+"#"+s.id, w:1});
        });
      }).catch(function(){});
    });
  }
  function search(q){
    var terms=q.toLowerCase().split(/\s+/).filter(Boolean); if(!terms.length) return [];
    return INDEX.map(function(it){
      var t=it.t.toLowerCase(), hay=t+" "+it.c.toLowerCase()+" "+(it.d||"").toLowerCase();
      if(!terms.every(function(x){return hay.indexOf(x)>-1;})) return null;
      var s=it.w + (t.indexOf(terms[0])===0?4:0) + (terms.every(function(x){return t.indexOf(x)>-1;})?2:0);
      return {it:it, s:s};
    }).filter(Boolean).sort(function(a,b){return b.s-a.s;}).slice(0,10).map(function(r){return r.it;});
  }
  function wireSearch(box){
    var input=box.querySelector("input"), list=box.querySelector(".sh-results"), sel=-1, res=[];
    function show(){
      res=search(input.value); sel=res.length?0:-1;
      list.innerHTML=res.length?res.map(function(it,i){
        return '<a class="sh-result'+(i===sel?" is-sel":"")+'" role="option" id="shr-'+i+'" href="'+e(it.href)+'">'+
          '<span class="r-t">'+e(it.t)+'</span><span class="r-c">'+e(it.c)+'</span></a>';
      }).join(""):(input.value.trim()?'<p class="sh-empty">No results</p>':"");
      list.hidden=!input.value.trim(); input.setAttribute("aria-expanded",String(!list.hidden));
    }
    function move(d){
      if(!res.length) return; sel=(sel+d+res.length)%res.length;
      [].forEach.call(list.children,function(a,i){a.classList.toggle("is-sel",i===sel);});
      input.setAttribute("aria-activedescendant","shr-"+sel); list.children[sel].scrollIntoView({block:"nearest"});
    }
    input.addEventListener("focus", function(){ loadSections(); if(input.value.trim()) show(); });
    input.addEventListener("input", show);
    input.addEventListener("keydown", function(ev){
      if(ev.key==="ArrowDown"){ ev.preventDefault(); move(1); }
      else if(ev.key==="ArrowUp"){ ev.preventDefault(); move(-1); }
      else if(ev.key==="Enter" && res[sel]){ ev.preventDefault(); location.href=res[sel].href; }
      else if(ev.key==="Escape"){ list.hidden=true; input.blur(); }
    });
    document.addEventListener("click", function(ev){ if(!box.contains(ev.target)) list.hidden=true; });
    document.addEventListener("keydown", function(ev){
      var tag=(document.activeElement&&document.activeElement.tagName)||"";
      if(ev.key==="/" && !/INPUT|TEXTAREA|SELECT/.test(tag)){ ev.preventDefault(); input.focus(); }
    });
  }

  function build(){
    if(document.querySelector(".site-header")) return;
    var body=document.body; body.classList.add("has-chrome");
    var header=document.createElement("header"); header.className="site-header"; header.innerHTML=headerHtml();
    var nav=document.createElement("nav"); nav.className="site-nav"; nav.id="site-nav"; nav.setAttribute("aria-label","Documentation"); nav.innerHTML=navHtml();
    var scrim=document.createElement("div"); scrim.className="sn-scrim";
    body.insertBefore(scrim, body.firstChild); body.insertBefore(nav, body.firstChild); body.insertBefore(header, body.firstChild);

    // Wide screens: the nav pushes the page over and stays open until closed (remembered).
    // Narrow screens: it slides over the page with a scrim and closes after use.
    var toggle=header.querySelector(".sh-toggle");
    function apply(open){ body.classList.toggle("sn-open",open); toggle.setAttribute("aria-expanded",String(open)); }
    function initial(){ return wide.matches ? get("sn-open")!=="0" : false; }
    apply(initial());
    toggle.addEventListener("click", function(){ var open=!body.classList.contains("sn-open"); apply(open); if(wide.matches) set("sn-open",open?"1":"0"); });
    scrim.addEventListener("click", function(){ apply(false); });
    wide.addEventListener("change", function(){ apply(initial()); });
    document.addEventListener("keydown", function(ev){ if(ev.key==="Escape" && !wide.matches && body.classList.contains("sn-open")) apply(false); });
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ body.classList.add("sn-ready"); }); });

    // Collapsible sections and sub-groups
    nav.addEventListener("click", function(ev){
      var btn=ev.target.closest(".sn-caret,.sn-sub-head"); if(!btn) return;
      var box=btn.closest("[data-key]"), open=!box.classList.contains("is-open");
      box.classList.toggle("is-open",open); btn.setAttribute("aria-expanded",String(open)); set(box.dataset.key, open?"1":"0");
    });
    var cur=nav.querySelector(".is-here"); if(cur) nav.scrollTop=Math.max(0, cur.offsetTop-nav.clientHeight/2);
    wireSearch(header.querySelector(".sh-search"));
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
