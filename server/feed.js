module.exports = function(data) {
  var spDate = new Date().toLocaleString(
    'en-US',
    {
      timeZone: 'America/Sao_Paulo'
    });
  var today = new Date(spDate.split(',')[0] + ' 00:00:00 GMT-0000');
  data.today = today;

  data.showWelcome = true;

  var news = data.news;
  for (var i = news.length - 1; i >= 0; i--) {
    var date = new Date(news[i].formatedDate);

    // Only send news for today
    if (date.getTime() === today.getTime()) {
      news[i] = {
        id: news[i].id,
        date: news[i].formatedDate,
        highlight: {
          content: news[i].highlight,
          used: false,
          show: false,
          link: news[i].link
        },
        more: {
          content: news[i].more,
          used: false,
          entries: [
            {
              content: news[i].entriesContent1,
              link: news[i].entriesLink1
            },
            {
              content: news[i].entriesContent2,
              link: news[i].entriesLink2
            },
            {
              content: news[i].entriesContent3,
              link: news[i].entriesLink3
            },
            {
              content: news[i].entriesContent4,
              link: news[i].entriesLink4
            }
          ]
        },
        next: {
          content: news[i].next,
          used: false,
          hide: false
        }
      };
      // Remove unused "more" news
      for (var j = news[i].more.entries.length - 1; j >= 0; j--) {
        if (news[i].more.entries[j].content === "") {
          news[i].more.entries.splice([j], 1);
        }
      }
      // If it has no "more" news, delete the "more" object
      if (news[i].more.entries.length === 0) {
        delete news[i].more;
      }
    } else {
      news.splice([i], 1);
    }
  }
  return data;
};
