# Append new items to a subject's data file, skipping exact and same-question duplicates.
import json, sys
subj, add_file = sys.argv[1], sys.argv[2]
path = f'src/content/{subj}.json'
bank = json.load(open(path))
add = json.load(open(add_file))
def ident(x):
    if isinstance(x, dict):
        for k in ('q', 's', 'word', 'one', 'base'):
            if k in x: return json.dumps(x[k]).lower()
    if isinstance(x, list) and x and isinstance(x[0], str) and len(x) == 2 and isinstance(x[1], list):
        return x[0].lower()
    return json.dumps(x).lower()
def merge(old, new, name):
    if isinstance(old, list):
        seen = {ident(x) for x in old}
        n = 0
        for x in new:
            if ident(x) in seen: print('  dup', name, ident(x)[:60]); continue
            seen.add(ident(x)); old.append(x); n += 1
        return n
    n = 0
    for k, v in new.items():
        if k not in old: old[k] = v; n += len(v) if isinstance(v, list) else 1
        else: n += merge(old[k], v, f'{name}.{k}')
    return n
for k, v in add.items():
    if k not in bank: bank[k] = v; print(k, 'new', len(v))
    else: print(k, '+', merge(bank[k], v, k))
json.dump(bank, open(path, 'w'), ensure_ascii=False, indent=1)
open(path, 'a').write('\n')
