/**
 * Apex Motors · coreografia
 *
 * Movimento rápido e preciso: aberturas de letterbox, wipes laterais com
 * linha de scan, números que decodificam, linhas técnicas desenhadas.
 * Easing agressivo na entrada, sem quicar.
 */
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import {
  gsap,
  ScrollTrigger,
  SplitText,
  CustomEase,
  initSmoothScroll,
  bindAnchorLinks,
  markReady,
  reducedMotion,
  finePointer,
  lowPower,
  getLenis,
  finished,
} from '../../lib/motion';
import { initMagnetic, initCursorLabel, initPageTransitions, watchSections } from '../../lib/interactions';

gsap.registerPlugin(DrawSVGPlugin, ScrambleTextPlugin);
CustomEase.create('ax', '0.85, 0, 0.15, 1');
CustomEase.create('ax-out', '0.22, 1, 0.36, 1');

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

const RM = reducedMotion();
const LOW = lowPower();
const html = document.documentElement;
const nav = $('[data-nav]');
const curtain = $('[data-curtain]');
const hero = $('[data-hero]');
const heroStage = $('[data-hero-stage]');
const heroMedia = $('[data-hero-media]');
const heroBox = $('[data-hero-box]');
// Mesma regra das <source> do hero: tela vertical usa a arte em retrato.
const artDesktop = () => !window.matchMedia('(max-aspect-ratio: 1/1)').matches;
const SCRAMBLE = '0123456789ABCDEFGHJKLMNPRSTUVWXYZ/-';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

/* ------------------------------------------------------------------------ */
/* Loader: porcentagem das tarefas reais (fontes + imagem do hero)           */
/* ------------------------------------------------------------------------ */

function track(promise: Promise<unknown>, onDone: () => void): Promise<void> {
  return promise.then(onDone, onDone).then(() => undefined);
}

async function runCurtain(): Promise<void> {
  const count = $('[data-curtain-count]');
  const line = $('[data-curtain-line]');
  const img = $<HTMLImageElement>('.hero__img');
  const shown = { v: 0 };
  let target = 0;
  let done = 0;
  const render = () => {
    count.textContent = `${String(Math.round(shown.v)).padStart(3, '0')}%`;
    line.style.transform = `scaleX(${shown.v / 100})`;
  };
  const pump = () => gsap.to(shown, { v: target, duration: 0.5, ease: 'power2.out', onUpdate: render, overwrite: true });

  gsap.from('.curtain__brand span, .curtain__status > span, .curtain__meta span', { yPercent: 110, duration: 0.8, ease: 'ax-out', stagger: 0.05 });

  const imgReady = img.complete && img.naturalWidth > 0 ? Promise.resolve() : new Promise<void>((r) => {
    img.addEventListener('load', () => r(), { once: true });
    img.addEventListener('error', () => r(), { once: true });
  });
  const tasks = [
    document.fonts.load('800 1em "Archivo Variable"'),
    document.fonts.load('500 1em "JetBrains Mono Variable"'),
    imgReady.then(() => img.decode().catch(() => undefined)),
  ];
  const started = performance.now();
  const step = () => {
    done += 1;
    target = Math.round((done / tasks.length) * 100);
    pump();
  };
  await Promise.race([Promise.all(tasks.map((t) => track(t, step))), new Promise((r) => setTimeout(r, 5000))]);
  target = 100;
  await pump().then();
  const elapsed = performance.now() - started;
  if (elapsed < 600) await new Promise((r) => setTimeout(r, 600 - elapsed));

  await gsap
    .timeline()
    .to('.curtain__brand span, .curtain__status > span, .curtain__meta span', { yPercent: -110, duration: 0.45, ease: 'ax', stagger: 0.03 })
    .set(curtain, { backgroundColor: 'transparent' })
    .add(() => heroIntro(), '-=0.05')
    .to(line, { opacity: 0, scaleY: 3, duration: 0.5, ease: 'power2.out' }, '+=0.15')
    .then();
  curtain.classList.add('is-gone');
}

/* ------------------------------------------------------------------------ */
/* Hero                                                                      */
/* ------------------------------------------------------------------------ */

let heroIntroDone: Promise<void> = Promise.resolve();

