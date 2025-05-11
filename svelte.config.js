import adapter from '@sveltejs/adapter-static';

const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html', // ← обязательно для SPA
      strict: false           // ← убирает ошибку
    }),
    paths: {
      base: '/admin'
    }
  }
};

export default config;
