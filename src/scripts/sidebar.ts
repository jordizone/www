type State = 'open' | 'closed';

const EXPANDED_KEY = 'sidebar:expanded';

const root = document.documentElement;

const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;

const $toggle = () => document.getElementById('sidebar-toggle');

function syncToggleAria(state: State) {
  $toggle()?.setAttribute('aria-expanded', String(state === 'open'));
}

function setSidebar(state: State) {
  root.dataset.sidebar = state;
  try {
    localStorage.setItem('sidebar', state);
  } catch {}
  syncToggleAria(state);
}

function readExpanded(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(EXPANDED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeExpanded(state: Record<string, boolean>) {
  try {
    localStorage.setItem(EXPANDED_KEY, JSON.stringify(state));
  } catch {}
}

function applyStoredExpanded() {
  const stored = readExpanded();
  for (const [key, expanded] of Object.entries(stored)) {
    const li = document.querySelector<HTMLElement>(`[data-section="${key}"]`);
    const btn = document.querySelector<HTMLElement>(`[data-disclosure="${key}"]`);
    if (!li || !btn) continue;
    if (li.dataset.expanded !== String(expanded)) {
      li.dataset.expanded = String(expanded);
      btn.setAttribute('aria-expanded', String(expanded));
    }
  }
}

function updateActiveStates() {
  const pathname = window.location.pathname;

  document.querySelectorAll<HTMLElement>('[data-folder-href]').forEach((el) => {
    const href = el.dataset.folderHref!;
    const active = pathname === href || pathname.startsWith(href + '/');
    const current = pathname === href;
    el.classList.toggle('bg-surface-hover', active);
    el.classList.toggle('text-fg-strong', active);
    el.classList.toggle('text-fg', !active);
    el.classList.toggle('hover:bg-surface-hover', !active);
    if (current) {
      el.setAttribute('aria-current', 'page');
    } else {
      el.removeAttribute('aria-current');
    }
  });

  document.querySelectorAll<HTMLElement>('[data-active-href]').forEach((el) => {
    const href = el.dataset.activeHref!;
    const active = pathname === href;
    el.classList.toggle('bg-surface-hover', active);
    el.classList.toggle('text-fg-strong', active);
    el.classList.toggle('text-fg-muted', !active);
    el.classList.toggle('hover:text-fg', !active);
    el.classList.toggle('hover:bg-surface-hover', !active);
    if (active) {
      el.setAttribute('aria-current', 'page');
    } else {
      el.removeAttribute('aria-current');
    }
  });
}

function init() {
  syncToggleAria((root.dataset.sidebar as State) ?? 'closed');
  applyStoredExpanded();
  updateActiveStates();
}

init();
document.addEventListener('astro:before-swap', () => {
  root.classList.add('nav-swapping');
});
document.addEventListener('astro:after-swap', () => {
  init();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove('nav-swapping');
    });
  });
});

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement | null;
  if (!target) return;

  if (target.closest('#sidebar-toggle')) {
    const current = (root.dataset.sidebar as State) ?? 'closed';
    setSidebar(current === 'open' ? 'closed' : 'open');
    return;
  }

  if (target.closest('#sidebar-backdrop')) {
    setSidebar('closed');
    return;
  }

  if (target.closest('#sidebar a[href]') && !isDesktop()) {
    setSidebar('closed');
    return;
  }

  const discBtn = target.closest<HTMLElement>('[data-disclosure]');
  if (discBtn) {
    const key = discBtn.dataset.disclosure!;
    const li = document.querySelector<HTMLElement>(`[data-section="${key}"]`);
    if (!li) return;
    const next = li.dataset.expanded !== 'true';
    li.dataset.expanded = String(next);
    discBtn.setAttribute('aria-expanded', String(next));
    const stored = readExpanded();
    stored[key] = next;
    writeExpanded(stored);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && root.dataset.sidebar === 'open' && !isDesktop()) {
    setSidebar('closed');
    return;
  }

  if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
    const target = e.target as HTMLElement | null;
    const tag = target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
    e.preventDefault();
    const current = (root.dataset.sidebar as State) ?? 'closed';
    setSidebar(current === 'open' ? 'closed' : 'open');
  }
});