function scrambleIn(el: HTMLElement, duration = 1): gsap.core.Tween {
  const text = el.dataset.text ?? el.textContent ?? '';
  el.dataset.text = text;
  return gsap.fromTo(el, { scrambleText: { text: ' ', chars: SCRAMBLE } }, { duration, ease: 'none', scrambleText: { text, chars: SCRAMBLE, speed: 0.6, revealDelay: 0.2 } });
}

function heroIntro(): void {
  const desktop = artDesktop();
  gsap.set(heroBox, { transformOrigin: desktop ? '36% 68%' : '50% 62%' });
  const titleSplit = SplitText.create('[data-hero-title] .hero__title-line', { type: 'words,chars', mask: 'chars' });
  const tagline = $('[data-hero-tagline]');
  const scrambles = $$('[data-scramble]');
  scrambles.forEach((el) => {
    el.dataset.text = el.textContent ?? '';
    el.textContent = '';
  });

  const tl = gsap.timeline({ onComplete: () => titleSplit.revert() });
  tl.fromTo(heroMedia, { clipPath: 'inset(49.9% 0% 49.9% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'ax' }, 0)
    .fromTo(heroBox, { scale: desktop ? 2.9 : 1.9 }, { scale: 1.04, duration: 2.6, ease: 'ax-out' }, 0)
    .fromTo('[data-hud-scan]', { y: () => heroStage.offsetHeight / 2, opacity: 1 }, { y: () => heroStage.offsetHeight, opacity: 0, duration: 1.2, ease: 'power2.in' }, 0.25)
    .from('.hud__corner', { opacity: 0, scale: 1.8, duration: 0.6, ease: 'ax-out', stagger: 0.06 }, 0.9)
    .from(titleSplit.chars, { yPercent: 110, duration: 0.9, ease: 'ax-out', stagger: 0.028 }, 1.0)
    .from(tagline, { clipPath: 'inset(0 100% 0 0)', duration: 1, ease: 'ax' }, 1.35)
    .add(() => scrambles.forEach((el, i) => scrambleIn(el, 0.9 + i * 0.05)), 1.1)
    .from('.hero__specs > div', { yPercent: 60, opacity: 0, duration: 0.7, ease: 'ax-out', stagger: 0.07 }, 1.3)
    .from('.hero__actions .btn', { yPercent: 60, opacity: 0, duration: 0.7, ease: 'ax-out', stagger: 0.08 }, 1.5)
    .add(() => nav.classList.add('is-in'), 1.2);

  if (desktop) {
    const draws = $$('[data-draw]', heroBox).filter((el) => !el.classList.contains('tech--dash'));
    const dashes = $$('.tech--dash', heroBox);
    tl.fromTo(draws, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.1, ease: 'ax', stagger: 0.05 }, 1.25)
      .from(dashes, { opacity: 0, duration: 0.6, stagger: 0.1 }, 1.7)
      .from('.tech--red rect', { opacity: 0, duration: 0.2, stagger: 0.1, repeat: 2, yoyo: true }, 1.8)
      .from('[data-tech-label]', { opacity: 0, clipPath: 'inset(0 100% 0 0)', duration: 0.6, ease: 'ax', stagger: 0.12 }, 1.9);
  }
  heroIntroDone = finished(tl);
}

function heroScroll(mm: gsap.MatchMedia): void {
  mm.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)' }, (ctx) => {
    const desktop = Boolean(ctx.conditions?.desktop);
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero, start: 'top top', end: () => `+=${window.innerHeight * (desktop ? 1.1 : 0.8)}`, pin: true, scrub: 0.6, invalidateOnRefresh: true },
    });
    tl.to(heroBox, { scale: 1.2, yPercent: -4, duration: 1 }, 0)
      .to(heroMedia, { clipPath: 'inset(11% 0% 11% 0%)', duration: 0.8 }, 0.2)
      .to('.hero__copy', { y: -140, opacity: 0, duration: 0.6 }, 0)
      .to('.hero__bar', { y: 60, opacity: 0, duration: 0.45 }, 0)
      .to('.hud, .hero__tech, [data-tech-label]', { opacity: 0, duration: 0.4 }, 0.05);
  });

  // Paralaxe mínima com o mouse (só ponteiro fino, fora de aparelhos modestos)
  if (!finePointer() || LOW) return;
  const xTo = gsap.quickTo(heroBox, 'x', { duration: 1.2, ease: 'power3.out' });
  const yTo = gsap.quickTo(heroBox, 'y', { duration: 1.2, ease: 'power3.out' });
  heroStage.addEventListener('pointermove', (e) => {
    xTo((e.clientX / window.innerWidth - 0.5) * -22);
    yTo((e.clientY / window.innerHeight - 0.5) * -12);
  });
}

