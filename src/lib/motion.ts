/**
 * Infraestrutura de movimento compartilhada: registro do GSAP, detecção de
 * capacidade do aparelho e rolagem suave (Lenis) sincronizada ao ScrollTrigger.
 * A linguagem de movimento (eases, durações, coreografia) é definida em cada demo.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

// Exposto só em desenvolvimento, para inspeção nos testes com Playwright.
if (import.meta.env.DEV) Object.assign(window, { __ST: ScrollTrigger, __gsap: gsap });

export { gsap, ScrollTrigger, SplitText, CustomEase };

const mq = (q: string) => window.matchMedia(q).matches;

export const reducedMotion = () => document.documentElement.classList.contains('rm') || mq('(prefers-reduced-motion: reduce)');
export const finePointer = () => mq('(hover: hover) and (pointer: fine)');

/**
 * Aparelho modesto: poucos núcleos, pouca memória ou economia de dados.
 * Nesses casos as demos cortam efeitos caros (clip-path em tela cheia com
 * scrub, parallax interno, blur) e mantêm só o essencial.
 */
export function lowPower(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  return cores <= 4 || memory <= 4 || Boolean(nav.connection?.saveData);
}

let lenis: Lenis | null = null;

/** Rolagem suave só com mouse/trackpad; no toque fica a rolagem nativa. */
export function initSmoothScroll(options: { lerp?: number; wheelMultiplier?: number } = {}): Lenis | null {
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (reducedMotion() || !finePointer()) return null;
  lenis = new Lenis({
    lerp: options.lerp ?? 0.1,
    wheelMultiplier: options.wheelMultiplier ?? 1,
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function getLenis(): Lenis | null {
  return lenis;
}

/** Âncoras internas passam pela Lenis (ou pelo scroll nativo) e movem o foco. */
export function bindAnchorLinks(offset = 0): void {
  document.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href')!.slice(1);
    const target = id ? document.getElementById(id) : document.body;
    if (!target) return;
    event.preventDefault();
    const done = () => {
      if (target !== document.body) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    };
    if (lenis) {
      lenis.scrollTo(target, { offset, duration: 1.4, onComplete: done });
    } else {
      const top = target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: reducedMotion() ? 'auto' : 'smooth' });
      done();
    }
    history.replaceState(null, '', id ? `#${id}` : location.pathname);
  });
}

/** Marca a página como pronta (desarma o failsafe do Base.astro). */
export function markReady(): void {
  (window as Window & { __demoReady?: boolean }).__demoReady = true;
}

/**
 * Promessa que resolve quando as fontes e as imagens indicadas decodificaram.
 * `onProgress` recebe 0..1 com base no que realmente carregou (usado pelos
 * loaders que mostram contagem; nada de progresso falso).
 */
export function waitForAssets(images: HTMLImageElement[], onProgress?: (p: number) => void, timeout = 5000): Promise<void> {
  const tasks: Promise<unknown>[] = [document.fonts.ready];
  images.forEach((img) => {
    tasks.push(
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          }),
    );
  });
  let done = 0;
  const total = tasks.length;
  onProgress?.(0);
  const tracked = tasks.map((t) =>
    t.then(() => {
      done += 1;
      onProgress?.(done / total);
    }),
  );
  return Promise.race([
    Promise.all(tracked).then(() => undefined),
    new Promise<void>((resolve) => window.setTimeout(resolve, timeout)),
  ]);
}

/** Promessa (tipada como void) que resolve quando a animação termina. */
export function finished(animation: gsap.core.Animation): Promise<void> {
  return new Promise((resolve) => {
    animation.then(() => resolve());
  });
}

/** Espera o próximo frame (útil antes de medir layout depois de trocar classes). */
export const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
