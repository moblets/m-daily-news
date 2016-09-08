module.exports = function(data) {
  var news = data.news;
  for (var i = 0; i < data.news.length; i++) {
    if (news[i].formatedDate > Date.now()) {
      news[i] = null;
    }
  }
  return data;
};
