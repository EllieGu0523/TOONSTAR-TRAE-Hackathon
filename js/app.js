/* ============================================================
 * ToonStar V2.0 — app.js
 * 路由 + 各页渲染与交互 + 商品 Mockup
 * ============================================================ */

const FLOW = ['upload', 'style', 'createip', 'scene', 'products', 'customize', 'final'];
const FLOW_NAMES = ['Upload', 'Style', 'Create IP', 'Scene', 'Products', 'Customize', 'Preview'];
const FLOW_ZH = ['上传', '风格', '生成 IP', '场景', '商品', '编辑', '预览'];
const FLOW_INDEX = Object.fromEntries(FLOW.map((x, i) => [x, i]));

function flowIndex(id) {
  if (id === 'basepreview') return FLOW_INDEX['products'];
  return FLOW_INDEX[id] !== undefined ? FLOW_INDEX[id] : 0;
}

/* ---------- 通用 UI ---------- */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => t.classList.remove('show'), 1800);
}

function showModal(title, text) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalText').textContent = text;
  document.getElementById('modal').classList.add('show');
}

function closeModal() {
  document.getElementById('modal').classList.remove('show');
}

/* ---------- 路由 ---------- */
function go(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === id));
  document.querySelectorAll('[data-nav]').forEach(n => {
    const on = n.dataset.nav === id ||
      (n.dataset.nav === 'upload' && FLOW.includes(id)) ||
      (n.dataset.nav === 'home' && id === 'home');
    n.classList.toggle('active', on);
  });
  if (id === 'upload') renderUpload();
  if (id === 'style') renderStyle();
  if (id === 'createip') renderCreateIP();
  if (id === 'scene') renderScene();
  if (id === 'products') renderProducts();
  if (id === 'basepreview') renderBasePreview();
  if (id === 'customize') renderCustomize();
  if (id === 'final') renderFinal();
  if (id === 'collection') renderCollection();
  location.hash = id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderProgress(id) {
  const cur = flowIndex(id);
  const box = document.getElementById('prog-' + id);
  if (!box) return;
  box.innerHTML = FLOW.map((x, i) =>
    `<div class="step ${i < cur ? 'done' : i === cur ? 'on' : ''}">` +
    `<span class="n">${i < cur ? '✓' : i + 1}</span>` +
    `<span class="label"><b>${FLOW_NAMES[i]}</b><small>${FLOW_ZH[i]}</small></span></div>` +
    (i < FLOW.length - 1 ? '<div class="pline"></div>' : '')
  ).join('');
}

/* ============================================================
 * 图片工具
 * ============================================================ */
function fileToDataURL(file, maxSize = 640, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ============================================================
 * Mockup 渲染（同一 IP 自动适配到不同商品模板）
 * ============================================================ */
function mockupHTML(shape, ipUrl, sizeClass) {
  const ip = ipUrl ? `<img class="mk-ip" src="${ipUrl}" alt="IP">` : '';
  return `<div class="mk ${sizeClass || ''}"><div class="mk-shape mk-${shape}">${ip}</div></div>`;
}

/* ============================================================
 * Upload 页
 * ============================================================ */
function renderUpload() {
  renderProgress('upload');
  const types = document.getElementById('subjectTypes');
  types.innerHTML = SUBJECT_TYPES.map(t =>
    `<button class="subject-type ${projectState.subjectType === t.id ? 'active' : ''}" data-subject="${t.id}">` +
    `<strong>${t.en}</strong><span>${t.zh}</span></button>`
  ).join('');
  types.querySelectorAll('.subject-type').forEach(b => b.onclick = () => {
    projectState.subjectType = b.dataset.subject;
    types.querySelectorAll('.subject-type').forEach(x => x.classList.toggle('active', x === b));
    renderSubjectHint();
    saveRecent();
  });

  document.getElementById('ipName').value = projectState.ipName || '';
  document.getElementById('keywords').value = (projectState.keywords || []).join(', ');
  document.getElementById('mainColor').value = projectState.mainColor || '#F6CF58';
  document.getElementById('keepFeatures').value = projectState.keepFeatures || '';

  // 预览已上传
  const preview = document.getElementById('photoPreview');
  const upui = document.getElementById('uploadUI');
  if (projectState.sourceImage) {
    preview.src = projectState.sourceImage;
    preview.style.display = 'block';
    upui.style.display = 'none';
  } else {
    preview.style.display = 'none';
    upui.style.display = '';
  }
  renderSubjectHint();
}

function renderSubjectHint() {
  const t = SUBJECT_TYPES.find(x => x.id === projectState.subjectType);
  const el = document.getElementById('subjectHint');
  if (el) el.textContent = t ? t.hint : '';
}

function useFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  fileToDataURL(file).then(dataURL => {
    projectState.sourceImage = dataURL;
    const preview = document.getElementById('photoPreview');
    preview.src = dataURL;
    preview.style.display = 'block';
    document.getElementById('uploadUI').style.display = 'none';
    saveRecent();
    showToast('照片已载入');
  }).catch(() => showToast('图片读取失败'));
}

