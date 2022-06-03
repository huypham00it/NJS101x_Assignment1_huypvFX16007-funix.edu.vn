// Get Page Error 404
exports.getError = (req, res, next) => {
    res.render('error404', {
        css: '404',
        pageTitle: 'Không tìm thấy trang',
        user: req.user
    })
}