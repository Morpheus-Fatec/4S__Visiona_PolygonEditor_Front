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
const originalField = ref(new Map());


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

    const id = featuresFarm.properties.ID || `${index}`;
    try{
    talhoes.set(id, {
      id,
      editEnabled: false,
      isValid: true,
      idFarm: featuresFarm.properties.MN_TL,
      area: featuresFarm.properties.AREA_HA_TL,
      soil: featuresFarm.properties.SOLO,
      culture: featuresFarm.properties.CULTURA,
      harvest: featuresFarm.properties.SAFRA,
      nameFarm: featuresFarm.properties.FAZENDA,
      coordinates: JSON.stringify(featuresFarm.geometry.coordinates),
      weed: weedList,
    });
  }
  catch(e){
    console.log(e);
  }
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
  let hasError = false;

  talhoesMap.value.forEach((talhao) => {
    // Validando apenas os campos obrigatórios
    const isNameValid = !!talhao.nameFarm?.trim();
    const isAreaValid = talhao.area !== null && talhao.area !== undefined && !isNaN(talhao.area);
    const isCultureValid = !!talhao.culture?.trim();
    const isHarvestValid = !!talhao.harvest?.trim();
    const isSoilValid = !!talhao.soil?.trim();

    // Definindo individualmente a validade de cada campo
    talhao.isValid = isNameValid && isAreaValid && isCultureValid && isHarvestValid && isSoilValid;

    if (!talhao.isValid) {
      hasError = true;
    }
  });

  if (hasError) {
    errorMessage.value = "Preencha os campos obrigatórios.";
    return;
  }


  try {
    const response = await axios.post("https://morpheus1.free.beeceptor.com/todos", Array.from(talhoesMap.value.values()));
    console.log(response.data);
  } catch (error) {
    console.error(error);
  } finally {
    const modalElement = document.getElementById('modalGeoJson');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
    fileName1.value = "";
    fileName2.value = "";
    geojsonFarm.value = null;
    geojsonField.value = null;
    document.querySelector("input[name='farm']").value = "";
    document.querySelector("input[name='field']").value = "";
  }
};

const editField = (talhao) => {
  if (!originalField.value.has(talhao.id)) {
    originalField.value.set(talhao.id, { ...talhao });
  }
  talhoesMap.value.get(talhao.id).editEnabled = true;

};

const cancelEdit = (talhao) => {
  const originalData = originalField.value.get(talhao.id);
  if (originalData) {
    Object.assign(talhoesMap.value.get(talhao.id), originalData);
    originalField.value.delete(talhao.id);
  }
  talhoesMap.value.get(talhao.id).editEnabled = false;
};
</script>


<template>
  <Layout>
    <div class="row">
      <div class="col-md-6">
        <div class="p-0 bg-light text-black border border-1 shadow rounded">
          <div class="bg-primary text-white fw-bold text-center w-100 m-0 p-2" style="margin-top: -1px;">
            <br>
            <h5 class="card-title">Cadastro de Informações</h5>
            <br>
          </div>
          <div class="p-5">

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
              <button type="button" class="btn btn-primary mt-3" @click="sendFile">Salvar dados</button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="p-0 bg-light text-black border border-1 shadow rounded">
          <div class="bg-primary text-white fw-bold text-center w-100 m-0 p-2" style="margin-top: -1px;">
            <br>
            <h5 class="card-title">Upload de Imagens</h5>
            <br>
          </div>
          <div class="p-5">

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
            <table class="table table-striped table-hover ">
              <thead class="table-dark">
                <tr>
                  <th scope="col">Talhão</th>
                  <th scope="col">Nome da fazenda</th>
                  <th scope="col">Área</th>
                  <th scope="col">Propriedades</th>
                  <th scope="col">Classificação</th>
                  <th scope="col">Opções</th>
                </tr>
              </thead>
              <tbody class="table-group-divider">
                <tr v-for="talhao in Array.from(talhoesMap.values())" :key="talhao.id">
                  <td>{{ talhao.idFarm }}</td>
                  <td>
                    <span v-if="!talhao.editEnabled">
                      {{ talhao.nameFarm }}
                    </span>
                    <input v-if="talhao.editEnabled" type="text" v-model="talhao.nameFarm" class="form-control w-50"
                      :class="{ 'is-invalid': talhao.editEnabled && !talhao.nameFarm?.trim() }" />
                    <div v-if="talhao.editEnabled && !talhao.nameFarm?.trim()" class="invalid-feedback">Campo
                      obrigatório</div>
                  </td>
                  <td>
                    <span v-if="!talhao.editEnabled">
                      {{ talhao.area }}</span>
                    <input v-if="talhao.editEnabled" type="text" v-model="talhao.area" class="form-control w-50" />
                  </td>
                  <td>
                    Cultura:
                    <span v-if="!talhao.editEnabled">
                      {{ talhao.culture }}
                    </span>
                    <input v-if="talhao.editEnabled" type="text" v-model="talhao.culture" class="form-control w-50"
                      :class="{ 'is-invalid': talhao.editEnabled && !talhao.culture?.trim() }" />
                    <div v-if="talhao.editEnabled && !talhao.culture?.trim()" class="invalid-feedback">Campo obrigatório
                    </div>
                    <br />
                    Safra:
                    <span v-if="!talhao.editEnabled">
                      {{ talhao.harvest }}
                    </span>
                    <input v-if="talhao.editEnabled" type="text" v-model="talhao.harvest" class="form-control w-50"
                      :class="{ 'is-invalid': talhao.editEnabled && !talhao.harvest?.trim() }" />
                    <div v-if="talhao.editEnabled && !talhao.harvest?.trim()" class="invalid-feedback">Campo obrigatório
                    </div>
                    <br />
                    Solo:
                    <span v-if="!talhao.editEnabled">
                      {{ talhao.soil }}
                    </span>
                    <input v-if="talhao.editEnabled" type="text" v-model="talhao.soil" class="form-control w-50" />
                    <br />
                    <button class="btn btn-info btn-sm" @click="openCoordinatesModal(talhao)">Ver Coordenadas</button>
                  </td>
                  <td>
                    <button class="btn btn-warning btn-sm" @click="openWeedModal(talhao)">Ver classificação</button>
                  </td>
                  <td>
                    <button :disabled=talhao.editEnabled class="btn btn-success btn-sm" @click="editField(talhao)"><svg
                        xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path
                          d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                        <path fill-rule="evenodd"
                          d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                      </svg></button>
                    <br />
                    <button class="btn btn-outline-info btn-sm d-block mt-2" @click="cancelEdit(talhao)"><svg
                        xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-backspace-reverse" viewBox="0 0 16 16">
                        <path
                          d="M9.854 5.146a.5.5 0 0 1 0 .708L7.707 8l2.147 2.146a.5.5 0 0 1-.708.708L7 8.707l-2.146 2.147a.5.5 0 0 1-.708-.708L6.293 8 4.146 5.854a.5.5 0 1 1 .708-.708L7 7.293l2.146-2.147a.5.5 0 0 1 .708 0" />
                        <path
                          d="M2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7.08a2 2 0 0 0 1.519-.698l4.843-5.651a1 1 0 0 0 0-1.302L10.6 1.7A2 2 0 0 0 9.08 1zm7.08 1a1 1 0 0 1 .76.35L14.682 8l-4.844 5.65a1 1 0 0 1-.759.35H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
                      </svg></button>
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
              <a>{{ selectedCoordinates }}</a>
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