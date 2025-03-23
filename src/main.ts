import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue'
import router from './router'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
