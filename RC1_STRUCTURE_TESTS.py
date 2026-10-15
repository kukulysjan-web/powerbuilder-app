from pathlib import Path
import re, hashlib, json, subprocess, sys
from bs4 import BeautifulSoup
from PIL import Image
HERE=Path(__file__).parent
html=(HERE/'index.html').read_text()
worker=(HERE/'sw.js').read_text()
manifest=json.loads((HERE/'manifest.json').read_text())
doc=BeautifulSoup(html,'html.parser')
checks=[]
def test(name, fn):
    try:fn();checks.append((name,True,''));print('PASS',name)
    except Exception as e:checks.append((name,False,str(e)));print('FAIL',name,repr(e))
def ok(x,message='expected valid condition'):
    assert x,message
def scripts_valid():
    scripts=[s.string or s.get_text() for s in doc.select('script:not([src])')]
    ok(len(scripts)==39,f'expected 39 scripts; found {len(scripts)}')
    for i,s in enumerate(scripts,1):
        r=subprocess.run(['node','-e', 'new Function(require("fs").readFileSync(0,"utf8"))'],input=s,text=True,capture_output=True)
        ok(r.returncode==0,f'script {i} syntax fail: {r.stderr[:300]}')
def no_files_missing():
    paths=set(re.findall(r'(?<![A-Za-z0-9_.-])(?:\./)?([A-Za-z0-9_-]+\.(?:webp|png|svg))\b',html))
    paths|=set(x['src'] for x in manifest['icons'])
    for rel in paths:ok((HERE/rel).is_file(),f'missing referenced asset: {rel}')
    ok(len(paths)>=12,f'expected at least 12 referenced images; found {len(paths)}')
def manifest_valid():
    ok(manifest['display']=='standalone')
    ok(manifest['start_url']=='./index.html')
    ok(manifest['scope']=='./')
    for x in manifest['icons']:
        im=Image.open(HERE/x['src']); dims=tuple(map(int,x['sizes'].split('x')))
        ok(im.size==dims, f'icon size mismatch {x["src"]}: {im.size} vs {dims}')
def sw_cache_valid():
    items=re.search(r'const CORE=\[(.*?)\];',worker,re.S).group(1)
    entries=re.findall(r"'(\./[^']+)'",items)
    ok(len(entries)>=12,'core cache not complete')
    for asset in entries:
        if asset=='./':continue
        ok((HERE/asset.replace('./','',1)).is_file(),f'missing core offline asset {asset}')
def responsive_css():
    ok(doc.find('meta',attrs={'name':'viewport'}) is not None,'viewport missing')
    styles='\n'.join(s.get_text() for s in doc.select('style'))
    ok(len(doc.select('style'))>=25,'missing style blocks')
    ok('@media' in styles,'no responsive styling')
    ok(bool(re.search(r'(max-width|max-device-width|min-width)\s*:',styles)), 'no mobile breakpoint')
def unchanged_b5_except_versions():
    b5=Path('/mnt/data/COALFORGED_2.3.3_BLOCK5_work')
    original=(b5/'index.html').read_text()
    new=original.replace('<title>COALFORGED 2.3.3 · Block 4</title>','<title>COALFORGED 2.3.3 · Release Candidate 1</title>').replace("const APP_VERSION='2.3.3-b5';","const APP_VERSION='2.3.3-rc1';")
    ok(new==html,'unexpected code modification since Block 5')
    sw=(b5/'sw.js').read_text().replace("const CACHE='coalforged-v2.3.3-b5';","const CACHE='coalforged-v2.3.3-rc1';").replace('COALFORGED 2.3.3 Block 5','COALFORGED 2.3.3 RC1')
    ok(sw==worker,'unexpected service-worker logic modification')
    for f in b5.rglob('*'):
        if f.is_file() and f.relative_to(b5).as_posix() not in {'index.html','sw.js','SHA256SUMS.txt','README.md','RELEASE_NOTES.md','UPLOAD_ANLEITUNG.md'}:
            c=HERE/f.relative_to(b5)
            ok(c.exists() and c.read_bytes()==f.read_bytes(),f'preexisting file changed {f.name}')
def state_key_integrity():
    ok('const CF23_STATE_VERSION=10;' in html and "const STORAGE='janTrainingUnifiedV1'" in html)
    ok('cf23B8ApplyCandidate' in html and 'CF23_B8_IMPORT_BACKUP' in html)
    ok('function cf224FinishEngineWorkout()' in html)
def preserved_features():
    for token in ('cf232-implementation','cf233-block5-workout-player','cf224FinishEngineWorkout','cf23B2','cf23B8ReadOnlyAudit','cf223','b9EnsureNutritionShell','cf21Resume'):
        ok(token in html,'missing feature token '+token)
def no_external_js():
    ok(not doc.select('script[src]'),'external JS dependency detected')
    ok(not re.search(r'<script[^>]+src\s*=',html,re.I),'external JS loading detected')

test('39 embedded JavaScript blocks parse',scripts_valid)
test('local image references resolve',no_files_missing)
test('PWA manifest and icon dimensions',manifest_valid)
test('service-worker core assets exist',sw_cache_valid)
test('responsive styles and viewport present (static)',responsive_css)
test('no external JavaScript runtime dependency',no_external_js)
test('storage and import safety functions remain',state_key_integrity)
test('Workout/Physique/Nutrition/plan modules remain',preserved_features)
test('underlying Block 5 code/assets unchanged except release version',unchanged_b5_except_versions)
print(f'\n{sum(x[1] for x in checks)}/{len(checks)} static checks passed')
if not all(x[1] for x in checks):sys.exit(1)
