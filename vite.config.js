import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.url ? new URL('.', import.meta.url).pathname : process.cwd(), '');
  
  // 백엔드 API 서버 주소 설정
  const API_TARGET = mode === 'production' 
    ? 'http://3.25.213.98:8080' 
    : env.VITE_API_URL || 'http://3.25.213.98:8080';

  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port: 3000,
      proxy: {
        '/api': {
          target: API_TARGET,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },
    build: {
      // 배포 최적화 설정
      outDir: 'dist',
      sourcemap: false, // 프로덕션에서는 소스맵 비활성화
      minify: 'esbuild', // terser 대신 esbuild 사용
      rollupOptions: {
        output: {
          // 청크 분할로 초기 로딩 속도 개선
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            charts: ['chart.js', 'react-chartjs-2']
          }
        }
      },
      // 경고 무시 설정
      chunkSizeWarningLimit: 1000
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
      proxy: {
        '/api': {
          target: API_TARGET,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },
    // 환경 변수 설정
    define: {
      __APP_VERSION__: JSON.stringify(env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __API_URL__: JSON.stringify(API_TARGET + '/api')
    }
  }
})