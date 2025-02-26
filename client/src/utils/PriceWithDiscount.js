export const pricewithDiscount = (price, dis = 1) => {
  //   console.log("_____________", price, dis);
  const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100);
  //   console.log("+_______", discountAmout);
  const actualPrice = Number(price) - Number(discountAmout);
  console.log("actual_______", price, dis, actualPrice);
  return actualPrice;
};
