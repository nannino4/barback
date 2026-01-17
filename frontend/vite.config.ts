import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import { fileURLToPath, URL } from 'url'
import { configDefaults } from 'vitest/config'

const httpsKeyPath = fileURLToPath(new URL('../barback.it-key.pem', import.meta.url));
const httpsCertPath = fileURLToPath(new URL('../barback.it.pem', import.meta.url));

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        host: 'barback.it',
        port: 5173,
        https: {
            key: fs.readFileSync(httpsKeyPath),
            cert: fs.readFileSync(httpsCertPath),
        },
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
        allowedHosts: [
            'localhost',
            'barback.it',
        ]
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test/setup.ts',
        css: true,
        coverage: {
            reporter: ['text', 'lcov']
        },
        exclude: [...configDefaults.exclude, 'e2e/**']
    }
})
