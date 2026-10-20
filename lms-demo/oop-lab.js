/* =====================================================================
   OOP LAB — the four pillars, demonstrated on the live LMS model.
   Loaded after the main script in index.html, so it can use its classes
   (LibraryItem, Book, Member, …), the `library`/`controller` objects and
   helpers such as esc(), toast(), renderAll() and select().
   ===================================================================== */

const LAB = {
  open: false, tab: 'world', map: null,
  quiz: { a: {}, checked: false },
  enc: { key: 'm:S001', field: 'borrowedCount', mode: 'private', ghost: null, log: [] },
  inh: { sel: 'Book', cell: null, kind: 'item',
    item: { name: 'EBook', parent: 'Book', field: 'fileSizeMb', ftype: 'int', override: true, rate: '2' },
    member: { name: 'Visitor', parent: 'Member', limit: '1' }, out: null },
  poly: { days: 3, running: false, decl: 'LibraryItem', actual: 'Book' },
  abs: { level: 2, magOverride: true, roomLoan: true, roomReturn: true, log: [], mem: null },
  custom: {}, customMembers: {}
};
window.LAB_TYPES = {};
window.LAB_MEMBER_TYPES = {};

const lb = id => document.getElementById(id);
const capFirst = s => s.charAt(0).toUpperCase() + s.slice(1);
const an = w => (/^[AEIOU]/i.test(w) ? 'an ' : 'a ') + w;      // "an EBook", "a Book"
const isIdent = s => /^[A-Za-z_$][\w$]*$/.test(s);
const JAVA_KW = new Set('abstract boolean break byte case catch char class const continue default do double else enum extends final finally float for if implements import instanceof int interface long native new package private protected public return short static super switch this throw throws try void volatile while true false null'.split(' '));

/* ---------- Java syntax highlighter for the code boxes ---------- */
function hl(code){
  const re = /\/\/[^\n]*|"[^"\n]*"|@\w+|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b/g;
  let out = '', last = 0, m;
  while ((m = re.exec(code))){
    out += esc(code.slice(last, m.index)); const t = m[0]; last = m.index + t.length;
    const cls = t.startsWith('//') || t[0] === '@' ? 'cm' : t[0] === '"' ? 'st' : /^\d/.test(t) ? 'nu' : JAVA_KW.has(t) ? 'kw' : /^[A-Z]/.test(t) ? 'ty' : '';
    out += cls ? `<span class="${cls}">${esc(t)}</span>` : esc(t);
  }
  return out + esc(code.slice(last));
}
const codeBox = (code, extra = '') => `<div class="sig" ${extra}>${hl(code)}</div>`;

/* =====================================================================
   CLASS METADATA (the UML of the reference solution)
   ===================================================================== */
const F = (v, n, t, x = {}) => ({ kind: 'field', v, n, t, ...x });
const M = (v, n, t, x = {}) => ({ kind: 'method', v, n, t, ...x });
const CLASS_INFO = {
  Object: { parent: null, members: [M('+', 'toString()', 'String'), M('+', 'equals(Object)', 'boolean'), M('+', 'hashCode()', 'int')] },
  LibraryItem: { parent: 'Object', abstract: true, impl: ['Loanable'], members: [
    M('+', 'LibraryItem(String, String)', '', { ctor: true }),
    F('-', 'id', 'String'), F('-', 'title', 'String'), F('-', 'isBorrowed', 'boolean'), F('-', 'borrower', 'Member'),
    M('+', 'getId()', 'String'), M('+', 'getTitle()', 'String'), M('+', 'setTitle(String)', 'void'), M('+', 'isBorrowed()', 'boolean'), M('+', 'getBorrower()', 'Member'),
    M('+', 'loan(Member)', 'void', { from: 'Loanable' }), M('+', 'returnItem()', 'void', { from: 'Loanable' }),
    M('+', 'calculateLateFee(int)', 'double', { abstract: true }), M('+', 'toString()', 'String')] },
  Book: { parent: 'LibraryItem', impl: ['Reservable'], members: [
    M('+', 'Book(String, String, String)', '', { ctor: true }), F('-', 'author', 'String'), F('-', 'reservedBy', 'Member'),
    M('+', 'getAuthor()', 'String'), M('+', 'setAuthor(String)', 'void'), M('+', 'calculateLateFee(int)', 'double'),
    M('+', 'reserve(Member)', 'void', { from: 'Reservable' }), M('+', 'cancelReservation()', 'void', { from: 'Reservable' }), M('+', 'isReserved()', 'boolean', { from: 'Reservable' })] },
  DVD: { parent: 'LibraryItem', members: [M('+', 'DVD(String, String, int)', '', { ctor: true }), F('-', 'durationMinutes', 'int'), M('+', 'getDurationMinutes()', 'int'), M('+', 'calculateLateFee(int)', 'double')] },
  Magazine: { parent: 'LibraryItem', members: [M('+', 'Magazine(String, String, int)', '', { ctor: true }), F('-', 'issueNumber', 'int'), M('+', 'getIssueNumber()', 'int'), M('+', 'calculateLateFee(int)', 'double')] },
  Member: { parent: 'Object', impl: ['Comparable<Member>'], members: [
    M('+', 'Member(String, String, int)', '', { ctor: true }),
    F('-', 'memberId', 'String'), F('-', 'name', 'String'), F('-', 'borrowedCount', 'int'), F('-', 'maxBorrowLimit', 'int'),
    M('+', 'getMemberId()', 'String'), M('+', 'getName()', 'String'), M('+', 'getBorrowedCount()', 'int'), M('+', 'getMaxBorrowLimit()', 'int'),
    M('+', 'setName(String)', 'void'), M('+', 'setBorrowedCount(int)', 'void'), M('+', 'incrementBorrowedCount()', 'void'), M('+', 'decrementBorrowedCount()', 'void'),
    M('+', 'compareTo(Member)', 'int', { from: 'Comparable' }), M('+', 'toString()', 'String')] },
  Student: { parent: 'Member', members: [M('+', 'Student(String, String)', '', { ctor: true }), F('-', 'STUDENT_BORROW_LIMIT = 3', 'int', { stat: true })] },
  Staff: { parent: 'Member', members: [M('+', 'Staff(String, String)', '', { ctor: true }), F('-', 'STAFF_BORROW_LIMIT = 10', 'int', { stat: true })] }
};
const BUILTIN = { Object, LibraryItem, Book, DVD, Magazine, Member, Student, Staff };
const classByName = n => BUILTIN[n] || LAB.custom[n]?.cls || LAB.customMembers[n]?.cls;
const chainOf = n => { const c = []; for (let k = n; k; k = CLASS_INFO[k]?.parent) c.push(k); return c; };
const isSubclass = (a, b) => chainOf(a).includes(b);
const BASE_RATE = { Book: 10, DVD: 25, Magazine: 5 };

/** Rows for "what does class X have?" — declared here, overridden, inherited, private, constructors. */
function memberRows(name){
  const chain = chainOf(name), rows = [], seen = new Set();
  chain.forEach((c, depth) => {
    for (const mb of CLASS_INFO[c].members){
      if (mb.ctor && depth > 0) continue;               // constructors are NOT inherited
      if (depth === 0){
        const anc = mb.ctor ? null : chain.slice(1).find(a => CLASS_INFO[a].members.some(x => x.n === mb.n));
        const ancAbstract = anc && CLASS_INFO[anc].members.find(x => x.n === mb.n).abstract;
        rows.push({ ...mb, owner: c, anc, status: mb.ctor ? 'ctor' : anc ? (ancAbstract ? 'implements' : 'overrides') : mb.abstract ? 'abstract' : 'declared' });
      } else {
        if (seen.has(mb.n)) continue;                   // a lower class overrides it
        rows.push({ ...mb, owner: c, status: mb.v === '-' ? 'private' : mb.abstract ? 'abstract' : 'inherited' });
      }
      seen.add(mb.n);
    }
  });
  return rows;
}

/* =====================================================================
   STUDENT-DEFINED SUBCLASSES (real JS classes, generated at runtime)
   ===================================================================== */
const parseWhole = (text, label) => { const s = String(text ?? '').trim(); if (!/^[+-]?\d+$/.test(s)) throw new IllegalArgumentException(`${label} must be a whole number`); return parseInt(s, 10); };
const constName = n => n.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();

function itemJava(sp){
  const pArgs = { LibraryItem: '', Book: ', String author', DVD: ', int durationMinutes', Magazine: ', int issueNumber' }[sp.parent];
  const sArgs = { LibraryItem: 'id, title', Book: 'id, title, author', DVD: 'id, title, durationMinutes', Magazine: 'id, title, issueNumber' }[sp.parent];
  const f = sp.field && isIdent(sp.field) ? sp.field : '';
  let j = `public class ${sp.name || '?'} extends ${sp.parent} {\n`;
  if (f) j += `    private ${sp.ftype} ${f};\n\n`;
  j += `    public ${sp.name || '?'}(String id, String title${pArgs}${f ? `, ${sp.ftype} ${f}` : ''}) {\n        super(${sArgs});   // the parent sets up its own fields\n`;
  if (f) j += `        this.${f} = ${f};\n`;
  j += `    }\n`;
  if (f) j += `\n    public ${sp.ftype} get${capFirst(f)}() { return ${f}; }\n`;
  if (sp.override) j += `\n    @Override\n    public double calculateLateFee(int daysLate) {\n        return daysLate * ${Number.isFinite(parseFloat(sp.rate)) ? parseFloat(sp.rate).toFixed(1) : sp.rate};\n    }\n`;
  else j += `\n    // calculateLateFee(int) is not written here: it comes from ${sp.parent}\n`;
  return j + '}';
}
function memberJava(sp){
  const n = sp.name || '?';
  if (sp.parent === 'Member') return `public class ${n} extends Member {\n    private static final int ${constName(n)}_BORROW_LIMIT = ${sp.limit};\n\n    public ${n}(String memberId, String name) {\n        super(memberId, name, ${constName(n)}_BORROW_LIMIT);\n    }\n}`;
  return `public class ${n} extends ${sp.parent} {\n    public ${n}(String memberId, String name) {\n        super(memberId, name);   // ${sp.parent} already fixes the limit at ${sp.parent === 'Student' ? 3 : 10}\n    }\n}`;
}

