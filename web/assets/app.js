import { TRAITS, MODELS, QUESTIONS, GLYPHS } from './data.js';
import { qrcode } from './qrcode.mjs';

const TOTAL = QUESTIONS.length;
const STORE_LAST = 'mpb.v1.last';
const STORE_UNLOCKED = 'mpb.v1.unlocked';
const MODEL_BY_ID = new Map(MODELS.map((m) => [m.id, m]));
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_WECHAT = /MicroMessenger/i.test(navigator.userAgent);

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

const state = {
  screen: 'cover',
  qIndex: 0,
  answers: Array(TOTAL).fill(null),
  advancing: false,
  result: null,
};

/* ---------- storage ---------- */
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* local storage may be unavailable */
  }
}
function getUnlocked() {
  const value = readJSON(STORE_UNLOCKED, []);
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id) => MODEL_BY_ID.has(id)))];
}
function addUnlocked(id) {
  const set = new Set(getUnlocked());
  set.add(id);
  writeJSON(STORE_UNLOCKED, [...set]);
}
function getLast() {
  const value = readJSON(STORE_LAST, null);
  if (!value || !MODEL_BY_ID.has(value.modelId) || !value.traits || !Array.isArray(value.matches)) return null;
  const matches = value.matches.filter(
    (match) => match && MODEL_BY_ID.has(match.id) && Number.isFinite(match.pct),
  );
  const complete = matches.length === MODELS.length && matches.some((match) => match.id === value.modelId);
  return complete ? { ...value, matches } : null;
}

