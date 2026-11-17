import { initializeInquiryProducts } from './inquiry-products-form.mjs';
export function initializeInquiryForm(form, notice, { params = new URLSearchParams(window.location.search), sourcePath = document.referrer || window.location.pathname, resetVerification = () => window.turnstile?.reset() } = {}) {

    if (!form) return;

    const products=initializeInquiryProducts(form);
    if(products)products.append(params);
    const values = { productName: params.get('product'), productSku: params.get('sku'), category: params.get('category'), sourcePath: params.get('source') || sourcePath };
    for (const [name, value] of Object.entries(values)) if (value && (!products || name==='sourcePath') && form.elements[name]) form.elements[name].value = value;
    const button = form.querySelector('[type="submit"]');
    const buttonLabel = button.textContent;
    let dismissTimer;
    const dismiss = () => { clearTimeout(dismissTimer); notice.hidden = true; };
    notice.querySelector('button').addEventListener('click', dismiss);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (button.disabled) return;
      dismiss();
      const fields = Object.fromEntries(new FormData(form));
      if (!String(fields['cf-turnstile-response'] || '').trim()) {
        const language = (document.documentElement?.lang || 'en').split('-')[0];
        const messages = {
          en: 'Please complete the security verification below before sending. Your entries have been kept.',
          zh: '请先完成下方真人验证，再发送询盘。已保留您填写的内容。',
          fr: 'Veuillez terminer la vérification de sécurité ci-dessous avant l’envoi. Vos informations sont conservées.',
          es: 'Complete la verificación de seguridad antes de enviar. Sus datos se han conservado.',
          de: 'Bitte schließen Sie vor dem Senden die Sicherheitsüberprüfung ab. Ihre Eingaben bleiben erhalten.',
          ar: 'يرجى إكمال التحقق الأمني أدناه قبل الإرسال. تم الاحتفاظ بالبيانات التي أدخلتها.',
        };
        notice.classList.add('is-error');
        notice.querySelector('span').textContent = messages[language] || messages.en;
        notice.hidden = false;
        form.querySelector('.cf-turnstile')?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
        return;
      }
      button.disabled = true;
      button.textContent = notice.dataset.sending;
      form.setAttribute('aria-busy', 'true');
      try {
        const response = await fetch('/api/inquiry', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({...fields,...(products?{products:products.serialize()}:{})}),
        });
        const result = await response.json();
        if (!response.ok || result.ok !== true) throw new Error('Inquiry rejected');
        notice.classList.remove('is-error');
        notice.querySelector('span').textContent = notice.dataset.success;
        notice.hidden = false;
        dismissTimer = setTimeout(dismiss, 5000);
        form.reset();
        products?.clear();
        if (form.elements.sourcePath) form.elements.sourcePath.value = window.location.pathname;
        window.dispatchEvent(new CustomEvent('corncomp:inquiry-sent'));
      } catch {
        notice.classList.add('is-error');
        notice.querySelector('span').textContent = notice.dataset.error;
        notice.hidden = false;
      } finally {
        button.disabled = false;
        button.textContent = buttonLabel;
        form.removeAttribute('aria-busy');
        resetVerification();
      }
    });

}

