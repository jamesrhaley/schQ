export default function validate(base, check={}) {

  const baseKeys = Object.keys(base);
  const checkKeys = Object.keys(check);

  for (let i = 0; i < checkKeys.length; i++) {
    let key = checkKeys[i];

    if (baseKeys.indexOf(key) < 0) {
      let nameError = [
        'Config must only contain one or more of the following:',
        baseKeys.toString()
      ].join(' ');

      throw new Error(nameError);

    } 

    else {
      let baseType = typeof base[key];
      let checkType = typeof check[key];

      if (baseType !== checkType) {
        let typeError = [
          'Type of',
          key,
          'must be',
          baseType
        ].join(' ');

        throw new Error(typeError);
      }
    }
  }

  return Object.assign({}, base, check);
}