<script>
  import { onMount } from 'svelte';
  import {
    getAllApps,
    getAllKeys,
    generateKeys,
    deleteKey,
    resetHWID,
    validateKey,
    deleteExpiredKeys,
    banKey,
    unbanKey
  } from '$lib/api';

  let apps = [];
  let selectedApp = null;
  let keys = [];
  let openDropdown = null; // key_serial, у которого открыт dropdown
  let showGenerateDropdown = false; // Управление видимостью дропдауна для генерации ключей
  let count = 1; // Количество ключей для генерации
  let durationInDays = 1; // Длительность в днях для ключа
  let note = ''; // Заметка для ключей
  let generatedKeys = []; // Массив для сгенерированных ключей

  onMount(async () => {
    const res = await getAllApps();
    apps = res.applications;
  });

  async function loadKeys() {
    if (!selectedApp) return;
    const res = await getAllKeys(selectedApp.name);
    keys = res.keys;
  }

  async function handleGenerateKeys() {
    const durationInSeconds = durationInDays * 24 * 60 * 60; // Преобразуем дни в секунды
    if (!selectedApp || count <= 0 || durationInSeconds <= 0) return;

    const res = await generateKeys({
      count,
      duration: durationInSeconds,
      application_name: selectedApp.name,
      note // Передаем заметку
    });

    generatedKeys = res.generated_keys; // Сохраняем сгенерированные ключи
    alert(`Сгенерировано: ${generatedKeys.length}`);
    await loadKeys();
    showGenerateDropdown = false; // Скрываем дропдаун после генерации
  }

  const action = {
    async resetHWID(k) {
      await resetHWID(k);
      await loadKeys();
    },
    async delete(k) {
      await deleteKey(k);
      await loadKeys();
    },
    async ban(k) {
      await banKey(k);
      await loadKeys();
    },
    async unban(k) {
      await unbanKey(k);
      await loadKeys();
    }
  };

  function copyKeysToClipboard() {
    const keysText = generatedKeys.join('\n'); // Преобразуем массив ключей в строку с разделением по новой строке
    navigator.clipboard.writeText(keysText) // Используем API для копирования в буфер обмена
      .then(() => {
        alert("Ключи скопированы в буфер обмена!");
      })
      .catch(err => {
        alert("Не удалось скопировать ключи в буфер обмена");
        console.error(err);
      });
  }
</script>

<h2>Ключи</h2>

{#if apps.length > 0}
  <label>Выбери приложение:</label>
  <select bind:value={selectedApp} on:change={loadKeys}>
    <option disabled selected value={null}>-- выбрать --</option>
    {#each apps as app}
      <option value={app}>{app.name}</option>
    {/each}
  </select>
{/if}

{#if selectedApp}
  <div style="margin-top: 1rem;">
    <button on:click={() => showGenerateDropdown = !showGenerateDropdown}>
      ➕ Сгенерировать
    </button>
    <button on:click={async () => { await deleteExpiredKeys(); await loadKeys(); }}>🗑️ Удалить истёкшие</button>
  </div>
  
  {#if generatedKeys.length > 0}
    <div style="margin-top: 1rem;">
      <h3>Сгенерированные ключи:</h3>
      <textarea rows="5" readonly class="generated-keys-textarea">
        {generatedKeys.join('\n')}
      </textarea>
    </div>
    <button on:click={copyKeysToClipboard}>Скопировать в буфер обмена</button>
  {/if}
  
  {#if showGenerateDropdown}
  <div class="generate-dropdown" on:dblclick={() => showGenerateDropdown = false}>
    <div>
      <label>Количество ключей:</label>
      <input type="number" bind:value={count} min="1" max="50" />
    </div>
    <div>
      <label>Длительность (в днях):</label>
      <input type="number" bind:value={durationInDays} min="1" />
    </div>
    <div>
      <label>Заметка:</label>
      <textarea bind:value={note} placeholder="Введите заметку"></textarea>
    </div>
    <button on:click={handleGenerateKeys}>Сгенерировать ключи</button>
    <button on:click={() => showGenerateDropdown = false}>Отмена</button> <!-- Кнопка отмены -->
  </div>
{/if}

  <table border="1" cellpadding="6" style="margin-top: 1rem; border-collapse: collapse; width: 100%;">
    <thead>
      <tr>
        <th>Ключ</th>
        <th>Истекает</th>
        <th>Заметка</th>
        <th>Бан</th>
        <th>Действия</th>
      </tr>
    </thead>
    <tbody>
      {#each keys as key}
        <tr>
          <td>{key.key_serial}</td>
          <td>{key.expire_date || '—'}</td>
          <td>{key.note}</td>
          <td>{key.banned === 't' ? 'Да' : 'Нет'}</td>
          <td style="position: relative;">
            <button on:click={() => openDropdown = openDropdown === key.key_serial ? null : key.key_serial}>выберите</button>

            {#if openDropdown === key.key_serial}
              <div style="position: absolute; border: 1px solid #ccc; padding: 0.5rem; right: 0; z-index: 10;">
                <ul style="list-style: none; padding: 0; margin: 0;">
                  <li><button on:click={() => action.resetHWID(key.key_serial)}>Сброс HWID</button></li>
                  <li><button on:click={() => action.delete(key.key_serial)}>Удалить</button></li>
                  {#if key.banned === 't'}
                    <li><button on:click={() => action.unban(key.key_serial)}>Разбанить</button></li>
                  {:else}
                    <li><button on:click={() => action.ban(key.key_serial)}>Забанить</button></li>
                  {/if}
                </ul>
              </div>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else if apps.length === 0}
  <p>Загрузка списка приложений...</p>
{/if}
