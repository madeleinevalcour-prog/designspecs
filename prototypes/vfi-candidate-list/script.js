// VFI Engage London 2026, scene 5: the candidate list filtered to the tearsheet from scene 4.
// Derived from the amplify-preview candidate list. Static; fictional data.
const $ = (s, r = document) => r.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ic = (name, size = 16, color = '', cls = '') =>
  `<span class="ats-icon ${cls}" data-i="${name}" aria-hidden="true" style="width:${size}px;height:${size}px;${color ? `background-color:${color}` : ''}"></span>`;
const btn = (label, { theme = 'secondary', size = 'small', icon, iconR, iconColor = '', attrs = '', cls = '' } = {}) =>
  `<button type="button" class="ats-btn ats-btn--${theme} ats-btn--${size} ${cls}" ${attrs}>${icon ? ic(icon, size === 'small' ? 12 : 14, iconColor) : ''}${label}${iconR ? ic(iconR, size === 'small' ? 12 : 14) : ''}</button>`;

// Tearsheet from scene 4: 41 candidates match the Project Manager lead at Nexus Dynamics.
const TEARSHEET = 'Project Manager, Nexus Dynamics';
const TOTAL = 41, PAGE = 20;
const ROWS = [
  ['Tyler Brooks', 'Project Manager', 'Boston, MA', 'Available'],
  ['Priya Raman', 'Senior Project Manager', 'Cambridge, MA', 'Available'],
  ['Marcus Hale', 'IT Project Manager', 'Quincy, MA', 'Available in 2 weeks'],
  ['Elena Ortiz', 'Program Manager', 'Boston, MA', 'Available'],
  ['Jordan Kim', 'Project Manager, PMP', 'Somerville, MA', 'Available'],
  ['Aisha Bello', 'Technical Project Manager', 'Newton, MA', 'Available'],
  ['Sam Whitaker', 'Project Manager', 'Boston, MA', 'Available'],
  ['Grace Liu', 'Delivery Manager', 'Waltham, MA', 'Available in 1 week'],
  ['Daniel Osei', 'Senior Project Manager', 'Brookline, MA', 'Available'],
  ['Hannah Moore', 'Agile Project Manager', 'Boston, MA', 'Available'],
  ['Luis Fernandez', 'Project Manager', 'Medford, MA', 'Available'],
  ['Nora Fischer', 'PMO Lead', 'Boston, MA', 'Available'],
  ['Ravi Patel', 'Senior Project Manager', 'Lexington, MA', 'Available in 2 weeks'],
  ['Chloe Martin', 'Project Manager', 'Cambridge, MA', 'Available'],
  ['Omar Haddad', 'Implementation Project Manager', 'Boston, MA', 'Available'],
  ['Julia Brandt', 'Project Manager, PMP', 'Burlington, MA', 'Available'],
  ['Kevin Doyle', 'Program Manager', 'Boston, MA', 'Available in 3 weeks'],
  ['Mei Tanaka', 'Technical Program Manager', 'Cambridge, MA', 'Available'],
  ['Andre Silva', 'Project Manager', 'Framingham, MA', 'Available'],
  ['Rachel Green', 'Senior Delivery Manager', 'Boston, MA', 'Available'],
].map(([name, title, loc, avail], i) => {
  const id = String(12650 + i * 37);
  return { name, title, loc, avail, id, email: name.toLowerCase().replace(' ', '.') + '@example.com', phone: '617-555-0' + id.slice(-3) };
});

