import {  Plus, MoreHorizontal } from "lucide-react";
import { Button } from "../../ui/button";
const cardLogos: Record<string, string> = {
  visa: "VISA",
  mastercard: "MC",
  bank: "BANK",
  mpesa: "M-PESA",
  card: "CARD",
  "pay bill": "PAYBILL",
};

interface PaymentMethod {
  id: string;
  type: "mpesa" | "pay bill" | "bank" | "card";
  last4: string;
  name: string;
  expiry?: string;
  isDefault: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "1",
    type: "mpesa",
    last4: "4242",
    name: "mpesa no. 4242",
    expiry: "N/A",
    isDefault: true,
  },
  {
    id: "2",
    type: "pay bill",
    last4: "8888",
    name: "Pay bill 8888",
    expiry: "03/27",
    isDefault: false,
  },
  {
    id: "3",
    type: "bank",
    last4: "6789",
    name: "Chase Checking ••6789",
    isDefault: false,
  },
];

export default function PaymentMethods() {
  return (
    <>
      <div className="rounded-[10px] border border-border bg-card shadow-card mt-5">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="font-semibold text-card-foreground">
            Payment Methods
          </h3>
          <Button variant="outline" size="sm" className="rounded-xl text-slate-700 gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>

        <div className="divide-y divide-border">
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className="flex items-center gap-4 px-6 py-4 hover:bg-accent/50 transition-colors">
              <div
                className={`flex h-10 w-14 shrink-0 items-center justify-center rounded-lg text-xs font-bold tracking-wider ${
                  pm.type === "mpesa"
                    ? "bg-primary/10 text-primary"
                    : pm.type === "pay bill"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-success/10 text-success"
                }`}>
                {cardLogos[pm.type]}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-card-foreground">
                    {pm.name}
                  </p>
                  {pm.isDefault && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      Default
                    </span>
                  )}
                </div>
                {pm.expiry && (
                  <p className="text-xs text-muted-foreground">
                    Expires {pm.expiry}
                  </p>
                )}
              </div>

              <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
