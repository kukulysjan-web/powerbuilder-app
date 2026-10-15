from playwright.sync_api import sync_playwright
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import threading,os,json
os.chdir('/mnt/data/coalforged_ux_integrated')
server=ThreadingHTTPServer(('127.0.0.1',8672),SimpleHTTPRequestHandler)
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda e: errors.append(str(e)))
 html=open('/mnt/data/coalforged_ux_integrated/index.html').read().replace('<script src="cf-ux.js"></script>','<script>'+open('/mnt/data/coalforged_ux_integrated/cf-ux.js').read()+'</script>');shim="""<script>var _local={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>_local[k]||null,setItem:(k,v)=>{_local[k]=String(v)},removeItem:k=>{delete _local[k]},key:i=>Object.keys(_local)[i]||null,get length(){return Object.keys(_local).length}}});</script>""";page.set_content(html.replace('<head>','<head>'+shim,1),wait_until='domcontentloaded',timeout=30000)
 page.wait_for_timeout(2000)
 print('TITLE',page.title())
 print('main chars',len(page.locator('main').inner_text(timeout=15000)))
 print('errors',errors[:10]);print('ux',page.evaluate('window.CFUX_RELEASE'))
 page.screenshot(path='/mnt/data/coalforged_ux_integrated/smoke_home.png',full_page=True)
 page.evaluate("state.progressSub='body';cf23B7Open('current')")
 page.wait_for_timeout(500)
 print('physique preview text',page.locator('main').inner_text()[:220])
 print('physique errors',errors[:10]);page.screenshot(path='/mnt/data/coalforged_ux_integrated/smoke_physique.png',full_page=True)
 print('state',page.evaluate("({current:cf218CurrentPlanKey(),engine:cf224Plans().length,hasSession:cf21SessionLive()})"))
 b.close()
server.shutdown()
