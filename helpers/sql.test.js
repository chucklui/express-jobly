const { sqlForPartialUpdate } = require("./sql");

// data to update { firstName, lastName, password, email }
describe("sqlForPartialUpdate", function() {
    test("valid input", function() {
        const result = sqlForPartialUpdate(
            { firstName: "Yong" },
            { firstName: "Chuck", lastName: "Lui"});

        expect(result).toEqual({
            "setCols": "\"Chuck\"=$1", 
            "values": ["Yong"]});
    });

});