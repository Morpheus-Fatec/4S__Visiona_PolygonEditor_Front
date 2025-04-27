import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue'
import router from './router'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'vue-leaflet-markercluster/dist/style.css'
import 'bootstrap-icons/font/bootstrap-icons.css';

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
