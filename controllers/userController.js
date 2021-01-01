const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

// GET tous les utilisateurs
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    // ENVOI DE LA REPONSE
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined',
    });
};

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        messahe: 'this route is not yet defined',
    });
};

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        messahe: 'this route is not yet defined',
    });
};

exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        messahe: 'this route is not yet defined',
    });
};
