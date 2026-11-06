async function renderCategories(container) {
  container.innerHTML = '<p class="text-slate-500">Memuat data kategori...</p>';

  let categories = [];
  try {
    categories = await CategoryApi.list();
  } catch (err) {
    container.innerHTML = `<div class="bg-red-100 text-red-700 rounded-lg p-4">${escapeHtml(err.message)}</div>`;
    return;
  }

  container.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">Daftar Kategori</h2>
      <button id="btn-add-cat" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">+ Tambah Kategori</button>
    </div>
    <div class="bg-white rounded-xl shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-left">
          <tr><th class="p-3">ID</th><th class="p-3">Nama</th><th class="p-3">Deskripsi</th><th class="p-3">Aksi</th></tr>
        </thead>
        <tbody>
          ${categories.length
            ? categories.map((c) => `
              <tr class="border-t">
                <td class="p-3">${escapeHtml(c.id)}</td>
                <td class="p-3">${escapeHtml(c.nama)}</td>
                <td class="p-3">${escapeHtml(c.deskripsi)}</td>
                <td class="p-3 whitespace-nowrap">
                  <button data-edit="${escapeHtml(c.id)}" class="text-blue-600 hover:underline mr-3">Edit</button>
                  <button data-delete="${escapeHtml(c.id)}" class="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>`).join('')
            : '<tr><td colspan="4" class="p-4 text-center text-slate-500">Belum ada kategori.</td></tr>'}
        </tbody>
      </table>
    </div>`;

  container.querySelector('#btn-add-cat').addEventListener('click', () => openCategoryForm(container));
  container.querySelectorAll('[data-edit]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const cat = categories.find((c) => String(c.id) === btn.dataset.edit);
      openCategoryForm(container, cat);
    })
  );
  container.querySelectorAll('[data-delete]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      if (!confirm('Hapus kategori ini?')) return;
      try {
        await CategoryApi.remove(btn.dataset.delete);
        showToast('Kategori berhasil dihapus');
        renderCategories(container);
      } catch (err) {
        showToast(err.message, 'error');
      }
    })
  );
}

function openCategoryForm(container, category = null) {
  const isEdit = category !== null;
  openModal(isEdit ? 'Edit Kategori' : 'Tambah Kategori', `
    <form id="cat-form" class="space-y-3">
      <div>
        <label class="block text-sm font-medium mb-1">Nama</label>
        <input name="nama" value="${escapeHtml(category?.nama)}" class="w-full border rounded-lg px-3 py-2" required>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Deskripsi</label>
        <textarea name="deskripsi" rows="3" class="w-full border rounded-lg px-3 py-2">${escapeHtml(category?.deskripsi)}</textarea>
      </div>
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" id="cat-cancel" class="px-4 py-2 rounded-lg border">Batal</button>
        <button type="submit" class="px-4 py-2 rounded-lg bg-orange-500 text-white">Simpan</button>
      </div>
    </form>`);

  document.getElementById('cat-cancel').addEventListener('click', closeModal);
  document.getElementById('cat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = { nama: f.get('nama'), deskripsi: f.get('deskripsi') };
    try {
      if (isEdit) await CategoryApi.update(category.id, data);
      else await CategoryApi.create(data);
      closeModal();
      showToast(isEdit ? 'Kategori berhasil diperbarui' : 'Kategori berhasil ditambahkan');
      renderCategories(container);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
