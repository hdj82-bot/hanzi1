#!/usr/bin/env node
/**
 * chengyu/*.md 의 frontmatter 를 읽어
 *  - chengyu/README.md 의 색인 표 (INDEX:START ~ INDEX:END)
 *  - chengyu/README.md 와 README.md 의 진행률 (**N / 100**)
 * 을 자동으로 갱신한다.
 *
 * 의존성 없음.  실행:  node scripts/build-index.js
 * 형식 규약은 docs/FORMAT.md 참고.
 */
const fs = require('fs');
const path = require('path');

const DIR = 'chengyu';
const GOAL = 100;
const REQUIRED = ['simplified', 'pinyin', 'hangul', 'meaning_ko', 'status'];

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;      // 주석줄 무시
    const i = t.indexOf(':');
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (val === '' || val === '[]') continue;   // 안 채운 선택 필드
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
    }
    out[key] = val;
  }
  return out;
}

const cell = v => String(v).replace(/\|/g, '\|');

const files = fs.readdirSync(DIR)
  .filter(f => f.endsWith('.md') && f !== 'README.md' && !f.startsWith('_'))
  .sort();                                       // 파일명 = 병음 → 병음순 정렬

const entries = [];
const problems = [];

for (const file of files) {
  const fm = parseFrontmatter(fs.readFileSync(path.join(DIR, file), 'utf8'));
  if (!fm) { problems.push(`${file}: frontmatter 없음`); continue; }
  const missing = REQUIRED.filter(k => !fm[k]);
  if (missing.length) { problems.push(`${file}: 필수 필드 누락 → ${missing.join(', ')}`); continue; }
  entries.push({ file, ...fm });
}

const done = entries.filter(e => e.status === 'done');

const table = [
  '| 成语 | 병음 | 독음 | 뜻 |',
  '| --- | --- | --- | --- |',
  ...entries.map(e => {
    const mark = e.status === 'done' ? '' : ' 🚧';
    return `| [${cell(e.simplified)}](${e.file})${mark} | ${cell(e.pinyin)} | ${cell(e.hangul)} | ${cell(e.meaning_ko)} |`;
  }),
].join('\n');

// --- chengyu/README.md 갱신 ---
const idxPath = path.join(DIR, 'README.md');
let idx = fs.readFileSync(idxPath, 'utf8');
const START = '<!-- INDEX:START', END = '<!-- INDEX:END -->';
const s = idx.indexOf(START), e = idx.indexOf(END);
if (s < 0 || e < 0) { console.error(`${idxPath}: INDEX 마커를 찾을 수 없습니다.`); process.exit(1); }
const headEnd = idx.indexOf('-->', s) + 3;
idx = idx.slice(0, headEnd) + '\n\n' + table + '\n\n' + idx.slice(e);
idx = idx.replace(/\*\*\d+ \/ \d+\*\*/, `**${done.length} / ${GOAL}**`);
fs.writeFileSync(idxPath, idx);

// --- 루트 README.md 진행률 갱신 ---
let root = fs.readFileSync('README.md', 'utf8');
const patched = root.replace(/(\[사자성어 100개 정리 프로젝트\][^\n]*?)\*\*\d+ \/ \d+\*\*/, `$1**${done.length} / ${GOAL}**`);
if (patched !== root) fs.writeFileSync('README.md', patched);

console.log(`색인 갱신: ${entries.length}개 항목 (완료 ${done.length}, 작성중 ${entries.length - done.length})`);
if (problems.length) {
  console.log('\n형식 문제:');
  for (const p of problems) console.log('::warning::' + p);
}
