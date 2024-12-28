import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: '/StatSwap/', // e.g. '/StatSwap/'
    plugins: [react()],
});