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
  <div
    id="ele"
    class="ele"
  ></div>
  <button @click="patchNode">patch操作</button>
  <button @click="patchNodeV2">第二次patch操作</button>
</template>

<script setup>
import { defineProps, onMounted, reactive } from "vue";
import { h, init } from "snabbdom";
import {
  elementVNode,
  fragmentVNode,
  portalVNode,
  functionalVNode,
  statefulVNode,
} from "../Vnode/Vnode";

import {
  prevMulEleVNode,
  prevSingleEleVNode,
  prevNoEleVNode,
  nextMulEleVNode,
  nextSingleEleVNode,
  nextNoEleVNode,
  prevTextVNode,
  nextTextVNode,
  prevFragVNode,
  nextFragVNode,
  prevPorVNode,
  nextPorVNode,
  MyComponent,
  ParentComponent,
  ChildComponent,
} from "../Vnode/testVNode";

import { VNodeFlags } from "../Vnode/VNodeFlags";

import { render } from "../Vnode/render";
import { hV2 } from "../Vnode/h";

defineProps({
  msg: String,
});

const state = reactive({ count: 0 });

const patch = init([]);

const Mycomponent = (props) => {
  return h("h1", props.title);
};

const comp = Mycomponent({ title: "My Component" });

const statefulComp = hV2(ParentComponent);

console.log(elementVNode);

console.log(fragmentVNode);

console.log(portalVNode);

console.log(functionalVNode);

console.log(statefulVNode);

console.log(VNodeFlags);

onMounted(() => {
  console.log(document.getElementsByClassName("app-ele")[0]);
  // render(prevPorVNode, document.getElementById("ele"));
  render(statefulComp, document.getElementById("ele"));

  //此时在该组件的css对render生成的DOM不生效
  //解决: 因为组件是vue自己的，在编译的时候会将scoped作为特殊ID添加至每一个
  //html元素的属性上，所以实际的样式选择变为了
  // .app-ele[data-v-xxxx]
  //我们自己render生成的dom暂时没有data-v-xxx字段
  console.log(document.getElementsByClassName("app-ele")[0]);
});
const changeNode = () => {
  const nextVnode = Mycomponent({ title: "New Component" });
  patch(comp, nextVnode);
};

const patchNode = () => {
  render(nextPorVNode, document.getElementById("ele"));
};

const patchNodeV2 = () => {
  render(statefulVNode, document.getElementById("ele"));
};

// onMounted(() => {
// });
</script>

<style scoped>
a {
  color: #42b983;
}
.app-ele {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
</style>
