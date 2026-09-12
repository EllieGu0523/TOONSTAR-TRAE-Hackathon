/* ============================================================
 * ToonStar V2.0 — data.js
 * 内容体系：主体类型 / 风格 / 场景 / 6 类文创商品 / 推荐
 * ============================================================ */

/* 7.1 主体类型 */
const SUBJECT_TYPES = [
  { id: 'me',     en: 'Me',     zh: '我',      hint: '自拍、穿搭、毕业照、朋友合照' },
  { id: 'pet',    en: 'Pet',    zh: '宠物',   hint: '猫、狗、兔、鸟等；留意耳朵 / 花纹 / 项圈' },
  { id: 'object', en: 'Object', zh: '物品',   hint: '相机、咖啡杯、玩具、产品、收藏品' },
  { id: 'memory', en: 'Memory', zh: '记忆',   hint: '旅行、校园、生日、城市地标照片' }
];

/* 7.2 风格 */
const STYLES = [
  { id: 'Flat Toon',    zh: '扁平 IP 插画', tagline: '极简 / 圆润 / 品牌化', bg: 'linear-gradient(135deg,#ffe5a5,#f3b8c7 50%,#b8d7a5)' },
  { id: 'Paper Cut',    zh: '纸艺拼贴',     tagline: '撕纸 / 手工 / 层叠',   bg: 'linear-gradient(35deg,#e6efdd 0 35%,#f3cbb7 35% 62%,#9ec59b 62%)' },
  { id: 'Soft Toy',     zh: '软立体',       tagline: '棉感 / 黏土 / 玩具材质', bg: 'radial-gradient(circle at 50% 50%,#e4c2a4 0 25%,#f1d98c 26% 49%,#e0eff6 50%)' },
  { id: 'Retro Graphic', zh: '复古平面',    tagline: 'Riso / 套色 / 颗粒',   bg: 'repeating-linear-gradient(45deg,#b78962 0 12px,#ead28c 12px 24px,#71997f 24px 36px)' }
];

/* 7.3 场景 */
const SCENES = [
  { id: 'Daily',    zh: '日常',  bg: 'linear-gradient(180deg,#fff0c9 0 58%,#9bc4b6 58%)' },
  { id: 'Travel',   zh: '旅行',  bg: 'linear-gradient(180deg,#b9ddeb 0 58%,#e8d2a5 58%)' },
  { id: 'Birthday', zh: '生日',  bg: 'linear-gradient(180deg,#f5c5d2 0 58%,#f6dda5 58%)' },
  { id: 'Cafe',     zh: '咖啡',  bg: 'linear-gradient(180deg,#e7ddd1 0 58%,#a57f64 58%)' },
  { id: 'Campus',   zh: '校园',  bg: 'linear-gradient(180deg,#cbe3c8 0 58%,#e8d2a5 58%)' },
  { id: 'Home',     zh: '居家',  bg: 'linear-gradient(180deg,#f6e2c9 0 58%,#c8a97c 58%)' },
  { id: 'Custom',   zh: '自定义', bg: 'linear-gradient(180deg,#dcebf5,#f6e7c6)' }
];

/* 7.4 商品分类（一级分类 + 二级商品）。
 * shape 决定 Mockup 的外形：square / circle / tall / wide / bag / phone / mug / stand / tag
 */
const PRODUCT_CATEGORIES = [
  {
    id: 'paper', en: 'Paper & Stationery', zh: '纸品文具',
    products: [
      { id: 'sticker',   en: 'Sticker',       zh: '贴纸',     shape: 'square', note: '主图 / 短文字 / 装饰' },
      { id: 'postcard',  en: 'Postcard',      zh: '明信片',   shape: 'wide',   note: '横向排版 / 时间地点' },
      { id: 'bookmark',  en: 'Bookmark',      zh: '书签',     shape: 'tall',   note: '竖向条 / 主图居中' },
      { id: 'notebook',  en: 'Notebook',      zh: '笔记本',   shape: 'square', note: '封面主图 / 标题' }
    ]
  },
  {
    id: 'bags', en: 'Bags & Carry', zh: '包袋出行',
    products: [
      { id: 'tote-bag',  en: 'Tote Bag',      zh: '帆布袋',   shape: 'bag',    note: '照片 / 文字 / 自由排版' },
      { id: 'pouch',     en: 'Pouch',         zh: '收纳袋',   shape: 'square', note: '主图 / 短文字 / 拉链' },
      { id: 'luggage-tag', en: 'Luggage Tag', zh: '行李牌',   shape: 'tag',    note: '信息卡 / 主图' }
    ]
  },
  {
    id: 'desk', en: 'Desk & Home', zh: '桌面家居',
    products: [
      { id: 'coaster',   en: 'Coaster',       zh: '杯垫',     shape: 'circle', note: '圆形主图' },
      { id: 'mug',       en: 'Mug',           zh: '马克杯',   shape: 'mug',    note: '杯身主图' },
      { id: 'fridge-magnet', en: 'Fridge Magnet', zh: '冰箱贴', shape: 'square', note: '方形主图 / 磁贴' },
      { id: 'desk-stand', en: 'Desk Stand',   zh: '桌面摆件', shape: 'stand',  note: '亚克力立牌 / 底座' }
    ]
  },
  {
    id: 'phone', en: 'Phone', zh: '手机配件',
    products: [
      { id: 'phone-case', en: 'Phone Case',   zh: '手机壳',   shape: 'phone',  note: '竖屏主图 / 摄像头开孔' },
      { id: 'pop-grip',   en: 'Pop Grip',     zh: '气囊支架', shape: 'circle', note: '圆形图案' },
      { id: 'phone-strap', en: 'Phone Strap', zh: '手机挂绳', shape: 'tall',   note: '吊坠 / 主图' }
    ]
  },
  {
    id: 'accessories', en: 'Accessories', zh: '小配饰',
    products: [
      { id: 'keychain',  en: 'Keychain',      zh: '钥匙扣',   shape: 'circle', note: '圆形挂件 / 钥匙环' },
      { id: 'badge',     en: 'Badge',         zh: '徽章',     shape: 'circle', note: '圆形徽章' },
      { id: 'brooch',    en: 'Brooch',        zh: '胸针',     shape: 'circle', note: '小圆胸针' },
      { id: 'acrylic-charm', en: 'Acrylic Charm', zh: '亚克力挂件', shape: 'stand', note: '亚克力挂件 / 透明' }
    ]
  },
  {
    id: 'fun', en: 'Fun Gifts', zh: '趣味礼物',
    products: [
      { id: 'pet-tag',   en: 'Pet Tag',       zh: '宠物牌',   shape: 'tag',    note: '身份牌 / 宠物名' },
      { id: 'meme-doll', en: 'Meme Doll',     zh: '抽象小娃', shape: 'tall',   note: '比例 / 姿势 / 玩梗' },
      { id: 'gift-card', en: 'Gift Card',     zh: '纪念小卡', shape: 'wide',   note: '卡片 / 祝福语' }
    ]
  }
];

/* 推荐组合：一键加入 3 个商品 */
const RECOMMENDED_IDS = ['sticker', 'tote-bag', 'phone-case'];

/* 用于跨分类查找商品 */
function findProduct(id) {
  for (const cat of PRODUCT_CATEGORIES) {
    const p = cat.products.find(x => x.id === id);
    if (p) return { category: cat, product: p };
  }
  return null;
}

function categoryOfProduct(id) {
  const hit = findProduct(id);
  return hit ? hit.category : null;
}

function allProducts() {
  return PRODUCT_CATEGORIES.reduce((acc, c) => acc.concat(c.products.map(p => p.id)), []);
}