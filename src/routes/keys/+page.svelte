<script>
  import { onMount } from 'svelte';
  import {
    getAllApps,
    getAllKeys,
    generateKeys,
    deleteKey,
    resetHWID,
    deleteExpiredKeys,
    banKey,
    unbanKey
  } from '$lib/api';

  let apps = [];
  let selectedApp = null;
  let keys = [];
  let openDropdown = null;
  let showGenerateDropdown = false;
  let count = 1;
  let durationInDays = 1;
  let note = '';
  let generatedKeys = [];

  // Поиск и пагинация
  let searchQuery = '';
  let currentPage = 1;
  const perPage = 15;

  onMount(async () => {
    const res = await getAllApps();
    apps = res.applications;
  });

  async function loadKeys() {
    if (!selectedApp) return;
    const res = await getAllKeys(selectedApp.name);
    keys = res.keys.sort((a, b) => {
      const aTime = a.expire_date ? new Date(a.expire_date).getTime() : 0;
      const bTime = b.expire_date ? new Date(b.expire_date).getTime() : 0;
      return bTime - aTime;
    });
    currentPage = 1;
  }

  async function handleGenerateKeys() {
    const durationInSeconds = durationInDays * 24 * 60 * 60;
    if (!selectedApp || count <= 0 || durationInSeconds <= 0) return;

    const res = await generateKeys({
      count,
      duration: durationInSeconds,
      application_name: selectedApp.name,
      note
    });

    generatedKeys = res.generated_keys;
    alert(`Сгенерировано: ${generatedKeys.length}`);
    await loadKeys();
    showGenerateDropdown = false;
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
    const keysText = generatedKeys.join('\n');
    navigator.clipboard.writeText(keysText)
      .then(() => alert("Ключи скопированы в буфер обмена!"))
      .catch(err => {
        alert("Не удалось скопировать ключи");
        console.error(err);
      });
  }

  $: filteredKeys = keys.filter(k => k.key_serial.toLowerCase().includes(searchQuery.toLowerCase()));
  $: totalPages = Math.ceil(filteredKeys.length / perPage);
  $: paginatedKeys = filteredKeys.slice((currentPage - 1) * perPage, currentPage * perPage);
</script>

<h2 class="text-2xl font-bold mb-4">Ключи</h2>

{#if apps.length > 0}
  <label>Выбери приложение:</label>
  <select bind:value={selectedApp} on:change={() => { loadKeys(); searchQuery = ''; currentPage = 1; }}>
    <option disabled selected value={null}>-- выбрать --</option>
    {#each apps as app}
      <option value={app}>{app.name}</option>
    {/each}
  </select>
{/if}

{#if selectedApp}
  <div class="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
    <div class="flex gap-2 flex-wrap">
      <button on:click={() => showGenerateDropdown = !showGenerateDropdown}>➕ Сгенерировать</button>
      <button on:click={async () => { await deleteExpiredKeys(); await loadKeys(); }}>🗑️ Удалить истёкшие</button>
    </div>
  </div>

  {#if keys.length > 0}
    <div class="mb-2 flex justify-end">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Поиск по ключу..."
        class="px-3 py-1 rounded border border-gray-600 max-w-sm bg-black text-white"
      />
    </div>
  {/if}

  {#if generatedKeys.length > 0}
    <div class="mt-4">
      <h3>Сгенерированные ключи:</h3>
      <textarea rows="5" readonly class="generated-keys-textarea">
        {generatedKeys.join('\n')}
      </textarea>
      <button on:click={copyKeysToClipboard}>Скопировать в буфер обмена</button>
    </div>
  {/if}

  {#if showGenerateDropdown}
    <div class="generate-dropdown mt-2" on:dblclick={() => showGenerateDropdown = false}>
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
      <button on:click={() => showGenerateDropdown = false}>Отмена</button>
    </div>
  {/if}

  {#if paginatedKeys.length > 0}
    <table class="w-full border border-gray-700 rounded text-sm mt-4">
      <thead>
        <tr class="bg-gray-800">
          <th class="p-2 border-b border-gray-700">Ключ</th>
          <th class="p-2 border-b border-gray-700">Истекает</th>
          <th class="p-2 border-b border-gray-700">Заметка</th>
          <th class="p-2 border-b border-gray-700">Бан</th>
          <th class="p-2 border-b border-gray-700">Действия</th>
        </tr>
      </thead>
      <tbody>
        {#each paginatedKeys as key}
          <tr class="hover:bg-gray-700">
            <td class="p-2 border-b border-gray-700 break-all">{key.key_serial}</td>
            <td class="p-2 border-b border-gray-700">{key.expire_date || '—'}</td>
            <td class="p-2 border-b border-gray-700">{key.note}</td>
            <td class="p-2 border-b border-gray-700">{key.banned === 't' ? 'Да' : 'Нет'}</td>
            <td class="p-2 border-b border-gray-700 relative">
              <button on:click={() => openDropdown = openDropdown === key.key_serial ? null : key.key_serial}>выберите</button>
              {#if openDropdown === key.key_serial}
                <div class="absolute right-0 border border-gray-600 p-2 z-10 bg-black">
                  <ul class="space-y-1">
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

    <!-- 📄 Пагинация -->
    <div class="flex justify-between items-center mt-4 text-sm text-white">
      <span>Страница {currentPage} из {totalPages}</span>
      <div class="space-x-2">
        <button on:click={() => currentPage = Math.max(1, currentPage - 1)} class="px-2 py-1 rounded bg-gray-700 text-white disabled:opacity-50" disabled={currentPage === 1}>
          ← Назад
        </button>
        <button on:click={() => currentPage = Math.min(totalPages, currentPage + 1)} class="px-2 py-1 rounded bg-gray-700 text-white disabled:opacity-50" disabled={currentPage === totalPages}>
          Вперёд →
        </button>
      </div>
    </div>
  {:else}
    <p class="text-gray-400 mt-4">Нет ключей</p>
  {/if}
{:else if apps.length === 0}
  <p>Загрузка списка приложений...</p>
{/if}