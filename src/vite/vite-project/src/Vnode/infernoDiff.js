import { lis } from './lis';
import { patch } from './patch';
import { mount } from './render';

export function diffV3(prevChildren, nextChildren, container) {
  //1.预处理，首先减少diff的工作量
  let j = 0;
  let prevVNode = prevChildren[j];
  let nextVNode = nextChildren[j];

  let prevEnd = prevChildren.length - 1;
  let nextEnd = nextChildren.length - 1;

  outer: {
    //从开始向后遍历，直到遇到不同key值的节点为止
    while (prevVNode.key === nextVNode.key) {
      patch(prevVNode, nextVNode, container);
      j++;
      if (j > prevEnd || j > nextEnd) {
        break outer;
      }
      prevVNode = prevChildren[j];
      nextVNode = nextChildren[j];
    }

    prevVNode = prevChildren[prevEnd];
    nextVNode = nextChildren[nextEnd];

    //从后向前遍历，直到遇到不同key值的节点为止
    while (prevVNode.key === nextVNode.key) {
      patch(prevVNode, nextVNode, container);
      prevVNode = prevChildren[--prevEnd];
      nextVNode = nextChildren[--nextEnd];
      if (j > prevEnd || j > nextEnd) {
        break outer;
      }
    }
  }

  //新的比旧的多出来的
  if (j > prevEnd && j <= nextEnd) {
    const nextPos = nextEnd + 1;
    //之前已经patch过了，因此这里的nextChildren[nextPos].el就是旧的el位置
    const refNode =
      nextPos < nextChildren.length ? nextChildren[nextPos].el : null;
    while (j <= nextEnd) {
      mount(nextChildren[j++], container, refNode);
    }
  } else if (j > nextEnd) {
    //移除多余节点
    while (j <= prevEnd) {
      container.removeChild(prevChildren[j++].el);
    }
  } else {
    console.log('diffV3');
    //2.Diff的下一步，判断需要移动的DOM
    const nextLeft = nextEnd - j + 1;
    //创建一个全是-1的数组用于存储新节点在旧children中的位置
    //后面会使用它计算出一个最长递增子序列，用于DOM移动
    const source = new Array(nextLeft).fill(-1);
    const prevStart = j;
    const nextStart = j;
    let moved = false;
    let pos = 0;

    //建立索引表，以空间换时间
    //时间复杂度为O(n)
    const keyIndex = {};

    for (let i = nextStart; i <= nextEnd; i++) {
      keyIndex[nextChildren[i].key] = i;
    }
    let patched = 0;
    //
    for (let i = prevStart; i <= prevEnd; i++) {
      prevVNode = prevChildren[i];

      if (patched < nextLeft) {
        const k = keyIndex[prevVNode.key];
        if (typeof k !== 'undefined') {
          nextVNode = nextChildren[k];
          patch(prevVNode, nextVNode, container);
          patched++;
          source[k - nextStart] = i;
          if (k < pos) {
            moved = true;
          } else {
            pos = k;
          }
        } else {
          container.removeChild(prevVNode.el);
        }
      } else {
        console.log(111);
        container.removeChild(prevVNode.el);
      }
      //moved
    }

    if (moved) {
      console.log('moved');
      const seq = lis(source);
      let j = seq.length - 1;
      for (let i = nextLeft - 1; i >= 0; i--) {
        if (source[i] === -1) {
          //新节点的挂载
          const pos = i + nextStart;
          const nextVNode = nextChildren[pos];
          const nextPos = pos + 1;
          console.log(nextPos < nextChildren.length);
          mount(
            nextVNode,
            container,
            nextPos < nextChildren.length ? nextChildren[nextPos].el : null
          );
        } else if (i !== seq[j]) {
          //移动
          const pos = i + nextStart;
          const nextVNode = nextChildren[pos];
          const nextPos = pos + 1;
          console.log(nextPos < nextChildren.length);
          container.insertBefore(
            nextVNode.el,
            nextPos < nextChildren.length ? nextChildren[nextPos].el : null
          );
        } else {
          j--;
        }
      }
    }

    //时间复杂度为O(n*n*)
    // for (let i = prevStart; i <= prevEnd; i++) {
    //   const prevVNode = prevChildren[i];
    //   for (let k = nextStart; k <= nextEnd; k++) {
    //     const nextVNode = nextChildren[k];
    //     if (prevVNode.key === nextVNode.key) {
    //       patch(prevVNode, nextVNode, container);
    //       source[k - nextStart] = i;
    //       if (k < pos) {
    //         moved = true;
    //       } else {
    //         pos = k;
    //       }
    //     }
    //   }
    // }
  }
}
