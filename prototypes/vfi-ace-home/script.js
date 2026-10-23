// ===== State (in memory only) =====
const S = {
  page: 'home',          // home | chat | scheduled | meetings | audits
  chatId: null,          // open chat id, null = new chat starting point
  chatsOpen: false,      // closed by default; a badge on the Chats button shows new runs
  menuOpen: false,
  editing: null,         // scheduled id being edited on the Scheduled page
  rowMenu: null,
  query: '',
  outFmt: 'A',          // run output format: A expandable · B digest · C table
};
let uid = 100;
// Programmatic focus only after the user has interacted. Otherwise an embedded copy (docs page)
// pulls focus on load and the browser scrolls the parent page to the iframe.
let userActed = false;
['pointerdown', 'keydown'].forEach((t) => addEventListener(t, () => { userActed = true; }, { capture: true, once: true }));
const focusEl = (el) => { if (el && userActed) el.focus({ preventScroll: true }); };

const SCHEDULES = [
  { id: 's1', name: 'Open job order status', prompt: 'Status changes on my open job orders, plus new matching candidates since the last run',
    freq: 'Weekdays', time: '08:00', status: 'active', next: 'Tomorrow, 8–9 AM', chat: 'c1', unread: 0, last: 'Today, 8:12 AM' },
];

// Scene 4: coverage verdict (full-page chat, ?chat=vfi4)
const VFI_COVERAGE = [
  ['B2B SaaS delivery experience', 41, 'Strong'],
  ['Enterprise CRM or ERP rollout', 33, 'Strong'],
  ['Salary within $115–135k', 22, 'Good'],
  ['PMP or Prince2 certified', 9, 'Thin'],
  ['Available within 30 days', 8, 'Thin'],
];
function vfiCoverage() {
  const head = (t) => `<div class="ats-amplify-chat-header ats-amplify-chat-header--section" role="heading" aria-level="3">${t}</div>`;
  const chipOf = { Strong: 'success', Good: 'default', Thin: 'warning' };
  const th = (l, cls = '') => `<th class="ats-ndt-th" scope="col"><div class="ats-ndt-cell ats-ndt-hcell"><span class="ats-ndt-hcell__label">${l}</span></div></th>`;
  const table = `<div class="ats-amplify-chat-data-table"><div class="ats-amplify-chat-data-table__scroll"><table class="ats-ndt__table" aria-label="Coverage across the 41 matches">
    <thead><tr class="ats-amplify-chat-data-table-header-row ats-ndt-hrow">${th('Requirement')}${th('Candidates')}${th('Coverage')}</tr></thead>
    <tbody>${VFI_COVERAGE.map(([r, n, v]) => `<tr class="ats-amplify-chat-data-table-row ats-ndt-row">
      <td class="ats-ndt-td"><div class="ats-ndt-cell"><span class="ats-ndt-cell__text">${r}</span></div></td>
      <td class="ats-ndt-td"><div class="ats-ndt-cell"><span class="ats-ndt-cell__text">${n}</span></div></td>
      <td class="ats-ndt-td"><div class="ats-ndt-cell"><span class="ats-novo-chip" data-type="default" data-size="medium" data-color="${chipOf[v]}"><span class="ats-novo-chip__label">${v}</span></span></div></td></tr>`).join('')}</tbody></table></div></div>`;
  const src = `<div class="ats-amplify-chat-sources-row cov__src"><div class="ats-amplify-chat-sources-row__summary"><span class="ats-amplify-chat-sources-row__summary-text">Based on 12,480 candidates and the lead details · Updated today</span>
    <button type="button" class="ats-icon-button-no-container ats-amplify-chat-sources-row__toggle" aria-expanded="false" aria-controls="vfi-src" aria-label="Show sources" data-toggle="vfi-src">${ic('chevron-down', 12)}</button></div>
    <ul class="ats-amplify-chat-sources-row__sources" id="vfi-src" hidden aria-label="Sources"><li><a class="ats-amplify-chat-sources-row__link" href="#">${ic('circle', 10, 'var(--color-entity-company)')}Nexus Dynamics</a></li><li><a class="ats-amplify-chat-sources-row__link" href="#">${ic('circle', 10, 'var(--color-entity-lead)')}Project Manager lead</a></li></ul></div>`;
  const next = `<div class="ats-card sched-card next-card">
    <div class="ats-card__header"><div class="ats-card__title">${ic('amplify', 16, '', 'amp-glyph')}<p class="ats-card__title-text">Suggested next step</p></div></div>
    <div class="next-card__body"><span class="t-strong">Create a tearsheet from the 41 matches</span>
      <span class="t-sm t-sec">Project Manager, Nexus Dynamics. Use it to check availability with the whole group.</span></div>
    <div class="sched-card__foot">${btn('Strong Matches Only (12)', { theme: 'secondary' })}${btn('Create Tearsheet', { theme: 'primary', icon: 'add-thin' })}</div></div>`;
  return userTurn('Do I have enough candidates to support the Project Manager lead at Nexus Dynamics?') +
    block(para('<b>Yes. Your database can support this role.</b> 41 candidates meet the core requirements, and 12 of them are strong matches.') +
      para('The lead needs a Project Manager with B2B SaaS delivery experience, based in the Boston area or open to hybrid. Coverage is strong on experience and thin on certification and availability.') +
      head('Coverage Across The 41') + table +
      head('Thin Areas') +
      para('Only 9 hold a PMP or Prince2 certification, and only 8 could start within 30 days. If the client requires either, the shortlist will be short.') + src,
      { actions: true }) +
    block(para('I can save the 41 to a tearsheet so you can check availability with all of them at once.') + next, { actions: false });
}

// Chat history. group: Today | Yesterday | Previous 7 days | Older. sched = scheduled id.
const CHATS = [
  { id: 'vfi4', title: 'Coverage: Project Manager, Nexus Dynamics', group: 'Today', ago: 'Just now', desc: '41 candidates match; 12 are strong', ctx: { e: 'company', l: 'Nexus Dynamics' }, context: [{ l: 'Nexus Dynamics', e: 'company' }, { l: 'Project Manager lead', e: 'lead' }], turns: 'vfi4' },
  { id: 'c1', title: 'Open job order status', group: 'Today', ago: '2 hours ago', sched: 's1', turns: 'run' },
  { id: 'c4', title: 'Shortlist for Product Manager, Nexus', group: 'Today', ago: '3 hours ago', desc: 'Jane Jones and Tyler Brooks meet 4 of 5 must-haves', ctx: { e: 'job', l: '425 | Project Manager' }, turns: [
    { u: 'Who are the strongest candidates for the Product Manager job at Nexus Dynamics?' },
    { a: 'Jane Jones and Tyler Brooks meet 4 of 5 must-haves. Jane has the most recent B2B SaaS experience.' } ] },
  { id: 'c5', title: 'Draft outreach to Marcus Lehmann', group: 'Yesterday', ago: '1 day ago', desc: 'Check-in email about the Data Analyst role', ctx: { e: 'contact', l: 'Marcus Lehmann' }, turns: [
    { u: 'Draft a short check-in email to Marcus Lehmann about the Data Analyst role.' },
    { a: 'Here is a draft. It references his last call on Oct 9 and asks for feedback on the two submittals.' } ] },
  { id: 'c3', title: 'Overdue submittal follow-ups', group: 'Yesterday', ago: '1 day ago', sched: 's3', turns: 'attn' },
  { id: 'c6', title: 'Interview prep: Harbor Labs', group: 'Previous 7 days', ago: '4 days ago', desc: 'Summary before the intake call', ctx: { e: 'company', l: 'Harbor Labs' }, turns: [
    { u: 'Summarise what I know about Harbor Labs before tomorrow’s intake call.' },
    { a: 'Harbor Labs has 3 open jobs, 1 on hold. Last placement was in August.' } ] },
  { id: 'c2', title: 'Placements starting next week', group: 'Previous 7 days', ago: '4 days ago', sched: 's2', turns: 'paused' },
  { id: 'c7', title: 'Candidates with expiring certifications', group: 'Older', ago: '3 weeks ago', desc: '4 candidates have certifications expiring before Dec 31', turns: [
    { u: 'Which of my active candidates have certifications expiring this quarter?' },
    { a: '4 candidates have certifications expiring before Dec 31.' } ] },
];

// ===== Helpers =====
const $ = (s, r = document) => r.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ic = (name, size = 16, color = '', cls = '') =>
  `<span class="ats-icon ${cls}" data-i="${name}" aria-hidden="true" style="width:${size}px;height:${size}px;${color ? `background-color:${color}` : ''}"></span>`;
const ampGlyph = (size = 16) => ic('amplify', size, '', 'amp-glyph');
const btn = (label, { theme = 'secondary', size = 'small', icon, attrs = '', color = '' } = {}) =>
  `<button type="button" class="ats-btn ats-btn--${theme} ats-btn--${size}${color ? ' ats-btn--' + color : ''}" ${attrs}>${icon ? ic(icon, size === 'small' ? 12 : 14) : ''}${label}</button>`;
const iconBtn = (icon, label, attrs = '') =>
  `<button type="button" class="ats-btn ats-btn--icon ats-btn--small" aria-label="${label}" ${attrs}>${ic(icon, 12)}</button>`;
