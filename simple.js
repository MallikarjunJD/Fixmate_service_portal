const bcrypt = require("bcrypt");

(async () => {
    const password = "Worker@12345"; // change it
    const hashed = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashed);

    const result=await bcrypt.compare("Worker@12345",hashed);
    console.log("Match test: ",result);
})();
