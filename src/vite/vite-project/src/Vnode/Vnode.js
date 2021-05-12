//Vnode描述真实dom

import { VNodeFlags } from './VNodeFlags';

const elVnode = {
  tag: 'div',
  data: {
    style: {
      width: '100px',
      height: '100px',
    },
  },
  children: [
    { tag: 'span', data: null },
    {
      tag: 'p',
      data: {
        style: {
          color: '#fff',
        },
      },
    },
  ],
};

//Vnode描述抽象内容，如组件
//此时tag我们使用一个定义的组件类来区别原生标签
//通过检查tag属性值是否为字符串来确定Vnode的类型

class MyComponent {
  render() {
    return {
      tag: 'div',
      data: null,
    };
  }
}

const elVnode1 = {
  tag: 'div',
  data: null,
  children: {
    tag: MyComponent,
    data: null,
  },
};

//两种特殊的抽象内容  Fragment、Portal

//1.Fragment
//  把所有td都作为fragmentVnode的子节点，根元素并不是一个真实dom
//  当渲染器遇到Fragment时将直接只渲染所有子节点至页面

// const Fragment = Symbol();

const fragmentVnode = {
  tag: Fragment,
  data: null,
  children: [
    {
      tag: 'td',
      data: null,
    },
    {
      tag: 'td',
      data: null,
    },
  ],
};

//2.Portal
//  蒙层指定到自定义区域，将子节点渲染到给定的目标
//  vue3中的teleport

const jsx = `
  <template>
    <Portal target="#app-root">
      <div class="overlay"></div>
    </Portal>
  </template>
  `;

// const Portal = Symbol();

const portalVnode = {
  tag: Portal,
  data: {
    target: '#app-root',
  },
  children: {
    tag: 'div',
    data: {
      class: 'overlay',
    },
  },
};

//Vnode分类

const Vnode = {
  htmlAndSvg: {
    name: '各种标签',
  },
  component: {
    name: '自定义组件',
    type: [
      {
        name: '有状态组件',
        type: [
          {
            name: '普通的有状态组件',
          },
          {
            name: '需要被keepAlive的有状态组件',
          },
          {
            name: '已经被keepAlive的有状态组件',
          },
        ],
      },
      {
        name: '函数式组件',
      },
    ],
  },
  text: {
    name: '纯文本',
  },
  Fragment: {
    name: 'Fragment',
  },
  Portal: {
    name: 'Portal',
  },
};

//flas标识
//用于标识Vnode属于哪一类

//枚举值VnodeFlags

const VnodeFlags = {
  ELEMENT_HTML: 1,
  ELEMENT_SVG: 2,

  COMPONENT_STATEFUL_NORMAL: 3,
  COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE: 4,
  COMPONENT_STATEFUL_KEPT_ALIVE: 5,

  COMPONENT_FUNCTIONAL: 6,

  TEXT: 7,

  FRAGMENT: 8,

  PORTAL: 9,
};

const params = {
  name: 'you',
  age: 20,
  sex: 'female',
  major: '',
};

Object.keys(params).forEach((key) => {
  console.log(key);
  if (params[key] === '') {
    // Reflect.deleteProperty(params, key);
    delete params[key];
  }
});

console.log(params);

export class VNode {
  _isVNode = true;
  el = Element | null;
  flags = VNodeFlags;
}

import { Fragment, Portal, hV2 } from './h';

// import { Component } from 'vue';

function handler() {
  alert('click me');
}

export const elementVNode = hV2(
  'div',
  {
    style: {
      height: '100px',
      width: '100px',
      background: 'green',
    },
    class: [
      'app-ele',
      {
        'app-ele': true,
        'ele-color': true,
        'color-test': true,
      },
    ],
  },
  [
    hV2('input', {
      class: 'cls-a',
      type: 'checkbox',
      checked: true,
      custom: 'custom',
    }),
    hV2('div', {
      style: {
        height: '50px',
        width: '50px',
        background: '#8cc',
      },
      onclick: handler,
    }),
  ]
);

export const fragmentVNode = hV2(Fragment, null, [hV2('td'), hV2('td')]);

export const portalVNode = hV2(
  Portal,
  {
    target: '#app',
  },
  hV2('h1')
);

//函数式组件

function MyFunctionalComponent() {}

export const functionalVNode = hV2(MyFunctionalComponent, null, hV2('div'));

//有状态的组件
//我们在编写有状态组件时通常会继承一个设计好的基础组件;
class Component {
  render() {
    throw '组件缺少render函数';
  }
}

//如果组件没有render函数也就没有意义，打印错误信息

class MyStatefulComponent extends Component {}

export const statefulVNode = hV2(MyStatefulComponent, null, hV2('div'));
