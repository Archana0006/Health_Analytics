const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.` 
            });
        }
        next();
    };
};

const isStaff = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Access denied. Staff only.' });
    }
    next();
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};

const isDoctor = (req, res, next) => {
    if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Access denied. Doctors only.' });
    }
    next();
};

module.exports = { isStaff, isAdmin, isDoctor, authorizeRoles };