/* ---------- glyphs ---------- */
function glyphSvg(key) {
  const inner = GLYPHS[key] || '';
  return `<svg viewBox="0 0 64 64" fill="none" stroke="#161513" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}
function glyphChip(model, extraClass = '') {
  return `<span class="glyph-chip ${extraClass}" style="--chip:${model.color}">${glyphSvg(model.glyph)}</span>`;
}

/* ---------- scoring ---------- */
const TRAIT_MAX = (() => {
  const maxima = Object.fromEntries(TRAITS.map((t) => [t.key, 0]));
  QUESTIONS.forEach((q) => {
    TRAITS.forEach((t) => {
      maxima[t.key] += Math.max(...q.options.map((o) => (o.weights && o.weights[t.key]) || 0));
    });
  });
  return maxima;
})();

function computeTraits(answers) {
  const raw = Object.fromEntries(TRAITS.map((t) => [t.key, 0]));
  answers.forEach((optionIndex, questionIndex) => {
    if (optionIndex == null) return;
    const option = QUESTIONS[questionIndex].options[optionIndex];
    if (!option) return;
    TRAITS.forEach((t) => {
      raw[t.key] += (option.weights && option.weights[t.key]) || 0;
    });
  });
  const ratios = TRAITS.map((t) => raw[t.key] / (TRAIT_MAX[t.key] || 1));
  const mean = ratios.reduce((sum, value) => sum + value, 0) / ratios.length;
  const variance = ratios.reduce((sum, value) => sum + (value - mean) ** 2, 0) / ratios.length;
  const std = Math.max(Math.sqrt(variance), 0.035);
  const traits = {};
  TRAITS.forEach((t, index) => {
    const score = Math.round(52 + ((ratios[index] - mean) / std) * 18);
    traits[t.key] = Math.max(8, Math.min(96, score));
  });
  return traits;
}

function zProfile(vector) {
  const values = TRAITS.map((t) => vector[t.key]);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const std = Math.max(Math.sqrt(variance), 4);
  return values.map((value) => (value - mean) / std);
}

function computeMatches(traits) {
  const userZ = zProfile(traits);
  const rows = MODELS.map((model) => {
    const modelZ = zProfile(model.traits);
    const distance = TRAITS.reduce((sum, _trait, index) => sum + Math.abs(userZ[index] - modelZ[index]), 0) / TRAITS.length;
    return { id: model.id, distance };
  });

  // 匹配度 = 形状相似度，映射到 [MIN_PCT, MAX_PCT]。
  // 用固定的距离刻度而不是运行时 min/max，避免「乱答也能拿 94%」的虚高，
  // 同时保证不同用户之间、不同结果之间的分数可比。
  const MIN_PCT = 62;
  const MAX_PCT = 97;
  const DIST_NEAR = 0.20;   // 距离小于此值视为高度相似
  const DIST_FAR = 0.85;    // 距离大于此值视为几乎不相似

  return rows
    .map((row) => {
      const t = (DIST_FAR - row.distance) / (DIST_FAR - DIST_NEAR);
      const clamped = Math.max(0, Math.min(1, t));
      // 幂曲线（0.72）：把高分区间拉开，让 90% 以上真正难得
      const shaped = Math.pow(clamped, 0.72);
      const pct = MIN_PCT + shaped * (MAX_PCT - MIN_PCT);
      return { id: row.id, pct: Math.round(pct * 10) / 10 };
    })
    .sort((a, b) => b.pct - a.pct);
}

function makeSerial() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
  const now = new Date();
  const ym = String(now.getFullYear()).slice(2) + String(now.getMonth() + 1).padStart(2, '0');
  return `SUBJ-${code}-${ym}`;
}

function formatPct(value) {
  return `${Number(value).toFixed(1)}%`;
}
function formatDate(iso) {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) return '2026.10.29';
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('.');
}

/* ---------- navigation ---------- */
function hasQuizProgress() {
  return state.answers.some((answer) => answer != null);
}

function navigate(name) {
  if (name === state.screen) return;
  if ((state.screen === 'quiz' || state.screen === 'analyzing') && hasQuizProgress()) {
    if (!window.confirm('离开会丢失本次答题进度，确定吗？')) return;
    resetQuizState();
  }
  if (name === 'gallery') renderGallery();
  if (name === 'cover') updateCover();
  showScreen(name);
}

function showScreen(name) {
  state.screen = name;
  document.body.dataset.screen = name;
  $$('.screen').forEach((screen) => screen.classList.toggle('is-active', screen.dataset.screen === name));
  closeModal();
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previousBehavior;
  const activeNav = name === 'gallery' || name === 'about' ? name : '';
  $$('.topnav button').forEach((button) => {
    if (activeNav && button.dataset.nav === activeNav) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
}

function resetQuizState() {
  state.qIndex = 0;
  state.answers = Array(TOTAL).fill(null);
  state.advancing = false;
}

/* ---------- cover ---------- */
function updateCover() {
  const last = getLast();
  const btn = $('#continueBtn');
  if (last) {
    const model = MODEL_BY_ID.get(last.modelId);
    btn.textContent = `查看上次报告：${model.name}`;
    btn.classList.remove('is-hidden');
  } else {
    btn.classList.add('is-hidden');
  }
}

/* ---------- quiz ---------- */
function initProgress() {
  const bar = $('#progress');
  bar.innerHTML = Array.from({ length: TOTAL }, () => '<i></i>').join('');
}

function startQuiz() {
  resetQuizState();
  state.result = null;
  showScreen('quiz');
  renderQuestion();
}

function renderQuestion() {
  const question = QUESTIONS[state.qIndex];
  const index = state.qIndex;
  $('#qCount').textContent = `QUESTION ${String(index + 1).padStart(2, '0')} / ${String(TOTAL).padStart(2, '0')}`;
  $('#qLabel').textContent = `SCENARIO ${String(index + 1).padStart(2, '0')}`;
  $('#qTitle').textContent = question.text;
  $('#backBtn').disabled = index === 0;

  const previous = state.answers[index];
  $('#opts').classList.remove('is-locked');
  $('#opts').innerHTML = question.options
    .map(
      (option, optionIndex) => `
      <button class="opt${previous === optionIndex ? ' is-picked' : ''}" type="button" data-index="${optionIndex}">
        <span class="key">${'ABCD'[optionIndex]}</span>
        <span class="opt-text">${escapeHtml(option.text)}</span>
      </button>`,
    )
    .join('');

  updateQuizProgress();
  $('#qTitle').focus({ preventScroll: true });
}

function updateQuizProgress() {
  const segments = $$('#progress i');
  segments.forEach((segment, index) => {
    segment.classList.toggle('is-done', index < state.qIndex);
    segment.classList.toggle('is-now', index === state.qIndex);
  });
  $('#progress').setAttribute('aria-valuenow', String(state.qIndex + 1));
  $('#quizPct').textContent = `${Math.round(((state.qIndex + 1) / TOTAL) * 100)}%`;
}

function chooseOption(optionIndex) {
  if (state.advancing) return;
  const question = QUESTIONS[state.qIndex];
  if (!question.options[optionIndex]) return;
  state.answers[state.qIndex] = optionIndex;
  state.advancing = true;

  $$('#opts .opt').forEach((option) => {
    option.classList.toggle('is-picked', Number(option.dataset.index) === optionIndex);
  });
  $('#opts').classList.add('is-locked');

  const delay = REDUCED_MOTION ? 100 : 260;
  window.setTimeout(() => {
    state.advancing = false;
    if (state.qIndex === TOTAL - 1) {
      runAnalysis();
    } else {
      state.qIndex += 1;
      renderQuestion();
    }
  }, delay);
}

function goBack() {
  if (state.advancing || state.qIndex === 0) return;
  state.qIndex -= 1;
  renderQuestion();
}

/* ---------- analysis ---------- */
let analysisRun = 0;

function runAnalysis() {
  const runId = ++analysisRun;
  showScreen('analyzing');
  const logEl = $('#analyzingLog');
  const bar = $('#analyzingBar');
  logEl.innerHTML = '';
  bar.style.width = '0%';

  const lines = [
    ['加载评测环境', 'OK'],
    ['读取生活场景题库', 'OK'],
    ['校准人格权重', 'OK'],
    ['检测幻觉水平', 'PASS'],
    ['对齐温度与上下文', 'OK'],
    [`比对 ${MODELS.length} 组模型人格`, 'OK'],
    ['生成报告单', '...'],
  ];
  const step = REDUCED_MOTION ? 80 : 250;

  lines.forEach(([label, status], index) => {
    window.setTimeout(() => {
      if (runId !== analysisRun) return;
      const line = document.createElement('div');
      line.className = 'log-line';
      line.innerHTML = `<span class="t">T+${(index * 0.3).toFixed(1)}s</span><span>${label}</span><span class="ok">${status}</span>`;
      logEl.appendChild(line);
      bar.style.width = `${Math.round(((index + 1) / lines.length) * 100)}%`;
    }, index * step);
  });

  window.setTimeout(() => {
    if (runId !== analysisRun) return;
    if (state.screen !== 'analyzing') return;
    finishAnalysis();
  }, lines.length * step + (REDUCED_MOTION ? 100 : 420));
}

function finishAnalysis() {
  const traits = computeTraits(state.answers);
  const matches = computeMatches(traits);
  const result = {
    modelId: matches[0].id,
    traits,
    matches,
    serial: makeSerial(),
    date: new Date().toISOString(),
  };
  state.result = result;
  writeJSON(STORE_LAST, result);
  addUnlocked(result.modelId);
  renderResult(result);
  showScreen('result');
}

/* ---------- result ---------- */
function renderResult(result) {
  const model = MODEL_BY_ID.get(result.modelId);
  const best = result.matches.find((match) => match.id === model.id) || result.matches[0];

  const glyph = $('#resGlyph');
  glyph.style.setProperty('--chip', model.color);
  glyph.innerHTML = glyphSvg(model.glyph);
  $('#resMatch').textContent = `${Math.round(best.pct)}%`;
  $('#resVendor').textContent = `${model.vendor} · ${model.type}`;
  $('#resName').textContent = model.name;
  $('#resTag').textContent = model.tagline;
  $('#resDesc').textContent = model.desc;
  $('#serial').textContent = result.serial;
  $('#reportDate').textContent = formatDate(result.date);

  $('#traitBars').innerHTML = TRAITS.map(
    (trait) => `
    <div class="trait-row">
      <span>${trait.label}</span>
      <span class="trait-track"><i data-width="${result.traits[trait.key]}"></i></span>
      <span class="trait-val">${result.traits[trait.key]}</span>
    </div>`,
  ).join('');
  window.setTimeout(() => {
    $$('#traitBars .trait-track > i').forEach((bar) => {
      bar.style.width = `${bar.dataset.width}%`;
    });
  }, 80);

  const specs = [
    ['参数量 / PARAMS', model.specs.params],
    ['上下文 / CONTEXT', model.specs.context],
    ['温度 / TEMPERATURE', model.specs.temp],
    ['幻觉率 / HALLUCINATION', model.specs.hallucination],
  ];
  $('#specGrid').innerHTML = specs
    .map(([label, value]) => `<div class="spec"><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`)
    .join('');
  $('#resDeploy').textContent = model.specs.deploy;

  $('#resStrengths').innerHTML = model.strengths.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  $('#resLimits').innerHTML = model.limits.map((item) => `<li>${escapeHtml(item)}</li>`).join('');

  const others = result.matches.filter((match) => match.id !== model.id);
  const compatible = others[0];
  const clash = others[others.length - 1];
  renderCompatCard($('#compatCard'), '兼容模型 / COMPATIBLE', compatible);
  renderCompatCard($('#clashCard'), '冲突模型 / CONFLICT', clash);

  $('#leaderboard').innerHTML = result.matches
    .slice(0, 5)
    .map((match, index) => {
      const entry = MODEL_BY_ID.get(match.id);
      const isYou = match.id === model.id;
      return `
        <li class="lb-row${isYou ? ' is-you' : ''}">
          <span class="lb-rank">${String(index + 1).padStart(2, '0')}</span>
          ${glyphChip(entry, 'xs')}
          <span class="lb-name"><strong>${escapeHtml(entry.name)}</strong>${isYou ? '<span class="you">YOU</span>' : ''}<em>${escapeHtml(entry.tagline)}</em></span>
          <span class="lb-bar"><i style="--v:${match.pct}%"></i></span>
          <span class="lb-pct">${formatPct(match.pct)}</span>
        </li>`;
    })
    .join('');

  const nameEl = $('#resName');
  nameEl.setAttribute('tabindex', '-1');
  nameEl.focus({ preventScroll: true });
}

function renderCompatCard(card, label, match) {
  const model = MODEL_BY_ID.get(match.id);
  card.dataset.model = model.id;
  card.setAttribute('aria-label', `查看 ${model.name} 的模型卡`);
  card.innerHTML = `
    ${glyphChip(model, 'sm')}
    <span class="compat-info">
      <span class="compat-label">${label}</span>
      <strong class="compat-name">${escapeHtml(model.name)} · ${escapeHtml(model.tagline)}</strong>
    </span>
    <span class="compat-pct">${formatPct(match.pct)}</span>`;
}

/* ---------- gallery ---------- */
function renderGallery() {
  const unlocked = new Set(getUnlocked());
  $('#galleryCount').textContent = `${unlocked.size} / ${MODELS.length} 已观测`;
  $('#galleryBar').style.width = `${(unlocked.size / MODELS.length) * 100}%`;

  $('#galleryGrid').innerHTML = MODELS.map((model) => {
    const isOn = unlocked.has(model.id);
    return `
      <button class="gcard${isOn ? '' : ' is-locked'}" type="button" data-model="${model.id}" ${isOn ? '' : 'tabindex="-1" aria-disabled="true"'}>
        <span class="gcard-head"><span>NO.${String(model.no).padStart(2, '0')}</span><span class="${isOn ? 'state' : ''}">${isOn ? '已观测' : '未观测'}</span></span>
        <span class="glyph-chip" style="--chip:${isOn ? model.color : 'transparent'}">${glyphSvg(model.glyph)}</span>
        <span>
          <span class="gcard-name">${isOn ? escapeHtml(model.name) : '? ? ?'}</span>
          <span class="gcard-tag">${isOn ? escapeHtml(model.tagline) : '尚未观测到该人格'}</span>
        </span>
      </button>`;
  }).join('');
}

function resetGallery() {
  if (!window.confirm('清除本机记录？已解锁的图鉴和上次报告都会被清空。')) return;
  try {
    localStorage.removeItem(STORE_LAST);
    localStorage.removeItem(STORE_UNLOCKED);
  } catch {
    /* ignore */
  }
  state.result = null;
  updateCover();
  renderGallery();
  toast('本地记录已清除');
  navigate('cover');
}

/* ---------- model modal ---------- */
let lastFocused = null;

function openModelModal(id) {
  const model = MODEL_BY_ID.get(id);
  if (!model) return;
  lastFocused = document.activeElement;

  const rank = computeMatches(model.traits);
  const others = rank.filter((match) => match.id !== model.id);
  const compatible = MODEL_BY_ID.get(others[0].id);
  const clash = MODEL_BY_ID.get(others[others.length - 1].id);

  $('#modalBody').innerHTML = `
    <div class="modal-head">
      ${glyphChip(model)}
      <div>
        <p class="modal-vendor">${escapeHtml(model.vendor)} · ${escapeHtml(model.type)}</p>
        <h2 class="modal-name" id="modalName">${escapeHtml(model.name)}</h2>
        <p class="modal-tag">${escapeHtml(model.tagline)}</p>
      </div>
    </div>
    <p class="modal-desc">${escapeHtml(model.desc)}</p>
    <div class="modal-section">
      <h4>六维基准 / BENCHMARK</h4>
      <div class="trait-bars">
        ${TRAITS.map(
          (trait) => `
          <div class="trait-row">
            <span>${trait.label}</span>
            <span class="trait-track"><i data-width="${model.traits[trait.key]}"></i></span>
            <span class="trait-val">${model.traits[trait.key]}</span>
          </div>`,
        ).join('')}
      </div>
    </div>
    <div class="modal-section">
      <h4>模型规格 / SPECS</h4>
      <dl class="modal-specs">
        <div><dt>参数量</dt><dd>${escapeHtml(model.specs.params)}</dd></div>
        <div><dt>上下文</dt><dd>${escapeHtml(model.specs.context)}</dd></div>
        <div><dt>温度</dt><dd>${escapeHtml(model.specs.temp)}</dd></div>
        <div><dt>幻觉率</dt><dd>${escapeHtml(model.specs.hallucination)}</dd></div>
      </dl>
    </div>
    <div class="modal-section">
      <h4>兼容性 / COMPATIBILITY</h4>
      <p class="modal-compat">兼容 <b>${escapeHtml(compatible.name)}</b> · 冲突 <b>${escapeHtml(clash.name)}</b></p>
    </div>
    <div class="modal-actions">
      <button class="btn ghost" type="button" data-close-modal>关闭</button>
    </div>`;

  const modal = $('#modelModal');
  modal.hidden = false;
  document.body.classList.add('modal-open');
  window.setTimeout(() => {
    $$('#modalBody .trait-track > i').forEach((bar) => {
      bar.style.width = `${bar.dataset.width}%`;
    });
  }, 60);
  window.requestAnimationFrame(() => $('#modalClose').focus());
}

function closeModal() {
  const modal = $('#modelModal');
  if (modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  if (lastFocused && typeof lastFocused.focus === 'function') {
    lastFocused.focus({ preventScroll: true });
  }
  lastFocused = null;
}

function trapModalFocus(event, modal = $('#modelModal')) {
  if (modal.hidden || event.key !== 'Tab') return;
  const focusable = $$('button, [href], [tabindex]:not([tabindex="-1"])', modal).filter(
    (element) => !element.disabled && element.offsetParent !== null,
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/* ---------- share ---------- */
function shareUrl() {
  const { origin, pathname } = window.location;
  return `${origin}${pathname.replace(/index\.html$/, '')}`;
}

function shareText() {
  const result = state.result;
  if (!result) return '';
  const model = MODEL_BY_ID.get(result.modelId);
  const best = result.matches[0];
  return `我的大模型人格是「${model.name} · ${model.tagline}」，匹配度 ${Math.round(best.pct)}%。\n你是哪个大模型？ ${shareUrl()}`;
}

async function copyShare() {
  const text = shareText();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    toast('分享文案已复制');
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      toast('分享文案已复制');
    } catch {
      toast('复制失败，请手动选择文本');
    }
    textarea.remove();
  }
}

function svgDataUrl(key, size) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" fill="none" stroke="#161513" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${GLYPHS[key] || ''}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function loadSvgImage(key, size) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = svgDataUrl(key, size);
  });
}

function fitText(ctx, text, maxWidth, startSize, family, weight = '700') {
  let size = startSize;
  do {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 4;
  } while (size > 28);
  return size;
}

function drawQr(ctx, text, x, y, size) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  const margin = Math.floor(size * 0.04);
  const cell = Math.max(1, Math.floor((size - margin * 2) / count));
  const drawn = cell * count;
  const offset = (size - drawn) / 2;

  const modules = document.createElement('canvas');
  modules.width = count;
  modules.height = count;
  qr.renderTo2dContext(modules.getContext('2d'), 1);

  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y, size, size);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(modules, x + offset, y + offset, drawn, drawn);
  ctx.restore();
}

async function buildShareCard(result) {
  const model = MODEL_BY_ID.get(result.modelId);
  const best = result.matches.find((match) => match.id === model.id) || result.matches[0];
  const others = result.matches.filter((match) => match.id !== model.id);
  const compatible = MODEL_BY_ID.get(others[0].id);
  const clash = MODEL_BY_ID.get(others[others.length - 1].id);

  const W = 1080;
  const H = 1440;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const MONO = 'ui-monospace, "SF Mono", Menlo, "PingFang SC", sans-serif';
  const SANS = '"PingFang SC", -apple-system, "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
  const ink = '#161513';
  const muted = '#5E5C55';
  const faint = '#918E85';
  const paper = '#F2F1EC';
  const accent = '#FF4D00';

  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(22,21,19,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 54) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 54) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  ctx.strokeStyle = ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, W - 64, H - 64);

  ctx.fillStyle = ink;
  ctx.font = `600 22px ${MONO}`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('LLM PERSONALITY BENCHMARK', 80, 96);
  ctx.fillStyle = faint;
  ctx.font = `500 20px ${MONO}`;
  ctx.textAlign = 'right';
  ctx.fillText(formatDate(result.date), W - 80, 96);
  ctx.textAlign = 'left';

  ctx.strokeStyle = ink;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 126);
  ctx.lineTo(W - 80, 126);
  ctx.stroke();

  const chipX = 80;
  const chipY = 168;
  const chipSize = 190;
  ctx.fillStyle = model.color;
  ctx.fillRect(chipX, chipY, chipSize, chipSize);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(chipX, chipY, chipSize, chipSize);
  try {
    const glyphImage = await loadSvgImage(model.glyph, 128);
    ctx.drawImage(glyphImage, chipX + 31, chipY + 31, 128, 128);
  } catch {
    /* glyph is decorative */
  }

  const textX = chipX + chipSize + 40;
  const textMax = W - 80 - textX;
  ctx.fillStyle = faint;
  ctx.font = `500 22px ${MONO}`;
  ctx.fillText(`${model.vendor.toUpperCase()} · ${model.type}`, textX, 208);

  const nameSize = fitText(ctx, model.name, textMax, 94, SANS, '700');
  ctx.fillStyle = ink;
  ctx.font = `700 ${nameSize}px ${SANS}`;
  ctx.fillText(model.name, textX, 302);

  ctx.fillStyle = muted;
  ctx.font = `600 40px ${SANS}`;
  ctx.fillText(`— ${model.tagline}`, textX, 358);

  ctx.save();
  ctx.translate(W - 150, 430);
  ctx.rotate(-0.09);
  ctx.fillStyle = '#FFE6DA';
  ctx.fillRect(-120, -32, 240, 64);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(-120, -32, 240, 64);
  ctx.fillStyle = accent;
  ctx.textAlign = 'center';
  ctx.font = `600 18px ${MONO}`;
  ctx.fillText('MATCH', 0, -4);
  ctx.font = `700 30px ${MONO}`;
  ctx.fillText(`${Math.round(best.pct)}%`, 0, 22);
  ctx.restore();
  ctx.textAlign = 'left';

  const divider = (y) => {
    ctx.strokeStyle = 'rgba(22,21,19,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, y);
    ctx.lineTo(W - 80, y);
    ctx.stroke();
  };

  divider(492);
  ctx.fillStyle = ink;
  ctx.font = `700 26px ${SANS}`;
  ctx.fillText('六维基准', 80, 538);
  ctx.fillStyle = faint;
  ctx.font = `500 18px ${MONO}`;
  ctx.fillText('BENCHMARK SCORES', 196, 538);

  TRAITS.forEach((trait, index) => {
    const y = 590 + index * 72;
    ctx.fillStyle = muted;
    ctx.font = `500 22px ${MONO}`;
    ctx.fillText(trait.label, 80, y + 16);

    const trackX = 260;
    const trackW = 640;
    ctx.fillStyle = 'rgba(22,21,19,0.12)';
    ctx.fillRect(trackX, y, trackW, 14);
    ctx.fillStyle = ink;
    ctx.fillRect(trackX, y, (trackW * result.traits[trait.key]) / 100, 14);

    ctx.fillStyle = ink;
    ctx.font = `600 22px ${MONO}`;
    ctx.textAlign = 'right';
    ctx.fillText(String(result.traits[trait.key]), W - 80, y + 17);
    ctx.textAlign = 'left';
  });

  divider(1024);

  const drawCompat = (x, y, w, label, entry, pct, isClash) => {
    ctx.strokeStyle = 'rgba(22,21,19,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, 126);
    ctx.fillStyle = entry.color;
    ctx.fillRect(x + 22, y + 42, 12, 42);
    ctx.fillStyle = faint;
    ctx.font = `500 16px ${MONO}`;
    ctx.fillText(label, x + 50, y + 35);
    ctx.fillStyle = ink;
    ctx.font = `700 30px ${SANS}`;
    ctx.fillText(entry.name, x + 50, y + 76);
    ctx.fillStyle = muted;
    ctx.font = `500 20px ${SANS}`;
    ctx.fillText(entry.tagline, x + 50, y + 104);
    ctx.fillStyle = isClash ? accent : ink;
    ctx.font = `700 26px ${MONO}`;
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(pct)}%`, x + w - 22, y + 76);
    ctx.textAlign = 'left';
  };

  ctx.fillStyle = ink;
  ctx.font = `700 26px ${SANS}`;
  ctx.fillText('兼容性', 80, 1066);
  ctx.fillStyle = faint;
  ctx.font = `500 18px ${MONO}`;
  ctx.fillText('COMPATIBILITY', 168, 1066);

  drawCompat(80, 1090, 440, '兼容模型 / COMPATIBLE', compatible, others[0].pct, false);
  drawCompat(560, 1090, 440, '冲突模型 / CONFLICT', clash, others[others.length - 1].pct, true);

  ctx.fillStyle = ink;
  ctx.font = `500 20px ${MONO}`;
  ctx.fillText(result.serial, 80, 1290);
  ctx.fillStyle = faint;
  ctx.font = `500 18px ${MONO}`;
  ctx.fillText('纯属娱乐 · 与各模型厂商无关', 80, 1324);
  ctx.fillStyle = accent;
  ctx.fillRect(80, 1348, 56, 6);

  const qrSize = 160;
  const qrX = W - 80 - qrSize;
  const qrY = 1232;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
  ctx.strokeStyle = 'rgba(22,21,19,0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
  drawQr(ctx, shareUrl(), qrX, qrY, qrSize);
  ctx.fillStyle = faint;
  ctx.font = `500 18px ${MONO}`;
  ctx.textAlign = 'right';
  ctx.fillText('扫码测测你', qrX - 16, qrY + qrSize / 2 + 6);
  ctx.textAlign = 'left';

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('canvas export failed'))), 'image/png');
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

