const express = require('express');

const todos = require('./todos');
const apiHelpers = require('./helpers/apiHelpers');
const { isEmpty, isFull } = require('./helpers/helpers');
const { setupDB } = require('./setup');

const router = express.Router();

const apiPre = '  API> ';

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

/**
 * Middleware that handles get requests to './'.
 * Can take 2 optional parameters through a json object:
 *
 * 'position', controls if and how data should be ordered by the position field,
 * takes in either 'ascending' or 'descending' as strings.
 *
 * 'completed', controls if and how data should be filtered by the completed field,
 * takes in Boolean true, can returns for both true or false.
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {Object} returns a array containing JSON objects for todos
 */
async function get(req, res) {
  const { position, completed } = req.body;
  console.info(`${apiPre}get`);

  let validationResult = [];
  validationResult = validationResult.concat(apiHelpers.validate.position(position));
  validationResult = validationResult.concat(apiHelpers.validate.completed(completed));
  if (validationResult.length > 0) {
    return res.status(400).json({
      error: 'Bad Request',
      errorList: validationResult,
    });
  }

  // gets data
  const data = await todos.list();
  // filters data by if it is completed (or not)
  const filteredData = isFull(completed)
    ? todos.filter.filterByCompleted(data, { invert: !completed })
    : data;
  // sorts data by position
  const descending = isFull(position) ? position.toLowerCase().includes('descending') : false;
  const sortedData = isFull(position)
    ? todos.sort.sortByPosition(filteredData, { descending })
    : filteredData;

  // returns error if filtering the data empties the list
  if (sortedData.length === 0) {
    return res.status(404).json({
      error: 'No valid data found',
    });
  }

  return res.json(sortedData);
}

/**
 * Middleware that handles get requests to './:id'.
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {Object} returns a single JSON object for a single todo
 */
async function getID(req, res) {
  const { id } = req.params;

  console.info(`${apiPre}get/${id}`);
  const validationResult = apiHelpers.validate.id(id);

  if (validationResult.length > 0) {
    return res.status(400).json({
      error: 'Bad Request',
      errorList: validationResult,
    });
  }

  // gets data
  const data = await todos.listByID(id);
  // returns if no object is found
  if (isEmpty(data)) {
    return res.status(404).json({
      error: `No todo with id ${id} exists`,
    });
  }
  return res.json(data);
}

/**
 * Middleware that handles creating new data via post requests to './'
 *
 * Must take 1 parameters:
 *
 * Title, string, must be between 1-128 characters.
 *
 * Can take 3 optional parameters:
 *
 * Due, date, must be formated according to ISO 8601, defaults to null
 *
 * Position, number, positive integer, defaults to 0
 *
 * Completed, boolean, defaults to false
 *
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {Object} returns a single JSON object for a single todo
 */
async function post(req, res) {
  const { title, due, position, completed } = req.body;

  console.info(`${apiPre}post/`);
  const validationResult = apiHelpers.validate.data(title, due, position, completed, {
    post: true,
  });

  if (validationResult.length > 0) {
    return res.status(400).json({
      error: 'Bad Request',
      errorList: validationResult,
    });
  }

  const ret = await todos.insert(title, { due, position, completed });
  console.log(ret);

  return res.json(ret);
}

/**
 * Middleware that handles updating data via patch requests to './:id'
 *
 * Can take 4 optional parameters:
 *
 * Title, string, must be between 1-128 characters.
 *
 * Due, date, must be formated according to ISO 8601, defaults to null
 *
 * Position, number, positive integer, defaults to 0
 *
 * Completed, boolean, defaults to false
 *
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {Object} returns a single JSON object for a single todo
 */
async function patch(req, res) {
  return res.status(451).end();
}

/**
 * Middleware that handles delete requests to './:id'.
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {Object} returns 204 (no content) message if no error
 */
async function deleteID(req, res) {
  const { id } = req.params;

  console.info(`${apiPre}delete/${id}`);
  const validationResult = apiHelpers.validate.id(id);

  if (validationResult.length > 0) {
    return res.status(400).json({
      error: 'Bad Request',
      errorList: validationResult,
    });
  }

  // gets data
  const data = await todos.todoByID(id);
  // returns if no object is found
  if (isEmpty(data)) {
    return res.status(404).json({
      error: `No todo with id ${id} exists`,
    });
  }
  await todos.deleteById(id);

  return res.status(204).end();
}

async function setup(req, res) {
  console.info(`${apiPre}/setup`);

  setupDB().catch((err) => {
    console.error(err);
  });

  return res.status(204).json({
    message: 'Setup complete',
  });
}

router.get('/setup', catchErrors(setup));

router.get('/', catchErrors(get));
router.get('/:id', catchErrors(getID));
router.post('/', catchErrors(post));
router.patch('/:id', catchErrors(patch));
router.delete('/:id', catchErrors(deleteID));

module.exports = router;
