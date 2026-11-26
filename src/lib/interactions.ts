/**
 * Microinterações compartilhadas: botões magnéticos, rótulo de cursor
 * contextual, transição entre páginas e sublinhado ativo por seção.
 * O visual de cada uma vem do CSS da demo; aqui só o comportamento.
 */
import { gsap, finePointer, reducedMotion } from './motion';

/**
 * Botão magnético: o elemento acompanha levemente o cursor (amplitude pequena)
 * e o conteúdo interno ([data-magnetic-inner]) se desloca um pouco mais,
 * criando profundidade. Volta com ease elástico suave ao sair.
 */
export function initMagnetic(selector = '[data-magnetic]', strength = 0.28): void {
  if (!finePointer() || reducedMotion()) return;
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    const inner = el.querySelector<HTMLElement>('[data-magnetic-inner]');
    const s = Number(el.dataset.magnetic) || strength;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    const ixTo = inner ? gsap.quickTo(inner, 'x', { duration: 0.6, ease: 'power3.out' }) : null;
    const iyTo = inner ? gsap.quickTo(inner, 'y', { duration: 0.6, ease: 'power3.out' }) : null;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * s);
      yTo(dy * s);
      ixTo?.(dx * s * 0.45);
      iyTo?.(dy * s * 0.45);
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: true });
      if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: true });
    });
  });
}

/**
 * Rótulo contextual perto do cursor em áreas com data-cursor="VIEW" etc.
 * Não substitui o cursor do sistema; só acrescenta um pequeno rótulo.
 */
export function initCursorLabel(className = 'cursor-label'): void {
  if (!finePointer()) return;
  const label = document.createElement('div');
  label.className = className;
  label.setAttribute('aria-hidden', 'true');
  const text = document.createElement('span');
  label.append(text);
  document.body.append(label);
  const xTo = gsap.quickTo(label, 'x', { duration: 0.45, ease: 'power3.out' });
  const yTo = gsap.quickTo(label, 'y', { duration: 0.45, ease: 'power3.out' });
  let current: HTMLElement | null = null;
  let first = true;

  window.addEventListener(
    'pointermove',
    (e) => {
      if (first) {
        gsap.set(label, { x: e.clientX, y: e.clientY });
        first = false;
      }
      xTo(e.clientX);
      yTo(e.clientY);
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]');
      if (target !== current) {
        current = target;
        if (target) {
          text.textContent = target.dataset.cursor ?? '';
          label.dataset.variant = target.dataset.cursorVariant ?? '';
          gsap.to(label, { opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
        } else {
          gsap.to(label, { opacity: 0, scale: 0.6, duration: 0.25, ease: 'power2.in', overwrite: 'auto' });
        }
      }
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => {
    current = null;
    gsap.to(label, { opacity: 0, duration: 0.2 });
  });
}

/**
 * Transição entre páginas: intercepta links internos, roda a animação de
 * saída da página atual (cobre o viewport) e só então navega. A página de
 * destino abre coberta e revela o conteúdo quando os assets chegam.
 */
export function initPageTransitions(cover: (href: string) => Promise<void>, onRestore?: () => void): void {
  let leaving = false;
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download') || link.dataset.noTransition !== undefined) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname) return;
    event.preventDefault();
    if (leaving) return;
    leaving = true;
    const go = () => {
      location.href = url.href;
    };
    if (reducedMotion()) return go();
    cover(url.pathname).then(go, go);
  });
  // Voltar pelo histórico (bfcache) restaura a página ainda coberta: descobre.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      leaving = false;
      onRestore?.();
    }
  });
}

/** Chama `onChange(id)` quando a seção com [data-section] ativa muda. */
export function watchSections(onChange: (el: HTMLElement) => void, rootMargin = '-45% 0px -54% 0px'): void {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) onChange(entry.target as HTMLElement);
      });
    },
    { rootMargin },
  );
  document.querySelectorAll<HTMLElement>('[data-section]').forEach((s) => io.observe(s));
}
