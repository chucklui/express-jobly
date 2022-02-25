"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "j3",
    salary: 99,
    equity: 0.5,
    companyHandle: "c2",
  };

  test("works", async function () {
    await Job.create(newJob);
    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'j3'`);
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "j3",
        salary: 99,
        equity: expect.any(String),
        company_handle: "c2",
      },
    ]);
  });

});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 100,
        equity: "1.0",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 50,
        equity: "0",
        companyHandle: "c1",
      },
    ]);
  });
});

describe("findAll with filter", function () {
  test("works: with every job filter", async function () {
    let jobs = await Job.findAll({title: "j", 
                                           minSalary: 70,
                                           hasEquity: true});
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 100,
        equity: "1.0",
        companyHandle: "c1",
      },
    ]);
  });



  test("works: with just equity filter", async function () {
    let jobs = await Job.findAll({hasEquity: false});
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j2",
        salary: 50,
        equity: "0",
        companyHandle: "c1",
      },
    ]);
  });


  test("works: with empty filter", async function () {
    let jobs = await Job.findAll({});
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 100,
        equity: "1.0",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 50,
        equity: "0",
        companyHandle: "c1",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    console.log("job Ids are: ",jobIds);
    let job = await Job.get(jobIds[0]);
    expect(job).toEqual(
      {
        id: jobIds[0],
        title: "j1",
        salary: 100,
        equity: "1.0",
        companyHandle: "c1",
      },
    );
  });

  test("not found if no such company", async function () {
    try {
      await Job.get(10000);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "j9",
    salary: 200,
    equity: 0,
    companyHandle: 'c1'
  };

  test("works", async function () {
    let job = await Job.update(jobIds[0], updateData);
    expect(job).toEqual({
      id: jobIds[0],
      title: "j9",
      salary: 200,
      equity: '0',
      companyHandle: 'c1'
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = ${jobIds[0]}`);
    expect(result.rows).toEqual([{
      id: jobIds[0],
      title: "j9",
      salary: 200,
      equity: '0',
      companyHandle: 'c1'
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "j10",
      salary: 200,
      equity: null,
      companyHandle: 'c1',
    };

    let job = await Job.update(jobIds[0], updateDataSetNulls);
    expect(job).toEqual({
      id: jobIds[0],
      title: "j10",
      salary: 200,
      equity: null,
      companyHandle: 'c1',
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = ${jobIds[0]}`);
    expect(result.rows).toEqual([{
      id: jobIds[0],
      title: "j10",
      salary: 200,
      equity: null,
      companyHandle: 'c1',
    }]);
  });

  test("not found if no such company", async function () {
    try {
      await Job.update(10000, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(jobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(jobIds[0]);
    const res = await db.query(
        `SELECT id FROM jobs WHERE id=${jobIds[0]}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Job.remove(10000);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});