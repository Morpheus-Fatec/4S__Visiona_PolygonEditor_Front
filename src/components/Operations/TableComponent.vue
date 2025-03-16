<script setup>
import { areasSJC } from '../Mapa/data/areasSJC';
const handlePrintId = (id) => {
  const area = areasSJC.features.find(area => area.properties.id === id);
  console.log(area);
};

</script>

<template>
  <div class='w-100 bg-success'>
      <table class="table table-striped">
        <thead>
          <tr>
            <th class="col">Nome</th>
            <th class="col">Descrição</th>
            <th class="col">Fazenda</th>
            <th class="col">Cidade/Estado</th>
            <th class="col">Situação</th>
            <th class="col">Ação</th>
          </tr>
        </thead>
        <tbody class="table-group-divider">
          <tr v-for="area in areasSJC.features" :key="area.properties.id">
            <td>{{ area.properties.alt }}</td>
            <td class="break-text">{{ area.properties.description }}</td>
            <td>{{ area.properties.fazenda ? area.properties.fazenda.nome : 'N/A' }}</td>
            <td>{{ area.properties.fazenda.cidade + ' - ' + area.properties.fazenda.estado }}</td>
            <td>{{ 'Pendente' }}</td>
            <td>
              <button @click="handlePrintId(area.properties.id)">Ver ID</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
</template>

<style>
  table {
    width: 100%;
    border-collapse: collapse;
  }

  .col{
    font-weight: bold;
  }

  .break-text {
    word-wrap: break-word;
    white-space: normal;
    max-width: 300px;
  }

  button {
    padding: 6px 12px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }
</style>
