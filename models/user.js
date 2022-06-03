const mongoose = require("mongoose");
const Attendance = require("./attendance");
const Absence = require("./absence");
const Status = require("./status");

const Schema = mongoose.Schema;

// Create Schema
const userSchema = new Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  salaryScale: { type: Number, required: true },
  startDate: { type: Date, required: true },
  department: { type: String, required: true },
  annualLeave: { type: Number, required: true },
  image: { type: String, required: true },
});

//Get - Change Working Status
userSchema.methods.getStatus = function (type, workplace) {
  const user = this;
  let currAttendId = null;
  return Status.findOne({ userId: user._id })
    .then((status) => {
      currAttendId = status.attendId;
      if (type === "start") {
        return this.addAttendance(
          currAttendId,
          new Date().toLocaleDateString(),
          new Date(),
          workplace
        )
          .then((result) => {
            currAttendId = result._id;
            return Status.findOne({ userId: user._id });
          })
          .then((status) => {
            status.attendId = currAttendId;
            status.workplace = workplace;
            status.isWorking = true;
            return status.save();
          })
          .catch((err) => console.log(err));
      } else {
        return this.finishAttendance(currAttendId, new Date())
          .then((result) => {
            return Status.findOne({ userId: user._id });
          })
          .then((status) => {
            status.isWorking = false;
            status.workplace = "Chưa xác định";
            return status.save();
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
};

// Stop Working
userSchema.methods.finishAttendance = function (attendId, endTime) {
  return Attendance.findById(attendId).then((attendance) => {
    attendance.details[0].endTime = endTime;
    return attendance.save();
  });
};

// Start Working
userSchema.methods.addAttendance = function (
  attendId,
  date,
  startTime,
  workplace
) {
  if (attendId) {
    return Attendance.findById(attendId).then((attendance) => {
      // Check if the attendance is not finished
      if (date === attendance.date) {
        attendance.details.unshift({
          startTime: startTime,
          endTime: null,
          workplace: workplace,
        });
        return attendance.save();
      } else {
        const newAttend = new Attendance({
          userId: this._id,
          date: date,
          details: [
            {
              startTime: startTime,
              endTime: null,
              workplace: workplace,
            },
          ],
        });
        return newAttend.save();
      }
    });
  } else {
    const newAttend = new Attendance({
      userId: this._id,
      date: date,
      details: [
        {
          startTime: startTime,
          endTime: null,
          workplace: workplace,
        },
      ],
    });
    return newAttend.save();
  }
};

// Get Attendance Detail Per Day
userSchema.methods.getAttendanceDetails = function () {
  return Status.findOne({ userId: this._id }).then((status) => {
    return Attendance.findById(status.attendId)
      .then((attendance) => {
        return attendance;
      })
      .catch((err) => console.log(err));
  });
};

// Get All Attendance Statistic
userSchema.methods.getStatistic = function () {
  const statistics = [];
  // Get all attendance and absence
  return Attendance.find({ userId: this._id })
    .then((attendances) => {
      attendances.forEach((attendance) => {
        statistics.push({
          date: attendance.date,
          details: attendance.details,
          attend: true
        });
      });

      return Absence.find({ userId: this._id })
      .then((absences) => {
          absences.sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
          })
        absences.forEach((absence) => {
          statistics.push({
            date: absence.date.toLocaleDateString(),
            reason: absence.reason,
            days: absence.days,
            attend: false
          });
        });
        statistics.sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        })
        return statistics;
      });
    })
    .catch((err) => console.log(err));
};

module.exports = mongoose.model("User", userSchema);
