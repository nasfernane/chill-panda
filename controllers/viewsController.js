// overview de tous les projets
exports.getOverview = (req, res) => {
    res.status(200).render('overview', {
        title: 'All Projects',
    });
};

// page projet individuel
exports.getProject = (req, res) => {
    res.status(200).render('project', {
        title: `Furimi's Project`,
    });
};
