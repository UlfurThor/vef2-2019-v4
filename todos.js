const xss = require('xss');
const { query } = require('./db');

const todosSort = require('./helpers/todosSort');
const todosFilter = require('./helpers/todosFilter');
const { isFull } = require('./helpers/helpers');

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
 * @param {String} param.due Date in iso 8601 format
 * @param {Number} param.position Positive integer
 * @param {Boolean} param.completed
 */
async function insert(title, param = {}) {
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

/**
 * Inserts a new todo into the database
 * @param {String|Number} id
 * @param {Object} param optional parameters
 * @param {String} param.title
 * @param {String} param.due Date in iso 8601 format
 * @param {Number} param.position Positive integer
 * @param {Boolean} param.completed
 */
async function update(id, param = {}) {
  const result = await query('SELECT * FROM todos where id = $1', [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const changedColumns = [
    isFull(param.title) ? 'title' : null,
    isFull(param.due) ? 'due' : null,
    isFull(param.position) ? 'position' : null,
    isFull(param.completed) ? 'completed' : null,
  ].filter(Boolean);

  const changedValues = [
    isFull(param.title) ? xss(param.title) : null,
    isFull(param.due) ? xss(param.due) : null,
    isFull(param.position) ? xss(param.position) : null,
    isFull(param.completed) ? xss(param.completed) : null,
  ].filter(Boolean);

  const updates = [id, ...changedValues];

  const updatedColumnsQuery = changedColumns.map((column, i) => `${column} = $${i + 2}`);
  updatedColumnsQuery.push('updated = current_timestamp');

  const q = `
  UPDATE todos
  SET
    ${updatedColumnsQuery.join(', ')}
  WHERE id = $1
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
  update,
  sort: todosSort,
  filter: todosFilter,
};
