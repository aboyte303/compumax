// generateHash.js
const bcrypt = require("bcryptjs");

(async () => {
  const password = process.argv[2]; // la contraseña se pasa como argumento en consola
  if (!password) {
    console.error(" Debes pasar una contraseña. Ejemplo: node generateHash.js 1234");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  console.log(` Hash generado para "${password}":\n${hash}`);
})();
