const Absence = require("../models/absence");
const Attendance = require("../models/attendance");
const User = require("../models/user");
const {validationResult} = require('express-validator');

// GET Absence Page
exports.getAbsence = (req, res, next) => {
  const disabledDates = [];
  // Get all the dates that the user has already taken an absence
  Attendance.find({ userId: req.user._id })
    .then((attendance) => {
      const attendsDates = attendance.map((item) =>
        item.date.toLocaleDateString()
      );
      
      disabledDates.push(...attendsDates);
      res.render("absence", {
        css: "absence",
        pageTitle: "Đăng ký nghỉ phép",
        user: req.user,
        disabledDates: disabledDates,
        hasError: false,
        errorMessage: ''
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// RESIGER Absence
exports.postAbsence = (req, res, next) => {
  const { type, date, hours, dates, reason } = req.body;
  const errors = validationResult(req).array()
  if (errors.length > 0) {
    return res.status(422).render("absence", {
      css: "absence",
      pageTitle: "Đăng kỳ nghỉ phép",
      hasError: true,
      validationErrors: errors,
      errorMessage: errors[0].msg,
    });
  }
  //Add the absence to the database
  Attendance.addAbsence(req.user._id, type, date, hours, dates, reason)
    .then((result) => {
      let delNum = type == 0 ? result.days : result.length;
      return User.updateOne(
        { _id: req.user._id },
        { $inc: { annualLeave: -delNum } }
      );
    })
    .then((result) => {
      res.redirect("/absence");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
