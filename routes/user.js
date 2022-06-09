const express = require('express');
const userController = require('../controllers/user');
const covidController = require('../controllers/covid');
const absenceController = require('../controllers/absence');
const attendanceController = require('../controllers/attendance');
const isAccess = require('../middlewares/is-access');
const isAuth = require('../middlewares/is-auth');
const multer = require('multer');


const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
})

const fileFilter = (req, file, next) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        next(null, true);
    } else {
        next(null, false);
    }
}
const upload = multer({storage: fileStorage, fileFilter: fileFilter});

const router = express.Router();

// Home Page 
router.get('/', isAuth ,userController.getHome);

// User Details Page
router.get('/edit-user/:userId',isAuth, userController.getEditUser);
router.post('/edit-user', isAccess, upload.single('image'), userController.postEditUser);

// Statistic Page 
router.get('/statistic',isAuth, userController.getStatistic);
router.get('/statistic-search',isAuth, userController.getStatisticSearch);
// router.post('/statistic', userController.postStatisticSalary);

// Attendance Page
router.get('/attendance',isAuth, attendanceController.getAttendace);
router.get('/attendance-details',isAuth, attendanceController.getAttendaceDetails);
router.post('/attendance',isAuth, isAccess, attendanceController.postAttendance);

// Absence Page 
router.get('/absence',isAuth, isAccess, absenceController.getAbsence);
router.post('/absence',isAuth, isAccess, absenceController.postAbsence);

// Covid Page 
router.get('/covid',isAuth, covidController.getCovid);
router.get('/covid-details/:userId',isAuth, covidController.getCovidDetails);
router.post('/covid',isAuth, isAccess, covidController.postCovid);

module.exports = router;
