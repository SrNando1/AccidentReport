// NÃO use require aqui!
import bcrypt from "bcrypt";

// top-level await funciona em ESM
const hash = await bcrypt.hash("1234", 10);
console.log("Hash gerado:", hash);
