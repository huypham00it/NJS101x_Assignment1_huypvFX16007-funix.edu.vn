module.exports = (req, res, next) => {
    if(!req.user.role === 'manager'){
        return res.redirect('/');
    }
    next();

}