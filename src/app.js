import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.css';

const iconPaths = {
  shield: '<path d="M12 3.4 19 6v5.1c0 4.3-2.8 7.6-7 9.5-4.2-1.9-7-5.2-7-9.5V6l7-2.6Z"/><path d="m8.7 12 2.1 2.1 4.5-4.6"/>',
  dashboard: '<rect x="4" y="4" width="6" height="6" rx="1.2"/><rect x="14" y="4" width="6" height="6" rx="1.2"/><rect x="4" y="14" width="6" height="6" rx="1.2"/><rect x="14" y="14" width="6" height="6" rx="1.2"/>',
  map: '<path d="m3.5 6.5 5.2-2 6.6 3 5.2-2v12l-5.2 2-6.6-3-5.2 2v-12Z"/><path d="M8.7 4.8v11.7M15.3 7.5v11.8"/>',
  alert: '<path d="M10.3 4.7 3.8 16a1.5 1.5 0 0 0 1.3 2.2h13.8a1.5 1.5 0 0 0 1.3-2.2L13.7 4.7a2 2 0 0 0-3.4 0Z"/><path d="M12 9v3.4M12 15.6h.01"/>',
  link: '<path d="M10.4 13.6 9 15a3.5 3.5 0 0 1-5-5l2.3-2.3a3.5 3.5 0 0 1 5 0"/><path d="m13.6 10.4 1.4-1.4a3.5 3.5 0 0 1 5 5l-2.3 2.3a3.5 3.5 0 0 1-5 0"/><path d="m8.8 12.2 6.4-4.4"/>',
  audio: '<path d="M4 9.2v5.6M8 6.5v11M12 4v16M16 6.5v11M20 9.2v5.6"/>',
  settings: '<path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="m19.4 15 .1.1a1.8 1.8 0 1 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .8v.2a1.8 1.8 0 1 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.8l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.8-3h-.2a1.8 1.8 0 1 1 0-3.6h.2a1.8 1.8 0 0 0 .8-3l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.8v-.2a1.8 1.8 0 1 1 3.6 0v.2a1.8 1.8 0 0 0 3 .8l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .8 3h.2a1.8 1.8 0 1 1 0 3.6h-.2a1.8 1.8 0 0 0-.8 3Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  bell: '<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  users: '<path d="M16 20v-1.2a4.2 4.2 0 0 0-4.2-4.2H7.2A4.2 4.2 0 0 0 3 18.8V20"/><circle cx="9.5" cy="7.5" r="3.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 6.8M21 20v-1.2a4.2 4.2 0 0 0-3.1-4.1"/>',
  location: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  navigation: '<path d="m21 3-7.2 17-2.6-7.2L4 10.2 21 3Z"/><path d="m11.2 12.8 3.2-3.2"/>',
  home: '<path d="m3.5 10.8 8.5-7 8.5 7"/><path d="M5.5 9.8V20h13V9.8M9.5 20v-5.5h5V20"/>',
  route: '<circle cx="6" cy="18" r="2.3"/><circle cx="18" cy="6" r="2.3"/><path d="M8.3 18h2.4a3.3 3.3 0 0 0 3.3-3.3v-2.4A3.3 3.3 0 0 1 17.3 9H18"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.2 2"/>',
  check: '<path d="m5 12.5 4.2 4.2L19 7"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 9"/>',
  arrowUp: '<path d="M12 19V5M6.5 10.5 12 5l5.5 5.5"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  trend: '<path d="m4 16 5-5 3 3 7-8"/><path d="M14 6h5v5"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  zoomIn: '<circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.3 4.3M10.8 7.8v6M7.8 10.8h6"/>',
  zoomOut: '<circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.3 4.3M7.8 10.8h6"/>',
  locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3"/>',
  copy: '<rect x="8" y="8" width="10" height="11" rx="1.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v10A1.5 1.5 0 0 0 5.5 17H8"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  key: '<circle cx="8.5" cy="15.5" r="3.5"/><path d="m11 13 7.5-7.5M16 7l2 2M14 9l2 2"/>',
  smartphone: '<rect x="7" y="2.8" width="10" height="18.4" rx="2"/><path d="M10.5 5h3M11.5 18.2h1"/>',
  mic: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M8.5 21h7"/>',
  headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14v3a2 2 0 0 0 2 2h1v-6H5a1 1 0 0 0-1 1ZM20 14v3a2 2 0 0 1-2 2h-1v-6h2a1 1 0 0 1 1 1Z"/>',
  calculator: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 18h.01M12 18h4"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  more: '<circle cx="5" cy="12" r=".7" fill="currentColor"/><circle cx="12" cy="12" r=".7" fill="currentColor"/><circle cx="19" cy="12" r=".7" fill="currentColor"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.9-3L3 11M4 5v6h6M4 13a8 8 0 0 0 14.9 3L21 13m-1 6v-6h-6"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  shieldCheck: '<path d="M12 3.4 19 6v5.1c0 4.3-2.8 7.6-7 9.5-4.2-1.9-7-5.2-7-9.5V6l7-2.6Z"/><path d="m8.5 12.2 2.1 2.1 4.8-5"/>',
  star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
  sun: '<circle cx="12" cy="12" r="3.5"/><path d="M12 2.5v2M12 19.5v2M4.4 4.4l1.4 1.4M18.2 18.2l1.4 1.4M2.5 12h2M19.5 12h2M4.4 19.6l1.4-1.4M18.2 5.8l1.4-1.4"/>',
  moon: '<path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>',
  send: '<path d="m21 3-7.2 17-2.6-7.2L4 10.2 21 3Z"/>',
  play: '<path d="m8 5 10 7-10 7V5Z"/>',
  volume: '<path d="M4 10v4h3l4 3V7l-4 3H4ZM15 9.5a4 4 0 0 1 0 5M17.5 7a7.5 7.5 0 0 1 0 10"/>',
  eye: '<path d="M2.5 12s3.4-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.4 5.5-9.5 5.5S2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.5"/>',
  database: '<ellipse cx="12" cy="5.5" rx="7" ry="3"/><path d="M5 5.5v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6M5 11.5v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
  trash: '<path d="M4 7h16M10 11v5M14 11v5M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  homeHeart: '<path d="m3.5 10.8 8.5-7 8.5 7"/><path d="M5.5 9.8V20h13V9.8"/><path d="m12 16.8-.7-.6c-1.8-1.5-2.8-2.5-2.8-3.7a1.9 1.9 0 0 1 3.5-1 1.9 1.9 0 0 1 3.5 1c0 1.2-1 2.2-2.8 3.7l-.7.6Z"/>',
};

