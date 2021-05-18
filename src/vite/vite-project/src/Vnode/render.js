import { ChildrenFlags } from './ChildrenFlags';
import { VNodeFlags } from './VNodeFlags';
import { patch } from './patch';

export function mount(vnode, container, refNode) {
  const { flags } = vnode;
  if (flags & VNodeFlags.ELEMENT) {
    mountElement(vnode, container, refNode);
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
      vnode.el = children.el; //可以不需要指向
      break;
    case ChildrenFlags.NO_CHILDREN:
      //没有子节点，等价于挂载空片段，创建一个空的文本节点占位
      const placeholder = createTextNode('');
      mountText(placeholder, container);
      vnode.el = placeholder.el; //可以不需要指向
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

function mountStatefulComponentv1(vnode, container) {
  const instance = new vnode.tag();
  instance.$vnode = instance.render();
  mount(instance.$vnode, container);
  instance.$el = vnode.el = instance.$vnode.el;
}

//进阶

function mountStatefulComponent(vnode, container) {
  //创建实例
  //将实例存储在children属性中便于后续的获取
  //存储子节点对于组件类型的VNode，我们应该放在slots中
  const instance = (vnode.children = new vnode.tag());
  //初始化props，暂时最简单全部复制
  instance.$props = vnode.data;
  //实例的渲染更新
  instance._update = function () {
    if (instance._mounted) {
      console.log('component update');
      //1.拿到旧的vnode
      const prevVNode = instance.$vnode;
      //2.重新渲染新的vnode
      const nextVNode = (instance.$vnode = instance.render());
      //3.patch更新
      console.log(prevVNode.el.parentNode);
      patch(prevVNode, nextVNode, prevVNode.el.parentNode);
      //4.更新vnode.el和$el
      instance.$el = vnode.el = instance.$vnode.el;
    } else {
      //1.渲染vnode
      instance.$vnode = instance.render();
      //2.挂载
      mount(instance.$vnode, container);
      //3.组件已挂载标识
      instance._mounted = true;
      //4.DOM引用绑定
      instance.$el = vnode.el = instance.$vnode.el;
      //5.调用mounted钩子
      instance.mounted && instance.mounted();
    }
  };

  instance._update();
}

//函数式组件的挂载原理

function mountFunctionalComponent(vnode, container) {
  vnode.handle = {
    prev: null,
    next: vnode,
    container,
    update: () => {
      if (vnode.handle.prev) {
        const prevVNode = vnode.handle.prev;
        const nextVNode = vnode.handle.next;
        const prevTree = prevVNode.children;
        const props = nextVNode.data;
        const nextTree = (nextVNode.children = nextVNode.tag(props));
        patch(prevTree, nextTree, vnode.handle.container);
      } else {
        const props = vnode.data;
        const $vnode = (vnode.children = vnode.tag(props));
        mount($vnode, container);
        vnode.el = $vnode.el;
      }
    },
  };
  vnode.handle.update();
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

function mountElement(vnode, container, refNode) {
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
  refNode ? container.insertBefore(el, refNode) : container.appendChild(el);
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
