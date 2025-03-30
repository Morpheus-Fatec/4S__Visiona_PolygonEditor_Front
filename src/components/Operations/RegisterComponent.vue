<script setup>
import { ref, resolveComponent } from "vue";
import axios from "axios";

const fileName1 = ref("");
const fileName2 = ref("");
const errorMessage = ref("");
const errorMessageModal = ref("");
const successMessage = ref("");
const errorMessageImage = ref("");
const successMessageImage = ref("");
const geojsonClassification = ref(null);
const geojsonField = ref(null);
const talhoesMap = ref(new Map());
const selectedCoordinates = ref("");
const selectedWeeds = ref([]);
const originalField = ref(new Map());
const images = ref([]);
const descImage = ref("");
const isLoadingTalhoes = ref(false);
const isLoadingImages = ref(false);
const enableUploadImage = ref(false);
const scanId = ref(1);
const noAssociation = ref("");

const handleFileUpload = (event) => {
  try {
    const file = event.target.files[0];
    if (!file) throw new Error("Nenhum arquivo selecionado");

    if (!file.name.toLowerCase().endsWith(".geojson")) {
      throw new Error("Arquivo inválido, selecione um arquivo GeoJSON");

    }

    const fileType = event.target.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsedData = JSON.parse(e.target.result);

        if (fileType === "field") {
          geojsonField.value = parsedData;
        } else if (fileType === "classification") {
          geojsonClassification.value = parsedData;
        }

      } catch (error) {
        if (fileType === "field") geojsonField.value = null;
        if (fileType === "classification") geojsonClassification.value = null;
        throw new Error("Arquivo inválido, selecione um arquivo GeoJSON");
      }
    }
    reader.readAsText(file);

  } catch (error) {
    errorMessage.value = error.message;
  }
};

const sendFile = () => {
  if (!geojsonClassification.value && !geojsonField.value) {
    errorMessage.value = "Nenhum arquivo válido carregado";
    return;
  }
  if (!geojsonClassification.value.features || !Array.isArray(geojsonClassification.value.features) || !geojsonField.value.features || !Array.isArray(geojsonField.value.features)) {
    errorMessage.value = "Arquivo GeoJSON inválido";
    return;
  }

  const talhoes = new Map();

  try {
    geojsonField.value.features.forEach((featuresField, index) => {
      let weedsList = [];
      if (!featuresField.properties.MN_TL || !featuresField.properties.AREA_HA_TL || !featuresField.properties.SOLO || !featuresField.properties.CULTURA || !featuresField.properties.SAFRA || !featuresField.properties.FAZENDA || !featuresField.geometry.coordinates) {
        throw new Error("Conteúdo do arquivo GeoJSON inválido");
      }

      geojsonClassification.value.features.forEach((featuresClassification) => {
        if (!featuresClassification.properties.MN_TL || !featuresClassification.properties.CLASSE || !featuresClassification.geometry.coordinates) {
          throw new Error("Conteúdo do arquivo GeoJSON inválido");
        }
        if (featuresField.properties.MN_TL == featuresClassification.properties.MN_TL) {
          weedsList.push({
            area: featuresClassification.properties.AREA_M2,
            coordinates: JSON.stringify(featuresClassification.geometry.coordinates),
            classEntity: featuresClassification.properties.CLASSE,
          });
        }
      });

      const id = featuresField.properties.ID || index;
      talhoes.set(id, {
        id,
        editEnabled: false,
        isValid: true,
        area: featuresField.properties.AREA_HA_TL,
        coordinates: JSON.stringify(featuresField.geometry.coordinates),
        culture: featuresField.properties.CULTURA,
        harvest: featuresField.properties.SAFRA,
        nameField: featuresField.properties.MN_TL,
        productivity: null,
        soil: featuresField.properties.SOLO,
        classification: weedsList,
        nameFarm: featuresField.properties.FAZENDA,
      });

    });

    talhoesMap.value = talhoes;
    if (talhoesMap.value.size > 0) {
      const modalRegister = new bootstrap.Modal(document.getElementById('modalGeoJson'));
      modalRegister.show();
      geojsonClassification.value = "";
      geojsonField.value = "";
    } else {
      throw new Error("Nenhum talhão encontrado");
    }
  } catch (error) {
    errorMessage.value = error.message;
  }
};


const openCoordinatesModal = (talhao) => {
  selectedCoordinates.value = JSON.parse(talhao.coordinates);
  const modal = new bootstrap.Modal(document.getElementById("coordinatesModal"));
  modal.show();
};

const openWeedsModal = (classifications) => {
  selectedWeeds.value = classifications;
  const modal = new bootstrap.Modal(document.getElementById("weedsModal"));
  modal.show();
};


