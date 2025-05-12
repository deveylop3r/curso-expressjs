// Validación de correo electrónico mediante Regex
function isValidEmail(email) {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(email);
}

// Validación de nombre (mínimo 3 caracteres)
function isValidName(name) {
  return typeof name === "string" && name.length >= 3;
}
// Validación de ID (numérico y único)
function isUniqueNumericId(id, users, currentUserId = null) {
  // Si estamos actualizando un usuario, permitimos que mantenga su propio ID
  if (currentUserId !== null && id === currentUserId) {
    return typeof id === "number";
  }
  // Para nuevos usuarios o si se intenta cambiar el ID, verificamos que sea único
  return typeof id === "number" && !users.some((user) => user.id === id);
}

// Función principal de validación
function validateUser(user, users, currentUserId = null) {
  const { name, email, id } = user;
  if (!isValidName(name)) {
    return {
      isValid: false,
      error: "El nombre debe tener al menos 3 caracteres.",
    };
  }
  if (!isValidEmail(email)) {
    return { isValid: false, error: "El correo electrónico no es válido." };
  }
  if (!isUniqueNumericId(id, users, currentUserId)) {
    return { isValid: false, error: "El ID debe ser numérico y único." };
  }
  return { isValid: true };
}

module.exports = {
  isValidEmail,
  isValidName,
  isUniqueNumericId,
  validateUser,
};
