const User = require("../models/user");
const Manager = require("../models/manager");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

// Get Login Page
exports.getLogin = (req, res, next) => {
  res.render("login", {
    css: "login",
    pageTitle: "Đăng nhập",
    errorMessage: "",
    hasError: false,
    validationErrors: [],
  });
};

//Post Login Page
exports.postLogin = (req, res, next) => {
  const { username, password } = req.body;

  const errors = validationResult(req).array();

  //Check if has errors from validation result
  if (errors.length > 0) {
    return res.status(422).render("login", {
      css: "login",
      pageTitle: "Đăng nhập",
      hasError: true,
      validationErrors: errors,
      data: { username, password },
      errorMessage: errors[0].msg,
    });
  }

  //  Find user in database
  return User.findOne({ username: username })
    .then((user) => {
      // If is user
      if (user) {

        return bcrypt
          .compare(password, user.password)
          .then((isMatched) => {
            if (isMatched) {
              req.session.isLoggedIn = true;
              req.session.user = user;
              req.session.isUser = true;


              return req.session.save((err) => {
                res.redirect("/");
              });
            }

            return res.status(422).render("login", {
              css: "login",
              pageTitle: "Đăng nhập",
              hasError: true,
              validationErrors: [{ param: "username" }, { param: "password" }],
              data: { username, password },
              errorMessage: "Mật khẩu không đúng!",
            });
          })
          .catch((err) => console.log(err));
      }

      return Manager.findOne({ username: username }).then((manager) => {
        //If is manager
        if (manager) {
          return bcrypt
            .compare(password, manager.password)
            .then((isMatched) => {
              if (isMatched) {
                req.session.isLoggedIn = true;
                req.session.user = manager;
                req.session.isManager = true;
                return req.session.save((err) => {
                  res.redirect("/");
                });
              }

              return res.status(422).render("login", {
                css: "login",
                pageTitle: "Đăng nhập",
                hasError: true,
                validationErrors: [
                  { param: "username" },
                  { param: "password" },
                ],
                data: { username, password },
                errorMessage: "Mật khẩu không đúng!",
              });
            })
            .catch((err) => console.log(err));
        }

        return res.status(422).render("login", {
          css: "login",
          pageTitle: "Đăng nhập",
          hasError: true,
          validationErrors: [{ param: "username" }, { param: "password" }],
          data: { username, password },
          errorMessage: "Tài khoản không tồn tại!",
        });
      });
    })
    .catch((err) => console.log(err));
};

//Post logout
exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    res.redirect('/');
  });
}