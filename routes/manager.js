const managerController = require('../controllers/manager');
const router = require('express').Router();
const isManager = require('../middlewares/is-manager');

//Staff's Covid List
router.get('/covid', isManager, managerController.getStaffCovidList);

//Get Staff Covid Detail pdf file
router.get('/covid/:id', isManager, managerController.getStaffCovidPDF);

//Get Staff Working Time List
router.get('/worktime', isManager, managerController.getStaffWorkTimeList);

//Get Staff Working Time Detail
router.get('/worktime-details/:staffId', isManager, managerController.getStaffWorkTimeDetail);
//Block User
router.post('/block-user/:userId', isManager, managerController.blockStaff);
//Block User
router.post('/delete-worktime/:userId', isManager, managerController.deleteWorktime);

module.exports = router;