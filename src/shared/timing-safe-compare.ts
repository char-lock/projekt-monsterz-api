import crypto from "crypto";
import { Buffer } from "safe-buffer";

function timingSafeEqualSameLength(a: Buffer, b: Buffer) {
  let c = 0;
  for (let i = 0; i < a.length; i++) {
    c |= a.readUInt8(i) ^ b.readUInt8(i);
  }
  return (c == 0);
}

/**
 * Returns whether or not two strings are equal in a way as to prevent
 * a timing-based attack.
 * 
 * @param hidden (string) value to remain secret
 * 
 * @param other (string) value known to user
 * 
 * @returns (boolean) whether the two values are equal
 */
function timingSafeStringEqual(hidden: string, other: string) {
  let equal = 1;
  if (hidden.length !== other.length) {
    other = hidden;
    equal = 0;
  }
  const hiddenBuffer = Buffer.from(hidden);
  const otherBuffer = Buffer.from(other);
  equal &= timingSafeEqualSameLength(hiddenBuffer, otherBuffer) ? 1 : 0;
  return equal == 1;
}

export { timingSafeStringEqual };