function icon(name, className = '') {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.info}</svg>`;
}

const APP_MODE = import.meta.env.VITE_APP_MODE || 'demo';
const isCompanionBuild = APP_MODE === 'companion';
const isDemoBuild = APP_MODE === 'demo';
const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('parentlock-theme') : null;

const state = {
  mode: isCompanionBuild ? 'child' : 'admin',
  screen: isCompanionBuild ? 'child-home' : 'overview',
  theme: savedTheme === 'amoled' ? 'amoled' : 'light',
  sheetExpanded: false,
  locationSharing: true,
  audioRequest: false,
  connected: false,
  settings: {
    liveLocation: true,
    arrivalAlerts: true,
    audioRequests: true,
    history: false,
  },
  calculator: {
    expression: '',
    display: '0',
    justEvaluated: false,
  },
  quiz: {
    index: 0,
    score: 0,
    selected: null,
  },
};

let activeMap = null;
let activeRouteBounds = null;
let sheetPointerStart = null;

const quizQuestions = [
  { question: 'Quanto é 7 × 8?', options: ['48', '54', '56', '64'], answer: '56' },
  { question: 'Qual é o próximo número? 5, 10, 15, ...', options: ['18', '20', '21', '25'], answer: '20' },
  { question: 'Quanto é 96 ÷ 12?', options: ['6', '8', '9', '12'], answer: '8' },
  { question: 'Você tinha 30 pontos e ganhou 12. Quantos tem agora?', options: ['38', '40', '42', '48'], answer: '42' },
];

const screenLabels = {
  overview: 'Visão geral',
  map: 'Mapa e rotas',
  alerts: 'Alertas',
  connection: 'Conexão',
  audio: 'Check-in de áudio',
  settings: 'Privacidade e ajustes',
  calculator: 'Calculadora',
  quiz: 'Quiz matemático',
  'child-route': 'Minha rota',
  'child-home': 'Meu espaço',
  'child-settings': 'Privacidade',
};

const adminNav = [
  { id: 'overview', label: 'Visão geral', icon: 'dashboard' },
  { id: 'map', label: 'Mapa e rotas', icon: 'map' },
  { id: 'alerts', label: 'Alertas', icon: 'alert', badge: '1' },
  { id: 'connection', label: 'Conexão', icon: 'link' },
  { id: 'audio', label: 'Check-in de áudio', icon: 'audio' },
  { id: 'settings', label: 'Privacidade', icon: 'settings' },
];

const childNav = [
  { id: 'child-home', label: 'Meu espaço', icon: 'homeHeart' },
  { id: 'calculator', label: 'Calculadora', icon: 'calculator' },
  { id: 'quiz', label: 'Quiz matemático', icon: 'star' },
  { id: 'connection', label: 'Conexão', icon: 'link' },
  { id: 'child-settings', label: 'Privacidade', icon: 'shieldCheck' },
];

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function navButton(item, current) {
  return `<button class="nav-item ${item.id === current ? 'active' : ''}" data-nav="${item.id}" type="button">
    ${icon(item.icon)}<span>${item.label}</span>${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
  </button>`;
}

function renderSidebar() {
  const nav = state.mode === 'admin' ? adminNav : childNav;
  const roleControls = isDemoBuild
    ? `<div class="role-label">Visualizar como</div>
    <div class="role-switcher" role="tablist" aria-label="Perfil do aplicativo">
      <button class="${state.mode === 'admin' ? 'active' : ''}" data-mode="admin" type="button" role="tab" aria-selected="${state.mode === 'admin'}">${icon('users')} Admin</button>
      <button class="${state.mode === 'child' ? 'active' : ''}" data-mode="child" type="button" role="tab" aria-selected="${state.mode === 'child'}">${icon('user')} Acompanhado</button>
    </div>`
    : `<div class="role-label">${isCompanionBuild ? 'Aplicativo acompanhado' : 'Aplicativo administrador'}</div>`;
  return `<aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">${icon('shield')}</div>
      <div><div class="brand-name">ParentLock</div><div class="brand-tagline">Proteção que aproxima</div></div>
    </div>
    ${roleControls}
    <nav class="sidebar-nav" aria-label="Navegação principal">
      <div class="nav-section-label">Menu principal</div>
      ${nav.map((item) => navButton(item, state.screen)).join('')}
    </nav>
    <div class="sidebar-spacer"></div>
    <div class="privacy-mini-card">
      <div class="mini-card-title">${icon('shieldCheck')} Controle transparente</div>
      <p>Localização e comunicação ficam visíveis e dependem de consentimento.</p>
    </div>
    <div class="sidebar-profile">
      <div class="avatar ${isCompanionBuild ? 'lia' : ''}">${isCompanionBuild ? 'LM' : 'AM'}</div>
      <div class="profile-copy"><strong>${isCompanionBuild ? 'Lia Martins' : 'Ana Martins'}</strong><span>${isCompanionBuild ? 'Aparelho acompanhado' : 'Conta administradora'}</span></div>
      <button class="profile-more" data-action="profile-menu" type="button" aria-label="Mais opções">${icon('more')}</button>
    </div>
  </aside>`;
}

function renderTopbar() {
  const label = screenLabels[state.screen] || 'ParentLock';
  const userName = state.mode === 'admin' ? 'Ana Martins' : 'Lia Martins';
  const userInitials = state.mode === 'admin' ? 'AM' : 'LM';
  return `<header class="topbar">
    <div class="topbar-left">
      <button class="mobile-menu" data-action="mobile-menu" type="button" aria-label="Abrir menu">${icon('menu')}</button>
      <div class="page-context"><span>ParentLock</span><span class="context-dot"></span><span>${label}</span></div>
    </div>
    <div class="topbar-right">
      <div class="topbar-status"><span class="status-dot"></span> Sistema seguro</div>
      <button class="theme-toggle" data-action="toggle-theme" type="button" aria-label="Alternar tema AMOLED">${icon(state.theme === 'amoled' ? 'sun' : 'moon')}<span>${state.theme === 'amoled' ? 'AMOLED' : 'Claro'}</span></button>
      <button class="topbar-user" data-action="profile-menu" type="button" aria-label="Abrir perfil">
        <div class="topbar-user-copy"><strong>${userName}</strong><span>${state.mode === 'admin' ? 'Administradora' : 'Aparelho acompanhado'}</span></div>
        <div class="avatar ${state.mode === 'child' ? 'lia' : ''}">${userInitials}</div>
      </button>
    </div>
  </header>`;
}

function renderMobileNav() {
  const nav = state.mode === 'admin' ? adminNav.slice(0, 4) : childNav;
  return `<nav class="mobile-bottom-nav" aria-label="Navegação móvel">
    ${nav.map((item) => `<button class="mobile-nav-item ${item.id === state.screen ? 'active' : ''}" data-nav="${item.id}" type="button">${icon(item.icon)}<span>${item.label}</span></button>`).join('')}
  </nav>`;
}

function mapMarkup(large = false) {
  return `<div class="map-canvas ${large ? 'map-canvas-large' : ''}" aria-label="Mapa ilustrativo com rota de Lia">
    <div class="map-streets"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
    <span class="map-label label-one">Jardim Aurora</span><span class="map-label label-two">Av. das Flores</span><span class="map-label label-three">Praça Central</span><span class="map-label label-four">Vila Nova</span>
    <svg class="route-line" viewBox="0 0 800 360" preserveAspectRatio="none" aria-hidden="true">
      <path d="M155 280 C205 258, 204 213, 275 221 S329 280, 390 250 S447 176, 506 153 S572 94, 604 103" />
      <path class="route-dash" d="M155 280 C205 258, 204 213, 275 221 S329 280, 390 250 S447 176, 506 153 S572 94, 604 103" />
    </svg>
    <div class="pin-pulse"></div>
    <div class="map-pin pin-home" aria-label="Casa">${icon('home')}</div>
    <div class="map-pin pin-lia" aria-label="Lia em movimento">${icon('navigation')}</div>
    <div class="map-person-card"><div class="avatar lia">LM</div><div><strong>Lia Martins</strong><span><span class="status-dot"></span> Em movimento · agora</span></div></div>
    <div class="map-controls"><button class="map-control" data-action="zoom-in" type="button" aria-label="Aumentar zoom">${icon('zoomIn')}</button><button class="map-control" data-action="zoom-out" type="button" aria-label="Diminuir zoom">${icon('zoomOut')}</button><button class="map-control" data-action="center-map" type="button" aria-label="Centralizar mapa">${icon('locate')}</button></div>
  </div>`;
}

function realMapMarkup() {
  return `<div class="real-map-canvas" data-real-map aria-label="Mapa real da família com rota compartilhada"></div>`;
}

function metricCard({ iconName, label, value, foot, trend, tone = '' }) {
  return `<article class="metric-card ${tone}"><div class="metric-top"><span>${label}</span><span class="metric-icon">${icon(iconName)}</span></div><strong class="metric-value">${value}</strong><div class="metric-bottom"><span class="metric-foot ${tone === 'coral' ? 'alert' : 'good'}">${icon('checkCircle')} ${foot}</span>${trend ? `<span class="metric-trend">${icon('trend')} ${trend}</span>` : ''}</div></article>`;
}

function renderAdminOverview() {
  return `<div class="map-first-page ${state.sheetExpanded ? 'sheet-expanded' : ''}">
    <header class="map-first-toolbar">
      <div class="map-first-brand"><span class="brand-mark">${icon('shield')}</span><div><strong>ParentLock</strong><small>Mapa da família</small></div></div>
      <div class="map-first-actions"><span class="live-chip"><span class="status-dot"></span> 2 online</span><button class="theme-toggle map-theme-toggle" data-action="toggle-theme" type="button" aria-label="Alternar tema AMOLED">${icon(state.theme === 'amoled' ? 'sun' : 'moon')}<span>${state.theme === 'amoled' ? 'AMOLED' : 'Claro'}</span></button><button class="map-profile" data-action="profile-menu" type="button" aria-label="Abrir perfil">AM</button></div>
    </header>
    <section class="map-first-stage">
      ${realMapMarkup()}
      <div class="map-place-pill">${icon('location')} Goiânia · agora</div>
      <div class="map-live-card"><div class="avatar lia">LM</div><div><strong>Lia Martins</strong><span><span class="status-dot"></span> Em movimento · agora</span></div><button data-nav="map" type="button" aria-label="Abrir detalhes da rota">${icon('chevronRight')}</button></div>
      <div class="map-action-stack"><button class="map-control" data-action="zoom-in" type="button" aria-label="Aumentar zoom">${icon('zoomIn')}</button><button class="map-control" data-action="zoom-out" type="button" aria-label="Diminuir zoom">${icon('zoomOut')}</button><button class="map-control" data-action="center-map" type="button" aria-label="Centralizar mapa">${icon('locate')}</button></div>
    </section>
    <nav class="map-floating-nav" aria-label="Navegação do mapa">
      <button class="map-nav-item active" data-nav="overview" type="button">${icon('map')}<span>Mapa</span></button>
      <button class="map-nav-item" data-nav="map" type="button">${icon('route')}<span>Rotas</span></button>
      <button class="map-nav-item" data-nav="alerts" type="button">${icon('alert')}<span>Alertas</span><b>1</b></button>
      <button class="map-nav-item" data-nav="connection" type="button">${icon('link')}<span>Conexão</span></button>
      <button class="map-nav-item" data-nav="settings" type="button">${icon('more')}<span>Mais</span></button>
    </nav>
    <section class="map-bottom-sheet" aria-label="Detalhes da família">
      <button class="sheet-handle" data-action="toggle-sheet" type="button" aria-label="${state.sheetExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}"><span></span><small>${state.sheetExpanded ? 'Toque para recolher' : 'Deslize para ver detalhes'}</small></button>
      <div class="sheet-content">
        <div class="sheet-heading"><div><div class="eyebrow">FAMÍLIA AO VIVO</div><h2>Quem está por perto</h2></div><span class="live-chip"><span class="status-dot"></span> 2 conectados</span></div>
        <div class="sheet-members"><div class="sheet-member"><div class="avatar lia">LM</div><div><strong>Lia Martins</strong><span>${icon('location')} Indo para Escola Horizonte</span></div><b>agora</b></div><div class="sheet-member"><div class="avatar">AM</div><div><strong>Ana Martins <em>você</em></strong><span>${icon('home')} Casa · compartilhando</span></div><b>agora</b></div></div>
        <article class="sheet-route-card"><div class="sheet-route-icon">${icon('route')}</div><div class="sheet-route-copy"><strong>Lia está a caminho</strong><span>Casa → Escola Horizonte · chegada prevista 08:34</span></div><button class="text-link" data-nav="map" type="button">Ver rota ${icon('arrowRight')}</button></article>
        <div class="sheet-stat-grid"><div class="sheet-stat"><span class="sheet-stat-icon mint">${icon('location')}</span><div><strong>2 de 2</strong><small>localizações ativas</small></div></div><div class="sheet-stat"><span class="sheet-stat-icon coral">${icon('alert')}</span><div><strong>01</strong><small>alerta pendente</small></div></div></div>
        <div class="sheet-actions"><button class="secondary-button" data-nav="connection" type="button">${icon('plus')} Conectar aparelho</button><button class="secondary-button" data-nav="alerts" type="button">${icon('bell')} Ver alertas</button></div>
      </div>
    </section>
  </div>`;
}
function renderMapPage() {
  return `<div class="dashboard"><section class="page-heading"><div><div class="eyebrow">LOCALIZAÇÃO COMPARTILHADA</div><h1>Mapa e rotas</h1><p>Acompanhe a rota ativa de Lia com atualização transparente.</p></div><div class="page-heading-actions"><button class="secondary-button" data-action="share-route" type="button">${icon('send')} Compartilhar rota</button><button class="primary-button" data-action="center-map" type="button">${icon('locate')} Centralizar</button></div></section><section class="inner-grid"><article class="panel map-panel large-map"><div class="panel-header"><div class="panel-title-wrap"><h2>Rota atual</h2><p>Casa → Escola Horizonte · iniciada às 08:12</p></div><span class="live-chip"><span class="status-dot"></span> ATUALIZADO AGORA</span></div><div class="map-toolbar"><button class="map-filter active" data-action="map-filter" type="button">${icon('users')} Lia Martins</button><button class="map-filter" data-action="map-filter" type="button">${icon('route')} Rota de hoje</button></div>${realMapMarkup()}<div class="map-footer"><div class="map-footer-left">${icon('location')}<span>Precisão aproximada</span><strong>12 m</strong></div><button class="map-footer-right text-link" data-action="map-details" type="button">Detalhes da atualização ${icon('chevronRight')}</button></div></article><aside class="panel route-summary"><div class="route-summary-header"><div><h2>Detalhes da rota</h2><p>Deslocamento em andamento</p></div><span class="route-distance">2,4 km</span></div><div class="route-points"><div class="route-point"><strong>Casa Martins</strong><span>${icon('location')} Rua das Acácias, 120</span><small>08:12</small></div><div class="route-point"><strong>Lia está a caminho</strong><span>${icon('navigation')} Av. das Flores, próximo à Praça Central</span><small>agora</small></div><div class="route-point"><strong>Escola Horizonte</strong><span>${icon('home')} Previsão de chegada</span><small>08:34</small></div></div><button class="secondary-button" data-action="route-alert" type="button">${icon('bell')} Avisar chegada automaticamente</button></aside></section></div>`;
}

function renderAlertsPage() {
  return `<div class="dashboard"><section class="page-heading"><div><div class="eyebrow">CENTRAL DE SEGURANÇA</div><h1>Alertas</h1><p>Notificações importantes, sem alarmismo e com contexto.</p></div><button class="secondary-button" data-action="mark-alerts-read" type="button">${icon('check')} Marcar como lidos</button></section><section class="alert-overview"><article class="panel alert-stat-card"><div class="alert-stat-icon">${icon('bell')}</div><div><strong>01</strong><span>alerta pendente hoje</span></div></article><div class="alert-banner">${icon('info')}<div class="alert-banner-copy"><strong>Sem emergência ativa</strong><p>O último alerta foi uma chegada confirmada. Você pode revisar as regras de notificação a qualquer momento.</p></div><button class="text-link" data-nav="settings" type="button">Ajustar ${icon('chevronRight')}</button></div></section><article class="panel alert-list-panel"><div class="panel-header"><div class="panel-title-wrap"><h2>Histórico de alertas</h2><p>Últimos eventos compartilhados pelos aparelhos.</p></div><button class="map-filter active" data-action="alert-filter" type="button">Todos ${icon('chevronDown')}</button></div><div class="alert-list"><div class="alert-row"><div class="alert-row-icon">${icon('alert')}</div><div class="alert-row-copy"><strong>Chegada confirmada</strong><p>Lia chegou à Escola Horizonte · localização compartilhada</p></div><span class="alert-row-time">08:26</span><span class="live-chip">novo</span></div><div class="alert-row"><div class="alert-row-icon safe">${icon('checkCircle')}</div><div class="alert-row-copy"><strong>Check-in de segurança</strong><p>Lia marcou “estou bem” e encerrou a rota da manhã.</p></div><span class="alert-row-time">ontem</span></div><div class="alert-row"><div class="alert-row-icon safe">${icon('route')}</div><div class="alert-row-copy"><strong>Rota concluída</strong><p>João concluiu a rota “Treino de futebol”.</p></div><span class="alert-row-time">ontem</span></div><div class="alert-row"><div class="alert-row-icon">${icon('pause')}</div><div class="alert-row-copy"><strong>Compartilhamento pausado</strong><p>João pausou a localização por 30 minutos, com aviso no aparelho.</p></div><span class="alert-row-time">09 ago</span></div></div></article></div>`;
}

function renderConnectionPage() {
  const child = state.mode === 'child';
  return `<div class="dashboard"><section class="page-heading"><div><div class="eyebrow">VÍNCULO COM ACEITE</div><h1>${child ? 'Conectar responsável' : 'Conectar aparelho'}</h1><p>${child ? 'Insira o código enviado pelo seu responsável.' : 'Adicione alguém à sua família usando um código único.'}</p></div><span class="soft-chip">${icon('lock')} Criptografado</span></section><section class="connection-layout"><article class="panel connection-card"><div class="stepper"><div class="step active"><span class="step-number">1</span><span>Digite o código</span></div><div class="step ${state.connected ? 'active' : ''}"><span class="step-number">2</span><span>Revise o vínculo</span></div><div class="step"><span class="step-number">3</span><span>Comece a compartilhar</span></div></div><label class="connection-form-label" for="pair-code-input">Código de conexão</label><div class="input-wrap">${icon('key')}<input id="pair-code-input" class="text-input" maxlength="12" placeholder="Ex.: PL-4821" autocomplete="off" /></div><p class="form-help">O código expira em 15 minutos e só funciona quando os dois aparelhos confirmam o vínculo.</p><div class="form-actions"><button class="secondary-button" data-action="generate-code" type="button">${icon('refresh')} Gerar código</button><button class="primary-button" data-action="connect-code" type="button">${icon('link')} ${state.connected ? 'Vínculo revisado' : 'Continuar'}</button></div><div class="code-preview"><div class="code-preview-copy"><span>${child ? 'Código do responsável' : 'Seu código temporário'}</span><strong>${child ? 'PL-4821' : 'PL-4821'}</strong></div><button class="copy-button" data-action="copy-code" type="button" aria-label="Copiar código">${icon('copy')}</button></div><div class="consent-note">${icon('shieldCheck')}<span>Nada começa escondido: a pessoa convidada vê quais dados serão compartilhados, pode aceitar ou recusar e pode pausar o vínculo depois.</span></div></article><article class="panel connected-devices"><div class="panel-header"><div class="panel-title-wrap"><h2>${child ? 'Responsável vinculado' : 'Aparelhos conectados'}</h2><p>${child ? 'Quem recebe seus compartilhamentos.' : 'Pessoas que aceitaram participar.'}</p></div><span class="live-chip">${state.connected ? '2 ativos' : '1 ativo'}</span></div><div class="device-list"><div class="device-row"><div class="avatar">AM</div><div class="device-copy"><strong>Ana Martins</strong><span>${child ? 'Responsável · localização permitida' : 'Administradora · este aparelho'}</span></div><span class="member-status">ativo</span><button class="device-menu" data-action="device-menu" type="button" aria-label="Opções do dispositivo">${icon('more')}</button></div><div class="device-row"><div class="avatar lia">LM</div><div class="device-copy"><strong>Lia Martins</strong><span>${child ? 'Este aparelho · compartilhamento ativo' : 'Convidada · localização e SOS'}</span></div><span class="member-status">ativo</span><button class="device-menu" data-action="device-menu" type="button" aria-label="Opções do dispositivo">${icon('more')}</button></div></div></article></section></div>`;
}

function renderAudioPage() {
  const requestStatus = state.audioRequest ? 'Aguardando aceite de Lia' : 'Nenhum pedido em aberto';
  const statusDetail = state.audioRequest ? 'O pedido foi enviado e ficará visível no outro aparelho.' : 'Solicite um áudio curto, somente quando necessário.';
  return `<div class="dashboard"><section class="page-heading"><div><div class="eyebrow">COMUNICAÇÃO CLARA</div><h1>Check-in de áudio</h1><p>Uma forma de se comunicar — nunca de ouvir alguém sem que saiba.</p></div><span class="soft-chip">${icon('mic')} Consentimento sempre</span></section><section class="audio-layout"><article class="audio-hero"><div class="eyebrow">MODO TRANSPARENTE</div><h2>Presença também é poder dizer “sim” ou “agora não”.</h2><p>Envie um pedido para Lia gravar uma mensagem de áudio. O microfone só é ativado depois do aceite explícito e um indicador fica visível durante todo o processo.</p><div class="audio-visual" aria-hidden="true">${Array.from({ length: 31 }, (_, index) => `<span class="audio-bar" style="animation-delay:${(index % 8) * -0.13}s"></span>`).join('')}</div><div class="audio-consent-list"><div class="audio-consent-row">${icon('checkCircle')} Lia recebe uma notificação antes de qualquer gravação.</div><div class="audio-consent-row">${icon('checkCircle')} O pedido pode ser recusado ou encerrado a qualquer momento.</div><div class="audio-consent-row">${icon('checkCircle')} O indicador de áudio permanece visível nos dois aparelhos.</div></div></article><article class="panel audio-side-card"><h3>Solicitar um check-in</h3><p>O pedido será enviado para o aparelho de Lia, com a opção de aceitar, recusar ou responder depois.</p><div class="request-status"><span class="request-status-icon">${icon(state.audioRequest ? 'clock' : 'mic')}</span><div><strong>${requestStatus}</strong><span>${statusDetail}</span></div></div><button class="primary-button" data-action="request-audio" type="button">${icon(state.audioRequest ? 'refresh' : 'send')} ${state.audioRequest ? 'Enviar lembrete' : 'Solicitar áudio'}</button><div class="info-callout">${icon('info')} <span>Para proteger a privacidade, este espaço não inicia escuta contínua nem gravação oculta. O produto usa comunicação ativa e consentida.</span></div></article></section></div>`;
}

function settingRow({ iconName, tone = '', title, description, setting, on = false }) {
  return `<div class="setting-row"><span class="setting-icon ${tone}">${icon(iconName)}</span><div class="setting-copy"><strong>${title}</strong><p>${description}</p></div><button class="toggle ${on ? 'on' : ''}" data-action="toggle-setting" data-setting="${setting}" type="button" role="switch" aria-checked="${on}" aria-label="${title}"></button></div>`;
}

function renderSettingsPage(child = false) {
  return `<div class="dashboard"><section class="page-heading"><div><div class="eyebrow">CONTROLE NA SUA MÃO</div><h1>${child ? 'Minha privacidade' : 'Privacidade e ajustes'}</h1><p>${child ? 'Você escolhe o que compartilhar, quando e com quem.' : 'Permissões visíveis, escolhas simples e nenhum dado escondido.'}</p></div><span class="live-chip">${icon('shieldCheck')} Proteção ativa</span></section><section class="settings-grid"><article class="panel settings-panel"><div class="panel-header"><div class="panel-title-wrap"><h2>${child ? 'O que está compartilhado' : 'Permissões da família'}</h2><p>Alterações aparecem para as pessoas conectadas.</p></div></div>${settingRow({ iconName: 'location', tone: 'mint', title: 'Localização em tempo real', description: 'Compartilhar a posição aproximada e o status da rota atual.', setting: 'liveLocation', on: state.settings.liveLocation })}${settingRow({ iconName: 'bell', tone: 'amber', title: 'Alertas de chegada e saída', description: 'Avisar quando alguém chegar a um local salvo.', setting: 'arrivalAlerts', on: state.settings.arrivalAlerts })}${settingRow({ iconName: 'mic', title: 'Pedidos de áudio', description: 'Permitir que um responsável envie um pedido de check-in de áudio.', setting: 'audioRequests', on: state.settings.audioRequests })}${settingRow({ iconName: 'database', title: 'Histórico de rotas', description: 'Guardar rotas anteriores por até 7 dias para consulta da família.', setting: 'history', on: state.settings.history })}</article><aside class="privacy-score-card"><div class="eyebrow">RESUMO DE TRANSPARÊNCIA</div><h2>Você está no controle.</h2><p>As permissões do vínculo podem ser revisadas a qualquer hora. Todos os participantes recebem aviso quando algo muda.</p><div class="score-ring-wrap"><div class="score-ring"></div><div class="score-ring-copy"><strong>Configuração protegida</strong><span>4 de 4 controles revisados</span></div></div><button class="secondary-button" data-action="privacy-report" type="button">${icon('eye')} Ver resumo do vínculo</button></aside></section><section class="panel" style="margin-top:19px"><div class="panel-header"><div class="panel-title-wrap"><h2>Seus dados, com clareza</h2><p>Esta versão de interface usa informações simuladas para testes.</p></div><span class="neutral-chip">sem dados reais</span></div><div class="setting-row"><span class="setting-icon amber">${icon('trash')}</span><div class="setting-copy"><strong>Apagar histórico de demonstração</strong><p>Remove os eventos simulados deste aparelho. Em produção, a remoção deverá ser confirmada por todos os participantes.</p></div><button class="ghost-button" data-action="clear-demo" type="button">Apagar</button></div></section></div>`;
}

function renderCalculatorCard() {
  const keys = ['C', '÷', '×', '⌫', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.', '(', ')'];
  return `<article class="panel calculator-card"><div class="panel-header"><div class="panel-title-wrap"><h2>Calculadora</h2><p>Uma ferramenta útil no dia a dia.</p></div>${icon('calculator')}</div><div class="calc-display" aria-live="polite">${state.calculator.display}</div><div class="calc-keys">${keys.map((key) => `<button class="calc-key ${['÷', '×', '-', '+', '='].includes(key) ? 'operator' : ''} ${key === '=' ? 'equals' : ''}" data-action="calc-key" data-key="${key}" type="button">${key}</button>`).join('')}</div></article>`;
}

function renderQuizPage() {
  const quiz = state.quiz;
  if (quiz.index >= quizQuestions.length) {
    return `<div class="dashboard child-dashboard"><section class="page-heading"><div><div class="eyebrow">DESAFIO CONCLUÍDO</div><h1>Mandou bem!</h1><p>Você terminou o quiz matemático.</p></div><button class="secondary-button" data-nav="child-home" type="button">${icon('arrowRight')} Meu espaço</button></section><section class="quiz-result panel"><span class="quiz-result-icon">${icon('star')}</span><span class="soft-chip">RESULTADO FINAL</span><strong>${quiz.score}/${quizQuestions.length}</strong><p>${quiz.score === quizQuestions.length ? 'Acertou tudo. Que ótima sequência!' : 'Cada tentativa ajuda a aprender um pouco mais.'}</p><button class="primary-button" data-action="quiz-reset" type="button">${icon('refresh')} Jogar novamente</button></section></div>`;
  }
  const current = quizQuestions[quiz.index];
  const hasAnswer = quiz.selected !== null;
  return `<div class="dashboard child-dashboard"><section class="page-heading"><div><div class="eyebrow">DESAFIO MATEMÁTICO · ${quiz.index + 1}/${quizQuestions.length}</div><h1>Quiz rápido</h1><p>Responda no seu ritmo e acompanhe sua pontuação.</p></div><button class="secondary-button" data-nav="child-home" type="button">${icon('arrowRight')} Meu espaço</button></section><section class="quiz-layout"><article class="panel quiz-card quiz-main"><div class="quiz-progress"><span style="width:${((quiz.index + 1) / quizQuestions.length) * 100}%"></span></div><div class="quiz-card-top"><span class="soft-chip">${icon('star')} PONTOS ${quiz.score}</span><span class="quiz-counter">${quiz.index + 1} de ${quizQuestions.length}</span></div><h2>${current.question}</h2><div class="quiz-options">${current.options.map((option) => `<button class="quiz-option ${hasAnswer && option === current.answer ? 'correct' : ''} ${hasAnswer && option === quiz.selected && option !== current.answer ? 'incorrect' : ''}" data-action="quiz-answer" data-answer="${option}" type="button" ${hasAnswer ? 'disabled' : ''}>${option}${hasAnswer && option === current.answer ? icon('checkCircle') : ''}</button>`).join('')}</div>${hasAnswer ? `<div class="quiz-feedback ${quiz.selected === current.answer ? 'good' : 'try-again'}">${icon(quiz.selected === current.answer ? 'checkCircle' : 'info')}<span>${quiz.selected === current.answer ? 'Resposta certa!' : `A resposta é ${current.answer}. Vamos para a próxima?`}</span></div><button class="primary-button quiz-next" data-action="quiz-next" type="button">${quiz.index === quizQuestions.length - 1 ? 'Ver resultado' : 'Próxima pergunta'} ${icon('arrowRight')}</button>` : '<p class="quiz-help">Escolha uma alternativa para continuar.</p>'}</article><aside class="transparency-card quiz-side"><span class="soft-chip">${icon('calculator')} PARA APRENDER</span><h2>Pequenos desafios, grandes passos.</h2><p>O quiz funciona sem conexão com localização, áudio ou outros dados sensíveis. Ele é uma ferramenta de estudo para o dia a dia.</p><button class="secondary-button" data-nav="calculator" type="button">${icon('calculator')} Abrir calculadora</button></aside></section></div>`;
}

function renderChildHome() {
  return `<div class="dashboard child-dashboard"><section class="child-welcome"><div class="child-welcome-copy"><div class="eyebrow">SEU ESPAÇO · TUDO VISÍVEL</div><h1>Oi, Lia <span>✦</span></h1><p>Você está conectada com Ana. Seu aparelho está seguro.</p></div><div class="avatar lia">LM</div></section><section class="child-grid"><article class="sos-card"><div class="sos-copy"><div class="eyebrow">PRECISA DE AJUDA?</div><h2>Estamos com você.</h2><p>Toque no botão SOS para avisar Ana e compartilhar sua localização atual.</p></div><button class="sos-button" data-action="sos" type="button" aria-label="Enviar alerta SOS">SOS</button></article><article class="panel location-card"><div class="location-card-header"><h2>Minha localização</h2>${icon('location')}</div><div class="location-status"><span class="status-dot"></span> Compartilhando com Ana</div><p>Última atualização: agora · você pode pausar quando quiser.</p><button class="text-link" data-action="toggle-location" type="button">${state.locationSharing ? 'Pausar compartilhamento' : 'Retomar compartilhamento'} ${icon(state.locationSharing ? 'pause' : 'play')}</button></article><article class="panel child-route-card child-full-width"><div class="child-route-copy"><h2>Rota de hoje</h2><p>Casa → Escola Horizonte</p><div class="route-progress"><span class="route-progress-pin">${icon('home')}</span><div class="route-progress-track"></div><span class="route-progress-pin">${icon('navigation')}</span></div><div class="route-times"><span>08:12 <strong>saída</strong></span><span>chegada prevista 08:34</span></div></div><button class="secondary-button" data-action="view-child-route" type="button">${icon('map')} Ver minha rota</button></article><article class="transparency-card"><span class="soft-chip">${icon('mic')} COM ACEITE</span><h2>Check-in de áudio</h2><p>Ana pode enviar um pedido. Você decide se quer responder — nada é gravado escondido.</p><button class="secondary-button" data-action="audio-info" type="button">${icon('info')} Como funciona</button></article>${renderCalculatorCard()}</section></div>`;
}

function renderChildCalculatorPage() {
  return `<div class="dashboard child-dashboard"><section class="page-heading"><div><div class="eyebrow">FERRAMENTA DO DIA A DIA</div><h1>Calculadora</h1><p>Faça contas rápidas quando precisar.</p></div><button class="secondary-button" data-nav="child-home" type="button">${icon('arrowRight')} Voltar ao meu espaço</button></section><section style="max-width:430px">${renderCalculatorCard()}</section></div>`;
}

function renderChildRoutePage() {
  return `<div class="dashboard child-dashboard"><section class="page-heading"><div><div class="eyebrow">LOCALIZAÇÃO VISÍVEL PARA VOCÊ</div><h1>Minha rota</h1><p>Confira o trajeto compartilhado com Ana e o horário previsto.</p></div><button class="secondary-button" data-nav="child-home" type="button">${icon('arrowRight')} Voltar ao meu espaço</button></section><section class="inner-grid"><article class="panel map-panel large-map"><div class="panel-header"><div class="panel-title-wrap"><h2>Casa → Escola Horizonte</h2><p>Rota de hoje · saída às 08:12</p></div><span class="live-chip"><span class="status-dot"></span> VISÍVEL</span></div>${mapMarkup(true)}<div class="map-footer"><div class="map-footer-left">${icon('location')}<span>Seu compartilhamento</span><strong>ativo</strong></div><button class="map-footer-right text-link" data-action="toggle-location" type="button">${state.locationSharing ? 'Pausar localização' : 'Retomar localização'} ${icon('chevronRight')}</button></div></article><aside class="panel route-summary"><div class="route-summary-header"><div><h2>Seu trajeto</h2><p>Você está em movimento</p></div><span class="route-distance">2,4 km</span></div><div class="route-points"><div class="route-point"><strong>Casa Martins</strong><span>${icon('home')} Saída registrada às 08:12</span></div><div class="route-point"><strong>Sua localização</strong><span>${icon('navigation')} Atualização aproximada · agora</span></div><div class="route-point"><strong>Escola Horizonte</strong><span>${icon('location')} Chegada prevista às 08:34</span></div></div><div class="consent-note">${icon('eye')}<span>Ana vê esta mesma rota. Você pode pausar o compartilhamento na tela anterior.</span></div></aside></section></div>`;
}

function renderCurrentScreen() {
  if (state.mode === 'child') {
    if (state.screen === 'child-home') return renderChildHome();
    if (state.screen === 'calculator') return renderChildCalculatorPage();
    if (state.screen === 'quiz') return renderQuizPage();
    if (state.screen === 'child-route') return renderChildRoutePage();
    if (state.screen === 'connection') return renderConnectionPage();
    if (state.screen === 'child-settings') return renderSettingsPage(true);
    return renderChildHome();
  }

  if (state.screen === 'overview') return renderAdminOverview();
  if (state.screen === 'map') return renderMapPage();
  if (state.screen === 'alerts') return renderAlertsPage();
  if (state.screen === 'connection') return renderConnectionPage();
  if (state.screen === 'audio') return renderAudioPage();
  if (state.screen === 'settings') return renderSettingsPage();
  return renderAdminOverview();
}

const demoRoute = [
  [-16.6869, -49.2648],
  [-16.6828, -49.2581],
  [-16.6784, -49.2517],
  [-16.6727, -49.2452],
  [-16.6674, -49.2389],
];

function destroyRealMap() {
  if (activeMap) {
    activeMap.remove();
    activeMap = null;
    activeRouteBounds = null;
  }
}

function setupRealMap() {
  const container = document.querySelector('[data-real-map]');
  if (!container) return;
  const routeBounds = L.latLngBounds(demoRoute);
  const map = L.map(container, {
    zoomControl: false,
    attributionControl: true,
    preferCanvas: true,
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(map);
  L.polyline(demoRoute, {
    color: '#45cfb2',
    weight: 6,
    opacity: 0.96,
    lineCap: 'round',
    lineJoin: 'round',
  }).addTo(map);
  L.polyline(demoRoute, {
    color: '#ffffff',
    weight: 2,
    opacity: 0.75,
    dashArray: '5 8',
    lineCap: 'round',
  }).addTo(map);
  L.marker(demoRoute[3], {
    icon: L.divIcon({
      className: 'family-leaflet-marker',
      html: '<span><b>LM</b></span>',
      iconSize: [46, 46],
      iconAnchor: [23, 23],
    }),
  }).addTo(map);
  L.circleMarker(demoRoute[0], {
    radius: 9,
    color: '#ffffff',
    weight: 4,
    fillColor: '#159f87',
    fillOpacity: 1,
  }).addTo(map);
  map.fitBounds(routeBounds, { paddingTopLeft: [24, 100], paddingBottomRight: [24, 230] });
  activeMap = map;
  activeRouteBounds = routeBounds;
  window.setTimeout(() => map.invalidateSize(), 120);
}

function setupSheetGestures() {
  const handle = document.querySelector('.sheet-handle');
  if (!handle) return;
  handle.addEventListener('pointerdown', (event) => {
    sheetPointerStart = event.clientY;
    handle.setPointerCapture?.(event.pointerId);
  });
  handle.addEventListener('pointerup', (event) => {
    if (sheetPointerStart === null) return;
    const delta = event.clientY - sheetPointerStart;
    sheetPointerStart = null;
    if (Math.abs(delta) > 24) {
      event.preventDefault();
      state.sheetExpanded = delta < 0;
      renderApp();
    }
  });
  handle.addEventListener('pointercancel', () => {
    sheetPointerStart = null;
  });
}

function renderApp() {
  destroyRealMap();
  document.documentElement.dataset.theme = state.theme;
  const app = document.querySelector('#app');
  const immersiveMap = state.mode === 'admin' && state.screen === 'overview';
  app.innerHTML = `<div class="app-shell">${renderSidebar()}<main class="main-content">${immersiveMap ? '' : renderTopbar()}${renderCurrentScreen()}</main></div>${immersiveMap ? '' : renderMobileNav()}`;
  setupRealMap();
  setupSheetGestures();
}

function showToast(message, tone = 'success') {
  const region = document.querySelector('#toast-region');
  if (!region) return;
  region.querySelectorAll('.toast').forEach((item) => item.remove());
  const toast = document.createElement('div');
  toast.className = `toast ${tone}`;
  toast.innerHTML = `${icon(tone === 'warning' ? 'info' : 'checkCircle')}<span>${message}</span>`;
  region.appendChild(toast);
  window.setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(5px)';
    toast.style.transition = '180ms ease';
    window.setTimeout(() => toast.remove(), 190);
  }, 3500);
}

function openModal({ title, description, body = '', actions = '' }) {
  const root = document.querySelector('#modal-root');
  root.innerHTML = `<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" data-modal-content><div class="modal-header"><div><h2 id="modal-title">${title}</h2><p>${description}</p></div><button class="close-modal" data-action="close-modal" type="button" aria-label="Fechar">${icon('x')}</button></div>${body}${actions ? `<div class="modal-actions">${actions}</div>` : ''}</section></div>`;
}

