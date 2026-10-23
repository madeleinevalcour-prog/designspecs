// ===== Helpers =====
const S = { navUser: false, jobTab: 'not', tab: 2, sel: new Set() };
const $ = (s, r = document) => r.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ic = (name, size = 16, color = '', cls = '') =>
  `<span class="ats-icon ${cls}" data-i="${name}" aria-hidden="true" style="width:${size}px;height:${size}px;${color ? `background-color:${color}` : ''}"></span>`;
const btn = (label, { theme = 'secondary', size = 'default', icon, iconR, cls = '', attrs = '' } = {}) =>
  `<button type="button" class="ats-btn ats-btn--${theme} ats-btn--${size} ${cls}" ${attrs}>${icon ? ic(icon, size === 'small' ? 12 : 14) : ''}${label}${iconR ? ic(iconR, size === 'small' ? 12 : 14) : ''}</button>`;
const iconBtn = (icon, label, size = 'default') =>
  `<button type="button" class="ats-btn ats-btn--icon ats-btn--${size}" aria-label="${label}" title="${label}">${ic(icon, size === 'small' ? 12 : 14)}</button>`;
const chip = (label, { color = 'default', size = 'small', icon } = {}) =>
  `<span class="ats-novo-chip" data-color="${color}" data-size="${size}">${icon ? ic(icon, 10, 'var(--_chip-icon)') : ''}<span class="ats-novo-chip__label">${esc(label)}</span></span>`;

// ===== Bowling alley (markup mirrors ats-ui main-tabs / entity-tabs) =====
const TABS = [
  { id: 't1', type: 'company', icon: 'company-list', label: 'Companies' },
  { id: 't2', type: 'company', icon: 'company', label: '19 | Nexus Dynamics', active: true },
];
const navIc = (n, size = 14) => ic(n, size, 'var(--bowling-alley-color-content-icon-default)');
function renderNav() {
  const opener = (icon, label) => `<button class="ats-bowling-alley-tab ats-bowling-alley-tab--opener" type="button" aria-label="${label}">
      <span class="ats-bowling-alley-tab__icon">${navIc(icon)}</span><span class="ats-bowling-alley-tab__label">${label}</span>
      <span class="ats-bowling-alley-tab__next">${navIc('next', 12)}</span></button>`;
  $('#mainTabs').innerHTML = opener('search', 'Find') + opener('menu-outline', 'Menu') + opener('add-thin', 'Add')
    + `<button class="ats-bowling-alley-tab" type="button" aria-label="Amplify"><span class="ats-bowling-alley-tab__icon">${ic('amplify', 14, '', 'amp-glyph')}</span><span class="ats-bowling-alley-tab__label">Amplify</span></button>`;
  $('#entTabs').innerHTML = TABS.map((t) => `<div class="ats-bowling-alley-tab ats-bowling-alley-tab--entity${t.active ? ' is-active' : ''}${t.pinned ? ' is-pinned' : ''}" role="button" tabindex="0" data-entity="${t.type}" ${t.active ? 'aria-current="page"' : ''}>
      <span class="ats-bowling-alley-tab__icon"><span class="ats-icon-container" data-theme="${t.type}" data-size="sm">${ic(t.icon, 12, 'var(--icon-container-icon)')}</span></span>
      <span class="ats-bowling-alley-tab__label">${esc(t.label)}</span>
      <span class="ats-bowling-alley-tab__actions">
        <button class="ats-bowling-alley-tab__pin" type="button" aria-label="${t.pinned ? 'Remove pin' : 'Pin'}" aria-pressed="${!!t.pinned}" data-pin="${t.id}">${ic(t.pinned ? 'pin' : 'pin-outline', 12, 'var(--color-icon-subtle)')}</button>
        ${t.active ? '' : `<button class="ats-bowling-alley-tab__close" type="button" aria-label="Close ${esc(t.label)}" data-close-tab="${t.id}">${ic('close', 12, 'var(--color-icon-subtle)')}</button>`}
      </span></div>`).join('');
}
function setNav(state) {
  $('#shell').dataset.nav = state;
  const t = $('#navToggle'); t.setAttribute('aria-expanded', String(state === 'open'));
  t.setAttribute('aria-label', state === 'open' ? 'Collapse menu' : 'Expand menu');
  $('#navToggleIcon').dataset.i = state === 'open' ? 'contract-left' : 'expand-right';
}

