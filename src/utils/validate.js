const validateEditProfile = (req) => {
    const userData = req.body;
    const ALLOWED_UPDATE = [
      "age",
      "gender",
      "about",
      "firstName",
      "lastName",
      "skills",
      "photoUrl",
    ];
    const isUpdateAllow = Object.keys(userData).every((K) =>
      ALLOWED_UPDATE.includes(K)
    ); 
    return isUpdateAllow;
}

module.exports = {validateEditProfile}