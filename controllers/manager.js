'use strict'
const fs = require('fs');
const path = require('path');
const pdfDocument = require('pdfkit');

const User = require('../models/user');
const Covid = require('../models/covid');
const Attendance = require('../models/attendance');

// GET STAFF LIST
exports.getStaffCovidList = (req, res, next) => {
    User.find({ managerId: req.user._id }).then((staffs) => {
        res.render('manager/staffs-list', {
            staffs: staffs,
            pageTitle: 'Danh sách nhân viên',
            css: 'manager-list',
            type: 'covid',
        });
    });
};

// GET COVID DETAIL PDF FILE
exports.getStaffCovidPDF = (req, res, next) => {
    const id = req.params.id;

    Covid.findById({ _id: id })
        .populate('userId')
        .then((covid) => {
            if (
                covid.userId.managerId.toString() !==
                req.session.user._id.toString()
            ) {
                return next(new Error('UnauthorizedAccess'));
            }

            const pdfDoc = new pdfDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                'inline; filename="ThongtinCovid.pdf"'
            );
            pdfDoc.pipe(res);
            pdfDoc.registerFont(
                'PlayfairDisplay',
                path.join(
                    process.cwd() + '/public/assets/fonts/PlayfairDisplay.ttf'
                )
            );
            pdfDoc.font('PlayfairDisplay');
            pdfDoc.fontSize(26).text('Thông tin Covid', {
                underline: true,
            });
            pdfDoc.text(
                '----------------------------------------------------------------'
            );
            pdfDoc.text(covid.userId.name);
            pdfDoc.fontSize(20).text('Thông tin nhiệt độ cơ thể:');
            covid.bodyTemperatures.forEach((item) => {
                pdfDoc
                    .fontSize(16)
                    .text(
                        'Ngày: ' +
                            item.date.toLocaleDateString() +
                            ' - Nhiệt độ: ' +
                            item.value +
                            'C'
                    );
            });
            pdfDoc.fontSize(20).text('Thông tin tiêm vaccine:');
            covid.vaccine.forEach((item, index) => {
                pdfDoc
                    .fontSize(16)
                    .text(
                        'Mũi ' +
                            (index + 1) +
                            ' : ' +
                            item.date.toLocaleDateString() +
                            ' - Tên Vaccine: ' +
                            item.name
                    );
            });
            pdfDoc.fontSize(20).text('Thông tin dương tính với Covid:');
            covid.positive.forEach((item) => {
                pdfDoc
                    .fontSize(16)
                    .text('Ngày : ' + item.date.toLocaleDateString());
            });
            pdfDoc.end();
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
};

//GET STAFF WORKING TIME LIST
exports.getStaffWorkTimeList = (req, res, next) => {
    User.find({ managerId: req.user._id }).then((staffs) => {
        res.render('manager/staffs-list', {
            staffs: staffs,
            pageTitle: 'Danh sách nhân viên',
            css: 'manager-list',
            type: 'worktime',
        });
    });
};

// GET STAFF WORKING TIME ITEM
exports.getStaffWorkTimeDetail = (req, res) => {
    const staffId = req.params.staffId;
    const datanumber = req.query.datanumber || 20;
    const page = req.query.page || 0;
    const month = req.query.month;
    let start,
        end,
        totalData,
        attend = {},
        absent = {};
    if (month) {
        start = new Date(month + '-01');
        end = new Date(month + '-31');
    } else {
        start = new Date(new Date().getFullYear() + '-01-01');
        end = new Date(new Date().getFullYear() + '-12-31');
    }

    Attendance.find({ userId: staffId, date: { $gte: start, $lte: end } })
            .then((attendances) => {
                attend.list = attendances.filter(
                    (attendance) => !attendance.reason
                );
                absent.list = attendances.filter((attendance) => attendance.reason);

                attend.overTime = attend.list.reduce((overTime, item) => {
                    if (item.totalDayTime > 8) {
                        return overTime + (item.totalDayTime - 8);
                    }
                    return overTime;
                }, 0);
                attend.underTime = attend.list.reduce((underTime, item) => {
                    if (item.totalDayTime < 8) {
                        return underTime + (8 - item.totalDayTime);
                    }
                    return underTime;
                }, 0);
                return Attendance.find({
                    userId: staffId,
                    date: { $gte: start, $lte: end }
                }).count();
            })
            .then((count) => {
                totalData = count;
                return Attendance.find({
                    userId: staffId,
                    date: { $gte: start, $lte: end },
                })
                    .sort({ date: 1 })
                    .populate('userId')
                    .skip(page * datanumber)
                    .limit(datanumber);
            })
            .then(async (attendances) => {
                const user = await User.findById(staffId);
                res.render('manager/worktime-details', {
                    attendances,
                    pageTitle: 'Thời gian làm việc',
                    css: 'manager-details',
                    hasNext: page < Math.ceil(totalData / datanumber) - 1,
                    hasPrev: page > 1,
                    month: month,
                    page: page,
                    absent,
                    overTime: attend.overTime,
                    underTime: attend.underTime,
                    datanumber: datanumber,
                    staffId,
                    totalPage: Math.ceil(totalData / datanumber),
                    user
                });
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
};

// BLOCK STAFF
exports.blockStaff = (req, res, next) => {
    const staffId = req.params.userId;
    User.findById(staffId)
        .then((staff) => {
            if (!staff) {
                return next(new Error('NotFound'));
            }
            if (
                staff.managerId.toString() !== req.session.user._id.toString()
            ) {
                return next(new Error('UnauthorizedAccess'));
            }
            staff.lock = true;
            return staff.save();
        })
        .then((result) => {
            res.status(200).json({msg: "Khóa tài khoản thành công!"})
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
};

// DELETE WORKING TIME
exports.deleteWorktime = (req, res, next) => {
    const userId = req.params.userId;
    Attendance.find({ userId: userId })
        .populate('userId')
        .then((attendances) => {
            attendances.forEach((attendance) => {
                if (attendance.details.length > 0 && attendance.details[0].endTime || attendance.reason) {
                    return attendance.remove();
                }
            });
            if (!attendances) {
                return next(new Error('NotFound'));
            }
            req.session.status = null;
            return req.session.save();
        })
        .then((result) => {
            res.status(200).json({msg: "Xoá dữ liệu thành công!"})
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
};