// ===== Bowling alley: same record tabs as the Prospect tab scene, plus this list =====
const TABS = [
  { type: 'company', icon: 'company-list', label: 'Companies' },
  { type: 'company', icon: 'company', label: '19 | Nexus Dynamics' },
  { type: 'candidate', icon: 'candidate-list', label: 'Candidates', active: true },
];
const navIc = (n, size = 14) => ic(n, size, 'var(--bowling-alley-color-content-icon-default)');
function renderNav() {
  const opener = (icon, label) => `<button class="ats-bowling-alley-tab ats-bowling-alley-tab--opener" type="button" aria-label="${label}">
      <span class="ats-bowling-alley-tab__icon">${navIc(icon)}</span><span class="ats-bowling-alley-tab__label">${label}</span>
      <span class="ats-bowling-alley-tab__next">${navIc('next', 12)}</span></button>`;
  $('#mainTabs').innerHTML = opener('search', 'Find') + opener('menu-outline', 'Menu') + opener('add-thin', 'Add')
    + `<button class="ats-bowling-alley-tab" type="button" aria-label="Amplify"><span class="ats-bowling-alley-tab__icon">${ic('amplify', 14, '', 'amp-glyph')}</span><span class="ats-bowling-alley-tab__label">Amplify</span></button>`;
  $('#entTabs').innerHTML = TABS.map((t) => `<div class="ats-bowling-alley-tab ats-bowling-alley-tab--entity${t.active ? ' is-active' : ''}" role="button" tabindex="0" data-entity="${t.type}" ${t.active ? 'aria-current="page"' : ''}>
      <span class="ats-bowling-alley-tab__icon"><span class="ats-icon-container" data-theme="${t.type}" data-size="sm">${ic(t.icon, 12, 'var(--icon-container-icon)')}</span></span>
      <span class="ats-bowling-alley-tab__label">${esc(t.label)}</span></div>`).join('');
}