/* ------------------------------------------------------------------------ */
/* Navegação: seção atual, fundo sólido fora do hero, menu mobile            */
/* ------------------------------------------------------------------------ */

function navBehaviour(): void {
  const index = $('[data-nav-index]');
  const name = $('[data-nav-name]');
  let current = '01';
  watchSections((el) => {
    const id = el.dataset.section ?? '01';
    if (id === current) return;
    const dir = id > current ? 1 : -1;
    current = id;
    index.textContent = id;
    if (RM) {
      name.textContent = el.dataset.name ?? '';
      return;
    }
    gsap
      .timeline()
      .to(name, { yPercent: -110 * dir, duration: 0.25, ease: 'power2.in' })
      .set(name, { yPercent: 110 * dir, textContent: el.dataset.name ?? '' })
      .to(name, { yPercent: 0, duration: 0.35, ease: 'ax-out' });
  });

  ScrollTrigger.create({
    trigger: '#sobre',
    start: 'top 70px',
    onEnter: () => nav.classList.add('is-solid'),
    onLeaveBack: () => nav.classList.remove('is-solid'),
  });

  const bar = $('[data-progress]');
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => (bar.style.transform = `scaleX(${self.progress})`) });
}

function mobileMenu(): void {
  const btn = $('[data-menu-btn]');
  const menu = $('[data-menu]');
  const links = $$('[data-menu-link]', menu);
  let open = false;
  const close = (instant = false) => {
    if (!open) return;
    open = false;
    btn.setAttribute('aria-expanded', 'false');
    getLenis()?.start();
    if (instant || RM) {
      menu.hidden = true;
      return;
    }
    gsap.to(menu, { clipPath: 'inset(0% 0% 0% 100%)', duration: 0.5, ease: 'ax', onComplete: () => (menu.hidden = true) });
  };
  btn.addEventListener('click', () => {
    if (open) return close();
    open = true;
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    getLenis()?.stop();
    if (!RM) {
      gsap.fromTo(menu, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'ax' });
      gsap.fromTo(links, { xPercent: 30, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.6, ease: 'ax-out', stagger: 0.05, delay: 0.15 });
    }
    links[0]?.focus({ preventScroll: true });
  });
  links.forEach((l) => l.addEventListener('click', () => close(true)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) {
      close();
      btn.focus();
    }
  });
}

/* ------------------------------------------------------------------------ */
/* 02 · Intro + ticker que reage à velocidade da rolagem                     */
/* ------------------------------------------------------------------------ */

