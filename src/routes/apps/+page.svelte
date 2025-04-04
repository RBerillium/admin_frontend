<script context="module">
  export const ssr = false;
</script>

<script>
  import { onMount } from 'svelte';
  import {
    getAllApps,
    pauseApp,
    unpauseApp,
    deleteApp,
    createApp
  } from '$lib/api';

  let apps = [];
  let appToDelete = null;
  let showConfirm = false;
  let confirmName = '';
  let showCreateModal = false;
  let newAppName = '';

  async function refresh() {
    try {
      const res = await getAllApps();
      apps = res.applications || [];
    } catch (err) {
      console.error('Ошибка при получении приложений:', err);
    }
  }

  onMount(refresh);

  async function handlePause(app) {
    await pauseApp(app.name);
    await refresh();
  }

  async function handleUnpause(app) {
    await unpauseApp(app.name);
    await refresh();
  }

  async function handleDeleteConfirmed() {
    if (appToDelete && confirmName === appToDelete.name) {
      await deleteApp(appToDelete.name);
      appToDelete = null;
      confirmName = '';
      showConfirm = false;
      await refresh();
    }
  }

  async function handleCreateApp() {
    if (newAppName.trim().length === 0) return;
    await createApp(newAppName.trim());
    newAppName = '';
    showCreateModal = false;
    await refresh();
  }

  function formatUnixTimestamp(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleString();
  }
</script>

<!-- Модалка создания -->
{#if showCreateModal}
  <div class="generate-dropdown">
    <label>Введите название приложения:</label>
    <input
      bind:value={newAppName}
      class="border border-gray-400 px-2 py-1 w-full rounded"
      placeholder="Название приложения"
    />
    <div class="mt-4 flex justify-end gap-2">
      <button
      class="px-3 py-1 bg-blue-600 text-white rounded"
      on:click={handleCreateApp}
    >
      Создать
    </button>
    
      <button class="px-3 py-1 bg-gray-300 rounded" on:click={() => { showCreateModal = false; newAppName = ''; }}>
        Отмена
      </button>

    </div>
  </div>
{/if}

<!-- Модалка подтверждения удаления -->
{#if showConfirm}
  <div class="generate-dropdown">
    <h3 class="text-lg font-semibold mb-2">Удалить приложение</h3>
    <p class="mb-2">
      Введите название <strong>{appToDelete?.name}</strong> для подтверждения:
    </p>
    <input
      bind:value={confirmName}
      class="border border-gray-400 px-2 py-1 w-full rounded"
      placeholder="Точное название..."
    />
    {#if confirmName && confirmName !== appToDelete?.name}
      <p class="text-red-500 text-sm mt-1">Неверное имя</p>
    {/if}
    <div class="mt-4 flex justify-end gap-2">
      <button class="px-3 py-1 bg-gray-300 rounded" on:click={() => { showConfirm = false; appToDelete = null; confirmName = ''; }}>
        Отмена
      </button>
      <button
        class="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
        on:click={handleDeleteConfirmed}
        disabled={confirmName !== appToDelete?.name}
      >
        Удалить
      </button>
    </div>
  </div>
{/if}

<!-- Кнопка создания приложения -->
<div class="flex justify-between items-center mb-6">
  <h2 class="text-2xl font-bold text-white">Приложения</h2>
  <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" on:click={() => showCreateModal = true}>
    + Создать приложение
  </button>
</div>

{#if apps.length === 0}
  <p class="text-gray-400">Нет приложений</p>
{/if}

<table class="app-table">
  <thead>
    <tr>
      <th>Приложение</th>
      <th>ID</th>
      <th>Дата создания</th>
      <th>Статус</th>
      <th>Действия</th>
    </tr>
  </thead>
  <tbody>
    {#each apps as app}
      <tr>
        <td>{app.name}</td>
        <td>{app.id}</td>
        <td>{formatUnixTimestamp(app.created_at)}</td>
        <td>
          <button
            class="status-button"
            on:click={() => app.paused ? handleUnpause(app) : handlePause(app)}
          >
            {app.paused ? '▶ Снять' : '⏸ Пауза'}
          </button>
        </td>
        <td>
          <button
            class="delete-button"
            on:click={() => {
              appToDelete = app;
              showConfirm = true;
            }}
          >
            🗑 Удалить
          </button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
