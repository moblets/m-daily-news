	module.exports = function(data) {
  var news = data.news;

  var today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  data.today = today;

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
              content: news[i].entries_content_1,
              link: news[i].entries_link_1
            },
            {
              content: news[i].entries_content_2,
              link: news[i].entries_link_2
            },
            {
              content: news[i].entries_content_3,
              link: news[i].entries_link_3
            },
            {
              content: news[i].entries_content_4,
              link: news[i].entries_link_4
            }
          ]
        },
        next: {
          content: news[i].next,
          used: false
        }
      };
    } else {
      news.splice([i], 1);
    }
  }
  return data;
};
