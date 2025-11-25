// controllers/workerController.js
const Request = require("../models/Request");
const Worker = require("../models/Worker");

// =====================
// 1. GET AVAILABLE REQUESTS
// =====================
exports.getAvailableRequests = async (req, res) => {
    try {
        const workerId = req.session.worker?._id;

        const requests = await Request.find({
            status: "Pending"
        }).sort({ createdAt: -1 });

        res.json({ success: true, requests });
    } catch (err) {
        console.error("Error loading worker requests:", err);
        res.json({ success: false, message: "Server error" });
    }
};

// =====================
// 2. GET ACTIVE REQUEST
// =====================
exports.getActiveRequest = async (req, res) => {
    try {
        const workerId = req.session.worker?._id;

        const active = await Request.findOne({
            acceptedBy: workerId,
            status: { $in: ["Accepted", "InProgress"] }
        });

        res.json({ success: true, active });
    } catch (err) {
        console.error("Error fetching active request:", err);
        res.json({ success: false, message: "Server error" });
    }
};


// =====================
// 3. ACCEPT REQUEST
// =====================
exports.acceptRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const workerId = req.session.worker?._id;

        // Check worker not already busy
        const active = await Request.findOne({
            acceptedBy: workerId,
            status: { $in: ["Accepted", "InProgress"] }
        });

        if (active) {
            return res.json({
                success: false,
                message: "You already have an active request"
            });
        }

        // Accept request
        await Request.findByIdAndUpdate(requestId, {
            acceptedBy: workerId,
            status: "Accepted",
            acceptedAt: new Date()
        });

        await Worker.findByIdAndUpdate(workerId, { status: "Busy" });

        res.json({ success: true });
    } catch (err) {
        console.error("Accept error:", err);
        res.json({ success: false, message: "Server error" });
    }
};


// =====================
// 4. COMPLETE REQUEST
// =====================
exports.completeRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const workerId = req.session.worker?._id;

        await Request.findByIdAndUpdate(requestId, {
            status: "Completed",
            completedAt: new Date()
        });

        await Worker.findByIdAndUpdate(workerId, { status: "Available" });

        // Option: delete request after completion
        // await Request.findByIdAndDelete(requestId);

        res.json({ success: true });
    } catch (err) {
        console.error("Complete error:", err);
        res.json({ success: false, message: "Server error" });
    }
};


// =====================
// 5. UPDATE WORKER AVAILABILITY
// =====================
exports.updateAvailability = async (req, res) => {
    try {
        const workerId = req.session.worker?._id;
        const { available } = req.body; // boolean

        await Worker.findByIdAndUpdate(workerId, {
            status: available ? "Available" : "Unavailable"
        });

        res.json({ success: true });
    } catch (err) {
        console.error("Status update error:", err);
        res.json({ success: false });
    }
};
