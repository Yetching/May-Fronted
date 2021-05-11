import { VNodeFlags } from './VNodeFlags';
import { ChildrenFlags } from './ChildrenFlags';

export const Fragment = Symbol();

export const Portal = Symbol();

export function hV1() {
  return {
    _isVNode: true,
    flags: VNodeFlags.ELEMENT_HTML,
    tag: 'h1',
    data: null,
    children: null,
    childFlags: ChildrenFlags.NO_CHILDREN,
    el: null,
  };
}

function normalizeVNodes(children) {
  const newChildren = [];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.key == null) {
      child.key = '|' + i;
    }
    newChildren.push(child);
  }
  return newChildren;
}

//文本节点

function createTextVNode(text) {
  return {
    _isVNode: true,
    flags: VNodeFlags.TEXT,
    tag: null,
    data: null,
    children: text,
    childFlags: ChildrenFlags.NO_CHILDREN,
  };
}

//提取tag，data，children为参数

export function hV2(tag, data = null, children = null) {
  let flags = null;
  if (typeof tag === 'string') {
    flags = tag === 'svg' ? VNodeFlags.ELEMENT_SVG : VNodeFlags.ELEMENT_HTML;
  } else if (tag === Fragment) {
    flags = VNodeFlags.FRAGMENT;
  } else if (tag === Portal) {
    flags = VNodeFlags.PORTAL;
    tag = data && data.target;
  } else {
    // 兼容 Vue2 的对象式组件
    if (tag !== null && typeof tag === 'object') {
      flags = tag.functional
        ? VNodeFlags.COMPONENT_FUNCTIONAL // 函数式组件
        : VNodeFlags.COMPONENT_STATEFUL_NORMAL; // 有状态组件
    } else if (typeof tag === 'function') {
      // Vue3 的类组件
      flags =
        tag.prototype && tag.prototype.render
          ? VNodeFlags.COMPONENT_STATEFUL_NORMAL // 有状态组件
          : VNodeFlags.COMPONENT_FUNCTIONAL; // 函数式组件
    }
  }
  let childFlags = null;
  if (Array.isArray(children)) {
    const { length } = children;
    if (length === 0) {
      // 没有 children
      childFlags = ChildrenFlags.NO_CHILDREN;
    } else if (length === 1) {
      // 单个子节点
      childFlags = ChildrenFlags.SINGLE_VNODE;
      children = children[0];
    } else {
      // 多个子节点，且子节点使用key
      childFlags = ChildrenFlags.KEYED_VNODES;
      children = normalizeVNodes(children);
    }
  } else if (children == null) {
    // 没有子节点
    childFlags = ChildrenFlags.NO_CHILDREN;
  } else if (children._isVNode) {
    // 单个子节点
    childFlags = ChildrenFlags.SINGLE_VNODE;
  } else {
    // 其他情况都作为文本节点处理，即单个子节点，会调用 createTextVNode 创建纯文本类型的 VNode
    childFlags = ChildrenFlags.SINGLE_VNODE;
    children = createTextVNode(children + '');
  }

  return {
    _isVNode: true,
    flags,
    tag,
    data,
    children,
    childFlags,
    el: null,
  };
}
