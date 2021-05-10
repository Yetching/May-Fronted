import { h } from '../node_modules/snabbdom/build/h.js';

const Mycomponent = (props) => {
  return h('h1', props.title);
};

const comp = Mycomponent({ title: 'hello world' });

export { comp };
