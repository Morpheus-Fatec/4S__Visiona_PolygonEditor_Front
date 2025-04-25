<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import api from '@/components/util/api';

const soilName = ref('');
const soilId = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const formValidated = ref(false);
const cultures = ref([]);
const soilDelete = ref(null);
const soilNameDelete = ref('');
const editEnabled = ref(false);
const editingUserId = ref(null);
const isRegisterCollapseOpen = ref(false);
const isEditCollapseOpen = ref(false);
const term = ref('');

const buttonRegister = async () => {
    formValidated.value = true;
    editEnabled.value = false;
    console.log(soilName);
    if (!soilName.value) {
        error.response?.data?.error;
        return;
    }

    const payload = {
        name: soilName.value
    };

    try {
        const response = await api.post('/soil/createSoil', payload);
        successMessage.value = "Solo cadastrada com sucesso.";
        setTimeout(() => {
            successMessage.value = "";
        }, 3000);
        fetchSoil();
    } catch (error) {
        console.error(error);
        errorMessage.value = error.response?.data?.error;
        setTimeout(() => {
            errorMessage.value = "";
        }, 3000);
    } finally {
        resetForm();
        isRegisterCollapseOpen.value = false;
        formValidated.value = false;
    }
};

const fetchSoil = async () => {
    try {
        const response =  await api.get('/soil');
        cultures.value = response.data.map(user => ({
            id: user.id,
            name: user.name
        }));
        console.log(cultures);
    } catch (error) {
        console.error(error);
        errorMessage.value = error.response?.data?.error || 'Erro ao buscar solo.';
        setTimeout(() => {
            errorMessage.value = "";
        }, 3000);
    }
};

const deleteSoil = async () => {
    try {
        if (soilDelete.value) {
            await api.delete(`/soil/${soilDelete.value}`);
            successMessage.value = 'Solo excluído com sucesso.';
            setTimeout(() => {
                successMessage.value = "";
            }, 3000);
            fetchSoil();
            closeModal();
        }
    } catch (error) {
        console.error(error);
        errorMessage.value = error.response?.data?.error;
        setTimeout(() => {
            errorMessage.value = "";
        }, 3000);
        closeModal();
    } finally {
        soilDelete.value = null;
        soilNameDelete.value = '';
    }
};

const soilNameInvalid = computed(() => {
  return formValidated.value && !soilName.value.trim();
});

const confirmDelete = (soilId, soilName) => {
    soilDelete.value = soilId;
    soilNameDelete.value = soilName;

    const modalElement = document.getElementById('staticBackdrop');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
};

const closeModal = () => {
    const modalElement = document.getElementById('staticBackdrop');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
        modalInstance.hide();
    }
};

const editSoil = (soilSelected) => {
    formValidated.value = true;
    editEnabled.value = true;

    soilId.value = soilSelected.id;
    soilName.value=soilSelected.name;

    toggleEditCollapse()
};

const buttonEdit = async () => {
    if (!soilName) {
        return;
    }

    const payload = {
        name: soilName.value
    };

    try {
        const response = await api.put(`/soil/updateSoil/${soilId.value}`, payload);
        successMessage.value = "Solo editado com sucesso.";
        setTimeout(() => {
            successMessage.value = "";
        }, 3000);
        fetchSoil();
        toggleEditCollapse();
    } catch (error) {
        console.error(error);
        errorMessage.value = error.response?.data?.error;
        setTimeout(() => {
            errorMessage.value = "";
        }, 3000);
    } finally {
        resetForm();
        isEditCollapseOpen.value = false;
        formValidated.value = false;
    }
};

const toggleRegisterCollapse = () => {
    if (isEditCollapseOpen.value) {
        isEditCollapseOpen.value = false;
    }
    if (!isEditCollapseOpen.value) {
        resetForm();
    }
    isRegisterCollapseOpen.value = !isRegisterCollapseOpen.value;
};

const toggleEditCollapse = () => {
    if (isRegisterCollapseOpen.value) {
        isRegisterCollapseOpen.value = false;
    }
    isEditCollapseOpen.value = !isEditCollapseOpen.value;
};

const resetForm = () => {
    soilId.value = '';
    soilName.value = '';
    formValidated.value = false;
    editEnabled.value = false;
    editingUserId.value = null;
};

const filteredCultures = computed(() => {
    return cultures.value.filter(culture =>
        culture.name.toLowerCase().includes(term.value.toLowerCase())
    );
});


onMounted(fetchSoil);
</script>

<template>
    <div>
        <div v-if="successMessage" class="alert alert-success mb-3">{{ successMessage }}</div>
        <div v-if="errorMessage" class="alert alert-danger mb-3">{{ errorMessage }}</div>

        <p class="d-inline-flex gap-1 mb-3">
            <button class="btn btn-primary" type="button" @click="toggleRegisterCollapse">
                Cadastrar Solo
            </button>
        </p>

        <div v-show="isRegisterCollapseOpen" class="needs-validation mb-3">
            <div class="card card-body">
                <div class="row">
                    <div class="col-md-12 mb-3">
                        <label class="form-label">Nome:</label>
                        <input v-model="soilName" type="text" class="form-control" placeholder="Nome da Solo"
                        :class="{ 'is-invalid': soilNameInvalid }" />
                        <div class="invalid-feedback">Nome é obrigatório.</div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12 text-center">
                        <button @click="buttonRegister" class="btn btn-success px-5">Salvar</button>
                    </div>
                </div>
            </div>
        </div>

        <!--collapse de edição-->
        <div v-show="isEditCollapseOpen" class="needs-validation mb-3">
            <div class="card card-body">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Nome:</label>
                        <input v-model="soilName" type="text" class="form-control" placeholder="Nome da Solo"
                        :class="{ 'is-invalid': soilNameInvalid }"/>
                        <div class="invalid-feedback">Nome é obrigatório.</div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12 text-center">
                        <button @click="buttonEdit" class="btn btn-success px-5">Confimar</button>
                    </div>
                </div>
            </div>
        </div>

        <!--barra de pesquisa-->
        <div class="input-group mb-3">
            <input v-model="term" type="text" class="form-control" placeholder="Pesquisar" aria-label="Pesquisar"
                aria-describedby="basic-addon1">
            <span class="input-group-text" id="basic-addon1"><svg xmlns="http://www.w3.org/2000/svg" width="16"
                    height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                    <path
                        d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </svg></span>
        </div>
        
        <!--tabela de usuários-->
        <div row class="mb-3 mt-3">
            <div class="modal-body">
                <table class="table table-striped table-hover custom-table">
                    <thead class="table-dark">
                        <tr class="text-center">
                            <th scope="col">Nome</th>
                            <th scope="col">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="table-group-divider text-center">
                        <tr v-for="culture in filteredCultures" :key="culture.id">
                            <td>{{ culture.name }}</td>
                            <td>
                                <button @click="editSoil(culture)" class="btn btn-warning btn-sm me-2" type="button">
                                    Editar
                                </button>
                                <button @click="confirmDelete(culture.id, culture.name)"
                                    class="btn btn-danger btn-sm">Excluir</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!--modal de esclusão-->
        <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">Confirmar Exclusão</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        Tem certeza que deseja excluir a Solo <strong>{{ soilNameDelete }}</strong>?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                            @click="closeModal">Fechar</button>
                        <button type="button" class="btn btn-primary" @click="deleteSoil">Confirmar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-table {
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 6px;
  overflow: hidden;
}</style>
