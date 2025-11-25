const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Service = require("./models/Service"); 
const session = require("express-session");
const Request = require("./models/Request");
const Worker = require("./models/Worker");
const Customer = require("./models/Customer");


// Set view engine
app.set("view engine", "ejs");

// express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Static files middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));


// Session middleware
app.use(
    session({
        secret: "fixmate-secret",
        resave: false,
        saveUninitialized: false,
    })
);


//admin availability in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.admin = req.session.admin || null;
  next();
});


//Register routes
app.use("/customer", require("./routes/customerRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/services",require("./routes/serviceRoutes"));
app.use("/worker", require("./routes/workerRoutes"));
const requestRoutes = require("./routes/requestRoutes");
app.use("/request", requestRoutes);




// Homepage route
app.get("/", (req, res) => {
    res.render("home");
});



// Login route
app.get("/login", (req, res) => {
    res.render("login");
});




// Signup route
app.get("/signup", (req, res) => {
    res.render("signup");
});


// Service detail route
app.get("/service/:id", (req, res) => {
  const serviceId = req.params.id;
  res.render("service", { services: data.services, serviceId });
});




//-----------------
//Middlewares
//----------------




// Middleware to check if admin is logged in
function isAdmin(req, res, next) {
  if (req.session.admin) {
        return next();
  }
  return res.redirect("/admin/login");
}

// app.js (or server.js)
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;      // for customer UI
  res.locals.admin = req.session.admin || null;    // for admin UI if you want
  next();
});




// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect("/login");
}

// Middleware to check if worker is logged in
function isWorker(req, res, next) {
    if (req.session.worker) {
        return next();
    }
    res.redirect("/login");
}





// Admin Dashboard route


// Booking route   
app.get("/book/:id", isLoggedIn, async (req, res) => {
    const service = await Service.findOne({ id: req.params.id });
    if (!service) return res.status(404).send("Service not found");

    res.render("request", { service });
});




//Db+server start
mongoose
  .connect("mongodb://127.0.0.1:27017/fixmate")
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });



const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});