import { ChildrenFlags } from './ChildrenFlags';
import { VNodeFlags } from './VNodeFlags';
import { patch } from './patch';

export function mount(vnode, container) {
  const { flags } = vnode;
  if (flags & VNodeFlags.ELEMENT) {
    mountElement(vnode, container);
  } else if (flags & VNodeFlags.COMPONENT) {
    mountComponent(vnode, container);
  } else if (flags & VNodeFlags.TEXT) {
    mountText(vnode, container);
  } else if (flags & VNodeFlags.FRAGMENT) {
    mountFragment(vnode, container);
  } else if (flags & VNodeFlags.PORTAL) {
    mountPortal(vnode, container);
  }
}

//创建文本节点

function createTextNode(text) {
  return document.createTextNode(text);
}

//挂载纯文本

function mountText(vnode, container) {
  const el = document.createTextNode(vnode.children);
  vnode.el = el;
  container.appendChild(el);
}

//挂载Fragment

function mountFragment(vnode, container) {
  const { childFlags, children } = vnode;
  switch (childFlags) {
    case ChildrenFlags.SINGLE_VNODE:
      mount(children, container);
      vnode.el = children.el;
      break;
    case ChildrenFlags.NO_CHILDREN:
      //没有子节点，等价于挂载空片段，创建一个空的文本节点占位
      const placeholder = createTextNode('');
      mountText(placeholder, container);
      vnode.el = placeholder.el;
      break;
    default:
      children.forEach((child) => {
        mount(child, container);
      });
      // vnode.el = children[0].el; //这个地方会涉及之后patch的一些处理，暂时设计取第一个
  }
}

//挂载Portal

function mountPortal(vnode, container) {
  const { tag, children, childFlags } = vnode;

  const target = typeof tag === 'string' ? document.querySelector(tag) : tag;

  if (childFlags & ChildrenFlags.SINGLE_VNODE) {
    mount(children, target);
  } else if (childFlags & ChildrenFlags.MULTIPLE_VNODES) {
    children.forEach((child) => {
      mount(child, target);
    });
  }

  //占位的空文本节点
  const placeholder = createTextNode('');
  mountText(placeholder, container);
  vnode.el = placeholder.el;
}

//有状态的组件的挂载原理，data、props、ref等基于组件实例的设计，暂不考虑

function mountStatefulComponent(vnode, container) {
  const instance = new vnode.tag();
  instance.$vnode = instance.render();
  mount(instance.$vnode, container);
  instance.$el = vnode.el = instance.$vnode.el;
}

//函数式组件的挂载原理

function mountFunctionalComponent(vnode, container) {
  const $vnode = vnode.tag();
  mount($vnode, container);
  vnode.el = $vnode.el;
}

//挂载组件

function mountComponent(vnode, container) {
  if (vnode.flags & VNodeFlags.COMPONENT_STATEFUL) {
    mountStatefulComponent(vnode, container);
  } else {
    mountFunctionalComponent(vnode, container);
  }
}

//挂载普通标签

import { patchData } from './patchData';

function mountElement(vnode, container) {
  const isSVG = vnode.flags & VNodeFlags.ELEMENT_SVG;
  const el = isSVG
    ? document.createElementNS('http://www.w3.org/2000/svg', vnode.tag)
    : document.createElement(vnode.tag);
  //VNode被渲染为真实DOM之后，引用真实DOM元素
  vnode.el = el;
  //将VNodeData应用到真实DOM上，如style、class等属性
  const data = vnode.data;
  if (data) {
    Object.keys(data).forEach((key) => {
      patchData(el, key, null, data[key]);

      //封装成patchData函数，方便mount和patch时复用

      // switch (key) {
      //   case 'style':
      //     for (let k in data.style) {
      //       el.style[k] = data.style[k];
      //     }
      //     break;
      //   case 'class':
      //     el.className = data[key];
      //     break;
      //   default:
      //     if (key[0] === 'o' && key[1] === 'n') {
      //       el.addEventListener(key.slice(2), data[key]);
      //     } else if (domPropsRE.test(key)) {
      //       el[key] = data[key];
      //     } else {
      //       el.setAttribute(key, data[key]);
      //     }
      // }
    });
  }
  //继续挂载子节点,同样要对子节点的类型进行处理

  const childFlags = vnode.childFlags;
  const children = vnode.children;
  if (childFlags !== ChildrenFlags.NO_CHILDREN) {
    if (childFlags & ChildrenFlags.SINGLE_VNODE) {
      mount(children, el);
    } else if (childFlags & ChildrenFlags.MULTIPLE_VNODES) {
      for (let i = 0; i < children.length; i++) {
        mount(children[i], el);
      }
    }
  }
  //简化版思想
  // if (vnode.children) {
  //   for (let i = 0; i < vnode.children.length; i++) {
  //     mountElement(vnode.children[i], el);
  //   }
  // }
  container.appendChild(el);
}

export function render(vnode, container) {
  const preVNode = container?.vnode;
  if (preVNode == null) {
    if (vnode) {
      mount(vnode, container);
      container.vnode = vnode;
    }
  } else {
    if (vnode) {
      patch(preVNode, vnode, container);
      container.vnode = vnode;
    } else {
      container.removeChild(preVNode.el);
      container.vnode = null;
    }
  }
}
