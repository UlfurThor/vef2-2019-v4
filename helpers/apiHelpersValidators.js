const { isEmpty, isFull, isISODate, isPosInt } = require('./helpers');

/**
 * Validates id string, returns error if not a positive integer
 * @param {*} idVal
 */
function id(idVal) {
  const errors = [];
  if (isFull(idVal)) {
    if (!isPosInt(idVal)) {
      errors.push({
        field: 'id',
        error: 'id must be a valid integer value',
      });
    }
  }
  return errors;
}

/**
 * Validates completed input as boolean
 * @param {*} completedVal
 */
function completed(completedVal) {
  const errors = [];
  if (isFull(completedVal)) {
    if (typeof completedVal !== 'boolean') {
      errors.push({
        field: 'completed',
        error: 'completed must be boolean ',
      });
    }
  }

  return errors;
}

/**
 * Validates position string, must be either 'ascending' or 'descending'
 * @param {*} positionVal
 */
function position(positionVal) {
  const errors = [];
  if (isFull(positionVal)) {
    if (
      typeof positionVal !== 'string'
      || positionVal.length === 0
      || !(positionVal.toLowerCase() === 'ascending' || positionVal.toLowerCase() === 'descending')
    ) {
      errors.push({
        field: 'position',
        error: 'Position must be either "ascending" or "descending"',
      });
    }
  }
  return errors;
}

/**
 * Validates data for inserting/updating
 *
 * @param {String} titleVal Title, string, if post must be between 1-128 characters.
 * @param {String} dueVal Due, date, must be formated according to ISO 8601, defaults to null
 * @param {Number} positionVal Position, number, positive integer, defaults to 0
 * @param {Boolean} completedVal Completed, boolean, defaults to false
 * @param {Object} param optional parameters
 * @param {Boolean} param.post True if this is for a post request
 */
function data(titleVal, dueVal, positionVal, completedVal, param = {}) {
  const errors = [];

  if (isEmpty(titleVal) && param.post) {
    errors.push({
      field: 'title',
      error: 'There must be a title when creating a new todo',
    });
  }

  if (isFull(titleVal)) {
    if (typeof titleVal !== 'string' || titleVal.length === 0 || titleVal.length > 128) {
      errors.push({
        field: 'title',
        error: 'Title must be valid string between 1 and 128 characters',
      });
    }
  }

  if (isFull(dueVal)) {
    if (!isISODate(dueVal)) {
      errors.push({
        field: 'due',
        error: 'due must be a valid ISO 8601 date',
      });
    }
  }

  if (isFull(positionVal)) {
    if (!isPosInt(positionVal)) {
      errors.push({
        field: 'position',
        error: 'position must be a valid, positive, integer value',
      });
    }
  }

  if (isFull(completedVal)) {
    if (typeof completedVal !== 'boolean') {
      errors.push({
        field: 'completed',
        error: 'completed must be boolean ',
      });
    }
  }

  return errors;
}

module.exports = {
  id,
  completed,
  position,
  data,
};
