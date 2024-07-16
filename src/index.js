import nacl from 'tweetnacl';
import { decodeUTF8 } from 'tweetnacl-util';
import { decode } from 'base58-universal';

/* prettier-ignore */ // Convert a Uint8Array to a hex string
const hexEncode = (uint8) => Array.from(uint8) .map((i) => i.toString(16).padStart(2, '0')) .join('');

// Convert a hex string to a Uint8Array
const hexDecode = (hex) => new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

async function signMessage(msg) {
  if (!window?.phantom?.solana) {
    return [null, new Error('Phantom not installed')];
  }

  if (!msg) {
    return [null, new Error('Message cannot be empty')];
  }

  const provider = window.phantom.solana;

  try {
    await provider.connect();
    const encMessage = new TextEncoder().encode(msg);
    const signedMessage = await provider.signMessage(encMessage, 'utf8');

    return [[hexEncode(signedMessage.signature), signedMessage.publicKey], null];
  } catch (e) {
    return [null, e];
  }
}

function verifyMessage(msg, hexSig, pub) {
  if (!(msg && hexSig && pub)) return [null, new Error('Message, signature, and address cannot be empty')];

  const messageBytes = decodeUTF8(msg);
  const sig = hexDecode(hexSig);

  const verified = nacl.sign.detached.verify(
    messageBytes,
    sig,
    decode(pub) // decode base58 public key
  );

  return [verified, null];
}

window.signMessage = signMessage;
window.verifyMessage = verifyMessage;
