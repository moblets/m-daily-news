module.exports = function(data) {
  var today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  data.today = today;

  var news = data.news;
  // Insert default values and set greetings object
  news[0] = {
    type: 'greetings',
    id: today.getTime(),
    date: today,
    morning: {
      content: (data.goodMorning === undefined || data.goodMorning === '') ?
                'Bom dia 😀' :
                data.goodMorning,
      used: false
    },
    afternoon: {
      content: (data.goodAfternoon === undefined || data.goodAfternoon === '') ?
                'Boa tarde 😀' :
                data.goodAfternoon,
      used: false
    },
    evening: {
      content: (data.goodEvening === undefined || data.goodEvening === '') ?
                'Boa noite 😀' :
                data.goodEvening,
      used: false
    }
  };
  delete data.goodMorning;
  delete data.goodAfternoon;
  delete data.goodEvening;

  for (var i = news.length - 1; i >= 0; i--) {
    var date = new Date(news[i].formatedDate);

    // Only send news for today
    if (date.getTime() === today.getTime()) {
      news[i + 1] = {
        type: 'news',
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
      // Remove unused "more" news
      for (var j = news[i + 1].more.entries.length - 1; j >= 0; j--) {
        if (news[i + 1].more.entries[j].content === "") {
          news[i + 1].more.entries.splice([j], 1);
        }
      }
      // If it has no "more" news, delete the "more" object
      if (news[i + 1].more.entries.length === 0) {
        delete news[i + 1].more;
      }
    } else {
      news.splice([i + 1], 1);
    }
  }
  return data;
};
