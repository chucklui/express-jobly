const { BadRequestError } = require("../expressError");

/**This function accepts two objects of key-value pairs
 * to transform the key from camel case to snake case 
 * and make an array of values for sql $1, $2...
 * Example Inputs =>
 * dataToUpdate { lastName: 'chuck1' }
 * jsToSql { firstName: 'first_name', lastName: 'last_name', isAdmin: 'is_admin' }
 * Returns => {
 * setCols: '"last_name"=$1',
 * values: ["chuck1"]}
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  console.log("dataToUpdate", dataToUpdate);
  console.log("jsToSql", jsToSql);

  //["lastName"]
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  // cols = ['"last_name"=$1'];
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );
  console.log("COLS", cols);
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}


module.exports = { sqlForPartialUpdate };
