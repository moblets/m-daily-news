module.exports = {
  /**
   * Validate a given address as a valid Google Maps address
   * @param {Object}   news Object with one of the news
   * @param {Function} callback The callback that will be called when the
   * validation finishes. The callback parameters are a Boolean, that responds
   * if it's valid and an Object with the response data
   */
  news: function(news, callback) {
    var valid = false;
    var response = {};
    var date = new Date(news.date + ' 00:00:00 GMT-0000');

    if (validDate(date)) {
      valid = true;
      response = {
        data: {
          formatedDate: date
        }
      };
    } else {
      valid = false;
      response = {
        errors: {
          date: 'error_date'
        }
      };
    }
    callback(valid, response);
  }
};

/**
 * Get Google Maps data for a given address
 @param  {Date}   date  The date to be validated
 @return {Boolean} true if date is valid
 */
function validDate(date) {
  var response = false;
  if (Object.prototype.toString.call(date) && !isNaN(date.getTime())) {
    response = true;
  }
  return response;
}
