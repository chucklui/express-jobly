"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "j2",
    salary: 99,
    equity: 0.5,
    companyHandle: "c2",
  };

  test("works", async function () {
    await Job.create(newJob);
    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'j2'`);
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "j2",
        salary: 99,
        equity: expect.any(String),
        company_handle: "c2",
      },
    ]);
  });

})