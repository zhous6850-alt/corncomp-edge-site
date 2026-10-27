export function initializeInquiryForm(form, notice, { params = new URLSearchParams(window.location.search), sourcePath = document.referrer || window.location.pathname, resetVerification = () => window.turnstile?.reset() } = {}) {

    if (!form) return;

    const values = { productName: params.get('product'), productSku: params.get('sku'), category: params.get('category'), sourcePath: params.get('source') || sourcePath };
    for (const [name, value] of Object.entries(values)) if (value && form.elements[name]) form.elements[name].value = value;
    const button = form.querySelector('[type="submit"]');
    const buttonLabel = button.textContent;
    let dismissTimer;
    const dismiss = () => { clearTimeout(dismissTimer); notice.hidden = true; };
    notice.querySelector('button').addEventListener('click', dismiss);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (button.disabled) return;
      dismiss();
      button.disabled = true;
      button.textContent = notice.dataset.sending;
      form.setAttribute('aria-busy', 'true');
      try {
        const response = await fetch('/api/inquiry', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        const result = await response.json();
        if (!response.ok || result.ok !== true) throw new Error('Inquiry rejected');
        notice.classList.remove('is-error');
        notice.querySelector('span').textContent = notice.dataset.success;
        notice.hidden = false;
        dismissTimer = setTimeout(dismiss, 5000);
        form.reset();
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

