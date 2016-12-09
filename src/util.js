function objToArray(obj) {
  let keys = Object.keys(obj);
  return keys.map(key => obj[key]);
}

export default objToArray;