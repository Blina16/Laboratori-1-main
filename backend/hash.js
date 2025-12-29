const bcrypt = require("bcrypt");

const password = "mySecret123";
const saltRounds = 10;

bcrypt.hash(password, saltRounds).then(hash => {
  console.log(hash);
});
