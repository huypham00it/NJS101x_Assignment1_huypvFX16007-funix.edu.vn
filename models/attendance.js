const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Model
const attendanceSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    details: [
        {
            startTime: {type: Date},
            endTime: {type: Date},
            workplace: {type: String},
            total: {type: Number}
        }
    ],
    days: {type: Number},
    reason: {type: String },
    totalDayTime: {type: Number}
    
});

// Check wildcard search
attendanceSchema.statics.checkSearch = function (first, second){
    if (first.length == 0 && second.length == 0)
        return true;

    if (first.length > 1 && first[0] == '*' &&
        second.length == 0)
        return false;

    if ((first.length > 1 && first[0] == '?') ||
        (first.length != 0 && second.length != 0 &&
        first[0] == second[0]))
        return this.checkSearch(first.substring(1),
                    second.substring(1));

    if (first.length > 0 && first[0] == '*')
        return this.checkSearch(first.substring(1), second) ||
            this.checkSearch(first, second.substring(1));

    return false;
}

attendanceSchema.statics.addAbsence = function (
    userId,
    type,
    date,
    hours,
    dates,
    reason
  ) {
    if (type == 1) {
      const dateArr = dates.split(",");
      const newAbsence = [];
      dateArr.forEach((date) => {
        newAbsence.push({
          userId: userId,
          date: new Date(date),
          days: 1,
          reason: reason,
        });
      });
      return this.insertMany(newAbsence);
    } else if (type == 0) {
      const newAbsence = {
        userId: userId,
        date: new Date(date),
        days: hours / 8,
        reason: reason,
      };
      return this.create(newAbsence);
    }
}

module.exports = mongoose.model('Attendance',attendanceSchema);

