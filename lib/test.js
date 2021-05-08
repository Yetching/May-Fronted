"use strict";

require("core-js/modules/web.dom-collections.iterator.js");

const testFunc = () => {
  console.log('函数测试');
};

const objA = {
  name: 'li',
  age: '20'
};
const arrA = [1, 2, 3, 4];
const arrB = [8, 9, ...arrA];
const strA = objA === null || objA === void 0 ? void 0 : objA.name;