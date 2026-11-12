import { supabase } from '../lib/supabaseClient';

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || null;
}

async function request(method, path, body = null, isFormData = false) {
  const token = await getAccessToken();
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
  }

  const res = await fetch(`/api${path}`, options);

  if (res.status === 401) {
    await supabase.auth.signOut();
    if (window.location.pathname !== '/masuk' && window.location.pathname !== '/daftar') {
      window.location.href = '/masuk';
    }
    const errData = await res.json().catch(() => ({}));
    const err = new Error(errData.message || 'Sesi berakhir, silakan masuk kembali.');
    err.code = 'UNAUTHORIZED';
    err.status = 401;
    throw err;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || 'Terjadi kesalahan pada permintaan.');
    err.code = data.error || 'UNKNOWN_ERROR';
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  putForm: (path, formData) => request('PUT', path, formData, true),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};
