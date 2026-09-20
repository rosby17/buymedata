export function paymentStatus(status: string) {
  if (status === "completed") return { label: "Réussi", color: "#315c38", credited: true };
  if (status === "failed") return { label: "Échoué", color: "#b20024", credited: false };
  if (status === "refunded") return { label: "Remboursé", color: "#6f5a57", credited: false };
  return { label: "En attente", color: "#886015", credited: false };
}
