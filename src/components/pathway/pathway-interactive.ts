import { MATRIX, type PersonaId, type GoalId, type PathSlug } from '../../content/pathway-graph';

type PathData = { title: string; steps: string[]; services: string[] };

const dataEl = document.getElementById('pathway-data');
if (!dataEl) {
  throw new Error('pathway-interactive: #pathway-data element not found');
}
const PATHS: Record<string, PathData> = JSON.parse(dataEl.textContent || '{}');

const diagram = document.querySelector<HTMLElement>('[data-pathway-diagram]');
const banner = document.querySelector<HTMLElement>('[data-chooser-banner]');
const bannerTitle = document.querySelector<HTMLElement>('[data-chooser-banner-title]');
const personaSel = document.querySelector<HTMLSelectElement>('[data-chooser-persona]');
const goalSel = document.querySelector<HTMLSelectElement>('[data-chooser-goal]');
const clearBtns = document.querySelectorAll<HTMLButtonElement>('[data-chooser-clear]');
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
  if (!data || !diagram || !banner || !bannerTitle) return;
  diagram.dataset.activePath = slug;
  const stepNodes = document.querySelectorAll<HTMLElement>('[data-step-id]');
  const serviceNodes = document.querySelectorAll<HTMLElement>('[data-service-id]');
  setAllMarks(new Set(data.steps), stepNodes);
  setAllMarks(new Set(data.services), serviceNodes);
  bannerTitle.textContent = data.title;
  banner.hidden = false;
  cards.forEach((c) => c.setAttribute('aria-pressed', c.dataset.pathSlug === slug ? 'true' : 'false'));
  clearBtns.forEach((b) => (b.hidden = false));
  history.replaceState(null, '', `#path=${slug}`);
}

function clearPath() {
  if (!diagram || !banner) return;
  delete diagram.dataset.activePath;
  document.querySelectorAll<HTMLElement>('[data-step-id], [data-service-id]').forEach((el) => {
    el.classList.remove('active', 'dim');
  });
  banner.hidden = true;
  cards.forEach((c) => c.setAttribute('aria-pressed', 'false'));
  clearBtns.forEach((b) => (b.hidden = true));
  if (personaSel) personaSel.value = '';
  if (goalSel) goalSel.value = '';
  if (location.hash.startsWith('#path=')) {
    history.replaceState(null, '', location.pathname + location.search);
  }
}

function tryMatrix() {
  if (!personaSel || !goalSel) return;
  const p = personaSel.value as PersonaId | '';
  const g = goalSel.value as GoalId | '';
  if (!p || !g) return;
  const slug = (MATRIX[p]?.[g] ?? null) as PathSlug | null;
  if (slug) applyPath(slug);
}

cards.forEach((c) => {
  c.addEventListener('click', () => {
    const slug = c.dataset.pathSlug;
    if (slug) applyPath(slug);
    // The 'Get started' CTA lives at the very top of the section; when clicked,
    // smooth-scroll the strip into view so the user sees the diagram update.
    if (c.hasAttribute('data-cta-getstarted')) {
      const strip = document.querySelector<HTMLElement>('[data-pathway-strip]');
      strip?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
personaSel?.addEventListener('change', tryMatrix);
goalSel?.addEventListener('change', tryMatrix);
clearBtns.forEach((b) => b.addEventListener('click', clearPath));

// Honor hash on load
const match = /^#path=([a-z0-9-]+)$/.exec(location.hash);
if (match && PATHS[match[1]]) applyPath(match[1]);
