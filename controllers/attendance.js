const Attendance = require("../models/attendance");

// Get Start Working Page
exports.getAttendace = (req, res, next) => {
  res.render("attendance", {
    css: "attendance",
    pageTitle: "Điểm danh",
    user: req.user,
    status: req.session.status,
  });
};

// Get Attendance Details Page
exports.getAttendaceDetails = (req, res, next) => {
  req.user.getAttendanceDetails().then((attendance) => {
    res.render("attendance-details", {
      css: "attendance",
      pageTitle: "Chi tiết công việc",
      user: req.user,
      attendance: attendance,
    });
  });
};

// Post Attendance: Start - Stop
exports.postAttendance = (req, res, next) => {
  const type = req.query.type;
  const workplace = req.body.workplace;
  // Change working status user
  req.user
    .getStatus(type, workplace)
    .then((status) => {
      if (type === "start") {
        res.redirect("/");
      }
      res.redirect("/attendance-details");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
