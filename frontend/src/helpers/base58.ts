import bs58 from "bs58";

/**
 * Encodes data to base58
 * @param {string|object} data - Data to encode (string or object)
 * @returns {string} Base58 encoded string
 */
export function encodeBase58(data: string | object) {
  try {
    // If data is an object, stringify it first
    const stringData =
      typeof data === "object" ? JSON.stringify(data) : String(data);

    // Convert string to Uint8Array
    const bytes = new TextEncoder().encode(stringData);

    // Encode to base58
    return bs58.encode(bytes);
  } catch (error) {
    throw new Error(`Base58 encoding failed: ${JSON.stringify(error)}`);
  }
}

/**
 * Decodes base58 string
 * @param {string} encodedData - Base58 encoded string
 * @param {boolean} parseJson - Whether to parse result as JSON
 * @returns {string|object} Decoded data
 */
export function decodeBase58(encodedData: string, parseJson = false) {
  try {
    // Decode from base58 to Uint8Array
    const bytes = bs58.decode(encodedData);

    // Convert Uint8Array to string
    const decodedString = new TextDecoder().decode(bytes);

    // If parseJson is true, attempt to parse as JSON
    if (parseJson) {
      try {
        return JSON.parse(decodedString);
      } catch {
        throw new Error("Failed to parse decoded string as JSON");
      }
    }

    return decodedString;
  } catch (error) {
    throw new Error(`Base58 decoding failed: ${JSON.stringify(error)}`);
  }
}