const saveScan = async () => {
  let hasError = false;
  isLoadingTalhoes.value = true;

  talhoesMap.value.forEach((talhao) => {
    const isNameValid = !!talhao.nameFarm?.trim();
    const isAreaValid = talhao.area !== null && talhao.area !== undefined && !isNaN(talhao.area);
    const isCultureValid = !!talhao.culture?.trim();
    const isHarvestValid = !!talhao.harvest?.trim();
    const isSoilValid = !!talhao.soil?.trim();

    talhao.isValid = isNameValid && isAreaValid && isCultureValid && isHarvestValid && isSoilValid;

    if (!talhao.isValid) {
      hasError = true;
    }
  });

  if (hasError) {
    errorMessageModal.value = "Preencha os campos obrigatórios.";
    isLoadingTalhoes.value = false;
    return;
  }

  const payload = {
  fields: JSON.parse(JSON.stringify(Array.from(talhoesMap.value.values())))
};
  try {


    const response = await axios.post("http://localhost:7777/scan", payload);
    scanId.value = response.data;
  } catch (error) {
  } finally {
    const modalElement = document.getElementById('modalGeoJson');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
      successMessage.value = "Dados dos talhões salvos com sucesso!";
      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    }
  }
  fileName1.value = "";
  fileName2.value = "";
  geojsonClassification.value = null;
  geojsonField.value = null;
  document.querySelector("input[name='field']").value = "";
  document.querySelector("input[name='classification']").value = "";

  isLoadingTalhoes.value = false;
  enableUploadImage.value = true;
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

const addImage = (event) => {
  images.value.push({ name: event.target.files[0].name, image: event.target.files[0], desc: descImage.value });
  descImage.value = "";
  event.target.value = "";
};

const deleteImage = (index) => {
  images.value.splice(index, 1);
};

const saveImages = (event) => {
  isLoadingImages.value = true;
  const formData = new FormData();

  formData.append('scanId', scanId);
  images.value.forEach((img) => {
    formData.append('image', img.image);
    formData.append('name', img.name);
    formData.append('desc', img.desc);
  });

  axios.post('http://localhost:7777/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(response => {
      successMessageImage.value = "Imagens enviadas com sucesso!";
      setTimeout(() => {
        successMessageImage.value = "";
        location.reload();
      }, 3000);
      isLoadingImages.value = true;
    })
    .catch(error => {
      errorMessageImage.value = "Erro ao enviar a imagem";
    });


  descImage.value = "";
  event.target.value = "";
};

const cancelImages = () => {
  images.value = [];
  descImage.value = "";
  enableUploadImage.value = false;
  noAssociation.value = "Nenhuma imagem associada";
  setTimeout(() => {
    noAssociation.value = "";
  }, 3000);

  setTimeout(() => {
    successMessage.value = "";
    location.reload();
  }, 2000);


};
</script>