// ===== Record header (markup mirrors ats-ui record-header) =====
const RTABS = [['Overview'], ['Edit'], ['Prospect', 'amplify'], ['Activity'], ['Emails'], ['Notes', , 9], ['Contacts', , 7], ['Location'], ['Billing Profiles'], ['Invoice Terms'], ['Shifts'], ['Files', , 0]];
const FIELDS = [['ID', '19'], ['Company Name', 'Nexus Dynamics'], ['Main Phone', '617-478-9100', 'tel:6174789100'], ['Status', 'Active Account']];
function renderHeader() {
  $('#rh').innerHTML = `
  <div class="ats-rh__top">
    <div class="ats-rh__left">
      <div class="ats-rh__name-group">
        <span class="ats-icon-container" data-theme="company" data-size="lg">${ic('company', 24, 'var(--icon-container-icon)')}</span>
        <span class="ats-rh__name">Nexus Dynamics</span>
      </div>
      <div class="ats-rh__social">
        <span class="ats-rh-verified">${ic('check', 12, 'var(--color-text-utility-positive)')}Verified</span>
        ${iconBtn('google', 'Google', 'small')}${iconBtn('location', 'Map', 'small')}
      </div>
    </div>
    <div class="ats-rh__icons">${iconBtn('print', 'Print')}${iconBtn('link', 'Copy link')}${iconBtn('pin-outline', 'Pin')}${iconBtn('refresh-outline', 'Refresh')}</div>
    <div class="ats-rh__buttons">${btn('Actions', { iconR: 'chevron-down' })}${btn('Amplify', { theme: 'primary', icon: 'amplify', cls: 'ats-btn--amplify' })}</div>
  </div>
  <div class="ats-rh__fields">${FIELDS.map(([l, v, h]) => `<div class="ats-rh-field"><span class="ats-rh-field__label">${l}</span>
    <span class="ats-rh-field__value${h ? ' ats-rh-field__value--link' : ''}">${h ? `<a href="${h}">${v}</a>` : v}</span></div>`).join('')}</div>
  <div class="ats-rh__tabrow">
    <nav class="ats-rh__tabs" id="rtabs" aria-label="Record sections">${RTABS.map(([l, i, c], n) => `<button type="button" class="ats-rh-tab${n === S.tab ? ' is-active' : ''}" data-rtab="${n}"${n === S.tab ? ' aria-current="page"' : ''}>${i ? ic(i, 12, 'var(--ats-rh-accent)', 'ats-rh-tab__icon') : ''}${l}${c != null ? `<span class="ats-rh-tab__count">&nbsp;(${c})</span>` : ''}</button>`).join('')}</nav>
    <div class="ats-rh__tabrow-right">
      <div class="ats-rh-more" id="more">${btn('More', { theme: 'dialogue', iconR: 'chevron-down', attrs: 'id="moreBtn" aria-haspopup="menu" aria-expanded="false"' })}
        <div class="ats-rh-more__menu" id="moreMenu" role="menu" hidden></div></div>
      ${btn('Layout', { theme: 'dialogue', iconR: 'layout' })}
    </div>
  </div>`;
}
// Overflow tabs into More as the header narrows
function fitTabs() {
  const nav = $('#rtabs'); if (!nav) return;
  const tabs = [...nav.children]; tabs.forEach((t) => (t.hidden = false));
  const hidden = [];
  for (let i = tabs.length - 1; i >= 0 && nav.scrollWidth > nav.clientWidth; i--) {
    if (i === S.tab) continue;
    tabs[i].hidden = true; hidden.unshift(i);
  }
  $('#more').hidden = !hidden.length;
  $('#moreMenu').innerHTML = hidden.map((i) => `<button type="button" class="ats-rh-more__item" role="menuitem" data-rtab="${i}">${tabs[i].textContent.trim()}</button>`).join('');
}

// ===== Cards (not in ats-ui yet; built on ats-card) =====
const card = (title, { lead = '', after = '', acts = '', body = '', pad = false } = {}) => `<section class="ats-card">
  <div class="ats-card__header"><div class="ats-card__title">${lead}<h2 class="ats-card__title-text">${title}</h2>${after}</div>${acts ? `<div class="hd-acts">${acts}</div>` : ''}</div>
  <div class="ats-card__content">${pad ? `<div class="ats-card__pad">${body}</div>` : body}</div></section>`;
