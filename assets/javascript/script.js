$(document).ready(function() {
    $("#search-btn").on("click", function() {
      var searchValue = $("#search-val").val();
  
      // INPUT CLEAR
      $("#search-val").val("");
  
      searchWeather(searchValue);
    });
  
    $(".history").on("click", "li", function() {
      searchWeather($(this).text());
    });
  
    function makeRow(text) {
      var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
      $(".history").append(li);
    }
  
    function searchWeather(searchValue) {
      $.ajax({
        type: "GET",
        url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=cc75177dd9f0c2642683bbb98b276f16&units=imperial",
        dataType: "json",
        success: function(data) {

          // SEARCH HISTORY
          if (history.indexOf(searchValue) === -1) {
            history.push(searchValue);
            window.localStorage.setItem("history", JSON.stringify(history));
      
            makeRow(searchValue);
          }
          
          // CLEAR OLD CONTENT
          $("#today").empty();
  
          // CURRENT WEATHER INFO
          var title= $("<h4>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
          var card = $("<div>").addClass("card");
          var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
          var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
          var temp= $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
          var cardBody = $("<div>").addClass("card-body");

          var img =$("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
  
          // MERGE ELEMENTS AND POST TO PAGE
          title.append(img);
          cardBody.append(title, temp, humid, wind);
          card.append(cardBody);
          $("#today").append(card);
  
          getForecast(searchValue);
          getUVIndex(data.coord.lat, data.coord.lon);
        }
      });
    }
    
    function getUVIndex(lat, lon) {
      $.ajax({
        type: "GET",
        url: "http://api.openweathermap.org/data/2.5/uvi?appid=cc75177dd9f0c2642683bbb98b276f16&lat=" + lat + "&lon=" + lon,
        dataType: "json",
        success: function(data) {
          var uv = $("<p>").text("UV Index: ");
          var btn = $("<span>").addClass("btn btn-sm").text(data.value);
          
          // BOOTSTRAP CLASS CHANGES COLOR OF UV BUTTON -- GREEN OK, YELLOW MODERATE, RED DANGER
          if (data.value < 3) {
            btn.addClass("btn-success");
          }
          else if (data.value < 7) {
            btn.addClass("btn-warning");
          }
          else {
            btn.addClass("btn-danger");
          }
          
          $("#today .card-body").append(uv.append(btn));
        }
      });
    }


    function getForecast(searchValue) {
      $.ajax({
        type: "GET",
        url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=cc75177dd9f0c2642683bbb98b276f16&units=imperial",
        dataType: "json",
        success: function(data) {
          
          // REPLACE CONTENT
          $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");
  
          // LOOP FORECASTS
          for (var i = 0; i < data.list.length; i++) {
            // 3PM FORECASTS
            if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
              // BOOTSTRAP CARDS
              var col = $("<div>").addClass("col-md-2");
              var card = $("<div>").addClass("card bg-warning text-white");
              var body = $("<div>").addClass("card-body p-2");
  
              var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
  
              var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
  
              var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
              var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
  
              // MERGE & POST TO PAGE
              col.append(card.append(body.append(title, img, p1, p2)));
              $("#forecast .row").append(col);
            }
          }
        }
      });
    }
  

  
    // GET HISTORY
    var history = JSON.parse(window.localStorage.getItem("history")) || [];
  
    if (history.length > 0) {
      searchWeather(history[history.length-1]);
    }
  
    for (var i = 0; i < history.length; i++) {
      makeRow(history[i]);
    }
  });
  