export const CLARITY_CONSENT_SCRIPT = `(() => {
  if (window.corncompClarityConsent) return;
  window.corncompClarityConsent = true;
  if (window.location.hostname !== 'corn-comp.com' || window.location.pathname.startsWith('/design-preview/')) return;
  const key = 'corncomp-clarity-consent-v1';
  const read = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const save = value => { try { localStorage.setItem(key, value); } catch {} };
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.clarity.ms/tag/z77l66rwf0';
    document.head.append(script);
  };
  const setup = () => {
    document.querySelector('[data-analytics-allow]')?.addEventListener('click', () => { save('granted'); start(); });
    document.querySelector('[data-analytics-decline]')?.addEventListener('click', () => {
      save('denied');
      if (started) {
        window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
        window.clarity('consent', false);
        window.clarity('stop');
      }
      for (const name of ['_clck', '_clsk']) {
        document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax';
        document.cookie = name + '=; Max-Age=0; path=/; domain=corn-comp.com; SameSite=Lax';
      }
    }, true);
    const analytics = read('corncomp-analytics-consent');
    if (analytics === 'granted' && read(key) === 'granted') start();
    else if (analytics === 'granted' && !read(key)) {
      const banner = document.querySelector('[data-analytics-consent]');
      if (banner) banner.hidden = false;
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once: true });
  else setup();
})();`;

const CLARITY_SHORT_DISCLOSURES = {
 en: 'Optional Google Analytics and Microsoft Clarity (session replay). Off until allowed. Details',
 zh: '可选 Google Analytics 与 Microsoft Clarity（会话回放），允许后才加载。查看说明',
 fr: 'Google Analytics et Microsoft Clarity (relecture) sont facultatifs et désactivés sans accord. Détails',
 es: 'Google Analytics y Microsoft Clarity (grabación) son opcionales y requieren permiso. Detalles',
 de: 'Google Analytics und Microsoft Clarity (Sitzungswiedergabe) sind optional und erst nach Zustimmung aktiv. Details',
 ar: 'Google Analytics وMicrosoft Clarity (إعادة الجلسات) اختياريان ولا يعملان إلا بالموافقة. التفاصيل',
};
const CLARITY_COMPACT_CSS = '.analytics-consent details summary{cursor:pointer;font-size:.85rem;line-height:1.45}.analytics-consent details[open] p{margin-top:8px}.analytics-consent{max-height:75svh;overflow:auto}@media(max-width:600px){.analytics-consent{padding:14px;gap:10px}.analytics-consent h2{font-size:.95rem;margin-bottom:5px}.analytics-consent button{min-height:44px}.analytics-consent details[open]{max-height:35svh;overflow:auto}}';
const CLARITY_DISCLOSURES = {
 en: ['We use Google Analytics for visits and successful inquiries, and Microsoft Clarity for interaction data, heatmaps and session replay to improve this website. Microsoft receives usage data and may use it for its products and advertising. Form contents are masked. These tools load only after you allow them. You can withdraw consent in Analytics settings.', 'Microsoft Privacy Statement'],
 zh: ['我们使用 Google Analytics 分析访问和成功询盘，使用 Microsoft Clarity 的交互数据、热力图和会话回放改进网站。Microsoft 会接收使用数据，并可能将其用于产品与广告。表单内容会被遮罩。只有允许后才加载这些工具，您可通过“分析设置”撤回同意。', 'Microsoft 隐私声明'],
 fr: ['Nous utilisons Google Analytics pour les visites et les demandes envoyées, et Microsoft Clarity pour les interactions, cartes de chaleur et relectures de session afin d’améliorer ce site. Microsoft reçoit des données d’utilisation et peut les utiliser pour ses produits et la publicité. Le contenu des formulaires est masqué. Ces outils ne se chargent qu’avec votre accord, révocable dans les paramètres d’analyse.', 'Déclaration de confidentialité Microsoft'],
 de: ['Wir verwenden Google Analytics für Besuche und gesendete Anfragen sowie Microsoft Clarity für Interaktionen, Heatmaps und Sitzungswiedergaben zur Verbesserung dieser Website. Microsoft erhält Nutzungsdaten und kann sie für seine Produkte und Werbung verwenden. Formularinhalte werden maskiert. Diese Dienste laden erst nach Ihrer Zustimmung. Sie können diese in den Analyseeinstellungen widerrufen.', 'Microsoft-Datenschutzerklärung'],
 es: ['Usamos Google Analytics para visitas y consultas enviadas, y Microsoft Clarity para interacciones, mapas de calor y grabaciones de sesiones que nos ayudan a mejorar este sitio. Microsoft recibe datos de uso y puede utilizarlos para sus productos y publicidad. El contenido de los formularios se oculta. Solo cargamos estas herramientas con su permiso, que puede retirar en la configuración de análisis.', 'Declaración de privacidad de Microsoft'],
 ar: ['نستخدم Google Analytics لتحليل الزيارات والاستفسارات المرسلة، وMicrosoft Clarity لتحليل التفاعلات والخرائط الحرارية وإعادة تشغيل الجلسات لتحسين الموقع. تتلقى Microsoft بيانات الاستخدام وقد تستخدمها لمنتجاتها وإعلاناتها. تُحجب محتويات النماذج. لا تُحمّل هذه الأدوات إلا بعد موافقتك، ويمكن سحبها من إعدادات التحليلات.', 'بيان خصوصية Microsoft'],
};

export function corncompClarityResponse(response, request) {
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.hostname !== 'corn-comp.com' || url.pathname.startsWith('/design-preview/') || response.status !== 200 || !response.headers.get('content-type')?.includes('text/html')) return response;
  let language = 'en';
  return new HTMLRewriter()
    .on('html', { element(el) { language = (el.getAttribute('lang') || 'en').split('-')[0]; } })
    .on('[data-analytics-consent] p', { element(el) {
      const [text, label] = CLARITY_DISCLOSURES[language] || CLARITY_DISCLOSURES.en;
      el.replace('<details data-analytics-details><summary>' + (CLARITY_SHORT_DISCLOSURES[language] || CLARITY_SHORT_DISCLOSURES.en) + '</summary><p>' + text + ' <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer">' + label + '</a></p></details>', { html: true });
    } })
    .on('form', { element(el) { el.setAttribute('data-clarity-mask', 'true'); } })
    .on('body', { element(el) { el.append('<style id="corncomp-consent-layout">' + CLARITY_COMPACT_CSS + '</style><script id="corncomp-clarity-consent">' + CLARITY_CONSENT_SCRIPT + '</script>', { html: true }); } })
    .transform(response);
}

export async function corncompClarityAssets(request, env) {
  const url = new URL(request.url);
  const htmlRoute = url.pathname.endsWith('/') || /\.html?$/.test(url.pathname);
  if (request.method === 'GET' && url.hostname === 'corn-comp.com' && htmlRoute && !url.pathname.startsWith('/design-preview/')) {
    const headers = new Headers(request.headers);
    headers.delete('if-none-match');
    headers.delete('if-modified-since');
    request = new Request(request, { headers });
  }
  const response = corncompClarityResponse(await env.ASSETS.fetch(request), request);
  if (response.headers.get('content-type')?.includes('text/html') && response.status === 200 && url.hostname === 'corn-comp.com' && !url.pathname.startsWith('/design-preview/')) {
    const updated = new Response(response.body, response);
    updated.headers.delete('etag');
    updated.headers.delete('last-modified');
    updated.headers.set('cache-control', 'no-cache');
    return updated;
  }
  return response;
}
