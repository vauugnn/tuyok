function calculateFare(vehicleType, distance, isDiscount) {
    let baseFare = 13;
    const vanFare = 15;
    const kmFare = 1.8;
  
    if (vehicleType === 'jeep') {
      baseFare = baseFare;
    } else if (vehicleType === 'van') {
      baseFare = vanFare;
    } else {
      console.log('Invalid input');
      return 0;
    }
  
    if (distance <= 4) {
      return baseFare;
    } else {
      let fare = baseFare + (distance - 4) * kmFare;
  
      if (isDiscount) {
        const discountAmount = fare * 0.2;
        fare -= discountAmount;
      }
  
      return fare;
    }
  }
  
  module.exports = calculateFare;