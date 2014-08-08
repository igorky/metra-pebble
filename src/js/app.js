var UI = require("ui");
var ajax = require("ajax");

var formatTime = function (date) {
  var hour = date.getHours();
  var minute = date.getMinutes();
  var timeOfDay;

  if (minute < 10) {
    minute = "0" + minute.toString();
  } else {
    minute = minute.toString();
  }

  if (hour < 12) {
    timeOfDay = "AM";
  } else {
    hour = hour - 12;
    timeOfDay = "PM";
  }

  if (hour === 0) {
    hour = 12;
  }

  return hour.toString() + ":" + minute + " " + timeOfDay;
};

var findNextTrain = function (data) {
  var now = new Date();

  for (i=1; i < 10; i++) {
    var trainData = data["train" + i.toString()]
    var departure = new Date(trainData.scheduled_dpt_time);

    if (now < departure) {
      return trainData;
    }
  }

  return data.train1;
};

var main = new UI.Card({
  title: "Loading",
  body: "Loading..."
});

main.show();

var toCentral = {
  url: "http://metrarail.com/content/metra/en/home/jcr:content/trainTracker.get_train_data.json?line=UP-N&origin=OTC&destination=CENTRALST&directionId=1",
  type: "json"
};

var fromCentral = {
  url: "http://metrarail.com/content/metra/en/home/jcr:content/trainTracker.get_train_data.json?line=UP-N&origin=CENTRALST&destination=OTC&directionId=1",
  type: "json"
};

var toWilmette = {
  url: "http://metrarail.com/content/metra/en/home/jcr:content/trainTracker.get_train_data.json?line=UP-N&origin=OTC&destination=WILMETTE&directionId=1",
  type: "json"
};

var fromWilmette = {
  url: "http://metrarail.com/content/metra/en/home/jcr:content/trainTracker.get_train_data.json?line=UP-N&destination=OTC&origin=WILMETTE&directionId=1",
  type: "json"
};

var body = "";

ajax(fromCentral, function (data) {
  var next = findNextTrain(data);
  var departure = new Date(next.scheduled_dpt_time);

  body += "C -> O " + formatTime(departure) + "\n";

  ajax(fromWilmette, function (data) {
    var next = findNextTrain(data);
    var departure = new Date(next.scheduled_dpt_time);

    body += "W -> O " + formatTime(departure) + "\n";

    ajax(toCentral, function (data) {
      var next = findNextTrain(data);
      var departure = new Date(next.scheduled_dpt_time);

      body += "O -> C " + formatTime(departure) + "\n";

      ajax(toWilmette, function (data) {
        var next = findNextTrain(data);
        var departure = new Date(next.scheduled_dpt_time);

        body += "O -> W " + formatTime(departure);

        main.title("Metra Times");
        main.body(body);
      });
    });
  });
});
