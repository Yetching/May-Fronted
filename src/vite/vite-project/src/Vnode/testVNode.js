import { hV2 } from './h';

export const prevTextVNode = hV2('p', null, '旧文本节点');

export const nextTextVNode = hV2('p', null, '新文本节点');

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
