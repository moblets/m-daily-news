module.exports = function(data) {
  for (var i = 0; i < data.news.length; i++) {
    if (new Date(data.news[i].formatedDate) > Date.now()) {
      delete data.news[i];
    }
  }
  return data;
};
