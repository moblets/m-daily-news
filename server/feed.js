module.exports = function(data) {
  var news = data.news;
  for (var i in news) {
    if (news.hasOwnProperty(i)) {
      if (news[i].formatedDate > Date.now()) {
        news[i] = null;
      }
    }
  }
  return data;
};
