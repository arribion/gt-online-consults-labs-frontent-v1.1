import { createContext, useState, useContext, type SetStateAction, type ReactNode } from "react";

// 1. Create the Context
const CurrencyContext = createContext<{
    currency: string; changeCurrency: (newCurrency: string) => void
} | undefined>(undefined);

// 2. Create the Provider Component
export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState("KES");
  const changeCurrency = (newCurrency: SetStateAction<string>) => {
    setCurrency(newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// 3. Create a Custom Hook for easy consumption
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
