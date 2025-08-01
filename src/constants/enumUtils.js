// utils/enumUtils.js 로 나중에 이동

/**
 * value → label 변환 (예: 'SHORT' → '단기')
 * @param {Array<{label: string, value: string}>} enumList
 * @param {string} value
 * @returns {string}
 */
export function getEnumLabel(enumList, value) {
  const found = enumList.find((item) => item.value === value);
  return found ? found.label : value;
}

/**
 * label → value 변환 (예: '단기' → 'SHORT')
 * @param {Array<{label: string, value: string}>} enumList
 * @param {string} label
 * @returns {string}
 */
export function getEnumValue(enumList, label) {
  const found = enumList.find((item) => item.label === label);
  return found ? found.value : label;
}
