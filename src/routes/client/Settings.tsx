
import AccountDelection from "../../components/client/bio/AccountDelection";
import PasswordUpdate from "../../components/client/bio/PasswordUpdate";
import { SettingsOverview } from "../../components/client/bio/SettingsOverview";
import PaymentMethods from "../../components/client/payments/PaymentMethods";

function Settings() {
  return (
    
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your currencies, payment methods, and security
            </p>
          </div>
          <div className="space-y-6">
            <PaymentMethods />
            <SettingsOverview />
            <PasswordUpdate />
            <AccountDelection/>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;