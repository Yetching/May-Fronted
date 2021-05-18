import { Fragment, hV2, Portal } from './h';

export const prevDiffVNode = hV2('div', null, [
  hV2('h3', { key: 'a' }, '节点1'),
  hV2('h3', { key: 'b' }, '节点2'),
  hV2('h3', { key: 'c' }, '节点3'),
  hV2('h3', { key: 'd' }, '节点4'),
  hV2('h3', { key: 'e' }, '节点5'),
]);

export const nextDiffVNode = hV2('div', null, [
  hV2('h3', { key: 'a' }, '新节点1'),
  hV2('h1', { key: 'f' }, '新节点6'),
  hV2('h3', { key: 'e' }, '新节点5'),
  hV2('h3', { key: 'b' }, '新节点2'),
  hV2('h3', { key: 'c' }, '新节点3'),
]);

export class MyComponent {
  localState = 1;

  mounted() {
    setInterval(() => {
      this.localState++;
      this._update();
    }, 1000);
  }

  render() {
    return hV2('div', null, '计时器:' + this.localState);
  }
}

export class ParentComponentV1 {
  localState = 'one';
  isTrue = true;

  unmounted() {
    console.log('组件已卸载');
  }

  mounted() {
    setTimeout(() => {
      this.isTrue = false;
      this.localState = 'two';
      this._update();
    }, 2000);
  }

  render() {
    return this.isTrue
      ? hV2(ChildComponent, {
          text: this.localState,
        })
      : hV2(ChildComponentV2, {
          text: this.localState,
        });
  }
}

export class ParentComponent {
  localState = 'one';
  isTrue = true;

  unmounted() {
    console.log('组件已卸载');
  }

  mounted() {
    setTimeout(() => {
      this.isTrue = false;
      this.localState = 'two';
      this._update();
    }, 2000);
  }

  render() {
    return this.isTrue
      ? hV2(MyFunctionalComp, {
          text: this.localState,
        })
      : hV2(MyFunctionalCompV2, { text: this.localState });
  }
}

export function MyFunctionalComp(props) {
  return hV2('div', null, props.text);
}

export function MyFunctionalCompV2(props) {
  return hV2('h3', null, props.text);
}

export class ChildComponentV2 {
  render() {
    return hV2('h3', null, this.$props.text);
  }
}

export class ChildComponent {
  unmounted() {
    console.log('组件已卸载');
  }
  render() {
    return hV2('div', null, this.$props.text);
  }
}

export const prevTextVNode = hV2('p', null, '旧文本节点');

export const nextTextVNode = hV2('p', null, '新文本节点');

export const prevPorVNode = hV2(
  Portal,
  { target: '#comp' },
  hV2('p', null, '旧的Portal')
);

export const nextPorVNode = hV2(
  Portal,
  { target: '#app' },
  hV2('p', null, '新的Portal')
);

export const prevFragVNode = hV2(Fragment, null, [
  hV2('p', null, '旧片段子节点1'),
  hV2('p', null, '旧片段子节点2'),
]);

export const nextFragVNode = hV2(Fragment, null);

export const prevSingleEleVNode = hV2(
  'div',
  null,
  hV2('h3', null, '旧单个子元素标签')
);

export const prevNoEleVNode = hV2('div', null);

export const prevMulEleVNode = hV2('div', null, [
  hV2('div', null, [
    hV2('h3', null, 'prev第二级子元素1'),
    hV2('h3', null, 'prev第二级子元素2'),
  ]),
  hV2('h2', null, 'prev第一级子元素'),
]);

export const nextMulEleVNode = hV2('div', null, [
  hV2('div', null, [
    hV2('h3', null, 'next第二级子元素1'),
    hV2('h3', null, 'next第二级子元素2'),
  ]),
  hV2('h2', null, 'next第一级子元素'),
]);

export const nextSingleEleVNode = hV2(
  'div',
  null,
  hV2('h3', null, '新的单子元素标签')
);

export const nextNoEleVNode = hV2('div', null);
