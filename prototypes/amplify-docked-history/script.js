// ===== State (in memory only) =====
// Chats belong to one record. Opening a chat from another record navigates to that record (no "follow" yet).
// trigger: name (chat name + chevron button) | clock (History button, top right)
// type: record (this record only) | record-link (this record, link to full history) | full (full history, "On this record" first)
const S = { trigger: 'name', type: 'record-link', rec: 'cand', chatId: null, menu: null /* 'record' | 'all' | null */, lib: false, q: '', libTab: 'favorites', libQ: '', mode: 'docked' };
const P = new URLSearchParams(location.search);
if (P.get('embed')) document.body.classList.add('embed');
if (P.get('rec')) S.rec = P.get('rec');

if (P.get('lib')) S.lib = true;
let uid = 100, userActed = false;
['pointerdown', 'keydown'].forEach((t) => addEventListener(t, () => { userActed = true; }, { capture: true, once: true }));
const focusEl = (el) => { if (el && userActed) el.focus({ preventScroll: true }); };

const RECORDS = {
  cand: { entity: 'candidate', icon: 'candidate', label: 'Tyler Brooks', name: 'Tyler Brooks', sub: 'Product Manager · Boston, MA', cards: [['Overview', 'Available now. 8 years in product, 5 in B2B SaaS.'], ['Submissions', '2 active: Product Manager at Nexus Dynamics, Data Analyst at Harbor Labs.'], ['Notes', 'Spoke Oct 9. Wants a hybrid role.']] },
  job: { entity: 'job', icon: 'job', label: '425 | Project Manager', name: '425 | Project Manager', sub: 'Nexus Dynamics · Accepting Candidates', cards: [['Overview', 'Project Manager, hybrid, Boston. Starts Oct 26.'], ['Pipeline', '6 submitted, 2 interviewing, 0 placed.'], ['Notes', 'Client wants PMP certified candidates.']] },
};
const REC_OF = { cand: { entity: 'candidate', label: 'Tyler Brooks' }, job: { entity: 'job', label: '425 | Project Manager' } };
const OTHER = { entity: 'company', label: 'Harbor Labs' };

// group: Today | Yesterday | Previous 7 days | Older. rec: record key, or null = another record.
const CHATS = [
  { id: 'c1', title: 'Is Tyler a fit for Nexus?', rec: 'cand', group: 'Today', ago: '20 min ago', desc: 'Meets 4 of 5 must-haves', turns: [
    { u: 'Is Tyler Brooks a fit for the Product Manager job at Nexus Dynamics?' }, { a: 'Tyler meets 4 of 5 must-haves. Missing: PMP certification.' }] },
  { id: 'c2', title: 'Draft intro email to Tyler', rec: 'cand', group: 'Yesterday', ago: '1 day ago', desc: 'Short intro about the Nexus role', turns: [
    { u: 'Draft a short intro email to Tyler about the Nexus role.' }, { a: 'Here is a draft. It mentions his B2B SaaS experience and suggests a call this week.' }] },
  { id: 'c3', title: 'Summarize Tyler’s notes', rec: 'cand', group: 'Previous 7 days', ago: '5 days ago', desc: '3 notes since Oct 1', turns: [
    { u: 'Summarize my notes on Tyler.' }, { a: 'Three notes since Oct 1: wants hybrid, available now, expects $140–150k.' }] },
  { id: 'c4', title: 'Shortlist for Project Manager', rec: 'job', group: 'Today', ago: '3 hours ago', desc: 'Jane Jones and Tyler Brooks lead', turns: [
    { u: 'Who are my strongest candidates for this job?' }, { a: 'Jane Jones and Tyler Brooks meet 4 of 5 must-haves.' }] },
  { id: 'c5', title: 'Rewrite the job description', rec: 'job', group: 'Previous 7 days', ago: '4 days ago', desc: 'Tighter, adds PMP requirement', turns: [
    { u: 'Rewrite this job description to be shorter.' }, { a: 'Here is a version at 180 words that keeps the PMP requirement.' }] },
  { id: 'c6', title: 'Interview prep: Harbor Labs', rec: null, rc: OTHER, group: 'Previous 7 days', ago: '4 days ago', desc: 'Summary before the intake call', turns: [
    { u: 'Summarize what I know about Harbor Labs before tomorrow’s call.' }, { a: 'Harbor Labs has 3 open jobs, 1 on hold. Last placement was in August.' }] },
  { id: 'c7', title: 'Candidates with expiring certifications', rec: null, group: 'Older', ago: '3 weeks ago', desc: '4 candidates expire before Dec 31', turns: [
    { u: 'Which active candidates have certifications expiring this quarter?' }, { a: '4 candidates have certifications expiring before Dec 31.' }] },
];
const SCHEDULED = [{ id: 's1', chat: 'c8', title: 'Open job order status', sched: 'Weekdays, 8–9 AM', unread: 1, ago: 'Today, 8:12 AM' }];
CHATS.push({ id: 'c8', title: 'Open job order status', rec: null, scheduled: true, group: 'Today', ago: 'Today, 8:12 AM', turns: [{ u: 'Status changes on my open job orders.' }, { a: 'Checked 14 open jobs. 3 changed.' }] });