/** javac, simplified: returns an error message, or null if it compiles. */
function compileItem(sp){
  if (!sp.name) return 'error: <identifier> expected (the class needs a name)';
  if (!isIdent(sp.name) || JAVA_KW.has(sp.name)) return `error: '${sp.name}' is not a valid class name`;
  if (classByName(sp.name) || CLASS_INFO[sp.name]) return `error: duplicate class: ${sp.name}`;
  if (sp.field){
    if (!isIdent(sp.field) || JAVA_KW.has(sp.field)) return `error: '${sp.field}' is not a valid field name`;
    const inherited = memberRows(sp.parent).filter(r => r.kind === 'field').map(r => r.n.split(' ')[0]);
    if (inherited.includes(sp.field)) return `${sp.parent} already has a field called '${sp.field}'. Choose a different name so readers don't confuse the two.`;
  }
  if (!sp.override && sp.parent === 'LibraryItem') return `error: ${sp.name} is not abstract and does not override abstract method calculateLateFee(int) in LibraryItem`;
  if (sp.override && !(parseFloat(sp.rate) >= 0)) return `error: incompatible types: "${sp.rate}" cannot be converted to double`;
  return null;
}
function compileMember(sp){
  if (!sp.name) return 'error: <identifier> expected (the class needs a name)';
  if (!isIdent(sp.name) || JAVA_KW.has(sp.name)) return `error: '${sp.name}' is not a valid class name`;
  if (classByName(sp.name) || CLASS_INFO[sp.name]) return `error: duplicate class: ${sp.name}`;
  if (sp.parent === 'Member' && !(/^\d+$/.test(sp.limit) && +sp.limit >= 1)) return `error: the borrow limit must be a whole number of at least 1`;
  return null;
}

function defineItemClass(sp){
  const P = BUILTIN[sp.parent], needsDetail = P !== LibraryItem, field = sp.field || null, rate = parseFloat(sp.rate);
  const C = ({ [sp.name]: class extends P {
    constructor(id, title, parentDetail, extra){
      if (needsDetail) super(id, title, parentDetail); else super(id, title);
      this._extra = extra;
    }
  } })[sp.name];
  if (sp.override) C.prototype.calculateLateFee = function (d){ return d * rate; };
  if (field) C.prototype['get' + capFirst(field)] = function (){ return this._extra; };
  C.prototype.labFields = function (){ return field ? [[field, this._extra]] : []; };
  C.prototype.labDescribe = function (){
    const base = this instanceof Book ? this.getAuthor() : this instanceof DVD ? `${this.getDurationMinutes()} min` : this instanceof Magazine ? `Issue #${this.getIssueNumber()}` : sp.parent;
    return field ? `${base} · ${field}: ${this._extra}` : base;
  };
  const meta = { ...sp, cls: C, rate: sp.override ? rate : BASE_RATE[sp.parent], java: itemJava(sp) };
  LAB.custom[sp.name] = meta;
  CLASS_INFO[sp.name] = { parent: sp.parent, custom: true, members: [
    M('+', `${sp.name}(…)`, '', { ctor: true }),
    ...(field ? [F('-', field, sp.ftype), M('+', `get${capFirst(field)}()`, sp.ftype)] : []),
    ...(sp.override ? [M('+', 'calculateLateFee(int)', 'double')] : [])] };
  window.LAB_TYPES[sp.name] = {
    cls: C, parent: sp.parent, prefix: sp.name[0].toUpperCase(),
    detailLabel: { Book: 'Author', DVD: 'Duration (minutes)', Magazine: 'Issue number' }[sp.parent] || null,
    extraLabel: field ? `${field} (${sp.ftype})` : null,
    create(id, title, detail, extra){
      const pd = sp.parent === 'DVD' ? parseWhole(detail, 'Duration') : sp.parent === 'Magazine' ? parseWhole(detail, 'Issue number') : detail;
      const ex = field && sp.ftype === 'int' ? parseWhole(extra, field) : (extra ?? '');
      T('model', `new ${sp.name}(...) → super(...) in ${sp.parent}`);
      return new C(id, title, pd, ex);
    }
  };
  return C;
}
function defineMemberClass(sp){
  const P = BUILTIN[sp.parent], limit = +sp.limit;
  const C = ({ [sp.name]: class extends P {
    constructor(id, name){ if (P === Member) super(id, name, limit); else super(id, name); }
  } })[sp.name];
  LAB.customMembers[sp.name] = { ...sp, cls: C, java: memberJava(sp) };
  CLASS_INFO[sp.name] = { parent: sp.parent, custom: true, members: [M('+', `${sp.name}(String, String)`, '', { ctor: true }),
    ...(P === Member ? [F('-', `${constName(sp.name)}_BORROW_LIMIT = ${limit}`, 'int', { stat: true })] : [])] };
  window.LAB_MEMBER_TYPES[sp.name] = { cls: C, prefix: sp.name[0].toUpperCase(), limit: P === Member ? limit : P === Student ? 3 : 10, create: (id, n) => new C(id, n) };
  return C;
}

/* hooks used by the main page */
window.labSig = i => { const c = LAB.custom[i.constructor.name]; return c ? hl(c.java) : null; };
window.labRates = () => Object.fromEntries(Object.values(LAB.custom).map(c => [c.name, c.rate]));
window.labOnSelect = (kind, id) => {
  if (!LAB.open || !kind) return;
  if (LAB.tab === 'world'){ LAB.map = { k: kind === 'item' ? 'item' : 'member', id }; labRender(); }
  if (LAB.tab === 'enc'){ LAB.enc.key = (kind === 'item' ? 'i:' : 'm:') + id; LAB.enc.ghost = null; LAB.enc.field = null; labRender(); }
};

/* =====================================================================
   SHELL: open / close / tabs
   ===================================================================== */
const LAB_TABS = [['world', '🌍 Real world → OOP'], ['enc', '🔒 Encapsulation'], ['inh', '🧬 Inheritance'], ['poly', '🎭 Polymorphism'], ['abs', '🧩 Abstraction']];
function labInit(){
  const el = document.createElement('aside');
  el.className = 'lab'; el.id = 'lab'; el.setAttribute('aria-label', 'OOP Lab');
  el.innerHTML = `<div class="lab-head"><div class="lab-title"><span class="lab-badge">OOP</span><div><b>OOP Lab</b><small>How a real library becomes Java classes and objects</small></div></div>
    <button class="lab-x" id="labClose" aria-label="Close the OOP Lab">×</button></div><nav class="lab-tabs" id="labTabs"></nav><div class="lab-body" id="labBody"></div>`;
  lb('stage').appendChild(el);
  lb('labBtn').onclick = () => labToggle();
  lb('labClose').onclick = () => labToggle(false);
  lb('ground').addEventListener('click', e => { const t = e.target.closest('[data-map]'); if (t && !dragMoved) labShowMapping(t.dataset.map); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && LAB.open && !lb('modal').classList.contains('open')) labToggle(false); });
}
function labToggle(open = !LAB.open, tab){
  LAB.open = open; if (tab) LAB.tab = tab;
  lb('stage').classList.toggle('lab-open', open); lb('labBtn').classList.toggle('on', open);
  if (open) labRender(); else clearProbe();
  requestAnimationFrame(fit);
}
function labRender(){
  lb('labTabs').innerHTML = LAB_TABS.map(([k, n]) => `<button data-k="${k}" class="${LAB.tab === k ? 'on' : ''}">${n}</button>`).join('');
  lb('labTabs').querySelectorAll('button').forEach(b => b.onclick = () => { LAB.tab = b.dataset.k; clearProbe(); labRender(); lb('labBody').scrollTop = 0; });
  const T = TABS[LAB.tab];
  lb('labBody').innerHTML = T.html();
  T.bind(lb('labBody'));
}
const analogy = (icon, title, text, def) => `<div class="analogy"><div class="a-ic">${icon}</div><div><b class="a-t">${title}</b><p>${text}</p>${def ? `<div class="a-def"><b style="display:inline">In OOP:</b> ${def}</div>` : ''}</div></div>`;

/* scene highlighting */
function labFlash(k){
  const sel = { building: '[data-map="building"]', desk: '[data-map="desk"]', shelves: '[data-map="shelves"]', ledger: '[data-map="ledger"]' }[k];
  let els = sel ? [...lb('ground').querySelectorAll(sel)] : [];
  if (['item', 'kinds', 'fee', 'lendable'].includes(k)) els = [...itemEls.values()];
  if (k === 'reserve') els = [...itemEls.entries()].filter(([id]) => library.getItems().find(i => i.getId() === id) instanceof Book).map(([, g]) => g);
  if (['member', 'card', 'limit'].includes(k)) els = [...memEls.values()];
  els.forEach(e => { e.classList.remove('flash'); void e.getBoundingClientRect(); e.classList.add('flash'); setTimeout(() => e.classList.remove('flash'), 1800); });
}
function probe(id){ clearProbe(); itemEls.get(id)?.classList.add('probe'); }
function clearProbe(){ itemEls.forEach(g => g.classList.remove('probe')); }
function labShowMapping(k){ LAB.map = { k }; if (!LAB.open) labToggle(true, 'world'); else { LAB.tab = 'world'; labRender(); } labFlash(k); }

/* =====================================================================
   TAB 1 — REAL WORLD → OOP
   ===================================================================== */
