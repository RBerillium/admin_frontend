
<script>
  import "../app.css";
  import { base } from '$app/paths';
</script>
<!-- style="display: flex; gap: 1rem; padding: 1rem; background: #eee;"-->
<nav style="display: flex; gap: 1rem; padding: 1rem;">
  
  <a href="{base}/apps">📦 Приложения</a>
  <a href="{base}/keys">🔑 Ключи</a>
  <a href="{base}/files">📁 Файлы</a>

</nav>

<slot />