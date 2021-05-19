import { patch } from './patch';
import { mount } from './render';

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
    //由于非理想情况下会形成undefined的VNode
    //同时后续对比中oldStartIdx和oldEndIdx总有一个索引达到这个位置
    //当oldStartVNode或oldEndVNode等于undefined时，我们跳过这一位置
    if (!oldStartVNode) {
      oldStartVNode = prevChildren[++oldStartIdx];
    } else if (!oldEndVNode) {
      oldEndVNode = prevChildren[--oldEndIdx];
    } else if (oldStartVNode.key === newStartVNode.key) {
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
    } else {
      //以上四步都没有复用的节点
      //遍历旧的children，试图寻找与newStartVNode拥有相同key的元素
      const idxInOld = prevChildren.findIndex(
        (node) => node.key === newStartVNode.key
      );
      if (idxInOld >= 0) {
        const vnodeToMove = prevChildren[idxInOld];
        patch(vnodeToMove, newStartVNode, container);
        container.insertBefore(vnodeToMove.el, oldStartVNode.el);
        prevChildren[idxInOld] = undefined;
      } else {
        mount(newStartVNode, container, oldStartVNode.el);
      }
      newStartVNode = nextChildren[++newStartIdx];
    }
  }
  //当有新节点，且最后处理时可能会忽略，所以判断oldEndIdx和oldStartIdx来改进
  if (oldEndIdx < oldStartIdx) {
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      //此时oldStartVNode已经指向上一个操作的VNode
      mount(nextChildren[i], container, oldStartVNode.el);
    }
  } else if (newEndIdx < oldStartIdx) {
    //移除多余元素
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      container.removeChild(prevChildren[i].el);
    }
  }
}
