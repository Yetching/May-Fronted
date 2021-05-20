//跨平台的自定义渲染器
//我们将针对不同平台的实际DOM操作之类的进行分离以便用户自定义
//与平台无关

import { patchData } from './patchData';

export default function createRenderer(options) {
  const {
    nodeOps: {
      createElement: platformCreateElement,
      createText: platformCreateText,
      setText: platformSetText, //等价于设置el.nodeValue
      appendChild: platformAppendChild,
      insertBefore: platformInsertBefore,
      removeChild: platformRemoveChild,
      parentNode: platformParentNode,
      nextSibling: platformNextSibling,
      querySelector: platformQuerySelector,
    },
    patchData: platformPatchData,
  } = options;

  function render(vnode, container) {}

  return { render };
}

//例如web平台的渲染器就如之前实现一样

const { render } = createRenderer({
  nodeOps: {
    createElement(tag, isSVG) {
      return isSVG
        ? document.createElementNS('http://www.w3.org/2000/svg', tag)
        : document.createElement(tag);
    },
    removeChild(parent, child) {
      parent.removeChild(child);
    },
    createText(text) {
      return document.createTextNode(text);
    },
    setText(node, text) {
      node.nodeValue = text;
    },
    appendChild(parent, child) {
      parent.appendChild(child);
    },
    insertBefore(parent, child, ref) {
      parent.insertBefore(child, ref);
    },
    parentNode(node) {
      return node.parentNode;
    },
    nextSibling(node) {
      return node.nextSibling;
    },
    querySelector(selector) {
      return document.querySelector(selector);
    },
  },
  patchData,
});
