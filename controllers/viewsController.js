const Project = require('../models/projectModel');
const Bill = require('../models/billModel');
const catchAsync = require('../utils/catchAsync');

// overview de tous les projets
exports.getOverview = catchAsync(async (req, res) => {
    // récupération de tous les projets de la collection
    const projects = await Project.find();

    res.status(200).render('overview', {
        title: 'All Projects',
        projects,
    });
});

// page projet individuel
exports.getProject = catchAsync(async (req, res) => {
    // récupère le projet sur son id
    const project = await Project.findOne({ _id: req.params.id });
    const bills = await Bill.find({ project: req.params.id });

    res.status(200).render('project', {
        title: 'coucou',
        project,
        bills,
    });
});
