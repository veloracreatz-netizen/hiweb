(function(){
"use strict";
document.documentElement.classList.add("js");
var C = window.HIWEB || {couponCode:"HIWEB10",couponOffer:"10% off your first website",whatsappNumber:"916303707046",couponMessage:"Hi Faraz, I won coupon {code} on your website, I want a website for my business",chatMessage:"Hi Faraz, I saw your Hi Web website. I want a website for my business."};
var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function wa(msg){ return "https://wa.me/" + C.whatsappNumber + "?text=" + encodeURIComponent(msg); }
var LS = { get:function(k){try{return localStorage.getItem(k);}catch(e){return null;}}, set:function(k,v){try{localStorage.setItem(k,v);}catch(e){}} };

/* ---------- config into the page ---------- */
document.querySelectorAll(".wa-link").forEach(function(a){ a.href = wa(C.chatMessage); });
document.querySelectorAll(".offer-text").forEach(function(el){ el.textContent = C.couponOffer; });
document.getElementById("couponCode").textContent = C.couponCode;
document.getElementById("claimBtn").href = wa(C.couponMessage.replace("{code}", C.couponCode));

/* ---------- sound (WebAudio, off by default) ---------- */
var soundOn = LS.get("hiweb_sound") === "on";
var ctx = null, master = null;
function ensureCtx(){
  if (!ctx) {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.22; master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
function tone(freq, dur, type, vol, when, slideTo){
  if (!soundOn) return; var c = ensureCtx(); if (!c) return;
  var t = c.currentTime + (when || 0);
  var o = c.createOscillator(), g = c.createGain();
  o.type = type || "sine"; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.5, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
}
var SFX = {
  hover:function(){ tone(1400, 0.05, "sine", 0.12); },
  click:function(){ tone(660, 0.07, "triangle", 0.35, 0, 880); },
  flip:function(){ tone(520, 0.08, "triangle", 0.3, 0, 760); },
  match:function(){ tone(784, 0.12, "sine", 0.35); tone(1175, 0.18, "sine", 0.3, 0.08); },
  miss:function(){ tone(220, 0.16, "sawtooth", 0.15, 0, 150); },
  pop:function(){ tone(900, 0.09, "square", 0.18, 0, 300); tone(1800, 0.05, "sine", 0.15, 0.02); },
  start:function(){ [523,659,784].forEach(function(f,i){ tone(f, 0.12, "triangle", 0.3, i*0.08); }); },
  win:function(){ [523,659,784,1047,1319].forEach(function(f,i){ tone(f, 0.35, "sine", 0.32, i*0.09); tone(f*2, 0.25, "triangle", 0.08, i*0.09); }); },
  lose:function(){ [392,330,262].forEach(function(f,i){ tone(f, 0.22, "triangle", 0.25, i*0.12); }); },
  on:function(){ tone(880, 0.1, "sine", 0.3); tone(1320, 0.14, "sine", 0.25, 0.07); }
};
var soundBtn = document.getElementById("soundBtn");
function paintSound(){
  soundBtn.setAttribute("aria-pressed", soundOn ? "true" : "false");
  soundBtn.setAttribute("aria-label", soundOn ? "Sound on. Tap to mute" : "Sound off. Tap to turn sound on");
  soundBtn.title = soundOn ? "Sound is on" : "Sound is off";
  soundBtn.querySelector(".sound-lbl").textContent = soundOn ? "Sound on" : "Sound off";
}
paintSound();
soundBtn.addEventListener("click", function(){
  soundOn = !soundOn; LS.set("hiweb_sound", soundOn ? "on" : "off"); paintSound();
  if (soundOn) { ensureCtx(); SFX.on(); toast("Sound on 🔊"); } else { toast("Sound off"); }
});
var canHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;
if (canHover) document.querySelectorAll(".btn, .links a, .soc, .gtab").forEach(function(el){ el.addEventListener("mouseenter", SFX.hover); });
document.querySelectorAll(".btn, .soc, .fab, .gtab, .faq summary").forEach(function(el){ el.addEventListener("click", function(){ if (!el.closest(".game")) SFX.click(); }); });

/* ---------- toast ---------- */
var toastEl = document.getElementById("toast"), toastT;
function toast(msg){ toastEl.textContent = msg; toastEl.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove("show"); }, 1800); }

/* ---------- nav state ---------- */
var nav = document.querySelector(".nav");
/* ---------- reveal ---------- */
var revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduce) {
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if (e.isIntersecting) { var el = e.target; var sib = Array.prototype.indexOf.call(el.parentNode.children, el); el.style.transitionDelay = Math.min(sib, 5) * 70 + "ms"; el.classList.add("in"); io.unobserve(el); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  revealEls.forEach(function(el){ io.observe(el); });
} else { revealEls.forEach(function(el){ el.classList.add("in"); }); }

/* ---------- parallax + nav (one rAF loop on scroll) ---------- */
var par = reduce ? [] : Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
var ticking = false;
function onScroll(){
  if (ticking) return; ticking = true;
  requestAnimationFrame(function(){
    var y = window.scrollY || 0;
    nav.classList.toggle("scrolled", y > 10);
    if (y < 1200) par.forEach(function(el){ el.style.transform = "translate3d(0," + (y * parseFloat(el.dataset.parallax)).toFixed(1) + "px,0)"; });
    ticking = false;
  });
}
window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

/* ---------- card spotlight + tilt (desktop pointer only) ---------- */
if (canHover && !reduce) {
  document.querySelectorAll(".tilt").forEach(function(card){
    card.addEventListener("pointermove", function(e){
      var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", (x*100) + "%"); card.style.setProperty("--my", (y*100) + "%");
      card.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * 5).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * 6).toFixed(2) + "deg) translateY(-3px)";
    });
    card.addEventListener("pointerleave", function(){ card.style.transform = ""; });
  });
}

