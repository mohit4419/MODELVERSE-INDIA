import React, { useState } from 'react';
type PaymentStep = 'details' | 'initializing' | 'upi_qr' | 'processing' | 'success';
function Test() {
  const [paymentStep, setPaymentStep]: [PaymentStep, React.Dispatch<React.SetStateAction<PaymentStep>>] = useState('details' as PaymentStep);
  return <button disabled={paymentStep === 'initializing' || paymentStep === 'processing'}>OK</button>;
}
