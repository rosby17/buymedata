import { paymentStatus } from "@/lib/payment-status";
export default function SupportAmount({ amount, status }: { amount: number | string; status: string }) {
  const state = paymentStatus(status);
  return <div className="shrink-0 text-right" style={{ color: state.color }}>
    <p className="whitespace-nowrap text-sm font-bold">{state.credited ? "+" : ""}{Number(amount).toLocaleString("fr-FR")} FCFA</p>
    <p className="mt-1 text-xs font-semibold">{state.label}</p>
    {!state.credited && <p className="mt-1 text-[10px]">Non comptabilisé dans vos revenus</p>}
  </div>;
}
