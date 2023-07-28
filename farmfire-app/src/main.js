import { createApp } from 'vue'
import App from './App.vue'

import 'dayjs/locale/ru';

import router from './router.js'

createApp(App).use(router).mount('#app');