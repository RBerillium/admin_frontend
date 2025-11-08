
<script>
    import { onMount } from 'svelte';
    import {
      getAllApps,
      uploadFile,
      getAllFiles,
      deleteFile,
      updateFile
    } from '$lib/api';
  
    let apps = [];
    let selectedApp = '';
    let file = null;
    let files = [];
    let uploading = false;
  
    let showConfirm = false;
    let fileToDelete = null;
    let openDropdown = null;
  
    // 🔍 Поиск
    let searchQuery = '';
  
    // 📄 Пагинация
    let currentPage = 1;
    const perPage = 15;
  
    onMount(async () => {
      const res = await getAllApps();
      apps = res.applications || [];
    });
  
    async function handleUpload() {
      if (!selectedApp || !file) return;
      uploading = true;
  
      try {
        await uploadFile({ application_name: selectedApp, file });
        file = null;
        await loadFiles();
      } catch (err) {
        console.error(err);
        alert('Ошибка при загрузке файла');
      } finally {
        uploading = false;
      }
    }
  
    async function loadFiles() {
      files = [];
      try {
        const res = await getAllFiles(selectedApp);
        files = res.sort((a, b) => b.uploaded_at - a.uploaded_at);
        currentPage = 1;
      } catch (err) {
        console.error('Ошибка при получении файлов:', err);
      }
    }
  
    async function confirmDelete() {
      if (!fileToDelete) return;
  
      try {
        const res = await deleteFile(fileToDelete.id);
        if (res.ok) {
          await loadFiles();
        } else {
          console.error('Ошибка при удалении файла. Код:', res.status);
        }
      } catch (err) {
        console.error('Ошибка при удалении файла:', err);
      } finally {
        showConfirm = false;
        fileToDelete = null;
      }
    }
  
    // Обновление файла
    async function updateFilePrompt(file) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '*/*';
      input.onchange = async () => {
        const newFile = input.files[0];
        if (newFile) {
          const formData = new FormData();
          formData.append('file_id', file.id);
          formData.append('application_name', selectedApp);
          formData.append('file', newFile);
          try {
            const res = await updateFile(formData); // Отправляем данные на сервер
            if (res.ok) {
              alert('Файл обновлён');
              await loadFiles(); // Загружаем обновленные файлы
            } else {
              alert('Ошибка при обновлении файла');
            }
          } catch (err) {
            alert('Ошибка запроса');
          }
        }
      };
      input.click(); // Открыть окно выбора файла
    }
  
    $: filteredFiles = files.filter(f => f.file_path.toLowerCase().includes(searchQuery.toLowerCase()));
    $: totalPages = Math.ceil(filteredFiles.length / perPage);
    $: paginatedFiles = filteredFiles.slice((currentPage - 1) * perPage, currentPage * perPage);
  </script>
  
  <h1 class="text-2xl font-bold mb-4">Загрузка файлов</h1>
  
  <div class="flex gap-4 items-center mb-4">
    <select bind:value={selectedApp} on:change={loadFiles} class="px-2 py-1 rounded border border-gray-600 bg-black text-white">
      <option value="" disabled selected>Выберите приложение</option>
      {#each apps as app}
        <option value={app.name}>{app.name}</option>
      {/each}
    </select>
  
    <input type="file" on:change={(e) => file = e.target.files[0]} class="text-sm" />
  
    <button
      on:click={handleUpload}
      disabled={uploading || !file || !selectedApp}
      class="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
    >
      {uploading ? 'Загрузка...' : 'Загрузить файл'}
    </button>
  </div>
  
  <!-- 🔍 Поиск -->
  {#if files.length > 0}
    <div class="mb-2">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Поиск по имени файла..."
        class="px-3 py-1 rounded border border-gray-600 w-full max-w-sm bg-black text-white"
      />
    </div>
  {/if}
  
  {#if paginatedFiles.length > 0}
    <table class="w-full border border-gray-700 rounded text-sm">
      <thead>
        <tr class="bg-gray-800">
          <th class="p-2 border-b border-gray-700">ID</th>
          <th class="p-2 border-b border-gray-700">Файл</th>
          <th class="p-2 border-b border-gray-700">Дата загрузки</th>
          <th class="p-2 border-b border-gray-700">Действие</th>
        </tr>
      </thead>
      <tbody>
        {#each paginatedFiles as f}
          <tr class="hover:bg-gray-700">
            <td class="p-2 border-b border-gray-700">{f.id}</td>
            <td class="p-2 border-b border-gray-700 break-all">{f.file_path}</td>
            <td class="p-2 border-b border-gray-700">{new Date(f.uploaded_at * 1000).toLocaleString()}</td>
            <td class="p-2 border-b border-gray-700 relative">
              <button on:click={() => openDropdown = openDropdown === f.id ? null : f.id}>⋮</button>
              {#if openDropdown === f.id}
                <div class="absolute right-0 bg-black border border-gray-600 p-2 z-10">
                  <ul class="space-y-1">
                    <li><button on:click={() => updateFilePrompt(f)}>Изменить</button></li>
                    <li><button on:click={() => { fileToDelete = f; showConfirm = true; }}>Удалить</button></li>
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
  {:else if selectedApp}
    <p class="text-gray-400 mt-4">Нет файлов</p>
  {/if}
  
  <!-- 🧱 Модалка подтверждения удаления -->
  {#if showConfirm}
    <div class="generate-dropdown z-50">
      <h3 class="text-lg font-semibold mb-2">Удалить файл</h3>
      <p class="mb-2 text-sm text-gray-300">
        Вы действительно хотите удалить файл:<br />
        <strong class="text-white break-all">{fileToDelete.file_path}</strong>?
      </p>
      <div class="mt-4 flex justify-end gap-2">
        <button class="px-3 py-1 bg-gray-300 rounded text-black" on:click={() => { fileToDelete = null; showConfirm = false; }}>
          Отмена
        </button>
        <button class="px-3 py-1 bg-red-600 text-white rounded" on:click={confirmDelete}>
          Удалить
        </button>
      </div>
    </div>
  {/if}
  