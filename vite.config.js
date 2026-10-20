import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { api } from './server/api.mjs';
const enquiryAPI={name:'trip-tastic-enquiries',configureServer(server){server.middlewares.use(api);},configurePreviewServer(server){server.middlewares.use(api);}};
export default defineConfig({plugins:[react(),enquiryAPI],build:{manifest:true,rollupOptions:{input:{main:'index.html',admin:'admin.html'},output:{manualChunks(id){if(id.includes('/node_modules/three/'))return 'three-engine';if(id.includes('/node_modules/@react-three/')||id.includes('/node_modules/react-reconciler/'))return 'react-three-renderer';if(/\/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(id))return 'motion';if(/\/node_modules\/(react|react-dom|scheduler)\//.test(id))return 'react-runtime';}}}},server:{host:'0.0.0.0',allowedHosts:['.e2b.app']},preview:{host:'0.0.0.0',allowedHosts:['.e2b.app']}});