const MAPPINGS = [
  { k: 'building', real: 'The library itself', oop: 'Library', kind: 'Class → one object', code: 'Library library = new Library();', why: 'One object owns all the items and members and enforces the rules for the whole library.', tab: 'abs' },
  { k: 'shelves', real: 'Shelves that hold the stock', oop: 'Repository<LibraryItem>', kind: 'Generic class', code: 'Repository<LibraryItem> items = new Repository<>(LibraryItem::getId);', why: 'A container that works for any type T. The same class also stores the members.', tab: null },
  { k: 'item', real: 'One particular copy on a shelf', oop: 'new Book("B001", …)', kind: 'Object (instance)', code: 'Book cleanCode = new Book("B001", "Clean Code", "Robert C. Martin");', why: 'The class is the blueprint: what every book has. Each physical copy is one object with its own values.', tab: 'enc' },
  { k: 'kinds', real: 'Books, DVDs and magazines', oop: 'Book / DVD / Magazine extends LibraryItem', kind: 'Inheritance', code: 'public class DVD extends LibraryItem { … }', why: 'They all have an id and a title and can be loaned. That shared part is written once in LibraryItem; each kind adds only what is different.', tab: 'inh' },
  { k: 'fee', real: 'The late fine depends on the kind of item', oop: 'calculateLateFee(int)', kind: 'Polymorphism', code: 'double fee = item.calculateLateFee(days);', why: 'One question ("what is the fine?") that each subclass answers in its own way.', tab: 'poly' },
  { k: 'lendable', real: '"Anything we lend is checked out and back in"', oop: 'interface Loanable', kind: 'Abstraction', code: 'void loan(Member m) throws ItemNotAvailableException;\nvoid returnItem() throws ItemNotAvailableException;', why: 'A contract that says WHAT can be done, not HOW. Even a study room could sign it.', tab: 'abs' },
  { k: 'reserve', real: 'Only books can be reserved', oop: 'interface Reservable', kind: 'Interface', code: 'public class Book extends LibraryItem implements Reservable', why: 'An extra capability given only to the classes that need it.', tab: 'abs' },
  { k: 'member', real: 'A person with a library card', oop: 'Student / Staff extends Member', kind: 'Inheritance', code: 'Member amaya = new Student("S001", "Amaya Perera");', why: 'Every member has an id, a name and a borrow count. Only the limit differs between kinds.', tab: 'inh' },
  { k: 'card', real: 'The number printed on the card', oop: 'private String memberId', kind: 'Field (encapsulated)', code: 'amaya.getMemberId()  // read it; nobody can scribble over it', why: 'State lives inside the object. Other classes read it through a getter.', tab: 'enc' },
  { k: 'limit', real: '"Students may borrow 3 items, staff 10"', oop: 'STUDENT_BORROW_LIMIT = 3', kind: 'Constant + rule', code: 'private static final int STUDENT_BORROW_LIMIT = 3;', why: 'The rule is stored once, in the class it belongs to, and checked inside loan().', tab: 'inh' },
  { k: 'desk', real: 'The circulation desk', oop: 'LibraryController', kind: 'MVC controller', code: 'controller.borrow("B003", "S001");', why: 'Takes requests from the screen (the View) and asks the Model to act.', tab: 'abs' },
  { k: 'refuse', real: '"Sorry, that book is already out"', oop: 'ItemNotAvailableException', kind: 'Exception', code: 'throw new ItemNotAvailableException(title + " is already on loan.");', why: 'The caller is forced to handle the problem, so it cannot fail silently.', tab: null },
  { k: 'ledger', real: 'The loans register', oop: 'LoanDAO + loans table', kind: 'DAO / JDBC', code: 'INSERT INTO loans (item_id, member_id, borrowed_at) VALUES (?, ?, ?)', why: 'Records survive a restart because they are written to lms.db.', tab: null },
  { k: 'night', real: 'A clerk who checks for overdue loans', oop: 'OverdueChecker (thread)', kind: 'Runnable / daemon thread', code: 'Thread t = new Thread(checker, "overdue-checker");\nt.setDaemon(true); t.start();', why: 'Work that runs in the background without freezing the window.', tab: null }
];
const QUIZ = ['The ', ['library', 'Class', 'Library — one object of this class runs everything.'], ' lends ', ['books', 'Class', 'Book'], ', ', ['DVDs', 'Class', 'DVD'], ' and ', ['magazines', 'Class', 'Magazine'],
  '. Every book has a ', ['title', 'Field', 'private String title (in LibraryItem)'], ' and an ', ['author', 'Field', 'private String author (in Book)'], '. ',
  ['Amaya', 'Object', 'new Student("S001", "Amaya Perera"): one particular student, not the general idea.'], ' is a ', ['student', 'Class', 'Student extends Member'], ' who can ', ['borrow', 'Method', 'item.loan(member)'], ' ',
  ['at most 3 items', 'Rule', 'STUDENT_BORROW_LIMIT, checked inside loan()'], ' and must ', ['return', 'Method', 'item.returnItem()'], ' them within ', ['14 days', 'Rule', 'LibraryController.loanDays()'],
  ', or pay a ', ['late fee', 'Method', 'calculateLateFee(int), overridden in each subclass'], '. If an item is already ', ['on loan', 'Field', 'private boolean isBorrowed'], ', the desk ', ['refuses', 'Rule', 'throw new ItemNotAvailableException(...)'], '.'];
const CATS = ['Class', 'Object', 'Field', 'Method', 'Rule'];

