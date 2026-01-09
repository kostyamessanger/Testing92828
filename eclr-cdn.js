// ECLR-CDN SERVICE WORKER 2026
const API_KEY = 'e78d3d84ead4488ae360bd94c11394a392255855737dca6ee8a0a3f84deefe3e';

self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(clients.claim());
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Логика: если это переход на новый сайт и нет метки проверки
    if (event.request.mode === 'navigate' && !url.searchParams.has('eclr')) {
        event.respondWith(showSecurityScreen(url.href));
    }
});

async function showSecurityScreen(target) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { background: #000; color: #0f0; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .box { border: 1px solid #0f0; padding: 30px; text-align: center; max-width: 90%; }
            .scan { height: 2px; background: #0f0; width: 100%; position: relative; animation: m 2s infinite; }
            @keyframes m { 0% {top: 0} 50% {top: 20px} 100% {top: 0} }
        </style>
    </head>
    <body>
        <div class="box">
            <div class="scan"></div>
            <h2>EclairSecurity</h2>
            <p id="st">АНАЛИЗ УЗЛА: ${new URL(target).hostname}</p>
            <p style="font-size: 10px; color: #555;">Запрос к базе VirusTotal...</p>
        </div>
        <script>
            async function run() {
                try {
                    // Кодируем URL для VT
                    const id = btoa("${target}").replace(/=/g, '');
                    const r = await fetch('www.virustotal.com' + id, {
                        headers: { 'x-apikey': '${API_KEY}' }
                    });
                    const d = await r.json();
                    const s = d.data?.attributes?.last_analysis_stats;
                    
                    if (s && (s.malicious > 0 || s.suspicious > 0)) {
                        document.getElementById('st').innerText = "ОБЪЕКТ ЗАБЛОКИРОВАН: ВИРУС!";
                        document.body.style.color = "red";
                    } else {
                        // Чисто - переходим, добавляя метку ?eclr=1
                        const sep = "${target}".includes('?') ? '&' : '?';
                        location.href = "${target}" + sep + "eclr=1";
                    }
                } catch(e) {
                    // Если ошибка (например, сайта нет в базе), просто пускаем
                    const sep = "${target}".includes('?') ? '&' : '?';
                    location.href = "${target}" + sep + "eclr=1";
                }
            }
            setTimeout(run, 1200);
        <\/script>
    </body>
    </html>`;

    return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=UTF-8' }
    });
}
