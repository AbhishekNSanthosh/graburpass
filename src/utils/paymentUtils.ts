export interface PaymentBreakdown {
  baseAmount: number;
  platformFee: number;
  gatewayFee: number;
  totalAmount: number;
}

/**
 * Calculates payment breakdown based on the formula:
 * Total = (Base * (1 + PlatformRate)) / (1 - GatewayRate)
 * 
 * - Platform fee = 2% of base amount (net)
 * - Cashfree fee = 2% of total (grossed up)
 */
export const calculatePaymentBreakdown = (baseAmount: number): PaymentBreakdown => {
  const PLATFORM_RATE = 0.02; // 2%
  const GATEWAY_RATE = 0.02;  // 2%

  if (baseAmount === 0) {
    return {
      baseAmount: 0,
      platformFee: 0,
      gatewayFee: 0,
      totalAmount: 0
    };
  }

  // Formula: total = (baseAmount * (1 + platformRate)) / (1 - gatewayRate)
  const exactTotal = (baseAmount * (1 + PLATFORM_RATE)) / (1 - GATEWAY_RATE);
  
  // Round to 2 decimals
  const totalAmount = Math.round(exactTotal * 100) / 100;

  // Calculate individual components for display
  const platformFee = Math.round((baseAmount * PLATFORM_RATE) * 100) / 100;
  
  // Gateway fee is the remainder to match the total, or calculated directly from total?
  // User said "Cashfree fee = 2% of total".
  // Let's calculate it directly and see if it sums up.
  // Ideally, Total = Base + Platform + Gateway.
  // If we calculate Gateway as 2% of Total, there might be rounding errors.
  // Let's derive GatewayFee as Total - Base - PlatformFee to ensure the sum is exact.
  const gatewayFee = Math.round((totalAmount - baseAmount - platformFee) * 100) / 100;

  return {
    baseAmount,
    platformFee,
    gatewayFee,
    totalAmount
  };
};