function mapCard(){
  const m = LAB.map;
  if (!m) return `<div class="mapcard"><div class="mc-k">Try it</div><h5>Click anything in the scene</h5><p>The building, the circulation desk, the shelves, the database, a box or a member pin. Or pick a row below. Each one shows how a real-world thing becomes code.</p></div>`;
  if (m.k === 'item' && m.id && library.hasItem(m.id)){
    const i = library.getItems().find(x => x.getId() === m.id), t = i.constructor.name;
    const ctor = i instanceof Book ? `"${i.getAuthor()}"` : i instanceof DVD ? i.getDurationMinutes() : i instanceof Magazine ? i.getIssueNumber() : '…';
    const is = chainOf(t).slice(0, -1).concat(['Loanable', ...(isReservable(i) ? ['Reservable'] : [])]);
    return `<div class="mapcard"><div class="mc-k">Real world → object</div><h5>"${esc(i.getTitle())}" on the ${t === 'Book' ? 'book' : t === 'DVD' ? 'DVD' : t === 'Magazine' ? 'magazine' : 'lab'} shelf</h5>
      <p>This copy is one <b>object</b> made from the <b>${esc(t)}</b> class. Its values are kept in private fields.</p>
      ${codeBox(`${t} item = new ${t}("${i.getId()}", "${i.getTitle()}", ${ctor});\nitem.isBorrowed();   // ${i.isBorrowed()}\nitem.calculateLateFee(3);   // ${i.calculateLateFee(3).toFixed(1)}`)}
      <p>It is a ${is.map(x => `<code>${esc(x)}</code>`).join(', ')}, so it can be stored or passed anywhere one of those types is expected.</p>
      <div class="ctl"><button class="btn sm" data-go="enc">Open its capsule →</button><button class="btn sm" data-go="inh">See its family tree →</button></div></div>`;
  }
  if (m.k === 'member' && m.id && library.hasMember(m.id)){
    const p = library.getMembers().find(x => x.getMemberId() === m.id), t = p.constructor.name;
    return `<div class="mapcard"><div class="mc-k">Real world → object</div><h5>${esc(p.getName())}, holding a library card</h5>
      <p>One <b>${esc(t)}</b> object. The card number, name and loan count are private fields. The limit of ${p.getMaxBorrowLimit()} comes from the ${esc(t)} constructor through <code>super(...)</code>.</p>
      ${codeBox(`Member m = new ${t}("${p.getMemberId()}", "${p.getName()}");\nm.getBorrowedCount();   // ${p.getBorrowedCount()}\nm.getMaxBorrowLimit();  // ${p.getMaxBorrowLimit()}`)}
      <div class="ctl"><button class="btn sm" data-go="enc">Open the capsule →</button><button class="btn sm" data-go="inh">Student vs Staff →</button></div></div>`;
  }
  const r = MAPPINGS.find(x => x.k === m.k) || MAPPINGS[0];
  return `<div class="mapcard"><div class="mc-k">${esc(r.kind)}</div><h5>${esc(r.real)} → <code>${esc(r.oop)}</code></h5><p>${esc(r.why)}</p>${codeBox(r.code)}
    ${r.tab ? `<div class="ctl"><button class="btn sm" data-go="${r.tab}">Explore ${LAB_TABS.find(t => t[0] === r.tab)[1].split(' ').slice(1).join(' ')} →</button></div>` : ''}</div>`;
}
function quizHtml(){
  const q = LAB.quiz;
  let idx = 0;
  const body = QUIZ.map(p => {
    if (typeof p === 'string') return esc(p);
    const i = idx++, a = q.a[i], ok = q.checked && a === p[1], bad = q.checked && a !== p[1];
    return `<span class="qchip ${ok ? 'right' : bad ? 'wrong' : ''}" data-q="${i}" ${a ? `data-c="${a}"` : ''} title="Click to change">${esc(p[0])}${a ? `<sup>${a}</sup>` : ''}</span>`;
  }).join('');
  const parts = QUIZ.filter(p => typeof p !== 'string');
  const score = parts.filter((p, i) => q.a[i] === p[1]).length;
  return `<div class="legend">${CATS.map(c => `<span class="qchip" data-c="${c}" style="cursor:default">${c}</span>`).join('')}</div>
    <div class="quiz">${body}</div>
    <div class="ctl"><button class="btn sm primary" id="qCheck">Check answers</button><button class="btn sm" id="qReveal">Show the answers</button><button class="btn sm" id="qReset">Reset</button>
    ${q.checked ? `<b style="margin-left:auto;color:${score === parts.length ? 'var(--green)' : 'var(--ink)'}">${score} / ${parts.length} correct</b>` : ''}</div>
    ${q.checked ? `<div class="qfeed">${parts.map((p, i) => `<div class="${q.a[i] === p[1] ? '' : 'bad'}"><b>${esc(p[0])}</b> → ${p[1]}: ${esc(p[2])}</div>`).join('')}</div>` : ''}`;
}

/* =====================================================================
   TAB 2 — ENCAPSULATION
   ===================================================================== */
function encObj(){
  const [k, id] = LAB.enc.key.split(':');
  const o = k === 'm' ? library.getMembers().find(m => m.getMemberId() === id) : library.getItems().find(i => i.getId() === id);
  if (o) return o;
  LAB.enc.key = 'm:' + library.getMembers()[0].getMemberId(); return library.getMembers()[0];
}
function fieldSpecs(o){
  if (o instanceof Member) return [
    { n: 'memberId', t: 'String', owner: 'Member', get: () => o.getMemberId(), setter: 'setMemberId', mode: 'check', why: 'The id is the key inside Repository<Member>, so the demo only checks the value and keeps the real one.' },
    { n: 'name', t: 'String', owner: 'Member', get: () => o.getName(), setter: 'setName', mode: 'live' },
    { n: 'borrowedCount', t: 'int', owner: 'Member', get: () => o.getBorrowedCount(), setter: 'setBorrowedCount', mode: 'check', why: 'Only loan() and returnItem() should change this count. The setter rejects negative numbers, but it would still accept a count that disagrees with the real loans. A tighter design would make the setter private.' },
    { n: 'maxBorrowLimit', t: 'int', owner: 'Member', get: () => o.getMaxBorrowLimit(), setter: null, why: 'There is no setter on purpose: the limit is fixed by the Student or Staff constructor.' }];
  const f = [
    { n: 'id', t: 'String', owner: 'LibraryItem', get: () => o.getId(), setter: 'setId', mode: 'check', why: 'The id is the key inside Repository<LibraryItem>, so the demo only checks the value and keeps the real one.' },
    { n: 'title', t: 'String', owner: 'LibraryItem', get: () => o.getTitle(), setter: 'setTitle', mode: 'live' }];
  if (o instanceof Book) f.push({ n: 'author', t: 'String', owner: 'Book', get: () => o.getAuthor(), setter: 'setAuthor', mode: 'live' });
  if (o instanceof DVD) f.push({ n: 'durationMinutes', t: 'int', owner: 'DVD', get: () => o.getDurationMinutes(), setter: null, why: 'Set once by the constructor. There is no setter.' });
  if (o instanceof Magazine) f.push({ n: 'issueNumber', t: 'int', owner: 'Magazine', get: () => o.getIssueNumber(), setter: null, why: 'Set once by the constructor. There is no setter.' });
  (o.labFields?.() || []).forEach(([n, v]) => f.push({ n, t: typeof v === 'number' ? 'int' : 'String', owner: o.constructor.name, get: () => v, setter: null, why: 'Your subclass only has a getter for this field.' }));
  f.push({ n: 'isBorrowed', t: 'boolean', owner: 'LibraryItem', get: () => o.isBorrowed(), setter: null, why: 'Only loan() and returnItem() change it, and they keep borrower in step.' },
    { n: 'borrower', t: 'Member', owner: 'LibraryItem', get: () => o.getBorrower()?.getName() ?? null, setter: null, why: 'Set by loan() and cleared by returnItem().' });
  return f;
}
const snapshot = o => Object.fromEntries(fieldSpecs(o).map(f => [f.n, f.get()]));
const lit = v => v === null ? 'null' : typeof v === 'string' ? `"${v}"` : String(v);
function invariants(o, s){
  if (o instanceof Member){
    const held = library.getItems().filter(i => i.getBorrower() === o).length;
    return [['name is not blank', String(s.name).trim() !== ''], ['borrowedCount ≥ 0', s.borrowedCount >= 0],
      [`borrowedCount ≤ maxBorrowLimit (${s.maxBorrowLimit})`, s.borrowedCount <= s.maxBorrowLimit], [`borrowedCount = items actually held (${held})`, s.borrowedCount === held]];
  }
  const r = [['id is not blank', String(s.id).trim() !== ''], ['title is not blank', String(s.title).trim() !== ''], ['isBorrowed ⇔ borrower ≠ null', s.isBorrowed === (s.borrower != null)]];
  if ('author' in s) r.push(['author is not blank', String(s.author).trim() !== '']);
  if ('durationMinutes' in s) r.push(['durationMinutes > 0', s.durationMinutes > 0, 'gap']);
  return r;
}
/** Parse the typed text as a Java literal of the field's type, or report a compile error. */
function parseLit(spec, raw){
  const v = raw.trim();
  if (spec.t === 'String') return { v: raw.replace(/^"(.*)"$/, '$1') };
  if (spec.t === 'int') return /^-?\d+$/.test(v) ? { v: parseInt(v, 10) } : { err: `incompatible types: String cannot be converted to int` };
  if (spec.t === 'boolean') return v === 'true' || v === 'false' ? { v: v === 'true' } : { err: `incompatible types: String cannot be converted to boolean` };
  return v === 'null' ? { v: null } : { err: `incompatible types: String cannot be converted to ${spec.t} (use loan(member) instead)` };
}
function encLog(cls, html){ LAB.enc.log.unshift({ cls, html }); LAB.enc.log = LAB.enc.log.slice(0, 30); }
function encTry(how){
  const o = encObj(), specs = fieldSpecs(o), sp = specs.find(f => f.n === LAB.enc.field) || specs[0];
  const raw = lb('encVal').value, p = parseLit(sp, raw), name = LAB.enc.key.split(':')[1];
  const vName = o instanceof Member ? 'member' : 'item';
  if (how === 'direct'){
    const stmt = `${vName}.${sp.n} = ${p.err ? raw : lit(p.v)};`;
    if (p.err) return encLog('err', `${esc(stmt)}<br>✗ error: ${esc(p.err)}`), encRefresh();
    if (LAB.enc.mode === 'private'){
      encLog('err', `${esc(stmt)}<br>✗ error: ${esc(sp.n)} has private access in ${esc(sp.owner)}`);
    } else {
      LAB.enc.ghost = { ...(LAB.enc.ghost || snapshot(o)), [sp.n]: p.v };
      const broken = invariants(o, LAB.enc.ghost).filter(([, ok, g]) => !ok && !g);
      encLog(broken.length ? 'warn' : 'ok', `${esc(stmt)}<br>${broken.length ? `⚠ compiled and ran, and the object is now invalid: ${esc(broken.map(b => b[0]).join('; '))}` : '✓ compiled and ran. Nothing broke this time, but nothing checked the value either.'}`);
    }
    return encRefresh();
  }
  // through the setter
  if (!sp.setter) return encLog('err', `${vName}.set${capFirst(sp.n)}(${esc(raw)});<br>✗ error: cannot find symbol: method set${capFirst(sp.n)}(${sp.t})<br><span class="dim">// ${esc(sp.why)}</span>`), encRefresh();
  const stmt = `${vName}.${sp.setter}(${p.err ? raw : lit(p.v)});`;
  if (p.err) return encLog('err', `${esc(stmt)}<br>✗ error: ${esc(p.err)}`), encRefresh();
  try {
    if (sp.mode === 'live'){
      o[sp.setter](p.v);
      encLog('ok', `${esc(stmt)}<br>✓ the setter accepted it. The live object changed: look at the catalogue and the scene.`);
      renderAll();
    } else {
      const tmp = o instanceof Member ? new Member('tmp', 'tmp', 3) : new Book('tmp', 'tmp', 'tmp');
      tmp[sp.setter](p.v);
      encLog('warn', `${esc(stmt)}<br>✓ the setter accepted it. <span class="dim">// ${esc(sp.why)}</span>`);
    }
  } catch (e){
    encLog('err', `${esc(stmt)}<br>✗ ${esc(e.name)}: ${esc(e.message)} <span class="dim">// the setter guarded the field</span>`);
  }
  encRefresh();
}
function encRefresh(){ const y = lb('labBody').scrollTop; labRender(); lb('labBody').scrollTop = y; }

/* =====================================================================
   TAB 4 — POLYMORPHISM helpers
   ===================================================================== */
function sampleOf(t){
  if (t === 'Book') return new Book('X1', 'Sample', 'Anon');
  if (t === 'DVD') return new DVD('X1', 'Sample', 100);
  if (t === 'Magazine') return new Magazine('X1', 'Sample', 1);
  const c = LAB.custom[t];
  return new c.cls('X1', 'Sample', c.parent === 'Book' ? 'Anon' : 1, c.ftype === 'int' ? 1 : 'x');
}
/** Which class's method body actually runs? Walk up the prototype chain like the JVM does. */
function bodyOwner(o, method){ for (let p = Object.getPrototypeOf(o); p; p = Object.getPrototypeOf(p)) if (Object.prototype.hasOwnProperty.call(p, method)) return p.constructor.name; return '?'; }
function feeOwners(){
  const own = ['Book', 'DVD', 'Magazine', ...Object.values(LAB.custom).filter(c => c.override).map(c => c.name)];
  return own.map(n => ({ n, rate: n in BASE_RATE ? BASE_RATE[n] : LAB.custom[n].rate }));
}
async function runLoop(){
  if (LAB.poly.running) return;
  LAB.poly.running = true; labRender();
  const days = LAB.poly.days, items = library.getItems(), rows = lb('pRows'), counts = {};
  let total = 0;
  rows.innerHTML = '';
  for (const it of items){
    if (!LAB.open || LAB.tab !== 'poly') break;
    const owner = bodyOwner(it, 'calculateLateFee'), fee = it.calculateLateFee(days);
    total += fee; counts[owner] = (counts[owner] || 0) + 1;
    probe(it.getId());
    rows.querySelectorAll('.cur').forEach(r => r.classList.remove('cur'));
    rows.insertAdjacentHTML('beforeend', `<div class="prow cur">${icon(it.constructor.name, 14)}<span class="pt">${esc(it.getTitle())} <span style="color:var(--muted)">(${esc(it.constructor.name)})</span></span><code>${esc(owner)}.calculateLateFee(${days}) = ${fee.toFixed(1)}</code></div>`);
    rows.scrollTop = rows.scrollHeight;
    document.querySelectorAll('.mbody').forEach(b => { b.classList.toggle('hit', b.dataset.n === owner); if (b.dataset.n === owner) b.querySelector('.cnt').textContent = '×' + counts[owner]; });
    lb('pTotal').textContent = total.toFixed(1);
    await new Promise(r => setTimeout(r, items.length > 14 ? 260 : 420));
  }
  clearProbe(); document.querySelectorAll('.mbody').forEach(b => b.classList.remove('hit'));
  LAB.poly.running = false;
  const btn = lb('pRun'); if (btn){ btn.disabled = false; btn.textContent = '▶ Run the loop again'; }
}
function polyCalls(){
  const { decl, actual } = LAB.poly;
  const assignable = decl === 'Object' || decl === 'Loanable' || isSubclass(actual, decl);
  const vis = need => need === 'Object' ? true : need === 'Loanable' ? decl !== 'Object' : CLASS_INFO[decl] && isSubclass(decl, need);
  if (!assignable){
    const unrelated = !isSubclass(decl, actual);
    return { decl: `${decl} x = new ${actual}(…);`, head: { cls: 'ce', tag: 'compile error', why: `incompatible types: ${actual} cannot be converted to ${decl}.${unrelated ? ` ${capFirst(an(actual))} is not a kind of ${decl}.` : ''}` }, rows: [] };
  }
  const o = sampleOf(actual), rows = [];
  const add = (code, need, run) => rows.push(vis(need) ? { code, cls: 'ok', tag: 'runs', why: run() } : { code, cls: 'ce', tag: 'compile error', why: `cannot find symbol: the declared type ${decl} has no such method. The compiler only looks at the declared type, even though the object really is ${an(actual)}.` });
  add('x.toString()', 'Object', () => `→ ${bodyOwner(o, 'toString') === 'LibraryItem' ? 'LibraryItem.toString()' : 'Object.toString()'}: "${actual}{id='X1', …}"`);
  add('x.loan(amaya)', 'Loanable', () => 'Runs LibraryItem.loan(). It is inherited, so every subclass uses the same body.');
  add('x.getTitle()', 'LibraryItem', () => '→ "Sample"');
  add(`x.calculateLateFee(${LAB.poly.days})`, 'LibraryItem', () => `→ ${(o.calculateLateFee(LAB.poly.days)).toFixed(1)}. The JVM picks ${bodyOwner(o, 'calculateLateFee')}.calculateLateFee at RUNTIME from the real object.`);
  add('x.getAuthor()', 'Book', () => `→ "${o.getAuthor()}"`);
  add('x.getDurationMinutes()', 'DVD', () => `→ ${o.getDurationMinutes()}`);
  // a downcast compiles if the types are related, and is checked at runtime
  const castOk = isSubclass(actual, 'Book'), castCompiles = decl === 'Object' || decl === 'Loanable' || isSubclass('Book', decl) || isSubclass(decl, 'Book');
  rows.push(!castCompiles ? { code: '((Book) x).getAuthor()', cls: 'ce', tag: 'compile error', why: `incompatible types: ${decl} cannot be converted to Book. These classes are siblings, so the cast could never work.` }
    : castOk ? { code: '((Book) x).getAuthor()', cls: 'ok', tag: 'runs', why: `→ "${o.getAuthor()}". The cast is checked at runtime and passes because the object is ${an(actual)}.` }
    : { code: '((Book) x).getAuthor()', cls: 'rt', tag: 'runtime error', why: `It compiles, then throws ClassCastException: class ${actual} cannot be cast to class Book.` });
  // overloads are chosen at COMPILE time from the declared type
  const ov = isSubclass(decl, 'Book') && CLASS_INFO[decl] ? 'addItem(Book)' : isSubclass(decl, 'DVD') && CLASS_INFO[decl] ? 'addItem(DVD)' : CLASS_INFO[decl] && isSubclass(decl, 'LibraryItem') ? 'addItem(LibraryItem)' : null;
  rows.push(ov ? { code: 'library.addItem(x)', cls: 'ok', tag: 'overload', why: `The compiler picks ${ov} from the declared type ${decl}. The real object (${actual}) is not considered here.` }
    : { code: 'library.addItem(x)', cls: 'ce', tag: 'compile error', why: `no suitable method found for addItem(${decl}). Every overload needs at least a LibraryItem.` });
  return { decl: `${decl} x = new ${actual}(…);`, head: { cls: 'ok', tag: 'compiles', why: `${capFirst(an(actual))} IS-A ${decl}, so the assignment is allowed (upcasting).` }, rows };
}

/* =====================================================================
   TAB 5 — ABSTRACTION helpers
   ===================================================================== */
class StudyRoom {                               // implements Loanable, but is NOT a LibraryItem
  constructor(name){ this.name = name; this.bookedBy = null; }
  loan(member){ if (this.bookedBy) throw new ItemNotAvailableException(`${this.name} is already booked by ${this.bookedBy.getName()}.`); this.bookedBy = member; }
  returnItem(){ if (!this.bookedBy) throw new ItemNotAvailableException(`${this.name} is not booked.`); this.bookedBy = null; }
}
const ROOM = new StudyRoom('Study Room 2');
const lend = (thing, member) => thing.loan(member);      // Library.lend(Loanable thing, Member member)
const LAYERS_DEEP = [
  { n: 'Librarian', s: 'what the user sees', c: '#2563eb', code: '[ Borrow ]   ← one button. That is all the user needs to know.' },
  { n: 'View · MainFrame', s: 'button handler', c: '#2563eb', code: 'controller.borrow(itemField.getText(), memberField.getText());' },
  { n: 'Controller', s: 'LibraryController.borrow', c: '#7c3aed', code: 'library.borrowItem(itemId, memberId);   // rules first\nloanDAO.recordLoan(itemId, memberId);     // then persist' },
  { n: 'Model · Library + LibraryItem', s: 'business rules', c: '#0891b2', code: 'Member m = findMember(memberId);\nLibraryItem i = findItem(itemId);\ni.loan(m);   // if (isBorrowed) throw …; if (count >= limit) throw …;\n             // isBorrowed = true; m.incrementBorrowedCount();' },
  { n: 'DAO · JDBC', s: 'LoanDAO.recordLoan', c: '#d97706', code: 'PreparedStatement ps = conn.prepareStatement(\n    "INSERT INTO loans (item_id, member_id, borrowed_at) VALUES (?, ?, ?)");\nps.setString(1, itemId); ps.setString(2, memberId); ps.executeUpdate();' },
  { n: 'SQLite engine', s: 'the file on disk', c: '#475569', code: 'Updates the B-tree pages of lms.db and writes them to disk through the journal.' }];
function layersHtml(level, i = 0){
  if (i >= level) return '';
  const L = LAYERS_DEEP[i];
  return `<div class="layer" style="border-color:${L.c}33;background:${L.c}08"><div class="lh" style="color:${L.c}"><span>${i + 1}. ${L.n}</span><small>${L.s}</small></div><code>${esc(L.code)}</code>${layersHtml(level, i + 1)}</div>`;
}
function absLog(cls, html){ LAB.abs.log.unshift({ cls, html }); LAB.abs.log = LAB.abs.log.slice(0, 20); }

/* =====================================================================
   TABS
   ===================================================================== */
const TABS = {
  world: {
    html: () => `${analogy('🏛️', 'Start from the real world', 'Before writing any code, look at the library. The <b>things</b> you can point at become classes and objects. What they <b>know</b> becomes fields, what they <b>do</b> becomes methods, and the library\'s <b>rules</b> become checks and exceptions.', 'nouns → classes, objects and fields · verbs → methods · rules → validation and exceptions.')}
      ${mapCard()}
      <div class="lcard"><h4>The mapping, one row per idea</h4><div class="c-sub">Click a row to light up that part of the scene.</div>
        <div class="mrows">${MAPPINGS.map(r => `<div class="mrow ${LAB.map?.k === r.k && !LAB.map?.id ? 'on' : ''}" data-k="${r.k}"><div class="rw"><small>Real world</small>${esc(r.real)}</div><div class="arr">→</div><div class="oo"><small>${esc(r.kind)}</small><code>${esc(r.oop)}</code></div></div>`).join('')}</div></div>
      <div class="lcard"><h4>Exercise: read the requirements like a designer</h4><div class="c-sub">Click each highlighted phrase to label it as a Class, Object, Field, Method or Rule. Then check your answers.</div>${quizHtml()}</div>`,
    bind: el => {
      el.querySelectorAll('.mrow').forEach(r => r.onclick = () => { LAB.map = { k: r.dataset.k }; labFlash(r.dataset.k); encRefresh(); });
      el.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { if (LAB.map?.id) LAB.enc.key = (LAB.map.k === 'item' ? 'i:' : 'm:') + LAB.map.id; if (LAB.map?.id && LAB.map.k === 'item') LAB.inh.sel = library.getItems().find(i => i.getId() === LAB.map.id)?.constructor.name || 'Book'; if (LAB.map?.id && LAB.map.k === 'member') LAB.inh.sel = library.getMembers().find(m => m.getMemberId() === LAB.map.id)?.constructor.name || 'Member'; LAB.tab = b.dataset.go; labRender(); lb('labBody').scrollTop = 0; });
      el.querySelectorAll('.quiz .qchip').forEach(c => c.onclick = () => { const i = +c.dataset.q, cur = LAB.quiz.a[i]; LAB.quiz.a[i] = CATS[(CATS.indexOf(cur) + 1) % CATS.length]; LAB.quiz.checked = false; encRefresh(); });
      lb('qCheck').onclick = () => { LAB.quiz.checked = true; encRefresh(); };
      lb('qReveal').onclick = () => { QUIZ.filter(p => typeof p !== 'string').forEach((p, i) => LAB.quiz.a[i] = p[1]); LAB.quiz.checked = true; encRefresh(); };
      lb('qReset').onclick = () => { LAB.quiz = { a: {}, checked: false }; encRefresh(); };
    }
  },

  enc: {
    html: () => {
      const o = encObj(), t = o.constructor.name, specs = fieldSpecs(o), s = snapshot(o), E = LAB.enc;
      if (!specs.some(f => f.n === E.field)) E.field = specs.find(f => f.setter)?.n || specs[0].n;
      const sp = specs.find(f => f.n === E.field);
      const pubs = [...new Set(memberRows(t).filter(r => r.kind === 'method' && r.v === '+' && !r.ctor).map(r => r.n))];
      const opts = [...library.getMembers().map(m => [`m:${m.getMemberId()}`, `${m.getName()} (${m.constructor.name})`]), ...library.getItems().map(i => [`i:${i.getId()}`, `${i.getTitle()} (${i.constructor.name})`])];
      const ghost = E.ghost, inv = (snap) => `<div class="inv">${invariants(o, snap).map(([n, ok, g]) => `<div class="${ok ? 'y' : g ? 'g' : 'n'}">${ok ? '✓' : g ? '!' : '✗'} ${esc(n)}${!ok && g ? ' (DVD\'s constructor never checks this. Try adding the check yourself.)' : ''}</div>`).join('')}</div>`;
      const core = (snap, base) => `<div class="core">${specs.map(f => { const bad = base && snap[f.n] !== base[f.n]; return `<div><span>🔒 ${f.n}</span><span class="fv ${bad ? 'bad' : ''}">${esc(lit(snap[f.n]))}</span></div>`; }).join('')}</div>`;
      return `${analogy('🔒', 'You can\'t edit the loans register yourself', 'A student can\'t open the library\'s register and change their own borrow count. They ask the desk, and the desk follows the rules. In the same way, other classes can\'t reach into a <code>Member</code> object; they have to call its public methods.', 'make the fields <code>private</code>, expose public methods, and validate inside the setters. The object then protects its own rules (invariants).')}
        <div class="lcard"><h4>Pick an object</h4><div class="c-sub">Or click a box or a member pin in the scene.</div>
          <div class="ctl"><select id="encObj" class="grow">${opts.map(([k, n]) => `<option value="${esc(k)}" ${k === E.key ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
          <div class="seg" id="encMode"><button data-m="private" class="${E.mode === 'private' ? 'on' : ''}">private (real Java)</button><button data-m="public" class="${E.mode === 'public' ? 'on' : ''}">What if public?</button></div></div></div>
        <div class="two" style="margin-top:14px">
          <div class="capsule"><div class="cap-h"><span>${esc(t)} object: the capsule</span><span>private inside</span></div>${core(s)}
            <div class="cap-h" style="margin-top:10px"><span>Public methods (the only way in)</span></div>
            <div class="pubs">${pubs.map(n => `<span class="pubm" data-m="${esc(n)}">${esc(n)}</span>`).join('')}</div>${inv(s)}</div>
          ${E.mode === 'public' ? `<div class="ghost"><div class="cap-h"><span>The same object with PUBLIC fields</span><button class="btn sm" id="encResetG">Reset</button></div>${core(ghost || s, s)}${inv(ghost || s)}
            <p class="note">Nothing guards these fields any more, so every class in the program has to remember the rules. One that forgets breaks the object.</p></div>`
            : `<div class="lcard" style="margin-top:0"><h4>Why private?</h4><p class="note" style="margin-top:0">Each field is reachable <b>only</b> from code inside its own class, so every change goes through a method that can check it. Switch to <b>What if public?</b> and try <code>borrowedCount = -5</code> or <code>title = ""</code> to see what goes wrong without that protection.</p></div>`}
        </div>
        <div class="lcard"><h4>Try to change a field</h4><div class="c-sub">Compare a direct assignment with going through the setter.</div>
          <div class="ctl"><label>field<select id="encField">${specs.map(f => `<option value="${f.n}" ${f.n === E.field ? 'selected' : ''}>${f.n} : ${f.t}${f.setter ? '' : ' (no setter)'}</option>`).join('')}</select></label>
            <label class="grow">new value<input class="inp" id="encVal" placeholder="${sp.t === 'int' ? 'e.g. -5' : sp.t === 'boolean' ? 'true / false' : sp.t === 'Member' ? 'null' : 'e.g. an empty value'}" value="${sp.t === 'int' ? '-5' : sp.t === 'boolean' ? 'true' : sp.t === 'Member' ? 'null' : ''}"/></label></div>
          <div class="ctl"><button class="btn sm" id="encDirect">${o instanceof Member ? 'member' : 'item'}.${sp.n} = value;</button>
            <button class="btn sm primary" id="encSetter">${o instanceof Member ? 'member' : 'item'}.${sp.setter || 'set' + capFirst(sp.n)}(value);</button></div>
          <div class="lcon">${E.log.map(l => `<div class="${l.cls}">${l.html}</div>`).join('')}</div></div>`;
    },
    bind: el => {
      lb('encObj').onchange = e => { LAB.enc.key = e.target.value; LAB.enc.ghost = null; LAB.enc.field = null; encRefresh(); const [k, id] = LAB.enc.key.split(':'); STATE.sel = { kind: k === 'm' ? 'member' : 'item', id }; renderScene(); };
      el.querySelectorAll('#encMode button').forEach(b => b.onclick = () => { LAB.enc.mode = b.dataset.m; encRefresh(); });
      lb('encField').onchange = e => { LAB.enc.field = e.target.value; encRefresh(); };
      lb('encDirect').onclick = () => encTry('direct');
      lb('encSetter').onclick = () => encTry('setter');
      lb('encResetG')?.addEventListener('click', () => { LAB.enc.ghost = null; encRefresh(); });
      el.querySelectorAll('.pubm').forEach(b => b.onclick = () => {
        const o = encObj(), n = b.dataset.m, fn = n.replace(/\(.*$/, ''), vName = o instanceof Member ? 'member' : 'item';
        if (fn === 'calculateLateFee'){
          encLog('ok', `${vName}.calculateLateFee(3) → ${o.calculateLateFee(3).toFixed(1)} <span class="dim">// ${esc(bodyOwner(o, 'calculateLateFee'))}'s version</span>`);
        } else if (n.endsWith('()') && typeof o[fn] === 'function' && /^(get|is|toString)/.test(fn)){
          const v = fn === 'toString' ? `${o.constructor.name}{…}` : fn === 'getBorrower' ? (o.getBorrower()?.getName() ?? null) : o[fn]();
          encLog('ok', `${vName}.${esc(n)} → ${esc(lit(v))}`);
        } else encLog('dim', `${vName}.${esc(n)}: ${n.startsWith('set') ? 'use the form below to call a setter.' : n.endsWith('()') ? 'this method changes state under its own rules. Run it from the main screen (Borrow / Return).' : 'this one takes an argument. For example, loan(member) runs when you press Borrow.'}`);
        encRefresh();
      });
    }
  },

  inh: {
    html: () => {
      const I = LAB.inh, sel = CLASS_INFO[I.sel] ? I.sel : 'Book', info = CLASS_INFO[sel];
      const kids = p => Object.keys(CLASS_INFO).filter(k => CLASS_INFO[k].parent === p);
      const node = n => `<li><span class="tnode ${CLASS_INFO[n].abstract ? 'abs' : ''} ${CLASS_INFO[n].custom ? 'custom' : ''} ${n === sel ? 'on' : ''}" data-c="${esc(n)}">${CLASS_INFO[n].abstract ? '«abstract» ' : ''}${esc(n)}${(CLASS_INFO[n].impl || []).map(x => ` <span class="itf">${esc(x)}</span>`).join('')}${CLASS_INFO[n].custom ? ' ✦' : ''}</span>${kids(n).length ? `<ul>${kids(n).map(node).join('')}</ul>` : ''}</li>`;
      const rows = memberRows(sel);
      const label = r => ({ declared: 'declared here', overrides: `overrides ${r.anc}`, implements: `implements ${r.anc}'s abstract method`, inherited: `inherited from ${r.owner}`, private: `in ${r.owner}, private: use a getter`, abstract: `abstract, from ${r.owner}`, ctor: 'constructor (not inherited)' }[r.status]);
      // instanceof matrix
      const samples = [];
      const seenT = new Set();
      [...library.getItems(), ...library.getMembers()].forEach(o => { const t = o.constructor.name; if (!seenT.has(t)){ seenT.add(t); samples.push(o); } });
      const cols = ['Object', 'LibraryItem', 'Loanable', 'Reservable', 'Book', 'DVD', 'Magazine', 'Member', 'Student', 'Staff', ...Object.keys(LAB.custom), ...Object.keys(LAB.customMembers)];
      const idOf = o => o instanceof Member ? o.getMemberId() : o.getId();
      const IF = { Loanable: 'LibraryItem', Reservable: 'Book' };
      const cell = (o, c) => {
        const t = o.constructor.name;
        if (c in IF) return (c === 'Loanable' ? o instanceof LibraryItem : isReservable(o)) ? 'y' : 'n';
        if (o instanceof classByName(c)) return 'y';
        return isSubclass(c, t) ? 'n' : 'ce';                 // unrelated classes: javac refuses
      };
      const I2 = LAB.inh.cell, mxOut = (() => {
        if (!I2) return 'Click a cell: does <code>obj instanceof Type</code> hold?';
        const o = samples.find(s => idOf(s) === I2.id); if (!o) return '';
        const t = o.constructor.name, r = cell(o, I2.col), path = chainOf(t).join(' → ');
        if (r === 'y') return `<b>${esc(idOf(o))} instanceof ${esc(I2.col)} → true.</b> ${I2.col in IF ? `${esc(t)}'s family tree is ${esc(path)}, and ${I2.col === 'Loanable' ? 'LibraryItem implements Loanable' : 'Book implements Reservable'}, so the interface is inherited as well.` : `Climb the family tree ${esc(path)}: ${esc(I2.col)} is on it. ${esc(capFirst(an(t)))} IS-A ${esc(I2.col)}.`}`;
        if (r === 'n') return `<b>${esc(idOf(o))} instanceof ${esc(I2.col)} → false.</b> ${esc(t)}'s family tree is ${esc(path)}, and ${esc(I2.col)} is not on it.`;
        return `<b>Compile error.</b> <code>${esc(t)}</code> and <code>${esc(I2.col)}</code> are unrelated classes, so javac rejects the test: ${esc(an(t))} can never be ${esc(an(I2.col))}.`;
      })();
      const isItem = I.kind === 'item', sp = isItem ? I.item : I.member;
      return `${analogy('🧬', 'A book is a kind of library item', 'Every item in the library has an id and a title, and can be lent out. A <b>Book</b> is a more specific kind of item, so it has all of that <b>plus</b> an author. Whatever is true of every item is written once, in the parent class.', 'a subclass <code>extends</code> a parent and inherits its fields and methods. It can <b>add</b> new ones and <b>override</b> existing ones. Test it with "is-a": a Book IS-A LibraryItem.')}
        <div class="two" style="margin-top:14px">
          <div class="lcard" style="margin-top:0"><h4>Class hierarchy</h4><div class="c-sub">Click a class. Italic = abstract, teal = interface, ✦ = yours.</div><ul class="tree">${node('Object')}</ul></div>
          <div class="lcard" style="margin-top:0"><h4><code>${esc(sel)}</code>${info.abstract ? '<span class="st abstract">abstract</span>' : ''}</h4><div class="c-sub">${esc(chainOf(sel).join(' → '))}</div>
            <table class="mtable">${rows.map(r => `<tr class="${r.status}"><td class="sg">${r.v}${r.stat ? ' static' : ''} ${esc(r.n)}${r.t ? ' : ' + esc(r.t) : ''}</td><td><span class="st ${r.status}">${esc(label(r))}</span></td></tr>`).join('')}</table>
            <p class="note">Struck-through fields <b>exist</b> inside every ${esc(sel)} object, but they are private to their class. ${esc(sel)}'s own code has to use the getters. Constructors are never inherited: a subclass calls <code>super(...)</code> instead.</p></div>
        </div>
        <div class="lcard"><h4>The "is-a" test: <code>instanceof</code></h4><div class="c-sub">One real object of each class (rows), tested against every type (columns).</div>
          <div class="mx-wrap"><table class="mx"><tr><th style="writing-mode:horizontal-tb;transform:none;height:auto"></th>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr>
          ${samples.map(o => `<tr><td class="rh">${esc(idOf(o))} <span style="color:var(--muted)">${esc(o.constructor.name)}</span></td>${cols.map(c => { const r = cell(o, c); return `<td class="${r} ${I2 && I2.id === idOf(o) && I2.col === c ? 'sel' : ''}" data-id="${esc(idOf(o))}" data-col="${esc(c)}">${r === 'y' ? '✓' : r === 'n' ? '·' : '⊘'}</td>`; }).join('')}</tr>`).join('')}</table></div>
          <div class="mxout">${mxOut}</div></div>
        <div class="lcard"><h4>Write your own subclass</h4><div class="c-sub">Model something new from the real library. Your class compiles into a real class and can join the catalogue.</div>
          <div class="presets"><span class="ins-sub">Ideas:</span>
            <button class="btn sm" data-pre='{"kind":"item","name":"EBook","parent":"Book","field":"fileSizeMb","ftype":"int","override":true,"rate":"2"}'>EBook extends Book</button>
            <button class="btn sm" data-pre='{"kind":"item","name":"BoardGame","parent":"LibraryItem","field":"players","ftype":"int","override":true,"rate":"15"}'>BoardGame extends LibraryItem</button>
            <button class="btn sm" data-pre='{"kind":"item","name":"AudioBook","parent":"Book","field":"narrator","ftype":"String","override":false,"rate":"10"}'>AudioBook (no override)</button>
            <button class="btn sm" data-pre='{"kind":"member","name":"Visitor","parent":"Member","limit":"1"}'>Visitor extends Member</button></div>
          <div class="seg" id="inhKind" style="display:inline-flex"><button data-k="item" class="${isItem ? 'on' : ''}">Library item</button><button data-k="member" class="${!isItem ? 'on' : ''}">Member</button></div>
          <div class="ctl"><label class="grow">class name<input class="inp" data-f="name" value="${esc(sp.name)}"/></label>
            <label>extends<select data-f="parent">${(isItem ? ['LibraryItem', 'Book', 'DVD', 'Magazine'] : ['Member', 'Student', 'Staff']).map(p => `<option ${p === sp.parent ? 'selected' : ''}>${p}</option>`).join('')}</select></label></div>
          ${isItem ? `<div class="ctl"><label class="grow">new field (optional)<input class="inp" data-f="field" value="${esc(sp.field)}"/></label>
            <label>type<select data-f="ftype">${['int', 'String'].map(p => `<option ${p === sp.ftype ? 'selected' : ''}>${p}</option>`).join('')}</select></label></div>
            <div class="ctl"><label class="chk" style="flex-direction:row"><input type="checkbox" data-f="override" ${sp.override ? 'checked' : ''}/> @Override calculateLateFee</label>
            <label style="flex-direction:row;align-items:center;gap:6px">fee per day<input class="inp" data-f="rate" value="${esc(sp.rate)}" style="width:70px"/></label></div>`
          : `<div class="ctl"><label>borrow limit${sp.parent !== 'Member' ? ` <span style="font-weight:500;color:var(--muted)">(fixed by ${esc(sp.parent)})</span>` : ''}<input class="inp" data-f="limit" value="${sp.parent === 'Student' ? 3 : sp.parent === 'Staff' ? 10 : esc(sp.limit)}" ${sp.parent !== 'Member' ? 'disabled' : ''} style="width:90px"/></label></div>`}
          <div id="inhCode">${codeBox(isItem ? itemJava(sp) : memberJava(sp))}</div>
          <div class="ctl"><button class="btn primary" id="inhCompile">▶ Compile</button>${I.out?.ok ? `<button class="btn" id="inhUse">+ Add a ${esc(I.out.name)} to the library</button>` : ''}</div>
          ${I.out ? `<div class="build ${I.out.ok ? 'ok' : 'err'}">${esc(I.out.msg)}</div>` : ''}</div>`;
    },
    bind: el => {
      const I = LAB.inh;
      el.querySelectorAll('.tnode').forEach(n => n.onclick = () => { I.sel = n.dataset.c; encRefresh(); });
      el.querySelectorAll('.mx td[data-col]').forEach(td => td.onclick = () => { I.cell = { id: td.dataset.id, col: td.dataset.col }; encRefresh(); });
      el.querySelectorAll('#inhKind button').forEach(b => b.onclick = () => { I.kind = b.dataset.k; I.out = null; encRefresh(); });
      el.querySelectorAll('[data-pre]').forEach(b => b.onclick = () => { const p = JSON.parse(b.dataset.pre); I.kind = p.kind; delete p.kind; Object.assign(I.kind === 'item' ? I.item : I.member, p); I.out = null; encRefresh(); });
      el.querySelectorAll('[data-f]').forEach(inp => {
        const upd = () => {
          const sp = I.kind === 'item' ? I.item : I.member, f = inp.dataset.f;
          sp[f] = inp.type === 'checkbox' ? inp.checked : inp.value.trim();
          if (f === 'parent' || f === 'override') return encRefresh();
          lb('inhCode').innerHTML = codeBox(I.kind === 'item' ? itemJava(sp) : memberJava(sp));
        };
        inp.oninput = upd; inp.onchange = upd;
      });
      lb('inhCompile').onclick = () => {
        const isItem = I.kind === 'item', sp = { ...(isItem ? I.item : I.member) };
        const err = isItem ? compileItem(sp) : compileMember(sp);
        if (err){ I.out = { ok: false, msg: err }; return encRefresh(); }
        isItem ? defineItemClass(sp) : defineMemberClass(sp);
        I.sel = sp.name;
        I.out = { ok: true, name: sp.name, kind: I.kind, msg: `BUILD SUCCESS: ${sp.name}.class created. ${isItem ? `${sp.name} inherits loan(), returnItem(), getTitle()… from ${sp.parent}${sp.override ? ' and overrides calculateLateFee' : ''}.` : `${capFirst(an(sp.name))} IS-A Member, so it can borrow like any other member.`}` };
        toast('ok', `${sp.name} compiled`, isItem ? 'Add one to the catalogue: it will appear on the "Your subclasses" pad.' : 'Create a member of this type to see a new pin.');
        encRefresh();
      };
      lb('inhUse')?.addEventListener('click', () => I.out.kind === 'item' ? openAddItem(I.out.name) : openAddMember(I.out.name));
    }
  },

  poly: {
    html: () => {
      const P = LAB.poly, owners = feeOwners();
      const decls = ['Object', 'Loanable', 'LibraryItem', 'Book', 'DVD', 'Magazine', ...Object.keys(LAB.custom)];
      const actuals = ['Book', 'DVD', 'Magazine', ...Object.keys(LAB.custom)];
      const r = polyCalls();
      return `${analogy('🎭', 'Same question, different answers', 'The librarian asks every overdue item the same question: <i>"what is your fine for 3 days?"</i>. A book answers 30, a DVD 75, a magazine 15. The librarian never needs to check which kind it is; each item knows its own rule.', 'one method call, many forms. <b>Overriding</b> is decided at runtime by the real object (dynamic dispatch). <b>Overloading</b> is decided at compile time by the declared type.')}
        <div class="lcard"><h4>1 · One loop, many method bodies</h4><div class="c-sub">The loop only knows it has <code>LibraryItem</code>s. Watch which class's method runs for each object in the scene.</div>
          ${codeBox(`double total = 0;\nfor (LibraryItem item : library.getItems()) {\n    total += item.calculateLateFee(${P.days});   // which body runs?\n}`)}
          <div class="ctl"><label class="grow">days late: <b id="pDaysL">${P.days}</b><input type="range" min="1" max="30" value="${P.days}" id="pDays"/></label>
            <button class="btn primary" id="pRun" ${P.running ? 'disabled' : ''}>▶ Run the loop</button></div>
          <div class="bodies">${owners.map(o => `<div class="mbody" data-n="${esc(o.n)}"><span class="cnt"></span><b>${esc(o.n)}</b>calculateLateFee(d)<br>return d * ${o.rate.toFixed(1)};</div>`).join('')}</div>
          <div class="prows" id="pRows"><div class="prow" style="color:var(--muted)">Press Run to call calculateLateFee() on every object.</div></div>
          <div class="ptotal"><span>total</span><span class="mono" id="pTotal">0.0</span></div></div>
        <div class="lcard"><h4>2 · Declared type vs actual object</h4><div class="c-sub">The <b>declared type</b> decides what you are allowed to call (compile time). The <b>actual object</b> decides which body runs (runtime).</div>
          <div class="ctl"><label>declared type<select id="pDecl">${decls.map(d => `<option ${d === P.decl ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select></label>
            <span style="font-family:var(--mono);margin-top:16px">x = new</span>
            <label>actual object<select id="pAct">${actuals.map(d => `<option ${d === P.actual ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select></label></div>
          ${codeBox(r.decl)}
          <div class="calls"><div class="call ${r.head.cls}"><code>${esc(r.decl)}</code><span class="why"><span class="tagc">${r.head.tag}</span>${esc(r.head.why)}</span></div>
          ${r.rows.map(c => `<div class="call ${c.cls}"><code>${esc(c.code)}</code><span class="why"><span class="tagc">${c.tag}</span>${esc(c.why)}</span></div>`).join('')}</div>
          <p class="note">Try <b>LibraryItem x = new Book</b>: <code>x.getAuthor()</code> won't compile, even though the object really is a Book. Then try <b>Book x = new DVD</b>.</p></div>`;
    },
    bind: el => {
      const P = LAB.poly;
      lb('pDays').oninput = e => { P.days = +e.target.value; lb('pDaysL').textContent = P.days; };
      lb('pDays').onchange = () => { if (!P.running) encRefresh(); };
      lb('pRun').onclick = runLoop;
      lb('pDecl').onchange = e => { P.decl = e.target.value; encRefresh(); };
      lb('pAct').onchange = e => { P.actual = e.target.value; encRefresh(); };
    }
  },

  abs: {
    html: () => {
      const A = LAB.abs, room = ROOM, roomCompiles = A.roomLoan && A.roomReturn;
      const missing = [!A.roomLoan && 'loan(Member)', !A.roomReturn && 'returnItem()'].filter(Boolean);
      const memOpts = library.getMembers().map(m => `<option value="${esc(m.getMemberId())}" ${m.getMemberId() === A.mem ? 'selected' : ''}>${esc(m.getName())}</option>`).join('');
      return `${analogy('🧩', 'One button at the desk', 'To borrow a book you hand it over and the librarian presses <b>Borrow</b>. You don\'t need to know about borrow limits, SQL or files on disk. The details are still there, hidden behind a simple interface.', 'show <b>what</b> something does and hide <b>how</b> it does it. Abstract classes and interfaces define the "what"; subclasses fill in the "how".')}
        <div class="lcard"><h4>1 · Peel back the layers of "Borrow"</h4><div class="c-sub">Each layer talks to the one below only through a small public method.</div>
          <div class="ctl"><label class="grow">how much detail: <b>${A.level} / ${LAYERS_DEEP.length}</b><input type="range" min="1" max="${LAYERS_DEEP.length}" value="${A.level}" id="aLevel"/></label></div>
          <div class="layers">${layersHtml(A.level)}</div></div>
        <div class="lcard"><h4>2 · An abstract class is an idea, not a thing</h4><div class="c-sub">Nobody walks into a library and borrows "an item". They borrow a specific book, DVD or magazine.</div>
          ${codeBox('public abstract class LibraryItem implements Loanable {\n    …\n    public abstract double calculateLateFee(int daysLate);   // no body\n}')}
          <div class="ctl"><button class="btn sm" id="aNewAbs">new LibraryItem("X1", "Mystery")</button><button class="btn sm" id="aNewBook">new Book("X1", "Mystery", "Anon")</button></div>
          <div class="ctl"><label class="chk"><input type="checkbox" id="aMag" ${A.magOverride ? 'checked' : ''}/> Magazine still overrides calculateLateFee(int)</label></div>
          <div class="build ${A.magOverride ? 'ok' : 'err'}">${A.magOverride ? 'javac Magazine.java → BUILD SUCCESS' : 'error: Magazine is not abstract and does not override abstract method calculateLateFee(int) in LibraryItem'}</div></div>
        <div class="lcard"><h4>3 · An interface is a contract: the library also lends study rooms</h4><div class="c-sub">A study room is not a LibraryItem, but the library still lends it. If <code>StudyRoom</code> signs the <code>Loanable</code> contract, <code>lend()</code> accepts it without any change.</div>
          ${codeBox(`public class StudyRoom implements Loanable {\n${A.roomLoan ? '    public void loan(Member m) throws ItemNotAvailableException { … }\n' : ''}${A.roomReturn ? '    public void returnItem() throws ItemNotAvailableException { … }\n' : ''}}\n\n// in Library, written long before StudyRoom existed:\npublic void lend(Loanable thing, Member member) throws ItemNotAvailableException {\n    thing.loan(member);\n}`)}
          <div class="ctl"><label class="chk"><input type="checkbox" id="aRL" ${A.roomLoan ? 'checked' : ''}/> implements loan()</label><label class="chk"><input type="checkbox" id="aRR" ${A.roomReturn ? 'checked' : ''}/> implements returnItem()</label></div>
          <div class="build ${roomCompiles ? 'ok' : 'err'}">${roomCompiles ? 'BUILD SUCCESS: StudyRoom keeps every promise in Loanable' : `error: StudyRoom is not abstract and does not override abstract method ${missing[0]} in Loanable`}</div>
          <div class="room ${room.bookedBy ? 'booked' : ''}"><div class="door"></div><div style="flex:1"><b>${esc(room.name)}</b><div class="ins-sub">${room.bookedBy ? `Booked by ${esc(room.bookedBy.getName())}` : 'Free'} · not a LibraryItem, not in the catalogue</div></div></div>
          <div class="ctl"><select id="absMem" class="grow">${memOpts}</select><button class="btn sm primary" id="aLend" ${roomCompiles ? '' : 'disabled'}>library.lend(room, member)</button><button class="btn sm" id="aRet" ${roomCompiles ? '' : 'disabled'}>room.returnItem()</button></div>
          <div class="lcon">${A.log.map(l => `<div class="${l.cls}">${l.html}</div>`).join('')}</div></div>`;
    },
    bind: () => {
      const A = LAB.abs;
      lb('absMem').onchange = e => { A.mem = e.target.value; };
      lb('aLevel').oninput = e => { A.level = +e.target.value; encRefresh(); };
      lb('aNewAbs').onclick = () => { try { new LibraryItem('X1', 'Mystery'); } catch (e){ absLog('err', `LibraryItem x = new LibraryItem("X1", "Mystery");<br>✗ error: LibraryItem is abstract; cannot be instantiated`); } encRefresh(); };
      lb('aNewBook').onclick = () => { const b = new Book('X1', 'Mystery', 'Anon'); absLog('ok', `LibraryItem x = new Book("X1", "Mystery", "Anon");<br>✓ ${esc(b.constructor.name)}{id='X1', title='Mystery', borrowed=false}. A concrete subclass fills in every abstract method.`); encRefresh(); };
      lb('aMag').onchange = e => { A.magOverride = e.target.checked; encRefresh(); };
      lb('aRL').onchange = e => { A.roomLoan = e.target.checked; encRefresh(); };
      lb('aRR').onchange = e => { A.roomReturn = e.target.checked; encRefresh(); };
      lb('aLend').onclick = () => {
        const m = library.findMember(A.mem = lb('absMem').value);
        try { lend(ROOM, m); absLog('ok', `library.lend(room, ${esc(m.getMemberId())});<br>✓ ${esc(ROOM.name)} booked for ${esc(m.getName())}. lend() only knows it got a Loanable. StudyRoom.loan() set its own rule: rooms don't count toward the borrow limit.`); }
        catch (e){ absLog('err', `library.lend(room, ${esc(m.getMemberId())});<br>✗ ${esc(e.name)}: ${esc(e.message)}`); }
        encRefresh();
      };
      lb('aRet').onclick = () => { try { ROOM.returnItem(); absLog('ok', 'room.returnItem();<br>✓ the room is free again'); } catch (e){ absLog('err', `room.returnItem();<br>✗ ${esc(e.name)}: ${esc(e.message)}`); } encRefresh(); };
    }
  }
};

labInit();
