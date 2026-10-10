import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
const root=process.cwd()
export default defineConfig({plugins:[react(),tailwindcss()],resolve:{alias:[{find:'@/lib/api',replacement:path.join(root,'.scratch/flux-fidelity/api.ts')},{find:'@tanstack/react-query',replacement:path.join(root,'.scratch/flux-fidelity/query.ts')},{find:'@',replacement:path.join(root,'src')}]},server:{host:'127.0.0.1',port:18583,strictPort:true,hmr:false},cacheDir:'.scratch/flux-fidelity/vite-cache'})
