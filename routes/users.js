const userRoutes = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const auth = require("../middlewares/auth");
const {
  getUsers,
  createUser,
  deleteUser,
  updateUser,
} = require("../controllers/users");

userRoutes.get("/users", auth, getUsers);

userRoutes.post(
  "/users",
  celebrate({
    body: Joi.object()
      .keys({
        name: Joi.string().required().min(2).max(30),
        password: Joi.string().required().min(2).max(30),
      })
      .unknown(true),
  }),
  auth,
  createUser
);

userRoutes.delete(
  "/users/:userId",
  celebrate({
    params: Joi.object()
      .keys({
        userId: Joi.string().hex().length(24),
      })
      .unknown(true),
  }),
  auth,
  deleteUser
);

/*  userRoutes.patch('/users/me',
  celebrate({
    headers: Joi.object()
      .keys({
        userid: Joi.string().hex().length(24),
      })
      .unknown(true),
    body: Joi.object()
      .keys({
        name: Joi.string().required().min(2).max(30),
        about: Joi.string().required().min(2).max(30),
      }),
  }), auth, updateUser);
*/

module.exports = userRoutes;
