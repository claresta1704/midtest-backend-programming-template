const { User } = require('../../../models');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * fungsi sort
 * @param {Array} array
 * @param {string} field_name
 * @param {string} sort
 * @returns {Promise}
 */
async function sort(array, field_name, sort){
  let sortOrder;
  if(sort == 'asc'){ //kalau di javaScript, fungsi sort sudah ada
    sortOrder = 1;
  }else if(sort == 'desc'){
    sortOrder = -1;
  }else{
    sortOrder = 1; //default asc
  }

  let sorted = await array.sort((colSatu, colDua) => {
    if(colSatu[field_name] < colDua[field_name]){ //misalnya jika di field name, ada a dan c. maka a<c, dan dikembalikan -1 x sortOrder
      return (-1*sortOrder); //misalnya sort ordernya desc (-1) berarti c dulu baru a. Maka -1 x -1 = 1. Kalau i berarti a ditempatkan setelah c
    }else if(colSatu[field_name] > colDua[field_name]){ //misalnya sort ordernya asc (1) berarti berarti a dulu baru c. Maka -1 x 1 = -1. Kalau -1 berarti a ditempatkan sebelum c
      return (1*sortOrder);
    }else{
      return 0;
    }
  });

  return sorted;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getUsers,
  sort,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
};
