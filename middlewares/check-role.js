module.exports = (req, res, next) => {
    if(req.user.role === 'manager'){
        res.redirect('/manager');
    }else if(req.user.role === 'user'){
        res.redirect('/')
    }

    next();
}