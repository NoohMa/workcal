/* 工作日誌 Service Worker：網頁一律先抓網路最新版，離線時才用快取。
   更新 index.html 後不用改這個檔，重新整理就會拿到新版。 */
const CACHE='worklog-shell-v1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html']).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);await self.clients.claim()})())});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==location.origin)return; // Firebase、Google 登入等外部請求不攔
  e.respondWith((async()=>{
    try{const res=await fetch(req);if(res&&res.ok){const c=await caches.open(CACHE);c.put(req,res.clone())}return res}
    catch(err){const hit=await caches.match(req)||(req.mode==='navigate'?await caches.match('./index.html'):null);if(hit)return hit;throw err}
  })());
});
