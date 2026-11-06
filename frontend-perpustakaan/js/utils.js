// Mencegah XSS: ubah karakter HTML menjadi teks biasa
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Notifikasi di kanan atas. type: 'success' | 'error'
function showToast(message, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// Modal sederhana. Panggil closeModal() untuk menutup.
function openModal(title, bodyHtml) {
  closeModal();
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold">${escapeHtml(title)}</h3>
          <button type="button" id="modal-close" class="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
        </div>
        ${bodyHtml}
      </div>
    </div>`;
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  });
  return root;
}

function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
}