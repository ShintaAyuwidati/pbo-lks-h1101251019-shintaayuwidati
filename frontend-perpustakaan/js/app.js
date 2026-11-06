// Router berbasis hash: #/dashboard, #/books, #/categories
const routes = {
  dashboard: renderDashboard,
  books: renderBooks,
  // renderCategories baru dibuat di Langkah 19
  categories: typeof renderCategories === 'function'
    ? renderCategories
    : (el) => {
        el.innerHTML = '<p class="text-slate-500">Halaman Kategori dibuat di Langkah 19.</p>';
      },
};

function navigate() {
  const name = (location.hash.replace('#/', '') || 'dashboard');
  const render = routes[name] || routes.dashboard;
  const activeName = routes[name] ? name : 'dashboard';

  document.querySelectorAll('[data-nav]').forEach((a) =>
    a.classList.toggle('active', a.dataset.nav === activeName)
  );
  render(document.getElementById('app'));
}

window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', navigate);