// ===== Candidate list (Figma 1766:66016), filtered to the tearsheet, everything selected =====
const COLS = [['Name', 'name', 180, true], ['Job Title', 'title', 220], ['Location', 'loc', 150], ['Availability', 'avail', 170], ['Personal Email', 'email', 230], ['ID', 'id', 90], ['Mobile Phone', 'phone', 140]];
const S = { menu: false };
const ACTIONS = [
  ['Add to Outreach', 'outbound-email'], ['Send Email', 'email'], ['Add Note', 'add-note'], ['Add to Tearsheet', 'tearsheet'], ['Add to Job', 'job'], ['Export', 'download'],
];
function actionsMenu() {
  return `<div class="am ats-dropdown-card" role="menu" aria-label="Actions">${ACTIONS.map(([l, i], n) => `<button type="button" class="ats-menu-option${n === 0 ? ' is-first' : ''}" data-type="default" role="menuitem">${ic(i, 16, 'var(--color-icon-subtle)', 'ats-menu-option__icon')}<span class="ats-menu-option__label">${l}</span></button>`).join('')}</div>`;
}
function renderList() {
  const th = (l, w) => `<th class="ats-ndt-th" scope="col"><div class="ats-ndt-cell ats-ndt-hcell" style="width:${w}px"><span class="ats-ndt-hcell__label">${l}</span>${ic('sortable', 12, '', 'ats-ndt-ic')}${ic('filter', 12, '', 'ats-ndt-ic')}</div></th>`;
  const dot = ic('circle', 10, 'var(--color-entity-candidate)');
  const rows = ROWS.map((r) => `<tr class="ats-ndt-row is-selected" aria-selected="true">
      <td class="ats-ndt-td ats-ndt-td--check"><div class="ats-ndt-cell ats-ndt-cell--check"><input type="checkbox" class="ats-checkbox" data-i="check" checked aria-label="Select ${esc(r.name)}"></div></td>
      <td class="ats-ndt-td ats-ndt-td--icon"><div class="ats-ndt-cell ats-ndt-cell--icon"><button type="button" class="pv-btn" aria-label="Preview ${esc(r.name)}">${ic('preview', 16)}</button></div></td>
      ${COLS.map(([, k, w, link]) => `<td class="ats-ndt-td"><div class="ats-ndt-cell" style="width:${w}px">${link ? dot : ''}<span class="ats-ndt-cell__text${link ? ' ats-ndt-cell__text--link' : ''}">${esc(r[k])}</span></div></td>`).join('')}
    </tr>`).join('');
  const sel = `<div class="am-wrap">${btn(`${TOTAL} Selected`, { size: 'default', iconR: 'chevron-down', attrs: `aria-haspopup="menu" aria-expanded="${S.menu}" aria-label="${TOTAL} selected. Actions"` })}${S.menu ? actionsMenu() : ''}</div>`;
  $('#list').innerHTML = `<div class="lh">
      <div class="lh__title">
        <div class="lh__name"><span class="ats-icon-container" data-theme="candidate" data-size="lg">${ic('candidate-list', 24, 'var(--icon-container-icon)')}</span><h1>Candidates</h1></div>
        <div class="lh__actions">
          ${[['columns', 'Columns'], ['star-o', 'Saved'], ['refresh-outline', 'Refresh']].map(([i, l]) => btn('', { theme: 'dialogue', size: 'default', icon: i, attrs: `aria-label="${l}" title="${l}"` })).join('')}
          <div class="tiles" role="group" aria-label="Source"><button type="button" aria-pressed="true">Bullhorn (${TOTAL})</button><button type="button" aria-pressed="false">Job Boards</button></div>
          ${btn('Amplify', { theme: 'primary', size: 'default', icon: 'amplify', cls: 'ats-btn--amplify' })}</div>
      </div>
      <div class="adv"><div class="adv__q">${ic('search', 16, 'var(--color-icon-subtle)')}
          <span class="ats-novo-chip" data-type="default" data-size="medium" data-color="default">${ic('tearsheet', 10, 'var(--color-icon-illustration)', 'ats-novo-chip__icon')}<span class="ats-novo-chip__label">Tearsheet: ${TEARSHEET}</span><button type="button" class="ats-novo-chip__remove" aria-label="Remove tearsheet">${ic('close', 10, 'var(--_chip-icon)')}</button></span></div>
        ${btn('', { theme: 'dialogue', size: 'default', icon: 'advanced-search', attrs: 'aria-label="Advanced search" title="Advanced search"' })}</div>
      <div class="frow">${btn('Add Filter', { iconColor: 'var(--color-entity-candidate)', size: 'default', icon: 'add-thin' })}${btn('Users', { iconColor: 'var(--color-entity-candidate)', size: 'default', icon: 'user-outline', iconR: 'chevron-down' })}
        ${btn('Keywords', { iconColor: 'var(--color-entity-candidate)', size: 'default', icon: 'globe-outline', iconR: 'chevron-down' })}
        <span class="spacer"></span>${sel}${btn('Clear', { size: 'default', iconR: 'chevron-down', cls: 'ats-btn--negative' })}</div>
    </div>
    <div class="dtc"><div class="dtc__card"><div class="ats-ndt"><table class="ats-ndt__table" aria-label="Candidates"><thead><tr class="ats-ndt-hrow">
      <th class="ats-ndt-th ats-ndt-th--check" scope="col"><div class="ats-ndt-cell ats-ndt-cell--check"><input type="checkbox" class="ats-checkbox" data-i="check" checked aria-label="Select all"></div></th>
      <th class="ats-ndt-th ats-ndt-th--icon" scope="col"><div class="ats-ndt-cell ats-ndt-cell--icon"><span class="ats-ndt-sr">Preview</span></div></th>
      ${COLS.map(([l, , w]) => th(l, w)).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
      <div class="dtc__foot"><span class="ipp">ITEMS PER PAGE: <b>${PAGE}</b> of ${TOTAL}</span><span class="pg"><b class="pg__on">1</b><span>2</span><span>3</span></span></div></div></div>`;
}

// ===== Init =====
const q = new URLSearchParams(location.search);
if (q.get('menu') === 'open') S.menu = true;
if (q.get('nav') === 'collapsed') { $('#shell').dataset.nav = 'collapsed'; }
document.addEventListener('click', (e) => {
  const b = e.target.closest('[aria-haspopup="menu"]');
  if (b) { S.menu = !S.menu; renderList(); return; }
  if (S.menu && !e.target.closest('.am')) { S.menu = false; renderList(); }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && S.menu) { S.menu = false; renderList(); } });
const alley = $('.ats-bowling-alley');
alley.addEventListener('mouseenter', () => { if ($('#shell').dataset.nav === 'collapsed') $('#shell').dataset.nav = 'hover'; });
alley.addEventListener('mouseleave', () => { if ($('#shell').dataset.nav === 'hover') $('#shell').dataset.nav = 'collapsed'; });
$('#navToggle').addEventListener('click', () => { const sh = $('#shell'); sh.dataset.nav = sh.dataset.nav === 'open' ? 'collapsed' : 'open'; });
renderNav(); renderList();
