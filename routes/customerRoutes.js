const express = require("express");
const bcrypt = require("bcrypt");
const Customer = require("../models/Customer");
const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
    const { name, email, phone, password,} = req.body;
    const confirmPassword = req.body.confpass;
    const address = req.body.address;
    
    

    // Check password match (optional but recommended)
    if (password !== confirmPassword) {
    return res.redirect("/signup?q=password_mismatch");
}

    // Check if email already exists
    const exists = await Customer.findOne({ email });
    if (exists) {
        // Redirect to login instead of auto-login
        res.redirect("/login?signup=exists");
        return res.redirect("/login");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new customer
    await Customer.create({
        name,
        email,
        phone,
        password: hashedPassword,
        address
    });


    // DO NOT auto-login anymore
    // No req.session.user = user

    // Redirect to login page
   res.redirect("/login?signup=success");
});


module.exports = router;


// LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await Customer.findOne({ email });

    if (!user) return res.redirect("/signup");

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) return res.send("Incorrect password!");

    req.session.user = user;   // LOGIN SUCCESSFUL

    res.redirect("/");         // Go to homepage
});
module.exports = router;

// LOGOUT
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});
