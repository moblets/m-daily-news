module.exports = function(data) {
  for (var i = 0; i < data.news.length; i++) {
		// Only send news older than today
    if (new Date(data.news[i].formatedDate) > Date.now()) {
      data.news.splice(i, 1);
    }
  }
  return data;
};
