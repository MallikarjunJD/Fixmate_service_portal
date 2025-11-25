const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const { removeListener } = require("../models/Service");
const Worker = require("../models/Worker");
const Customer = require("../models/Customer");
const RequestModel = require("../models/Request");
const Service = require("../models/Service");
const Request = require("../models/Request");
const { render } = require("ejs");
// ----------------------------
// Admin Login (POST)
// ----------------------------


router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    // Validate
    if (!email || !password) {
        return res.redirect("/login?error=missing_fields");
    }
    // Find admin
    const foundAdmin = await Admin.findOne({ email });
    if (!foundAdmin) {
        return res.redirect("/login?error=admin_not_found");
    }
    // Compare password
    const match = await bcrypt.compare(password, foundAdmin.password);
    if (!match) {
        return res.redirect("/login?error=wrong_password");
    }
    // Save to session
    req.session.admin = {
        id: foundAdmin._id,
        email: foundAdmin.email,
        name: foundAdmin.name,
        role: foundAdmin.role
    };
    
      res.redirect("/admin/dashboard");
});

function isAdmin(req, res, next) {
  if (req.session.admin) {
        return next();
  }
  return res.redirect("/admin/login");
}

router.get("/login", isAdmin, async (req, res) => {
   const activeRequest = await Request.find({});
   const slaBreached = await Request.find({ status: "Pending", slaDeadline: { $lt: new Date() } }); 
   const customers = await Customer.find().sort({ createdAt: -1 });
   const customersWithCounts = await Promise.all(customers.map(async c => {
      const total = await RequestModel.countDocuments({ customerId: c._id });
      const completed = await RequestModel.countDocuments({ customerId: c._id, status: "Completed" });
      return { customer: c, total, completed };
    }));
    const workers = await Worker.find({});
    res.render("admin", { admin: req.session.admin ,Worker,
        activeRequests: activeRequest,
        slaBreached: slaBreached,
        workers: workers,
        customersWithCounts:customersWithCounts
            
            }  );
}
);
// Logout
router.get("/logout", (req, res) => {
    req.session.admin = null;
    res.redirect("/login");
});




// Middleware - simple isAdmin (you probably already have similar)
function isAdmin(req, res, next) {
  if (req.session && req.session.admin && req.session.admin.role === "admin") {
    return next();
  }
  return res.redirect("/admin/login");
}

/* ---------- Dashboard (summary) ---------- */
router.get("/dashboard", isAdmin, async (req, res) => {
  try {
    const totalRequests = await RequestModel.countDocuments();
    const activeRequests = await RequestModel.countDocuments({ status: "Pending" });
    const slaBreached = await RequestModel.countDocuments({ status: "Pending", slaDeadline: { $lt: new Date() } });
    const totalWorkers = await Worker.countDocuments();
    const totalCustomers = await Customer.countDocuments();

    // send some lists too for quick display
    const recentRequests = await RequestModel.find().sort({ createdAt: -1 }).limit(6).populate("customerId").populate("acceptedBy");
    res.render("admin", {
      dashboard: { totalRequests, activeRequests, slaBreached, totalWorkers, totalCustomers },
      recentRequests
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* ---------- Requests pages ---------- */
router.get("/requests", isAdmin, async (req, res) => {
  try {
    const activeRequests = await RequestModel.find({ status: "Pending" })
      .sort({ createdAt: -1 })
      .populate("customerId")
      .populate("acceptedBy");

    const slaBreached = await RequestModel.find({ status: "Pending", slaDeadline: { $lt: new Date() } })
      .sort({ slaDeadline: 1 })
      .populate("customerId")
      .populate("acceptedBy");

    // load workers for assignment dropdown
    const workers = await Worker.find({});

    res.render("admin-requests", { activeRequests, slaBreached, workers });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* Assign a worker to a request */
router.post("/requests/assign", isAdmin, async (req, res) => {
  try {
    const { requestId, workerId } = req.body;
    if (!requestId || !workerId) return res.redirect("/admin/requests");

    // update request
    await RequestModel.findByIdAndUpdate(requestId, {
      acceptedBy: workerId,
      status: "Accepted"
    });

    // update worker
    await Worker.findByIdAndUpdate(workerId, { status: "Busy", activeRequest: requestId });

    res.redirect("/admin/requests");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* ---------- Workers CRUD ---------- */
/* List workers */
router.get("/workers", isAdmin, async (req, res) => {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 });
    res.render("admin-workers", { workers });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* Create worker (form should POST to this) */
router.post("/worker/create", isAdmin, async (req, res) => {
  try {
    const { name, phone, email, password, primaryService, secondaryService } = req.body;
    const hashed = await bcrypt.hash(password || "changeme123", 10);
    await Worker.create({
      name, phone, email, password: hashed, primaryService, secondaryService, status: "Available"
    });
    res.redirect("/admin/workers");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* Edit worker */
router.post("/worker/edit/:id", isAdmin, async (req, res) => {
  try {
    const { name, phone, email, primaryService, secondaryService } = req.body;
    await Worker.findByIdAndUpdate(req.params.id, { name, phone, email, primaryService, secondaryService });
    res.redirect("/admin/workers");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* Delete worker */
router.post("/worker/delete/:id", isAdmin, async (req, res) => {
  try {
    await Worker.findByIdAndDelete(req.params.id);
    res.redirect("/admin/workers");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* ---------- Customers (history) ---------- */
router.get("/customers", isAdmin, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    // attach request counts for each customer (simple)
    const customersWithCounts = await Promise.all(customers.map(async c => {
      const total = await RequestModel.countDocuments({ customerId: c._id });
      const completed = await RequestModel.countDocuments({ customerId: c._id, status: "Completed" });
      return { customer: c, total, completed };
    }));
    res.render("admin-customers", { customersWithCounts });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;



module.exports = router;
