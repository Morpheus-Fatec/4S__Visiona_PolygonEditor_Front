<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import api from '@/components/util/api';

const userFields = reactive({
  name: '',
  email: '',
  confirmEmail: '',
  password: '',
  userType: ''
});
const errorMessage = ref('');
const successMessage = ref('');
const formValidated = ref(false);
const users = ref([]);
const userIdToDelete = ref(null);
const userNameToDelete = ref('');
const editEnabled = ref(false);
const editingUserId = ref(null);
const isRegisterCollapseOpen = ref(false);
const isEditCollapseOpen = ref(false);
const term = ref('');
const passwordVisible = ref(false);


const buttonRegister = async () => {
    formValidated.value = true;
    editEnabled.value = false;

    if (!validateEmail(userFields.email)) {
        return;
    }

    if (userFields.email !== userFields.confirmEmail) {
        error.response?.data?.error;
        return;
    }

    if (!userFields.name.trim() || !userFields.email.trim() || !userFields.confirmEmail.trim() || !userFields.password.trim() || !userFields.userType) {
        error.response?.data?.error;
        return;
    }

    const payload = {
        name: userFields.name,
        email: userFields.email,
        password: userFields.password,
        isAdmin: userFields.userType === 'isAdmin',
        isAnalyst: userFields.userType === 'isAnalyst',
        isConsultant: userFields.userType === 'isConsultant'
    };

    try {
        const response = await api.post('/user/cadastrarUsuario', payload);
        successMessage.value = "Usuário cadastrado com sucesso.";
        setTimeout(() => {
            successMessage.value = "";
        }, 3000);
        fetchUsers();
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

const validateEmail = (email) => {
    return userFields.email.includes('@') && userFields.email.includes('.com');
};

const fetchUsers = async () => {
    try {
        const response =  await api.get('/user/listarUsuarios');
        users.value = response.data.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            isAdmin: user.isAdmin,
            isConsultant: user.isConsultant,
            isAnalyst: user.isAnalyst
        }));
    } catch (error) {
        console.error(error);
        errorMessage.value = error.response?.data?.error || 'Erro ao buscar usuários.';
        setTimeout(() => {
            errorMessage.value = "";
        }, 3000);
    }
};

