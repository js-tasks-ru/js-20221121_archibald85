/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
  const uniqArr = [];
  if (arr && arr.length) {
    arr.forEach( el => {
      if ( !uniqArr.includes(el) ) {
        uniqArr.push(el);
      }
    })
  }
  return uniqArr;
}
