/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (!string.length || size === 0) {
    return '';
  }
  if (!size) {
    return string;
  }
  const arrStr = string.split('');
  let resultArr = [];
  let currentArr = [arrStr[0]];

  for (let i = 1; i <= arrStr.length; i++) {
    if (currentArr[0] === arrStr[i]) {
      if (currentArr.length < size) {
        currentArr.push(arrStr[i]);
      }
    } else {
      resultArr = [...resultArr, ...currentArr];
      currentArr = [];
      currentArr.push(arrStr[i]);
    }
  }
  return resultArr.join('');
}