const deleteUser = async () => {
    try {
        if (userIdToDelete.value) {
            await api.delete(`/user/deletarUsuario/${userIdToDelete.value}`);
            successMessage.value = 'Usuário excluído com sucesso.';
            setTimeout(() => {
                successMessage.value = "";
            }, 3000);
            fetchUsers();
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
        userIdToDelete.value = null;
        userNameToDelete.value = '';
    }
};

const confirmDelete = (userId, userName) => {
    userIdToDelete.value = userId;
    userNameToDelete.value = userName;

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

const editUser = (userId) => {
    formValidated.value = true;
    editEnabled.value = true;

    const user = users.value.find(user => user.id === userId);
    if (user) {
        userFields.name = user.name;
        userFields.email = user.email;
        userFields.confirmEmail = user.email;
        userFields.password = user.password;
        userFields.userType = user.isAdmin ? 'isAdmin' : user.isAnalyst ? 'isAnalyst' : 'isConsultant';
        editingUserId.value = user.id;
    }
    toggleEditCollapse()
};

const buttonEdit = async () => {

    if (!validateEmail(userFields.email)) {
        return;
    }

    if (userFields.email !== userFields.confirmEmail) {
        return;
    }

    if (
        !userFields.name.trim() ||
        !userFields.email.trim() ||
        !userFields.confirmEmail.trim() ||
        !userFields.password.trim() ||
        !userFields.userType
    ) {
        return;
    }

    const payload = {
        name: userFields.name,
        email: userFields.email,
        password: userFields.password,
        isAdmin: userFields.userType === 'isAdmin',
        isAnalyst: userFields.userType === 'isAnalyst',
        isConsultant: userFields.userType === 'isConsultant'
    };

    try {
        const response = await api.put(`/user/${editingUserId.value}`, payload);
        successMessage.value = "Usuário editado com sucesso.";
        setTimeout(() => {
            successMessage.value = "";
        }, 3000);
        fetchUsers();
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
  Object.keys(userFields).forEach(key => {
        userFields[key] = '';
    });
    formValidated.value = false;
    editEnabled.value = false;
    editingUserId.value = null;
};

const filteredUsers = computed(() => {
    return users.value.filter(user =>
        user.name.toLowerCase().includes(term.value.toLowerCase()) ||
        user.email.toLowerCase().includes(term.value.toLowerCase()) ||
        (user.isAdmin ? 'Administrador' : user.isAnalyst ? 'Analista' : 'Consultor')
            .toLowerCase()
            .includes(term.value.toLowerCase())
    );
});

function passwordVisibility() {
    passwordVisible.value = !passwordVisible.value
}

onMounted(fetchUsers);
</script>

<template>
    <div>
        <div v-if="successMessage" class="alert alert-success mb-3">{{ successMessage }}</div>
        <div v-if="errorMessage" class="alert alert-danger mb-3">{{ errorMessage }}</div>

        <p class="d-inline-flex gap-1 mb-3">
            <button class="btn btn-primary" type="button" @click="toggleRegisterCollapse">
                Cadastrar Usuário
            </button>
        </p>

        <div v-show="isRegisterCollapseOpen" class="needs-validation mb-3">
            <div class="card card-body">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Nome:</label>
                        <input v-model="userFields.name" type="text" class="form-control" placeholder="Seu nome"
                            :class="{ 'is-invalid': formValidated && !userFields.name.trim() }" />
                        <div class="invalid-feedback">Nome é obrigatório.</div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Tipo de Usuário:</label>
                        <select v-model="userFields.userType" class="form-select"
                            :class="{ 'is-invalid': formValidated && !userType }">
                            <option disabled value="">Selecione</option>
                            <option value="isAdmin">Administrador</option>
                            <option value="isAnalyst">Analista</option>
                            <option value="isConsultant">Consultor</option>
                        </select>
                        <div class="invalid-feedback">Tipo de usuário é obrigatório.</div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Email:</label>
                        <input v-model="userFields.email" type="email" class="form-control"
                            :class="{ 'is-invalid': formValidated && !validateEmail(email) }"
                            placeholder="name@example.com" />
                        <div class="invalid-feedback">Email inválido.</div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Confirme o Email:</label>
                        <input v-model="userFields.confirmEmail" type="email" class="form-control" placeholder="name@example.com"
                            :class="{ 'is-invalid': formValidated && (!userFields.confirmEmail.trim() || confirmEmail !== email) }" />
                        <div class="invalid-feedback">Emails não coincidem.</div>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">Senha:</label>
                    <div class="input-group">
                        <input v-model="userFields.password" :type="passwordVisible ? 'text' : 'password'" class="form-control"
                            :class="{ 'is-invalid': formValidated && !userFields.password.trim() }" />
                        <button class="btn btn-outline-secondary" type="button" @click="passwordVisibility"
                            tabindex="-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                class="bi bi-eye" viewBox="0 0 16 16">
                                <path
                                    d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                                <path
                                    d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                            </svg>
                        </button>
                        <div class="invalid-feedback">Senha é obrigatória.</div>
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
                        <input v-model="userFields.name" type="text" class="form-control" placeholder="Seu nome"
                            :class="{ 'is-invalid': formValidated && !userFields.name.trim() }" />
                        <div class="invalid-feedback">Nome é obrigatório.</div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Tipo de Usuário:</label>
                        <select v-model="userFields.userType" class="form-select"
                            :class="{ 'is-invalid': formValidated && !userFields.userType }">
                            <option disabled value="">Selecione</option>
                            <option value="isAdmin">Administrador</option>
                            <option value="isAnalyst">Analista</option>
                            <option value="isConsultant">Consultor</option>
                        </select>
                        <div class="invalid-feedback">Tipo de usuário é obrigatório.</div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Email:</label>
                        <input v-model="userFields.email" type="email" class="form-control"
                            :class="{ 'is-invalid': formValidated && !validateEmail(email) }"
                            placeholder="name@example.com" />
                        <div class="invalid-feedback">
                            {{ !userFields.email.trim() ? 'Email é obrigatório.' : 'Email inválido.' }}
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Confirme o Email:</label>
                        <input v-model="userFields.confirmEmail" type="email" class="form-control" placeholder="name@example.com"
                            :class="{ 'is-invalid': formValidated && (!userFields.confirmEmail.trim() || confirmEmail !== email) }" />
                        <div class="invalid-feedback">Emails não coincidem.</div>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">Senha:</label>
                    <div class="input-group">
                        <input v-model="userFields.password" :type="passwordVisible ? 'text' : 'password'" class="form-control"
                            :class="{ 'is-invalid': formValidated && !userFields.password.trim() }" />
                        <button class="btn btn-outline-secondary" type="button" @click="passwordVisibility"
                            tabindex="-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                class="bi bi-eye" viewBox="0 0 16 16">
                                <path
                                    d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                                <path
                                    d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                            </svg>
                        </button>
                        <div class="invalid-feedback">Senha é obrigatória.</div>
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
                            <th scope="col">Email</th>
                            <th scope="col">Tipo de Usuário</th>
                            <th scope="col">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="table-group-divider text-center">
                        <tr v-for="user in filteredUsers" :key="user.id">
                            <td>{{ user.name }}</td>
                            <td>{{ user.email }}</td>
                            <td>
                                <span v-if="user.isAdmin"
                                    class="badge rounded-pill text-bg-primary">Administrador</span>
                                <span v-else-if="user.isAnalyst"
                                    class="badge rounded-pill text-bg-success">Analista</span>
                                <span v-else-if="user.isConsultant"
                                    class="badge rounded-pill text-bg-secondary">Consultor</span>
                            </td>
                            <td>
                                <button @click="editUser(user.id)" class="btn btn-warning btn-sm me-2" type="button">
                                    Editar
                                </button>
                                <button @click="confirmDelete(user.id, user.name)"
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
                        Tem certeza que deseja excluir o usuário <strong>{{ userNameToDelete }}</strong>?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                            @click="closeModal">Fechar</button>
                        <button type="button" class="btn btn-primary" @click="deleteUser">Confirmar</button>
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
