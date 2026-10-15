// ===== State (in memory only) =====
// opt: current (the bug) | 1 (chat → pop over) | 2 (popover from the row, recommended) | 3 (inline preview pane)
const S = { opt: '1', preview: null, tab: 'Details', chatOpen: true, chatMode: 'docked', autoPopped: false, turns: [], paneW: 440 };
let userActed = false;
['pointerdown', 'keydown'].forEach((t) => addEventListener(t, () => { userActed = true; }, { capture: true, once: true }));
const focusEl = (el) => { if (el && userActed) el.focus({ preventScroll: true }); };

// Fictional sample data
const ROWS = [
  ['Tyler Brooks', 'tyler.brooks@example.com', 'Project Manager', '12989', 'Boston, MA', 'Available'],
  ['Priya Raman', 'priya.raman@example.com', 'Senior Project Manager', '13044', 'Cambridge, MA', 'Available'],
  ['Marcus Hale', 'marcus.hale@example.com', 'IT Project Manager', '12702', 'Quincy, MA', 'Available in 2 weeks'],
  ['Elena Ortiz', 'elena.ortiz@example.com', 'Program Manager', '13110', 'Boston, MA', 'Available'],
  ['Jordan Kim', 'jordan.kim@example.com', 'Project Manager, PMP', '12877', 'Somerville, MA', 'Available'],
  ['Aisha Bello', 'aisha.bello@example.com', 'Technical Project Manager', '13201', 'Newton, MA', 'Available'],
  ['Sam Whitaker', 'sam.whitaker@example.com', 'Project Coordinator', '12655', 'Boston, MA', 'Available'],
  ['Grace Liu', 'grace.liu@example.com', 'Delivery Manager', '13088', 'Waltham, MA', 'Available in 1 week'],
  ['Daniel Osei', 'daniel.osei@example.com', 'Construction Project Manager', '12933', 'Brookline, MA', 'Available'],
  ['Hannah Moore', 'hannah.moore@example.com', 'Agile Project Manager', '13157', 'Boston, MA', 'Available'],
  ['Luis Fernandez', 'luis.fernandez@example.com', 'Project Manager', '12811', 'Medford, MA', 'Available'],
  ['Nora Fischer', 'nora.fischer@example.com', 'PMO Lead', '13020', 'Boston, MA', 'Available'],
  ['Ravi Patel', 'ravi.patel@example.com', 'Senior Project Manager', '12740', 'Lexington, MA', 'Available in 2 weeks'],
  ['Chloe Martin', 'chloe.martin@example.com', 'Project Manager', '13175', 'Cambridge, MA', 'Available'],
].map(([name, email, title, id, loc, avail]) => ({ name, email, title, id, loc, avail, phone: '617-555-0' + id.slice(-3) }));

const $ = (s, r = document) => r.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ic = (name, size = 16, color = '', cls = '') =>
  `<span class="ats-icon ${cls}" data-i="${name}" aria-hidden="true" style="width:${size}px;height:${size}px;${color ? `background-color:${color}` : ''}"></span>`;
const btn = (label, { theme = 'secondary', size = 'small', icon, iconR, iconColor = '', attrs = '', cls = '' } = {}) =>
  `<button type="button" class="ats-btn ats-btn--${theme} ats-btn--${size} ${cls}" ${attrs}>${icon ? ic(icon, size === 'small' ? 12 : 14, iconColor) : ''}${label}${iconR ? ic(iconR, size === 'small' ? 12 : 14) : ''}</button>`;
const iconBtn = (icon, label, { size = 'small', attrs = '' } = {}) =>
  `<button type="button" class="ats-btn ats-btn--icon ats-btn--${size}" aria-label="${label}" title="${label}" ${attrs}>${ic(icon, size === 'small' ? 12 : 14)}</button>`;


