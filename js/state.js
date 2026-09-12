/* ============================================================
 * ToonStar V2.0 — state.js
 * 统一 projectState + localStorage 持久化
 * 所有页面读写同一个对象，页面切换与刷新不丢状态。
 * ============================================================ */

const STORAGE_KEY = 'toonstar_v2_projects';   // 项目库
const RECENT_KEY  = 'toonstar_v2_recent';     // 最近一次项目（刷新恢复）

/* 单一状态对象（不要页面各存一份） */
const projectState = {
  projectId: null,
  subjectType: 'pet',
  sourceImage: '',          // data URL（便于持久化与 reopen）
  ipName: '',
  keywords: [],             // 最多 3 个
  mainColor: '#F6CF58',
  keepFeatures: '',
  style: 'Flat Toon',
  generatedOptions: [],     // [{id:'A', url}, ...]
  selectedIP: '',           // 生成后选中的 IP 图 url
  scene: 'Daily',
  customScene: { where: '', what: '', elements: '', details: '' },
  selectedProducts: [],     // product id 数组
  canvasState: { productId: '', html: '' },
  updatedAt: null
};

/* ---------- 基础工具 ---------- */
function uid() {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function cloneState() {
  return JSON.parse(JSON.stringify(projectState));
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('localStorage 写入失败', e);
    return false;
  }
}

/* ---------- 新建项目 ---------- */
function newProject() {
  const p = projectState;
  p.projectId = uid();
  p.subjectType = 'pet';
  p.sourceImage = '';
  p.ipName = '';
  p.keywords = [];
  p.mainColor = '#F6CF58';
  p.keepFeatures = '';
  p.style = 'Flat Toon';
  p.generatedOptions = [];
  p.selectedIP = '';
  p.scene = 'Daily';
  p.customScene = { where: '', what: '', elements: '', details: '' };
  p.selectedProducts = [];
  p.canvasState = { productId: '', html: '' };
  p.updatedAt = new Date().toISOString();
  saveRecent();
}

/* ---------- 最近项目：刷新恢复 ---------- */
function saveRecent() {
  const p = projectState;
  p.updatedAt = new Date().toISOString();
  writeJSON(RECENT_KEY, cloneState());
}

function loadRecent() {
  const saved = readJSON(RECENT_KEY, null);
  if (saved) {
    Object.keys(projectState).forEach(k => {
      if (saved[k] !== undefined) projectState[k] = saved[k];
    });
    return true;
  }
  return false;
}

/* ---------- 项目库：保存 / 读取 / 打开 / 删除 ---------- */
function listLibrary() {
  return readJSON(STORAGE_KEY, []);
}

function saveToLibrary() {
  const arr = listLibrary();
  const snapshot = cloneState();
  snapshot.updatedAt = new Date().toISOString();
  const idx = arr.findIndex(x => x.projectId === snapshot.projectId);
  if (idx >= 0) {
    arr[idx] = snapshot;
  } else {
    arr.unshift(snapshot);
  }
  // 限制数量，避免 localStorage 溢出
  const trimmed = arr.slice(0, 20);
  writeJSON(STORAGE_KEY, trimmed);
  saveRecent();
}

function deleteFromLibrary(id) {
  const arr = listLibrary().filter(x => x.projectId !== id);
  writeJSON(STORAGE_KEY, arr);
}

function openProject(id) {
  const found = listLibrary().find(x => x.projectId === id);
  if (!found) return false;
  Object.keys(projectState).forEach(k => {
    if (found[k] !== undefined) projectState[k] = found[k];
  });
  saveRecent();
  return true;
}

function libraryItemById(id) {
  return listLibrary().find(x => x.projectId === id);
}