function collectDNA() {
  projectState.ipName = document.getElementById('ipName').value.trim();
  projectState.keywords = document.getElementById('keywords').value.split(/[,，\s]+/)
    .map(s => s.trim()).filter(Boolean).slice(0, 3);
  projectState.mainColor = document.getElementById('mainColor').value;
  projectState.keepFeatures = document.getElementById('keepFeatures').value.trim();
}

function onUploadContinue() {
  collectDNA();
  saveRecent();
  go('style');
}

/* ============================================================
 * Style 页
 * ============================================================ */
function renderStyle() {
  renderProgress('style');
  const grid = document.getElementById('styleGrid');
  grid.innerHTML = STYLES.map(s =>
    `<button class="style-card ${projectState.style === s.id ? 'active' : ''}" data-style="${s.id}">` +
    `<div class="style-visual" style="background:${s.bg}"></div>` +
    `<strong>${s.id}</strong><small>${s.zh}</small><em>${s.tagline}</em></button>`
  ).join('');
  grid.querySelectorAll('.style-card').forEach(c => c.onclick = () => {
    projectState.style = c.dataset.style;
    grid.querySelectorAll('.style-card').forEach(x => x.classList.toggle('active', x === c));
    saveRecent();
  });
}

/* ============================================================
 * Create IP 页
 * ============================================================ */
function renderCreateIP() {
  renderProgress('createip');
  const statusEl = document.getElementById('ipStatus');
  const grid = document.getElementById('ipGrid');

  // 展示 IP DNA 摘要
  document.getElementById('dnaSubject').value =
    (SUBJECT_TYPES.find(x => x.id === projectState.subjectType) || {}).en || projectState.subjectType;
  document.getElementById('dnaStyle').value = projectState.style || 'Flat Toon';
  document.getElementById('dnaColor').style.background = projectState.mainColor || '#F6CF58';
  document.getElementById('dnaColorHex').textContent = projectState.mainColor || '#F6CF58';
  document.getElementById('dnaKeep').value = projectState.keepFeatures || '';

  // 已有结果则直接渲染（后续页面禁止重新生成，始终复用 selectedIP）
  if (projectState.generatedOptions.length) {
    renderIPGrid(grid);
    return;
  }
  runGenerateIP();
}

function runGenerateIP() {
  const statusEl = document.getElementById('ipStatus');
  const grid = document.getElementById('ipGrid');
  grid.innerHTML = '<div class="gen-loading">正在生成 3 个 IP 方案…</div>';

  const payload = {
    photo: projectState.sourceImage || '',
    subjectType: projectState.subjectType,
    style: projectState.style,
    dna: {
      ipName: projectState.ipName,
      keywords: projectState.keywords,
      mainColor: projectState.mainColor,
      keepFeatures: projectState.keepFeatures
    }
  };

  generateIP(payload, status => {
    const map = { loading: '正在生成…', success: '生成成功', error: '生成失败，使用示例', fallback: '已使用演示结果（离线/超时）' };
    if (statusEl) statusEl.textContent = map[status] || '';
    if (statusEl) statusEl.className = 'gen-status ' + status;
  }).then(res => {
    projectState.generatedOptions = res.urls.map((url, i) => ({ id: 'ABC'[i], url }));
    // 若尚未选择，默认保持未选；打开旧项目时选中已有 selectedIP
    if (!projectState.selectedIP && res.urls.length) {
      // 不自动选中，让评委主动选；但保留默认 A 便于流畅演示
      projectState.selectedIP = res.urls[0];
    }
    saveRecent();
    renderIPGrid(grid);
  });
}

