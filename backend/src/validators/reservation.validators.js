const { ObjectId } = require("mongodb");

function validateReservation(data) {
    const errors = [];

    if (!data.roomId || !ObjectId.isValid(data.roomId)) errors.push("roomId invalide");
    if (!data.start) errors.push("start obligatoire (ISO date)");
    if (!data.end) errors.push("end obligatoire (ISO date)");

    const start = new Date(data.start);
    const end = new Date(data.end);

    if (Number.isNaN(start.getTime())) errors.push("start invalide");
    if (Number.isNaN(end.getTime())) errors.push("end invalide");
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        if (end <= start) errors.push("end doit être après start");
        // optionnel: limiter à 8h par ex
        const diffH = (end - start) / (1000 * 60 * 60);
        if (diffH > 8) errors.push("Réservation trop longue (max 8h)");
    }

    return errors;
}

module.exports = { validateReservation };
