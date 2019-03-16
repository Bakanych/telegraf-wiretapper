import { Lame } from "node-lame";

export interface Encoder {
  encode(pcm: Buffer): Promise<Buffer>;
}

export class LameEncoder implements Encoder {

  async encode(buffer: Buffer) {
    const encoder = new Lame({
      "output": "buffer",
      "bitrate": 64,
      "raw": true,
      "sfreq": 24,
      //"bitwidth": 16,
      //"signed": true,
      "little-endian": true

    }).setBuffer(buffer);

    await encoder.encode();
    return encoder.getBuffer();
  }
}