const tile = (label, inner) => `<div class="tile"><span class="tile__label">${label}</span>${inner}</div>`;

function intelCard() {
  const fact = (i, t) => `<li>${ic(i, 12, 'var(--color-icon-subtle)')}<span>${t}</span></li>`;
  const about = `<ul class="facts">${fact('location-outline', 'Boston, Massachusetts')}${fact('users', '1,000–5,000 employees')}${fact('calendar', 'Founded 1999')}
      ${fact('globe-outline', '<a href="#">www.nexusdynamics.com</a>')}</ul>
    <div class="chips">${chip('Software')}${chip('CRM Software')}</div>`;
  const rating = `<div class="tile__big">4.0 <small>/ 5</small></div>
    <div class="stars" aria-label="4 of 5 stars">${[1, 2, 3, 4, 5].map((n) => ic('placement', 14, n <= 4 ? 'var(--color-utility-yellow-400)' : 'var(--color-icon-disabled)')).join('')}</div>`;
  const growth = `<svg class="spark" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 6 L25 12 L50 28 L75 32 L100 31"/></svg>
    <div class="axis"><span>Q3 2025</span><span>Q3 2026</span></div>
    <div class="tile__meta tile__meta--neg">${ic('trending-down', 12, 'var(--color-icon-utility-negative)')}Declining 9.3%</div>`;
  const velocity = `<div class="bars" aria-hidden="true"><span style="height:100%"></span><span style="height:35%"></span><span style="height:60%"></span></div>
    <div class="axis"><span>Aug</span><span>Sep</span><span>Oct</span></div>
    <div class="tile__meta"><strong>6</strong>&nbsp;jobs / month</div>`;
  const score = `<div class="tile__big">49 <small>/ 100</small></div>
    <div class="tile__foot">${btn('Show breakdown', { theme: 'dialogue', size: 'small', iconR: 'arrow-right' })}</div>`;
  return card('Nexus Dynamics', {
    lead: `<span class="ats-icon-container" data-theme="company" data-size="sm">${ic('company', 12, 'var(--icon-container-icon)')}</span>`,
    after: `<span class="intel__social">${iconBtn('linkedin', 'LinkedIn', 'small')}${iconBtn('twitter', 'X', 'small')}</span>${chip('Early Access', { color: 'positive', icon: 'amplify' })}`,
    acts: `${chip('Last updated 20 days ago', { color: 'success', icon: 'check' })}${iconBtn('refresh-outline', 'Refresh data', 'small')}${iconBtn('delete-outline', 'Remove data', 'small')}`,
    body: `<div class="intel">${tile('About', about)}${tile('Glassdoor Rating', rating)}${tile('Employee Growth', growth)}${tile('Hiring Velocity', velocity)}${tile('BD Signal Score', score)}</div>`,
  });
}

