import { Base91 } from '@tinyanvil/base91';
import type { BrotliWasmType } from 'brotli-wasm';

const base91 = new Base91();

let brotli: BrotliWasmType | undefined;

async function getBrotli() {
  if (brotli) {
    return brotli;
  }
  if (typeof window !== 'undefined') {
    const brotliPromise = (await import('brotli-wasm')).default;
    brotli = await brotliPromise;
    return brotli;
  }
  
  throw new Error("Brotli-wasm can only be used in the browser.");
}


export async function compressCode(code: string): Promise<string> {
  const brotli = await getBrotli();
  const textEncoder = new TextEncoder();
  const data = textEncoder.encode(code);
  const compressed = brotli.compress(data);
  const encoded = base91.encode(compressed, "bytes");
  return encodeURIComponent(encoded);
}

export async function decompressCode(encoded: string): Promise<string> {
  const brotli = await getBrotli();
  let decodedData;
  try {
    decodedData = base91.decode(decodeURIComponent(encoded), "bytes");
  } catch (error) {
    console.error("Base91 decoding failed:", error);
    throw new Error("Base91 decoding failed");
  }

  let decompressed;
  try {
    decompressed = brotli.decompress(decodedData);
  } catch (error) {
    console.error("Brotli decompression failed:", error);
    throw new Error("Brotli decompression failed");
  }

  const textDecoder = new TextDecoder();
  return textDecoder.decode(decompressed);
}