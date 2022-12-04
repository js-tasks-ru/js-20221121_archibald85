/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const isObject = obj => {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj)
  }

  return (obj) => {
    let currObj = { ...obj };
    const propsArr = path.split('.');
    let currProp = 0;
    while (Object.hasOwn(currObj, propsArr[currProp]) && isObject(currObj[propsArr[currProp]])) {
      currObj = currObj[propsArr[currProp]];
      currProp++;
    }
    return currObj[propsArr[currProp]];
  }
}
