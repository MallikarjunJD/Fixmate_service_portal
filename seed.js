// seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const Service = require("./models/Service");

async function seedServices() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/fixmate");
        console.log("MongoDB Connected");

        await Service.deleteMany();
        console.log("Old services removed");

        const services = [
            {
                id: "electrician",
                name: "Electrician",
                description: "Professional electrical repair, wiring, socket installation, and household electrical fixes.",
                images: ["electrician1.jpg", "electrician2.jpg", "electrician3.jpg"],
                pricing: { mostUrgent: 500, urgent: 400, lessUrgent: 300, notUrgent: 200 },
                feedbacks: []
            },
            {
                id: "plumber",
                name: "Plumbing",
                description: "Leak fixing, tap repair, pipe fitting, bathroom installation, and drainage repair.",
                images: ["plumber1.jpg", "plumber2.jpg"],
                pricing: { mostUrgent: 450, urgent: 350, lessUrgent: 250, notUrgent: 150 },
                feedbacks: []
            },
            {
                id: "carpentry",
                name: "Carpentry",
                description: "Furniture repair, door fixing, wooden installations, and modular fittings.",
                images: ["carpentery1.jpg", "carpentery2.jpg"],
                pricing: { mostUrgent: 600, urgent: 500, lessUrgent: 350, notUrgent: 250 },
                feedbacks: []
            },
            {
                id: "wall-painting",
                name: "Wall Painting",
                description: "Interior & exterior wall painting with professional finish and high-quality paint.",
                images: ["painting1.jpg", "painting2.jpg"],
                pricing: { mostUrgent: 1200, urgent: 1000, lessUrgent: 800, notUrgent: 600 },
                feedbacks: []
            },
            {
                id: "cleaning",
                name: "Cleaning",
                description: "House cleaning, bathroom cleaning, kitchen cleaning, and basic sanitization.",
                images: ["cleaning1.jpg", "cleaning2.jpg"],
                pricing: { mostUrgent: 700, urgent: 600, lessUrgent: 400, notUrgent: 300 },
                feedbacks: []
            },
            {
                id: "deep-cleaning",
                name: "Deep Cleaning",
                description: "Full home deep cleaning including floors, walls, kitchen, and all surfaces.",
                images: ["deepclean1.jpg", "deepclean2.jpg"],
                pricing: { mostUrgent: 1500, urgent: 1200, lessUrgent: 900, notUrgent: 700 },
                feedbacks: []
            },
            {
                id: "ac-repair",
                name: "AC Repair & Service",
                description: "AC installation, gas filling, cooling issue repair, water leakage repair.",
                images: ["ac1.jpg", "ac2.jpg"],
                pricing: { mostUrgent: 900, urgent: 700, lessUrgent: 500, notUrgent: 350 },
                feedbacks: []
            },
            {
                id: "pest-control",
                name: "Pest Control",
                description: "Cockroach control, termite treatment, mosquito fogging, and rodent control.",
                images: ["pest1.jpg", "pest2.jpg"],
                pricing: { mostUrgent: 1500, urgent: 1200, lessUrgent: 900, notUrgent: 700 },
                feedbacks: []
            },
            {
                id: "appliance-repair",
                name: "Appliance Repair",
                description: "Repair of washing machines, fridges, microwaves, and geysers by certified experts.",
                images: ["appliance1.jpg", "appliance2.jpg"],
                pricing: { mostUrgent: 800, urgent: 600, lessUrgent: 500, notUrgent: 350 },
                feedbacks: []
            },
            {
                id: "washing-machine-repair",
                name: "Washing Machine Repair",
                description: "Top load, front load washing machine repair, PCB issues, drum issues.",
                images: ["wm1.jpg", "wm2.jpg"],
                pricing: { mostUrgent: 700, urgent: 600, lessUrgent: 450, notUrgent: 300 },
                feedbacks: []
            },
            {
                id: "fridge-repair",
                name: "Refrigerator Repair",
                description: "Cooling issues, compressor problems, gas charging for all refrigerator models.",
                images: ["fridge1.jpg", "fridge2.jpg"],
                pricing: { mostUrgent: 900, urgent: 750, lessUrgent: 550, notUrgent: 400 },
                feedbacks: []
            },
            {
                id: "geyser-repair",
                name: "Geyser Repair",
                description: "Switch issues, heating problems, installation, and general geyser repair.",
                images: ["geyser1.jpg", "geyser2.jpg"],
                pricing: { mostUrgent: 600, urgent: 500, lessUrgent: 350, notUrgent: 250 },
                feedbacks: []
            },
            {
                id: "cctv-installation",
                name: "CCTV Installation",
                description: "Professional CCTV camera installation, wiring, setup and configuration.",
                images: ["cctv1.jpg", "cctv2.jpg"],
                pricing: { mostUrgent: 2000, urgent: 1500, lessUrgent: 1200, notUrgent: 1000 },
                feedbacks: []
            },
            {
                id: "ro-service",
                name: "RO & Water Purifier Service",
                description: "Filter replacement, RO servicing, water purifier installation & repair.",
                images: ["ro1.jpg", "ro2.jpg"],
                pricing: { mostUrgent: 700, urgent: 600, lessUrgent: 450, notUrgent: 350 },
                feedbacks: []
            },
            {
                id: "sofa-cleaning",
                name: "Sofa & Upholstery Cleaning",
                description: "Deep cleaning for sofas, mattresses, chairs using safe shampooing methods.",
                images: ["sofa1.jpg", "sofa2.jpg"],
                pricing: { mostUrgent: 1000, urgent: 800, lessUrgent: 600, notUrgent: 500 },
                feedbacks: []
            }
        ];

        await Service.insertMany(services);
        console.log("All services inserted successfully!");

        mongoose.connection.close();
        console.log("Database connection closed.");
    } catch (err) {
        console.error(err);
        mongoose.connection.close();
    }
}

seedServices();
