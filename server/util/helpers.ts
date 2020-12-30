
export const randomElementFromArray = <T extends any>(arr: Array<T>): T => {
  return arr[Math.floor(Math.random() * arr.length)];
}