function closeModal() {
  const root = document.querySelector('#modal-root');
  if (root) root.innerHTML = '';
}

function openSosModal() {
  openModal({
    title: 'Enviar alerta SOS?',
    description: 'Ana receberá um aviso destacado e sua localização atual será compartilhada.',
    body: `<div class="modal-summary">${icon('shieldCheck')}<span>O alerta fica visível no seu aparelho e pode ser cancelado nos próximos segundos se for um toque acidental.</span></div>`,
    actions: `<button class="secondary-button" data-action="close-modal" type="button">Cancelar</button><button class="danger-button" data-action="confirm-sos" type="button">${icon('alert')} Confirmar SOS</button>`,
  });
}

function openAudioInfoModal() {
  openModal({
    title: 'Como funciona o áudio',
    description: 'Comunicação ativa, visível e com consentimento.',
    body: `<div class="modal-summary">${icon('mic')}<span>Quando Ana pedir um check-in, você verá uma notificação. Só depois de tocar em “Aceitar” o microfone poderá gravar uma mensagem curta. Você também pode recusar ou encerrar a qualquer momento.</span></div><div class="consent-note">${icon('eye')}<span>Um indicador de áudio permanece visível enquanto o microfone estiver ativo. O app não oferece escuta contínua ou oculta.</span></div>`,
    actions: `<button class="primary-button" data-action="close-modal" type="button">Entendi</button>`,
  });
}

