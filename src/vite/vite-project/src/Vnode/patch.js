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
    console.log('component patch');
    patchComponent(prevVNode, nextVNode, container);
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
  //改进,调用unmounted钩子函数
  if (prevVNode.flags & VNodeFlags.COMPONENT_STATEFUL_NORMAL) {
    const instance = prevVNode.children;
    instance.unmounted && instance.unmounted();
  }

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
  console.log(prevVNode);
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
      console.log(prevVNode);
      nextVNode.el = prevVNode.el;
      break;
    default:
      nextVNode.el = nextVNode.children[0].el;
      break;
  }
  console.log(nextVNode);
}

//更新Portal

function patchPortal(prevVNode, nextVNode) {
  //patchChildren函数处理之后，新的子节点已存在于旧的容器里了
  //appendChild方法会将页面已存在的元素节点移动到新的目标容器
  patchChildren(
    prevVNode.childFlags,
    nextVNode.childFlags,
    prevVNode.children,
    nextVNode.children,
    prevVNode.tag
  );

  nextVNode.el = prevVNode.el;

  if (prevVNode.tag !== nextVNode.tag) {
    const container =
      typeof nextVNode.tag === 'string'
        ? document.querySelector(nextVNode.tag)
        : nextVNode.tag;

    switch (nextVNode.childFlags) {
      case ChildrenFlags.SINGLE_VNODE:
        container.appendChild(nextVNode.children.el);
        break;
      case ChildrenFlags.NO_CHILDREN:
        break;
      default:
        nextVNode.children.forEach((nextChild) => {
          container.appendChild(nextChild.el);
        });
        break;
    }
  }
}

//更新component

function patchComponent(prevVNode, nextVNode, container) {
  //前后更新的组件不一致时，直接替换，因为我们改进一下replaceVNode
  if (nextVNode.tag !== prevVNode.tag) {
    replaceVNode(prevVNode, nextVNode, container);
  } else if (nextVNode.flags & VNodeFlags.COMPONENT_STATEFUL_NORMAL) {
    const instance = (nextVNode.children = prevVNode.children);
    instance.$props = nextVNode.data;
    instance._update();
  } else {
    const handle = (nextVNode.handle = prevVNode.handle);
    handle.prev = prevVNode;
    handle.next = nextVNode;
    handle.container = container;

    handle.update();
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
          //遍历移除，挂载
          // prevChildren.forEach((prevChild) => {
          //   container.removeChild(prevChild.el);
          // });
          // nextChildren.forEach((nextChild) => {
          //   mount(nextChild, container);
          // });

          // //标签相同的情况下，我们只需要像处理element一样处理dataValue和children
          // const prevLen = prevChildren.length;
          // const nextLen = nextChildren.length;
          // const commonLength = Math.min(prevLen, nextLen);
          // for (let i = commonLength; i > 0; i--) {
          //   patch(prevChildren[i], nextChildren[i], container);
          // }
          // if (nextLen > prevLen) {
          //   for (let i = commonLength; i < nextLen; i++) {
          //     mount(nextChildren[i], container);
          //   }
          // } else if (prevLen > nextLen) {
          //   for (let i = commonLength; i < prevLen; i++) {
          //     container.removeChild(prevChildren[i].el);
          //   }
          // }

          //引入key值之后的思路
          //存储寻找过程中的最大索引值
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
                i - 1 < 0
                  ? prevChildren[0].el
                  : nextChildren[i - 1].el.nextSibling;
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

          break;
      }
      break;
  }
}
