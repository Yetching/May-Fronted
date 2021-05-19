import { patch } from './patch';
import { mount } from './render';

export function diffV1(prevChildren, nextChildren, container) {
  //引入key值之后的思路
  //存储寻找过程中的最大索引值
  console.log('使用react diff算法');
  const startTime = new Date().getTime();
  let lastIndex = 0;
  //1.首先找到可复用的节点，即节点的key值相等，同时patch保证更新
  for (let i = 0; i < nextChildren.length; i++) {
    const nextVNode = nextChildren[i];
    let find = false;
    for (let j = 0; j < prevChildren.length; j++) {
      const prevVNode = prevChildren[j];
      if (nextVNode.key === prevVNode.key) {
        find = true;
        patch(prevVNode, nextVNode, container);
        if (j < lastIndex) {
          //2.找到需要移动的节点

          //需要移动
          //找到需要插入位置的前一个子节点的nextSibling。紧跟其后的节点
          //如果是最后一个节点，则返回null，测试好像都是null
          //我的理解，两个标签之前存在一个nextSibling即#text文本节点、null
          const refNode = nextChildren[i - 1].el.nextSibling;
          container.insertBefore(prevVNode.el, refNode);
          //上面两行代码相当于实现一个insertAfter
          break;
        } else {
          lastIndex = j;
        }
      }
    }
    if (!find) {
      const refNode =
        i - 1 < 0 ? prevChildren[0].el : nextChildren[i - 1].el.nextSibling;
      mount(nextVNode, container, refNode);
    }
  }

  //遍历旧的节点，移除不存在的节点
  prevChildren.forEach((prevVNode) => {
    console.log(prevVNode.key);
    const has = nextChildren.find((nextVNode) => {
      return nextVNode.key === prevVNode.key;
    });
    console.log(has);
    if (!has) {
      container.removeChild(prevVNode.el);
    }
  });

  const endTime = new Date().getTime();

  console.log('reactDiff耗时：' + (endTime - startTime) + 'ms');
}