// Fictional sample contacts per job
const JOBS = [
  ['Project Manager', 'Boston, MA', 'Oct 7, 2026', '$115K–$135K', ['DA', 'PN', 'GW'], 2],
  ['Business Development Representative', 'Boston, MA', 'Oct 12, 2026', '$20K–$50K', ['DP', 'DR', 'KW'], 2],
  ['Senior Director, Global Sales, SMB', 'Boston, MA', 'Sep 30, 2026', '$275K', ['DP', 'DR', 'KW'], 2],
  ['Principal IT Security Project Manager', '', 'Sep 16, 2026', '$144K–$170K', ['JN', 'AM', 'EA'], 2],
  ['Product Marketing Manager', 'Boston, MA', 'Sep 9, 2026', '$120K–$140K', ['LT', 'SB', 'CK'], 4],
  ['Customer Success Manager', 'Remote', 'Aug 28, 2026', '$85K–$100K', ['HP', 'OR'], 0],
];
function jobsCard() {
  const stat = (n, l, warn) => `<div class="stat"><div class="stat__n">${n}${warn ? ic('caution', 14, 'var(--color-icon-utility-warning)') : ''}</div><div class="stat__l">${l}</div></div>`;
  const tab = (k, l) => `<button type="button" class="ats-rh-tab${S.jobTab === k ? ' is-active' : ''}" data-jobtab="${k}" aria-pressed="${S.jobTab === k}">${l}</button>`;
  const field = (type, text, icon) => `<span class="ats-item-field" data-type="${type}">${ic(icon, 12, 'var(--color-icon-illustration)')}<span class="ats-item-field__text">${text}</span></span>`;
  const av = (a) => `<span class="ats-amplify-chat-chat-list-item__avatar ats-amplify-chat-chat-list-item__avatar--initials">${a}</span>`;
  const rows = S.jobTab === 'not' ? JOBS.map(([t, loc, d, pay, avs, more], i) => `<div class="ats-novo-list-item ats-novo-list-item--clickable" role="listitem">
      <button type="button" class="ats-novo-list-item__action" aria-label="Open ${t}"${i === 0 ? ' data-job="0" aria-haspopup="dialog"' : ''}></button>
      <div class="jrow"><div class="jrow__main">
        <div class="ats-item-header" data-theme="standard"><span class="ats-item-avatar" data-option="entity" data-entity="job"><span class="ats-icon-container" data-theme="jobs" data-size="sm">${ic('job', 12, 'var(--icon-container-icon)')}</span></span>
          <span class="ats-link-text" data-size="large"><span class="ats-link-text__label">${t}</span></span></div>
        <div class="ats-item-data">${loc ? field('location', loc, 'location') : ''}${field('date', d, 'calendar')}${field('status', pay, 'rate-circle')}</div>
      </div>
      <div class="avs" aria-label="${avs.length + more} suggested contacts">${avs.map(av).join('')}${more ? av('+' + more) : ''}</div></div>
    </div>`).join('')
    : `<div class="ats-novo-list-item" role="listitem"><span class="ats-item-field__text">No jobs are being worked yet.</span></div>`;
  return card('Active Job Coverage', {
    acts: `<div class="ats-search-input ats-search-input--pill is-small"><span class="ats-search-input__icon">${ic('search', 12, 'var(--search-color-content-icon)')}</span><input class="ats-search-input__input" type="search" placeholder="Search jobs" aria-label="Search jobs"></div>
      ${btn('View all', { size: 'small', iconR: 'arrow-right' })}`,
    body: `<div class="stats">${stat('0%', 'Covered')}${stat(6, 'Total active jobs')}${stat(6, 'Not covered', true)}${stat(0, 'Being worked')}</div>
      <div class="ctabs" role="group" aria-label="Job filter">${tab('not', 'Not Covered (6)')}${tab('worked', 'Being Worked (0)')}</div>
      <div class="ats-novo-list" role="list">${rows}</div>`,
  });
}

const LEVELS = ['CXO', 'VP', 'Director', 'Manager', 'IC', 'Unknown'];
const MATRIX = [['Sales', 1, 6, 25, 54, 56, 7], ['Operations', 3, 1, 16, 29, 2, 3], ['Other', 1, 10, 10, 23, 0, 3],
  ['Marketing', 1, 6, 16, 19, 2, 0], ['Engineering', 1, 6, 16, 13, 7, 0], ['All other departments', 3, 11, 25, 53, 7, 21]];
function matrixCard() {
  const total = (r) => r.slice(1).reduce((a, b) => a + b, 0);
  const cell = (v, w, cls = '') => `<td class="ats-ndt-td"><div class="ats-ndt-cell" style="min-width:${w}px"><span class="ats-ndt-cell__text ${cls}">${v}</span></div></td>`;
  const head = `<tr><th class="ats-ndt-th" scope="col"><div class="ats-ndt-cell ats-ndt-hcell" style="min-width:200px"><span class="ats-ndt-hcell__label">Department</span></div></th>
    ${LEVELS.map((l) => `<th class="ats-ndt-th" scope="col"><div class="ats-ndt-cell ats-ndt-hcell" style="min-width:64px"><span class="ats-ndt-hcell__label">${l}</span></div></th>`).join('')}</tr>`;
  const body = MATRIX.map((r) => `<tr class="ats-ndt-row"><td class="ats-ndt-td"><div class="ats-ndt-cell" style="min-width:200px"><span class="ats-ndt-cell__text">${r[0]}</span>${chip(String(total(r)))}</div></td>
    ${r.slice(1).map((v) => cell(v ? `<a class="ats-link-text mx__link" data-size="default" href="#"><span class="ats-link-text__label">${v}</span></a>` : '0', 64, v ? '' : 'is-zero')).join('')}</tr>`).join('');
  return `<div class="mx">${card('Contact Matrix', {
    after: chip('457 contacts'),
    acts: btn('View all', { size: 'small', iconR: 'arrow-right' }),
    body: `<div class="ats-ndt"><table class="ats-ndt__table"><thead>${head}</thead><tbody>${body}</tbody></table></div>`,
  })}</div>`;
}

