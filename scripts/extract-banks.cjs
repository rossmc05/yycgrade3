// One-off: move literal question banks out of skills.ts into src/content/<subject>.json.
const ts = require('typescript');
const fs = require('fs');
for (const subj of process.argv.slice(2)) {
  const file = `src/subjects/${subj}/skills.ts`;
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.ES2022, true);
  const jf = `src/content/${subj}.json`;
  const out = fs.existsSync(jf) ? JSON.parse(fs.readFileSync(jf, 'utf8')) : {};
  const edits = [];
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st)) continue;
    for (const d of st.declarationList.declarations) {
      const name = d.name.getText();
      if (!/^[A-Z][A-Z0-9_]+$/.test(name) || /^OUT/.test(name) || !d.initializer) continue;
      const init = d.initializer;
      if (!ts.isArrayLiteralExpression(init) && !ts.isObjectLiteralExpression(init)) continue;
      let value;
      try { value = Function(`"use strict"; return (${init.getText()});`)(); } catch { continue; }
      if (JSON.stringify(value).length < 2) continue;
      out[name] = value;
      const repl = d.type ? `bank.${name} as ${d.type.getText()}` : `bank.${name}`;
      edits.push([init.getStart(), init.getEnd(), repl]);
    }
  }
  let s = src;
  for (const [a, b, r] of edits.sort((x, y) => y[0] - x[0])) s = s.slice(0, a) + r + s.slice(b);
  if (!/content\//.test(s)) s = s.replace(/(import type [^\n]+\n)/, `$1import bank from '../../content/${subj}.json';\n`);
  fs.mkdirSync('src/content', { recursive: true });
  fs.writeFileSync(`src/content/${subj}.json`, JSON.stringify(out, null, 1) + '\n');
  fs.writeFileSync(file, s);
  console.log(subj, Object.keys(out).join(' '));
}
