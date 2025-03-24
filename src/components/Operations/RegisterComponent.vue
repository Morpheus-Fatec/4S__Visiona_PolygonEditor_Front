<script setup>
import { ref } from "vue";
import axios from "axios";

const fileName1 = ref("");
const fileName2 = ref("");
const errorMessage = ref("");
const errorMessage1 = ref("");
const errorMessage2 = ref("");
const geojsonFarm = ref(null);
const geojsonField = ref(null);
const talhoesMap = ref(new Map());
const selectedCoordinates = ref("");
const selectedWeeds = ref([]);

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const fileType = event.target.name;
  errorMessage.value = "";

  if (!file.name.toLowerCase().endsWith(".geojson")) {
    errorMessage.value = "O arquivo deve ser um .geojson";
    if (fileType === "farm") fileName1.value = "";
    if (fileType === "field") fileName2.value = "";
    return;
  }

  if (fileType === "farm") {
    fileName1.value = file.name;
    if (!fileName1.value.toLowerCase().includes("saida")) {
      errorMessage1.value = "Ops, este é para o arquivo de saída, selecione novamente.";
      fileName1.value = "";
      event.target.value = "";
      return;
    }
  }

  if (fileType === "field") {
    fileName2.value = file.name;
    if (!fileName2.value.toLowerCase().includes("automatica")) {
      errorMessage2.value = "Ops, este é para o arquivo automático, selecione novamente.";
      fileName2.value = "";
      event.target.value = "";
      return;
    }
  }

  if (fileType === "farm") fileName1.value = file.name;
  errorMessage1.value = "";
  if (fileType === "field") fileName2.value = file.name;
  errorMessage2.value = "";

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsedData = JSON.parse(e.target.result);

      if (fileType === "farm") {
        geojsonFarm.value = parsedData;
      } else if (fileType === "field") {
        geojsonField.value = parsedData;
      }

    } catch (error) {
      errorMessage.value = "Erro ao processar o arquivo GeoJSON";
      if (fileType === "farm") geojsonFarm.value = null;
      if (fileType === "field") geojsonField.value = null;
    }
  };

  reader.readAsText(file);
};



const sendFile = () => {
  if (!geojsonFarm.value && !geojsonField.value) {
    errorMessage.value = "Nenhum arquivo válido carregado";
    return;
  }
  if (!geojsonFarm.value.features || !Array.isArray(geojsonFarm.value.features) || !geojsonField.value.features || !Array.isArray(geojsonField.value.features)) {
    errorMessage.value = "Arquivo GeoJSON inválido";
    return;
  }

  const talhoes = new Map();

  geojsonFarm.value.features.forEach((featuresFarm, index) => {
    let weedList = [];

    geojsonField.value.features.forEach((featuresField) => {
      if (featuresField.properties.MN_TL === featuresFarm.properties.MN_TL) {

        weedList.push({
          idFarm: featuresField.properties.MN_TL,
          class: featuresField.properties.CLASSE,
          area: featuresField.properties.AREA_M2,
          coordinates: JSON.stringify(featuresField.geometry.coordinates),
        });
      }
    });

    const id = featuresFarm.properties.ID || `talhao_${index}`;
    talhoes.set(id, {
      id,
      idFarm: featuresFarm.properties.MN_TL,
      area: featuresFarm.properties.AREA_HA_TL,
      soil: featuresFarm.properties.SOLO,
      culture: featuresFarm.properties.CULTURA,
      harvest: featuresFarm.properties.SAFRA,
      nameFarm: featuresFarm.properties.FAZENDA,
      coordinates: JSON.stringify(featuresFarm.geometry.coordinates),
      weed: weedList,
    });
  });

  talhoesMap.value = talhoes;

  console.log(`Número de talhões encontrados: ${talhoesMap.value.size}`);
  console.log("Talhões:", talhoesMap.value);

  if (talhoesMap.value.size > 0) {
    const modalRegister = new bootstrap.Modal(document.getElementById('modalGeoJson'));
    modalRegister.show();
    geojsonFarm.value = "";
    geojsonField.value = "";
  } else {
    errorMessage.value = "Nenhum talhão encontrado no arquivo";
  }
};

const openModal = () => {
  const modal = new bootstrap.Modal(document.getElementById('uploadModal'));
  modal.show();
};
const closeModal = (modalId) => {
  const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
  if (modal) {
    modal.hide();
  }
};

defineExpose({ openModal });