// Fictional people
const MOVERS = [['NK', 'Nadia Kowalski', 'VP, Sales', 'nadia.kowalski@nexusdynamics.com', ['Promoted', '2 days ago']],
  ['TB', 'Theo Barnes', 'Director, Engineering', 'theo.barnes@nexusdynamics.com', ['New hire', '1 week ago']],
  ['SR', 'Sofia Reyes', 'Head of Marketing', 'sofia.reyes@nexusdynamics.com', ['Left company', '2 weeks ago'], false]];
function moversCard() {
  const item = ([a, n, title, email, sig, inAts = true]) => `<div class="ats-amplify-chat-chat-list-item" data-theme="prospect-contact" role="listitem">
    <div class="ats-amplify-chat-chat-list-item__list-item">
      <div class="ats-amplify-chat-chat-list-item__header-section">
        <span class="ats-amplify-chat-chat-list-item__avatar ats-amplify-chat-chat-list-item__avatar--initials" aria-hidden="true">${a}</span>
        <div class="ats-amplify-chat-chat-list-item__details">
          <button type="button" class="ats-amplify-chat-chat-list-item__name"><span class="ats-link-text" data-size="large">${ic('circle', 12, inAts ? 'var(--color-entity-contact)' : 'var(--color-entity-task)')}<span class="ats-link-text__label">${n}</span></span></button>
          <div class="ats-amplify-chat-chat-list-item__data"><span class="ats-amplify-chat-chat-list-item__job-title">${title}</span>
            <span class="ats-item-field" data-type="email">${ic('email', 12, 'var(--color-icon-illustration)')}<span class="ats-item-field__text">${email}</span></span></div>
        </div>
      </div>
      <div class="ats-amplify-chat-chat-list-item__content"><div class="ats-amplify-chat-chat-list-item__slot">
        <div class="ats-amplify-chat-relevance-signals"><span class="ats-amplify-chat-relevance-signals__label">${ic('amplify', 12, '', 'ats-amplify-chat-relevance-signals__sparkle')}Movement</span>
          <span class="ats-amplify-chat-relevance-signals__signals">${sig.map((x) => chip(x)).join('')}</span></div>
      </div></div>
    </div></div>`;
  return card('Movers & Shakers', {
    acts: btn('View all', { size: 'small', iconR: 'arrow-right' }),
    body: `<div class="ats-novo-list mv" role="list">${MOVERS.map(item).join('')}</div>`,
  });
}

// ===== Job slideout (opens from the first job row) =====
// Fictional sample data. Contact initials match the job row's avatars (DA, PN, GW +2).
const SO_JOB = { title: 'Project Manager', fields: [['Date Posted', '10/7/2026'], ['Last Updated', '--'], ['Estimated Salary', '$115,000–$135,000'], ['Location', 'Boston, MA']],
  desc: 'As a Project Manager at Nexus Dynamics, you will lead cross-functional delivery of customer implementation projects from kickoff to launch. You will own scope, timelines and budgets, run weekly status with stakeholders, manage risks and dependencies across engineering, product and services teams, and report progress to leadership. You will also mentor project coordinators and help improve delivery standards across the PMO.' };
