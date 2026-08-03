import L from 'leaflet';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { createPairingCode, ensureHousehold, redeemPairingCode, normalizePairingCode } from './services/pairing';
import { getCurrentSession, signInWithPassword, signUpWithPassword } from './services/auth';
import { supabaseConfigured, supabase } from './services/supabase';
import 'leaflet/dist/leaflet.css';
import './styles.css';

const iconPaths = {
  shield: '<path d="M12 3.4 19 6v5.1c0 4.3-2.8 7.6-7 9.5-4.2-1.9-7-5.2-7-9.5V6l7-2.6Z"/><path d="m8.7 12 2.1 2.1 4.5-4.6"/>',
  dashboard: '<rect x="4" y="4" width="6" height="6" rx="1.2"/><rect x="14" y="4" width="6" height="6" rx="1.2"/><rect x="4" y="14" width="6" height="6" rx="1.2"/><rect x="14" y="14" width="6" height="6" rx="1.2"/>',
  map: '<path d="m3.5 6.5 5.2-2 6.6 3 5.2-2v12l-5.2 2-6.6-3-5.2 2v-12Z"/><path d="M8.7 4.8v11.7M15.3 7.5v11.8"/>',
  layers: '<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m4 12 8 4.3 8-4.3M4 16.2l8 4.3 8-4.3"/>',
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
const NativeSettings = registerPlugin('Settings');
const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('parentlock-theme') : null;
const onboardingKey = `parentlock-onboarding-${APP_MODE}`;
const savedOnboardingStatus = typeof localStorage !== 'undefined' ? localStorage.getItem(onboardingKey) : null;
const savedOnboarding = savedOnboardingStatus === 'complete' || savedOnboardingStatus === 'skipped';

const state = {
  mode: isCompanionBuild ? 'child' : 'admin',
  screen: isCompanionBuild ? 'child-home' : 'overview',
  theme: savedTheme === 'amoled' ? 'amoled' : 'light',
  mapLayer: 'street',
  onboardingComplete: savedOnboarding,
  permissionsSkipped: savedOnboardingStatus === 'skipped',
  sheetExpanded: false,
  locationSharing: false,
  locationPermission: 'prompt',
  notificationPermission: 'prompt',
  userLocation: null,
  locationAccuracy: null,
  audioRequest: false,
  connected: false,
  connectedDevices: [],
  householdId: '',
  session: null,
  authChecked: false,
  authMode: 'sign-in',
  authBusy: false,
  pairingCode: '',
  pairingCodeExpiresAt: null,
  settings: {
    liveLocation: false,
    arrivalAlerts: false,
    audioRequests: false,
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
let activeBaseLayer = null;
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
      <div class="brand-mark"><img src="/brand/parentlock-shield.svg" alt="" /></div>
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
      <div class="avatar ${isCompanionBuild ? 'lia' : ''}">${isCompanionBuild ? 'EU' : 'AD'}</div>
      <div class="profile-copy"><strong>${isCompanionBuild ? 'Acompanhado' : 'Administrador'}</strong><span>${isCompanionBuild ? 'Este aparelho' : 'Conta administradora'}</span></div>
      <button class="profile-more" data-action="profile-menu" type="button" aria-label="Mais opções">${icon('more')}</button>
    </div>
  </aside>`;
}

function renderTopbar() {
  const label = screenLabels[state.screen] || 'ParentLock';
  const userName = state.mode === 'admin' ? 'Administrador' : 'Acompanhado';
  const userInitials = state.mode === 'admin' ? 'AD' : 'EU';
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

function realMapMarkup() {
  return `<div class="real-map-canvas" data-real-map aria-label="Mapa real da família com rota compartilhada"></div>`;
}

function permissionsReady() {
  const notificationsAllowedInPreview = !Capacitor.isNativePlatform() && state.notificationPermission === 'unavailable';
  return state.locationPermission === 'granted' && (state.notificationPermission === 'granted' || notificationsAllowedInPreview);
}

async function refreshNativePermissions() {
  let changed = false;
  try {
    const location = await Geolocation.checkPermissions();
    if (state.locationPermission !== location.location) {
      state.locationPermission = location.location;
      changed = true;
    }
  } catch {
    // The permission row remains available for the native build.
  }
  try {
    const notifications = await LocalNotifications.checkPermissions();
    if (state.notificationPermission !== notifications.display) {
      state.notificationPermission = notifications.display;
      changed = true;
    }
  } catch {
    if (typeof Notification === 'undefined' && state.notificationPermission !== 'unavailable') {
      state.notificationPermission = 'unavailable';
      changed = true;
    } else if (typeof Notification !== 'undefined' && state.notificationPermission !== Notification.permission) {
      state.notificationPermission = Notification.permission;
      changed = true;
    }
  }
  if (changed) renderApp();
}

async function requestNotifications() {
  try {
    const permissions = await LocalNotifications.requestPermissions();
    state.notificationPermission = permissions.display;
  } catch {
    if (typeof Notification !== 'undefined') {
      state.notificationPermission = await Notification.requestPermission();
    } else {
      state.notificationPermission = 'unavailable';
    }
  }
  renderApp();
}

function finishOnboarding() {
  if (!permissionsReady()) {
    showToast('Ative as permissões necessárias para continuar.', 'warning');
    return;
  }
  state.onboardingComplete = true;
  state.permissionsSkipped = false;
  try {
    localStorage.setItem(onboardingKey, 'complete');
  } catch {
    // A sessão continua funcionando sem persistência local.
  }
  state.screen = isCompanionBuild ? 'connection' : 'overview';
  renderApp();
}

function skipOnboarding() {
  state.onboardingComplete = true;
  state.permissionsSkipped = true;
  try {
    localStorage.setItem(onboardingKey, 'skipped');
  } catch {
    // A sessão continua funcionando sem persistência local.
  }
  state.screen = isCompanionBuild ? 'child-home' : 'overview';
  renderApp();
  showToast('Você entrou sem ativar tudo. Alguns recursos continuam bloqueados.', 'warning');
}

function permissionRow({ iconName, title, description, status, action, actionLabel }) {
  const active = status === 'granted';
  const unavailable = status === 'unavailable';
  return `<div class="permission-row"><span class="permission-icon ${active ? 'active' : ''}">${icon(iconName)}</span><div class="permission-copy"><strong>${title}</strong><p>${description}</p></div><div class="permission-action"><span class="permission-status ${active ? 'active' : unavailable ? 'soft' : ''}">${active ? 'Ativada' : unavailable ? 'No Android' : status === 'denied' ? 'Bloqueada' : 'Pendente'}</span>${!active && !unavailable ? `<button class="ghost-button" data-action="${action}" type="button">${actionLabel}</button>` : ''}</div></div>`;
}

function renderOnboarding() {
  const locationReady = state.locationPermission === 'granted';
  const notificationsReady = state.notificationPermission === 'granted';
  return `<div class="onboarding-screen"><div class="onboarding-card"><div class="onboarding-brand"><span class="brand-mascot"><img src="/brand/parentlock-mascot.png" alt="Mascote ParentLock" /></span><div><strong>ParentLock</strong><small>${isCompanionBuild ? 'Aplicativo acompanhado' : 'Aplicativo administrador'}</small></div></div><div class="onboarding-eyebrow">PRIMEIRO ACESSO</div><h1>Vamos preparar seu aparelho.</h1><p class="onboarding-lead">Antes de entrar, revise e autorize apenas o que o aplicativo precisa para funcionar. Você poderá alterar tudo depois.</p><div class="permission-list">${permissionRow({ iconName: 'location', title: 'Localização', description: 'Usada somente quando você autorizar o compartilhamento ou pedir para ver sua posição no mapa.', status: state.locationPermission, action: 'request-location', actionLabel: locationReady ? 'Ativada' : 'Ativar' })}${permissionRow({ iconName: 'bell', title: 'Notificações', description: 'Necessárias para avisos de conexão, SOS e mudanças autorizadas.', status: state.notificationPermission, action: 'request-notifications', actionLabel: notificationsReady ? 'Ativadas' : 'Ativar' })}<div class="permission-row permission-row-info"><span class="permission-icon soft">${icon('mic')}</span><div class="permission-copy"><strong>Microfone</strong><p>Não é solicitado agora. Um check-in de áudio só poderá ser iniciado depois de um pedido visível e do seu aceite.</p></div><span class="permission-status soft">Não solicitado</span></div></div><div class="onboarding-note">${icon('shieldCheck')}<span>Você não precisa conceder acesso a contatos, fotos ou microfone para entrar. O vínculo com outro aparelho será uma etapa separada.</span></div><button class="primary-button onboarding-continue" data-action="finish-onboarding" type="button" ${permissionsReady() ? '' : 'disabled'}>${icon('arrowRight')} ${permissionsReady() ? 'Entrar no ParentLock' : 'Ative as permissões para continuar'}</button><button class="onboarding-skip" data-action="skip-onboarding" type="button">Continuar sem ativar agora</button><p class="onboarding-skip-note">Você poderá ativar depois em Privacidade. Mapa, alertas e SOS ficarão limitados enquanto as permissões estiverem pendentes.</p><button class="theme-toggle onboarding-theme" data-action="toggle-theme" type="button">${icon(state.theme === 'amoled' ? 'sun' : 'moon')} Tema ${state.theme === 'amoled' ? 'AMOLED' : 'claro'}</button></div></div>`;
}

function metricCard({ iconName, label, value, foot, trend, tone = '' }) {
  return `<article class="metric-card ${tone}"><div class="metric-top"><span>${label}</span><span class="metric-icon">${icon(iconName)}</span></div><strong class="metric-value">${value}</strong><div class="metric-bottom"><span class="metric-foot ${tone === 'coral' ? 'alert' : 'good'}">${icon('checkCircle')} ${foot}</span>${trend ? `<span class="metric-trend">${icon('trend')} ${trend}</span>` : ''}</div></article>`;
}

function renderAdminOverview() {
  const hasLocation = state.locationPermission === 'granted' && state.userLocation;
  const locationStatus = hasLocation ? `Localização ativa · precisão aproximada de ${state.locationAccuracy || '—'} m` : 'Localização ainda não ativada';
  return `<div class="map-first-page ${state.sheetExpanded ? 'sheet-expanded' : ''}">
    <header class="map-first-toolbar">
      <div class="map-first-brand"><span class="brand-mark"><img src="/brand/parentlock-shield.svg" alt="" /></span><div><strong>ParentLock</strong><small>Mapa da família</small></div></div>
      <div class="map-first-actions"><span class="${state.permissionsSkipped ? 'alert-chip' : 'neutral-chip'}">${state.permissionsSkipped ? 'Permissões pendentes' : 'Nenhuma conexão'}</span><button class="theme-toggle map-theme-toggle" data-action="toggle-theme" type="button" aria-label="Alternar tema AMOLED">${icon(state.theme === 'amoled' ? 'sun' : 'moon')}<span>${state.theme === 'amoled' ? 'AMOLED' : 'Claro'}</span></button><button class="map-profile" data-action="profile-menu" type="button" aria-label="Abrir perfil">AD</button></div>
    </header>
    <section class="map-first-stage">
      ${realMapMarkup()}
      <div class="map-place-pill">${icon('map')} Mapa geral</div>
      <div class="map-live-card"><span class="map-empty-icon">${icon(hasLocation ? 'location' : 'locate')}</span><div><strong>Seu aparelho</strong><span class="${hasLocation ? 'location-ready' : ''}">${icon(hasLocation ? 'checkCircle' : 'info')} ${locationStatus}</span></div><button data-action="${hasLocation ? 'open-pairing' : 'request-location'}" type="button" aria-label="${hasLocation ? 'Conectar aparelho' : 'Ativar localização'}">${icon(hasLocation ? 'plus' : 'locate')}</button></div>
      <div class="map-action-stack"><button class="map-control" data-action="toggle-map-layer" type="button" aria-label="Alternar camada do mapa">${icon('layers')}</button><button class="map-control" data-action="zoom-in" type="button" aria-label="Aumentar zoom">${icon('zoomIn')}</button><button class="map-control" data-action="zoom-out" type="button" aria-label="Diminuir zoom">${icon('zoomOut')}</button><button class="map-control" data-action="center-map" type="button" aria-label="Centralizar mapa">${icon('locate')}</button></div>
    </section>
    <nav class="map-floating-nav" aria-label="Navegação do mapa">
      <button class="map-nav-item active" data-nav="overview" type="button">${icon('map')}<span>Mapa</span></button>
      <button class="map-nav-item" data-nav="map" type="button">${icon('route')}<span>Rotas</span></button>
      <button class="map-nav-item" data-nav="alerts" type="button">${icon('alert')}<span>Alertas</span></button>
      <button class="map-nav-item" data-nav="connection" type="button">${icon('link')}<span>Conexão</span></button>
      <button class="map-nav-item" data-nav="settings" type="button">${icon('more')}<span>Mais</span></button>
    </nav>
    <section class="map-bottom-sheet" aria-label="Detalhes da família">
      <button class="sheet-handle" data-action="toggle-sheet" type="button" aria-label="${state.sheetExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}"><span></span><small>${state.sheetExpanded ? 'Toque para recolher' : 'Deslize para ver detalhes'}</small></button>
      <div class="sheet-content">
        <div class="sheet-heading"><div><div class="eyebrow">FAMÍLIA</div><h2>Nenhum aparelho conectado</h2></div><span class="neutral-chip">aguardando vínculo</span></div>
        <div class="empty-sheet-state"><span class="empty-state-icon">${icon('users')}</span><strong>Comece conectando um aparelho</strong><p>Quando uma pessoa aceitar o vínculo, a localização compartilhada aparecerá aqui.</p><button class="primary-button" data-nav="connection" type="button">${icon('plus')} Conectar aparelho</button></div>
        <article class="sheet-route-card"><div class="sheet-route-icon">${icon('route')}</div><div class="sheet-route-copy"><strong>Nenhuma rota compartilhada</strong><span>As rotas aparecerão somente depois que um aparelho for conectado.</span></div></article>
        <div class="sheet-stat-grid"><div class="sheet-stat"><span class="sheet-stat-icon mint">${icon('location')}</span><div><strong>0</strong><small>localizações compartilhadas</small></div></div><div class="sheet-stat"><span class="sheet-stat-icon coral">${icon('alert')}</span><div><strong>0</strong><small>alertas pendentes</small></div></div></div>
        <div class="sheet-actions"><button class="secondary-button" data-action="request-location" type="button">${icon('locate')} ${hasLocation ? 'Atualizar localização' : 'Ativar localização'}</button><button class="secondary-button" data-nav="settings" type="button">${icon('shieldCheck')} Privacidade</button></div>
        <div class="sheet-quick-title">Atalhos</div>
        <div class="sheet-quick-grid"><button class="sheet-quick-item" data-nav="connection" type="button"><span>${icon('link')}</span><strong>Conexão</strong><small>Vincular aparelho</small></button><button class="sheet-quick-item" data-nav="map" type="button"><span>${icon('route')}</span><strong>Rotas</strong><small>Ver caminhos</small></button><button class="sheet-quick-item" data-nav="alerts" type="button"><span>${icon('alert')}</span><strong>Alertas</strong><small>Central de segurança</small></button><button class="sheet-quick-item" data-nav="settings" type="button"><span>${icon('settings')}</span><strong>Privacidade</strong><small>Revisar permissões</small></button></div>
      </div>
    </section>
  </div>`;
}
function renderMapPage() {
  const hasLocation = state.locationPermission === 'granted' && state.userLocation;
  return `<div class="dashboard"><section class="page-heading"><div><div class="eyebrow">LOCALIZAÇÃO COMPARTILHADA</div><h1>Mapa e rotas</h1><p>O mapa exibirá somente posições e rotas autorizadas pelos participantes.</p></div><div class="page-heading-actions"><button class="secondary-button" data-nav="connection" type="button">${icon('plus')} Conectar aparelho</button><button class="primary-button" data-action="${hasLocation ? 'center-map' : 'request-location'}" type="button">${icon(hasLocation ? 'locate' : 'location')} ${hasLocation ? 'Centralizar' : 'Ativar localização'}</button></div></section><section class="inner-grid"><article class="panel map-panel large-map"><div class="panel-header"><div class="panel-title-wrap"><h2>Mapa ao vivo</h2><p>${hasLocation ? 'Sua localização está disponível neste aparelho.' : 'Ative a localização para começar.'}</p></div><span class="${hasLocation ? 'live-chip' : 'neutral-chip'}">${hasLocation ? `<span class="status-dot"></span> ATIVO` : 'AGUARDANDO PERMISSÃO'}</span></div>${realMapMarkup()}<div class="map-footer"><div class="map-footer-left">${icon(hasLocation ? 'location' : 'info')}<span>Precisão</span><strong>${hasLocation ? `${state.locationAccuracy || '—'} m` : 'não disponível'}</strong></div><button class="map-footer-right text-link" data-action="request-location" type="button">${hasLocation ? 'Atualizar localização' : 'Permitir localização'} ${icon('chevronRight')}</button></div></article><aside class="panel route-summary"><div class="route-summary-header"><div><h2>Rotas compartilhadas</h2><p>Nenhum vínculo ativo</p></div><span class="route-distance">0 rotas</span></div><div class="empty-sheet-state"><span class="empty-state-icon">${icon('route')}</span><strong>Nenhuma rota disponível</strong><p>Quando um participante compartilhar uma rota, ela aparecerá aqui com os detalhes e o horário de atualização.</p><button class="primary-button" data-nav="connection" type="button">${icon('link')} Criar vínculo</button></div></aside></section></div>`;
}
function renderAlertsPage() {
  return `<div class="dashboard"><section class="page-heading"><div><div class="eyebrow">CENTRAL DE SEGURANÇA</div><h1>Alertas</h1><p>Aqui aparecerão somente eventos reais enviados pelos aparelhos vinculados.</p></div><span class="neutral-chip">0 alertas</span></section><section class="alert-overview"><article class="panel alert-stat-card"><div class="alert-stat-icon">${icon('bell')}</div><div><strong>0</strong><span>alertas pendentes</span></div></article><div class="alert-banner">${icon('info')}<div class="alert-banner-copy"><strong>Nenhum evento registrado</strong><p>Os alertas serão exibidos depois que houver um vínculo ativo e uma permissão de notificação.</p></div><button class="text-link" data-nav="settings" type="button">Configurar ${icon('chevronRight')}</button></div></section><article class="panel alert-list-panel"><div class="panel-header"><div class="panel-title-wrap"><h2>Histórico de alertas</h2><p>Sem dados para exibir.</p></div></div><div class="empty-sheet-state alert-empty-state"><span class="empty-state-icon">${icon('bell')}</span><strong>Nenhum alerta por enquanto</strong><p>Quando houver uma chegada, SOS ou mudança importante, ela aparecerá aqui com data e contexto.</p><button class="primary-button" data-nav="connection" type="button">${icon('plus')} Conectar aparelho</button></div></article></div>`;
}
function renderConnectionPage() {
  const child = state.mode === 'child';
  const canGenerate = supabaseConfigured && Boolean(state.householdId);
  const serviceLabel = supabaseConfigured ? 'Serviço conectado' : 'Serviço de conexão pendente';
  const codeBlock = state.pairingCode
    ? `<div class="code-preview"><div class="code-preview-copy"><span>CÓDIGO DE CONVITE · EXPIRA EM 15 MIN</span><strong>${state.pairingCode}</strong></div><button class="copy-button" data-action="copy-code" type="button" aria-label="Copiar código">${icon('copy')}</button></div>`
    : `<div class="empty-connection-intro"><span class="empty-state-icon">${icon('link')}</span><div><strong>Nenhum convite ativo</strong><p>${canGenerate ? 'Gere um convite quando estiver pronto para iniciar um vínculo.' : 'A geração ficará disponível depois que a conta do administrador e o serviço seguro estiverem configurados.'}</p></div></div>`;
  return `<div class="dashboard"><section class="page-heading"><div><div class="eyebrow">VÍNCULO COM ACEITE</div><h1>${child ? 'Conectar responsável' : 'Conectar aparelho'}</h1><p>${child ? 'Quando receber um convite, digite o código aqui.' : 'O administrador cria o código; o outro aparelho entra com aceite explícito.'}</p></div><span class="${supabaseConfigured ? 'live-chip' : 'neutral-chip'}">${icon(supabaseConfigured ? 'checkCircle' : 'lock')} ${serviceLabel}</span></section><section class="connection-layout"><article class="panel connection-card"><div class="stepper"><div class="step active"><span class="step-number">1</span><span>${child ? 'Receba o código' : 'Gere o convite'}</span></div><div class="step"><span class="step-number">2</span><span>${child ? 'Revise o pedido' : 'Aguarde o aceite'}</span></div><div class="step"><span class="step-number">3</span><span>Escolha o que compartilhar</span></div></div>${child ? `<label class="connection-form-label" for="pair-code-input">Código recebido</label><div class="input-wrap">${icon('key')}<input id="pair-code-input" class="text-input" maxlength="24" placeholder="Digite o código do convite" autocomplete="off" /></div><p class="form-help">O código será validado pelo serviço de conexão. Nenhum aparelho é vinculado somente por digitar um texto.</p><div class="form-actions"><button class="secondary-button" data-nav="child-settings" type="button">${icon('shieldCheck')} Privacidade</button><button class="primary-button" data-action="connect-code" type="button">${icon('link')} Validar convite</button></div>` : `${codeBlock}<div class="form-actions"><button class="primary-button" data-action="create-pairing-code" type="button" ${canGenerate ? '' : 'disabled'}>${icon('key')} ${state.pairingCode ? 'Gerar novo código' : 'Gerar código de convite'}</button><button class="secondary-button" data-action="connection-info" type="button">${icon('info')} Como funciona</button></div>`}<div class="consent-note">${icon('shieldCheck')}<span>Nada começa escondido: cada participante verá quais dados serão compartilhados, poderá aceitar ou recusar e poderá pausar o vínculo depois.</span></div></article><article class="panel connected-devices"><div class="panel-header"><div class="panel-title-wrap"><h2>Participantes vinculados</h2><p>Sem dados preenchidos neste aparelho.</p></div><span class="neutral-chip">0 ativos</span></div><div class="empty-sheet-state device-empty-state"><span class="empty-state-icon">${icon('users')}</span><strong>Nenhum aparelho conectado</strong><p>Os aparelhos só aparecerão após uma confirmação real dos dois lados.</p><button class="secondary-button" data-nav="${child ? 'child-settings' : 'settings'}" type="button">${icon('shieldCheck')} Revisar privacidade</button></div></article></section></div>`;
}
function renderAudioPage() {
  const hasDevice = state.connectedDevices.length > 0;
  const requestStatus = state.audioRequest ? 'Pedido aguardando aceite' : hasDevice ? 'Nenhum pedido em aberto' : 'Nenhum aparelho conectado';
  const statusDetail = state.audioRequest ? 'O pedido aparecerá de forma visível no outro aparelho.' : hasDevice ? 'Solicite um áudio curto, somente quando necessário.' : 'Conecte um aparelho antes de enviar um pedido.';
  return `<div class="dashboard"><section class="page-heading"><div><div class="eyebrow">COMUNICAÇÃO CLARA</div><h1>Check-in de áudio</h1><p>Uma forma de se comunicar — nunca de ouvir alguém sem que saiba.</p></div><span class="soft-chip">${icon('mic')} Consentimento sempre</span></section><section class="audio-layout"><article class="audio-hero"><div class="eyebrow">MODO TRANSPARENTE</div><h2>Presença também é poder dizer “sim” ou “agora não”.</h2><p>Um pedido só poderá ser enviado depois de existir um vínculo aceito. O microfone só será ativado depois do aceite explícito e um indicador ficará visível durante todo o processo.</p><div class="audio-visual" aria-hidden="true">${Array.from({ length: 31 }, (_, index) => `<span class="audio-bar" style="animation-delay:${(index % 8) * -0.13}s"></span>`).join('')}</div><div class="audio-consent-list"><div class="audio-consent-row">${icon('checkCircle')} A pessoa recebe uma notificação antes de qualquer gravação.</div><div class="audio-consent-row">${icon('checkCircle')} O pedido pode ser recusado ou encerrado a qualquer momento.</div><div class="audio-consent-row">${icon('checkCircle')} O indicador de áudio permanece visível nos dois aparelhos.</div></div></article><article class="panel audio-side-card"><h3>Solicitar um check-in</h3><p>Quando houver um vínculo, o pedido será enviado com a opção de aceitar, recusar ou responder depois.</p><div class="request-status"><span class="request-status-icon">${icon(state.audioRequest ? 'clock' : hasDevice ? 'mic' : 'link')}</span><div><strong>${requestStatus}</strong><span>${statusDetail}</span></div></div><button class="primary-button" data-action="request-audio" type="button" ${hasDevice ? '' : 'disabled'}>${icon(hasDevice ? (state.audioRequest ? 'refresh' : 'send') : 'link')} ${hasDevice ? (state.audioRequest ? 'Enviar lembrete' : 'Solicitar áudio') : 'Conectar aparelho primeiro'}</button><div class="info-callout">${icon('info')} <span>Este espaço não inicia escuta contínua nem gravação oculta. O produto usa comunicação ativa e consentida.</span></div></article></section></div>`;
}

function settingRow({ iconName, tone = '', title, description, setting, on = false }) {
  return `<div class="setting-row"><span class="setting-icon ${tone}">${icon(iconName)}</span><div class="setting-copy"><strong>${title}</strong><p>${description}</p></div><button class="toggle ${on ? 'on' : ''}" data-action="toggle-setting" data-setting="${setting}" type="button" role="switch" aria-checked="${on}" aria-label="${title}"></button></div>`;
}

function renderSettingsPage(child = false) {
  const hasLocation = state.locationPermission === 'granted' && state.userLocation;
  return `<div class="dashboard"><section class="page-heading"><div><div class="eyebrow">CONTROLE NA SUA MÃO</div><h1>${child ? 'Minha privacidade' : 'Privacidade e ajustes'}</h1><p>${child ? 'Você escolhe o que compartilhar, quando e com quem.' : 'Permissões visíveis, escolhas simples e nenhum dado inventado.'}</p></div><span class="${hasLocation ? 'live-chip' : 'neutral-chip'}">${icon(hasLocation ? 'shieldCheck' : 'info')} ${hasLocation ? 'Localização autorizada' : 'Sem permissões ativas'}</span></section><section class="settings-grid"><article class="panel settings-panel"><div class="panel-header"><div class="panel-title-wrap"><h2>${child ? 'O que está compartilhado' : 'Permissões deste aparelho'}</h2><p>As alterações só terão efeito depois da confirmação do sistema e dos participantes.</p></div></div>${settingRow({ iconName: 'location', tone: 'mint', title: 'Localização em tempo real', description: 'Permitir que este aparelho compartilhe a posição aproximada após um vínculo aceito.', setting: 'liveLocation', on: state.settings.liveLocation })}${settingRow({ iconName: 'bell', tone: 'amber', title: 'Alertas de chegada e saída', description: 'Receber avisos de locais salvos quando houver um vínculo ativo.', setting: 'arrivalAlerts', on: state.settings.arrivalAlerts })}${settingRow({ iconName: 'mic', title: 'Pedidos de áudio', description: 'Permitir pedidos de check-in de áudio, sempre com aceite antes do microfone.', setting: 'audioRequests', on: state.settings.audioRequests })}${settingRow({ iconName: 'database', title: 'Histórico de rotas', description: 'Guardar rotas anteriores somente se você habilitar esta opção.', setting: 'history', on: state.settings.history })}</article><aside class="privacy-score-card"><div class="eyebrow">ESTADO DO VÍNCULO</div><h2>Nenhum vínculo ativo.</h2><p>Quando houver uma conexão aceita, você verá aqui quem participa e quais permissões estão realmente ativas.</p><div class="privacy-status-list"><div>${icon('link')}<span>0 aparelhos conectados</span></div><div>${icon('location')}<span>${hasLocation ? 'Localização deste aparelho autorizada' : 'Localização aguardando permissão'}</span></div><div>${icon('mic')}<span>Áudio desativado até existir aceite</span></div></div><button class="secondary-button" data-nav="connection" type="button">${icon('plus')} Conectar aparelho</button></aside></section><section class="panel data-empty-panel" style="margin-top:19px"><div class="panel-header"><div class="panel-title-wrap"><h2>Dados armazenados neste aparelho</h2><p>Nenhum histórico ou evento compartilhado foi carregado.</p></div><span class="neutral-chip">vazio</span></div><div class="empty-sheet-state"><span class="empty-state-icon">${icon('database')}</span><strong>Nenhum dado para apagar</strong><p>Quando o armazenamento de histórico for ativado, você poderá revisar e apagar os dados por aqui.</p></div></section></div>`;
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
  const hasLocation = state.locationPermission === 'granted' && state.userLocation;
  const hasDevice = state.connectedDevices.length > 0;
  return `<div class="dashboard child-dashboard"><section class="child-welcome"><div class="child-welcome-copy"><div class="eyebrow">SEU ESPAÇO · TUDO VISÍVEL</div><h1>Olá <span>✦</span></h1><p>Ferramentas para o dia a dia e uma área clara de proteção.</p></div><div class="avatar lia">EU</div></section><section class="child-grid"><article class="sos-card"><div class="sos-copy"><div class="eyebrow">EMERGÊNCIA</div><h2>SOS</h2><p>${hasDevice ? 'Use somente quando precisar de ajuda. Os participantes autorizados serão avisados.' : 'Conecte um responsável para ativar o envio de alertas.'}</p></div><button class="sos-button" data-action="sos" type="button" aria-label="Enviar alerta SOS">SOS</button></article><article class="panel location-card"><div class="location-card-header"><h2>Minha localização</h2>${icon('location')}</div><div class="location-status ${state.locationSharing ? '' : 'paused'}"><span class="status-dot"></span> ${state.locationSharing ? 'Compartilhamento desativado' : 'Não compartilhando'}</div><p>${hasLocation ? `Precisão aproximada: ${state.locationAccuracy || '—'} m.` : 'Nenhuma permissão de localização foi concedida neste aparelho.'}</p><button class="text-link" data-action="${hasLocation ? 'toggle-location' : 'request-location'}" type="button">${hasLocation ? (state.locationSharing ? 'Pausar compartilhamento' : 'Compartilhar localização') : 'Ativar localização'} ${icon(hasLocation && state.locationSharing ? 'pause' : 'locate')}</button></article><article class="panel child-route-card child-full-width"><div class="child-route-copy"><h2>Rotas compartilhadas</h2><p>${hasDevice ? 'Nenhuma rota recebida ainda.' : 'Conecte um responsável para receber uma rota.'}</p><div class="empty-route-inline">${icon('route')}<span>Aqui aparecerá somente uma rota realmente compartilhada.</span></div></div><button class="secondary-button" data-action="${hasDevice ? 'view-child-route' : 'go-connection'}" type="button">${icon(hasDevice ? 'map' : 'link')} ${hasDevice ? 'Ver rotas' : 'Conectar'}</button></article><article class="transparency-card"><span class="soft-chip">${icon('shieldCheck')} PROTEÇÃO VISÍVEL</span><h2>Privacidade primeiro</h2><p>Você pode revisar permissões, ver o estado do vínculo e pausar qualquer compartilhamento.</p><button class="secondary-button" data-nav="child-settings" type="button">${icon('settings')} Revisar permissões</button></article>${renderCalculatorCard()}</section></div>`;
}
function renderChildCalculatorPage() {
  return `<div class="dashboard child-dashboard"><section class="page-heading"><div><div class="eyebrow">FERRAMENTA DO DIA A DIA</div><h1>Calculadora</h1><p>Faça contas rápidas quando precisar.</p></div><button class="secondary-button" data-nav="child-home" type="button">${icon('arrowRight')} Voltar ao meu espaço</button></section><section style="max-width:430px">${renderCalculatorCard()}</section></div>`;
}

function renderChildRoutePage() {
  const hasLocation = state.locationPermission === 'granted' && state.userLocation;
  return `<div class="dashboard child-dashboard"><section class="page-heading"><div><div class="eyebrow">LOCALIZAÇÃO VISÍVEL PARA VOCÊ</div><h1>Minhas rotas</h1><p>Você verá aqui somente os trajetos que forem compartilhados com você.</p></div><button class="secondary-button" data-nav="child-home" type="button">${icon('arrowRight')} Voltar ao meu espaço</button></section><section class="inner-grid"><article class="panel map-panel large-map"><div class="panel-header"><div class="panel-title-wrap"><h2>Mapa ao vivo</h2><p>${hasLocation ? 'Sua localização está disponível neste aparelho.' : 'Nenhuma localização autorizada.'}</p></div><span class="neutral-chip">sem rota</span></div>${realMapMarkup()}<div class="map-footer"><div class="map-footer-left">${icon(hasLocation ? 'location' : 'info')}<span>Precisão</span><strong>${hasLocation ? `${state.locationAccuracy || '—'} m` : 'não disponível'}</strong></div><button class="map-footer-right text-link" data-action="${hasLocation ? 'toggle-location' : 'request-location'}" type="button">${hasLocation ? 'Pausar localização' : 'Permitir localização'} ${icon('chevronRight')}</button></div></article><aside class="panel route-summary"><div class="route-summary-header"><div><h2>Nenhuma rota recebida</h2><p>Sem dados compartilhados</p></div><span class="route-distance">0 rotas</span></div><div class="empty-sheet-state"><span class="empty-state-icon">${icon('route')}</span><strong>Seu trajeto aparecerá aqui</strong><p>Quando alguém compartilhar uma rota com você, ela será exibida com clareza e poderá ser pausada a qualquer momento.</p><button class="secondary-button" data-nav="child-settings" type="button">${icon('shieldCheck')} Privacidade</button></div></aside></section></div>`;
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

function destroyRealMap() {
  if (activeMap) {
    activeMap.remove();
    activeMap = null;
    activeBaseLayer = null;
    activeRouteBounds = null;
  }
}

function setupRealMap() {
  const container = document.querySelector('[data-real-map]');
  if (!container) return;
  const map = L.map(container, {
    zoomControl: false,
    attributionControl: true,
    preferCanvas: true,
  }).setView([0, 0], 2);
  const tileLayer = state.mapLayer === 'satellite'
    ? L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri',
    })
    : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    });
  activeBaseLayer = tileLayer.addTo(map);
  activeMap = map;
  activeRouteBounds = null;

  if (state.userLocation) {
    const point = state.userLocation;
    const bounds = L.latLngBounds([point]);
    L.circleMarker(point, {
      radius: 9,
      color: '#ffffff',
      weight: 4,
      fillColor: '#159f87',
      fillOpacity: 1,
    }).addTo(map);
    map.setView(point, 15);
    activeRouteBounds = bounds;
  }
  window.setTimeout(() => map.invalidateSize(), 120);
}

async function requestLocation() {
  if (state.locationPermission === 'denied') {
    openModal({
      title: 'Localização bloqueada',
      description: 'O Android não permitiu o acesso neste momento.',
      body: `<div class="modal-summary">${icon('location')}<span>Abra as configurações do aplicativo, entre em <strong>Permissões</strong> e permita <strong>Localização</strong>. Depois volte para tentar novamente.</span></div>`,
      actions: `<button class="secondary-button" data-action="close-modal" type="button">Agora não</button><button class="primary-button" data-action="open-app-settings" type="button">${icon('settings')} Abrir configurações</button>`,
    });
    return;
  }
  try {
    const permissions = await Geolocation.requestPermissions();
    if (permissions.location !== 'granted') {
      state.locationPermission = 'denied';
      state.locationSharing = false;
      state.settings.liveLocation = false;
      renderApp();
      showToast('A localização não foi autorizada. Você pode tentar novamente em Privacidade.', 'warning');
      return;
    }
    const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
    state.locationPermission = 'granted';
    state.userLocation = [position.coords.latitude, position.coords.longitude];
    state.locationAccuracy = Math.round(position.coords.accuracy);
    state.locationSharing = true;
    state.settings.liveLocation = true;
    renderApp();
    showToast('Localização ativada neste aparelho.');
  } catch {
    state.locationPermission = 'denied';
    state.locationSharing = false;
    state.settings.liveLocation = false;
    renderApp();
    showToast('Não foi possível obter sua localização agora.', 'warning');
  }
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

function renderAuthPage() {
  const signUp = state.authMode === 'sign-up';
  return `<div class="auth-screen"><div class="auth-card"><div class="auth-brand"><span class="brand-mascot"><img src="/brand/parentlock-mascot.png" alt="Mascote ParentLock" /></span><div><strong>ParentLock</strong><small>${isCompanionBuild ? 'Aplicativo acompanhado' : 'Aplicativo administrador'}</small></div></div><div class="onboarding-eyebrow">CONTA PROTEGIDA</div><h1>${signUp ? 'Criar sua conta' : 'Entrar no ParentLock'}</h1><p class="auth-lead">${signUp ? 'A conta identifica o participante antes de qualquer vínculo ou compartilhamento.' : 'Entre para continuar e gerenciar somente os vínculos autorizados.'}</p><form class="auth-form" data-action="auth-submit"><label for="auth-email">E-mail</label><input id="auth-email" class="text-input auth-input" type="email" placeholder="voce@exemplo.com" autocomplete="email" required /><label for="auth-password">Senha</label><input id="auth-password" class="text-input auth-input" type="password" placeholder="Mínimo de 6 caracteres" autocomplete="${signUp ? 'new-password' : 'current-password'}" required />${state.authError ? `<div class="auth-error">${icon('alert')}<span>${state.authError}</span></div>` : ''}<button class="primary-button auth-submit" type="submit" ${state.authBusy ? 'disabled' : ''}>${icon(state.authBusy ? 'clock' : 'arrowRight')} ${state.authBusy ? 'Aguarde…' : signUp ? 'Criar conta' : 'Entrar'}</button></form><button class="auth-switch" data-action="toggle-auth-mode" type="button">${signUp ? 'Já tenho uma conta' : 'Criar uma conta nova'}</button><div class="auth-note">${icon('shieldCheck')}<span>A autenticação é necessária antes de criar ou aceitar um vínculo. Nenhum dado será compartilhado sem consentimento.</span></div><button class="theme-toggle onboarding-theme" data-action="toggle-theme" type="button">${icon(state.theme === 'amoled' ? 'sun' : 'moon')} Tema ${state.theme === 'amoled' ? 'AMOLED' : 'claro'}</button></div></div>`;
}

function authMessage(error) {
  const message = String(error?.message || error || '');
  if (message.includes('Invalid login')) return 'E-mail ou senha incorretos.';
  if (message.includes('already registered')) return 'Este e-mail já está cadastrado.';
  if (message.includes('Password')) return 'A senha precisa ter pelo menos 6 caracteres.';
  return 'Não foi possível concluir a autenticação. Verifique o serviço e tente novamente.';
}

async function handleAuthSubmit() {
  const email = document.querySelector('#auth-email')?.value.trim();
  const password = document.querySelector('#auth-password')?.value;
  if (!email || !password) {
    state.authError = 'Preencha e-mail e senha para continuar.';
    renderApp();
    return;
  }
  state.authBusy = true;
  state.authError = '';
  renderApp();
  const result = state.authMode === 'sign-up'
    ? await signUpWithPassword(email, password)
    : await signInWithPassword(email, password);
  state.authBusy = false;
  if (result.error) {
    state.authError = authMessage(result.error);
    renderApp();
    return;
  }
  if (!result.data?.session) {
    state.authError = 'Conta criada. Confirme o e-mail antes de entrar.';
    renderApp();
    return;
  }
  state.session = result.data.session;
  if (state.mode === 'admin') {
    const household = await ensureHousehold();
    if (household.ok) state.householdId = household.householdId;
    else state.authError = 'Conta autenticada, mas a família ainda não pôde ser criada. Verifique a migration do Supabase.';
  }
  renderApp();
}

async function hydrateAuth() {
  if (!supabaseConfigured || !supabase) {
    state.authChecked = true;
    return;
  }
  try {
    state.session = await getCurrentSession();
    if (state.session && state.mode === 'admin') {
      const household = await ensureHousehold();
      if (household.ok) state.householdId = household.householdId;
    }
  } catch {
    state.session = null;
  }
  state.authChecked = true;
  renderApp();
}

function renderApp() {
  destroyRealMap();
  document.documentElement.dataset.theme = state.theme;
  const app = document.querySelector('#app');
  if (!state.onboardingComplete) {
    app.innerHTML = renderOnboarding();
    return;
  }
  if (supabaseConfigured && !state.session) {
    app.innerHTML = renderAuthPage();
    return;
  }
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
  if (!state.connectedDevices.length) {
    openModal({
      title: 'SOS ainda não configurado',
      description: 'Conecte um responsável antes de usar este recurso.',
      body: `<div class="modal-summary">${icon('info')}<span>O botão SOS só poderá enviar um alerta depois de existir um vínculo aceito e uma permissão de localização ativa.</span></div>`,
      actions: `<button class="secondary-button" data-action="close-modal" type="button">Fechar</button><button class="primary-button" data-action="go-connection" type="button">${icon('link')} Conectar aparelho</button>`,
    });
    return;
  }
  openModal({
    title: 'Enviar alerta SOS?',
    description: 'Os participantes autorizados receberão um aviso destacado.',
    body: `<div class="modal-summary">${icon('shieldCheck')}<span>O alerta será visível no seu aparelho e poderá ser cancelado se for um toque acidental.</span></div>`,
    actions: `<button class="secondary-button" data-action="close-modal" type="button">Cancelar</button><button class="danger-button" data-action="confirm-sos" type="button">${icon('alert')} Confirmar SOS</button>`,
  });
}

function openAudioInfoModal() {
  openModal({
    title: 'Como funciona o áudio',
    description: 'Comunicação ativa, visível e com consentimento.',
    body: `<div class="modal-summary">${icon('mic')}<span>Quando um responsável pedir um check-in, você verá uma notificação. Só depois de tocar em “Aceitar” o microfone poderá gravar uma mensagem curta. Você também pode recusar ou encerrar a qualquer momento.</span></div><div class="consent-note">${icon('eye')}<span>Um indicador de áudio permanece visível enquanto o microfone estiver ativo. O app não oferece escuta contínua ou oculta.</span></div>`,
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

async function handleClick(event) {
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

  if (action === 'request-notifications') {
    requestNotifications();
    return;
  }

  if (action === 'finish-onboarding') {
    finishOnboarding();
    return;
  }

  if (action === 'auth-submit') {
    handleAuthSubmit();
    return;
  }

  if (action === 'toggle-auth-mode') {
    state.authMode = state.authMode === 'sign-in' ? 'sign-up' : 'sign-in';
    state.authError = '';
    renderApp();
    return;
  }

  if (action === 'skip-onboarding') {
    skipOnboarding();
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

  if (action === 'go-connection') {
    closeModal();
    state.screen = 'connection';
    renderApp();
    return;
  }

  if (action === 'open-app-settings') {
    closeModal();
    NativeSettings.openAppSettings().catch(() => {
      showToast('Abra Configurações → Apps → ParentLock → Permissões → Localização.', 'warning');
    });
    return;
  }

  if (action === 'copy-code') {
    if (!state.pairingCode) {
      showToast('Ainda não existe um convite para copiar.', 'warning');
      return;
    }
    if (navigator.clipboard) navigator.clipboard.writeText(state.pairingCode).catch(() => {});
    showToast('Código de convite copiado.');
    return;
  }

  if (action === 'create-pairing-code') {
    if (!supabaseConfigured || !state.householdId) {
      showToast('Configure a conta do administrador antes de gerar um convite.', 'warning');
      return;
    }
    showToast('Gerando convite seguro…');
    const result = await createPairingCode(state.householdId);
    if (!result.ok) {
      showToast('Não foi possível gerar o convite. Tente novamente.', 'warning');
      return;
    }
    state.pairingCode = result.code;
    state.pairingCodeExpiresAt = Date.now() + 15 * 60 * 1000;
    renderApp();
    showToast('Convite gerado. Envie o código ao outro aparelho.');
    return;
  }

  if (action === 'connect-code') {
    const input = document.querySelector('#pair-code-input');
    const code = normalizePairingCode(input?.value);
    if (code.length < 4) {
      input?.focus();
      showToast('Digite o código recebido para continuar.', 'warning');
      return;
    }
    if (!supabaseConfigured) {
      showToast('O serviço seguro de conexão ainda não foi configurado. Nenhum vínculo foi criado.', 'warning');
      return;
    }
    showToast('Validando o convite…');
    const result = await redeemPairingCode(code);
    if (!result.ok) {
      showToast('Não foi possível validar este convite. Tente novamente.', 'warning');
      return;
    }
    state.connected = true;
    state.connectedDevices = [result.data];
    renderApp();
    showToast('Convite validado. Revise as permissões antes de continuar.');
    return;
  }

  if (action === 'connection-info') {
    openModal({
      title: 'Como o vínculo funcionará',
      description: 'Conexão explícita entre dois aparelhos.',
      body: `<div class="modal-summary">${icon('link')}<span>Um convite será criado no servidor, a outra pessoa verá as permissões e os dois aparelhos precisarão confirmar. Nenhuma localização ou áudio será compartilhado antes desse aceite.</span></div>`,
      actions: `<button class="primary-button" data-action="close-modal" type="button">Entendi</button>`,
    });
    return;
  }

  if (action === 'request-audio') {
    if (!state.connectedDevices.length) {
      showToast('Conecte um aparelho antes de solicitar um check-in.', 'warning');
      return;
    }
    state.audioRequest = true;
    renderApp();
    showToast('Pedido preparado para o serviço de comunicação consentida.');
    return;
  }

  if (action === 'request-location') {
    requestLocation();
    return;
  }

  if (action === 'toggle-location') {
    if (!state.locationSharing) {
      requestLocation();
      return;
    }
    state.locationSharing = false;
    state.settings.liveLocation = false;
    renderApp();
    showToast('Localização pausada neste aparelho.', 'warning');
    return;
  }

  if (action === 'toggle-setting') {
    const setting = target.dataset.setting;
    if (setting && Object.prototype.hasOwnProperty.call(state.settings, setting)) {
      if (setting === 'liveLocation' && !state.settings.liveLocation) {
        requestLocation();
        return;
      }
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
    showToast('SOS preparado para envio aos participantes autorizados.', 'warning');
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

  if (action === 'toggle-map-layer') {
    state.mapLayer = state.mapLayer === 'street' ? 'satellite' : 'street';
    renderApp();
    showToast(state.mapLayer === 'satellite' ? 'Camada de satélite ativada.' : 'Mapa de ruas ativado.');
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
      body: `<div class="request-status"><span class="request-status-icon" style="color:var(--mint-dark);background:var(--mint-pale)">${icon('location')}</span><div><strong>Localização</strong><span>${state.locationPermission === 'granted' ? 'Autorizada neste aparelho' : 'Ainda não autorizada'}</span></div></div><div class="request-status"><span class="request-status-icon" style="color:var(--blue);background:var(--blue-pale)">${icon('mic')}</span><div><strong>Áudio</strong><span>${state.settings.audioRequests ? 'Pedidos permitidos, sempre com aceite' : 'Desativado'}</span></div></div><div class="request-status"><span class="request-status-icon">${icon('database')}</span><div><strong>Histórico</strong><span>${state.settings.history ? 'Permitido, sem registros ainda' : 'Desativado'}</span></div></div>`,
      actions: `<button class="primary-button" data-action="close-modal" type="button">Fechar resumo</button>`,
    });
    return;
  }

}

function handleKeydown(event) {
  if (event.key === 'Escape') closeModal();
}

function handleSubmit(event) {
  const form = event.target.closest('form[data-action="auth-submit"]');
  if (!form) return;
  event.preventDefault();
  handleAuthSubmit();
}

document.addEventListener('click', handleClick);
document.addEventListener('submit', handleSubmit);
document.addEventListener('keydown', handleKeydown);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refreshNativePermissions();
});
renderApp();
refreshNativePermissions();
hydrateAuth();
