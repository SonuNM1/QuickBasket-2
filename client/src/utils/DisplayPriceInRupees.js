export const DisplayPriceInRupees = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0, // Ensures no decimal places
        maximumFractionDigits: 0  // Ensures no decimal places
    }).format(price);
};