// ===== Bowling alley (markup mirrors ats-ui main-tabs / entity-tabs / record-tabs-divider) =====
const TABS = [
  { id: 't1', type: 'candidate', icon: 'candidate-list', label: 'Candidates', active: true },
  { id: 't2', type: 'candidate', icon: 'candidate', label: '213 | Tyler Brooks' },
  { id: 't3', type: 'jobs', icon: 'job', label: 'Jobs' },
  { id: 't4', type: 'jobs', icon: 'job', label: '425 | Software Engineer', pinned: true },
  { id: 't5', type: 'neutral', icon: 'note', label: 'Add Note' },
];
const navIc = (n, size = 14) => ic(n, size, 'var(--bowling-alley-color-content-icon-default)');
function renderNav() {
  const opener = (k, icon, label) => `<button class="ats-bowling-alley-tab ats-bowling-alley-tab--opener" data-opener="${k}" type="button" aria-label="${label}" title="${label} isn’t built in this prototype">
      <span class="ats-bowling-alley-tab__icon">${navIc(icon)}</span><span class="ats-bowling-alley-tab__label">${label}</span>
      <span class="ats-bowling-alley-tab__next">${navIc('next', 12)}</span></button>`;
  $('#mainTabs').innerHTML = opener('find', 'search', 'Find') + opener('menu', 'menu-outline', 'Menu') + opener('add', 'add-thin', 'Add')
    + `<button class="ats-bowling-alley-tab" data-opener="amplify" type="button" aria-label="Amplify"${S.chatOpen ? ' aria-pressed="true"' : ' aria-pressed="false"'}>
      <span class="ats-bowling-alley-tab__icon">${ic('amplify', 14, '', 'amp-glyph')}</span><span class="ats-bowling-alley-tab__label">Amplify</span></button>`;
  $('#entTabs').innerHTML = TABS.map((t) => `<div class="ats-bowling-alley-tab ats-bowling-alley-tab--entity${t.active ? ' is-active' : ''}${t.pinned ? ' is-pinned' : ''}" role="button" tabindex="0" data-tab-id="${t.id}" data-entity="${t.type}" ${t.active ? 'aria-current="page"' : ''}>
      <span class="ats-bowling-alley-tab__icon"><span class="ats-icon-container" data-theme="${t.type}" data-size="sm">${ic(t.icon, 12, 'var(--icon-container-icon)')}</span></span>
      <span class="ats-bowling-alley-tab__label">${esc(t.label)}</span>
      <span class="ats-bowling-alley-tab__actions">
        <button class="ats-bowling-alley-tab__pin" type="button" aria-label="${t.pinned ? 'Remove pin' : 'Pin'}" aria-pressed="${!!t.pinned}" data-pin="${t.id}">${ic(t.pinned ? 'pin' : 'pin-outline', 12, 'var(--color-icon-subtle)')}</button>
        ${t.active ? '' : `<button class="ats-bowling-alley-tab__close" type="button" aria-label="Close ${esc(t.label)}" data-close-tab="${t.id}">${ic('close', 12, 'var(--color-icon-subtle)')}</button>`}
      </span></div>`).join('');
}
function showTip(anchor, text) {
  const tip = $('#tip'), r = anchor.getBoundingClientRect(), sr = $('#stage').getBoundingClientRect();
  tip.querySelector('.ats-tooltip__box').textContent = text; tip.hidden = false;
  Object.assign(tip.style, { position: 'absolute', zIndex: 90, left: (r.left + r.width / 2 - sr.left - 15) + 'px', top: (r.bottom - sr.top + 2) + 'px' });
}
const hideTip = () => { $('#tip').hidden = true; };

