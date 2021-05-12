import { ChildrenFlags } from './ChildrenFlags';
import { VNodeFlags } from './VNodeFlags';

function mount(vnode, container) {
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

function patch(preVNode, vnode, container) {}

//挂载普通标签

const domPropsRE = /\[A-Z]|^(?:value|checked|selected|muted)$/;

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
      switch (key) {
        case 'style':
          for (let k in data.style) {
            el.style[k] = data.style[k];
          }
          break;
        case 'class':
          el.className = data[key];
          break;
        default:
          if (key[0] === 'o' && key[1] === 'n') {
            el.addEventListener(key.slice(2), data[key]);
          } else if (domPropsRE.test(key)) {
            el[key] = data[key];
          } else {
            el.setAttribute(key, data[key]);
          }
      }
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
