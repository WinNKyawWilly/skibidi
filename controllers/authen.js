const UserDB = require("../models/userModel");

const userLogin = async function (req, res, email, password) {
  const oldUser = await UserDB.getUserByEmail(email);
  console.log("authen user email: ", email);
  console.log("authen user password: ", password);
  console.log("is Old user: ", oldUser);

  if (oldUser) {
      if (oldUser.password === password) {
          req.session.authenticated = true;
          req.session.user_id = oldUser.user_id;
          console.log("Athen login: ", req.session.user_id);
          req.session.is_admin = oldUser.is_admin;
          req.session.email = email;
          req.session.wish = [];
          console.log("Login successful");
          return { success: true, message: "Login successful" };
      } else {
          req.session.authenticated = false;
          console.log("Wrong password");
          return { success: false, message: "Wrong authentication" };
      }
  } else {
      console.log("User does not exist");
      return { success: false, message: "User does not exist" };
  }
};

const userRegister = async function (req, res, email, password) {
  const oldUser = await UserDB.getUserByEmail(email);

  if (oldUser) {
      return { success: false, message: "User already exists" };
  } else {
      const newUser = UserDB.create({ email: email, password: password });
      req.session.authenticated = true;
      req.session.userId = newUser.id;
      req.session.email = email;
      req.session.wish = [];
      return { success: true, message: "User registered successfully" };
  }
};

exports.userLogin = userLogin;
exports.userRegister = userRegister;

module.exports.authentication = async (req, res, next) => {
  const authenicated = await req.session.authenticated;

  console.log("session in authentication: ", req.sessionID);

  if (!authenicated) {
    return res.redirect("/login?q=session-expired");
  }
  try {
    
    let user = await UserDB.findById(req.session.userId);

    console.log("user:" + user.email);

    if (!user) {
      return res.redirect("/login?q=session-expired");
    }
    next();
  } catch (err) {
    console.log(err);
    res.json({ msg: "Server error. Please reload page after sometime" });
  }
};