const PROMPTS = [
  { id: 'p1', title: 'Find similar candidates', icon: 'search-menu', tags: ['Sourcing'], d: 'Find candidates with a similar background to this record.', fav: true, on: 'cand' },
  { id: 'p2', title: 'Draft an intro email', icon: 'outbound-email', tags: ['Outreach'], d: 'Write a short first-touch email using this record’s details.', fav: true },
  { id: 'p3', title: 'Prep for a screen', icon: 'appointment', tags: ['Interviews'], d: 'Summarize what to ask and what to know before a screen.', fav: false },
  { id: 'p4', title: 'Summarize recent activity', icon: 'comment-outline', tags: ['Productivity'], d: 'Summarize notes, calls and emails from the last 30 days.', fav: false, mine: true },
];
const STARTERS = {
  cand: [['Is Tyler a fit for a job?', 'Match against your open jobs'], ['Draft an intro email', 'Uses his notes and last contact'], ['Summarize recent activity', 'Notes, calls and emails']],
  job: [['Who are my strongest candidates?', 'Ranked against the must-haves'], ['Rewrite the job description', 'Shorter and clearer'], ['Prep a client update', 'Pipeline status and next steps']],
};

// ===== Helpers =====
const $ = (s, r = document) => r.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ic = (name, size = 16, color = '', cls = '') => `<span class="ats-icon ${cls}" data-i="${name}" aria-hidden="true" style="width:${size}px;height:${size}px;${color ? `background-color:${color}` : ''}"></span>`;
const iconBtn = (icon, label, attrs = '', on = false) => `<button type="button" class="ats-btn ats-btn--icon ats-btn--small${on ? ' is-on' : ''}" aria-label="${label}" title="${label}" ${attrs}>${ic(icon, 12)}</button>`;
const chat = (id) => CHATS.find((c) => c.id === id);
const hasTurns = (c) => c && c.turns && c.turns.length;
const title = () => (S.chatId ? chat(S.chatId).title : 'New chat');
const onRecord = (c) => c.rec === S.rec && !c.scheduled;
const recent = (a) => a; // CHATS are already sorted most recent first within record
function toast(text) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status');
  el.innerHTML = `<span>${esc(text)}</span>`; document.body.appendChild(el); setTimeout(() => el.remove(), 3500);
}

// ===== Record page: the shell candidate record; the job record is a stand-in =====
// Put the candidate record page and the docked chat in one row inside the bowling alley canvas.
(() => {
  const canvas = $('.ats-bowling-alley-shell__canvas'), cand = canvas.querySelector('.ats-candidate-record__page');
  const ws = document.createElement('div'); ws.className = 'ws'; ws.id = 'ws';
  const scroll = document.createElement('main'); scroll.className = 'page-scroll'; scroll.setAttribute('aria-label', 'Record');
  const job = document.createElement('div'); job.className = 'page'; job.id = 'page'; job.hidden = true;
  scroll.append(cand, job); ws.append(scroll, $('#chat')); canvas.appendChild(ws);
})();
function renderPage() {
  const r = RECORDS[S.rec], cand = $('.ats-candidate-record__page');
  cand.hidden = S.rec !== 'cand'; $('#page').hidden = S.rec === 'cand';
  if (S.rec === 'cand') return;
  $('#page').innerHTML = `<header class="page__head"><span class="ats-icon-container" data-theme="${r.entity}" data-size="lg">${ic(r.icon, 24, 'var(--icon-container-icon)')}</span>
    <h1>${esc(r.name)}</h1></header><div class="page__body">${r.cards.map(([h, p]) => `<section class="page__card"><h3>${h}</h3><p>${esc(p)}</p></section>`).join('')}</div>`;
}

