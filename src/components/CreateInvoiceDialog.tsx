import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState, useEffect } from "react";
import { Send, CheckCircle2, Shield, Globe, CreditCard, ArrowRight, Loader2 } from "lucide-react";

interface SendMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "form" | "review" | "processing" | "success";

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
  { code: "KES", symbol: "KES", name: "Euro", rate: 0.92 },
];

const processingSteps = [
  { label: "Encrypting payment data", icon: Shield, detail: "TLS 256-bit encryption" },
  { label: "Payment Gateway verification", icon: Globe, detail: "Validating transaction" },
  { label: "Processing with bank network", icon: CreditCard, detail: "Authorizing funds" },
  { label: "Completing transfer", icon: ArrowRight, detail: "Settling payment" },
];

export function SendMoneyDialog({ open, onOpenChange }: SendMoneyDialogProps) {
  const [step, setStep] = useState<Step>("form");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [processingIndex, setProcessingIndex] = useState(0);

  useEffect(() => {
    if (step !== "processing") return;
    setProcessingIndex(0);
    const interval = setInterval(() => {
      setProcessingIndex((prev) => {
        if (prev >= processingSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => setStep("success"), 600);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [step]);

  const handleClose = () => {
    setStep("form");
    setRecipient("");
    setAmount("");
    setNote("");
    setCurrency("USD");
    setProcessingIndex(0);
    onOpenChange(false);
  };

  const selectedCurrency = currencies.find((c) => c.code === currency)!;
  const convertedAmount = amount ? (parseFloat(amount) * selectedCurrency.rate).toFixed(2) : "0.00";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
        {step === "form" && (
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                  <Send className="h-4 w-4 text-primary-foreground" />
                </div>
                Create Invoice
              </DialogTitle>
            </DialogHeader>

            <div>
              <Label htmlFor="recipient">Available Projects</Label>
              <br />
              <select name="" id="" className="border rounded w-full ">
                <option value="" disabled>
                  Select Project Assigned
                </option>
                <option value="">Project Vox</option>
              </select>
            </div>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Input
                  id="recipient"
                  placeholder="Email, phone, or @username"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="rounded-[10px] h-11 my-3"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                      {selectedCurrency.symbol}
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="rounded-[10px] h-11 pl-7 text-lg font-semibold  my-3"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="flex  my-3 h-11 w-full rounded-[10px] border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring">
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {currency !== "USD" && amount && (
                <div className="rounded-xl bg-accent/50 px-4 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" />
                  {selectedCurrency.symbol}
                  {convertedAmount} {currency} ≈ ${amount} USD
                  <span className="text-xs opacity-70">
                    • Rate: 1 USD = {selectedCurrency.rate} {currency}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="note">Note (optional)</Label>
                <Input
                  id="note"
                  placeholder="What's this for?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="rounded-[10px] h-11  my-3"
                />
              </div>

              <Button
                // variant="hero"
                className="w-full"
                disabled={!recipient || !amount}
                onClick={() => setStep("review")}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl">Review Payment</DialogTitle>
            </DialogHeader>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-border bg-accent/30 p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-medium text-foreground">
                    {recipient}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-foreground text-lg">
                    {selectedCurrency.symbol}
                    {currency !== "USD" ? convertedAmount : amount} {currency}
                  </span>
                </div>
                {currency !== "USD" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Equivalent</span>
                    <span className="text-muted-foreground">${amount} USD</span>
                  </div>
                )}
                {note && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Note</span>
                    <span className="text-foreground">{note}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t border-border pt-3">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="text-success font-medium">Free</span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
                <Shield className="h-4 w-4 shrink-0" />
                Protected by bank-grade encryption & buyer protection
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 rounded-xl"
                  onClick={() => setStep("form")}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep("processing")}>
                  Confirm & Send
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="p-8">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Processing Payment
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Please wait while we securely process your transaction
              </p>
            </div>

            <div className="space-y-3">
              {processingSteps.map((ps, i) => {
                const isActive = i === processingIndex;
                const isDone = i < processingIndex;
                // const isPending = i > processingIndex;

                return (
                  <div
                    key={ps.label}
                    className={`flex items-center gap-3 rounded-xl p-3 transition-all duration-500 ${
                      isActive
                        ? "bg-primary/10 border border-primary/20"
                        : isDone
                          ? "bg-success/5"
                          : "opacity-40"
                    }`}>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
                        isDone
                          ? "bg-success/20"
                          : isActive
                            ? "gradient-primary"
                            : "bg-muted"
                      }`}>
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : isActive ? (
                        <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                      ) : (
                        <ps.icon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium ${isDone ? "text-success" : isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {ps.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ps.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-4 animate-in zoom-in duration-300">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Payment Sent!
              </h3>
              <p className="mt-2 text-muted-foreground">
                {selectedCurrency.symbol}
                {currency !== "USD" ? convertedAmount : amount} {currency} sent
                to {recipient}
              </p>

              <div className="mt-5 w-full rounded-xl bg-accent/30 p-4 text-xs text-muted-foreground space-y-1.5">
                <div className="flex justify-between">
                  <span>Transaction ID</span>
                  <span className="font-mono">
                    TXN-{Date.now().toString(36).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="text-success font-medium">Completed</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing time</span>
                  <span>~4.8 seconds</span>
                </div>
              </div>

              <Button
                className="mt-6 w-full"
                onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
