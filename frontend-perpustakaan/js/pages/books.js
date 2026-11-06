async function renderBooks(container) {
  container.innerHTML = '<p class="text-slate-500">Memuat data buku...</p>';

  let books = [];
  try {
    books = await BookApi.list();
  } catch (err) {
    container.innerHTML = `<div class="bg-red-100 text-red-700 rounded-lg p-4">${escapeHtml(err.message)}</div>`;
    return;
  }

  container.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">Daftar Buku</h2>
      <button id="btn-add-book" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">+ Tambah Buku</button>
    </div>
    <div class="bg-white rounded-xl shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-left">
          <tr>
            <th class="p-3">ID</th><th class="p-3">Judul</th><th class="p-3">Penulis</th>
            <th class="p-3">Tahun</th><th class="p-3">Stok</th><th class="p-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${books.length
            ? books.map((b) => `
              <tr class="border-t">
                <td class="p-3">${escapeHtml(b.id)}</td>
                <td class="p-3">${escapeHtml(b.judul)}</td>
                <td class="p-3">${escapeHtml(b.penulis)}</td>
                <td class="p-3">${escapeHtml(b.tahun)}</td>
                <td class="p-3">${escapeHtml(b.stok)}</td>
                <td class="p-3 whitespace-nowrap">
                  <button data-edit="${escapeHtml(b.id)}" class="text-blue-600 hover:underline mr-3">Edit</button>
                  <button data-delete="${escapeHtml(b.id)}" class="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>`).join('')
            : '<tr><td colspan="6" class="p-4 text-center text-slate-500">Belum ada buku.</td></tr>'}
        </tbody>
      </table>
    </div>`;

  container.querySelector('#btn-add-book').addEventListener('click', () => openBookForm(container));
  container.querySelectorAll('[data-edit]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const book = books.find((b) => String(b.id) === btn.dataset.edit);
      openBookForm(container, book);
    })
  );
  container.querySelectorAll('[data-delete]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      if (!confirm('Hapus buku ini?')) return;
      try {
        await BookApi.remove(btn.dataset.delete);
        showToast('Buku berhasil dihapus');
        renderBooks(container);
      } catch (err) {
        showToast(err.message, 'error');
      }
    })
  );
}

function openBookForm(container, book = null) {
  const isEdit = book !== null;
  openModal(isEdit ? 'Edit Buku' : 'Tambah Buku', `
    <form id="book-form" class="space-y-3">
      <div>
        <label class="block text-sm font-medium mb-1">Judul</label>
        <input name="judul" value="${escapeHtml(book?.judul)}" class="w-full border rounded-lg px-3 py-2" required>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Penulis</label>
        <input name="penulis" value="${escapeHtml(book?.penulis)}" class="w-full border rounded-lg px-3 py-2" required>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium mb-1">Tahun</label>
          <input name="tahun" type="number" value="${escapeHtml(book?.tahun ?? new Date().getFullYear())}" class="w-full border rounded-lg px-3 py-2" required>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Stok</label>
          <input name="stok" type="number" min="0" value="${escapeHtml(book?.stok ?? 1)}" class="w-full border rounded-lg px-3 py-2" required>
        </div>
      </div>
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" id="book-cancel" class="px-4 py-2 rounded-lg border">Batal</button>
        <button type="submit" class="px-4 py-2 rounded-lg bg-blue-600 text-white">Simpan</button>
      </div>
    </form>`);

  document.getElementById('book-cancel').addEventListener('click', closeModal);
  document.getElementById('book-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = {
      judul: f.get('judul'),
      penulis: f.get('penulis'),
      tahun: Number(f.get('tahun')),
      stok: Number(f.get('stok')),
    };
    try {
      if (isEdit) await BookApi.update(book.id, data);
      else await BookApi.create(data);
      closeModal();
      showToast(isEdit ? 'Buku berhasil diperbarui' : 'Buku berhasil ditambahkan');
      renderBooks(container);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}