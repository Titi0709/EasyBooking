function validateRegister(data) {
    const errors = [];
    if (!data.email || typeof data.email !== "string" || !data.email.includes("@")) {
        errors.push("Email invalide");
    }
    if (!data.password || typeof data.password !== "string" || data.password.length < 6) {
        errors.push("Mot de passe >= 6 caractères");
    }
    if (!data.name || typeof data.name !== "string" || data.name.trim().length < 1) {
        errors.push("Nom obligatoire");
    }
    return errors;
}

function validateLogin(data) {
    const errors = [];
    if (!data.email || typeof data.email !== "string") errors.push("Email obligatoire");
    if (!data.password || typeof data.password !== "string") errors.push("Mot de passe obligatoire");
    return errors;
}

module.exports = { validateRegister, validateLogin };