const SO_CONTACTS = [
  ['DA', 'Daniel Abara', 'Chief Operating Officer', 'Strong Match', 'success', ['Department match: Operations', 'Executive authority', 'Same country as job']],
  ['PN', 'Priya Nair', 'Director, Project Management Office', 'Strong Match', 'success', ['Department match: Operations', 'Hiring manager level']],
  ['GW', 'Grace Whitfield', 'VP, Customer Delivery', 'Possible Match', 'warning', ['Department match: Services', 'Executive authority']],
  ['LM', 'Leo Marchetti', 'Talent Acquisition Partner', 'Possible Match', 'warning', ['Recruiting role', 'Previously contacted']],
  ['HC', 'Hana Cho', 'Engineering Manager', 'Possible Match', 'warning', ['Works with this role']],
];
function contactItem([a, n, title, match, color, sig], i) {
  return `<div class="ats-amplify-chat-chat-list-item" data-theme="prospect-contact" role="listitem">
    <span class="ats-amplify-chat-chat-list-item__check"><input type="checkbox" class="ats-checkbox" data-i="check" data-sel="${i}" ${S.sel.has(i) ? 'checked' : ''} aria-label="Select ${n}"></span>
    <div class="ats-amplify-chat-chat-list-item__list-item">
      <div class="ats-amplify-chat-chat-list-item__header-section">
        <span class="ats-amplify-chat-chat-list-item__avatar ats-amplify-chat-chat-list-item__avatar--initials" aria-hidden="true">${a}</span>
        <div class="ats-amplify-chat-chat-list-item__details">
          <button type="button" class="ats-amplify-chat-chat-list-item__name"><span class="ats-link-text" data-size="large">${ic('circle', 12, 'var(--color-entity-task)')}<span class="ats-link-text__label">${n}</span></span></button>
          <div class="ats-amplify-chat-chat-list-item__data"><span class="ats-amplify-chat-chat-list-item__job-title">${title}</span></div>
        </div>
        ${chip(match, { color, size: 'medium' })}
      </div>
      <div class="ats-amplify-chat-chat-list-item__content"><div class="ats-amplify-chat-chat-list-item__slot">
        <div class="ats-amplify-chat-relevance-signals"><span class="ats-amplify-chat-relevance-signals__label">${ic('amplify', 12, '', 'ats-amplify-chat-relevance-signals__sparkle')}Relevance Signals</span>
          <span class="ats-amplify-chat-relevance-signals__signals">${sig.map((x) => chip(x)).join('')}</span></div>
      </div></div>
    </div></div>`;
}
function renderSlideout() {
  const j = SO_JOB, keep = $('#so .so__body')?.scrollTop || 0;
  $('#so').innerHTML = `<div class="so__head">
      <div class="so__title">
        <div class="so__name">${ic('circle', 12, 'var(--color-entity-task)')}<span class="sr">Not in Bullhorn:</span><h2 id="soTitle">${j.title}</h2></div>
        <div class="so__acts">${btn('Add to Bullhorn', { theme: 'primary', size: 'small', icon: 'add-thin' })}<button type="button" class="ats-btn ats-btn--icon ats-btn--default" aria-label="Close" title="Close" data-close-so>${ic('close', 14)}</button></div>
      </div>
      <div class="ats-rh__fields">${j.fields.map(([l, v]) => `<div class="ats-rh-field"><span class="ats-rh-field__label">${l}</span><span class="ats-rh-field__value">${v}</span></div>`).join('')}</div>
    </div>
    <div class="so__body">
      <section class="ats-card">
        <div class="ats-card__header"><div class="ats-card__title">${ic('amplify', 16, '', 'amp-glyph')}<h3 class="ats-card__title-text">Hiring Signal</h3></div>${chip('Flagged by Ace', { color: 'positive', icon: 'amplify' })}</div>
        <div class="ats-card__content"><div class="ats-card__pad"><p style="margin:0">Nexus Dynamics is hiring a Project Manager. The role was posted on Oct 7, and the company has had six open jobs and a falling hiring velocity since August.</p></div></div>
      </section>
      <section class="ats-card">
        <div class="ats-card__header"><div class="ats-card__title"><h3 class="ats-card__title-text">Job Description</h3></div></div>
        <div class="ats-card__content"><div class="ats-card__pad">
          <p class="so__desc${S.descOpen ? ' is-open' : ''}" id="soDesc">${j.desc}</p>
          <button type="button" class="so__more" data-desc aria-expanded="${!!S.descOpen}" aria-controls="soDesc"><span class="ats-link-text" data-size="default"><span class="ats-link-text__label">${S.descOpen ? 'Show less' : 'Show more'}</span></span></button>
        </div></div>
        <div class="ats-card__footer">${btn('View full job posting', { theme: 'base', iconR: 'link', cls: 'so__foot-btn' })}</div>
      </section>
      <section class="ats-card">
        <div class="ats-card__header"><div class="ats-card__title"><h3 class="ats-card__title-text">Likely Hiring Managers</h3>${chip(String(SO_CONTACTS.length))}</div></div>
        <div class="ats-card__content">
          <div class="so__search"><div class="ats-search-input ats-search-input--pill is-small"><span class="ats-search-input__icon">${ic('search', 12, 'var(--search-color-content-icon)')}</span><input class="ats-search-input__input" type="search" placeholder="Search for more contacts" aria-label="Search for more contacts"></div></div>
          <div class="ats-novo-list rc" role="list">${SO_CONTACTS.map((c, i) => contactItem(c, i)).join('')}</div>
        </div>
      </section>
    </div>
    ${S.sel.size ? `<div class="so__bar ats-amplify-chat-selection-bar"><span class="ats-amplify-chat-selection-bar__count" aria-live="polite">${S.sel.size} of ${SO_CONTACTS.length} selected</span>${btn('Add to outreach', { theme: 'primary', icon: 'add-thin' })}</div>` : ''}`;
  afterSo(keep);
}
function afterSo(keep) { const b = $('#so .so__body'); if (b) b.scrollTop = keep; }
function openSo(trigger) { S.soTrigger = trigger; renderSlideout(); $('#so').classList.remove('is-off'); $('#so [data-close-so]').focus({ preventScroll: true }); }
function closeSo() { const so = $('#so'); if (so.classList.contains('is-off')) return; so.classList.add('is-off'); $('[data-job="0"]')?.focus({ preventScroll: true }); }