const DELETED = {};
const sched = (id) => SCHEDULES.find((s) => s.id === id) || DELETED[id];
const chat = (id) => CHATS.find((c) => c.id === id);
const fmtTime = (t) => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
// Time windows, not exact times: a run lands somewhere inside the hour (engineering buffer)
const hr = (t) => +t.split(':')[0];
const h12 = (h) => ((h + 11) % 12) + 1, mer = (h) => (h % 24 < 12 ? 'AM' : 'PM');
const winShort = (t) => { const a = hr(t), b = a + 1; return mer(a) === mer(b) ? `${h12(a)}–${h12(b)} ${mer(b)}` : `${h12(a)} ${mer(a)}–${h12(b)} ${mer(b)}`; };
const winLong = (t) => { const a = hr(t), b = a + 1; return mer(a) === mer(b) ? `between ${h12(a)}:00 and ${h12(b)}:00 ${mer(b)}` : `between ${h12(a)}:00 ${mer(a)} and ${h12(b)}:00 ${mer(b)}`; };
const when = (s) => `${s.freq}, ${winLong(s.time)} ET`;
const WINDOWS = Array.from({ length: 13 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`);

const STATUS = {
  active: { label: 'Active', color: 'positive', icon: 'check-circle' },
  paused: { label: 'Paused', color: 'default', icon: 'inactive' },
  attention: { label: 'Needs attention', color: 'warning', icon: 'caution' },
};
const chip = (st) => { const s = STATUS[st];
  return `<span class="ats-novo-chip" data-type="default" data-size="small" data-color="${s.color}">${ic(s.icon, 10, 'var(--_chip-icon)', 'ats-novo-chip__icon')}<span class="ats-novo-chip__label">${s.label}</span></span>`; };

function toast(text, action) {
  const main = $('#main');
  main.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast'; el.setAttribute('role', 'status');
  el.innerHTML = `<span class="t-sm">${esc(text)}</span>${action ? btn(action.label, { theme: 'dialogue', attrs: 'data-toast-act' }) : ''}`;
  main.appendChild(el);
  if (action) el.querySelector('[data-toast-act]').onclick = () => { el.remove(); action.run(); };
  clearTimeout(toast.t); toast.t = setTimeout(() => el.remove(), 5000);
}

// ===== Navigation =====
const PAGES = {
  home: { label: 'Home', icon: 'home' },
  chat: { label: 'Chat', icon: 'comment-outline' },
  scheduled: { label: 'Scheduled', icon: 'clock' },
  meetings: { label: 'Meetings', icon: 'appointment' },
  audits: { label: 'Audits', icon: 'report' },
};
function go(page, opts = {}) {
  S.page = page;
  if (page === 'chat') { S.chatId = opts.sched ? newSchedChat() : (opts.chatId ?? null); const sc = SCHEDULES.find((x) => x.chat === S.chatId); if (sc) sc.unread = 0; }
  S.editing = opts.edit ?? null; S.rowMenu = null; S.cardMenu = null;
  closeMenu(); render();
  if (opts.focus) setTimeout(() => focusEl($(opts.focus)), 0);
}

// ===== Amplify menu (bowling alley dropdown) =====
function renderMenu() {
  const opt = (key, label, icon, meta = '') => {
    const cur = (key === 'new' && S.page === 'chat' && !S.chatId) || (key === S.page && key !== 'chat');
    return `<button type="button" class="ats-menu-option" data-type="default" role="menuitem" data-go="${key}" ${cur ? 'aria-current="page"' : ''}>
      ${ic(icon, 16, 'var(--color-icon-subtle)', 'ats-menu-option__icon')}<span class="ats-menu-option__label">${label}</span>${meta ? `<span class="amp-menu__meta">${meta}</span>` : ''}</button>`;
  };
  const active = SCHEDULES.filter((s) => s.status !== 'paused').length;
  $('#ampMenu').innerHTML =
    opt('home', 'Home', 'home') + opt('new', 'New Chat', 'add-thin') + opt('scheduled', 'Scheduled', 'clock', String(SCHEDULES.length)) +
    '<div class="amp-menu__sep" role="separator"></div>' + opt('meetings', 'Meetings', 'appointment') + opt('audits', 'Audits', 'report');
}
function openMenu() {
  renderMenu();
  const m = $('#ampMenu'), a = $('#ampTab'), st = $('#stage').getBoundingClientRect(), r = a.getBoundingClientRect();
  m.hidden = false; S.menuOpen = true;
  m.style.left = r.right - st.left + 8 + 'px';
  m.style.top = Math.min(r.top - st.top, st.height - m.offsetHeight - 8) + 'px';
  $('#ampNext').setAttribute('aria-expanded', 'true');
  focusEl(m.querySelector('.ats-menu-option'));
}
function closeMenu() {
  if (!S.menuOpen) return;
  $('#ampMenu').hidden = true; S.menuOpen = false;
  $('#ampNext').setAttribute('aria-expanded', 'false');
}
$('#ampNext').onclick = (e) => { e.stopPropagation(); S.menuOpen ? closeMenu() : openMenu(); };
// The Amplify tab and the breadcrumb root open Home
const goHome = () => go('home');
$('#ampTabBtn').onclick = () => goHome();
$('#ampMenu').addEventListener('click', (e) => {
  const b = e.target.closest('[data-go]'); if (!b) return;
  const k = b.dataset.go;
  k === 'new' ? go('chat', { chatId: null, focus: '.chat-start textarea' }) : go(k);
});
$('#ampMenu').addEventListener('keydown', (e) => {
  const items = [...$('#ampMenu').querySelectorAll('.ats-menu-option')], i = items.indexOf(document.activeElement);
  if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
  if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
  if (e.key === 'Escape') { closeMenu(); $('#ampNext').focus(); }
});
document.addEventListener('click', (e) => {
  if (S.menuOpen && !e.target.closest('#ampMenu')) closeMenu();
  if (S.rowMenu && !e.target.closest('.row-menu, [data-rowmenu]')) { S.rowMenu = null; renderMain(); }
  if (S.cardMenu && !e.target.closest('.row-menu, [data-cardmenu]')) { S.cardMenu = null; renderMain(true); }
});
$('#navToggle').onclick = () => {
  const sh = $('#shell'), open = sh.dataset.nav !== 'open';
  sh.dataset.nav = open ? 'open' : 'collapsed';
  $('#navToggle').setAttribute('aria-expanded', open);
  $('#navToggleIcon').dataset.i = open ? 'contract-left' : 'expand-right';
  closeMenu();
};

// ===== Header: breadcrumb (Amplify / current page) =====
function renderHeader() {
  let cur = PAGES[S.page].label;
  if (S.page === 'chat') cur = S.chatId ? chat(S.chatId).title : 'New Chat';
  const home = S.page === 'home';
  $('#crumbs').innerHTML = home
    ? `<li><span class="ats-icon-container" data-theme="amplify" data-size="sm">${ic('amplify', 12, 'var(--icon-container-icon)')}</span><h1 class="crumb-current">Amplify</h1></li>`
    : `<li><span class="ats-icon-container" data-theme="amplify" data-size="sm">${ic('amplify', 12, 'var(--icon-container-icon)')}</span><button type="button" class="crumb-link" data-crumb="home">Amplify</button></li>
       <li><span class="crumb-sep" aria-hidden="true">/</span><h1 class="crumb-current" aria-current="page">${esc(cur)}</h1></li>`;
  const unread = SCHEDULES.reduce((n, x) => n + (x.unread || 0), 0);
  $('#hdrChats').innerHTML = `Chats${unread ? `<span class="hdr-badge" aria-hidden="true">${unread}</span>` : ''}`;
  $('#hdrChats').setAttribute('aria-label', unread ? `Chats, ${unread} new` : 'Chats');
  $('#hdrChats').setAttribute('aria-pressed', S.chatsOpen);
  $('#hdrChats').classList.toggle('is-on', S.chatsOpen);
  document.title = `${home ? 'Amplify' : cur + ' · Amplify'}`;
}
$('#crumbs').addEventListener('click', (e) => { if (e.target.closest('[data-crumb]')) goHome(); });
$('#hdrChats').onclick = () => { S.chatsOpen = !S.chatsOpen; render(); };

// ===== Chats panel (right): new chat, search, Scheduled, history by time =====
const SCHED_LIMIT = 3;
function renderChats() {
  const el = $('#chats');
  el.hidden = !S.chatsOpen;
  if (!S.chatsOpen) return;
  const q = S.query.trim().toLowerCase();
  const hit = (t) => !q || t.toLowerCase().includes(q);
  const cur = (id) => (S.page === 'chat' && S.chatId === id ? 'aria-current="page"' : '');
  const hist = CHATS.filter((c) => !SCHEDULES.some((x) => x.chat === c.id) && !c.pending && hit(c.title + ' ' + (c.desc || '') + ' ' + (c.ctx?.l || '')));
  const scheds = SCHEDULES.filter((s) => hit(s.name));
  const groups = ['Today', 'Yesterday', 'Previous 7 days', 'Older'];
  const ctx = (c) => c.ctx ? `<span class="ci__ctx">${ic(c.ctx.e, 12, `var(--color-entity-${c.ctx.e})`)}<span>${esc(c.ctx.l)}</span></span>` : '<span></span>';
  const item = (c) => `<li><button type="button" class="ci" data-chat="${c.id}" ${cur(c.id)}>
      <span class="ci__t">${esc(c.title)}</span>
      ${c.desc ? `<span class="ci__d">${esc(c.desc)}</span>` : ''}
      <span class="ci__f">${ctx(c)}<span class="ci__ago">${esc(c.ago)}</span></span></button></li>`;
  const sItem = (s) => { const st = STATUS[s.status];
    const un = s.unread > 0;
    return `<li><button type="button" class="ci ci--sched${un ? ' is-unread' : ''}" data-chat="${s.chat}" ${cur(s.chat)} ${un ? `aria-label="${esc(s.name)}, ${s.unread} new run${s.unread > 1 ? 's' : ''}"` : ''}>
      <span class="ci__top"><span class="ci__t">${un ? '<span class="ci__dot" aria-hidden="true"></span>' : ''}${esc(s.name)}</span>
        ${un ? `<span class="ats-novo-chip" data-type="default" data-size="small" data-color="positive" aria-hidden="true"><span class="ats-novo-chip__label">${s.unread} new</span></span>` : `<span class="ci__ago">${esc(s.last || '')}</span>`}</span>
      <span class="ci__f"><span class="ci__ctx">${ic('clock', 12, 'var(--color-icon-subtle)')}<span>${esc(s.freq)}, ${winShort(s.time)}</span></span>
        ${s.status === 'active' ? '' : `<span class="ci__st ci__st--${s.status}">${ic(st.icon, 12, s.status === 'attention' ? 'var(--color-icon-utility-warning)' : 'var(--color-icon-subtle)')}${st.label}</span>`}</span></button></li>`; };
  el.innerHTML = `
    <div class="chats__top">
      <div class="chats__title-row"><h2 class="chats__title">Chats</h2>
        <div class="chats__title-acts">${iconBtn('close', 'Close chats', 'data-closechats')}</div></div>
      ${btn('New Chat', { icon: 'add-thin', attrs: 'data-newchat style="width:100%;justify-content:center"' })}
      <div class="ats-search-input ats-search-input--pill${q ? ' is-active' : ''}">
        <span class="ats-search-input__icon">${ic('search', 12, 'var(--search-color-content-icon)')}</span>
        <input class="ats-search-input__input" type="search" placeholder="Search chats" aria-label="Search chats" value="${esc(S.query)}" id="chatSearch">
      </div>
    </div>
    <div class="chats__list">
      <section class="chats__group" aria-labelledby="g-sched">
        <div class="chats__ghead"><span class="chats__label" id="g-sched">Scheduled <span class="chats__count">${SCHEDULES.length}</span></span>
          <span class="chats__gacts">${btn('View All', { theme: 'dialogue', attrs: 'data-go-sched' })}</span></div>
        <ul class="ci-list">${scheds.slice(0, q ? 99 : SCHED_LIMIT).map(sItem).join('')}</ul>
        ${!q && SCHEDULES.length > SCHED_LIMIT ? `<button type="button" class="chats__more" data-go-sched>${SCHEDULES.length - SCHED_LIMIT} more in Scheduled</button>` : ''}
      </section>
      ${groups.map((g) => { const cs = hist.filter((c) => c.group === g); const gid = 'g-' + g.replace(/\W/g, ''); return cs.length ? `
        <section class="chats__group" aria-labelledby="${gid}">
          <div class="chats__ghead"><span class="chats__label" id="${gid}">${g}</span></div><ul class="ci-list">${cs.map(item).join('')}</ul></section>` : ''; }).join('')}
      ${q && !hist.length && !scheds.length ? `<p class="chats__empty">No chats match “${esc(S.query)}”.</p>` : ''}
    </div>`;
}
$('#chats').addEventListener('click', (e) => {
  const c = e.target.closest('[data-chat]'); if (c) return go('chat', { chatId: c.dataset.chat });
  if (e.target.closest('[data-go-sched]')) return go('scheduled');
  if (e.target.closest('[data-newchat]')) return go('chat', { chatId: null, focus: '.chat-start textarea' });
  if (e.target.closest('[data-newsched]')) return go('chat', { chatId: null, sched: true, focus: '[data-cq="0"]' });
  if (e.target.closest('[data-closechats]')) { S.chatsOpen = false; render(); $('#hdrChats').focus(); }
});
$('#chats').addEventListener('input', (e) => {
  if (e.target.id !== 'chatSearch') return;
  S.query = e.target.value; const pos = e.target.selectionStart;
  renderChats(); const f = $('#chatSearch'); f.focus(); f.setSelectionRange(pos, pos);
});

// ===== Chat input (ats-amplify-chat-input markup) =====
function chatInput({ labels = true, placeholder = 'What would you like to know or do today?', id = '', questions = null, context = null } = {}) {
  const tool = (icon, label) => `<button type="button" class="ats-btn ats-btn--dialogue ats-btn--small" ${labels ? '' : `aria-label="${label}"`}>${ic(icon, 12)}${labels ? label : ''}</button>`;
  const ctxRow = !questions && context && context.length ? `<div class="ats-amplify-chat-context-container" data-size="full page">
      <span class="ats-amplify-chat-context-container__label">Context:</span>
      <div class="ats-amplify-chat-context-container__chips">${context.map((x, i) => `<span class="ats-novo-chip ats-amplify-chat-context-container__chip" data-type="default" data-size="medium" data-color="default" style="--_ctx-entity:${x.e ? `var(--color-entity-${x.e})` : 'var(--color-icon-subtle)'}">
        ${ic(x.e ? 'circle' : 'clock', 10, 'var(--_ctx-entity)', 'ats-novo-chip__icon')}<span class="ats-novo-chip__label">${esc(x.l)}</span>
        <button type="button" class="ats-novo-chip__remove" aria-label="Remove ${esc(x.l)}" data-ctx-remove="${i}">${ic('close', 10, 'var(--_chip-icon)')}</button></span>`).join('')}</div></div>` : '';
  return `<div class="ats-amplify-chat-container">${questions ? clarify(questions) : ctxRow}<div class="ats-amplify-chat-input" data-size="full page">
    <textarea class="ats-amplify-chat-text-area" rows="1" aria-label="Message Amplify" placeholder="${placeholder}" ${id ? `id="${id}"` : ''}></textarea>
    <div class="ats-amplify-chat-button-row${labels ? '' : ' ats-amplify-chat-button-row--icons-only'}">
      <div class="ats-amplify-chat-button-row__tools">${tool('add-thin', 'Add File')}${tool('tools', 'Add Tools')}${tool('book', 'Prompt Library')}</div>
      <button type="button" class="ats-btn ats-btn--primary ats-btn--small ats-btn--amplify ats-amplify-chat-button-row__send" aria-label="Send" disabled data-send>${ic('arrow-up', 12)}</button>
    </div></div></div>`;
}
function wireInput(root, onSend) {
  const ta = root.querySelector('textarea'), send = root.querySelector('[data-send]');
  const sync = () => { send.disabled = !ta.value.trim(); ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 400) + 'px'; };
  ta.addEventListener('input', sync);
  ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (ta.value.trim()) { onSend(ta.value.trim()); } } });
  send.onclick = () => ta.value.trim() && onSend(ta.value.trim());
}

// Scene 1: the start of the day. Three ranked priorities, nothing acted on yet.
const MEETINGS = [
  { t: '09:15', n: 'Team stand-up', w: 'Microsoft Teams · 20 min' },
  { t: '14:00', n: 'Debrief: Tyler Brooks', w: 'Nexus Dynamics hiring team' },
];
const ACTIONS = [
  { id: 'a1', t: 'Confirm final details with Harbor Labs', s: 'Start date and rate need sign-off today', act: 'Review Confirmation' },
  { id: 'a2', t: 'Follow up after Jane Jones’s interview', s: 'Nexus Dynamics has not shared feedback yet', act: 'Draft Follow-up' },
  { id: 'a3', t: 'Join the 09:15 team stand-up', s: 'Microsoft Teams · starts in 20 minutes', act: 'Open Teams' },
];
const SUGGEST = [
  { e: 'company', t: 'Prep notes for the Harbor Labs confirmation' },
  { e: 'candidate', t: 'Check in with Jane Jones before the client replies' },
];
const KNOW = [
  { html: '<b>425 | Project Manager</b> moved to Accepting Candidates. <b>Jane Jones</b> is the strongest match.', link: 'Open run', chat: 'c1' },
  { html: '<b>Nexus Dynamics</b> interview feedback is due by end of day.', link: 'Open chat', chat: 'c4' },
];
S.showDone = false;
const greet = () => 'Good morning';
const dayName = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });

function renderHome() {
  const open = ACTIONS.filter((a) => !a.done), done = ACTIONS.filter((a) => a.done);
  const action = (a, i) => `<li class="todo${a.done ? ' is-done' : ''}">
      <span class="todo__rank" aria-label="Priority ${i + 1}">${i + 1}</span>
      <div class="todo__body"><span class="todo__t">${esc(a.t)}</span><span class="todo__s">${esc(a.s)}</span></div>
      ${!a.done && a.act ? btn(a.act, { attrs: a.chat ? `data-chat="${a.chat}"` : a.edit ? `data-edit="${a.edit}"` : '' }) : ''}</li>`;
  return `<div class="page"><div class="page-inner home">
    <div class="home-head">
      <div><h2 class="home-greet">${greet()}, Chloe. Here are your top ${open.length} priorities for today.</h2></div>
      ${btn('Customize', { theme: 'secondary', icon: 'configure-outline', attrs: 'data-customize' })}
    </div>
    <div class="home-grid">
      <div class="home-col">
        <div class="home-start">${chatInput({ labels: false, placeholder: 'Ask Amplify, or type “set up scheduled task”' })}</div>
        <section class="ats-card home-card prio" aria-labelledby="todoH">
          <div class="ats-card__header"><div class="ats-card__title"><h3 class="ats-card__title-text" id="todoH">Priorities <span class="chats__count">${open.length}</span></h3></div><span class="t-meta">Ranked by Ace</span></div>
          <ul class="todos">${open.map((a, i) => action(a, i)).join('')}</ul>
        </section>
        <section aria-labelledby="sugH" class="home-sec">
          <div class="sec-head"><h3 class="home-label" id="sugH">Suggested</h3></div>
          <ul class="sugs">${SUGGEST.map((x) => `<li><button type="button" class="sug" data-ask="${esc(x.t)}">
            <span class="ats-icon-container" data-theme="${x.e}" data-size="sm">${ic(x.e, 12, 'var(--icon-container-icon)')}</span>
            <span class="sug__t">${esc(x.t)}</span><span class="sug__go">Ask${ic('next', 12, 'currentColor')}</span></button></li>`).join('')}</ul>
        </section>
      </div>
      <div class="home-col">
        <section class="ats-card home-card" aria-labelledby="knowH">
          <div class="ats-card__header"><div class="ats-card__title"><h3 class="ats-card__title-text" id="knowH">Need to know</h3></div><span class="t-meta">Updated 08:12</span></div>
          <ul class="know">${KNOW.map((k) => `<li><p>${k.html}</p><button type="button" class="chats__more" ${k.chat ? `data-chat="${k.chat}"` : `data-edit="${k.edit}"`}>${k.link}</button></li>`).join('')}</ul>
        </section>
        <section class="ats-card home-card" aria-labelledby="dayH">
          <div class="ats-card__header"><div class="ats-card__title"><h3 class="ats-card__title-text" id="dayH">Today</h3></div>
            <span class="day-nav">${iconBtn('previous', 'Previous day')}${iconBtn('next', 'Next day')}</span></div>
          <ul class="agenda">${MEETINGS.map((m) => `<li><span class="agenda__time">${m.t}</span><div class="agenda__ev"><span class="t-strong">${m.n}</span><span class="t-sm t-sec">${m.w}</span></div></li>`).join('')}</ul>
        </section>
      </div>
    </div></div></div>`;
}
function onHome(e) {
  const t = (s) => e.target.closest(s); let b;
  if ((b = t('[data-todo]'))) {
    const a = ACTIONS.find((x) => x.id === b.dataset.todo); a.done = b.checked; renderMain();
    if (a.done) toast('Marked done.', { label: 'Undo', run: () => { a.done = false; renderMain(); } });
    return true;
  }
  if (t('[data-showdone]')) { S.showDone = !S.showDone; renderMain(); return true; }
  if ((b = t('[data-ask]'))) { startChat(b.dataset.ask); return true; }
  if (t('[data-customize]')) { toast('Customizing Home isn’t part of this prototype.'); return true; }
  return false;
}

// ===== Chat parts (ats-amplify-chat markup) =====
const userTurn = (t) => `<div class="ats-amplify-chat-user-turn"><div class="ats-amplify-chat-user-bubble"><div class="ats-amplify-chat-user-bubble__viewport"><div class="ats-amplify-chat-user-bubble__message">${esc(t)}</div></div></div></div>`;
const para = (html) => `<p class="ats-amplify-chat-text ats-amplify-chat-text--paragraph" style="margin:0"><span class="ats-amplify-chat-text__content">${html}</span></p>`;
const ibnc = (icon, label) => `<button type="button" class="ats-icon-button-no-container" aria-label="${label}">${ic(icon, 12)}</button>`;
const block = (body, { actions = true, right = '', left = '' } = {}) => `<div class="ats-amplify-chat-chat-block" role="article" aria-label="Amplify reply">
  <div class="ats-amplify-chat-chat-block__identity">${ic('amplify', 16, '', 'ats-amplify-chat-chat-block__identity-icon')}<span class="ats-amplify-chat-chat-block__identity-name">Amplify</span></div>
  <div class="ats-amplify-chat-chat-block__body">${body}</div>
  ${actions || right || left ? `<div class="ats-amplify-chat-chat-block__controls"><div class="ats-amplify-chat-chat-block__actions">${actions ? ibnc('copy', 'Copy reply') + ibnc('thumbs-up-line', 'Good response') + ibnc('thumbs-down-line', 'Bad response') : ''}${left}</div>${right}</div>` : ''}
</div>`;
const thinking = () => `<div class="ats-amplify-chat-chat-block" role="article" aria-busy="true" aria-label="Amplify is working"><p class="ats-amplify-chat-text ats-amplify-chat-text--status" style="margin:0">${ic('amplify', 16, '', 'ats-amplify-chat-text__icon')}<span class="ats-amplify-chat-text__content">Thinking…</span></p></div>`;
const runMeta = (whenTxt) => `<div class="run-meta t-meta">${ic('clock', 12, 'var(--color-icon-subtle)')}<span>Scheduled run · ${whenTxt}</span></div>`;

// ===== Schedule card: one component for create (in chat) and edit (Scheduled page) =====
const FREQS = ['Daily', 'Weekdays', 'Mondays', 'Fridays'];
function schedCard(d, ctx) {
  const k = `${ctx}-${d.id}`;
  if (d.saved && ctx === 'chat') return confirmCard(sched(d.sid) || d);
  if (d.cancelled) return para('<span class="t-sec">Schedule not saved.</span>');
  return `<div class="ats-card sched-card" data-card="${d.id}" data-ctx="${ctx}">
    <div class="ats-card__header"><div class="ats-card__title">${ic('clock', 16)}<p class="ats-card__title-text">${ctx === 'chat' ? 'New scheduled prompt' : 'Edit schedule'}</p></div></div>
    <div class="sf">
      <label for="n-${k}">Name</label><input class="fld" type="text" id="n-${k}" data-f="name" value="${esc(d.name)}">
      <label for="p-${k}">Prompt</label><input class="fld" type="text" id="p-${k}" data-f="prompt" value="${esc(d.prompt)}">
      <label for="f-${k}">Repeats</label>
      <div class="sf-row"><select class="fld" id="f-${k}" data-f="freq">${FREQS.map((f) => `<option ${f === d.freq ? 'selected' : ''}>${f}</option>`).join('')}</select>
        <select class="fld" aria-label="Time window" data-f="time">${WINDOWS.map((w) => `<option value="${w}" ${w === d.time ? 'selected' : ''}>Between ${winLong(w).slice(8)}</option>`).join('')}</select><span class="t-meta" style="align-self:center">ET</span></div>
      <span></span><span class="t-meta" style="margin-top:calc(var(--spacing-8) * -1)">Each run arrives within this hour.</span>
      <span class="sf-l">Results</span><span class="sf-v">Posted to this chat. You’ll get a Teams notification with a link back here.</span>
    </div>
    <div class="sf-access">${ic('lock', 12, 'var(--color-icon-subtle)')}Runs with your access. Data stays in Bullhorn.</div>
    <div class="sched-card__foot">${btn('Cancel', { theme: 'dialogue', attrs: 'data-card-cancel' })}${btn(ctx === 'chat' ? 'Schedule' : 'Save', { theme: 'primary', attrs: 'data-card-save' })}</div>
  </div>`;
}
function readCard(card, d) { card.querySelectorAll('[data-f]').forEach((f) => { d[f.dataset.f] = f.value.trim() || d[f.dataset.f]; }); }
const nextRun = (d) => ({ Daily: 'Thu, Oct 15', Weekdays: 'Thu, Oct 15', Mondays: 'Mon, Oct 19', Fridays: 'Fri, Oct 16' })[d.freq] + ', ' + winShort(d.time);

// ===== Scheduled-run chats (seeded) =====
// Confirmation after scheduling: a card, with Edit + View in Scheduled
function confirmCard(sc) {
  return `<div class="ats-card sched-card">
    <div class="ats-card__header"><div class="ats-card__title">${ic('check-circle', 16, 'var(--color-icon-utility-success)')}<p class="ats-card__title-text">Scheduled</p></div>
      ${sc.status === 'active' ? '' : chip(sc.status)}</div>
    <div class="ats-card__pad sched-confirm">
      <span class="t-strong">${esc(sc.name)}</span>
      <span class="t-sm t-sec">${esc(when(sc))}${sc.status === 'active' && sc.next ? ` · Next run ${esc(sc.next)}` : ''}</span>
    </div>
    <div class="sched-card__foot">${btn('Edit', { theme: 'dialogue', attrs: `data-edit="${sc.id}"` })}${btn('View in Scheduled', { attrs: 'data-go-sched' })}</div>
  </div>`;
}

// Scheduled run output: one card per run. Header = when; body = summary + expandable record rows; footer = the card's base button.
// Scheduled run output. Three formats to compare (switch in the prototype guide):
//  A = Expandable records · B = Digest · C = Compact table. Every format can fork into a new chat.
const RUNS = {}, OPEN_ROWS = new Set();
const forkBtn = (key, label = 'Continue in New Chat') => btn(label, { theme: 'dialogue', icon: 'comment-outline', attrs: `data-fork="${key}"` });
function runCard(r) {
  RUNS[r.id] = r;
  const fmt = r.rows ? S.outFmt : 'A';
  const sc = sched(r.sid), open = S.cardMenu === r.id;
  const menu = sc && SCHEDULES.includes(sc) ? `<div class="run-card__menu">
      <button type="button" class="ats-btn ats-btn--icon ats-btn--small" aria-label="Schedule actions for ${esc(sc.name)}" aria-haspopup="menu" aria-expanded="${open}" data-cardmenu="${r.id}">${ic('kebab-menu', 12)}</button>
      ${open ? `<div class="ats-dropdown-card row-menu" role="menu">
        <button type="button" class="ats-menu-option" data-type="default" role="menuitem" data-edit="${sc.id}">${ic('edit-outline', 16, 'var(--color-icon-subtle)', 'ats-menu-option__icon')}<span class="ats-menu-option__label">Edit schedule</span></button>
        ${sc.status === 'active'
          ? `<button type="button" class="ats-menu-option" data-type="default" role="menuitem" data-pause="${sc.id}">${ic('inactive', 16, 'var(--color-icon-subtle)', 'ats-menu-option__icon')}<span class="ats-menu-option__label">Pause schedule</span></button>`
          : `<button type="button" class="ats-menu-option" data-type="default" role="menuitem" data-resume="${sc.id}">${ic('refresh', 16, 'var(--color-icon-subtle)', 'ats-menu-option__icon')}<span class="ats-menu-option__label">Resume schedule</span></button>`}
      </div>` : ''}</div>` : '';
  const head = `<div class="ats-card__header"><div class="ats-card__title">${ic(r.attn ? 'caution' : 'clock', 16, r.attn ? 'var(--color-icon-utility-warning)' : '')}<p class="ats-card__title-text">${esc(r.when)}</p></div>
      <span class="t-meta">Scheduled run</span>${menu}</div>`;
  const foot = r.foot ? `<div class="ats-card__footer"><button type="button" class="ats-btn ats-btn--base ats-btn--default">${esc(r.foot)}${ic('next', 14)}</button></div>` : '';
  let body = '';
  if (fmt === 'A') {
    body = `<p class="run-card__sum">${r.sum}</p>` + (r.rows ? `<ul class="rr-list">${r.rows.map((x, i) => {
      const id = `${r.id}-${i}`;
      return `<li class="rr">
        <button type="button" class="rr__btn" aria-expanded="${OPEN_ROWS.has(id)}" aria-controls="${id}" data-toggle="${id}">
          ${ic(x.e, 12, `var(--color-entity-${x.e})`)}
          <span class="rr__main"><span class="rr__name">${esc(x.name)}</span><span class="rr__chg">${esc(x.chg)}</span></span>
          ${ic('chevron-down', 12, 'var(--color-icon-subtle)', 'rr__chev')}
        </button>
        <div class="rr__detail" id="${id}" ${OPEN_ROWS.has(id) ? '' : 'hidden'}>${x.detail}<div class="rr__acts">${x.acts || ''}${forkBtn(`${r.id}:${i}`)}</div></div></li>`;
    }).join('')}</ul>` : '');
  } else if (fmt === 'B') {
    body = `<div class="digest">
      ${r.metrics ? `<div class="digest__metrics">${r.metrics.map((m) => `<span class="digest__metric"><span class="digest__n">${m[0]}</span><span class="t-meta">${m[1]}</span></span>`).join('')}</div>` : ''}
      <ul class="digest__list">${r.rows.map((x, i) => `<li>${ic(x.e, 12, `var(--color-entity-${x.e})`)}<span class="digest__item"><a class="rec-link" href="#">${esc(x.name)}</a><span class="digest__desc">${esc(x.desc || x.chg)}</span></span>
        <button type="button" class="ats-icon-button-no-container digest__fork" aria-label="Continue ${esc(x.name)} in a new chat" title="Continue in new chat" data-fork="${r.id}:${i}">${ic('comment-outline', 12)}</button></li>`).join('')}</ul></div>`;
  } else {
    body = `<p class="run-card__sum">${r.sum}</p>
      <div class="rt" role="table" aria-label="Run results">
        <div class="rt__row rt__head" role="row"><span role="columnheader">Record</span><span role="columnheader">Change</span><span role="columnheader"><span class="sr">Actions</span></span></div>
        ${r.rows.map((x, i) => `<div class="rt__row" role="row">
          <span role="cell" class="rt__rec">${ic(x.e, 12, `var(--color-entity-${x.e})`)}<a class="rec-link" href="#">${esc(x.name)}</a></span>
          <span role="cell" class="t-sm t-sec">${esc(x.chg)}</span>
          <span role="cell" class="rt__acts">${forkBtn(`${r.id}:${i}`, 'Continue')}</span></div>`).join('')}
      </div>`;
  }
  return `<div class="ats-card run-card${r.attn ? ' run-card--attn' : ''}" data-fmt="${fmt}">${head}<div class="ats-card__content">${body}</div>${foot}</div>`;
}
const cand = (n, d, ev) => `<li class="rr__cand"><span class="rr__cname">${n}</span><span class="t-sm t-sec">${d}</span><span class="t-meta">${ev}</span></li>`;

function seededTurns(c) {
  if (c.turns === 'vfi4') return vfiCoverage();
  const s = sched(c.sched);
  const head = userTurn(s.prompt + ', ' + s.freq.toLowerCase() + ' ' + winLong(s.time) + '.') + block(confirmCard(s), { actions: false });
  if (c.turns === 'run') return head +
    block(runCard({ id: 'r1', sname: s.name, sid: s.id, when: 'Mon, Oct 12, 8:07 AM', sum: 'No status changes or new matches since Fri, Oct 9.' }), { actions: false }) +
    block(runCard({ id: 'r2', sname: s.name, sid: s.id, when: 'Today, 8:12 AM', foot: 'View all 14 job orders',
      sum: 'Checked 14 open job orders. <span class="t-strong">3 changed</span> and <span class="t-strong">6 new candidates</span> match since Mon, Oct 12.',
      rows: [
        { e: 'job', name: '425 | Project Manager', chg: 'Accepting Candidates · 4 new matches', desc: 'Moved to Accepting Candidates. 4 new matches, led by Jane Jones (4 of 5 must-haves) and Tyler Brooks (3 of 5).',
          detail: `<ul class="rr__cands">${cand('Jane Jones', 'Senior PM, B2B SaaS', '4 of 5 must-haves')}${cand('Tyler Brooks', 'Product Manager, fintech', '3 of 5 must-haves')}</ul>`,
          acts: btn('Review Matches', { theme: 'dialogue' }) + btn('Open Job', { theme: 'dialogue', icon: 'external-open' }) },
        { e: 'job', name: '431 | Data Analyst', chg: 'Put on hold', desc: 'Moved from Accepting Candidates to On Hold. 2 active submittals are affected.',
          detail: `<p class="t-sm" style="margin:0">Status changed from Accepting Candidates to On Hold.</p>`, acts: btn('Open Job', { theme: 'dialogue', icon: 'external-open' }) },
        { e: 'job', name: '438 | Office Coordinator', chg: '2 new matches · matches may be incomplete', desc: '2 new matches. No skills are listed on the job, so matches may be incomplete.',
          detail: `<p class="t-sm" style="margin:0">No skills are listed on this job, so matches may be incomplete.</p>`, acts: btn('Add Skills', { theme: 'dialogue' }) },
      ], metrics: [['14', 'checked'], ['3', 'changed'], ['6', 'new matches']], sname: s.name, sid: s.id }), { actions: false, left: forkBtn('r2') });
  if (c.turns === 'attn') return head +
    block(runCard({ id: 'r3', when: 'Yesterday, 9:05 AM', attn: true, sname: s.name, sid: s.id,
      sum: `<span class="t-strong">Paused.</span> ${esc(s.reason || 'Needs attention.')} It won’t run until you review the scope.` }),
      { actions: false, right: `<div style="display:flex;gap:var(--spacing-8)">${btn('Review Scope', { theme: 'dialogue', attrs: `data-edit="${s.id}"` })}${btn('Resume Without Them', { theme: 'dialogue', attrs: `data-resume="${s.id}"` })}</div>` });
  return head +
    block(runCard({ id: 'r4', when: 'Fri, Oct 9, 4:09 PM', sum: '2 placements start next week. <span class="t-strong">1 needs attention.</span>',
      rows: [{ e: 'placement', name: 'Jane Jones · Nexus Dynamics', chg: 'Starts Mon, Oct 12 · offer letter not signed', desc: 'Starts Mon, Oct 12 at Nexus Dynamics. The offer letter is still not signed.', detail: '', acts: btn('Open Placement', { theme: 'dialogue', icon: 'external-open' }) },
        { e: 'placement', name: 'Tyler Brooks · Harbor Labs', chg: 'Starts Wed, Oct 14 · ready', desc: 'Starts Wed, Oct 14 at Harbor Labs. Onboarding is complete.', detail: '', acts: btn('Open Placement', { theme: 'dialogue', icon: 'external-open' }) }],
      metrics: [['2', 'starting'], ['1', 'needs attention']], sname: s.name, sid: s.id }), { actions: false, left: forkBtn('r4') }) +
    block(para(`<span class="t-sec">${s.status === 'paused' ? 'Paused by you on Fri, Oct 9.' : 'Resumed. Next run ' + esc(s.next) + '.'}</span>`), { actions: false, right: s.status === 'paused' ? btn('Resume', { theme: 'dialogue', attrs: `data-resume="${s.id}"` }) : '' });
}

// ===== New scheduled prompt: an active chat, Amplify asks; suggestions sit in clarifying questions =====
const SCHED_SUGGEST = [
  { label: 'Status update on my open job orders', desc: 'Weekdays, 8–9 AM', text: 'Every morning, send me a status update on my open job orders' },
  { label: 'Placements starting next week', desc: 'Fridays, 4–5 PM', text: 'Every Friday at 4 PM, list placements starting next week' },
  { label: 'Submittals with no client feedback after 3 days', desc: 'Daily, 9–10 AM', text: 'Every day at 9 AM, list submittals with no client feedback after 3 business days' },
];
function newSchedChat() {
  const c = { id: 'c' + ++uid, title: 'New scheduled prompt', group: 'Today', ago: 'Just now', pending: true, forceSched: true,
    turns: [{ a: 'What should I run for you, and when?', plain: true }],
    questions: { q: 'Start from a common schedule, or describe your own', options: SCHED_SUGGEST } };
  CHATS.unshift(c); return c.id;
}
function clarify(qs) {
  return `<div class="ats-amplify-chat-clarifying-questions" data-size="full page" data-clarify>
    <div class="ats-amplify-chat-clarifying-questions__header">
      <p class="ats-amplify-chat-clarifying-questions__question" id="cq">${esc(qs.q)}</p>
      <button type="button" class="ats-icon-button-no-container" aria-label="Dismiss questions" data-cq-dismiss>${ic('close', 12)}</button>
    </div>
    <div class="ats-amplify-chat-clarifying-questions__options" role="radiogroup" aria-labelledby="cq">
      ${qs.options.map((o, i) => `<button type="button" class="ats-amplify-chat-clarify-option" data-type="text" role="radio" aria-checked="false" aria-keyshortcuts="${i + 1}" tabindex="${i ? -1 : 0}" data-cq="${i}">
        <span class="ats-amplify-chat-clarify-option__key-slot"><span class="ats-amplify-chat-clarify-key" data-type="number" aria-hidden="true"><span class="ats-amplify-chat-clarify-key__number">${i + 1}</span></span></span>
        <span class="ats-amplify-chat-clarify-option__content"><span class="ats-amplify-chat-clarify-option__label-row"><span class="ats-amplify-chat-clarify-option__label">${esc(o.label)}</span></span>
          <span class="ats-amplify-chat-clarify-option__description">${esc(o.desc)}</span></span></button>`).join('')}
      <div class="ats-amplify-chat-clarify-something-else">
        <span class="ats-amplify-chat-clarify-key" data-type="icon" aria-hidden="true">${ic('edit-outline', 12, 'var(--_key-icon)')}</span>
        <input class="ats-amplify-chat-clarify-something-else__value" type="text" aria-label="Something else" placeholder="Something else" data-cq-else>
        <button type="button" class="ats-btn ats-btn--secondary ats-btn--small ats-btn--pill" data-cq-dismiss>Skip</button>
      </div>
    </div></div>`;
}

// New chat starters: 4 cards, sent on click
const STARTERS = [
  { icon: 'clock', t: 'Set up a scheduled prompt', d: 'Get updates on your records on a schedule', text: 'Set up scheduled task' },
  { icon: 'job', t: 'Shortlist for Project Manager', d: 'Strongest candidates for 425 | Project Manager', text: 'Who are my strongest candidates for the Project Manager job at Nexus Dynamics?' },
  { icon: 'outbound-email', t: 'Draft a check-in email', d: 'Follow up with Marcus Lehmann on two submittals', text: 'Draft a check-in email to Marcus Lehmann about the Data Analyst submittals' },
  { icon: 'appointment', t: 'Prep for today’s meetings', d: 'What to know before your 3 meetings', text: 'Summarise what I need to know before today’s meetings' },
];

const CANNED = {
  'Who are my strongest candidates for the Project Manager job at Nexus Dynamics?': 'Jane Jones and Tyler Brooks meet 4 of 5 must-haves. Jane has the most recent B2B SaaS experience; Tyler is available sooner.',
  'Draft a check-in email to Marcus Lehmann about the Data Analyst submittals': 'Here’s a short draft to Marcus asking for feedback on the two Data Analyst submittals, with a suggested call time this week.',
  'Summarise what I need to know before today’s meetings': 'Harbor Labs intake (10:30 AM): 3 open jobs, 1 on hold. Jane Jones screen (1:00 PM): meets 4 of 5 must-haves. Tyler Brooks debrief (3:30 PM): client feedback is pending.',
};

// ===== Fork: take action on scheduled output in a new chat (keeps the scheduled chat short) =====
function fork(key) {
  const [rid, i] = key.split(':'), run = RUNS[rid], row = i != null ? run.rows[+i] : null;
  const c = { id: 'c' + ++uid, group: 'Today', ago: 'Just now',
    title: `Follow-up: ${row ? row.name : run.sname}`, desc: `From ${run.sname}, ${run.when}`,
    ctx: row ? { e: row.e, l: row.name } : null,
    context: [{ l: `${run.sname} · ${run.when}` }, ...(row ? [{ l: row.name, e: row.e }] : [])],
    turns: [{ plain: true,
      a: row ? `I’ve brought in ${row.name} from ${run.sname} (run: ${run.when}): ${row.chg}. What would you like to do?`
             : `I’ve brought in the ${run.sname} run from ${run.when}. What would you like to do with it?`,
      follow: row && row.e === 'job' ? ['Draft outreach to the new matches', 'Compare the top two matches', 'Why did this change?']
             : row ? ['Draft a reminder', 'What’s missing?'] : ['Summarise what needs my attention', 'Draft outreach for the new matches'] }] };
  CHATS.unshift(c); go('chat', { chatId: c.id, focus: '.ats-amplify-chat-conversation__input textarea' });
}

// ===== Chat view =====
const DRAFTS = {};
function renderChat() {
  if (!S.chatId) return `<div class="chat-view"><div class="chat-start"><div class="ats-amplify-chat-global-chat-container">
      <h2 class="ats-amplify-chat-global-chat-container__greeting">Hi Chloe, how can I help you today?</h2>
      ${chatInput()}
      <ul class="starters" aria-label="Suggestions">
        ${STARTERS.map((x) => `<li><button type="button" class="starter" data-ask="${esc(x.text)}" data-title="${esc(x.t)}">
          <span class="ats-icon-container" data-theme="neutral" data-size="sm">${ic(x.icon, 12, 'var(--icon-container-icon)')}</span>
          <span class="starter__body"><span class="starter__t">${esc(x.t)}</span><span class="starter__d">${esc(x.d)}</span></span></button></li>`).join('')}
      </ul></div></div></div>`;
  const c = chat(S.chatId);
  const turns = typeof c.turns === 'string' ? seededTurns(c) : c.turns.map((t) =>
    t.u ? userTurn(t.u) : t.thinking ? thinking() : t.card ? block(para(esc(t.a)) + schedCard(DRAFTS[t.card], 'chat'), { actions: false }) : block(para(esc(t.a)) + (t.follow ? `<div class="ats-amplify-chat-chat-block__follow-ups" role="group" aria-label="Suggested follow-ups">${t.follow.map((f) => `<button type="button" class="ats-btn ats-btn--secondary ats-btn--small ats-btn--pill" data-followup="${esc(f)}">${esc(f)}</button>`).join('')}</div>` : ''), { actions: !t.plain })).join('');
  return `<div class="chat-view"><div class="ats-amplify-chat-conversation" data-size="full page"><div class="ats-amplify-chat-conversation__scroll">
    <div class="ats-amplify-chat-conversation__column" role="log" aria-live="polite" aria-label="Conversation">${turns}</div>
    <div class="ats-amplify-chat-conversation__input">${chatInput({ labels: false, questions: c.questions, context: c.context, placeholder: c.questions ? 'Or reply directly…' : c.sched ? 'Ask a follow-up about these runs' : 'Reply to Amplify' })}</div>
  </div></div></div>`;
}
const SCHED_RE = /\b(every|each|daily|weekly|weekday|mondays?|fridays?|schedule|recurring)\b/i;
function parseSchedule(text) {
  const t = text.toLowerCase();
  const freq = /monday|every week|weekly/.test(t) ? 'Mondays' : /friday/.test(t) ? 'Fridays' : /every day|daily/.test(t) ? 'Daily' : 'Weekdays';
  let time = '08:00'; const m = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  if (m) { let h = +m[1] % 12 + (m[3] === 'pm' ? 12 : 0); h = Math.max(6, Math.min(18, h)); time = `${String(h).padStart(2, '0')}:00`; }
  const prompt = text.replace(/^(every|each)\s+(morning|day|week|weekday|monday|friday)(\s+at\s+\d{1,2}(:\d{2})?\s*(am|pm))?[,\s]*/i, '').replace(/[,\s]*(every|each)\s+(morning|day|week|monday|friday|weekday)\.?$/i, '').replace(/\.$/, '');
  const p = prompt.charAt(0).toUpperCase() + prompt.slice(1);
  const name = p.replace(/^(send me|give me|show me|tell me)\s+/i, '').replace(/^a\s+/i, '');
  return { id: 'd' + ++uid, name: name.charAt(0).toUpperCase() + name.slice(1, 48), prompt: p, freq, time, status: 'active',
    defaulted: !m && /morning/.test(t) };
}
function startChat(text, title) {
  const c = { id: 'c' + ++uid, title: title || (text.length > 44 ? text.slice(0, 42) + '…' : text), group: 'Today', ago: 'Just now', turns: [], forceSched: false };
  CHATS.unshift(c); S.chatId = c.id; S.page = 'chat'; send(c, text);
}
const SETUP_RE = /\b(set ?up|create|add|new)\s+(a\s+)?(new\s+)?schedul(ed|e)\s+(task|prompt|chat)s?\b/i;
function send(c, text) {
  const setup = SETUP_RE.test(text);
  c.questions = null; c.pending = false;
  if (setup && !c.turns.length) c.title = 'New scheduled prompt';
  else if (c.title === 'New scheduled prompt') c.title = text.length > 44 ? text.slice(0, 42) + '…' : text;
  c.turns.push({ u: text }, { thinking: true }); render();
  setTimeout(() => {
    c.turns.pop();
    if (setup) {
      // Enter the setup flow: Amplify asks, suggestions sit in clarifying questions above the input
      c.forceSched = true; c.desc = 'Setting up a scheduled prompt';
      c.turns.push({ a: 'What should I run for you, and when?', plain: true });
      c.questions = { q: 'Start from a common schedule, or describe your own', options: SCHED_SUGGEST };
    } else if (c.forceSched || SCHED_RE.test(text)) { c.forceSched = false;
      const d = parseSchedule(text); DRAFTS[d.id] = d;
      c.turns.push({ card: d.id, a: `Here’s the schedule I’ll set up.${d.defaulted ? ' “Every morning” is set to weekdays between 8:00 and 9:00 AM. Change it below if needed.' : ''} Nothing runs until you schedule it.` });
    } else if (c.context && c.context.length) { c.turns.push({ a: `Here’s a first pass using ${c.context.map((x) => x.l).join(' and ')} as context. (Sample reply in this prototype.)` });
    } else if (CANNED[text]) { c.desc = CANNED[text]; c.turns.push({ a: CANNED[text] });
    } else c.desc = 'Prototype reply', c.turns.push({ a: 'This prototype covers scheduling. Type “set up scheduled task”, or ask for something on a schedule, for example “every Friday, list placements starting next week”.' });
    if (S.page === 'chat' && S.chatId === c.id) render();
  }, 900);
}

// ===== Scheduled page =====
function renderScheduled() {
  const row = (s) => {
    const menu = S.rowMenu === s.id ? `<div class="ats-dropdown-card row-menu" role="menu">
        <button type="button" class="ats-menu-option" data-type="default" role="menuitem" data-edit="${s.id}">${ic('edit-outline', 16, 'var(--color-icon-subtle)', 'ats-menu-option__icon')}<span class="ats-menu-option__label">Edit</span></button>
        <button type="button" class="ats-menu-option" data-type="default" role="menuitem" data-run="${s.id}">${ic('refresh', 16, 'var(--color-icon-subtle)', 'ats-menu-option__icon')}<span class="ats-menu-option__label">Run now</span></button>
        <button type="button" class="ats-menu-option is-danger" data-type="default" role="menuitem" data-del="${s.id}">${ic('delete-outline', 16, 'var(--color-icon-utility-negative)', 'ats-menu-option__icon')}<span class="ats-menu-option__label">Delete</span></button></div>` : '';
    const primary = s.status === 'active' ? btn('Pause', { theme: 'dialogue', attrs: `data-pause="${s.id}"` }) : btn('Resume', { attrs: `data-resume="${s.id}"` });
    return `<li>
      <div class="sp-row">
        <div style="min-width:0"><button type="button" class="sp-row__name" data-chat="${s.chat}">${esc(s.name)}</button>
          <div class="t-sm t-sec" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(s.prompt)}</div></div>
        <div><div>${esc(when(s))}</div><div class="t-meta">${s.status === 'active' ? 'Next run ' + esc(s.next) : 'Not running'}</div></div>
        <div>${chip(s.status)}</div>
        <div class="sp-row__acts">${primary}
          <button type="button" class="ats-btn ats-btn--icon ats-btn--small" aria-label="More actions for ${esc(s.name)}" aria-haspopup="menu" aria-expanded="${S.rowMenu === s.id}" data-rowmenu="${s.id}">${ic('kebab-menu', 12)}</button>${menu}</div>
        ${s.status === 'attention' ? `<div class="sp-attn t-sm">${ic('caution', 12, 'var(--color-icon-utility-warning)')}<span>${esc(s.reason)}</span>${btn('Review scope', { theme: 'dialogue', attrs: `data-edit="${s.id}"` })}</div>` : ''}
      </div>
      ${S.editing === s.id ? `<div class="sp-edit">${schedCard(s, 'page')}</div>` : ''}
    </li>`;
  };
  return `<div class="page"><div class="page-inner">
    <div class="sec-head"><div><h2 class="h-sec">Scheduled prompts</h2><p class="t-sm t-sec" style="margin:var(--spacing-4) 0 0">Prompts Amplify runs for you on a schedule. Results arrive in each prompt’s chat.</p></div>
      ${btn('New Scheduled Prompt', { theme: 'primary', icon: 'add-thin', attrs: 'data-new-sched' })}</div>
    <div class="ats-card sp-card"><div class="ats-card__content">
      ${SCHEDULES.length ? `<div class="sp-head" aria-hidden="true"><span>Prompt</span><span>Schedule</span><span>Status</span><span></span></div><ul class="sp-list">${SCHEDULES.map(row).join('')}</ul>`
        : `<p class="sp-empty">No scheduled prompts yet. Ask in chat, for example “every Friday, list placements starting next week”.</p>`}
    </div></div></div></div>`;
}

const placeholder = (k) => `<div class="page"><div class="ph">${ic(PAGES[k].icon, 24, 'var(--color-icon-subtle)')}
  <h2 class="h-sec">${PAGES[k].label}</h2><p class="t-sm" style="margin:0">Moves into this page unchanged. Not built in this prototype.</p></div></div>`;

// ===== Actions (shared by chat + Scheduled page) =====
function setStatus(id, status) {
  S.cardMenu = null;
  const s = sched(id), prev = { status: s.status, next: s.next };
  s.status = status; s.next = status === 'active' ? nextRun(s) : null;
  render();
  toast(status === 'active' ? `${s.name} resumed. Next run ${s.next}.` : `${s.name} paused.`,
    { label: 'Undo', run: () => { Object.assign(s, prev); render(); } });
}
function onAction(e, view) {
  if (S.page === 'home' && onHome(e)) return;
  { const a = e.target.closest('[data-ask]'); if (a) return startChat(a.dataset.ask, a.dataset.title); }
  const t = (sel) => e.target.closest(sel);
  let b;
  if ((b = t('[data-cardmenu]'))) { e.stopPropagation(); S.cardMenu = S.cardMenu === b.dataset.cardmenu ? null : b.dataset.cardmenu; return renderMain(true); }
  if ((b = t('[data-fork]'))) return fork(b.dataset.fork);
  if ((b = t('[data-followup]'))) return send(chat(S.chatId), b.dataset.followup);
  if ((b = t('[data-ctx-remove]'))) { chat(S.chatId).context.splice(+b.dataset.ctxRemove, 1); return renderMain(); }
  if ((b = t('[data-toggle]'))) { const open = b.getAttribute('aria-expanded') !== 'true'; open ? OPEN_ROWS.add(b.dataset.toggle) : OPEN_ROWS.delete(b.dataset.toggle); b.setAttribute('aria-expanded', open); view.querySelector('#' + b.dataset.toggle).hidden = !open; return; }
  if ((b = t('[data-cq]'))) { const c = chat(S.chatId); return send(c, c.questions.options[+b.dataset.cq].text); }
  if (t('[data-cq-dismiss]')) { chat(S.chatId).questions = null; renderMain(); view.ownerDocument.querySelector('.ats-amplify-chat-conversation__input textarea')?.focus(); return; }
  if ((b = t('[data-suggest]'))) { const ta = view.querySelector('textarea'); ta.value = b.dataset.suggest; ta.dispatchEvent(new Event('input')); ta.focus(); return; }
  if (t('[data-go-sched]')) return go('scheduled');
  if (t('[data-new-sched]')) return go('chat', { chatId: null, sched: true, focus: '[data-cq="0"]' });
  if ((b = t('[data-chat]'))) return go('chat', { chatId: b.dataset.chat });
  if ((b = t('[data-rowmenu]'))) { e.stopPropagation(); S.rowMenu = S.rowMenu === b.dataset.rowmenu ? null : b.dataset.rowmenu; return renderMain(); }
  if ((b = t('[data-edit]'))) return go('scheduled', { edit: b.dataset.edit, focus: '.sp-edit input' });
  if ((b = t('[data-pause]'))) return setStatus(b.dataset.pause, 'paused');
  if ((b = t('[data-resume]'))) return setStatus(b.dataset.resume, 'active');
  if ((b = t('[data-run]'))) { S.rowMenu = null; renderMain(); return toast(`Running ${sched(b.dataset.run).name}. Results will appear in its chat.`); }
  if ((b = t('[data-del]'))) {
    const i = SCHEDULES.findIndex((s) => s.id === b.dataset.del), s = SCHEDULES[i];
    SCHEDULES.splice(i, 1); DELETED[s.id] = s; S.rowMenu = null; render();
    return toast(`${s.name} deleted. Its chat history stays in Chats.`, { label: 'Undo', run: () => { SCHEDULES.splice(i, 0, s); render(); } });
  }
  const card = t('[data-card]'); if (!card) return;
  const isChat = card.dataset.ctx === 'chat', d = isChat ? DRAFTS[card.dataset.card] : sched(card.dataset.card);
  if (t('[data-card-cancel]')) { if (isChat) d.cancelled = true; S.editing = null; return render(); }
  if (t('[data-card-save]')) {
    readCard(card, d);
    if (d.status === 'attention') d.status = 'active';
    d.next = nextRun(d);
    if (isChat) { d.saved = true; d.chat = S.chatId; d.sid = 's' + ++uid; SCHEDULES.unshift({ ...d, id: d.sid }); chat(S.chatId).sched = d.sid; chat(S.chatId).title = d.name; }
    S.editing = null; render();
    toast(isChat ? `Scheduled. First run ${d.next}.` : `${d.name} saved. Next run ${d.next}.`);
  }
}

// ===== Render =====
function renderMain(keepScroll = false) {
  const main = $('#main'), prevScroll = main.querySelector('.page')?.scrollTop, prevChat = main.querySelector('.ats-amplify-chat-conversation__scroll')?.scrollTop;
  const html = { home: renderHome, chat: renderChat, scheduled: renderScheduled }[S.page]?.() ?? placeholder(S.page);
  const view = document.createElement('div');
  view.className = 'amp-view'; view.innerHTML = html;
  main.replaceChildren(view);
  view.addEventListener('click', (e) => onAction(e, view));
  if (S.page === 'home') wireInput(view.querySelector('.home-start'), startChat);
  if (S.page === 'chat') {
    const box = view.querySelector('.ats-amplify-chat-container');
    wireInput(box, (text) => (S.chatId ? send(chat(S.chatId), text) : startChat(text)));
    view.addEventListener('keydown', (e) => {
      const cq = e.target.closest('[data-clarify]'); if (!cq) return;
      const c = chat(S.chatId), opts = [...cq.querySelectorAll('[data-cq]')];
      if (e.target.matches('[data-cq-else]')) { if (e.key === 'Enter' && e.target.value.trim()) { e.preventDefault(); send(c, e.target.value.trim()); } return; }
      if (/^[1-9]$/.test(e.key) && opts[e.key - 1]) { e.preventDefault(); return send(c, c.questions.options[e.key - 1].text); }
      const i = opts.indexOf(document.activeElement);
      if (i > -1 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); opts[(i + (e.key === 'ArrowDown' ? 1 : opts.length - 1)) % opts.length].focus(); }
      if (e.key === 'Escape') { c.questions = null; renderMain(); }
    });
    const sc = view.querySelector('.ats-amplify-chat-conversation__scroll'); if (sc) sc.scrollTop = keepScroll && prevChat != null ? prevChat : sc.scrollHeight;
  }
  if (S.page === 'scheduled' && prevScroll) view.querySelector('.page').scrollTop = prevScroll;
}
function render() {
  $('#ampTab').classList.add('is-active');
  renderHeader(); renderChats(); renderMain();
  if (S.menuOpen) renderMenu();
}
// Narrow windows: collapse the bowling alley and start with Chats closed (same as the ATS on small screens)
if (innerWidth < 1280) { $('#shell').dataset.nav = 'collapsed'; $('#navToggle').setAttribute('aria-expanded', 'false'); $('#navToggleIcon').dataset.i = 'expand-right'; }
// Collapsed alley expands on hover, as in the ATS (bowling-alley "State=Hover 2")
const alley = $('.ats-bowling-alley');
alley.addEventListener('mouseenter', () => { if ($('#shell').dataset.nav === 'collapsed') $('#shell').dataset.nav = 'hover'; });
alley.addEventListener('mouseleave', () => { if ($('#shell').dataset.nav === 'hover' && !S.menuOpen) $('#shell').dataset.nav = 'collapsed'; });
$('#ampMenu').addEventListener('mouseleave', () => { if ($('#shell').dataset.nav === 'hover') { closeMenu(); $('#shell').dataset.nav = 'collapsed'; } });
// Deep links: #scheduled, #chat/c1, #new
const h = location.hash.slice(1);
if (h === 'scheduled' || h === 'meetings' || h === 'audits') S.page = h;
else if (h.startsWith('chat/') && chat(h.slice(5))) { S.page = 'chat'; S.chatId = h.slice(5); }
else if (h === 'new') { S.page = 'chat'; S.chatId = null; }
render();
if (window.__demo) window.__demo();

// ===== Prototype guide =====
const GUIDE = [
  { k: 'home', t: 'Amplify Home', d: 'Greeting, to-dos, need to know, today' },
  { k: 'menu', t: 'Amplify menu in the bowling alley', d: 'Chevron next to the Amplify tab' },
  { k: 'new', t: 'New chat', d: 'Starter cards send straight to chat' },
  { k: 'setup', t: 'Set up a scheduled prompt', d: 'Same as typing “set up scheduled task”' },
  { k: 'run', t: 'Scheduled chat with run results', d: 'Confirmation card + run output; fork into a new chat' },
  { k: 'attn', t: 'Scheduled chat that needs attention', d: 'Paused automatically, with recovery' },
  { k: 'sched', t: 'Scheduled page', d: 'Pause, resume, edit, run now, delete' },
  { k: 'chats', t: 'Chats panel', d: 'Scheduled first, with unread runs; history by time' },
];
S.guideOpen = true;
function renderGuide() {
  const g = $('#guide');
  // One card, open or collapsed to its header. The header is the drag handle in both states.
  g.innerHTML = `<div class="guide__card${S.guideOpen ? '' : ' is-collapsed'}">
      <div class="guide__head" data-guide-drag title="Drag to move">
        <span class="guide__grip"><button type="button" class="ats-btn ats-btn--icon ats-btn--small" aria-label="Move guide: drag, or use arrow keys" data-guide-move>${ic('move', 12)}</button><p class="guide__title" id="guideT">Prototype guide</p></span>
        <button type="button" class="ats-btn ats-btn--icon ats-btn--small" aria-expanded="${S.guideOpen}" aria-controls="guideBody" aria-label="${S.guideOpen ? 'Collapse' : 'Expand'} prototype guide" data-guide-toggle>${ic(S.guideOpen ? 'chevron-up' : 'chevron-down', 12)}</button></div>
      <div id="guideBody" ${S.guideOpen ? '' : 'hidden'}>
      <div class="guide__sec">
        <p>Ace Homepage (future, with Ace): an agent-driven Home as the Amplify starting point. Data is fictional and resets on reload.</p></div>
      <div class="guide__sec"><p class="t-strong" style="color:var(--color-text-headline)">Run output format</p>
        <div class="guide__seg" role="group" aria-label="Run output format">${[['A', 'A · Expandable'], ['B', 'B · Digest'], ['C', 'C · Table']].map(([v, l]) => `<button type="button" class="ats-btn ats-btn--secondary ats-btn--small${S.outFmt === v ? ' is-on' : ''}" aria-pressed="${S.outFmt === v}" data-fmt="${v}">${l}</button>`).join('')}</div></div>
      <div class="guide__sec"><ul class="guide__links">${GUIDE.map((x) => `<li><button type="button" class="guide__link" data-demo="${x.k}"><b>${x.t}</b><span>${x.d}</span></button></li>`).join('')}</ul></div>
      <div class="guide__sec"><p><span class="t-strong">Try:</span> type “every Friday at 4 PM, list placements starting next week” in any chat input.</p>
        <p><span class="t-strong">Not built:</span> Meetings, Audits, Customize, and Find / Menu / Add in the bowling alley.</p></div>
    </div></div>`;
}
$('#guide').addEventListener('click', (e) => {
  if (e.target.closest('[data-guide-toggle]')) { S.guideOpen = !S.guideOpen; renderGuide(); if (S.guidePos) placeGuide(S.guidePos.x, S.guidePos.y); $('#guide [data-guide-toggle]')?.focus(); return; }
  const fb = e.target.closest('[data-fmt]');
  if (fb) { e.stopPropagation(); S.outFmt = fb.dataset.fmt; renderGuide(); if (S.page !== 'chat' || !chat(S.chatId)?.sched) go('chat', { chatId: 'c1' }); else renderMain(); return; }
  const b = e.target.closest('[data-demo]'); if (!b) return;
  e.stopPropagation();
  const k = b.dataset.demo;
  if (k === 'home') go('home');
  if (k === 'menu') { go(S.page, { chatId: S.chatId }); openMenu(); }
  if (k === 'new') go('chat', { chatId: null, focus: '.chat-start textarea' });
  if (k === 'setup') startChat('Set up scheduled task');
  if (k === 'run') { go('chat', { chatId: 'c1' }); $('#main [data-toggle]')?.click(); }
  if (k === 'attn') go('chat', { chatId: 'c3' });
  if (k === 'sched') go('scheduled');
  if (k === 'chats') { S.chatsOpen = true; render(); }
});
renderGuide();

// Move the guide: drag its header, or focus the move button and use the arrow keys
function placeGuide(x, y) {
  const g = $('#guide'), w = g.offsetWidth || 300, h = g.offsetHeight || 40;
  x = Math.max(8, Math.min(innerWidth - w - 8, x)); y = Math.max(8, Math.min(innerHeight - h - 8, y));
  S.guidePos = { x, y }; Object.assign(g.style, { left: x + 'px', top: y + 'px', right: 'auto' });
}
$('#guide').addEventListener('pointerdown', (e) => {
  const head = e.target.closest('[data-guide-drag]');
  if (!head || (e.target.closest('button') && !e.target.closest('[data-guide-move]'))) return;
  e.preventDefault();
  const g = $('#guide'), r = g.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
  g.classList.add('is-dragging');
  const move = (ev) => placeGuide(ev.clientX - dx, ev.clientY - dy);
  const up = () => { g.classList.remove('is-dragging'); removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
  addEventListener('pointermove', move); addEventListener('pointerup', up);
});
$('#guide').addEventListener('keydown', (e) => {
  if (!e.target.closest('[data-guide-move]')) return;
  const step = e.shiftKey ? 64 : 16, d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
  if (!d) return; e.preventDefault();
  const r = $('#guide').getBoundingClientRect(); placeGuide(r.left + d[0], r.top + d[1]);
});
addEventListener('resize', () => { if (S.guidePos) placeGuide(S.guidePos.x, S.guidePos.y); });

// ===== Embed / deep-link params (used by the Design Decisions page) =====
// ?embed=1 hides the guide · page=home|chat|scheduled · chat=<id> · setup=1 · fmt=A|B|C
// chats=1 opens the Chats panel · menu=1 opens the Amplify menu · expand=1 opens the first record row
// ask=<text> starts a chat with that message · cardmenu=<runId> opens a run card's kebab · nav=open|collapsed · edit=<scheduleId>
(function () {
  const p = new URLSearchParams(location.search);
  if (![...p.keys()].length) return;
  if (p.get('embed') === '1') $('#guide').hidden = true;
  if (p.get('fmt')) S.outFmt = p.get('fmt');
  if (p.get('chats') === '1') S.chatsOpen = true;
  if (p.get('nav')) { const open = p.get('nav') === 'open'; $('#shell').dataset.nav = open ? 'open' : 'collapsed'; $('#navToggleIcon').dataset.i = open ? 'contract-left' : 'expand-right'; }
  const page = p.get('page');
  if (p.get('setup') === '1') startChat('Set up scheduled task');
  else if (p.get('ask')) startChat(p.get('ask'));
  else if (page === 'chat' || p.get('chat')) go('chat', { chatId: p.get('chat') || null });
  else if (page) go(page, { edit: p.get('edit') || null });
  else goHome();
  if (p.get('cardmenu')) { S.cardMenu = p.get('cardmenu'); renderMain(); }
  if (p.get('expand') === '1') $('#main [data-toggle]')?.click();
  if (p.get('scroll') === 'top') { const sc = $('#main .ats-amplify-chat-conversation__scroll'); if (sc) sc.scrollTop = 0; }
  if (p.get('menu') === '1') setTimeout(openMenu, 50);
})();
