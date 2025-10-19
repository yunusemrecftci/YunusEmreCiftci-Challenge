const SUI_DECIMALS = 9n;
const SUI_FACTOR = 1_000_000_000n;

const digitsOnly = /^\d+$/;

export const suiToMist = (value: string): bigint => {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error("SUI amount is required");
  }

  if (normalized.startsWith("-")) {
    throw new Error("Negative SUI amounts are not supported");
  }

  const unsigned = normalized.startsWith("+") ? normalized.slice(1) : normalized;
  const parts = unsigned.split(".");
  if (parts.length > 2) {
    throw new Error("Invalid SUI amount format");
  }

  const [wholeRaw, fractionRaw = ""] = parts;
  const whole = wholeRaw === "" ? "0" : wholeRaw;
  const fraction = fractionRaw;

  if (!digitsOnly.test(whole)) {
    throw new Error("Invalid characters in SUI amount");
  }
  if (fraction && !/^\d+$/.test(fraction)) {
    throw new Error("Invalid characters in SUI decimal part");
  }
  if (fraction.length > Number(SUI_DECIMALS)) {
    throw new Error("SUI amount has more than 9 decimal places");
  }

  const wholePart = BigInt(whole) * SUI_FACTOR;
  const fractionPadded = fraction.padEnd(Number(SUI_DECIMALS), "0");
  const fractionPart = fractionPadded
    ? BigInt(fractionPadded)
    : 0n;

  return wholePart + fractionPart;
};
