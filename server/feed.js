	module.exports = function(data) {
  for (var i = 0; i < data.news.length; i++) {
		// Only send news older than today
    var date = new Date(data.news[i].formatedDate);
    data.news[i].theDate = date;

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    data.today = today;

    // if (date !== today) {
      // data.news.splice(i, 1);
    // }
  }
  return data;
};
