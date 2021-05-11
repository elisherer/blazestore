const crypto = window.crypto || window.msCrypto;

let rnds = new Uint8Array(16);
const get16Bytes = () => {
  crypto.getRandomValues(rnds);
  return rnds;
};

const b2h = [];
for (let i = 0; i < 256; ++i) {
  b2h[i] = (i + 0x100).toString(16).substr(1);
}

export const randomHex = size => {
  const array = new Uint8Array(size / 2);
  crypto.getRandomValues(array);
  return [...array].map(c => b2h[c]).join("");
};

export default () => {
  let i = 0;
  const buf = get16Bytes();
  buf[6] = (buf[6] & 0x0f) | 0x40;
  buf[8] = (buf[8] & 0x3f) | 0x80;
  return [
    b2h[buf[i++]],
    b2h[buf[i++]],
    b2h[buf[i++]],
    b2h[buf[i++]],
    "-",
    b2h[buf[i++]],
    b2h[buf[i++]],
    "-",
    b2h[buf[i++]],
    b2h[buf[i++]],
    "-",
    b2h[buf[i++]],
    b2h[buf[i++]],
    "-",
    b2h[buf[i++]],
    b2h[buf[i++]],
    b2h[buf[i++]],
    b2h[buf[i++]],
    b2h[buf[i++]],
    b2h[buf[i]]
  ].join("");
};