// ===== Docked chat (markup mirrors ats-ui templates) =====
const userTurn = (t) => `<div class="ats-amplify-chat-user-turn"><div class="ats-amplify-chat-user-bubble"><div class="ats-amplify-chat-user-bubble__viewport"><div class="ats-amplify-chat-user-bubble__message">${esc(t)}</div></div></div></div>`;
const para = (html) => `<p class="ats-amplify-chat-text ats-amplify-chat-text--paragraph" style="margin:0"><span class="ats-amplify-chat-text__content">${html}</span></p>`;
const ibnc = (icon, label) => `<button type="button" class="ats-icon-button-no-container" aria-label="${label}">${ic(icon, 12)}</button>`;
const block = (body, actions = true) => `<div class="ats-amplify-chat-chat-block" role="article" aria-label="Amplify reply">
  <div class="ats-amplify-chat-chat-block__body">${body}</div>
  ${actions ? `<div class="ats-amplify-chat-chat-block__controls"><div class="ats-amplify-chat-chat-block__actions">${ibnc('copy', 'Copy reply')}${ibnc('thumbs-up-line', 'Good response')}${ibnc('thumbs-down-line', 'Bad response')}</div></div>` : ''}</div>`;

function turnsHTML() {
  const c = S.chatId && chat(S.chatId);
  if (c && hasTurns(c)) return c.turns.map((t) => (t.u ? userTurn(t.u) : block(para(esc(t.a))))).join('');
  const r = RECORDS[S.rec];
  return block(para(`Hi Chloe, how can I help you with ${esc(r.label)}?`), false)
    + `<ul class="starters" aria-label="Suggested prompts">${STARTERS[S.rec].map(([t, d]) => `<li><button type="button" class="starter" data-ask="${esc(t)}">${ic('amplify', 14, '', 'amp-glyph')}<span><b>${esc(t)}</b><span>${esc(d)}</span></span></button></li>`).join('')}</ul>`;
}
function inputHTML() {
  const r = REC_OF[S.rec], tool = (icon, label, attrs = '') => `<button type="button" class="ats-btn ats-btn--dialogue ats-btn--small" aria-label="${label}" ${attrs}>${ic(icon, 12)}</button>`;
  return `<div class="ats-amplify-chat-container"><div class="ats-amplify-chat-context-container" data-size="docked"><span class="ats-amplify-chat-context-container__label">Context:</span>
    <div class="ats-amplify-chat-context-container__chips"><span class="ats-novo-chip ats-amplify-chat-context-container__chip" data-type="default" data-size="medium" data-color="default" style="--_ctx-entity:var(--color-entity-${r.entity})">${ic('circle', 10, 'var(--_ctx-entity)', 'ats-novo-chip__icon')}<span class="ats-novo-chip__label">${esc(r.label)}</span></span></div></div>
    <div class="ats-amplify-chat-input" data-size="docked"><textarea class="ats-amplify-chat-text-area" rows="1" aria-label="Message Amplify" placeholder="What would you like to know or do today?"></textarea>
    <div class="ats-amplify-chat-button-row ats-amplify-chat-button-row--icons-only"><div class="ats-amplify-chat-button-row__tools">${tool('add-thin', 'Add File')}${tool('tools', 'Add Tools')}${tool('book', 'Prompt Library', 'data-lib aria-haspopup="dialog"')}</div>
    <button type="button" class="ats-btn ats-btn--primary ats-btn--small ats-btn--amplify ats-amplify-chat-button-row__send" aria-label="Send" disabled data-send>${ic('arrow-up', 12)}</button></div></div></div>`;
}
function headerHTML() {
  const open = !!S.menu;
  return `<header class="ats-amplify-chat-docked__header"><div class="ats-amplify-chat-docked__title">
      <span class="ats-amplify-chat-docked__mark">${ic('amplify', 28, '', 'ats-amplify-chat-docked__mark-icon')}</span>
      <h2 class="ats-amplify-chat-docked__label">${esc(title())}</h2>
      ${S.trigger === 'name' ? iconBtn('chevron-down', 'Chat history', `data-menu aria-haspopup="${S.type === 'full' ? 'dialog' : 'listbox'}" aria-expanded="${open}"`, open) : ''}</div>
    <div class="ats-amplify-chat-docked__actions">${iconBtn('add-thin', 'New chat', 'data-new')}${S.trigger === 'clock' ? iconBtn('clock', 'Chat history', `data-menu aria-haspopup="${S.type === 'full' ? 'dialog' : 'listbox'}" aria-expanded="${open}"`, open) : ''}${iconBtn('external-open', 'Pop out')}${iconBtn('close', 'Close Amplify')}</div></header>`;
}
function renderChat() {
  $('#chat').innerHTML = `<div class="ats-amplify-chat-docked__panel">${headerHTML()}${S.menu === 'record' ? recordMenu() : S.menu === 'all' ? allMenu() : ''}
    <div class="ats-amplify-chat-docked__main">${S.lib ? libHTML() : ''}<div class="ats-amplify-chat-conversation" data-size="docked"><div class="ats-amplify-chat-conversation__scroll" id="convScroll">
      <div class="ats-amplify-chat-conversation__column" role="log" aria-live="polite" aria-label="Conversation">${turnsHTML()}</div>
      <div class="ats-amplify-chat-conversation__input">${inputHTML()}</div></div></div></div></div>`;
  const ta = $('#chat textarea'), send = $('#chat [data-send]');
  const go = () => { const v = ta.value.trim(); if (v) ask(v); };
  ta.addEventListener('input', () => { send.disabled = !ta.value.trim(); ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'; });
  ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); go(); } });
  send.onclick = go;
  const sc = $('#convScroll'); if (sc) sc.scrollTop = sc.scrollHeight;
  placeMenu();
}
// Dropdowns sit 4px below the button that opened them, overlapping the header, and stay inside the panel.
function placeMenu() {
  const m = $('#chat .hd'), btn = $('#chat [data-menu]'); if (!m || !btn) return;
  const host = $('#chat').getBoundingClientRect(), canvas = $('.ats-bowling-alley-shell__canvas').getBoundingClientRect();
  // the part of the panel that is on screen
  const v = { left: Math.max(host.left, canvas.left, 0), right: Math.min(host.right, canvas.right, innerWidth), bottom: Math.min(host.bottom, canvas.bottom, innerHeight) };
  const r = btn.getBoundingClientRect(), EDGE = 8, top = r.bottom - host.top + 4;
  const vw = v.right - v.left - EDGE * 2;
  m.style.top = top + 'px';
  m.style.maxHeight = Math.max(160, v.bottom - r.bottom - 4 - EDGE) + 'px';
  if (m.classList.contains('hd--record')) {
    m.style.width = Math.min(340, vw) + 'px'; m.style.maxWidth = vw + 'px';
    const w = m.offsetWidth, minL = v.left - host.left + EDGE, maxL = v.right - host.left - EDGE - w;
    const want = S.trigger === 'clock' ? r.right - host.left - w : r.left - host.left;
    m.style.left = Math.max(minL, Math.min(want, maxL)) + 'px'; m.style.right = 'auto';
  } else {
    m.style.left = (v.left - host.left + EDGE) + 'px'; m.style.right = (host.right - v.right + EDGE) + 'px';
  }
  const list = m.querySelector('.ats-amplify-chat-chats-panel__list'), bar = m.querySelector('.ats-amplify-chat-chats-panel__toolbar');
  if (list && bar) list.onscroll = () => bar.classList.toggle('is-scrolled', list.scrollTop > 0);
}
addEventListener('resize', () => placeMenu());
// First message creates a chat on this record; its title becomes the header name.
function ask(text) {
  let c = S.chatId && chat(S.chatId);
  if (!c) { c = { id: 'c' + ++uid, title: text.length > 38 ? text.slice(0, 36) + '…' : text, rec: S.rec, group: 'Today', ago: 'Just now', desc: '', turns: [] }; CHATS.unshift(c); S.chatId = c.id; }
  c.turns.push({ u: text }, { a: 'Prototype reply. This chat is saved on ' + RECORDS[S.rec].label + '.' }); c.ago = 'Just now';
  const typing = document.activeElement?.matches?.('#chat textarea');
  S.menu = null; S.lib = false; renderChat(); if (typing) $('#chat textarea').focus({ preventScroll: true });
}

