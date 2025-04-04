<script>
    export let show = false;
    export let appName = '';
    export let onConfirm = () => {};
    export let onCancel = () => {};
  
    let input = '';
    let error = '';
  </script>
  
  {#if show}
    <div class="backdrop" on:click={onCancel}>
      <div class="modal" on:click|stopPropagation>
        <h3>Удаление приложения</h3>
        <p>Для подтверждения введите: <strong>{appName}</strong></p>
  
        <input
          bind:value={input}
          placeholder="Введите точное название"
        />
  
        {#if error}
          <p style="color: red;">{error}</p>
        {/if}
  
        <div style="margin-top: 1rem;">
          <button on:click={() => {
            if (input === appName) {
              onConfirm();
            } else {
              error = 'Неверное имя';
            }
          }}>✅ Подтвердить</button>
  
          <button on:click={onCancel} style="margin-left: 1rem;">❌ Отмена</button>
        </div>
      </div>
    </div>
  {/if}
  
  <style>
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
  
    .modal {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      width: 320px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
  
    input {
      width: 100%;
      padding: 0.5rem;
      margin-top: 0.5rem;
    }
  </style>
  