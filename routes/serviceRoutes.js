const express = require("express");
const router = express.Router();

const Service = require("../models/Service");


router.get("/",async (req, res) => {
    try {
        const services = await Service.find({});
        res.render("services", { services });
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Load service page
router.get("/:id", async (req, res) => {
    try {
        const serviceId = req.params.id;

        const service = await Service.findOne({ id: serviceId });

        if (!service) {
            return res.status(404).send("Service not found");
        }

        res.render("service", { service });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
});


module.exports = router;