function intro(): void {
  const statement = $('[data-wipe-lines]');
  if (!RM) {
    SplitText.create(statement, {
      type: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit: (self) =>
        gsap.fromTo(
          self.lines,
          { clipPath: 'inset(0% 100% 0% 0%)', x: -24 },
          { clipPath: 'inset(0% 0% 0% 0%)', x: 0, duration: 1, ease: 'ax', stagger: 0.12, scrollTrigger: { trigger: statement, start: 'top 80%', once: true } },
        ),
    });

    const fmt = new Intl.NumberFormat('pt-BR');
    $$('[data-count]').forEach((el) => {
      const to = Number(el.dataset.count);
      const obj = { v: 0 };
      el.textContent = '0';
      gsap.to(obj, {
        v: to,
        duration: 1.4,
        ease: 'expo.out',
        onUpdate: () => (el.textContent = fmt.format(Math.round(obj.v))),
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });
  }

  const ticker = $('[data-ticker]');
  const trackEl = $('[data-ticker-track]');
  if (RM) return;
  let x = 0;
  let boost = 0;
  let dir = -1;
  let visible = false;
  const setX = gsap.quickSetter(trackEl, 'x', 'px');
  const setSkew = gsap.quickSetter(trackEl, 'skewX', 'deg');
  ScrollTrigger.create({
    trigger: ticker,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (visible = self.isActive),
    onUpdate: (self) => {
      dir = self.direction === 1 ? -1 : 1;
      boost = gsap.utils.clamp(-18, 18, self.getVelocity() / 220);
    },
  });
  gsap.ticker.add((_t, dt) => {
    if (!visible) return;
    const half = trackEl.scrollWidth / 2;
    const speed = 0.9 * dir - Math.abs(boost) * (dir < 0 ? 1 : -1);
    x += speed * (dt / 16.67);
    if (x <= -half) x += half;
    if (x > 0) x -= half;
    setX(x);
    setSkew(-boost * 0.5);
    boost *= 0.93;
  });
}

/* ------------------------------------------------------------------------ */
/* 03 · Estoque: foto fixa + lista (desktop), swipe (mobile)                 */
/* ------------------------------------------------------------------------ */

function stock(mm: gsap.MatchMedia): void {
  const cars = $$('[data-car]');
  const shots = $$('[data-stock-shot]');
  const wipe = $('[data-stock-wipe]');
  const label = $('[data-stock-label]');
  const price = $('[data-stock-price]');
  const idx = $('[data-stock-index]');
  const data = cars.map((c) => ({
    label: `${$('.car__brand', c).textContent} · ${$('.car__model', c).textContent}`,
    price: $('.car__price', c).textContent ?? '',
  }));
  let active = -1;
  let z = 10;

  const setActive = (i: number, dir: number) => {
    if (i === active) return;
    const first = active < 0;
    active = i;
    cars.forEach((c, j) => c.classList.toggle('is-active', j === i));
    idx.textContent = String(i + 1).padStart(2, '0');
    if (first || RM) {
      shots.forEach((s, j) => gsap.set(s, { clipPath: j === i ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 0% 100%)', zIndex: j === i ? ++z : 1 }));
      label.textContent = data[i].label;
      price.textContent = data[i].price;
      return;
    }
    const shot = shots[i];
    const forward = dir >= 0;
    gsap.set(shot, { zIndex: ++z });
    gsap.fromTo(shot, { clipPath: forward ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'ax', overwrite: true });
    gsap.fromTo($('img', shot), { scale: 1.22, xPercent: forward ? 7 : -7 }, { scale: 1, xPercent: 0, duration: 1.3, ease: 'ax-out', overwrite: true });
    gsap.fromTo(wipe, { xPercent: forward ? 100 : 0, opacity: 1 }, { xPercent: forward ? 0 : 100, duration: 0.9, ease: 'ax', overwrite: true, onComplete: () => gsap.to(wipe, { opacity: 0, duration: 0.3 }) });
    gsap.to(label, { duration: 0.8, scrambleText: { text: data[i].label, chars: SCRAMBLE, speed: 0.8 }, overwrite: true });
    gsap.to(price, { duration: 0.8, scrambleText: { text: data[i].price, chars: '0123456789', speed: 0.8 }, overwrite: true });
  };

  mm.add('(min-width: 900px)', () => {
    setActive(0, 1);
    cars.forEach((car, i) =>
      ScrollTrigger.create({
        trigger: car,
        start: 'top 58%',
        end: 'bottom 58%',
        onToggle: (self) => self.isActive && setActive(i, self.direction),
      }),
    );
    if (!RM) {
      gsap.fromTo('[data-stock-frame]', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'ax', scrollTrigger: { trigger: '[data-stock-frame]', start: 'top 85%', once: true } });
    }
    return () => {
      active = -1;
    };
  });

  mm.add('(max-width: 899px)', () => {
    const list = $('[data-stock-list]');
    const mIdx = $('[data-stock-mobile-index]');
    const onScroll = () => {
      const w = cars[0].offsetWidth + 12;
      mIdx.textContent = String(Math.min(cars.length, Math.round(list.scrollLeft / w) + 1)).padStart(2, '0');
    };
    list.addEventListener('scroll', onScroll, { passive: true });
    if (!RM) {
      gsap.from($$('.car__media', list), { clipPath: 'inset(100% 0% 0% 0%)', duration: 1, ease: 'ax', stagger: 0.1, scrollTrigger: { trigger: list, start: 'top 85%', once: true } });
    }
    return () => list.removeEventListener('scroll', onScroll);
  });

  if (!RM) {
    SplitText.create('[data-chars]', {
      type: 'words,chars',
      mask: 'chars',
      autoSplit: true,
      onSplit: (self) => gsap.from(self.chars, { yPercent: 110, duration: 0.8, ease: 'ax-out', stagger: 0.025, scrollTrigger: { trigger: self.elements[0], start: 'top 85%', once: true } }),
    });
  }
}

/* ------------------------------------------------------------------------ */
/* 04 · Destaque: foto presa enquanto os números entram e saem               */
/* ------------------------------------------------------------------------ */

const FEATURE_POINTS = [
  [
    [0.2, 0.42],
    [0.86, 0.42],
  ],
  [
    [0.47, 0.6],
    [0.62, 0.52],
  ],
  [
    [0.78, 0.38],
    [0.32, 0.72],
  ],
];

function feature(mm: gsap.MatchMedia): void {
  const section = $('#destaque');
  const stage = $('[data-feature-stage]');
  const media = $('[data-feature-media]');
  const img = $('[data-feature-img]');
  const specs = $$('[data-spec]');
  const gauge = $('[data-gauge]');
  const fills = $$('.feature__steps span');
  const crosses = $$('.feature__cross');
  const fmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 0 });
  let current = -1;

  const placeCrosses = (i: number, instant = false) => {
    const w = media.offsetWidth;
    const h = media.offsetHeight;
    crosses.forEach((c, j) => {
      const [px, py] = FEATURE_POINTS[i][j];
      gsap.to(c, { x: px * w, y: py * h, duration: instant ? 0 : 1, ease: 'ax' });
    });
  };

  const show = (i: number) => {
    if (i === current) return;
    const prev = current;
    const dir = i > prev ? 1 : -1;
    current = i;
    fills.forEach((f, j) => gsap.to(f, { scaleX: j <= i ? 1 : 0, duration: 0.6, ease: 'ax' }));
    const s = specs[i];
    const value = Number(s.querySelector<HTMLElement>('[data-spec-num]')!.dataset.specNum);
    const num = $('[data-spec-num]', s);
    const decimals = value % 1 !== 0;
    gsap.to(gauge, { drawSVG: `0% ${Number(s.dataset.gaugeValue) * 100}%`, duration: 1.1, ease: 'ax', overwrite: true });
    placeCrosses(i, prev < 0);

    if (RM) {
      specs.forEach((sp, j) => gsap.set(sp, { autoAlpha: j === i ? 1 : 0 }));
      return;
    }
    if (prev >= 0) {
      const old = specs[prev];
      gsap.to($$('.spec__in, .spec__num, .spec__unit', old), { yPercent: -110 * dir, duration: 0.45, ease: 'ax', overwrite: true });
      gsap.set(old, { autoAlpha: 0, delay: 0.45 });
    }
    gsap.set(s, { autoAlpha: 1 });
    gsap.fromTo($$('.spec__in, .spec__num, .spec__unit', s), { yPercent: 110 * dir }, { yPercent: 0, duration: 0.8, ease: 'ax-out', stagger: 0.06, delay: prev >= 0 ? 0.25 : 0, overwrite: true });
    const obj = { v: 0 };
    gsap.to(obj, {
      v: value,
      duration: 1.1,
      ease: 'expo.out',
      delay: 0.25,
      onUpdate: () => (num.textContent = decimals ? fmt.format(Math.round(obj.v * 10) / 10).padEnd(3, ',0') : String(Math.round(obj.v))),
      onComplete: () => (num.textContent = decimals ? fmt.format(value) : String(value)),
    });
  };

  specs.forEach((s, j) => gsap.set(s, { autoAlpha: j === 0 ? 1 : 0 }));
  gsap.set(gauge, { drawSVG: '0% 0%' });

  if (RM) {
    specs.forEach((s) => gsap.set(s, { autoAlpha: 1 }));
    return;
  }

  mm.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)' }, (ctx) => {
    const desktop = Boolean(ctx.conditions?.desktop);
    current = -1;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * (desktop ? 2.6 : 2.2)}`,
        pin: stage,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => show(Math.min(2, Math.floor(self.progress * 2.999))),
        onRefresh: () => current >= 0 && placeCrosses(current, true),
      },
    });
    // Movimento interno da foto: começa na traseira inteira e desliza até a faixa de luz.
    tl.fromTo(img, { scale: 1.08, xPercent: 0, yPercent: 0 }, { scale: 1.55, xPercent: -10, yPercent: 4, duration: 1 }, 0).fromTo(
      '[data-feature-ticks]',
      { x: 0 },
      { x: -600, duration: 1 },
      0,
    );
  });

  gsap.from(media, {
    clipPath: 'inset(0% 0% 0% 100%)',
    duration: 1.2,
    ease: 'ax',
    scrollTrigger: { trigger: section, start: 'top 75%', once: true },
  });
}

/* ------------------------------------------------------------------------ */
/* 05 · Padrão Apex: rolagem horizontal controlada                           */
/* ------------------------------------------------------------------------ */

function standard(mm: gsap.MatchMedia): void {
  if (RM) return;
  mm.add('(min-width: 900px)', () => {
    const pin = $('[data-standard-pin]');
    const trackEl = $('[data-standard-track]');
    const bar = $('[data-standard-bar]');
    const distance = () => trackEl.scrollWidth - window.innerWidth;
    const tween = gsap.to(trackEl, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => (bar.style.transform = `scaleX(${self.progress})`),
      },
    });
    $$('[data-panel]').forEach((panel) => {
      gsap.fromTo($('[data-panel-img]', panel), { xPercent: -9 }, { xPercent: 9, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      gsap.from($$('.panel__n, .panel__title, .panel__text', panel), {
        yPercent: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'ax-out',
        stagger: 0.08,
        scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left 72%', once: true },
      });
    });
  });
}

/* ------------------------------------------------------------------------ */
/* 06 · CTA: linhas que convergem com a rolagem                              */
/* ------------------------------------------------------------------------ */

function cta(): void {
  if (RM) return;
  const lines = $$('.cta__line > span');
  lines.forEach((l, i) => {
    gsap.fromTo(
      l,
      { xPercent: i % 2 === 0 ? -22 : 22, opacity: 0.2 },
      { xPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.cta__title', start: 'top 95%', end: 'top 40%', scrub: 0.6 } },
    );
  });
  gsap.from('.cta__actions .btn', { yPercent: 80, opacity: 0, duration: 0.8, ease: 'ax-out', stagger: 0.08, scrollTrigger: { trigger: '.cta__actions', start: 'top 92%', once: true } });

  const word = $('[data-footer-word]');
  if (finePointer()) {
    const footer = $('.footer');
    footer.addEventListener('pointermove', (e) => {
      const r = word.getBoundingClientRect();
      word.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    });
  }
}

/* ------------------------------------------------------------------------ */
/* Transição entre páginas: linha vermelha + letterbox fechando             */
/* ------------------------------------------------------------------------ */

function pageTransitions(): void {
  initPageTransitions(
    () => {
      curtain.classList.remove('is-gone');
      gsap.set(curtain, { backgroundColor: '#09090a', clipPath: 'inset(50% 0% 50% 0%)' });
      gsap.set('.curtain__brand span, .curtain__status > span, .curtain__meta span', { yPercent: 110 });
      const line = $('[data-curtain-line]');
      gsap.set(line, { opacity: 1, scaleY: 1, scaleX: 0 });
      return finished(
        gsap
        .timeline()
        .to(line, { scaleX: 1, duration: 0.4, ease: 'ax' })
        .to(curtain, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'ax' })
        .to('.curtain__brand span', { yPercent: 0, duration: 0.4, ease: 'ax-out' }, '-=0.2')
        );
    },
    () => curtain.classList.add('is-gone'),
  );
}

/* ------------------------------------------------------------------------ */
/* Boot                                                                      */
/* ------------------------------------------------------------------------ */

async function boot(): Promise<void> {
  markReady();
  bindAnchorLinks(-40);
  initMagnetic();
  initCursorLabel();
  pageTransitions();
  mobileMenu();

  const mm = gsap.matchMedia();

  if (RM) {
    nav.classList.add('is-in');
    navBehaviour();
    intro();
    stock(mm);
    feature(mm);
    return;
  }

  window.scrollTo(0, 0);
  html.style.overflow = 'hidden';
  await runCurtain();
  await heroIntroDone;
  html.style.overflow = '';

  initSmoothScroll({ lerp: 0.11 });
  heroScroll(mm);
  intro();
  stock(mm);
  feature(mm);
  standard(mm);
  cta();
  navBehaviour();
  ScrollTrigger.sort();
  ScrollTrigger.refresh();

  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) getLenis()?.scrollTo(target as HTMLElement, { immediate: true });
  }
}

boot();