function renderIPGrid(grid) {
  grid.innerHTML = projectState.generatedOptions.map(opt => {
    const active = projectState.selectedIP === opt.url;
    return `<button class="result-option ${active ? 'active' : ''}" data-id="${opt.id}" data-url="${opt.url}">` +
      `${active ? '<span class="status-pill">Selected</span>' : ''}` +
      `<div class="ip-preview"><img src="${opt.url}" alt="Design ${opt.id}"></div>` +
      `<strong>Design ${opt.id}</strong></button>`;
  }).join('');
  grid.querySelectorAll('.result-option').forEach(c => c.onclick = () => {
    projectState.selectedIP = c.dataset.url;
    renderIPGrid(grid);
    saveRecent();
    showToast('已选择 Design ' + c.dataset.id);
  });
}

function onRegenerate() {
  projectState.generatedOptions = [];
  projectState.selectedIP = '';
  runGenerateIP();
}

/* ============================================================
 * Scene 页
 * ============================================================ */
function renderScene() {
  renderProgress('scene');
  const tabs = document.getElementById('sceneTabs');
  tabs.innerHTML = SCENES.map(s =>
    `<button class="scene ${projectState.scene === s.id ? 'active' : ''} ${s.id === 'Custom' ? 'custom' : ''}" data-scene="${s.id}">` +
    `${s.id === 'Custom' ? '＋ Design Your Own' : s.id}<small>${s.zh}</small></button>`
  ).join('');
  tabs.querySelectorAll('.scene').forEach(c => c.onclick = () => {
    projectState.scene = c.dataset.scene;
    tabs.querySelectorAll('.scene').forEach(x => x.classList.toggle('active', x === c));
    renderScene();  // 刷新预览 + 自定义表单显隐
    saveRecent();
  });

  const theme = SCENES.find(s => s.id === projectState.scene) || SCENES[0];
  const prev = document.getElementById('scenePreview');
  prev.style.background = theme.bg;
  const ipBox = document.getElementById('sceneIp');
  if (projectState.selectedIP) {
    ipBox.innerHTML = `<img src="${projectState.selectedIP}" alt="${projectState.ipName || 'IP'}">`;
    ipBox.style.display = 'block';
  } else {
    ipBox.style.display = 'none';
  }

  // 自定义场景表单
  const custom = document.getElementById('customSceneFields');
  custom.style.display = projectState.scene === 'Custom' ? 'block' : 'none';
  const empty = document.getElementById('customSceneEmpty');
  if (empty) empty.style.display = projectState.scene === 'Custom' ? 'none' : 'block';
  if (projectState.scene === 'Custom') {
    document.getElementById('sceneWhere').value = projectState.customScene.where || '';
    document.getElementById('sceneWhat').value = projectState.customScene.what || '';
    document.getElementById('sceneElements').value = projectState.customScene.elements || '';
    document.getElementById('sceneDetails').value = projectState.customScene.details || '';
  }
}

function onSceneContinue() {
  if (projectState.scene === 'Custom') {
    projectState.customScene = {
      where: document.getElementById('sceneWhere').value.trim(),
      what: document.getElementById('sceneWhat').value.trim(),
      elements: document.getElementById('sceneElements').value.trim(),
      details: document.getElementById('sceneDetails').value.trim()
    };
  }
  saveRecent();
  go('products');
}

/* ============================================================
 * Products 页
 * ============================================================ */
let currentCat = PRODUCT_CATEGORIES[0].id;

function renderProducts() {
  renderProgress('products');
  renderCats();
  renderProductGrid();
  renderTags();
}

function renderCats() {
  const box = document.getElementById('catTabs');
  box.innerHTML = PRODUCT_CATEGORIES.map(c =>
    `<button class="cat ${c.id === currentCat ? 'active' : ''}" data-cat="${c.id}">` +
    `<div class="en-zh"><strong>${c.en}</strong><span>${c.zh}</span></div></button>`
  ).join('');
  box.querySelectorAll('.cat').forEach(b => b.onclick = () => {
    currentCat = b.dataset.cat;
    renderCats();
    renderProductGrid();
  });
}

