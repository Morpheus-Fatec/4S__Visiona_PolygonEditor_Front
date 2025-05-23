<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from "@/components/util/API.js";

const email = ref('');
const senha = ref('');
const router = useRouter();
const loading = ref(false); 
const errorMessage = ref(''); 

const realizarLogin = async () => {
  loading.value = true;  
  errorMessage.value = '';  

  try {
    const response = await api.post('/auth/login', {
      email: email.value,
      password: senha.value,
    });
    const usuario = {
      id: response.data.id,
      token: response.data.token,
      nome: response.data.userName,
      email: response.data.email,
      role: response.data.role,
    };
    localStorage.setItem('usuario', JSON.stringify(usuario));;

    router.push('/mapa-global');
  } catch (error) {
    loading.value = false;  

    errorMessage.value = 'Erro ao realizar login. Verifique suas credenciais ou tente novamente mais tarde.';
  }
};

onMounted(() => {
  const usuario = localStorage.getItem("usuario")
  if (usuario != null){
    router.push('/mapa-global');
  }
});
</script>

<template>
  <div class="d-flex justify-content-center align-items-center vh-100 bg-image">
    <div class="d-flex flex-column align-items-center bg-white w-25 rounded-3">
      <div class="col-lg-6 align-items-center justify-content-center d-flex h-100 w-100 shadow-lg">
        <div class="card-body p-5 shadow-lg">
          <div class="text-center">
            <img src="../assets/Logo_Morpheus.png" class="w-100" style="width: 185px;" alt="logo">
            <h4 class="h4 mt-2 mb-5 pb-1">Realize seu login</h4>
          </div>

          <form @submit.prevent="realizarLogin">
            <div class="form-outline mb-4">
              <label class="form-label" for="form2Example11">E-mail</label>
              <input v-model="email" type="email" id="form2Example11" class="form-control"
                placeholder="admin@admin.com.br" required />
            </div>

            <div class="form-outline mb-4">
              <label class="form-label" for="form2Example22">Senha</label>
              <input v-model="senha" type="password" id="form2Example22" class="form-control" 
                placeholder="***************" required />
            </div>

            <div v-if="errorMessage" class="text-danger mb-4">
              {{ errorMessage }}
            </div>

            <div class="text-center pt-1 mb-5 pb-1">
              <button class="btn btn-primary mb-3 w-100" type="submit" :disabled="loading.value">
                <span v-if="loading.value" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @keyframes floatingBackground {
    0% {
      background-position: center top;
    }
    100% {
      background-position: center bottom;
    }
  }

  .bg-image {
    background-image: url('../assets/lavoura.jpg');
    background-size: cover;
    background-position: center top;
    animation: floatingBackground 150s infinite linear;
  }
</style>