function evaluateExpression(expression) {
  const sanitized = expression.replace(/×/g, '*').replace(/÷/g, '/');
  if (!/^[0-9+\-*/().\s]+$/.test(sanitized)) return null;
  try {
    const result = Function(`"use strict"; return (${sanitized})`)();
    if (!Number.isFinite(result)) return null;
    return Number.isInteger(result) ? String(result) : String(Number(result.toFixed(8)));
  } catch {
    return null;
  }
}

function calculatorPress(key) {
  const calc = state.calculator;
  if (key === 'C') {
    calc.expression = '';
    calc.display = '0';
    calc.justEvaluated = false;
    return;
  }
  if (key === '⌫') {
    calc.expression = calc.expression.slice(0, -1);
    calc.display = calc.expression || '0';
    calc.justEvaluated = false;
    return;
  }
  if (key === '=') {
    const result = evaluateExpression(calc.expression);
    if (result === null) {
      calc.display = 'Ops';
      calc.expression = '';
    } else {
      calc.display = result;
      calc.expression = result;
      calc.justEvaluated = true;
    }
    return;
  }
  if (calc.justEvaluated && /[0-9.(]/.test(key)) {
    calc.expression = '';
    calc.display = '0';
    calc.justEvaluated = false;
  }
  if (['+', '-', '×', '÷'].includes(key)) {
    if (!calc.expression && key !== '-') return;
    if (/[+\-×÷]$/.test(calc.expression)) {
      calc.expression = `${calc.expression.slice(0, -1)}${key}`;
    } else {
      calc.expression += key;
    }
  } else if (key === '.' && /\.$/.test(calc.expression)) {
    return;
  } else {
    calc.expression += key;
  }
  calc.display = calc.expression || '0';
}

function handleClick(event) {
  const target = event.target.closest('button, [data-action], [data-nav], [data-mode]');
  if (!target) return;

  if (target.dataset.mode) {
    state.mode = target.dataset.mode;
    state.screen = state.mode === 'admin' ? 'overview' : 'child-home';
    renderApp();
    return;
  }

  if (target.dataset.nav) {
    state.screen = target.dataset.nav;
    renderApp();
    return;
  }

  const action = target.dataset.action;
  if (!action) return;

  if (action === 'close-modal') {
    const clickedInsideModal = event.target.closest('[data-modal-content]');
    const isBackdrop = target.classList.contains('modal-backdrop') && !clickedInsideModal;
    const isCloseButton = Boolean(event.target.closest('button[data-action="close-modal"], .close-modal'));
    if (isBackdrop || isCloseButton) closeModal();
    return;
  }

  if (action === 'mobile-menu') {
    showToast('Use o seletor de perfil para alternar entre os dois aplicativos.', 'warning');
    return;
  }

  if (action === 'toggle-theme') {
    state.theme = state.theme === 'amoled' ? 'light' : 'amoled';
    try {
      localStorage.setItem('parentlock-theme', state.theme);
    } catch {
      // A preferência continua válida durante esta sessão mesmo sem storage.
    }
    renderApp();
    return;
  }

  if (action === 'toggle-sheet') {
    state.sheetExpanded = !state.sheetExpanded;
    renderApp();
    return;
  }

  if (action === 'profile-menu') {
    showToast('Perfil e notificações estarão disponíveis na próxima etapa.', 'warning');
    return;
  }

  if (action === 'open-pairing') {
    state.screen = 'connection';
    renderApp();
    return;
  }

  if (action === 'copy-code') {
    if (navigator.clipboard) navigator.clipboard.writeText('PL-4821').catch(() => {});
    showToast('Código PL-4821 copiado para a área de transferência.');
    return;
  }

  if (action === 'generate-code') {
    showToast('Um novo código temporário foi gerado.', 'success');
    return;
  }

  if (action === 'connect-code') {
    const input = document.querySelector('#pair-code-input');
    if (!input || input.value.trim().length < 4) {
      input?.focus();
      showToast('Digite um código válido para continuar.', 'warning');
      return;
    }
    state.connected = true;
    renderApp();
    showToast('Código recebido. Revise as permissões antes de confirmar o vínculo.');
    return;
  }

  if (action === 'request-audio') {
    state.audioRequest = true;
    renderApp();
    showToast('Pedido enviado. Lia verá a solicitação no outro aparelho.');
    return;
  }

  if (action === 'toggle-location') {
    state.locationSharing = !state.locationSharing;
    state.settings.liveLocation = state.locationSharing;
    renderApp();
    showToast(state.locationSharing ? 'Localização compartilhada novamente com Ana.' : 'Localização pausada. O outro aparelho foi avisado.', state.locationSharing ? 'success' : 'warning');
    return;
  }

  if (action === 'toggle-setting') {
    const setting = target.dataset.setting;
    if (setting && Object.prototype.hasOwnProperty.call(state.settings, setting)) {
      state.settings[setting] = !state.settings[setting];
      if (setting === 'liveLocation') state.locationSharing = state.settings[setting];
      renderApp();
      showToast(`${target.getAttribute('aria-label') || 'Permissão'} ${state.settings[setting] ? 'ativada' : 'pausada'}.`, state.settings[setting] ? 'success' : 'warning');
    }
    return;
  }

  if (action === 'sos') {
    openSosModal();
    return;
  }

  if (action === 'confirm-sos') {
    closeModal();
    showToast('SOS enviado para Ana. Localização compartilhada agora.', 'warning');
    return;
  }

  if (action === 'audio-info') {
    openAudioInfoModal();
    return;
  }

  if (action === 'open-sos-help') {
    openModal({
      title: 'Central SOS',
      description: 'Contatos e ações para situações urgentes.',
      body: `<div class="request-status"><span class="request-status-icon" style="color:var(--coral);background:var(--coral-pale)">${icon('alert')}</span><div><strong>Sem emergência ativa</strong><span>O botão SOS do aparelho acompanhado envia um aviso destacado.</span></div></div><div class="consent-note">${icon('info')}<span>Em uma versão conectada, os contatos de emergência serão configurados pela família e ficarão visíveis para todos.</span></div>`,
      actions: `<button class="secondary-button" data-action="close-modal" type="button">Fechar</button><button class="primary-button" data-action="configure-sos" type="button">${icon('settings')} Configurar contatos</button>`,
    });
    return;
  }

  if (action === 'configure-sos') {
    closeModal();
    state.screen = 'settings';
    renderApp();
    showToast('Contatos SOS: espaço preparado para a próxima etapa.');
    return;
  }

  if (action === 'quiz-answer') {
    if (state.quiz.selected !== null) return;
    state.quiz.selected = target.dataset.answer || '';
    if (state.quiz.selected === quizQuestions[state.quiz.index].answer) state.quiz.score += 1;
    renderApp();
    showToast(state.quiz.selected === quizQuestions[state.quiz.index].answer ? 'Resposta certa!' : 'Quase! Confira a resposta e tente a próxima.', state.quiz.selected === quizQuestions[state.quiz.index].answer ? 'success' : 'warning');
    return;
  }

  if (action === 'quiz-next') {
    state.quiz.index += 1;
    state.quiz.selected = null;
    renderApp();
    return;
  }

  if (action === 'quiz-reset') {
    state.quiz.index = 0;
    state.quiz.score = 0;
    state.quiz.selected = null;
    renderApp();
    return;
  }

  if (action === 'calc-key') {
    calculatorPress(target.dataset.key || '');
    renderApp();
    return;
  }

  if (['zoom-in', 'zoom-out', 'center-map', 'map-details'].includes(action)) {
    if (activeMap && action === 'zoom-in') activeMap.zoomIn();
    if (activeMap && action === 'zoom-out') activeMap.zoomOut();
    if (activeMap && action === 'center-map' && activeRouteBounds) activeMap.fitBounds(activeRouteBounds, { paddingTopLeft: [24, 100], paddingBottomRight: [24, 230] });
    if (action === 'map-details') showToast('Detalhes da rota atualizados agora.');
    return;
  }

  if (action === 'map-filter') {
    target.parentElement?.querySelectorAll('.map-filter').forEach((button) => button.classList.remove('active'));
    target.classList.add('active');
    showToast('Filtro aplicado ao mapa.');
    return;
  }

  if (action === 'share-route') {
    showToast('Rota pronta para ser compartilhada com os participantes do vínculo.');
    return;
  }

  if (action === 'route-alert') {
    showToast('Alerta de chegada ativado para esta rota.');
    return;
  }

  if (action === 'view-child-route') {
    state.screen = 'child-route';
    renderApp();
    return;
  }

  if (action === 'mark-alerts-read') {
    showToast('Alertas marcados como lidos.');
    return;
  }

  if (action === 'alert-filter') {
    showToast('Filtros de alerta estarão disponíveis com dados reais.');
    return;
  }

  if (action === 'device-menu') {
    showToast('Opções do vínculo: revisar permissões ou desconectar.', 'warning');
    return;
  }

  if (action === 'privacy-report') {
    openModal({
      title: 'Resumo do vínculo',
      description: 'O que está visível para cada pessoa hoje.',
      body: `<div class="request-status"><span class="request-status-icon" style="color:var(--mint-dark);background:var(--mint-pale)">${icon('location')}</span><div><strong>Localização</strong><span>Ativa · atualização aproximada a cada minuto</span></div></div><div class="request-status"><span class="request-status-icon" style="color:var(--blue);background:var(--blue-pale)">${icon('mic')}</span><div><strong>Áudio</strong><span>Somente por pedido e aceite explícito</span></div></div><div class="request-status"><span class="request-status-icon">${icon('database')}</span><div><strong>Histórico</strong><span>${state.settings.history ? 'Ativo por 7 dias' : 'Desativado'}</span></div></div>`,
      actions: `<button class="primary-button" data-action="close-modal" type="button">Fechar resumo</button>`,
    });
    return;
  }

  if (action === 'clear-demo') {
    showToast('Histórico de demonstração apagado neste aparelho.', 'warning');
    return;
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape') closeModal();
}

document.addEventListener('click', handleClick);
document.addEventListener('keydown', handleKeydown);
renderApp();
