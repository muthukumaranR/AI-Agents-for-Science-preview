type PathData = { title: string; steps: string[]; services: string[] };

const dataEl = document.getElementById('pathway-data');
if (!dataEl) {
  throw new Error('pathway-interactive: #pathway-data element not found');
}
const PATHS: Record<string, PathData> = JSON.parse(dataEl.textContent || '{}');

const diagram = document.querySelector<HTMLElement>('[data-pathway-diagram]');
const cards = document.querySelectorAll<HTMLButtonElement>('[data-path-slug]');

function setAllMarks(active: Set<string>, all: NodeListOf<HTMLElement>) {
  all.forEach((el) => {
    const id = el.dataset.stepId ?? el.dataset.serviceId;
    if (!id) return;
    if (active.has(id)) {
      el.classList.add('active');
      el.classList.remove('dim');
    } else {
      el.classList.add('dim');
      el.classList.remove('active');
    }
  });
}

function applyPath(slug: string) {
  const data = PATHS[slug];
  if (!data || !diagram) return;
  diagram.dataset.activePath = slug;
  const stepNodes = document.querySelectorAll<HTMLElement>('[data-step-id]');
  const serviceNodes = document.querySelectorAll<HTMLElement>('[data-service-id]');
  setAllMarks(new Set(data.steps), stepNodes);
  setAllMarks(new Set(data.services), serviceNodes);
  cards.forEach((c) => c.setAttribute('aria-pressed', c.dataset.pathSlug === slug ? 'true' : 'false'));
  history.replaceState(null, '', `#path=${slug}`);
}

function clearPath() {
  if (!diagram) return;
  delete diagram.dataset.activePath;
  document.querySelectorAll<HTMLElement>('[data-step-id], [data-service-id]').forEach((el) => {
    el.classList.remove('active', 'dim');
  });
  cards.forEach((c) => c.setAttribute('aria-pressed', 'false'));
  if (location.hash.startsWith('#path=')) {
    history.replaceState(null, '', location.pathname + location.search);
  }
}

cards.forEach((c) => {
  c.addEventListener('click', () => {
    const slug = c.dataset.pathSlug;
    if (!slug) return;
    // Re-clicking the active card toggles the highlight off.
    if (c.getAttribute('aria-pressed') === 'true') {
      clearPath();
    } else {
      applyPath(slug);
    }
    // The 'Get started' CTA lives at the very top of the section; when clicked,
    // smooth-scroll the strip into view so the user sees the diagram update.
    if (c.hasAttribute('data-cta-getstarted')) {
      const strip = document.querySelector<HTMLElement>('[data-pathway-strip]');
      strip?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

function applyFromHash() {
  const m = /^#path=([a-z0-9-]+)$/.exec(location.hash);
  if (m && PATHS[m[1]]) {
    applyPath(m[1]);
    // Smooth-scroll to the strip if user came from outside the section
    // (e.g. clicked the sticky-nav 'Get started' CTA).
    const strip = document.querySelector<HTMLElement>('[data-pathway-strip]');
    strip?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Honor hash on load + on subsequent hash navigations
applyFromHash();
window.addEventListener('hashchange', applyFromHash);