function renderProductGrid() {
  const cat = PRODUCT_CATEGORIES.find(c => c.id === currentCat);
  const box = document.getElementById('productGrid');
  box.innerHTML = cat.products.map(p => {
    const on = projectState.selectedProducts.includes(p.id);
    return `<button class="product ${on ? 'active' : ''}" data-product="${p.id}">` +
      `<span class="mark">${on ? '✓' : ''}</span>` +
      `<div class="prod-icon">${mockupHTML(p.shape, projectState.selectedIP, 'mk-sm')}</div>` +
      `<div class="prod-meta"><strong>${p.en}</strong><small class="zh">${p.zh}</small><small>${p.note}</small></div></button>`;
  }).join('');
  box.querySelectorAll('.product').forEach(b => b.onclick = () => {
    const id = b.dataset.product;
    projectState.selectedProducts = projectState.selectedProducts.includes(id)
      ? projectState.selectedProducts.filter(x => x !== id)
      : projectState.selectedProducts.concat(id);
    renderProductGrid();
    renderTags();
    saveRecent();
  });
}

function renderTags() {
  const box = document.getElementById('selectedTags');
  if (!projectState.selectedProducts.length) {
    box.innerHTML = '<span class="tag">尚未选择</span>';
    return;
  }
  box.innerHTML = projectState.selectedProducts.map(id => {
    const hit = findProduct(id);
    const name = hit ? hit.product.zh : id;
    return `<span class="tag">${name} ×</span>`;
  }).join('');
}

function onRecommended() {
  RECOMMENDED_IDS.forEach(id => {
    if (!projectState.selectedProducts.includes(id)) projectState.selectedProducts.push(id);
  });
  saveRecent();
  renderProductGrid();
  renderTags();
  showToast('已为你加入 3 个推荐商品');
}

/* ============================================================
 * Base Preview 页
 * ============================================================ */
function renderBasePreview() {
  renderProgress('basepreview');
  const box = document.getElementById('previewGrid');
  const ids = projectState.selectedProducts.length ? projectState.selectedProducts : ['sticker', 'tote-bag', 'phone-case'];
  box.innerHTML = ids.map(id => {
    const hit = findProduct(id);
    const p = hit ? hit.product : { en: id, zh: id, shape: 'square', note: '' };
    return `<div class="preview-card">${mockupHTML(p.shape, projectState.selectedIP)}` +
      `<strong>${p.en}</strong><small>${p.zh} · ${p.note}</small>` +
      `<div class="actions" style="margin-top:9px"><button class="btn sm primary" data-customize="${id}">Customize</button></div></div>`;
  }).join('');
  box.querySelectorAll('[data-customize]').forEach(b => b.onclick = () => {
    // 切换编辑对象时，重置画布，避免复用上一商品的历史画布
    projectState.canvasState = { productId: b.dataset.customize, html: '' };
    go('customize');
  });
}

/* ============================================================
 * Customize 页（编辑器）
 * ============================================================ */
function renderCustomize() {
  renderProgress('customize');
  const productId = projectState.canvasState.productId ||
    projectState.selectedProducts[0] || 'sticker';
  projectState.canvasState.productId = productId;

  const hit = findProduct(productId);
  const p = hit ? hit.product : { en: productId, zh: '', shape: 'square' };
  document.getElementById('editingLabel').textContent = `${p.en}${p.zh ? ' / ' + p.zh : ''}`;

  const stage = document.getElementById('stage');
  const surface = document.getElementById('surface');

  // 初始化编辑器与商品底
  Editor.init(stage, surface);
  surface.className = 'canvas-surface';

  // 恢复已保存画布，否则重建默认画布
  if (projectState.canvasState.html) {
    Editor.restoreHTML(projectState.canvasState.html);
  } else {
    buildDefaultCanvas(p);
  }
}

