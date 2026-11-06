async function renderDashboard(container) {
  container.innerHTML = '<p class="text-slate-500">Memuat dashboard...</p>';

  try {
    const [books, categories] = await Promise.all([BookApi.list(), CategoryApi.list()]);
    const terbaru = books.slice(0, 5); // API mengurutkan id terbaru lebih dulu

    container.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">Dashboard</h2>
      <div class="grid sm:grid-cols-2 gap-4 mb-6">
        <div class="bg-blue-600 text-white rounded-xl p-5 shadow">
          <p class="text-sm opacity-80">Total Buku</p>
          <p class="text-4xl font-bold">${books.length}</p>
        </div>
        <div class="bg-orange-500 text-white rounded-xl p-5 shadow">
          <p class="text-sm opacity-80">Kategori</p>
          <p class="text-4xl font-bold">${categories.length}</p>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow p-5">
        <h3 class="font-semibold mb-3">5 Buku Terbaru</h3>
        <ul class="divide-y">
          ${terbaru.length
            ? terbaru.map((b) => `
              <li class="py-2 flex justify-between gap-3">
                <span><b>${escapeHtml(b.judul)}</b> <span class="text-slate-500">— ${escapeHtml(b.penulis)}</span></span>
                <span class="text-slate-500 whitespace-nowrap">${escapeHtml(b.tahun)}</span>
              </li>`).join('')
            : '<li class="py-2 text-slate-500">Belum ada buku.</li>'}
        </ul>
      </div>`;
  } catch (err) {
    container.innerHTML = `<div class="bg-red-100 text-red-700 rounded-lg p-4">${escapeHtml(err.message)}</div>`;
  }
}