// ===== History dropdowns =====
const searchBox = (placeholder) => `<div class="ats-search-input ats-search-input--pill${S.q ? ' is-active' : ''}"><span class="ats-search-input__icon">${ic('search', 12, 'var(--search-color-content-icon)')}</span>
  <input class="ats-search-input__input" type="search" id="hq" placeholder="${placeholder}" aria-label="${placeholder}" value="${esc(S.q)}"></div>`;
const hit = (c) => { const q = S.q.trim().toLowerCase(); return !q || [c.title, c.desc, (c.rc || REC_OF[c.rec] || {}).label].join(' ').toLowerCase().includes(q); };

// Option A: only chats from this record. Smaller, simple rows, most recent first, link to full history.
function recordMenu() {
  const rows = CHATS.filter((c) => onRecord(c) && hasTurns(c) && hit(c));
  return `<div class="hd hd--record${S.trigger === 'clock' ? ' hd--end' : ''}" role="listbox" aria-label="Chats on ${esc(RECORDS[S.rec].label)}">
    <div class="hd__bar">${searchBox('Search this record’s chats')}</div>
    <div class="hd__list">
      ${rows.map((c) => `<button type="button" class="hr" role="option" data-open="${c.id}" aria-selected="${c.id === S.chatId}" ${c.id === S.chatId ? 'aria-current="true"' : ''}>
        <span class="hr__t">${esc(c.title)}</span><span class="hr__ago">${esc(c.ago)}</span>${c.id === S.chatId ? ic('check', 12) : ''}</button>`).join('')
        || `<p class="hd__empty" role="status">${S.q ? `No chats match “${esc(S.q)}”` : 'No chats on this record yet.'}</p>`}</div>
    ${S.type === 'record-link' ? `<div class="hd__foot"><button type="button" class="hr hr--link" data-fullhist>Full chat history${ic('next', 12)}</button></div>` : ''}</div>`;
}