const openCoordinatesModal = (talhao) => {
  selectedCoordinates.value = talhao.coordinates;
  const modal = new bootstrap.Modal(document.getElementById("coordinatesModal"));
  modal.show();
};

const openWeedModal = (talhao) => {
  selectedWeeds.value = talhao.weed;
  const modal = new bootstrap.Modal(document.getElementById("weedModal"));
  modal.show();
};

const saveField = async () => {
  try {
    const response = await axios.post("https://morpheus1.free.beeceptor.com/todos", {
      fields: Array.from(talhoesMap.value.values()),
    });
    console.log(response.data);
    const modalRegister = bootstrap.Modal.getInstance(document.getElementById('modalGeoJson'));
    if (modalRegister) {
      modalRegister.hide();
    }
  } catch (error) {
    console.error(error);
  }

const editFarm = (talhao) => {
  
}

};
</script>


<template>
  <Layout>
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-6">
          <div class="p-5 bg-light text-black border border-dark shadow">
            <h2 class="mb-4 text-center">Cadastro de Informações</h2>

            <div class="mb-3">
              <label class="form-label">Selecionar GeoJSON de Saída:</label>
              <input type="file" name="farm" @change="handleFileUpload" class="form-control" />
              <p v-if="fileName1" class="mt-2 text-success">
                Arquivo 1 selecionado: {{ fileName1 }}
              </p>
              <p v-if="errorMessage1" class="text-danger mt-2">{{ errorMessage1 }}</p>
            </div>

            <div class="mb-3">
              <label class="form-label">Selecionar GeoJSON Automático:</label>
              <input type="file" name="field" @change="handleFileUpload" class="form-control" />
              <p v-if="fileName2" class="mt-2 text-success">Arquivo 2 selecionado: {{ fileName2 }}</p>
              <p v-if="errorMessage2" class="text-danger mt-2">{{ errorMessage2 }}</p>
            </div>

            <div class="d-flex justify-content-center">
              <button type="button" class="btn btn-primary mt-3" @click="sendFile">Salvar</button>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="p-5 bg-light text-black border border-dark shadow">

            <div class="bg-primary text-white p-3 ">
              <h2 class="mb-4 text-center">Cadastro de Imagem</h2>
            </div>

            <div class="mb-3">
              <label class="form-label">Selecionar Imagem:</label>
              <input type="file" class="form-control" accept="image/*" />
            </div>

            <div class="d-flex justify-content-center">
              <button type="button" class="btn btn-primary mt-3">Salvar</button>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div class="modal fade" id="modalGeoJson" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Cadastro de Informações</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <table class="table">
              <thead class="table-dark">
                <tr>
                  <th scope="col">Talhão</th>
                  <th scope="col">Nome da fazenda</th>
                  <th scope="col">Área</th>
                  <th scope="col">Dados do talhão</th>
                  <th scope="col">Daninhas</th>
                  <th scope="col">Opções</th>
                </tr>
              </thead>
              <tbody class="table-group-divider">
                <tr v-for="talhao in Array.from(talhoesMap.values())" :key="talhao.id">
                  <td>{{ talhao.idFarm }}</td>
                  <td>{{ talhao.nameFarm }}</td>
                  <td>{{ talhao.area }}</td>
                  <td>
                    Cultura: {{ talhao.culture }}<br />
                    Safra: {{ talhao.harvest }}<br />
                    Solo: {{ talhao.soil }}<br />
                    <button class="btn btn-info btn-sm" @click="openCoordinatesModal(talhao)">Ver Coordenadas</button>
                  </td>
                  <td>
                    <button class="btn btn-warning btn-sm" @click="openWeedModal(talhao)">Ver Daninhas</button>
                  </td>
                  <td>
                    <button class="btn btn-success btn-sm" @click="editFarm"(talhao)>Editar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
            <button type="button" class="btn btn-primary" @click="saveField">Salvar</button>
          </div>
        </div>
      </div>
      <!-- Modal de Coordenadas -->
      <div class="modal fade" id="coordinatesModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Coordenadas do Talhão</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <pre>{{ selectedCoordinates }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Daninhas -->
      <div class="modal fade" id="weedModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Daninhas do Talhão</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <ul>
                <li v-for="weed in selectedWeeds" :key="weed.idFarm">
                  {{ weed.class }} - {{ weed.area }} m²
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  </Layout>
</template>


<style scoped>
.text-danger {
  margin-bottom: 1rem;
}

.floating-button button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
</style>