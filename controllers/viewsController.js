const Project = require('../models/projectModel');
const catchAsync = require('../utils/catchAsync');

// overview de tous les projets
exports.getOverview = catchAsync(async (req, res) => {
    // récupération de tous les projets projets de la collection
    const projects = await Project.find();

    res.status(200).render('overview', {
        title: 'All Projects',
        projects,
    });
});

// page projet individuel
exports.getProject = (req, res) => {
    res.status(200).render('project', {
        title: `Furimi's Project`,
    });
};
