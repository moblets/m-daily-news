	module.exports = function(data) {
  var news = data.news;

  var today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  data.today = today;

  for (var i = news.length - 1; i >= 0; i--) {
    var date = new Date(news[i].formatedDate);

    // Only send news for today
    if (date.getTime() !== today.getTime()) {
      news.splice([i], 1);
    }
  }
  return data;
};