/* ---------- confetti (canvas, short burst) ---------- */
var cv = document.getElementById("confetti"), cx2 = cv.getContext("2d");
function confetti(){
  if (reduce) return;
  var dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cx2.setTransform(dpr,0,0,dpr,0,0);
  var cols = ["#2f6bff","#22d3ee","#ffffff","#7aa2ff","#5eead4"], ps = [];
  for (var i = 0; i < 140; i++) ps.push({ x: innerWidth/2, y: innerHeight*0.55, vx: (Math.random()-0.5)*14, vy: -Math.random()*14-4, s: Math.random()*6+4, r: Math.random()*6, vr: (Math.random()-0.5)*0.3, c: cols[i%cols.length] });
  var t0 = performance.now();
  (function frame(t){
    cx2.clearRect(0,0,innerWidth,innerHeight);
    ps.forEach(function(p){ p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; cx2.save(); cx2.translate(p.x,p.y); cx2.rotate(p.r); cx2.fillStyle = p.c; cx2.fillRect(-p.s/2,-p.s/4,p.s,p.s/2); cx2.restore(); });
    if (t - t0 < 2600) requestAnimationFrame(frame); else cx2.clearRect(0,0,innerWidth,innerHeight);
  })(t0);
}

/* ---------- prize / localStorage ---------- */
var prize = document.getElementById("prize");
function showPrize(again){
  document.getElementById("prizeTitle").textContent = again ? "Your coupon is unlocked ✅" : "You won! 🎉";
  prize.hidden = false;
}
function win(game){
  var already = LS.get("hiweb_coupon_won");
  LS.set("hiweb_coupon_won", game + "|" + new Date().toISOString());
  SFX.win(); confetti(); showPrize(false);
  setTimeout(function(){ prize.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); }, 250);
  if (already) toast("You already had this coupon. Same code!");
}
if (LS.get("hiweb_coupon_won")) showPrize(true);
document.getElementById("copyBtn").addEventListener("click", function(){
  var code = C.couponCode;
  var done = function(){ toast("Code " + code + " copied"); SFX.click(); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, function(){ toast("Your code: " + code); });
  else toast("Your code: " + code);
});

/* ---------- tabs ---------- */
var tabs = document.querySelectorAll(".gtab");
tabs.forEach(function(tab){
  tab.addEventListener("click", function(){
    tabs.forEach(function(t){ var on = t === tab; t.classList.toggle("is-on", on); t.setAttribute("aria-selected", on ? "true" : "false"); document.getElementById(t.getAttribute("aria-controls")).hidden = !on; });
    stopBugs(false);
  });
});

