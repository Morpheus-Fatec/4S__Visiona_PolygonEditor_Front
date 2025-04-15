<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const name = ref('');
const email = ref('');
const confirmEmail = ref('');
const password = ref('');
const userType = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const formValidated = ref(false);
const users = ref([]);
const userIdToDelete = ref(null);
const userNameToDelete = ref('');
const errorMessageDelete = ref('');
const successMessageDelete = ref('');

const buttonRegister = async () => {
    formValidated.value = true;

    if (email.value !== confirmEmail.value) {
        return;
    }

    if (!name.value.trim() || !email.value.trim() || !confirmEmail.value.trim() || !password.value.trim() || !userType.value) {
        setTimeout(() => {
            error.response?.data?.error;
        }, 3000);
        return;
    }

    const payload = {
        name: name.value,
        email: email.value,
        password: password.value,
        isAdmin: userType.value === 'isAdmin',
        isAnalyst: userType.value === 'isAnalyst',
        isConsultant: userType.value === 'isConsultant'
    };

    try {
        const response = await axios.post('http://localhost:8080/user/cadastrarUsuario', payload);
        setTimeout(() => {
            successMessage.value = error.response?.data?.message;
        }, 3000);
        fetchUsers();
    } catch (error) {
        console.error(error);
        setTimeout(() => {
            errorMessage.value = error.response?.data?.error;
        }, 3000);
    } finally {
        name.value = '';
        email.value = '';
        confirmEmail.value = '';
        password.value = '';
        userType.value = '';
        formValidated.value = false;
    }
};

const fetchUsers = async () => {
    try {
        const response = await axios.get('http://localhost:8080/user/listarUsuarios');
        users.value = response.data.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isConsultant: user.isConsultant,
            isAnalyst: user.isAnalyst
        }));
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        setTimeout(() => {
            errorMessage.value = error.response?.data?.error;
        }, 3000);    }
};

const deleteUser = async () => {
    try {
        if (userIdToDelete.value) {
            await axios.delete(`http://localhost:8080/user/deletarUsuario/${userIdToDelete.value}`);
            setTimeout(() => {
                successMessage.value = 'Usuário excluído com sucesso.';
            }, 3000);
            fetchUsers();
            closeModal();
        }
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        setTimeout(() => {
            errorMessage.value = error.response?.data?.error;
        }, 3000);
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

onMounted(fetchUsers);
</script>

<template>
    <div>
        <div v-if="successMessage" class="alert alert-success mb-3">{{ successMessage }}</div>
        <div v-if="errorMessage" class="alert alert-danger mb-3">{{ errorMessage }}</div>

        <p class="d-inline-flex gap-1 mb-3">
            <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample"
                aria-expanded="false" aria-controls="collapseExample">
                Cadastrar Usuário
            </button>
        </p>

        <div class="collapse needs-validation" id="collapseExample">
            <div class="card card-body">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Nome:</label>
                        <input v-model="name" type="text" class="form-control" placeholder="Seu nome"
                            :class="{ 'is-invalid': formValidated && !name.trim() }" />
                        <div class="invalid-feedback">Nome é obrigatório.</div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Tipo de Usuário:</label>
                        <select v-model="userType" class="form-select"
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
                        <input v-model="email" type="email" class="form-control"
                            :class="{ 'is-invalid': formValidated && !email.trim() }" placeholder="name@example.com" />
                        <div class="invalid-feedback">Email é obrigatório.</div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Confirme o Email:</label>
                        <input v-model="confirmEmail" type="email" class="form-control" placeholder="name@example.com"
                            :class="{ 'is-invalid': formValidated && (!confirmEmail.trim() || confirmEmail !== email) }" />
                        <div class="invalid-feedback">Emails não coincidem.</div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12 mb-4">
                        <label class="form-label">Senha:</label>
                        <input v-model="password" type="password" class="form-control"
                            :class="{ 'is-invalid': formValidated && !password.trim() }" />
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

        <div row class="mb-3 mt-3">
            <div class="modal-body">
                <div v-if="errorMessageDelete" class="alert alert-danger" role="alert">{{ errorMessageDelete }}</div>
                <div v-if="successMessageDelete" class="alert alert-success" role="alert">{{ successMessageDelete }}
                </div>
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr class="text-center">
                            <th scope="col">Nome</th>
                            <th scope="col">Email</th>
                            <th scope="col">Tipo de Usuário</th>
                            <th scope="col">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="table-group-divider text-center">
                        <tr v-for="user in users" :key="user.id">
                            <td>{{ user.name }}</td>
                            <td>{{ user.email }}</td>
                            <td>
                                <span v-if="user.isAdmin">Administrador</span>
                                <span v-if="user.isAnalyst">Analista</span>
                                <span v-if="user.isConsultant">Consultor</span>
                            </td>
                            <td>
                                <button @click="editUser(user.id)" class="btn btn-warning btn-sm  me-2">Editar</button>
                                <button @click="confirmDelete(user.id, user.name)"
                                    class="btn btn-danger btn-sm">Excluir</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

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

<style scoped></style>