// ===== Render + events =====
function renderBody() {
  $('#body').innerHTML = intelCard() + `<div class="cols"><div class="stack">${jobsCard()}</div><div class="stack">${matrixCard()}${moversCard()}</div></div>`;
}
let autoCollapsed = false;
function onResize() {
  const narrow = innerWidth < 1100;
  if (!S.navUser) { if (narrow && $('#shell').dataset.nav === 'open') { setNav('collapsed'); autoCollapsed = true; } else if (!narrow && autoCollapsed) { setNav('open'); autoCollapsed = false; } }
  fitTabs();
}
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.closest('#navToggle')) { S.navUser = true; setNav($('#shell').dataset.nav === 'collapsed' || $('#shell').dataset.nav === 'hover' ? 'open' : 'collapsed'); setTimeout(fitTabs, 220); return; }
  const pin = t.closest('[data-pin]'); if (pin) { const tb = TABS.find((x) => x.id === pin.dataset.pin); tb.pinned = !tb.pinned; renderNav(); return; }
  const ct = t.closest('[data-close-tab]'); if (ct) { TABS.splice(TABS.findIndex((x) => x.id === ct.dataset.closeTab), 1); renderNav(); return; }
  if (t.closest('[data-clear-tabs]')) { for (let i = TABS.length - 1; i >= 0; i--) if (!TABS[i].pinned && !TABS[i].active) TABS.splice(i, 1); renderNav(); return; }
  if (t.closest('[data-job]')) { openSo(); return; }
  if (t.closest('[data-close-so]')) { closeSo(); return; }
  if (t.closest('[data-desc]')) { S.descOpen = !S.descOpen; renderSlideout(); $('#so [data-desc]').focus(); return; }
  const jt = t.closest('[data-jobtab]'); if (jt) { S.jobTab = jt.dataset.jobtab; renderBody(); return; }
  const rt = t.closest('[data-rtab]'); if (rt) { S.tab = +rt.dataset.rtab; renderHeader(); fitTabs(); return; }
  const mb = t.closest('#moreBtn'); const menu = $('#moreMenu');
  if (mb) { menu.hidden = !menu.hidden; mb.setAttribute('aria-expanded', String(!menu.hidden)); return; }
  if (menu && !menu.hidden) { menu.hidden = true; $('#moreBtn').setAttribute('aria-expanded', 'false'); }
});
const alley = $('.ats-bowling-alley');
alley.addEventListener('mouseenter', () => { if ($('#shell').dataset.nav === 'collapsed') $('#shell').dataset.nav = 'hover'; });
alley.addEventListener('mouseleave', () => { if ($('#shell').dataset.nav === 'hover') $('#shell').dataset.nav = 'collapsed'; });
document.addEventListener('change', (e) => {
  const c = e.target.closest('[data-sel]'); if (!c) return;
  c.checked ? S.sel.add(+c.dataset.sel) : S.sel.delete(+c.dataset.sel); renderSlideout();
});
addEventListener('resize', onResize);
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSo(); });
const p = new URLSearchParams(location.search);
renderNav(); renderHeader(); renderBody();
if (p.get('sel') === '1') [0, 1].forEach((i) => S.sel.add(i));
if (p.get('job') === '1') openSo();
if (p.get('nav') === 'collapsed') { S.navUser = true; setNav('collapsed'); }
onResize();
