const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

// INITIALISE  DATABSE SERVER

const initialiseDBserver = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is Up and Running`);
    });
  } catch (error) {
    console.log(`DBmessage ${error.message}`);
    process.exit(1);
  }
};

initialiseDBserver();

// ### API 1

// #### Path: `/states/`

// #### Method: `GET`

app.get("/states/", async (request, response) => {
  const dbQuery = `
    SELECT state_id AS  stateId,
    state_name AS stateName,
    population AS  population
    FROM 
    state
    `;
  const array = await db.all(dbQuery);
  response.send(array);
});

// ### API 2

// #### Path: `/states/:stateId/`

// #### Method: `GET`

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const dbQuery = `
    SELECT state_id AS  stateId,
    state_name AS stateName,
    population AS  population
    FROM 
    state
    WHERE 
    state_id = ${stateId}
    `;
  const array = await db.get(dbQuery);
  response.send(array);
});

// ### API 3

// #### Path: `/districts/`

// #### Method: `POST`

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  console.log(districtName);
  const dbQuery = `
    INSERT INTO district (district_name,state_id,cases,cured,active,deaths)
    VALUES (
    '${districtName}',
  ${stateId},
  ${cases}, 
  ${cured},
  ${active},
 ${deaths}
)
    `;
  const array = await db.run(dbQuery);
  const district_id = array.lastID;
  response.send("District Successfully Added");
});

// ### API 4

// #### Path: `/districts/:districtId/`

// #### Method: `GET`
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const dbQuery = `
    SELECT district_id AS  districtId,
    district_name AS districtName,
    state_id AS  stateId,
    cases,cured,active,deaths
    FROM 
    district
    WHERE 
    district_id = ${districtId}
    `;
  const array = await db.get(dbQuery);
  response.send(array);
});

// ### API 5

// #### Path: `/districts/:districtId/`

// #### Method: `DELETE`

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const dbQuery = `
    DELETE
    FROM 
    district
    WHERE 
    district_id = ${districtId}
    `;
  const array = await db.run(dbQuery);
  response.send("District Removed");
});

// ### API 6

// #### Path: `/districts/:districtId/`

// #### Method: `PUT`

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const dbQuery = `
    UPDATE 
    district
    SET 
        district_name = '${districtName}',
        state_id = ${stateId},
        cases = ${cases}, 
        cured = ${cured}, 
       active =  ${active}, 
       deaths =  ${deaths}
    WHERE 
    district_id = ${districtId}
    `;
  const array = await db.run(dbQuery);
  response.send("District Details Updated");
});

// ### API 7

// #### Path: `/states/:stateId/stats/`

// #### Method: `GET`
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const dbQuery = `
    SELECT SUM(cases) AS totalCases,
    SUM(cured) AS totalCured, 
    SUM(active) AS totalActive, 
    SUM(deaths) AS totalDeaths
    FROM 
    district
        WHERE state_id = ${stateId}
    GROUP BY state_id


    `;
  const array = await db.get(dbQuery);
  response.send(array);
});

// ### API 8

// #### Path: `/districts/:districtId/details/`

// #### Method: `GET`

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  console.log(districtId);
  const dbQuery = `
    SELECT state.state_name AS stateName
    FROM 
    district NATURAL JOIN state
    WHERE district.district_id = ${districtId}

    `;
  const array = await db.get(dbQuery);
  console.log(array);
  response.send(array);
});

module.exports = app;
