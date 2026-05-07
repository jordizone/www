import { animate } from 'motion';

type State = 'open' | 'closed';

const DURATION = 0.3;
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const root = document.documentElement;
const toggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('sidebar-backdrop');
const main = document.getElementById('main-column');

const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function syncToggleAria(state: State) {
  toggle?.setAttribute('aria-expanded', String(state === 'open'));
}

function setSidebar(state: State, animateIt = true) {
  const previous = root.dataset.sidebar as State | undefined;
  root.dataset.sidebar = state;
  try {
    localStorage.setItem('sidebar', state);
  } catch {}
  syncToggleAria(state);

  if (!animateIt || previous === state || prefersReducedMotion()) return;

  const isOpen = state === 'open';
  const desktop = isDesktop();
  const opts = { duration: DURATION, ease: EASE };

  if (sidebar) {
    animate(
      sidebar,
      { transform: isOpen ? 'translateX(0%)' : 'translateX(-100%)' },
      opts,
    );
  }
  if (backdrop && !desktop) {
    animate(backdrop, { opacity: isOpen ? 1 : 0 }, { duration: 0.2 });
  }
  if (main && desktop) {
    animate(main, { paddingLeft: isOpen ? '220px' : '0px' }, opts);
  }
}

syncToggleAria((root.dataset.sidebar as State) ?? 'closed');

toggle?.addEventListener('click', () => {
  const current = (root.dataset.sidebar as State) ?? 'closed';
  setSidebar(current === 'open' ? 'closed' : 'open');
});

backdrop?.addEventListener('click', () => setSidebar('closed'));

document.addEventListener('keydown', (e) => {
  if (
    e.key === 'Escape' &&
    root.dataset.sidebar === 'open' &&
    !isDesktop()
  ) {
    setSidebar('closed');
  }
});
