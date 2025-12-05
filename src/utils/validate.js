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

  // Normalize keys for FormData-based request
  const bodyKeys = Object.keys(userData).map((key) => key.split("[")[0]);

  const isUpdateAllow = bodyKeys.every((K) =>
    ALLOWED_UPDATE.includes(K)
  );

  return isUpdateAllow;
};

module.exports = { validateEditProfile };