// Option B: everything in the Chats panel, minus New Chat, with "On this record" first (same cards).
function card(c) {
  const rc = c.scheduled ? null : (c.rc || REC_OF[c.rec]);
  const sel = c.id === S.chatId;
  return `<li><div class="ats-amplify-chat-chat-card${sel ? ' is-selected' : ''}${c.scheduled ? ' is-unread' : ''}" data-type="${c.scheduled ? 'scheduled' : 'chat'}"><div class="ats-amplify-chat-chat-card__list-item">
    <div class="ats-amplify-chat-chat-card__header"><button type="button" class="ats-amplify-chat-chat-card__title" data-open="${c.id}" title="${esc(c.title)}" ${sel ? 'aria-current="page"' : ''} ${c.scheduled ? `aria-label="${esc(c.title)}, 1 new run"` : ''}>${esc(c.title)}</button>
      ${c.scheduled ? `<span class="ats-novo-chip ats-amplify-chat-chat-card__new" data-type="default" data-size="small" data-color="positive" aria-hidden="true"><span class="ats-novo-chip__label">1 new</span></span>` : `<span class="ats-amplify-chat-chat-card__ago">${esc(c.ago)}</span>`}</div>
    ${rc ? `<div class="ats-item-data ats-amplify-chat-chat-card__data"><span class="ats-item-field ats-amplify-chat-chat-card__record">${ic(rc.entity, 12, `var(--color-entity-${rc.entity})`)}<span class="ats-item-field__text">${esc(rc.label)}</span></span></div>` : ''}
    ${c.scheduled ? `<div class="ats-item-data ats-amplify-chat-chat-card__data"><span class="ats-item-field" data-type="status">${ic('clock-arrow', 12)}<span class="ats-item-field__text">Weekdays, 8–9 AM</span></span></div>` : c.desc ? `<p class="ats-amplify-chat-chat-card__description">${esc(c.desc)}</p>` : ''}
  </div></div></li>`;
}
// Same markup as ats-amplify-chat-chats-panel (toolbar, list, groups, chat cards, empty state), without its header.
function allMenu() {
  const all = CHATS.filter((c) => hasTurns(c) && hit(c));
  const here = all.filter(onRecord), rest = all.filter((c) => !onRecord(c) && !c.scheduled), sch = all.filter((c) => c.scheduled);
  const sec = (id, label, list, action = '') => list.length ? `<section class="ats-amplify-chat-chats-panel__group" aria-labelledby="hg-${id}">
      <div class="ats-amplify-chat-chats-panel__group-header"><h3 class="ats-amplify-chat-chats-panel__label" id="hg-${id}">${label}</h3>${action}</div>
      <ul class="ats-amplify-chat-chats-panel__cards">${list.map(card).join('')}</ul></section>` : '';
  const groups = ['Today', 'Yesterday', 'Previous 7 days', 'Older'].map((g) => sec(g.replace(/\W/g, ''), g, rest.filter((c) => c.group === g))).join('');
  const viewAll = '<button type="button" class="ats-btn ats-btn--dialogue ats-btn--small" data-viewall>View All</button>';
  return `<div class="hd hd--full" role="dialog" aria-label="Chat history"><div class="ats-amplify-chat-chats-panel__panel">
    <div class="ats-amplify-chat-chats-panel__toolbar">${searchBox('Search chats')}</div>
    <div class="ats-amplify-chat-chats-panel__list">${sec('here', 'On this record', here)}${sec('sched', 'Scheduled', sch, viewAll)}${groups}
      ${all.length ? '' : `<div class="ats-amplify-chat-chats-panel__empty" role="status">${ic('search', 64, 'var(--color-icon-illustration)')}
        <div class="ats-amplify-chat-chats-panel__empty-body"><p class="ats-amplify-chat-chats-panel__empty-title">No chats match “${esc(S.q.trim())}”</p><p class="ats-amplify-chat-chats-panel__empty-text">Try a different word.</p></div></div>`}</div>
  </div></div>`;
}

