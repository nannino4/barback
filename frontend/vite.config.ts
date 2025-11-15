import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'
import { configDefaults } from 'vitest/config'

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
        allowedHosts: [
            'localhost',
            'barback.it',
            'reconstructionary-marylou-solubly.ngrok-free.dev',
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