function buildDefaultCanvas(p) {
  const stage = document.getElementById('stage');
  const surface = document.getElementById('surface');
  // 仅移除图层，保留背景 surface
  stage.querySelectorAll('.layer').forEach(l => l.remove());
  const name = projectState.ipName || p.en || 'MY IP';
  const dateLine = (document.getElementById('dateInput') && document.getElementById('dateInput').value)
    ? document.getElementById('dateInput').value
    : (new Date().getFullYear() + '.01.01');

  const headline = document.createElement('div');
  headline.className = 'layer text-layer';
  headline.setAttribute('data-role', 'headline');
  headline.textContent = name.toUpperCase().slice(0, 12);
  headline.style.left = '52px'; headline.style.top = '40px'; headline.style.fontSize = '34px';
  headline.style.color = '#28344f';
  stage.appendChild(headline);

  if (projectState.selectedIP) {
    const ip = document.createElement('div');
    ip.className = 'layer photo-layer';
    ip.setAttribute('data-role', 'ip');
    ip.innerHTML = `<img src="${projectState.selectedIP}" alt="${name}">`;
    ip.style.left = '150px'; ip.style.top = '150px';
    stage.appendChild(ip);
  }

  const date = document.createElement('div');
  date.className = 'layer text-layer';
  date.setAttribute('data-role', 'date');
  date.textContent = dateLine;
  date.style.left = '64px'; date.style.top = '330px'; date.style.fontSize = '16px';
  date.style.color = '#5f4334';
  stage.appendChild(date);

  const star = document.createElement('div');
  star.className = 'layer sticker-layer';
  star.setAttribute('data-role', 'decor');
  star.textContent = '✦';
  star.style.left = '70px'; star.style.top = '110px'; star.style.fontSize = '36px';
  star.style.color = '#28344f';
  stage.appendChild(star);

  // 重置编辑器并绑定图层交互（restoreHTML 内部会 wireLayers + persist）
  Editor.init(stage, surface);
  Editor.restoreHTML(stage.innerHTML);
  Editor.selectLayer(headline);
}

function onExportPNG() {
  Editor.exportPNG(projectState.ipName || 'toonstar-design')
    .then(ok => showToast(ok ? '已导出 PNG' : '导出失败，请重试'));
}

/* ============================================================
 * Final 页
 * ============================================================ */
function renderFinal() {
  const ids = projectState.selectedProducts.length ? projectState.selectedProducts : ['sticker', 'tote-bag', 'phone-case'];
  const mainId = ids[0];
  const main = document.getElementById('finalMain');
  main.innerHTML = `<div class="mockup-label">MAIN PRODUCT</div>` + mockupHTML(
    (findProduct(mainId) || { product: { shape: 'square' } }).product.shape, projectState.selectedIP, 'mk-xl'
  ) + `<div class="mockup-name">${(findProduct(mainId) || { product: { en: mainId } }).product.en}</div>`;

  const side = document.getElementById('finalSide');
  side.innerHTML = ids.slice(1, 3).map(id => {
    const p = (findProduct(id) || { product: { shape: 'square', en: id } }).product;
    return `<div>${mockupHTML(p.shape, projectState.selectedIP)}<div class="mockup-name">${p.en}</div></div>`;
  }).join('');
}

function onSaveProject() {
  if (!projectState.ipName && !projectState.sourceImage) {
    projectState.ipName = 'Unnamed IP';
  }
  saveToLibrary();
  showToast('已保存到 My ToonStars');
  go('collection');
}

/* ============================================================
 * Collection 页（My ToonStars）
 * ============================================================ */
