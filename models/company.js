"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
        `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
        `INSERT INTO companies(
          handle,
          name,
          description,
          num_employees,
          logo_url)
           VALUES
             ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /**prevent sql injection */
  static buildFilter({name, minEmployees, maxEmployees}){
    if(minEmployees > maxEmployees){
      throw new BadRequestError("Invalid filter");
    }
    
    /** Arrays to store information of sql statements, and values to put
    as sql parameters. */ 
    const statement = [];
    const values = [];
    if(name !== undefined){
      values.push(`%${name}%`);
      statement.push(`name LIKE $${values.length}`);
    }
    if(minEmployees !== undefined){
      values.push(minEmployees);
      statement.push(`num_employees >= $${values.length}`);
    }
    if(maxEmployees !== undefined){
      values.push(maxEmployees);
      statement.push(`num_employees <= $${values.length}`);
    }

    const where = (values.length > 0) ? 
                    `WHERE ` + statement.join(` AND `)
                    : "";

    return { where, values };

  }

  /** Find all companies.
   * This method accepts an object of filters like => 
   * { name: "C", minEmployees: 1, maxEmployees: 100 }
   * to filter out the companies in db
   * and returns => 
   * [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */
  static async findAll(search = {}) {
 
    // if(Object.keys(search).length === 0){
    //   const companiesRes = await db.query(
    //       `SELECT handle,
    //               name,
    //               description,
    //               num_employees AS "numEmployees",
    //               logo_url AS "logoUrl"
    //         FROM companies
    //         ORDER BY name`);
    //   return companiesRes.rows;
    // }
    
    const { where, values } = this.buildFilter(search);
    const companiesRes = await db.query(
      `SELECT handle,
              name,
              description,
              num_employees AS "numEmployees",
              logo_url AS "logoUrl"
        FROM companies
        ${where}
        ORDER BY name`, values);
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
        `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
        [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE companies
      SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
        `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
