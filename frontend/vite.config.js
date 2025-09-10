import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: '0.0.0.0', 
        port: 5173, 
        allowedHosts: ['back2campus1.onrender.com'],
        proxy: {
            '/api': {
                target: 'https://back2campus.onrender.com',
                changeOrigin: true,
                secure: false,
            }
        }
    }
});
