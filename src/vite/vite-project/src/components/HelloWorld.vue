<template>
  <h1>{{ msg }}</h1>

  <p>
    <a
      href="https://vitejs.dev/guide/features.html"
      target="_blank"
    >
      Vite Documentation
    </a>
    |
    <a
      href="https://v3.vuejs.org/"
      target="_blank"
    >Vue 3 Documentation</a>
  </p>

  <button @click="state.count++">count is: {{ state.count }}</button>
  <p>
    Edit
    <code>components/HelloWorld.vue</code> to test hot module replacement.
  </p>
  <div id="comp"></div>
  <button @click="changeNode">生成新Vnode</button>
</template>

<script setup>
import { defineProps, onMounted, reactive } from "vue";
import { h, init } from "snabbdom";

defineProps({
  msg: String,
});

const state = reactive({ count: 0 });

const patch = init([]);

const Mycomponent = (props) => {
  return h("h1", props.title);
};

const comp = Mycomponent({ title: "My Component" });

console.log(comp);

const changeNode = () => {
  const nextVnode = Mycomponent({ title: "New Component" });
  patch(comp, nextVnode);
};

onMounted(() => {
  patch(document.getElementById("comp"), comp);
});
</script>

<style scoped>
a {
  color: #42b983;
}
</style>
