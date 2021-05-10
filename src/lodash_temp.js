import { template } from '../node_modules/lodash-es/lodash.js';
import { comp } from './snab_dom.js';

console.log(comp);

const compiler = template('<h1><%= title %></h1>');
const html = compiler({ title: 'My Component' });

console.log(html);

document.getElementById('app').innerHTML = html;
