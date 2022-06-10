const User = require("../models/user");
const Status = require("../models/status");
const Attendance = require("../models/attendance");

// Get Home Page
exports.getHome = (req, res, next) => {
  const error = req.flash('error')[0]; 
  const user = req.user;
  if (user && user.role == "user") {
    return Status.findOne({ userId: user._id })
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
        req.session.status = {
          workplace: result.workplace,
          isWorking: result.isWorking,
        };
        return req.session.save((err) => {
          res.render("home", {
            css: "home",
            user: user,
            status: req.session.status,
            pageTitle: "Trang chủ",
            error: error,
          });
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  }

  res.render("home", {
    css: "home",
    user: user,
    status: req.status,
    pageTitle: "Trang chủ",
    error: error,
  });
};

// GEt Edit User Page
exports.getEditUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      res.render("edit-user", {
        css: "edit-user",
        pageTitle: user.name,
        user: user,
        error: req.flash("error")[0],
        success: req.flash("success")[0],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Post edit user
exports.postEditUser = (req, res, next) => {
  const { id } = req.body;
  const image = req.file;
  if (!image) {
    req.flash("error", "Thay đổi ảnh đại diện thất bại!");
    return res.redirect(`/edit-user/${id}`);
  }
  return User.findById(id)
    .then((user) => {
      user.image = image.path;
      user.save();
      req.flash("success", "Thay đổi ảnh đại diện thành công!");
      return res.redirect(`/edit-user/${id}`);
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Get all statistics of attendance
exports.getStatistic = (req, res, next) => {
  const staffId = req.user._id;
    const datanumber = req.query.datanumber || 20;
    const page = req.query.page || 0;
    const month = req.query.month;
    let start, end, totalData, attend = {}, absent={};
    if(month){
        start = new Date(month + '-01');
        end = new Date(month + '-31');
    }else {
        start = new Date(new Date().getFullYear() + '-01-01');
        end = new Date(new Date().getFullYear() + '-12-31');
    }
    Attendance.find({userId: staffId, date: {$gte: start, $lte: end}})
    .then(attendances => {
        attend.list = attendances.filter(attendance => !attendance.reason);
        absent.list = attendances.filter(attendance => attendance.reason);

        attend.overTime = attend.list.reduce((overTime, item) =>{
            if(item.totalDayTime > 8){
                return overTime + (item.totalDayTime - 8);
            }
            return overTime;
        }, 0);
        attend.underTime = attend.list.reduce((underTime, item) =>{
            if(item.totalDayTime < 8){
                return underTime + (8 - item.totalDayTime);
            }
            return underTime;
        }, 0);
        return Attendance.find({userId: staffId, date: {$gte: start, $lte: end}})
        .count();
    })
    .then(count => {
        totalData = count;
        return Attendance.find({userId: staffId, date: {$gte: start, $lte: end}})
            .sort({date: 1})
            .populate('userId')
            .skip(page * datanumber)
            .limit(datanumber)
    })
    .then(attendances => {
        
        res.render('statistic-details', {
            attendances,
            pageTitle: 'Thống kê',
            css: 'statistic',
            hasNext: page < Math.ceil(totalData / datanumber) - 1,
            hasPrev: page > 1,
            month: month,
            page: page,
            absent,
            overTime: attend.overTime,
            underTime: attend.underTime,
            datanumber: datanumber,
            staffId,
            user: req.user,
            totalPage: Math.ceil(totalData / datanumber),
        })
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Get Statistic with Wildcard
exports.getStatisticSearch = function (req, res, next) {
  const { type, search } = req.query;
  req.user
    .getStatistic()
    .then((statistics) => {
      var currStatistic = [],
        attendStatistic = [],
        absentStatistic = [];
      if (type == "date") {
        // Search by date
        attendStatistic = statistics.filter(
          (item) =>
            Attendance.checkSearch(search, item.date.toString()) && item.attend
        );
        absentStatistic = statistics.filter(
          (item) =>
            Attendance.checkSearch(search, item.date.toString()) && !item.attend
        );
        if (attendStatistic.length > 0) {
          // Check finished/not finished
          attendStatistic.forEach((item) => {
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
          const totalTime = attendStatistic.reduce(
            (sum, item) => sum + item.totalTime,
            0
          );
          const overTime = attendStatistic.reduce(
            (sum, item) => sum + item.overTime,
            0
          );
          const underTime = attendStatistic.reduce(
            (sum, item) => sum + item.underTime,
            0
          );

          currStatistic = [...attendStatistic, ...absentStatistic];
          currStatistic.overTime = overTime;
          currStatistic.underTime = underTime;
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

