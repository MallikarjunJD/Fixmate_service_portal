const express = require("express");
const router = express.Router();

const Worker = require("../models/Worker");
const Request = require("../models/Request");
const bcrypt = require("bcrypt");

// ----------------------------
// Worker Login (POST)
// ----------------------------

const workerController = require("../controllers/workerController");

// All worker APIs
router.get("/requests", workerController.getAvailableRequests);
router.get("/active", workerController.getActiveRequest);

router.post("/accept/:id", workerController.acceptRequest);
router.post("/complete/:id", workerController.completeRequest);

router.post("/status", workerController.updateAvailability);





router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    // Validate
    if (!email || !password) {
        return res.redirect("/login?error=missing_fields");
    }
    // Find admin
    const foundWorker = await Worker.findOne({ email });
    if (!foundWorker) {
        return res.redirect("/login?error=admin_not_found");
    }
    // Compare password
    const match = await bcrypt.compare(password, foundWorker.password);
    if (!match) {
        return res.redirect("/login?error=wrong_password");
    }
    // Save to session
    req.session.worker = {
        id: foundWorker._id,
        email: foundWorker.email,
        name: foundWorker.name,
        primarySkill: foundWorker.primarySkill,
        secondarySkills: foundWorker.secondarySkills,
        area: foundWorker.area,
        status: foundWorker.status,
        activeRequest: foundWorker.activeRequest,
    };
     const requests = await Request.find({ status: "Pending" });  
    const activeRequest = await Request.findOne({ acceptedBy: foundWorker._id, status: "Accepted" });

    res.render("worker", {
        worker: foundWorker,
        request : Request,
        requests: requests,
        activeRequest:activeRequest
    });
});


function isWorker(req, res, next) {
    if (req.session.worker) {
        return next();
    }
    res.redirect("/login");
}



// Logout
router.get("/logout", (req, res) => {
    req.session.worker = null;
    res.redirect("/login");
});



router.get('/dashboard', async (req, res) => {
  if (!req.session.worker) return res.redirect('/login');

  const workerId = req.session.worker.id;
  const worker = await Worker.findById(workerId).lean();

  // active request for this worker (if any)
  const activeRequest = worker.activeRequest ? await Request.findById(worker.activeRequest).lean() : null;

  // available requests matching worker skill(s) and pending
  const availableRequests = await Request.find({
    status: 'Pending',
    serviceName: { $in: [worker.primarySkill, ...(worker.secondarySkills || [])] }
  }).lean();

  res.render('worker', { worker, activeRequest, availableRequests });
});



// Worker accepts a request
router.post('/accept/:id', async (req, res) => {
  try {
    const workerId = req.session.worker.id;
    const reqId = req.params.id;

    const request = await Request.findById(reqId);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'Pending') return res.status(400).json({ error: 'Request not available' });

    // set timings
    const SLA_MAP = {
      'Most Urgent': 2*60*1000,
      'Urgent'     : 5*60*1000,
      'Less Urgent': 10*60*1000,
      'Not Urgent' : 15*60*1000
    };

    const startedAt = new Date();
    const deadline = new Date(startedAt.getTime() + (SLA_MAP[request.priority] || 15*60*1000));

    request.status = 'Accepted';
    request.acceptedBy = workerId;
    request.startedAt = startedAt;
    request.deadline = deadline;
    await request.save();

    // update worker
    const worker = await Worker.findById(workerId);
    worker.status = 'Busy';
    worker.activeRequest = reqId;
    await worker.save();

    // update session
    req.session.worker.status = 'Busy';
    req.session.worker.activeRequest = reqId;

    res.json({ success: true, startedAt, deadline });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// Worker available requests
router.get("/:skill", async (req, res) => {
    const data = await Request.find({
        serviceName: req.params.skill,
        status: "Pending"
    });

    res.json(data);
});


//
router.post('/complete/:id', async (req, res) => {
  try {
    const reqId = req.params.id;
    const request = await Request.findById(reqId);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = 'Completed';
    request.completedAt = new Date();

    // SLA check: if completed after deadline => mark SLA Breached
    if (request.deadline && request.completedAt > request.deadline) {
      request.status = 'SLA Breached';
    }
    await request.save();

    // free the worker
    if (request.acceptedBy) {
      const worker = await Worker.findById(request.acceptedBy);
      if (worker) {
        worker.status = 'Available';
        worker.activeRequest = null;
        await worker.save();
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});


 
module.exports = router;
