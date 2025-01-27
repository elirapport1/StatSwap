import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    base: '/StatSwap/', // e.g. '/StatSwap/'
    plugins: [react()],
    root: path.resolve(__dirname, '..'),
});