const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html');
for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
const json = Object.fromEntries(fs.readdirSync(path.join(root, 'content')).filter(f => f.endsWith('.json')).map(f => [f, JSON.parse(read(`content/${f}`))]));
for (const file of ['news', 'termine', 'ansprechpartner', 'sponsoren', 'downloads']) {
  assert(Array.isArray(json[`${file}.json`].items), `${file}: CMS requires an items array`);
}
for (const [file, key] of [['teams', 'teams'], ['ehrenamt', 'positionen']]) {
  assert(Array.isArray(json[`${file}.json`][key]), `${file}: missing ${key}`);
}
for (const [list, key] of [[json['teams.json'].teams, 'slug'], [json['news.json'].items, 'id']]) {
  const ids = list.map(item => item[key]);
  assert.equal(new Set(ids).size, ids.length, `Duplicate ${key}`);
  assert(ids.every(id => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)), `Invalid ${key}`);
}
for (const team of json['teams.json'].teams) {
  for (const field of ['name', 'trainer', 'training', 'ort', 'liga']) assert.equal(typeof team[field], 'string', `${team.slug}: ${field}`);
  assert(!team.kontakt || (Array.isArray(team.kontakt) && team.kontakt.every(k => typeof k === 'string')), 'Invalid contact list');
}
function checkAsset(value) {
  if (typeof value === 'string' && /^(images|fonts)\//.test(value)) assert(fs.existsSync(path.join(root, value)), `Missing asset: ${value}`);
  else if (value && typeof value === 'object') Object.values(value).forEach(checkAsset);
}
checkAsset(json);
for (const match of html.matchAll(/(?:src|href)=["']((?:images|fonts)\/[^"']+)["']/g)) checkAsset(match[1]);
assert.equal(fs.readFileSync(path.join(root, json['meta.json'].mitgliedschaftPDF)).subarray(0,5).toString(), '%PDF-');
assert(!/fonts\.googleapis|<iframe/i.test(html), 'Unexpected automatic third-party embed');
const legal = read('content/impressum.html');
const needsLegal = /\[Name|VR XXXX/.test(legal);
console.log(`Technical checks passed: ${Object.keys(json).length} JSON files, schemas, slugs, assets, PDF and JS syntax.`);
if (needsLegal) console.log('DOMAIN CUTOVER BLOCKED: Impressum still contains placeholders.');
if (process.argv.includes('--final')) assert(!needsLegal, 'Final release requires confirmed legal information');
