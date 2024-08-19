export const random = (min: number, max: number, decimals: number) => {
  return (Math.random() * (max - min) + min).toFixed(decimals);
};

export const random_ = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
