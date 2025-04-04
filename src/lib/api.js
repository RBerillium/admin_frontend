const API_BASE = 'http://localhost:18080/api'; // или другой твой порт

const HEADERS = {
  'Content-Type': 'application/json',
  'validation_key': '0xdeadbeefdeadbeef' // замени на актуальный
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
    headers: HEADERS,
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
      headers: HEADERS,
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
