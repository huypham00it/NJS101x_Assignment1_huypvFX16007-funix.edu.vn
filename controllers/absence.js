const Absence = require("../models/absence");
const Attendance = require("../models/attendance");
const User = require("../models/user");

// GET Absence Page
exports.getAbsence = (req, res, next) => {
  const disabledDates = [];
  // Get all the dates that the user has already taken an absence
  Absence.find({ userId: req.user._id })
    .then((absences) => {
      const absencesDates = absences.map((item) =>
        item.date.toLocaleDateString()
      );
      disabledDates.push(...absencesDates);
      return Attendance.find({ userId: req.user._id });
    })
    .then((attendance) => {
      // Get all the dates that the user has already taken an attendance
      const attendanceDates = attendance.map((item) =>
        new Date(item.date).toLocaleDateString()
      );
      disabledDates.push(...attendanceDates);

      res.render("absence", {
        css: "absence",
        pageTitle: "Đăng ký nghỉ phép",
        user: req.user,
        disabledDates: disabledDates,
      });
    })
    .catch((err) => console.log(err));
};

// POST Absence Page
exports.postAbsence = (req, res, next) => {
  const { type, date, hours, dates, reason } = req.body;
  //Add the absence to the database
  Absence.addAbsence(req.user._id, type, date, hours, dates, reason)
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
    .catch((err) => console.log(err));
};
