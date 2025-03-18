<script setup lang="ts">
    import { RouterLink } from 'vue-router';
    
</script>

<template>
    <div class="d-flex justify-content-center align-items-center vh-100">
        <!-- Imagem -->
        <div class="d-flex flex-column align-items-center bg-white vh-100 w-50 bg-image shadow-lg">
        </div>

        <!-- Formulário -->
        <div class="d-flex flex-column align-items-center bg-white vh-100 w-50">
            <div class="col-lg-6 align-items-center justify-content-center d-flex h-100 w-100" >
                <div class="card-body p-md-5 mx-md-4 rounded">

                <div class="text-center">
                  <img src="../assets/Logo_Morpheus.png" class="w-100"
                    style="width: 185px;" alt="logo">
                  <h4 class="h4 mt-2 mb-5 pb-1">Realize seu login</h4>
                </div>

                <form>
                  <div class="form-outline mb-4">
                    <label class="form-label" for="form2Example11">E-mail</label>
                    <input type="email" id="form2Example11" class="form-control"
                      placeholder="admin@admin.com.br" />
                  </div>

                  <div data-mdb-input-init class="form-outline mb-4">
                    <label class="form-label" for="form2Example22">Senha</label>
                    <input type="password" id="form2Example22" class="form-control" placeholder="***************"/>
                  </div>

                  <div class="text-center pt-1 mb-5 pb-1">
                    <RouterLink to="/dashboard">
                        <button class="btn btn-primary mb-3 w-100" type="button">Entrar</button>
                    </RouterLink>
                    </div>

                </form>

              </div>
            </div>
        </div>

        <!-- Imagem -->
        <div class="d-flex flex-column align-items-center bg-white vh-100 w-50 bg-image shadow-lg">
        </div>
    </div>
</template>

<style scoped>
    .bg-image {
        background-image: url('../assets/lavoura.jpg');
        background-size: contain;
        background-position: initial;
    }
</style>