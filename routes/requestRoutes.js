const express = require("express");
const router = express.Router();
const Request = require("../models/Request");

router.post("/create", async (req, res) => {
    try {
        const {
            serviceId,
            serviceName,
            priority,
            price,
            
            customerId,
            customerName,
            customerPhone
        } = req.body;
        const location=req.body.location;

        const request = new Request({
            serviceId,
            serviceName,
            priority,
            price,
            location,
            customerId,
            customerName,
            customerPhone
        });

        await request.save();

        res.redirect("/request/success");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});


router.get("/success", (req, res) => {
    res.send("<h1>Request Created Successfully!</h1>");
});

module.exports = router;
