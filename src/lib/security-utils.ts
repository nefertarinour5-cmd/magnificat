// Client-safe version of password strength (no Node crypto)
export function passwordStrength(pwd: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const map = [
    { label: "Très faible", color: "#b91c1c" },
    { label: "Faible", color: "#d97706" },
    { label: "Moyen", color: "#b45309" },
    { label: "Bon", color: "#15803d" },
    { label: "Fort", color: "#15803d" },
    { label: "Excellent", color: "#15803d" },
  ];

  return { score, ...map[score] };
}
