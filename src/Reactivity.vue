<script setup lang="ts">
import { reactive, ref } from "vue";
import type { Book } from "./types";

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

const book: Book = reactive({
    id: "1",
    title: "The Great Gatsby",
    category: "F. Scott Fitzgerald",
    is_borrowed: false,
});
function borrowBook() {
    book.is_borrowed = true;
}
function returnBook() {
    book.is_borrowed = false;
}
</script>

<template>
    <section id="reactivity">
        <h2>Reactivity</h2>

        <div class="reactivity-container">
            <div class="reactivity-content">
                <h3><code>ref()</code></h3>
                <p>
                    Used for primitives or any data type. Accessing/changing it
                    requires <code>.value.</code>
                </p>
                <p>Count: {{ count }}</p>
                <button @click="increment">Increment</button>
                <button @click="decrement">Decrement</button>
                <button @click="reset">Reset</button>
            </div>

            <div class="reactivity-content">
                <h3><code>reactive()</code></h3>
                <p>
                    Only for objects/arrays. You don't need <code>.value</code>,
                    but you can't destructure it without losing reactivity
                </p>

                <p>Book ID: {{ book.id }}</p>
                <p>Title: {{ book.title }}</p>
                <p>Category: {{ book.category }}</p>
                <p>Borrowed: {{ book.is_borrowed }}</p>
                <button @click="borrowBook">Borrow</button>
                <button @click="returnBook">Return</button>
            </div>
        </div>
    </section>
</template>

<style scoped>
#reactivity {
    box-sizing: border-box;
    padding: 2rem;
    text-align: center;
    background-color: #f7f7f8;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

#reactivity > h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: #222;
}

.reactivity-container {
    margin: 0 auto;
    max-width: 1000px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
}

.reactivity-content {
    background: #fff;
    border: 1px solid #e6e6ea;
    border-radius: 10px;
    padding: 1.25rem;
    text-align: left;
}

.reactivity-content h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1.2rem;
    color: #333;
}

.reactivity-content p {
    margin: 0.4rem 0;
    color: #444;
    line-height: 1.5;
}

.reactivity-content button {
    margin-right: 0.5rem;
    margin-top: 0.75rem;
    padding: 0.4rem 0.8rem;
    background: #f0f2f5;
    border: 1px solid #d0d7de;
    border-radius: 6px;
    cursor: pointer;
}
.reactivity-content button:hover {
    background: #e6eaef;
}

/* Responsive: stack columns on small screens */
@media (max-width: 768px) {
    .reactivity-container {
        grid-template-columns: 1fr;
    }
    #reactivity {
        padding: 1.25rem;
        border-radius: 10px;
    }
}
</style>
