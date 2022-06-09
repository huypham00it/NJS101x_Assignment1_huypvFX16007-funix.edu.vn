module.exports = (req, res, next) => {
    if(req.user.lock){
        req.flash('error', 'Tài khoản đã bị khóa');
        return res.redirect('/')
    }
    
    next();
}