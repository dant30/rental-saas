import { useEffect, useState } from "react";

import { paymentApi } from "../services/paymentApi";
import { paymentsInitialState, PaymentsState } from "../store/paymentsSlice";

export const usePayments = () => {
  const [state, setState] = useState<PaymentsState>(paymentsInitialState);

  useEffect(() => {
    Promise.all([paymentApi.listPayments(), paymentApi.listArrears()])
      .then(([payments, arrears]) => setState({ payments, arrears }))
      .catch(() => setState(paymentsInitialState));
  }, []);

  return state;
};
