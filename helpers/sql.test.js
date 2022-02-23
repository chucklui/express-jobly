const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

/**this test for valid inputs for sqlForPartialUpdate */
describe("sqlForPartialUpdate", function() {
    test("valid input: 1", function() {
        const result = sqlForPartialUpdate(
            { lastName: "chuck" },
            { firstName: 'first_name', lastName: 'last_name', isAdmin: 'is_admin' });

        expect(result).toEqual({
            setCols: '"last_name"=$1',
            values: ["chuck"]
            });
    });

    test("valid input: 2", function() {
        const result = sqlForPartialUpdate(
            { middle_name: "chuck" },
            { firstName: 'first_name', lastName: 'last_name', isAdmin: 'is_admin' });

        expect(result).toEqual({
            setCols: '"middle_name"=$1',
            values: ["chuck"]
            });
    });

    test("invalid input", function() {
        try{
            const result = sqlForPartialUpdate(
                {},
                { firstName: 'first_name', lastName: 'last_name', isAdmin: 'is_admin' });
            fail();
        } catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();

        }
    });
});