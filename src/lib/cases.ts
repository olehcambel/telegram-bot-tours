export const camelToSnake = (s: string): string => {
  return s
    .replace(/([A-Z])/g, (_x, y) => {
      return `_${y.toLowerCase()}`;
    })
    .replace(/^_/, '');
};

export const snakeToCamel = (s: string): string => {
  return s.replace(/(_\w)/gi, str => {
    return str.toUpperCase().replace('_', '');
  });
};