// ===== Docked prompt library: same tabs, search and cards as global; one column as a sheet over the conversation =====
function libHTML() {
  const q = S.libQ.trim().toLowerCase();
  const list = PROMPTS.filter((p) => S.libTab === 'all' || (S.libTab === 'favorites' ? p.fav : p.mine)).filter((p) => !q || (p.title + p.d).toLowerCase().includes(q));
  const tabs = [['favorites', 'Favorites'], ['mine', 'My Prompts'], ['all', 'All Prompts']];
  return `<div class="ats-amplify-chat-prompt-library dpl" role="dialog" aria-label="Prompt library">
    <div class="ats-amplify-chat-prompt-library__tab-bar"><div class="ats-amplify-chat-prompt-library__tabs" role="tablist" aria-label="Prompts">
      ${tabs.map(([k, l]) => `<button type="button" role="tab" class="ats-amplify-chat-prompt-library__tab${S.libTab === k ? ' is-active' : ''}" aria-selected="${S.libTab === k}" data-libtab="${k}">${l}</button>`).join('')}</div>
      ${iconBtn('close', 'Close prompt library', 'data-libclose')}</div>
    <div class="dpl__bar"><div class="ats-search-input ats-search-input--pill"><span class="ats-search-input__icon">${ic('search', 12, 'var(--search-color-content-icon)')}</span>
      <input class="ats-search-input__input" type="search" id="lq" placeholder="Search..." aria-label="Search prompts" value="${esc(S.libQ)}"></div>
      <button type="button" class="ats-btn ats-btn--secondary ats-btn--small ats-btn--pill">${ic('category-tags', 12)}All Categories${ic('chevron-down', 12)}</button></div>
    <div class="ats-amplify-chat-prompt-library__grid">${list.map((p) => `<div class="ats-amplify-chat-prompt-card"><div class="ats-amplify-chat-prompt-card__list-item">
      <div class="ats-amplify-chat-prompt-card__header-row"><div class="ats-amplify-chat-prompt-card__header">${ic(p.icon, 14)}<button type="button" class="ats-amplify-chat-prompt-card__title" data-prompt="${p.id}">${esc(p.title)}</button></div></div>
      <div class="ats-amplify-chat-prompt-card__content"><p class="ats-amplify-chat-prompt-card__description">${esc(p.d)}</p></div></div></div>`).join('')
      || `<p class="hd__empty" role="status">${S.libQ ? `No prompts match “${esc(S.libQ)}”` : 'No favorites yet'}</p>`}</div></div>`;
}

// ===== Open a chat. A chat lives on its record: from elsewhere, go to that record first. =====
function openChat(id) {
  const c = chat(id);
  S.menu = null; S.q = ''; S.lib = false;
  if (c.rec && c.rec !== S.rec) { S.rec = c.rec; renderPage(); toast(`Opened on ${RECORDS[c.rec].label}`); }
  else if (!c.rec) toast(`This chat has no record in the prototype, shown here`);
  S.chatId = id; renderChat(); render_guide();
}
function newChat() { S.chatId = null; S.menu = null; S.q = ''; S.lib = false; renderChat(); render_guide(); }

