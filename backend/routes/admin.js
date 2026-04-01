const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleMiddleware');
const { 
    getAdminStats, 
    getAllUsers, 
    addUser, 
    deleteUser, 
    changeUserPassword, 
    getAllFiles 
} = require('../controllers/adminController');

router.get('/stats', auth, isAdmin, getAdminStats);
router.get('/users', auth, isAdmin, getAllUsers);
router.post('/users', auth, isAdmin, addUser);
router.delete('/users/:id', auth, isAdmin, deleteUser);
router.put('/users/:id/password', auth, isAdmin, changeUserPassword);
router.get('/files', auth, isAdmin, getAllFiles);

module.exports = router;
