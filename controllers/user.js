const User = require("../models/user");
const Status = require("../models/status");
const Attendance = require("../models/attendance");

// Get Home Page
exports.getHome = (req, res, next) => {
  const user = req.user;
  res.render("home", {
    css: "home",
    user: user,
    pageTitle: "Trang chủ",
  });
};

// Check if user is logged in to add new status
exports.loggedIn = function (req, res, next) {
  User.findById("6296b493054ec37ec8d5f20b")
    .then((user) => {
      req.user = user;
      return Status.findOne({ userId: user._id });
    })
    .then((result) => {
      if (!result) {
        const status = new Status({
          userId: req.user._id,
          workplace: "Chưa xác định",
          isWorking: false,
          attendId: null,
        });
        return status.save();
      } else {
        return result;
      }
    })
    .then((result) => {
      req.user.workplace = result.workplace;
      req.user.isWorking = result.isWorking;
      next();
    })
    .catch((err) => console.log(err));
};

// GEt Edit User Page
exports.getEditUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      res.render("edit-user", {
        css: "edit-user",
        pageTitle: user.name,
        user: user,
      });
    })
    .catch((err) => console.log(err));
};

// Post edit user
exports.postEditUser = (req, res, next) => {
  const { id, image } = req.body;
  User.findById(id)
    .then((user) => {
      user.image = image;
      user.save();
      res.redirect(`/edit-user/${id}`);
    })
    .catch((err) => console.log(err));
};

// Get all statistics of attendance
exports.getStatistic = (req, res, next) => {
  req.user.getStatistic().then((statistics) => {
    res.render("statistic", {
      css: "statistic",
      pageTitle: "Tra cứu thông tin",
      user: req.user,
      statistics: statistics,
      type: "details",
    });
  });
};

// Get Statistic with Wildcard
exports.getStatisticSearch = function (req, res, next) {
  const {type, search} = req.query;
  req.user
    .getStatistic()
    .then((statistics) => {
      var currStatistic = []
      if(type == 'date'){
        // Search by date
        currStatistic = statistics.filter(
          (item) => Attendance.checkSearch(decodeURIComponent(search), item.date.toString()) && item.attend
        );
        if (currStatistic.length > 0) {
          // Check finished/not finished
          currStatistic.forEach((item) => {
            if (!item.details[0].endTime) {
              item.totalTime = "Chưa kết thúc";
            } else {
              item.totalTime = item.details.reduce(
                (sum, detail) =>
                  sum + (detail.endTime - detail.startTime) / 3600000,
                0
              );
              item.overTime = item.totalTime > 8 ? item.totalTime - 8 : 0;
              item.underTime = item.totalTime < 8 ? 8 - item.totalTime : 0;
            }
          });
          const totalTime = currStatistic.reduce(
            (sum, item) => sum + item.totalTime,
            0
          );
          const overTime = currStatistic.reduce(
            (sum, item) => sum + item.overTime,
            0
          );
          const underTime = currStatistic.reduce(
            (sum, item) => sum + item.underTime,
            0
          );
  
          if (typeof totalTime === "string") {
            currStatistic.salary = "Chưa kết thúc";
          } else {
            currStatistic.salary = (
              req.user.salaryScale * 3000000 +
              (overTime - underTime) * 200000
            ).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
          }
        }
      }
      
      res.render("statistic", {
        css: "statistic",
        pageTitle: "Tra cứu thông tin",
        user: req.user,
        statistics: currStatistic,
        type: "salary",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postStatisticSalary = (req, res, next) => {
  const { date } = req.body;
  req.user.getStatistic(type, date).then((statistics) => {
    res.render("statistic", {
      css: "statistic",
      pageTitle: "Tra cứu thông tin",
      user: req.user,
      statistics: statistics,
    });
  });
};
