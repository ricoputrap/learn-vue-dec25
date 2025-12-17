<script setup lang="ts">
import { ref } from "vue";

const name = ref("RICO");
const count = ref(0);

function increment() {
    count.value++;
}
function decrement() {
    count.value--;
}
function reset() {
    count.value = 0;
}
</script>

<template>
    <h1>You did it {{ name }}!</h1>
    <p>
        Visit
        <a href="https://vuejs.org/" target="_blank" rel="noopener"
            >vuejs.org</a
        >
        to read the documentation
    </p>

    <div class="counter">
        <p>Count: {{ count }}</p>
    </div>

    <div class="buttons">
        <button @click="increment">Increment</button>
        <button @click="decrement">Decrement</button>
        <button @click="reset">Reset</button>
    </div>
</template>

<style scoped>
.buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
}
</style>
