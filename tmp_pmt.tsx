import React, { useState } from 'react';

type PaymentStep = 'details' | 'initializing' | 'upi_qr' | 'processing' | 'success';

type PaymentGateway = 'UPI' | 'Razorpay' | 'Cashfree' | 'ReservePay';

function Test() {
  const initialPaymentStep: PaymentStep = 'details';
  const [paymentStep, setPaymentStep] = useState<PaymentStep>(initialPaymentStep);
  return <button disabled={paymentStep === 'initializing' || paymentStep === 'processing'}>OK</button>;
}
