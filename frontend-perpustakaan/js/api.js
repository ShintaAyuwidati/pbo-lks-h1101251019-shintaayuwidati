// Klien HTTP generik: semua request ke backend lewat sini
class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(method, path, body = null) {
    const options = { method, headers: { Accept: 'application/json' } };
    if (body !== null) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    let response;
    try {
      response = await fetch(this.baseUrl + path, options);
    } catch (err) {
      throw new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan di ' + this.baseUrl);
    }

    const json = await response.json().catch(() => null);
    if (!response.ok || !json || json.success === false) {
      throw new Error((json && json.message) || `Permintaan gagal (HTTP ${response.status})`);
    }
    return json;
  }

  get(path) { return this.request('GET', path); }
  post(path, body) { return this.request('POST', path, body); }
  put(path, body) { return this.request('PUT', path, body); }
  delete(path) { return this.request('DELETE', path); }
}

const api = new ApiClient(BASE_URL);

// Service per resource (satu tanggung jawab per objek)
const BookApi = {
  list: async () => (await api.get('/api/books')).data,
  create: (data) => api.post('/api/books', data),
  update: (id, data) => api.put(`/api/books/${id}`, data),
  remove: (id) => api.delete(`/api/books/${id}`),
};

const CategoryApi = {
  list: async () => (await api.get('/api/categories')).data,
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  remove: (id) => api.delete(`/api/categories/${id}`),
};