function renderCollection() {
  const grid = document.getElementById('collectionGrid');
  const arr = listLibrary();
  const items = arr.map(p => {
    const ipImg = p.selectedIP ? `<img src="${p.selectedIP}" alt="IP">` : '<span class="ph">IP</span>';
    const prodNames = (p.selectedProducts || []).map(id => {
      const h = findProduct(id);
      return h ? h.product.zh : id;
    }).join(' · ').slice(0, 40);
    const date = p.updatedAt ? new Date(p.updatedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
    return `<article class="project saved" data-id="${p.projectId}">` +
      `<div class="project-thumb">${ipImg}</div>` +
      `<div class="project-meta"><strong>${p.ipName || 'Unnamed IP'}</strong>` +
      `<small>${p.subjectType ? p.subjectType.toUpperCase() : ''} · ${p.style || ''}</small>` +
      `<small>${prodNames || '未选择商品'}</small>` +
      `<small>${date}</small></div></article>`;
  }).join('');

  grid.innerHTML = items +
    `<article class="empty-project"><button class="btn ghost" data-new>＋ Create New Project</button></article>`;

  grid.querySelectorAll('.project[data-id]').forEach(a => a.onclick = () => {
    if (openProject(a.dataset.id)) {
      showToast('已打开项目');
      go('final');
    }
  });
  grid.querySelectorAll('[data-new]').forEach(b => b.onclick = () => {
    newProject();
    go('upload');
  });
}

/* ============================================================
 * 启动
 * ============================================================ */
function boot() {
  loadRecent();  // 刷新后恢复最近项目
  // 绑定全局（editor.js 依赖）
  window.showToast = showToast;

  initTabs();

  // Upload
  const dz = document.getElementById('dropzone');
  const inp = document.getElementById('photoInput');
  inp.addEventListener('change', e => useFile(e.target.files[0]));
  ['dragenter', 'dragover'].forEach(x => dz.addEventListener(x, e => { e.preventDefault(); dz.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach(x => dz.addEventListener(x, e => { e.preventDefault(); dz.classList.remove('drag'); }));
  dz.addEventListener('drop', e => useFile(e.dataTransfer.files[0]));

  // Upload 字段实时保存
  ['ipName', 'keywords', 'mainColor', 'keepFeatures'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => { collectDNA(); saveRecent(); });
  });

  // 编辑器控件
  document.getElementById('editorUpload').addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    fileToDataURL(f, 400).then(url => {
      Editor.addImage(url, 60, 160, '');
      showToast('照片已添加');
    });
  });
  document.getElementById('opacityRange').addEventListener('input', e => {
    document.getElementById('opacityValue').textContent = e.target.value + '%';
    Editor.setOpacity(Number(e.target.value));
  });
  document.getElementById('newText').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTextFromInput();
  });
  document.getElementById('fontSize').addEventListener('input', e => Editor.setFontSize(Number(e.target.value)));
  document.getElementById('fontColor').addEventListener('input', e => Editor.setColor(e.target.value));
  document.getElementById('decorSize').addEventListener('input', e => {
    document.getElementById('decorSizeVal').textContent = e.target.value;
    Editor.setStickerSize(Number(e.target.value));
  });

  // 渲染进度条
  ['upload', 'style', 'createip', 'scene', 'products', 'basepreview', 'customize'].forEach(id => renderProgress(id));

  // 初始路由（hash 或 home）
  const start = location.hash.slice(1);
  if (start && document.getElementById(start)) go(start);
  else go('home');

  window.addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (id && document.getElementById(id)) go(id);
  });
}

function addTextFromInput() {
  const val = document.getElementById('newText').value.trim();
  if (!val) return;
  Editor.addText(val, 100, 230, Number(document.getElementById('fontSize').value) || 28);
  document.getElementById('newText').value = '';
}

/* ---------- 编辑器全局包装（供 index.html 内联 onclick 调用） ---------- */
function undo() { Editor.undo(); }
function redo() { Editor.redo(); }
function deleteSelected() { Editor.deleteSelected(); }
function moveFront() { Editor.moveFront(); }
function addText() { addTextFromInput(); }
function addCharacter() {
  if (!projectState.selectedIP) { showToast('先生成并选择 IP 方案'); return; }
  Editor.addImage(projectState.selectedIP, 150, 150, 'IP');
}
function addOriginalPhoto() {
  if (!projectState.sourceImage) { showToast('尚未上传照片'); return; }
  Editor.addImage(projectState.sourceImage, 60, 160, 'PHOTO');
}
function addSticker(txt) {
  Editor.addSticker(txt, 265, 85, Number(document.getElementById('decorSize').value) || 36);
}
function setFont(f) { Editor.setFont(f); }
function setFontSizeVal(px) { Editor.setFontSize(Number(px)); }
function alignText(a) { Editor.alignText(a); }
function rotateSelected(d) { Editor.rotateSelected(d); }
function applyLayout(t) { Editor.applyLayout(t); }
function setBagColor(c) { Editor.setSurfaceColor(c); }

function resetCanvas() {
  const productId = projectState.canvasState.productId || projectState.selectedProducts[0] || 'sticker';
  const hit = findProduct(productId);
  const p = hit ? hit.product : { en: productId, zh: '', shape: 'square' };
  buildDefaultCanvas(p);
  showToast('画布已重置');
}

/* 编辑器 Tab 切换 */
function initTabs() {
  document.querySelectorAll('.tab').forEach(b => b.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const panel = document.getElementById('panel-' + b.dataset.panel);
    if (panel) panel.classList.add('active');
  });
}

/* editor.js 需要的一个公开口（applyLayout 等通过 onclick 调用） */
document.addEventListener('DOMContentLoaded', boot);