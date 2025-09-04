// src/lib/validate.js

export function validateParams({ a, c, m, seed, n }) {
  const errors = [];
  const isInt = (v) => Number.isInteger(v);

  if (!isInt(a)) errors.push("a debe ser entero.");
  if (!isInt(c)) errors.push("c debe ser entero (usa 0 si no lo necesitas).");
  if (!isInt(m) || m <= 1) errors.push("m debe ser entero > 1.");
  if (!isInt(seed) || seed < 0) errors.push("seed (x₀) debe ser entero ≥ 0.");
  if (!isInt(n) || n <= 0) errors.push("n debe ser entero > 0.");

  return errors;
}
