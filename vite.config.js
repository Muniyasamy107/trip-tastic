import { defineConfig } from 'vite';
import { api } from './server/api.mjs';
const enquiryAPI={name:'trip-tastic-enquiries',configureServer(server){server.middlewares.use(api);},configurePreviewServer(server){server.middlewares.use(api);}};
export default defineConfig({plugins:[enquiryAPI],build:{rollupOptions:{input:{main:'index.html',admin:'admin.html'}}},server:{host:'0.0.0.0',allowedHosts:['.e2b.app']},preview:{host:'0.0.0.0',allowedHosts:['.e2b.app']}});
