const BaseSQLModel = require("./baseSQLModel");

// Create a new class for a specific table
class UserModel extends BaseSQLModel {

  constructor() {
    super("user"); //table 'users'
  }

  speak() {
    console.log("Hello!");
  }

  async getUserByEmail(email) {
    const results =  await this.findByKey('email', email);
    return results;
  }


}

const UserDB = new UserModel();

module.exports = UserDB;

//exports.UserDB = new UserModel();

//module.exports = User;


// class User {
//   constructor(user_id){
//     this.user_id = user_id;
//     this.email = user.email;
//     this.password = user.password;
//   }

//   get user_id(){
//     return this.user_id;
//   }

//   get email(){
//     return this.email;
//   }

//   set password(new_password){   
//     UserDB.update(this.id, {password: new_password})
//       .then((affectedRows) => {
//         console.log("User updated. Affected rows:", affectedRows);
//       })
//       .catch((error) => {
//         console.error("Error updating user:", error);
//       });
//   }
// }
