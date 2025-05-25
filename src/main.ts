import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue'
import router from './router'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'vue-leaflet-markercluster/dist/style.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler 
} from 'chart.js'

Chart.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler 
)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
