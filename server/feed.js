module.exports = function(data) {
  var spTimeString = new Date().toLocaleString(
    'en-US', {timeZone: 'America/Sao_Paulo'}
  );
  data.today = new Date(spTimeString);
  data.today.setHours(0, 0, 0, 0);

  data.showWelcome = true;

  var news = data.news;
  for (var i = news.length - 1; i >= 0; i--) {
    var date = new Date(news[i].formatedDate);

    // Only send news for today
    if (date.getTime() === data.today.getTime()) {
      news[i] = {
        id: news[i].id,
        // TODO delete
        date: date,
        highlight: {
          content: news[i].highlight,
          // TODO delete
          used: false,
          // TODO delete
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
          // TODO delete
          used: false,
          // TODO delete
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

  if (data.news.length === 0) {
    var noNews = {
      date: data.today,
      noNews: true,
      highlight: {
        content: data.noNews,
        show: true,
        used: true
      }
    };
    data.news.push(noNews);
  }

  if (data.tutorialImages !== undefined && data.tutorialImages.length > 0) {
    data.tutorial = data.tutorialImages.split('\n');
    delete data.tutorialImages;
  }

  return data;
};
