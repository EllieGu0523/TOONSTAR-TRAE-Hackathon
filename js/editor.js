/* ============================================================
 * ToonStar V2.0 — editor.js
 * 编辑器：拖拽 / 删除 / 置顶 / Undo / Redo / Reset / 布局 / 导出 PNG
 * 所有操作在浏览器完成，画布状态写回 projectState.canvasState
 * ============================================================ */

const Editor = (() => {
  let stage = null;        // #stage 拖拽容器
  let surface = null;      // #surface 商品底
  let selectedLayer = null;
  let history = [];
  let redoStack = [];

  const MAX_HISTORY = 40;

  /* ---------- 初始化与状态 ---------- */
  function init(stageEl, surfaceEl) {
    stage = stageEl;
    surface = surfaceEl;
    selectedLayer = null;
    history = [];
    redoStack = [];
  }

  function snapshot() {
    if (!stage) return;
    history.push(stage.innerHTML);
    if (history.length > MAX_HISTORY) history.shift();
    redoStack = [];
    persist();
  }

  function persist() {
    if (!stage) return;
    projectState.canvasState.html = stage.innerHTML;
    if (typeof saveRecent === 'function') saveRecent();
  }

  function restoreHTML(html) {
    stage.innerHTML = html;
    wireLayers();
    selectedLayer = null;
    persist();
  }

  function setSurfaceHTML(html) {
    const s = liveSurface();
    if (s) s.innerHTML = html;
  }

  /* ---------- 图层 ---------- */
  function makeDraggable(el) {
    el.addEventListener('pointerdown', e => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      e.preventDefault();
      selectLayer(el);
      snapshot();
      const sx = e.clientX, sy = e.clientY;
      const l = parseFloat(el.style.left) || 0;
      const t = parseFloat(el.style.top) || 0;
      const move = ev => {
        el.style.left = l + ev.clientX - sx + 'px';
        el.style.top = t + ev.clientY - sy + 'px';
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        persist();
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });
    el.addEventListener('click', () => selectLayer(el));
  }

  function wireLayers() {
    stage.querySelectorAll('.layer').forEach(makeDraggable);
  }

  function selectLayer(el) {
    stage.querySelectorAll('.layer').forEach(x => x.classList.remove('selected'));
    selectedLayer = el;
    if (el) el.classList.add('selected');
  }

  function addLayer(el, x, y) {
    snapshot();
    el.classList.add('layer');
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    stage.appendChild(el);
    makeDraggable(el);
    selectLayer(el);
    return el;
  }

  /* ---------- 命令 ---------- */
  function undo() {
    if (!history.length) return;
    redoStack.push(stage.innerHTML);
    restoreHTML(history.pop());
    if (typeof window.showToast === 'function') window.showToast('已撤销');
  }

  function redo() {
    if (!redoStack.length) return;
    history.push(stage.innerHTML);
    restoreHTML(redoStack.pop());
    if (typeof window.showToast === 'function') window.showToast('已重做');
  }

  function deleteSelected() {
    if (!selectedLayer) return;
    snapshot();
    selectedLayer.remove();
    selectedLayer = null;
  }

  function moveFront() {
    if (!selectedLayer) return;
    snapshot();
    stage.appendChild(selectedLayer);
  }

  function hasLayers() {
    return !!stage.querySelector('.layer');
  }

  /* ---------- 添加元素 ---------- */
  function addImage(url, x, y, label) {
    const d = document.createElement('div');
    d.className = 'layer photo-layer';
    d.innerHTML = url ? `<img src="${url}" alt="${label || ''}">` : (label || 'PHOTO');
    return addLayer(d, x, y);
  }

  function addText(text, x, y, size) {
    const d = document.createElement('div');
    d.className = 'layer text-layer';
    d.textContent = text;
    d.style.fontSize = (size || 28) + 'px';
    return addLayer(d, x, y);
  }

  function addSticker(chr, x, y, size) {
    const d = document.createElement('div');
    d.className = 'layer sticker-layer';
    d.textContent = chr;
    d.style.fontSize = (size || 36) + 'px';
    return addLayer(d, x, y);
  }

  /* ---------- 属性 ---------- */
  function setFont(font) {
    if (isText()) selectedLayer.style.fontFamily = font;
  }
  function setFontSize(px) {
    if (isText()) selectedLayer.style.fontSize = px + 'px';
  }
  function setColor(color) {
    if (selectedLayer) selectedLayer.style.color = color;
  }
  function setOpacity(v) {
    if (selectedLayer) selectedLayer.style.opacity = v / 100;
  }
  function alignText(align) {
    if (selectedLayer) selectedLayer.style.textAlign = align;
  }
  function rotateSelected(delta) {
    if (!selectedLayer) return;
    const cur = Number(selectedLayer.dataset.rot || 0) + delta;
    selectedLayer.dataset.rot = cur;
    selectedLayer.style.transform = `rotate(${cur}deg)`;
  }
  function setStickerSize(px) {
    if (selectedLayer && selectedLayer.classList.contains('sticker-layer')) {
      selectedLayer.style.fontSize = px + 'px';
    }
  }
  function isText() {
    return selectedLayer && selectedLayer.classList.contains('text-layer');
  }

  /* ---------- 布局模板（5 个） ---------- */
  function applyLayout(type) {
    const headline = stage.querySelector('.layer[data-role="headline"]');
    const date = stage.querySelector('.layer[data-role="date"]');
    const photo = stage.querySelector('.layer[data-role="ip"]') || stage.querySelector('.layer[data-role="photo"]');
    if (!headline && !date && !photo) return;
    snapshot();
    const L = {
      character: { h: [70, 56], p: [120, 150], d: [96, 330] },
      photo:     { h: [52, 56], p: [48, 156],  d: [200, 330] },
      event:     { h: [46, 80], p: [232, 160], d: [46, 300] },
      collage:   { h: [66, 52], p: [66, 168], d: [206, 330] },
      minimal:   { h: [96, 92], p: [136, 176], d: [122, 340] }
    }[type];
    if (!L) return;
    if (headline) { headline.style.left = L.h[0] + 'px'; headline.style.top = L.h[1] + 'px'; }
    if (photo) { photo.style.left = L.p[0] + 'px'; photo.style.top = L.p[1] + 'px'; }
    if (date) { date.style.left = L.d[0] + 'px'; date.style.top = L.d[1] + 'px'; }
    persist();
  }

  function setSurfaceColor(color) {
    const s = liveSurface();
    if (s) s.style.background = color;
  }

  function liveSurface() {
    return stage ? stage.querySelector('.canvas-surface') : null;
  }

  /* ---------- 导出 PNG ---------- */
  function exportPNG(filename) {
    if (!stage) return Promise.resolve(false);
    const name = (filename || 'toonstar-design') + '.png';
    if (window.html2canvas) {
      return html2canvas(stage, {
        backgroundColor: '#fffdf8',
        scale: 2,
        useCORS: true,
        allowTaint: true
      }).then(canvas => {
        downloadCanvas(canvas, name);
        return true;
      }).catch(() => fallbackExport(name));
    }
    return fallbackExport(name);
  }

  function fallbackExport(name) {
    // 极简 canvas 兜底：底 + 图层（无第三方库也能导出）
    try {
      const canvas = document.createElement('canvas');
      const w = stage.offsetWidth || 440;
      const h = stage.offsetHeight || 440;
      canvas.width = w * 2; canvas.height = h * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      const bg = getComputedStyle(stage).backgroundColor || '#f7eee2';
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      stage.querySelectorAll('.layer').forEach(el => {
        const x = parseFloat(el.style.left) || 0;
        const y = parseFloat(el.style.top) || 0;
        const img = el.querySelector('img');
        if (img && img.complete && img.naturalWidth) {
          const iw = el.offsetWidth, ih = el.offsetHeight;
          ctx.drawImage(img, x, y, iw, ih);
        } else {
          ctx.fillStyle = el.style.color || '#5f4334';
          ctx.font = (el.style.fontSize || '28px') + ' ' + (el.style.fontFamily || 'sans-serif');
          if (el.style.textAlign === 'center') ctx.textAlign = 'center';
          ctx.fillText(el.textContent || '', x, y + 28);
        }
      });
      downloadCanvas(canvas, name);
      return Promise.resolve(true);
    } catch (e) {
      console.warn('fallbackExport error', e);
      return Promise.resolve(false);
    }
  }

  function downloadCanvas(canvas, name) {
    const a = document.createElement('a');
    a.download = name;
    a.href = canvas.toDataURL('image/png');
    a.click();
  }

  return {
    init, snapshot, undo, redo, deleteSelected, moveFront, hasLayers,
    addImage, addText, addSticker,
    setFont, setFontSize, setColor, setOpacity, alignText, rotateSelected, setStickerSize,
    applyLayout, setSurfaceColor, setSurfaceHTML,
    selectLayer, restoreHTML, exportPNG, persist
  };
})();