$('#chat').addEventListener('click', (e) => {
  // Re-rendering detaches e.target, so the outside-click handler on document would see it as "outside" and close the menu.
  e.stopPropagation();
  const t = (s) => e.target.closest(s); let b;
  if (t('[data-menu]')) { S.menu = S.menu ? null : (S.type === 'full' ? 'all' : 'record'); S.q = ''; S.lib = false; renderChat(); focusEl($('#hq')); return; }
  if (t('[data-viewall]')) { toast('The Scheduled page isn’t part of this prototype'); return; }
  if (t('[data-fullhist]')) { S.menu = 'all'; S.q = ''; renderChat(); focusEl($('#hq')); return; }
  if ((b = t('[data-open]'))) return openChat(b.dataset.open);
  if (t('[data-new]')) return newChat();
  if (t('[data-lib]')) { S.lib = !S.lib; S.menu = null; renderChat(); focusEl($('#lq')); return; }
  if (t('[data-libclose]')) { S.lib = false; renderChat(); focusEl($('[data-lib]')); return; }
  if ((b = t('[data-libtab]'))) { S.libTab = b.dataset.libtab; renderChat(); return; }
  if ((b = t('[data-prompt]'))) { const p = PROMPTS.find((x) => x.id === b.dataset.prompt); return ask(p.title); }
  if ((b = t('[data-ask]'))) return ask(b.dataset.ask);
  if (S.menu && !t('.hd')) { S.menu = null; renderChat(); }
});
$('#chat').addEventListener('input', (e) => {
  if (e.target.id === 'hq') { S.q = e.target.value; const p = e.target.selectionStart; renderChat(); const f = $('#hq'); f.focus(); f.setSelectionRange(p, p); }
  if (e.target.id === 'lq') { S.libQ = e.target.value; const p = e.target.selectionStart; renderChat(); const f = $('#lq'); f.focus(); f.setSelectionRange(p, p); }
});
addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (S.menu) { S.menu = null; renderChat(); focusEl($('[data-menu]')); } else if (S.lib) { S.lib = false; renderChat(); focusEl($('[data-lib]')); }
});
document.addEventListener('click', (e) => { if (S.menu && !e.target.closest('#chat')) { S.menu = null; renderChat(); } });

// ===== Prototype guide =====
function render_guide() {
  const seg = (key, opts) => `<div class="guide__seg" role="group" aria-label="${key}">${opts.map(([v, l]) => `<button type="button" class="ats-btn ats-btn--secondary ats-btn--small${S[key] === v ? ' is-on' : ''}" aria-pressed="${S[key] === v}" data-opt="${key}:${v}">${l}</button>`).join('')}</div>`;
  $('#guide').innerHTML = `<p class="guide__label">Open chat history</p>${seg('trigger', [['name', 'Chat name'], ['clock', 'History button']])}
    <p class="guide__label">Chat history type</p>${seg('type', [['record', 'This record'], ['record-link', 'This record + full link'], ['full', 'Full history']])}
    <p class="guide__label">Record</p>${seg('rec', [['cand', 'Candidate'], ['job', 'Job']])}
    <div class="guide__seg"><button type="button" class="ats-btn ats-btn--secondary ats-btn--small" data-reset>Reset</button></div>`;
}
$('#guide').addEventListener('click', (e) => {
  const o = e.target.closest('[data-opt]');
  if (o) { const [k, v] = o.dataset.opt.split(':'); S[k] = v; S.menu = null; S.lib = false; S.q = ''; if (k === 'rec') { S.chatId = null; renderPage(); } renderChat(); render_guide(); }
  if (e.target.closest('[data-reset]')) { S.chatId = null; S.menu = null; S.lib = false; S.q = ''; renderChat(); render_guide(); }
});
if (P.get('chat')) S.chatId = P.get('chat');
if (P.get('trigger')) S.trigger = P.get('trigger');
if (P.get('type')) S.type = P.get('type');
if (P.get('menu')) S.menu = S.type === 'full' ? 'all' : 'record';
renderPage(); renderChat(); render_guide();
