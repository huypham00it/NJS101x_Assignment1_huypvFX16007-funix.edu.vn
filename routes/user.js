const express = require('express');
const userController = require('../controllers/user');
const covidController = require('../controllers/covid');
const absenceController = require('../controllers/absence');
const attendanceController = require('../controllers/attendance');
const router = express.Router();

// Home Page 
router.get('/', userController.getHome);

// User Details Page
router.get('/edit-user/:userId', userController.getEditUser);
router.post('/edit-user', userController.postEditUser);

// Statistic Page 
router.get('/statistic', userController.getStatistic);
router.get('/statistic-search', userController.getStatisticSearch);
// router.post('/statistic', userController.postStatisticSalary);

// Attendance Page
router.get('/attendance', attendanceController.getAttendace);
router.get('/attendance-details', attendanceController.getAttendaceDetails);
router.post('/attendance', attendanceController.postAttendance);

// Absence Page 
router.get('/absence', absenceController.getAbsence);
router.post('/absence', absenceController.postAbsence);

// Covid Page 
router.get('/covid', covidController.getCovid);
router.get('/covid-details', covidController.getCovidDetails);
router.post('/covid', covidController.postCovid);

module.exports = router;
