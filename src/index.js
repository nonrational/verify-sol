import nacl from "tweetnacl";
import { decodeUTF8 } from "tweetnacl-util";

const uint8ToHex = (uint8) => {
  return Array.from(uint8)
    .map((i) => i.toString(16).padStart(2, '0'))
    .join('');
}

const hexToUint8 = (hex) => {
  return new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}

const MAP = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const encode = function (B) { const A = MAP; var d = [], s = "", i, j, c, n; for (i in B) { j = 0, c = B[i]; s += c || s.length ^ i ? "" : 1; while (j in d || c) { n = d[j]; n = n ? n * 256 + c : c; c = n / 58 | 0; d[j] = n % 58; j++ } } while (j--) s += A[d[j]]; return s };
const decode = function (S) { const A = MAP; var d = [], b = [], i, j, c, n; for (i in S) { j = 0, c = A.indexOf(S[i]); if (c < 0) return undefined; c || b.length ^ i ? i : b.push(0); while (j in d || c) { n = d[j]; n = n ? n * 58 + c : c; c = n >> 8; d[j] = n % 256; j++ } } while (j--) b.push(d[j]); return new Uint8Array(b) };

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
    uint8ToHex(signedMessage.signature),
    signedMessage.publicKey
  ];
}

async function verifyMessage(msg, hexSig, pub) {
  const messageBytes = decodeUTF8(msg);
  const sig = hexToUint8(hexSig);

  const verified = nacl.sign.detached.verify(
    messageBytes,
    sig,
    decode(pub)
  );

  return verified;
}

window.signMessage = signMessage;
window.verifyMessage = verifyMessage;