/* ---------- game 1: squash the bugs ---------- */
var holes = Array.prototype.slice.call(document.querySelectorAll(".hole"));
var bugOverlay = document.getElementById("bugOverlay"), bugStart = document.getElementById("bugStart");
var scoreEl = document.getElementById("bugScore"), timeEl = document.getElementById("bugTime");
var GOAL = 10, LIMIT = 20, score = 0, timeLeft = LIMIT, running = false, tick = null, spawnT = null, last = -1;
function spawn(){
  if (!running) return;
  var free = holes.filter(function(h){ return !h.classList.contains("up"); });
  if (free.length) {
    var h; do { h = free[Math.floor(Math.random()*free.length)]; } while (free.length > 1 && holes.indexOf(h) === last);
    last = holes.indexOf(h); h.classList.remove("hit"); h.classList.add("up");
    var stay = Math.max(650, 1150 - score*40);
    h._t = setTimeout(function(){ h.classList.remove("up"); }, stay);
  }
  spawnT = setTimeout(spawn, Math.max(380, 720 - score*25));
}
function startBugs(){
  score = 0; timeLeft = LIMIT; scoreEl.textContent = "0"; timeEl.textContent = LIMIT; running = true;
  holes.forEach(function(h){ h.classList.remove("up","hit"); });
  bugOverlay.classList.add("hide"); SFX.start();
  tick = setInterval(function(){ timeLeft--; timeEl.textContent = timeLeft; if (timeLeft <= 0) endBugs(false); }, 1000);
  setTimeout(spawn, 400);
}
function stopBugs(){ running = false; clearInterval(tick); clearTimeout(spawnT); holes.forEach(function(h){ clearTimeout(h._t); h.classList.remove("up"); }); }
function endBugs(won){
  stopBugs();
  if (won) { bugOverlay.querySelector("p").textContent = "Code is clean! You squashed all " + GOAL + " bugs. 🎉"; bugStart.textContent = "Play again"; win("bugs"); }
  else { bugOverlay.querySelector("p").textContent = "So close! You got " + score + " of " + GOAL + ". Try again?"; bugStart.textContent = "Try again"; SFX.lose(); }
  bugOverlay.classList.remove("hide");
}
bugStart.addEventListener("click", startBugs);
holes.forEach(function(h){
  h.addEventListener("pointerdown", function(e){
    e.preventDefault(); if (!running) return;
    if (h.classList.contains("up")) {
      clearTimeout(h._t); h.classList.remove("up"); h.classList.add("hit"); SFX.pop(); score++; scoreEl.textContent = score;
      setTimeout(function(){ h.classList.remove("hit"); }, 260);
      if (navigator.vibrate) { try { navigator.vibrate(15); } catch(_){} }
      if (score >= GOAL) endBugs(true);
    } else { SFX.miss(); }
  });
});

/* ---------- game 2: memory match ---------- */
var ICONS = ["👗","💍","☕","🛍️","💇","🏪"];
var memBoard = document.getElementById("memBoard"), movesEl = document.getElementById("memMoves"), pairsEl = document.getElementById("memPairs");
var open = [], moves = 0, pairs = 0, lock = false;
function shuffle(a){ for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random()*(i+1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function buildMem(){
  memBoard.innerHTML = ""; open = []; moves = 0; pairs = 0; lock = false; movesEl.textContent = "0"; pairsEl.textContent = "0";
  shuffle(ICONS.concat(ICONS)).forEach(function(ic){
    var b = document.createElement("button"); b.type = "button"; b.className = "card"; b.dataset.v = ic; b.setAttribute("aria-label", "Hidden card");
    b.innerHTML = '<span class="card-in"><span class="face front">hi</span><span class="face back">' + ic + '</span></span>';
    b.addEventListener("click", function(){ flip(b); });
    memBoard.appendChild(b);
  });
}
function flip(b){
  if (lock || b.classList.contains("flip") || b.classList.contains("done")) return;
  b.classList.add("flip"); b.setAttribute("aria-label", "Card " + b.dataset.v); SFX.flip(); open.push(b);
  if (open.length === 2) {
    moves++; movesEl.textContent = moves; lock = true;
    var a = open[0], c = open[1];
    if (a.dataset.v === c.dataset.v) {
      setTimeout(function(){ a.classList.add("done"); c.classList.add("done"); SFX.match(); pairs++; pairsEl.textContent = pairs; open = []; lock = false; if (pairs === ICONS.length) setTimeout(function(){ win("memory"); }, 350); }, 320);
    } else {
      setTimeout(function(){ SFX.miss(); a.classList.remove("flip"); c.classList.remove("flip"); a.setAttribute("aria-label","Hidden card"); c.setAttribute("aria-label","Hidden card"); open = []; lock = false; }, 800);
    }
  }
}
buildMem();
document.getElementById("memReset").addEventListener("click", buildMem);

/* ---------- quote form -> WhatsApp ---------- */
document.getElementById("qform").addEventListener("submit", function(e){
  e.preventDefault();
  var n = document.getElementById("qName").value.trim(), t = (document.querySelector('input[name="type"]:checked') || {value:"business"}).value;
  var msg = "Hi Faraz, " + (n ? "I'm " + n + ". " : "") + "I have a " + t.toLowerCase() + " business and I want a website for it. Can I get a free quote?";
  SFX.click(); window.open(wa(msg), "_blank", "noopener");
});
})();