let shareModalFocus = null;
async function openShareModal(blob) {
  const dataUrl = await blobToDataUrl(blob);
  shareModalFocus = document.activeElement;
  $('#shareImage').src = dataUrl;
  $('#shareModal').hidden = false;
  document.body.classList.add('modal-open');
  $('#shareClose').focus();
}

function closeShareModal() {
  const modal = $('#shareModal');
  if (modal.hidden) return;
  modal.hidden = true;
  $('#shareImage').removeAttribute('src');
  if ($('#modelModal').hidden && $('#supportModal').hidden) document.body.classList.remove('modal-open');
  if (shareModalFocus && typeof shareModalFocus.focus === 'function') {
    shareModalFocus.focus({ preventScroll: true });
  }
  shareModalFocus = null;
}

/* ---------- support ---------- */
let supportCodes = [];
let supportFocus = null;

async function loadSupport() {
  try {
    const response = await fetch('assets/support/codes.json', { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();
    if (!data || !Array.isArray(data.codes)) return;
    supportCodes = data.codes
      .filter((code) => code && typeof code.src === 'string' && typeof code.label === 'string')
      .slice(0, 4);
    if (!supportCodes.length) return;
    if (typeof data.note === 'string' && data.note.trim()) {
      $('#supportNote').textContent = data.note.trim();
    }
    $('#supportStamp').textContent = 'OPEN';
    $('#supportTitle').textContent = '投喂通道';
    $('#supportText').textContent = '如果这个测试让你笑了一下，可以请作者喝杯咖啡。';
    $('#supportBtn').hidden = false;
    $('#supportFooterLink').textContent = '关于 / 投喂通道';
  } catch {
    /* no support codes yet: keep the placeholder */
  }
}

function openSupportModal() {
  if (!supportCodes.length) return;
  const list = $('#supportCodes');
  if (!list.childElementCount) {
    list.innerHTML = supportCodes
      .map(
        (code) => `
        <figure class="support-code">
          <img src="${escapeHtml(code.src)}" alt="${escapeHtml(code.label)}">
          <figcaption>${escapeHtml(code.label)}</figcaption>
        </figure>`,
      )
      .join('');
  }
  supportFocus = document.activeElement;
  $('#supportModal').hidden = false;
  document.body.classList.add('modal-open');
  $('#supportClose').focus();
}

function closeSupportModal() {
  const modal = $('#supportModal');
  if (modal.hidden) return;
  modal.hidden = true;
  if ($('#modelModal').hidden && $('#shareModal').hidden) document.body.classList.remove('modal-open');
  if (supportFocus && typeof supportFocus.focus === 'function') {
    supportFocus.focus({ preventScroll: true });
  }
  supportFocus = null;
}

async function saveCard() {
  if (!state.result) return;
  const button = $('#saveCardBtn');
  const original = button.textContent;
  button.disabled = true;
  button.textContent = '生成中…';
  try {
    const model = MODEL_BY_ID.get(state.result.modelId);
    const blob = await buildShareCard(state.result);
    if (IS_WECHAT) {
      await openShareModal(blob);
      toast('长按图片保存，再发到微信');
      return;
    }
    const file = new File([blob], `mpb-${model.id}.png`, { type: 'image/png' });
    let shared = false;
    if (navigator.canShare && navigator.share) {
      try {
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: '我的大模型人格', text: shareText() });
          shared = true;
          toast('模型卡已分享');
        }
      } catch (error) {
        if (error && error.name === 'AbortError') {
          shared = true;
        }
      }
    }
    if (!shared) {
      downloadBlob(blob, file.name);
      toast('模型卡已保存');
    }
  } catch (error) {
    console.error(error);
    toast('模型卡生成失败，请重试');
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

/* ---------- toast ---------- */
let toastTimer = null;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('is-show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('is-show'), 2200);
}

/* ---------- events ---------- */
function bindEvents() {
  $('#startBtn').addEventListener('click', startQuiz);
  $('#retakeBtn').addEventListener('click', startQuiz);
  $('#backBtn').addEventListener('click', goBack);
  $('#continueBtn').addEventListener('click', () => {
    const last = getLast();
    if (!last) return;
    state.result = last;
    renderResult(last);
    showScreen('result');
  });
  $('#saveCardBtn').addEventListener('click', saveCard);
  $('#copyBtn').addEventListener('click', copyShare);
  $('#resetBtn').addEventListener('click', resetGallery);
  $('#modalClose').addEventListener('click', closeModal);
  $$('[data-close-modal]').forEach((el) => el.addEventListener('click', closeModal));
  $('#shareClose').addEventListener('click', closeShareModal);
  $$('[data-close-share]').forEach((el) => el.addEventListener('click', closeShareModal));
  $('#shareCopyBtn').addEventListener('click', copyShare);
  $('#supportBtn').addEventListener('click', openSupportModal);
  $('#supportClose').addEventListener('click', closeSupportModal);
  $$('[data-close-support]').forEach((el) => el.addEventListener('click', closeSupportModal));

  $$('[data-nav]').forEach((button) => {
    button.addEventListener('click', () => navigate(button.dataset.nav));
  });

  $('#opts').addEventListener('click', (event) => {
    const option = event.target.closest('.opt');
    if (!option) return;
    chooseOption(Number(option.dataset.index));
  });

  $('#galleryGrid').addEventListener('click', (event) => {
    const card = event.target.closest('.gcard');
    if (!card) return;
    if (card.classList.contains('is-locked')) {
      toast('这个模型还没观测到，先完成一次评测。');
      return;
    }
    openModelModal(card.dataset.model);
  });

  ['compatCard', 'clashCard'].forEach((id) => {
    $(`#${id}`).addEventListener('click', (event) => {
      const modelId = event.currentTarget.dataset.model;
      if (modelId) openModelModal(modelId);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (!$('#supportModal').hidden) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeSupportModal();
        return;
      }
      trapModalFocus(event, $('#supportModal'));
      return;
    }
    if (!$('#shareModal').hidden) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeShareModal();
        return;
      }
      trapModalFocus(event, $('#shareModal'));
      return;
    }
    if (!$('#modelModal').hidden) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }
      trapModalFocus(event);
      return;
    }
    if (state.screen !== 'quiz') return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const key = event.key.toLowerCase();
    if (['1', '2', '3', '4'].includes(key)) {
      event.preventDefault();
      chooseOption(Number(key) - 1);
    } else if (['a', 'b', 'c', 'd'].includes(key)) {
      event.preventDefault();
      chooseOption(['a', 'b', 'c', 'd'].indexOf(key));
    } else if (event.key === 'ArrowLeft' || event.key === 'Backspace') {
      event.preventDefault();
      goBack();
    }
  });

  window.addEventListener('beforeunload', (event) => {
    if (state.screen === 'quiz' && hasQuizProgress()) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
}

/* ---------- init ---------- */
function init() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  initProgress();
  bindEvents();
  $$('[data-glyph]').forEach((el) => {
    el.innerHTML = glyphSvg(el.dataset.glyph);
  });
  updateCover();
  renderResultPlaceholder();
  loadSupport();
}

function renderResultPlaceholder() {
  const glyph = $('#resGlyph');
  glyph.innerHTML = glyphSvg('gpt');
  glyph.style.setProperty('--chip', MODELS[0].color);
}

init();
