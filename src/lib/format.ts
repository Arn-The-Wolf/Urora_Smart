export function formatLiters(value: number, withUnit = true) {
  const rounded = Math.round(value * 10) / 10;
  const formatted = rounded.toLocaleString("en-GB", {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  });
  return withUnit ? `${formatted} L` : formatted;
}

export function cowLabel(cow: { tagNumber: string; name: string | null }) {
  return cow.name ? `${cow.name} · ${cow.tagNumber}` : cow.tagNumber;
}

export function ageLabel(birthDate: string | null) {
  if (!birthDate) return null;
  const [year, month, day] = birthDate.split("-").map(Number);
  const birth = new Date(year, month - 1, day);
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) return null;
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest ? `${years}y ${rest}m` : `${years} yr`;
}

export function statusLabel(status: "active" | "sold" | "dead") {
  if (status === "active") return "Active";
  if (status === "sold") return "Sold";
  return "Dead";
}
