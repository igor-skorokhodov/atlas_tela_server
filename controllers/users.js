const User = require("../models/user");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const ReqError = require("../errors/req-error");
const ForbiddenError = require("../errors/forb-error");
const NotFoundError = require("../errors/not-found-err");
const AuthError = require("../errors/auth-error")

const { NODE_ENV, JWT_SECRET } = process.env;

function getUsers(req, res, next) {
  return User.find({})
    .then((users) => res.status(200).send(users))
    .catch(next);
}

function createUser(req, res, next) {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => User.create({
      number: req.body.number,
      password: hash,
    }))
    .then((user) => {
      user.password = null;
      res.status(200).send({ user });
    })
    .catch((err) => {
        console.log(err)});
}

function aboutUser(req, res, next) {
  const id = req.headers.userid;

  return User.findById(id)
    .then((user) => {
      user.password = null;
      res.status(200).send({ user });
    })
    .catch(next);
}


function updateUser(req, res, next) {
  const id = req.headers.userid;

  return User.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      about: req.body.about,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .then((user) => {
      user.password = null;
      res.status(200).send({ user });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new ReqError("ошибка валидации"));
      } else {
        next(err);
      }
    });
}

function login(req, res, next) {
  const { number, password } = req.body;
  console.log(req.body);

  if (!number || !password) {
    throw new ReqError("Email или пароль не могут быть пустыми");
  }

  User.findOne({ number })
    .select("+password")
    .then((user) => {
      console.log("user password is", user.password);
      console.log(user);
      if (!user) {
        throw new AuthError("Неправильные телефон или пароль");
      }
      return bcrypt
        .compare(String(password), String(user.password))
        .then((matched) => {
          if (!matched) {
            console.log("password не найден");
            throw new AuthError("Неправильные телефон или пароль");
          }
          const token = jwt.sign(
            { _id: user._id },
            NODE_ENV === "production" ? JWT_SECRET : "dev-secret",
            {
              expiresIn: "7d",
            }
          );
          user.password = null;
          res.send({ token, user });
        });
    })
    .catch((err) => {
      console.log(err);
      if (err.name === "ValidationError") {
        next(new ReqError("ошибка валидации"));
      } else {
        next(err);
      }
    });
}

function deleteUser(req, res, next) {
  const id = req.headers.userid;
  const userId = req.user._id;

  return User.findById(id)
    .orFail(new NotFoundError("Карточка не найдена"))
    .then((user) => {
      return User.findByIdAndRemove(id)
        .orFail(new ReqError("Карточка не найдена"))
        .then((user) => {
          res.status(200).send({ user });
        });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new ReqError("Карточка не найдена"));
      } else {
        next(err);
      }
    });
}

module.exports = {
  getUsers,
  createUser,
  aboutUser,
  login,
  deleteUser,
};
