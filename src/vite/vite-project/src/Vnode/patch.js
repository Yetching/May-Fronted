import { VNodeFlags } from './VNodeFlags';
import { mount } from './render';
import { patchData } from './patchData';
import { ChildrenFlags } from './ChildrenFlags';

export function patch(prevVNode, nextVNode, container) {
  const nextFlags = nextVNode.flags;
  const prevFlags = prevVNode.flags;

  if (prevFlags !== nextFlags) {
    replaceVNode(prevVNode, nextVNode, container);
  } else if (nextFlags & VNodeFlags.ELEMENT) {
    patchElement(prevVNode, nextVNode, container);
  } else if (nextFlags & VNodeFlags.COMPONENT) {
    pacthComponent(prevVNode, nextVNode, container);
  } else if (nextFlags & VNodeFlags.TEXT) {
    patchText(prevVNode, nextVNode);
  } else if (nextFlags & VNodeFlags.FRAGMENT) {
    patchFragment(prevVNode, nextVNode, container);
  } else if (nextFlags & VNodeFlags.PORTAL) {
    patchPortal(prevVNode, nextVNode);
  }
}

//前后两个flags不一样时

function replaceVNode(prevVNode, nextVNode, container) {
  container.removeChild(prevVNode.el);
  mount(nextVNode, container);
}

//更新文本节点

function patchText(prevVNode, nextVNode) {
  const el = (nextVNode.el = prevVNode.el);
  //VNode: {
  //   flags: 64, tag: null, children: '文本内容', childFlags: 1, el: textNode
  // }
  if (nextVNode.children !== prevVNode.children) {
    //只有用crateTextNode得到的el才具有nodeValue属性
    el.nodeValue = nextVNode.children;
  }
}

//更新Fragment
//跟更新Element相似，差别在于只需要直接处理children就好了

function patchFragment(prevVNode, nextVNode, container) {
  patchChildren(
    prevVNode.childFlags,
    nextVNode.childFlags,
    prevVNode.children,
    nextVNode.children,
    container
  );

  switch (nextVNode.childFlags) {
    case ChildrenFlags.SINGLE_VNODE:
      nextVNode.el = nextVNode.children.el;
      break;
    case ChildrenFlags.NO_CHILDREN:
      nextVNode.el = prevVNode.el;
      break;
    default:
      nextVNode.el = nextVNode.children[0].el
      break;
  }
}

//更新标签

function patchElement(prevVNode, nextVNode, container) {
  if (prevVNode.tag !== nextVNode.tag) {
    replaceVNode(prevVNode, nextVNode, container);
    return;
  }

  //标签名也一样时，patch变化的是dataValue

  const el = (nextVNode.el = prevVNode.el);

  const nextData = nextVNode.data;
  const prevData = prevVNode.data;

  if (nextData) {
    for (let key in nextData) {
      const prevValue = prevData[key];
      const nextValue = nextData[key];
      patchData(el, key, prevValue, nextValue);
    }
  }
  //上面的遍历只会遍历新vnode的data，比如style、class
  //假如旧的vnode其data有onclick时不会被遍历到
  if (prevData) {
    for (let key in prevData) {
      const prevValue = prevData[key];
      if (prevValue && !nextData.hasOwnProperty(key)) {
        patchData(el, key, prevValue, null);
      }
    }
  }

  //递归更新子节点
  patchChildren(
    prevVNode.childFlags,
    nextVNode.childFlags,
    prevVNode.children,
    nextVNode.children,
    el
  );
}

function patchChildren(
  prevChildFlags,
  nextChildFlags,
  prevChildren,
  nextChildren,
  container
) {
  switch (prevChildFlags) {
    case ChildrenFlags.SINGLE_VNODE:
      switch (nextChildFlags) {
        case ChildrenFlags.SINGLE_VNODE:
          patch(prevChildren, nextChildren, container);
          break;
        case ChildrenFlags.NO_CHILDREN:
          if (prevChildren.el) {
            container.removeChild(prevChildren.el);
          } else {
            //自己设计针对children为片段时，即fragment
            prevChildren.children.forEach((child) => {
              container.removeChild(child.el);
            });
          }
          break;
        default:
          container.removeChild(prevChildren.el);
          nextChildren.forEach((child) => {
            mount(child, container);
          });
          break;
      }
      break;
    case ChildrenFlags.NO_CHILDREN:
      switch (nextChildFlags) {
        case ChildrenFlags.NO_CHILDREN:
          break;
        case ChildrenFlags.SINGLE_VNODE:
          mount(nextChildren, container);
          break;
        default:
          nextChildren.forEach((nextChild) => {
            mount(nextChild, container);
          });
          break;
      }
      break;
    default:
      switch (nextChildFlags) {
        case ChildrenFlags.NO_CHILDREN:
          prevChildren.forEach((prevChild) => {
            container.removeChild(prevChild.el);
          });
          break;
        case ChildrenFlags.SINGLE_VNODE:
          prevChildren.forEach((prevChild) => {
            container.removeChild(prevChild.el);
          });
          mount(nextChildren, container);
          break;
        //当新旧子节点都是多个子节点时才有必要进行真正的核心diff
        //从而尽可能的复用子节点，提高patch更新的性能
        default:
          //简单思想，不考虑复用性能，简单粗暴
          prevChildren.forEach((prevChild) => {
            container.removeChild(prevChild.el);
          });
          nextChildren.forEach((nextChild) => {
            mount(nextChild, container);
          });
          break;
      }
  }
}