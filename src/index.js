import nacl from "tweetnacl";
import { decodeUTF8 } from "tweetnacl-util";

// Convert a Uint8Array to a hex string
const hexEncode = (uint8) => {
  return Array.from(uint8)
    .map((i) => i.toString(16).padStart(2, '0'))
    .join('');
}

// Convert a hex string to a Uint8Array
const hexDecode = (hex) => {
  return new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}

// Base58 character set
const MAP = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Decodes a base58 string to a Uint8Array.
 *
 * @param {string} S - The string to decode.
 * @returns {Uint8Array|undefined} - The decoded Uint8Array, or undefined if decoding fails.
 */
const base58decode = function (S) { const A = MAP; var d = [], b = [], i, j, c, n; for (i in S) { j = 0, c = A.indexOf(S[i]); if (c < 0) return undefined; c || b.length ^ i ? i : b.push(0); while (j in d || c) { n = d[j]; n = n ? n * 58 + c : c; c = n >> 8; d[j] = n % 256; j++ } } while (j--) b.push(d[j]); return new Uint8Array(b) };

/**
 * Encodes a Uint8Array using the base58 encoding scheme.
 *
 * @param {Array} B - The array of bytes to be encoded.
 * @returns {string} - The base58 encoded string.
 */
const base58encode = function (B) { const A = MAP; var d = [], s = "", i, j, c, n; for (i in B) { j = 0, c = B[i]; s += c || s.length ^ i ? "" : 1; while (j in d || c) { n = d[j]; n = n ? n * 256 + c : c; c = n / 58 | 0; d[j] = n % 58; j++ } } while (j--) s += A[d[j]]; return s };

async function signMessage(msg) {
  if (!window?.phantom?.solana) {
    console.error("Phantom not installed");
    return
  }

  const provider = window.phantom.solana;
  const resp = await provider.connect();

  if (!resp) {
    console.error("Connection failed");
    return
  }

  const encMessage = new TextEncoder().encode(msg);
  const signedMessage = await provider.signMessage(encMessage, "utf8");

  return [
    hexEncode(signedMessage.signature),
    signedMessage.publicKey
  ];
}

async function verifyMessage(msg, hexSig, pub) {
  const messageBytes = decodeUTF8(msg);
  const sig = hexDecode(hexSig);

  const verified = nacl.sign.detached.verify(
    messageBytes,
    sig,
    base58decode(pub)
  );

  return verified;
}

window.signMessage = signMessage;
window.verifyMessage = verifyMessage;
