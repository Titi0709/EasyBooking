const { validateRegister, validateLogin } = require("../../src/validators/auth.validators");
const { validateReservation } = require("../../src/validators/reservation.validators");

describe("Tests unitaires - Validators", () => {

    // Inscription
    test("U-01 Register - email invalide", () => {
        const errors = validateRegister({
            name: "Test",
            email: "invalidemail",
            password: "123456"
        });
        expect(errors.length).toBeGreaterThan(0);
    });

    test("U-02 Register - mot de passe trop court", () => {
        const errors = validateRegister({
            name: "Test",
            email: "test@test.com",
            password: "123"
        });
        expect(errors).toContain("Mot de passe >= 6 caractères");
    });

    test("U-03 Register - nom manquant", () => {
        const errors = validateRegister({
            email: "test@test.com",
            password: "123456"
        });
        expect(errors.length).toBeGreaterThan(0);
    });

    // login
    test("U-04 Login - email manquant", () => {
        const errors = validateLogin({
            password: "123456"
        });
        expect(errors).toContain("Email obligatoire");
    });

    test("U-05 Login - password manquant", () => {
        const errors = validateLogin({
            email: "test@test.com"
        });
        expect(errors).toContain("Mot de passe obligatoire");
    });

    // reservation
    test("U-06 Reservation - roomId invalide", () => {
        const errors = validateReservation({
            roomId: "123",
            start: new Date().toISOString(),
            end: new Date(Date.now() + 3600000).toISOString()
        });
        expect(errors.length).toBeGreaterThan(0);
    });

    test("U-07 Reservation - start invalide", () => {
        const errors = validateReservation({
            roomId: "507f1f77bcf86cd799439011",
            start: "invalid-date",
            end: new Date().toISOString()
        });
        expect(errors.length).toBeGreaterThan(0);
    });

    test("U-08 Reservation - end avant start", () => {
        const errors = validateReservation({
            roomId: "507f1f77bcf86cd799439011",
            start: new Date().toISOString(),
            end: new Date(Date.now() - 3600000).toISOString()
        });
        expect(errors).toContain("end doit être après start");
    });

    test("U-09 Reservation - durée trop longue", () => {
        const errors = validateReservation({
            roomId: "507f1f77bcf86cd799439011",
            start: new Date().toISOString(),
            end: new Date(Date.now() + 9 * 3600000).toISOString()
        });
        expect(errors.length).toBeGreaterThan(0);
    });

    test("U-10 Reservation - payload valide", () => {
        const errors = validateReservation({
            roomId: "507f1f77bcf86cd799439011",
            start: new Date().toISOString(),
            end: new Date(Date.now() + 3600000).toISOString()
        });
        expect(errors.length).toBe(0);
    });

});
