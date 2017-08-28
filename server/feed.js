module.exports = function(data) {
  var spTimeString = new Date().toLocaleString(
    'en-US', {timeZone: 'America/Sao_Paulo'}
  );
  // FIX TODO test other dates
  // spTimeString = '8/27/2017, 10:14:55 AM';
  // FIX
  // console.log(spTimeString);
  data.today = new Date(spTimeString);
  data.today.setHours(0, 0, 0, 0);
  var todayDay = data.today.getDate() + '-' + data.today.getMonth() + '-' +
  data.today.getFullYear();
  data.todayDay = todayDay;
  data.showWelcome = true;
  data.errorDates = [];

  var news = data.news;
  for (var i = news.length - 1; i >= 0; i--) {
    var date = new Date(news[i].formatedDate);

    var dateDay = date.getDate() + '-' + date.getMonth() + '-' +
                  date.getFullYear();
    // Only send news for today
    if (dateDay === todayDay) {
      news[i] = {
        id: news[i].id,
        // NEW TODO delete in a future version
        date: date,
        testDate: dateDay,
        testToday: todayDay,
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
      data.errorDates.push(dateDay);
    }
  }

  if (data.news.length === 0) {
    var noNews = {
      date: data.today,
      todayDay: todayDay,
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