// ===== Candidate list (Figma 1766:66016) =====
const COLS = [['Name', 'name', 180, true], ['Job Title', 'title', 220], ['Location', 'loc', 150], ['Availability', 'avail', 170], ['Personal Email', 'email', 230], ['ID', 'id', 90], ['Mobile Phone', 'phone', 140]];
function renderList() {
  const th = (l, w) => `<th class="ats-ndt-th" scope="col"><div class="ats-ndt-cell ats-ndt-hcell" style="width:${w}px"><span class="ats-ndt-hcell__label">${l}</span>${ic('sortable', 12, '', 'ats-ndt-ic')}${ic('filter', 12, '', 'ats-ndt-ic')}</div></th>`;
  const rows = ROWS.map((r, i) => `<tr class="ats-ndt-row${S.preview === i ? ' is-previewing' : ''}" data-row="${i}">
      <td class="ats-ndt-td ats-ndt-td--check"><div class="ats-ndt-cell ats-ndt-cell--check"><input type="checkbox" class="ats-checkbox" data-i="check" aria-label="Select ${esc(r.name)}"></div></td>
      <td class="ats-ndt-td ats-ndt-td--icon"><div class="ats-ndt-cell ats-ndt-cell--icon"><button type="button" class="pv-btn" data-preview="${i}" aria-label="Preview ${esc(r.name)}" aria-pressed="${S.preview === i}">${ic('preview', 16)}</button></div></td>
      ${COLS.map(([, k, w, link]) => `<td class="ats-ndt-td"><div class="ats-ndt-cell" style="width:${w}px"><span class="ats-ndt-cell__text${link ? ' ats-ndt-cell__text--link' : ''}">${esc(r[k])}</span></div></td>`).join('')}
    </tr>`).join('');
  $('#list').innerHTML = `<div class="lh">
      <div class="lh__title">
        <div class="lh__name"><span class="ats-icon-container" data-theme="candidate" data-size="lg">${ic('candidate-list', 24, 'var(--icon-container-icon)')}</span><h1>Candidates</h1></div>
        <div class="lh__actions">${[['columns', 'Columns'], ['star-o', 'Save search'], ['refresh-outline', 'Refresh'], ['close', 'Close']].map(([i, l]) => btn('', { theme: 'dialogue', size: 'default', icon: i, attrs: `aria-label="${l}" title="${l}"` })).join('')}
          <div class="tiles" role="group" aria-label="Source"><button type="button" aria-pressed="true">Bullhorn</button><button type="button" aria-pressed="false">Job Boards</button></div>${S.chatOpen ? '' : `<button type="button" class="ats-btn ats-btn--primary ats-btn--default ats-btn--amplify lh__amp" data-reopen>${ic('amplify', 14)}Amplify</button>`}</div>
      </div>
      <div class="adv"><div class="adv__q">${ic('search', 16, 'var(--color-icon-subtle)')}
          <span class="ats-novo-chip" data-type="default" data-size="medium" data-color="default">${ic('amplify', 10, '', 'ats-novo-chip__icon amp-glyph')}<span class="ats-novo-chip__label">Amplify: Project managers near Boston, PMP, available</span><button type="button" class="ats-novo-chip__remove" aria-label="Remove search">${ic('close', 10, 'var(--_chip-icon)')}</button></span></div>
        ${btn('Edit Search', { theme: 'dialogue', size: 'default', icon: 'edit' })}</div>
      <div class="frow">${btn('Add Filter', { iconColor: 'var(--color-entity-candidate)', size: 'default', icon: 'add-thin' })}${btn('Users', { iconColor: 'var(--color-entity-candidate)', size: 'default', icon: 'user-outline', iconR: 'chevron-down' })}
        ${btn('Keywords (3)', { iconColor: 'var(--color-entity-candidate)', size: 'default', icon: 'globe-outline', iconR: 'chevron-down', cls: 'is-applied' })}${btn('Status: Available', { iconColor: 'var(--color-entity-candidate)', size: 'default', icon: 'category-tags', iconR: 'chevron-down', cls: 'is-applied' })}
        ${btn('Location: 25 mi of Boston', { iconColor: 'var(--color-entity-candidate)', size: 'default', icon: 'location-outline', iconR: 'chevron-down', cls: 'is-applied' })}<span class="spacer"></span>${btn('Clear', { size: 'default', iconR: 'chevron-down', cls: 'ats-btn--negative' })}</div>
    </div>
    <div class="dtc"><div class="dtc__card"><div class="ats-ndt"><table class="ats-ndt__table" aria-label="Candidates"><thead><tr class="ats-ndt-hrow">
      <th class="ats-ndt-th ats-ndt-th--check" scope="col"><div class="ats-ndt-cell ats-ndt-cell--check"><input type="checkbox" class="ats-checkbox" data-i="check" aria-label="Select all"></div></th>
      <th class="ats-ndt-th ats-ndt-th--icon" scope="col"><div class="ats-ndt-cell ats-ndt-cell--icon"><span class="ats-ndt-sr">Preview</span></div></th>
      ${COLS.map(([l, , w]) => th(l, w)).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
      <div class="dtc__foot"><span>${ROWS.length} candidates</span><span>Page 1 of 1</span></div></div></div>`;
}
// ===== Candidate preview content (slideout, Figma 756:1311) =====
function previewHTML(narrow) {
  const r = ROWS[S.preview];
  const nav = S.opt === '2' || S.opt === '3';
  const tabs = ['Resume', 'Details', 'Notes (20)', 'Experience'];
  const wf = [['1', 'Task'], ['1', 'Submission'], ['0', 'Client submission'], ['0', 'Interviews'], ['0', 'Placement']];
  const det = [['Name', r.name], ['Job title', r.title], ['Status', r.avail], ['Location', r.loc], ['Email', r.email], ['Mobile', r.phone], ['ID', r.id]];
  return `<div class="pv${narrow ? ' pv--narrow' : ''}">
    <div class="pv__head">
      <div class="pv__title">
        <div class="pv__name"><span class="ats-icon-container" data-theme="candidate" data-size="md">${ic('candidate', 20, 'var(--icon-container-icon)')}</span><h2 id="pvTitle">${esc(r.name)}</h2>
          ${narrow ? '' : `<span class="pv__social">${iconBtn('google', 'Google')}${iconBtn('linkedin', 'LinkedIn')}${iconBtn('location', 'Map')}</span>`}</div>
        <div class="pv__acts">
          ${nav ? `${S.opt === '3' ? `<span class="pv__step${narrow ? ' sr' : ''}" aria-live="polite">${S.preview + 1} of ${ROWS.length}</span>` : ''}${iconBtn('chevron-up', 'Previous candidate', { attrs: `data-step="-1" ${S.preview === 0 ? 'disabled' : ''}` })}${iconBtn('chevron-down', 'Next candidate', { attrs: `data-step="1" ${S.preview === ROWS.length - 1 ? 'disabled' : ''}` })}` : ''}
          ${narrow ? iconBtn('bolt', 'Actions') : btn('Actions', { icon: 'bolt', iconR: 'chevron-down' })}
          ${S.opt === '3' ? iconBtn('card-expand', 'Open full record', { attrs: 'data-full' }) : ''}
          ${iconBtn('close', 'Close preview', { attrs: 'data-close-preview' })}</div>
      </div>
      <div class="pv__tabs" role="tablist" aria-label="Candidate sections">${tabs.map((t) => `<button type="button" class="pv__tab" role="tab" aria-selected="${S.tab === t}" data-tab="${t}">${t}</button>`).join('')}</div>
    </div>
    <div class="pv__body">
      <div class="wf">${wf.map(([n, l]) => `<div class="wf__b"><span class="wf__n">${n}</span><span class="wf__l">${l}</span></div>`).join('')}</div>
      <div class="ats-card"><div class="ats-card__header"><div class="ats-card__title">${ic('info', 16, 'var(--color-entity-candidate)')}<h3 class="ats-card__title-text">Details</h3></div></div>
        <div class="ats-card__content"><dl class="dl">${det.map(([k, v]) => `<div class="dl__row"><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div></div>
    </div></div>`;
}

// ===== Amplify chat (docked-chat 4608:182872; markup mirrors the ats-ui templates) =====
const userTurn = (t) => `<div class="ats-amplify-chat-user-turn"><div class="ats-amplify-chat-user-bubble"><div class="ats-amplify-chat-user-bubble__viewport"><div class="ats-amplify-chat-user-bubble__message">${esc(t)}</div></div></div></div>`;
const para = (html) => `<p class="ats-amplify-chat-text ats-amplify-chat-text--paragraph" style="margin:0"><span class="ats-amplify-chat-text__content">${html}</span></p>`;
const ibnc = (icon, label) => `<button type="button" class="ats-icon-button-no-container" aria-label="${label}">${ic(icon, 12)}</button>`;
const block = (body, foot = '') => `<div class="ats-amplify-chat-chat-block" role="article" aria-label="Amplify reply">
  <div class="ats-amplify-chat-chat-block__identity">${ic('amplify', 16, '', 'ats-amplify-chat-chat-block__identity-icon')}<span class="ats-amplify-chat-chat-block__identity-name">Amplify</span></div>
  <div class="ats-amplify-chat-chat-block__body">${body}</div>${foot}
  <div class="ats-amplify-chat-chat-block__controls"><div class="ats-amplify-chat-chat-block__actions">${ibnc('copy', 'Copy reply')}${ibnc('thumbs-up-line', 'Good response')}${ibnc('thumbs-down-line', 'Bad response')}</div></div></div>`;
const SEED = [
  { u: 'Find project managers within 25 miles of Boston with a PMP who are available now' },
  { a: `${para('I filtered your candidate list to <b>14 candidates</b>.')}${para('Filters applied: keywords “project manager”, “PMP”, “program manager”; status Available; location within 25 miles of Boston.')}`,
    foot: `<div class="ats-amplify-chat-chat-block__footer"><div class="ats-amplify-chat-sources-row"><div class="ats-amplify-chat-sources-row__summary"><span class="ats-amplify-chat-sources-row__summary-text">Based on 2,310 candidate records · Updated today</span>${ibnc('chevron-down', 'Show sources')}</div></div>
      <div class="ats-amplify-chat-chat-block__follow-ups" role="group" aria-label="Suggested follow-ups">${['Only show PMP certified', 'Rank by match to 425 | Software Engineer'].map((f) => `<button type="button" class="ats-btn ats-btn--secondary ats-btn--small ats-btn--pill" data-follow="${esc(f)}">${f}</button>`).join('')}</div></div>` },
];
function chatInputHTML() {
  const tool = (icon, label) => `<button type="button" class="ats-btn ats-btn--dialogue ats-btn--small" aria-label="${label}">${ic(icon, 12)}</button>`;
  return `<div class="ats-amplify-chat-container"><div class="ats-amplify-chat-context-container" data-size="docked"><span class="ats-amplify-chat-context-container__label">Context:</span>
      <div class="ats-amplify-chat-context-container__chips"><span class="ats-novo-chip ats-amplify-chat-context-container__chip" data-type="default" data-size="medium" data-color="default" style="--_ctx-entity:var(--color-entity-candidate)">${ic('circle', 10, 'var(--_ctx-entity)', 'ats-novo-chip__icon')}<span class="ats-novo-chip__label">Candidates list</span></span></div></div>
    <div class="ats-amplify-chat-input" data-size="docked"><textarea class="ats-amplify-chat-text-area" rows="1" aria-label="Message Amplify" placeholder="What would you like to know or do today?"></textarea>
    <div class="ats-amplify-chat-button-row ats-amplify-chat-button-row--icons-only"><div class="ats-amplify-chat-button-row__tools">${tool('add-thin', 'Add File')}${tool('tools', 'Add Tools')}${tool('book', 'Prompt Library')}</div>
      <button type="button" class="ats-btn ats-btn--primary ats-btn--small ats-btn--amplify ats-amplify-chat-button-row__send" aria-label="Send" disabled data-send>${ic('arrow-up', 12)}</button></div></div></div>`;
}
function renderChat() {
  const pop = S.chatMode === 'pop-over';
  const turns = SEED.concat(S.turns).map((t) => (t.u ? userTurn(t.u) : block(t.a, t.foot || ''))).join('');
  const note = S.autoPopped ? `<div class="auto-note" role="status">${ic('info', 12, 'var(--color-icon-subtle)')}<span>Moved to a pop over while the preview is open</span></div>` : '';
  $('#chat').innerHTML = `<div class="ats-amplify-chat-docked__panel">
    <header class="ats-amplify-chat-docked__header"><div class="ats-amplify-chat-docked__title"><span class="ats-amplify-chat-docked__mark">${ic('amplify', 28, '', 'ats-amplify-chat-docked__mark-icon')}</span><h2 class="ats-amplify-chat-docked__label">Amplify</h2></div>
      <div class="ats-amplify-chat-docked__actions">${iconBtn(pop ? 'columns' : 'external-open', pop ? 'Dock to side' : 'Pop out', { attrs: 'data-chat-mode' })}${iconBtn('close', 'Close Amplify', { attrs: 'data-chat-close' })}</div></header>
    ${note}<div class="ats-amplify-chat-docked__main"><div class="ats-amplify-chat-conversation" data-size="docked"><div class="ats-amplify-chat-conversation__scroll" id="convScroll">
      <div class="ats-amplify-chat-conversation__column" role="log" aria-live="polite" aria-label="Conversation">${turns}</div>
      <div class="ats-amplify-chat-conversation__input">${chatInputHTML()}</div></div></div></div></div>`;
  wireInput();
  const sc = $('#convScroll'); if (sc) sc.scrollTop = sc.scrollHeight;
}
function wireInput() {
  const ta = $('#chat textarea'), send = $('#chat [data-send]');
  const go = () => { const v = ta.value.trim(); if (!v) return; ask(v); };
  ta.addEventListener('input', () => { send.disabled = !ta.value.trim(); ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'; });
  ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); go(); } });
  send.onclick = go;
}
function ask(text) {
  S.turns.push({ u: text }, { a: para('Prototype reply. The chat keeps working while the preview is open.') });
  renderChat(); focusEl($('#chat textarea'));
}
// ===== Layout per option =====
const EDGE = 24, SO_W = 660, CHAT_W = 420, LIST_MIN = 480;
let autoCollapsed = false;
const mainLeft = () => $('.ats-bowling-alley-shell__main').getBoundingClientRect().left;
function placePopover() {
  const c = $('#chat'); c.classList.remove('is-auto');
  if (S.chatMode !== 'pop-over') { c.removeAttribute('style'); return; }
  let x, w;
  if (S.autoPopped) { // Option 1: to the left of the slideout, over the list
    x = mainLeft() + EDGE; w = Math.max(420, Math.min(726, innerWidth - SO_W - x - EDGE)); c.classList.add('is-auto');
  } else { w = Math.min(726, innerWidth - 2 * EDGE); x = innerWidth - w - EDGE; }
  Object.assign(c.style, { left: x + 'px', top: EDGE + 'px', width: w + 'px', height: (innerHeight - 2 * EDGE) + 'px' });
}
function setNav(state) { const sh = $('#shell'); sh.dataset.nav = state; $('#navToggle')?.setAttribute('aria-expanded', String(state === 'open')); const t = $('#navToggleIcon'); if (t) t.dataset.i = state === 'open' ? 'contract-left' : 'expand-right'; }
function layout() {
  const ws = $('#ws'), o = S.opt, open = S.preview != null;
  ws.dataset.opt = o;
  const c = $('#chat');
  c.dataset.mode = S.chatMode; c.classList.toggle('is-open', S.chatOpen);
  c.toggleAttribute('inert', !S.chatOpen);
  placePopover();
  // Slideout: current + Option 1
  const so = $('#so'), useSo = open && (o === 'current' || o === '1');
  so.classList.toggle('is-off', !useSo);
  so.innerHTML = useSo ? previewHTML(false) : '';
  // Option 3: inline pane
  const pane = $('#pane'), usePane = open && o === '3';
  pane.hidden = o !== '3';
  if (usePane) {
    const chatW = S.chatOpen && S.chatMode === 'docked' ? CHAT_W : 0;
    const avail = () => innerWidth - mainLeft() - chatW;
    if (!S.navUser && avail() - S.paneW < LIST_MIN && $('#shell').dataset.nav === 'open') { setNav('collapsed'); autoCollapsed = true; }
    S.paneW = Math.max(360, Math.min(S.paneW, SO_W, avail() - LIST_MIN));
  } else if (autoCollapsed) { setNav('open'); autoCollapsed = false; }
  pane.style.setProperty('--pane-w', S.paneW + 'px');
  pane.classList.toggle('is-open', usePane);
  pane.innerHTML = usePane ? `<div class="pane__grip" role="separator" aria-orientation="vertical" aria-label="Resize preview" tabindex="0" data-grip></div>${previewHTML(S.paneW < 520)}` : '';
  // Option 2: popover anchored to the row's preview button (Figma 6781:153057). No scrim; the docked chat stays usable.
  const lp = $('#lp'), useLp = open && o === '2';
  lp.hidden = !useLp;
  lp.innerHTML = useLp ? `<span class="lp__arrow" aria-hidden="true"></span><div class="lp__content">${previewHTML(false)}</div>` : '';
  renderList();
  if (useLp) placeLp();
}
// Popover position=right: 7px arrow on the left edge pointing at the button; content 660px max, kept inside the list region
function placeLp() {
  const lp = $('#lp'), b = $(`[data-preview="${S.preview}"]`); if (!lp || lp.hidden || !b) return;
  const ws = $('#ws').getBoundingClientRect(), r = b.getBoundingClientRect();
  const right = S.chatOpen && S.chatMode === 'docked' ? CHAT_W : 0;
  const left = r.right - ws.left + 4, w = Math.min(SO_W, ws.width - right - left - EDGE);
  const cy = r.top + r.height / 2 - ws.top, h = Math.min(636, ws.height - 2 * EDGE);
  const top = Math.max(EDGE, Math.min(cy - 38, ws.height - h - EDGE));
  Object.assign(lp.style, { left: left + 'px', top: top + 'px', width: (w + 7) + 'px', height: h + 'px' });
  lp.style.setProperty('--arrow-y', Math.max(16, Math.min(h - 16, cy - top)) + 'px');
  lp.classList.toggle('is-detached', cy < 0 || cy > ws.height);
}
function openPreview(i) {
  const first = S.preview == null;
  S.preview = i;
  if (S.opt === '1' && S.chatOpen && S.chatMode === 'docked') { S.chatMode = 'pop-over'; S.autoPopped = true; renderChat(); }
  layout();
  if (first) focusEl($('#so:not(.is-off) #pvTitle, #pane #pvTitle, #lp #pvTitle')?.closest('.pv')?.querySelector('[data-close-preview]'));
}
function closePreview() {
  const i = S.preview; S.preview = null;
  if (S.autoPopped) { S.chatMode = 'docked'; S.autoPopped = false; renderChat(); }
  layout();
  focusEl($(`[data-preview="${i}"]`));
}
function reset(opt) { S.navUser = false; S.opt = opt; S.preview = null; S.chatOpen = true; S.chatMode = 'docked'; S.autoPopped = false; S.tab = 'Details'; if (autoCollapsed) { setNav('open'); autoCollapsed = false; } renderChat(); layout(); renderGuide(); }

// ===== Events =====
document.addEventListener('click', (e) => {
  const t = e.target;
  const pv = t.closest('[data-preview]'); if (pv) { const i = +pv.dataset.preview; S.preview === i ? closePreview() : openPreview(i); return; }
  if (t.closest('[data-close-preview]')) { closePreview(); return; }
  // Option 2: a click outside the popover closes it, except in the chat (the chat stays usable)
  if (S.opt === '2' && S.preview != null && !t.closest('#lp') && !t.closest('#chat') && !t.closest('#guide')) { closePreview(); }
  const st = t.closest('[data-step]'); if (st) { openPreview(Math.max(0, Math.min(ROWS.length - 1, S.preview + +st.dataset.step))); return; }
  const tab = t.closest('[data-tab]'); if (tab) { S.tab = tab.dataset.tab; layout(); return; }
  const pin = t.closest('[data-pin]'); if (pin) { const tb = TABS.find((x) => x.id === pin.dataset.pin); tb.pinned = !tb.pinned; hideTip(); renderNav(); return; }
  const ct = t.closest('[data-close-tab]'); if (ct) { TABS.splice(TABS.findIndex((x) => x.id === ct.dataset.closeTab), 1); hideTip(); renderNav(); return; }
  if (t.closest('[data-clear-tabs]')) { for (let i = TABS.length - 1; i >= 0; i--) if (!TABS[i].pinned && !TABS[i].active) TABS.splice(i, 1); renderNav(); return; }
  const op = t.closest('[data-opener]');
  if (op) { if (op.dataset.opener === 'amplify') { S.chatOpen = true; renderChat(); layout(); renderGuide(); renderNav(); focusEl($('#chat textarea')); } return; }
  if (t.closest('[data-tab-id]')) return; // entity tabs: other records aren't built
  if (t.closest('[data-chat-mode]')) {
    if (S.chatMode === 'pop-over') { // dock back
      S.chatMode = 'docked';
      if (S.autoPopped && S.preview != null) { S.autoPopped = false; S.preview = null; } // Option 1: docking closes the slideout so it can't cover the chat
      S.autoPopped = false;
    } else S.chatMode = 'pop-over';
    renderChat(); layout(); return;
  }
  if (t.closest('[data-chat-close]')) { S.chatOpen = false; S.autoPopped = false; S.chatMode = 'docked'; layout(); renderGuide(); renderNav(); focusEl($('[data-reopen]')); return; }
  const f = t.closest('[data-follow]'); if (f) { ask(f.dataset.follow); return; }
  const g = t.closest('[data-opt]'); if (g) { reset(g.dataset.opt); return; }
  if (t.closest('[data-reopen]')) { S.chatOpen = true; renderChat(); layout(); renderGuide(); renderNav(); focusEl($('#chat textarea')); return; }
  if (t.closest('[data-guide-toggle]')) { S.guideOpen = !S.guideOpen; renderGuide(); if (S.guidePos) placeGuide(S.guidePos.x, S.guidePos.y); $('#guide [data-guide-toggle]')?.focus(); return; }
  if (t.closest('#navToggle')) { autoCollapsed = false; S.navUser = true; setNav($('#shell').dataset.nav === 'open' ? 'collapsed' : 'open'); layout(); }
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && S.preview != null && !e.target.closest('#chat')) { closePreview(); return; }
  const grip = e.target.closest('[data-grip]');
  if (grip && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); S.paneW += e.key === 'ArrowLeft' ? 32 : -32; layout(); $('#pane [data-grip]')?.focus(); }
});
document.addEventListener('pointerdown', (e) => {
  const grip = e.target.closest('[data-grip]'); if (!grip) return;
  e.preventDefault(); grip.classList.add('is-drag');
  const startX = e.clientX, startW = S.paneW, pane = $('#pane');
  const move = (ev) => { S.paneW = Math.max(360, Math.min(SO_W, startW + (startX - ev.clientX))); pane.style.setProperty('--pane-w', S.paneW + 'px'); };
  const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); layout(); };
  addEventListener('pointermove', move); addEventListener('pointerup', up);
});
addEventListener('resize', () => { placePopover(); placeLp(); if (S.guidePos) placeGuide(S.guidePos.x, S.guidePos.y); });
// Move the guide: drag its header (open or collapsed), or focus the move button and use the arrow keys
function placeGuide(x, y) {
  const g = $('#guide'), w = g.offsetWidth || 300, h = g.offsetHeight || 40;
  x = Math.max(8, Math.min(innerWidth - w - 8, x)); y = Math.max(8, Math.min(innerHeight - h - 8, y));
  S.guidePos = { x, y }; Object.assign(g.style, { left: x + 'px', top: y + 'px', right: 'auto', bottom: 'auto' });
}
document.addEventListener('pointerdown', (e) => {
  const head = e.target.closest('[data-guide-drag]');
  if (!head || (e.target.closest('button') && !e.target.closest('[data-guide-move]'))) return;
  e.preventDefault();
  const g = $('#guide'), r = g.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
  g.classList.add('is-dragging');
  const move = (ev) => placeGuide(ev.clientX - dx, ev.clientY - dy);
  const up = () => { g.classList.remove('is-dragging'); removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
  addEventListener('pointermove', move); addEventListener('pointerup', up);
});
document.addEventListener('keydown', (e) => {
  if (!e.target.closest('[data-guide-move]')) return;
  const step = e.shiftKey ? 64 : 16, d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
  if (!d) return; e.preventDefault();
  const r = $('#guide').getBoundingClientRect(); placeGuide(r.left + d[0], r.top + d[1]);
});
// ===== Prototype guide =====
const OPTS = [
  ['current', 'Today (the problem)', 'The slideout opens over the docked chat. The chat is covered until the preview closes.'],
  ['1', 'Option 1 · Chat → pop over', 'Opening a preview turns the docked chat into a pop over, to the left of the slideout. Closing the preview docks it again.'],
  ['2', 'Option 2 · Popover (recommended)', 'The preview opens as a popover next to the row. The docked chat stays where it is and stays usable.'],
  ['3', 'Option 3 · Inline preview pane', 'The preview opens between the list and the chat. The list narrows; the chat stays where it is.'],
];
S.guideOpen = true;
function renderGuide() {
  const cur = OPTS.find((x) => x[0] === S.opt);
  $('#guide').innerHTML = `<div class="guide__card${S.guideOpen ? '' : ' is-collapsed'}">
    <div class="guide__head" data-guide-drag title="Drag to move"><span class="guide__grip">${iconBtn('move', 'Move guide: drag, or use arrow keys', { attrs: 'data-guide-move' })}<p class="guide__title">Prototype guide</p></span>${iconBtn(S.guideOpen ? 'chevron-down' : 'chevron-up', S.guideOpen ? 'Collapse guide' : 'Expand guide', { attrs: `data-guide-toggle aria-expanded="${S.guideOpen}"` })}</div>
    <div ${S.guideOpen ? '' : 'hidden'}>
      <div class="guide__sec"><div class="guide__seg" role="group" aria-label="Option">${OPTS.map(([k, l]) => `<button type="button" class="ats-btn ats-btn--secondary ats-btn--small${S.opt === k ? ' is-on' : ''}" aria-pressed="${S.opt === k}" data-opt="${k}">${l}</button>`).join('')}</div>
        <p>${cur[2]}</p></div>
      <div class="guide__sec"><p><b>Try:</b> click the binoculars on any row. Then click another row’s binoculars, type in the chat, or press Esc.</p>
        ${S.chatOpen ? '' : btn('Reopen Amplify chat', { attrs: 'data-reopen' })}
        <p>Data is fictional and resets on reload. Not built: filters, search, record tabs other than Details.</p></div>
    </div></div>`;
}

// ===== Init + embed params (used by the design decisions page) =====
// ?embed=1 hides the guide · opt=current|1|2|3 · preview=<row index> · nav=open|collapsed · chat=closed · mode=pop-over
const q = new URLSearchParams(location.search);
if (q.get('embed') === '1') document.body.classList.add('embed');
if (q.get('nav') === 'collapsed') setNav('collapsed');
const qo = q.get('opt'); if (OPTS.some((x) => x[0] === qo)) S.opt = qo;
else if (OPTS.some((x) => x[0] === location.hash.slice(1))) S.opt = location.hash.slice(1);
if (q.get('chat') === 'closed') S.chatOpen = false;
if (q.get('mode') === 'pop-over') S.chatMode = 'pop-over';
// Collapsed alley expands on hover, as in the ATS (bowling-alley "State=Hover 2"); pin tooltips
const alley = $('.ats-bowling-alley');
alley.addEventListener('mouseenter', () => { if ($('#shell').dataset.nav === 'collapsed') $('#shell').dataset.nav = 'hover'; });
alley.addEventListener('mouseleave', () => { if ($('#shell').dataset.nav === 'hover') $('#shell').dataset.nav = 'collapsed'; hideTip(); });
alley.addEventListener('mouseover', (e) => { const p = e.target.closest('[data-pin]'); if (p) showTip(p, p.getAttribute('aria-label')); });
alley.addEventListener('mouseout', (e) => { if (e.target.closest('[data-pin]')) hideTip(); });
alley.addEventListener('focusin', (e) => { const p = e.target.closest('[data-pin]'); if (p) showTip(p, p.getAttribute('aria-label')); });
alley.addEventListener('focusout', hideTip);
alley.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-tab-id]')) e.preventDefault(); });
$('#list').addEventListener('scroll', placeLp, { passive: true });
renderNav(); renderChat(); layout(); renderGuide();
if (q.has('preview')) openPreview(Math.max(0, Math.min(ROWS.length - 1, +q.get('preview') || 0)));
