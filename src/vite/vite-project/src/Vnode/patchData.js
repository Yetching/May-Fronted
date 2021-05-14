export function patchData(el, key, prevValue, nextValue) {
  switch (key) {
    case 'style':
      for (let k in nextValue) {
        el.style[k] = nextValue[k];
      }
      for (let k in prevValue) {
        if (!nextValue.hasOwnProperty(k)) {
          el.style[k] = '';
        }
      }
      break;
    case 'class':
      el.className = nextValue;
      break;
    default:
      if (key[0] === 'o' && key[1] === 'n') {
        if (prevValue) {
          el.removeEventListener(key.slice(2), prevValue);
        }
        if (nextValue) {
          el.addEventListener(key.slice(2), nextValue);
        }
      } else if (domPropsRE.test(key)) {
        el[key] = nextValue;
      } else {
        el.setAttribute(key, nextValue);
      }
      break;
  }
}

const domPropsRE = /\[A-Z]|^(?:value|checked|selected|muted)$/;