<template>
  <Layout>
    <div class="row">
      <div class="col-md-6 text-center">
        <div class="p-0 bg-light text-black border border-1 shadow rounded">
          <div class="bg-primary text-white fw-bold text-center w-100 m-0 p-2 rounded-top ">
            <br>
            <h5 class="card-title">Cadastro de Informações</h5>
            <br>
          </div>
          <div class="p-5">
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="alert alert-success" role="alert">
              {{ successMessage }}
            </div>
            <div class="mb-3">
              <label class="form-label" style="font-weight: bold;">Selecionar GeoJSON de Saída:</label>
              <input type="file" name="field" :disabled="enableUploadImage" @change="handleFileUpload"
                class="form-control" />
              <p v-if="fileName1" class="mt-2 text-success">
                Arquivo 1 selecionado: {{ fileName1 }}
              </p>
            </div>

            <div class="mb-3">
              <label class="form-label" style="font-weight: bold;">Selecionar GeoJSON Automático:</label>
              <input type="file" name="classification" :disabled="enableUploadImage" @change="handleFileUpload"
                class="form-control" />
              <p v-if="fileName2" class="mt-2 text-success">Arquivo 2 selecionado: {{ fileName2 }}</p>
            </div>

            <div class="d-flex justify-content-center">
              <button type="button" class="btn btn-primary mt-3" :disabled="enableUploadImage"
                @click="sendFile">Importar Dados</button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="p-0 bg-light text-black border border-1 shadow rounded" style="overflow: hidden;">
          <div class="bg-primary text-white fw-bold text-center w-100 m-0 p-2 rounded-top">
            <br>
            <h5 class="card-title">Imagens de Apoio</h5>
            <br>
          </div>
          <div class="row p-5">
            <div class="container text-center">
              <div class="row">
                <div v-if="errorMessageImage" class="alert alert-danger" role="alert">
                  {{ errorMessageImage }}
                </div>
                <div v-if="successMessageImage" class="alert alert-success" role="alert">
                  {{ successMessageImage }}
                </div>
                <div v-if="noAssociation" class="alert alert-secondary" role="alert">
                  {{ noAssociation }}
                </div>
                <div class="col">
                  <label class="form-label">Descrição da imagem:</label>
                  <input id="inputPassword5" :disabled="!enableUploadImage" class="form-control"
                    aria-describedby="passwordHelpBlock" v-model="descImage">
                </div>
              </div>
              <br>
              <div class="row">
                <div class="col">
                  <input type="file" name="tiff" :disabled="!enableUploadImage" @change="addImage"
                    class="form-control" />
                </div>
              </div>
              <br>
              <table class="table table-striped" v-if="images.length">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(image, index) in images" :key="index">
                    <td>{{ image.name }}</td>
                    <td>{{ image.desc }}</td>
                    <td>
                      <button type="button" class="btn btn-danger" @click="deleteImage(index)">Remover</button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="d-flex justify-content-center">
                <button type="button" class="btn btn-primary mt-3  mx-3" @click="saveImages"
                  :disabled="!enableUploadImage">
                  <span v-if="isLoadingImages" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
                  <span v-if="!isLoadingImages">Associar Imagens de Apoio</span>
                  <span v-if="isLoadingImages">Carregando...</span>
                </button>
                <button type="button" class="btn btn-outline-primary mt-3" @click="cancelImages":disabled="!enableUploadImage">Não associar</button>
              </div>

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
            <div v-if="errorMessageModal" class="alert alert-danger" role="alert">
              {{ errorMessageModal }}
            </div>
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
                  <td>{{ talhao.nameField }}</td>
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
                    <div v-if="talhao.editEnabled && !talhao.culture?.trim()" class="invalid-feedback">Campo
                      obrigatório
                    </div>
                    <br />
                    Safra:
                    <span v-if="!talhao.editEnabled">
                      {{ talhao.harvest }}
                    </span>
                    <input v-if="talhao.editEnabled" type="text" v-model="talhao.harvest" class="form-control w-50"
                      :class="{ 'is-invalid': talhao.editEnabled && !talhao.harvest?.trim() }" />
                    <div v-if="talhao.editEnabled && !talhao.harvest?.trim()" class="invalid-feedback">Campo
                      obrigatório
                    </div>
                    <br />
                    Solo:
                    <span v-if="!talhao.editEnabled">
                      {{ talhao.soil }}
                    </span>
                    <input v-if="talhao.editEnabled" type="text" v-model="talhao.soil" class="form-control w-50" />
                    <br />
                    Produtividade:
                    <span v-if="!talhao.editEnabled">
                      <span v-if="!talhao.productivity">Sem valor</span>{{ talhao.productivity }}
                    </span>
                    <input v-if="talhao.editEnabled" type="number" step="any" v-model="talhao.productivity"
                      class="form-control w-50" />
                    <br />
                    <button class="btn btn-info btn-sm" @click="openCoordinatesModal(talhao)">Ver
                      Coordenadas</button>
                  </td>
                  <td>
                    <button class="btn btn-warning btn-sm" @click="openWeedsModal(talhao.classification)">Ver
                      classificação</button>
                  </td>
                  <td>
                    <button v-if="!talhao.editEnabled" class="btn btn-success btn-sm" @click="editField(talhao)"><svg
                        xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path
                          d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                        <path fill-rule="evenodd"
                          d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                      </svg></button>
                    <br />
                    <button v-if="talhao.editEnabled" class="btn btn-outline-info btn-sm d-block mt-2"
                      @click="cancelEdit(talhao)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                        fill="currentColor" class="bi bi-backspace-reverse" viewBox="0 0 16 16">
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
            <button type="button" class="btn btn-primary" @click="saveScan" :disabled="isLoadingTalhoes">
              <span v-if="isLoadingTalhoes" class="spinner-border spinner-border-sm" role="status"
                aria-hidden="true"></span>
              <span v-if="!isLoadingTalhoes">Salvar</span>
              <span v-if="isLoadingTalhoes">Carregando...</span>
            </button>
          </div>
        </div>
      </div>
    </div>

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

    <div class="modal fade" id="weedsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Classificações do Talhão</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <table class="table table-striped table-hover ">
              <thead class="table-dark">
                <tr>
                  <th scope="col">Classe</th>
                  <th scope="col">Tamanho</th>
                </tr>
              </thead>
              <tbody class="table-group-divider">
                <tr v-for="weeds in selectedWeeds" :key="weeds.classEntity">
                  <td>{{ weeds.classEntity }}</td>
                  <td>{{ weeds.area }}</td>
                </tr>
              </tbody>
            </table>
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
