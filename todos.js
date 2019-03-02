const xss = require('xss');
const { query } = require('./db');

const todosSort = require('./helpers/todosSort');
const todosFilter = require('./helpers/todosFilter');
const { isEmpty, isFull } = require('./helpers/helpers');

/**
 * Returns a list of todos, sorted by id
 */
async function list() {
  const result = await query(`
  SELECT *
  FROM TODOS
  ORDER BY id
  ;
  `);

  return result.rows;
}

/**
 * Returns a single todo, selected by id
 * @param {Number|String} id
 */
async function todoByID(id) {
  const result = await query(
    `
      SELECT *
      FROM TODOS
      WHERE id = $1
      ;
    `,
    [id],
  );

  return result.rows[0];
}

/**
 * Deletes a single todo based on id
 * @param {Number|String} id
 */
async function deleteById(id) {
  const result = await query(
    `
      DELETE
      FROM TODOS
      WHERE id = $1
      ;
    `,
    [id],
  );

  return result.rows[0];
}

/**
 * Inserts a new todo into the database
 * @param {String} title
 * @param {Object} param optional parameters
 */
async function insert(title, param = {}) {
  console.log('insert');
  console.log(title);
  console.log(param);

  const changedColumns = [
    isFull(param.due) ? 'due' : null,
    isFull(param.position) ? 'position' : null,
    isFull(param.completed) ? 'completed' : null,
  ].filter(Boolean);

  const changedValues = [
    isFull(param.due) ? xss(param.due) : null,
    isFull(param.position) ? xss(param.position) : null,
    isFull(param.completed) ? xss(param.completed) : null,
  ].filter(Boolean);

  const updates = [title, ...changedValues];

  const updatedColumnsQuery = changedColumns.map((column, i) => `$${i + 2}`);

  const q = `
  INSERT
  INTO todos
  (title${changedColumns !== [] ? ', ' : ''}${changedColumns.join(', ')})
  VALUES ($1${updatedColumnsQuery !== [] ? ', ' : ''}${updatedColumnsQuery.join(', ')})
  RETURNING *;
  `;

  const updateResult = await query(q, updates);
  return updateResult.rows[0];
}

module.exports = {
  list,
  todoByID,
  deleteById,
  insert,
  sort: todosSort,
  filter: todosFilter,
};
