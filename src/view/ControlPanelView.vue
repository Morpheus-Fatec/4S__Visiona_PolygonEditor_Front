<script setup lang="ts">
import Layout from '../components/Layout/Layout.vue';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const tableData = ref([] as {
    talhao: string
    situacao: string
    dataEntrada: string
    dataAprovacao: string
    tempoCicloTalhao: string
    analista: string
    tempoAnalise: string
    qtdAnalises: number
    consultor: string
    tempoRevisao: string
}[]);

const search = ref('');

const getData = async () => {
    try {
        const response = await axios.get('/table.json');
        tableData.value = response.data.map((item: any) => ({
            talhao: item.talhao,
            situacao: item.situacao,
            dataEntrada: item.data_entrada,
            dataAprovacao: item.data_aprovacao,
            tempoCicloTalhao: item.tempo_ciclo,
            analista: item.analista,
            tempoAnalise: item.tempo_analise,
            qtdAnalises: item.quantidade_analises,
            consultor: item.consultor,
            tempoRevisao: item.tempo_revisao
        }));
    } catch (error) {
        console.error('Erro ao buscar dados', error);
        tableData.value = [];
    }
};

const filteredTable = computed(() => {
    const s = search.value.toLowerCase();
    return tableData.value.filter(item =>
        String(item.talhao).toLowerCase().includes(s) ||
        String(item.situacao).toLowerCase().includes(s) ||
        String(item.dataEntrada).toLowerCase().includes(s) ||
        String(item.dataAprovacao).toLowerCase().includes(s) ||
        String(item.tempoCicloTalhao).toLowerCase().includes(s) ||
        String(item.analista).toLowerCase().includes(s) ||
        String(item.tempoAnalise).toLowerCase().includes(s) ||
        String(item.qtdAnalises).toLowerCase().includes(s) ||
        String(item.consultor).toLowerCase().includes(s) ||
        String(item.tempoRevisao).toLowerCase().includes(s)
    );
});

function formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

onMounted(getData);
</script>

<template>
    <Layout>
        <div class="container py-5">
            <h4 class="fw-bold fs-4 text-center mb-4">Painel de Controle dos Talhões</h4>

            <div class="input-group mb-4 shadow-sm">
                <input v-model="search" type="text" class="form-control" placeholder="Pesquisar" aria-label="Pesquisar"
                    aria-describedby="basic-addon1">
                <span class="input-group-text" id="basic-addon1"><i class="bi bi-search"></i></span>
            </div>

            <div class="table-responsive shadow-sm rounded overflow-hidden">
                <table class="table table-striped table-hover align-middle text-center mb-0">
                    <thead class="table-dark">
                        <tr>
                            <th class="p-3">Talhão</th>
                            <th class="p-3">Situação</th>
                            <th class="p-3">Data de entrada</th>
                            <th class="p-3">Data da aprovação</th>
                            <th class="p-3">Tempo de ciclo</th>
                            <th class="p-3">Analista</th>
                            <th class="p-3">Tempo de análise</th>
                            <th class="p-3">Qtd. análises</th>
                            <th class="p-3">Consultor</th>
                            <th class="p-3">Tempo de revisão</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in filteredTable" :key="item.talhao">
                            <td class="p-3">{{ item.talhao }}</td>
                            <td class="p-3">{{ item.situacao }}</td>
                            <td class="p-3">{{ formatDate(item.dataEntrada) }}</td>
                            <td class="p-3">{{ formatDate(item.dataAprovacao) }}</td>
                            <td class="p-3">{{ item.tempoCicloTalhao }}</td>
                            <td class="p-3">{{ item.analista }}</td>
                            <td class="p-3">{{ item.tempoAnalise }}</td>
                            <td class="p-3">{{ item.qtdAnalises }}</td>
                            <td class="p-3">{{ item.consultor }}</td>
                            <td class="p-3">{{ item.tempoRevisao }}</td>
                        </tr>
                        <tr v-if="filteredTable.length === 0">
                            <td colspan="10" class="text-muted p-4">Nenhum resultado encontrado.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </Layout>
</template>
