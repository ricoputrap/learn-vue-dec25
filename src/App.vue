<script setup lang="ts">
import Header from "./Header.vue";
import Reactivity from "./Reactivity.vue";
</script>

<template>
    <Header />

    <main>
        <Reactivity />
    </main>
</template>

<style scoped>
.buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
}
</style>
