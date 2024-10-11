<template>
  <div class="keypad w-100 h-100">
    <p class="text-end" style="grid-area:sta">{{ stack }}</p>
    <input class="form-control" type="text" readonly v-model="input" style="grid-area:inp">
    <button type="button" class="btn btn-secondary" style="grid-area:cls" @click="clear">C</button>
    <button type="button" class="btn btn-secondary" style="grid-area:bas" @click="back">&lt;</button>
    <button type="button" class="btn btn-secondary" style="grid-area:div" @click="operator('/')">/</button>
    <button type="button" class="btn btn-secondary" style="grid-area:mul" @click="operator('*')">*</button>
    <button type="button" class="btn btn-secondary" style="grid-area:sub" @click="operator('-')">-</button>
    <button type="button" class="btn btn-secondary" style="grid-area:add" @click="operator('+')">+</button>
    <button type="button" class="btn btn-primary" style="grid-area:eva" @click="evaluate">=</button>
    <button type="button" class="btn btn-light" style="grid-area:dot" @click="digit('.')">.</button>
    <button type="button" class="btn btn-light" :style="`grid-area:ky${i - 1}`" @click="digit(`${i-1}`)" v-for="i in 10">{{ i - 1 }}</button>
  </div>
</template>

<style lang="css">
.keypad {
  display: grid;
  grid-template:
    "sta sta sta sta" 20px
    "inp inp inp inp" auto
    "cls bas bas div" 1fr
    "ky7 ky8 ky9 mul" 1fr
    "ky4 ky5 ky6 sub" 1fr
    "ky1 ky2 ky3 add" 1fr
    "ky0 ky0 dot eva" 1fr;
  gap: 6px;
}
</style>

<script setup lang="ts">

import 'bootstrap/dist/css/bootstrap.min.css';
import { ref } from 'vue';
import { Parser } from 'expr-eval';

const stack = ref('');
const input = defineModel({default: '0'});


function clear() {
  stack.value = '';
  input.value = '0';
}

function back() {
  let a = input.value;
  if (a) {
    a = a.substring(0, a.length - 1);
  }
  if (!a) {
    a = '0';
  }
  input.value = a;
}

function operator(x: '+' | '-' | '*' | '/') {
  stack.value = `${stacked()} ${x}`;
  input.value = '0';
}

function evaluate() {
  const expr = stacked();
  try {
    input.value = `${Parser.evaluate(expr)}`;
  } catch(e) {
    if(e instanceof Error) {
      input.value = e.message;
    } else {
      input.value = 'error';
      console.error(`vue3-calc-ui unexpected error\n${e}`);
    }
  } finally {
    stack.value = expr;
  }
}

function digit(x: string) {
  let a = input.value + x;
  a = a.replace(/^0*([^.])/, '$1');
  if (/^([0-9]+|[0-9]+\.[0-9]*)$/.test(a)) {
    input.value = a;
  }
}

function stacked() {
  if (/[+\-*/]$/.test(stack.value)) {
    return `${stack.value} ${input.value}`;
  } else {
    return input.value;
  }
}

</script>
