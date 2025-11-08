const API_BASE = 'https://moonshinesolutions.ru/api';  // или другой твой порт

const HEADERS = {
  'Content-Type': 'application/json',
  'validation_key': 'eb4e108690c0342e131050866bf68fa17d8b484eb7dfdc0be7fe1e820efee52a' // замени на актуальный
};

const PUBLIC_HEADERS = {
  'Content-Type': 'application/json',
  'pathology': '624a1831398676bc9c1affed3c309911ce6386f7fd9ca2420833a22d171cab9d' // замени на актуальный
};
// --- Приложения ---

export async function getAllApps() {
  const res = await fetch(`${API_BASE}/get_all_apps`, {
    method: 'GET',
    headers: HEADERS
  });
  return await res.json();
}

export async function createApp(application_name) {	
  return await fetch(`${API_BASE}/create_application`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ application_name })
  });
}

export async function deleteApp(application_name) {
  return await fetch(`${API_BASE}/delete_app`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ application_name })
  });
}

export async function pauseApp(application_name) {
  return await fetch(`${API_BASE}/pause_app`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ application_name })
  });
}

export async function unpauseApp(application_name) {
  return await fetch(`${API_BASE}/unpause_app`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ application_name })
  });
}

// --- Ключи ---

export async function getAllKeys(application_name) {
  return await fetch(`${API_BASE}/get_all_keys`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ application_name })
  }).then(res => res.json());
}

export async function deleteKey(key) {
  return await fetch(`${API_BASE}/delete_key`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ key })
  });
}

export async function resetHWID(key) {
  return await fetch(`${API_BASE}/reset_hwid`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ key })
  });
}

export async function validateKey({ key, application_name, hardware_id_hash }) {
  return await fetch(`${API_BASE}/validate_key`, {
    method: 'POST',
    headers: PUBLIC_HEADERS,
    body: JSON.stringify({ key, application_name, hardware_id_hash })
  }).then(res => res.json());
}

export async function generateKeys(params) {
  return await fetch(`${API_BASE}/generate_keys`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(params)
  }).then(res => res.json());
}

export async function deleteExpiredKeys() {
  return await fetch(`${API_BASE}/delete_expired_keys`, {
    method: 'GET',
    headers: HEADERS
  });
}

export async function banKey(key) {
  return await fetch(`${API_BASE}/ban_key`, {
    method: 'POST',
    headers: PUBLIC_HEADERS,
    body: JSON.stringify({ key })
  });
}

export async function unbanKey(key) {
  return await fetch(`${API_BASE}/unban_key`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ key })
  });
}

export async function uploadFile({ application_name, file }) {
  const formData = new FormData();
  formData.append('application_name', String(application_name));
  formData.append('file', file);

  return await fetch(`${API_BASE}/upload_file`, {
    method: 'POST',
    headers: {
        'validation_key': HEADERS['validation_key']
    },
    body: formData
  });
}

export async function getAllFiles(application_name) {
  const url = new URL(`${API_BASE}/get_all_files`);
  url.searchParams.append('application_name', application_name);

  return await fetch(url, {
    method: 'GET',
    headers: HEADERS
  }).then(res => res.json());
}

export async function deleteFile(id) {
  const url = new URL(`${API_BASE}/delete_file`);
  url.searchParams.append('id', id);

  return await fetch(url, {
    method: 'GET',
    headers: HEADERS
  });
}

export async function updateFile(formData) {
  return await fetch(`${API_BASE}/update_file`, {
    method: 'POST',
    headers: {
      'validation_key': HEADERS.validation_key
    },
    body: formData
  });
}