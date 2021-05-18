import { patch } from './patch';

export function diffV2(prevChildren, nextChildren, container) {
  let oldStartIdx = 0;
  let oldEndIdx = prevChildren.length - 1;
  let newStartIdx = 0;
  let newEndIdx = nextChildren.length - 1;

  //vnode
  let oldStartVNode = prevChildren[oldStartIdx];
  let oldEndVNode = prevChildren[oldEndIdx];
  let newStartVNode = nextChildren[newStartIdx];
  let newEndVNode = nextChildren[newEndIdx];

  //双端比较
  while (newStartIdx <= newEndIdx && oldStartIdx <= oldEndIdx) {
    if (oldStartVNode.key === newStartVNode.key) {
      patch(oldStartVNode, newStartVNode, container);
      oldStartVNode = prevChildren[++oldStartIdx];
      newStartVNode = nextChildren[++newStartIdx];
    } else if (oldEndVNode.key === newEndVNode.key) {
      patch(oldEndVNode, newEndVNode, container);
      oldEndVNode = prevChildren[--oldEndIdx];
      newEndVNode = nextChildren[--newEndIdx];
    } else if (oldStartVNode.key === newEndVNode.key) {
      patch(oldStartVNode, newEndVNode, container);
      container.insertBefore(oldStartVNode.el, oldEndVNode.el.nextSibling);
      oldStartVNode = prevChildren[++oldStartIdx];
      newEndVNode = nextChildren[--newEndIdx];
    } else if (oldEndVNode.key === newStartVNode.key) {
      patch(oldEndVNode, newStartVNode, container);
      container.insertBefore(oldEndVNode.el, oldStartVNode.el);
      //更新索引
      oldEndVNode = prevChildren[--oldEndIdx];
      newStartVNode = nextChildren[++newStartIdx];
    }
  }
}
