<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import api from '@/components/util/api';

const cultureName = ref('');
const cultureId = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const formValidated = ref(false);
const cultures = ref([]);
const cultureToDelete = ref(null);
const cultureNameDelete = ref('');
const editEnabled = ref(false);
const editingUserId = ref(null);
const isRegisterCollapseOpen = ref(false);
const isEditCollapseOpen = ref(false);
const term = ref('');

const buttonRegister = async () => {
    formValidated.value = true;
    editEnabled.value = false;
    console.log(cultureName);
    if (!cultureName.value) {
        error.response?.data?.error;
        return;
    }

    const payload = {
        name: cultureName.value
    };

    try {
        const response = await api.post('/cultures/createCulture', payload);
        successMessage.value = "Cultura cadastrada com sucesso.";
        setTimeout(() => {
            successMessage.value = "";
        }, 3000);
        fetchCultures();
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

const fetchCultures = async () => {
    try {
        const response =  await api.get('/cultures');
        cultures.value = response.data.map(user => ({
            id: user.id,
            name: user.name
        }));
        console.log(cultures);
    } catch (error) {
        console.error(error);
        errorMessage.value = error.response?.data?.error || 'Erro ao buscar cultura.';
        setTimeout(() => {
            errorMessage.value = "";
        }, 3000);
    }
};

const deleteCulture = async () => {
    try {
        if (cultureToDelete.value) {
            await api.delete(`/cultures/${cultureToDelete.value}`);
            successMessage.value = 'Cultura excluído com sucesso.';
            setTimeout(() => {
                successMessage.value = "";
            }, 3000);
            fetchCultures();
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
        cultureToDelete.value = null;
        cultureNameDelete.value = '';
    }
};

const cultureNameInvalid = computed(() => {
  return formValidated.value && !cultureName.value.trim();
});

const confirmDelete = (cultureId, cultureName) => {
    cultureToDelete.value = cultureId;
    cultureNameDelete.value = cultureName;

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

const editCulture = (cultureSelected) => {
    formValidated.value = true;
    editEnabled.value = true;

    cultureId.value = cultureSelected.id;
    cultureName.value=cultureSelected.name;

    toggleEditCollapse()
};

const buttonEdit = async () => {
    if (!cultureName) {
        return;
    }

    const payload = {
        name: cultureName.value
    };

    try {
        const response = await api.put(`/cultures/updateCulture/${cultureId.value}`, payload);
        successMessage.value = "Cultura editado com sucesso.";
        setTimeout(() => {
            successMessage.value = "";
        }, 3000);
        fetchCultures();
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
    cultureId.value = '';
    cultureName.value = '';
    formValidated.value = false;
    editEnabled.value = false;
    editingUserId.value = null;
};

const filteredCultures = computed(() => {
    return cultures.value.filter(culture =>
        culture.name.toLowerCase().includes(term.value.toLowerCase())
    );
});


onMounted(fetchCultures);
</script>

<template>
    <div>
        <div v-if="successMessage" class="alert alert-success mb-3">{{ successMessage }}</div>
        <div v-if="errorMessage" class="alert alert-danger mb-3">{{ errorMessage }}</div>

        <p class="d-inline-flex gap-1 mb-3">
            <button class="btn btn-primary" type="button" @click="toggleRegisterCollapse">
                Cadastrar Cultura
            </button>
        </p>

        <div v-show="isRegisterCollapseOpen" class="needs-validation mb-3">
            <div class="card card-body">
                <div class="row">
                    <div class="col-md-12 mb-3">
                        <label class="form-label">Nome:</label>
                        <input v-model="cultureName" type="text" class="form-control" placeholder="Nome da Cultura"
                        :class="{ 'is-invalid': cultureNameInvalid }" />
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
                        <input v-model="cultureName" type="text" class="form-control" placeholder="Nome da Cultura"
                        :class="{ 'is-invalid': cultureNameInvalid }"/>
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
                                <button @click="editCulture(culture)" class="btn btn-warning btn-sm me-2" type="button">
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
                        Tem certeza que deseja excluir a cultura <strong>{{ cultureNameDelete }}</strong>?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                            @click="closeModal">Fechar</button>
                        <button type="button" class="btn btn-primary" @click="deleteCulture">Confirmar</button>
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
