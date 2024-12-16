export function calculateDigitChanges(
  prevAmount: number,
  difference: number
): number[] {
  console.log("calculateDigitChanges", prevAmount, difference);
  // Early return if no change needed
  if (difference <= 0) return [];

  // Convert numbers to strings for easier digit manipulation
  const prevStr = prevAmount.toString();
  const newStr = (prevAmount + difference).toString();

  // Pad shorter number with leading zeros to match lengths
  const maxLength = Math.max(prevStr.length, newStr.length);
  const paddedPrev = prevStr.padStart(maxLength, "0");
  const paddedNew = newStr.padStart(maxLength, "0");

  const result: number[] = [];
  let multiplier = 1;

  // Process each digit position from right to left
  for (let i = maxLength - 1; i >= 0; i--) {
    const prevDigit = parseInt(paddedPrev[i]);
    const newDigit = parseInt(paddedNew[i]);

    // Calculate rotations needed for this position
    let rotations;
    if (newDigit >= prevDigit) {
      rotations = newDigit - prevDigit;
    } else {
      // When we need to go through 9, e.g., 9 -> 0 -> 1
      rotations = 10 - prevDigit + newDigit;
    }

    // Only add non-zero rotations
    if (rotations > 0) {
      result.push(rotations * multiplier);
    }

    multiplier *= 10;
  }

  return result;
}
