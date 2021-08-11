

$(document).ready(function() {
    $("#search-btn").on("click", function() {
      var searchVal= $("#search-val").val();
  
      // INPUT CLEAR
      $("#search-val").val("");
  
      weatherSearch(searchVal);

      //console.log(searchVal);
      //Next step: configure the search to include a state selector, setting values to ISO 3166-2:US (see https://en.wikipedia.org/wiki/ISO_3166-2:US)
      //api.openweathermap.org/data/2.5/weather?q={city name},{state code}&appid={API key}

    });
  


    $(".history").on("click", "li", function() {
      weatherSearch($(this).text());
    });
  
    function makeRow(text) {
      var li = $("<li>").addClass("text-muted list-group-item-action list-group-item").text(text);
      $(".history").append(li);
    }
  
// -------------------------------
    
// TODAY (MAIN) WEATHER INFO

    function weatherSearch(searchVal) {

      $.ajax({
        type: "GET",

        // api key cc75177dd9f0c2642683bbb98b276f16
        url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchVal + "&appid=cc75177dd9f0c2642683bbb98b276f16&units=imperial", 
        dataType: "json",
        success: function(data) {

          // SEARCH HISTORY/LOCAL STORAGE
          if (history.indexOf(searchVal) === -1) {
            history.push(searchVal);
            window.localStorage.setItem("history", JSON.stringify(history));
      
            makeRow(searchVal);
          }
          
          // CLEAR PREVIOUS
          $("#today").empty();
  
          // CURRENT WEATHER INFO
          var title= $("<h4>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
          var card= $("<div>").addClass("card");
          var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
          var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
          var temp= $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " F");

          var cardFull = $("<div>").addClass("card-body");

          // weather icon
          var img =$("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
  
          // MERGE ELEMENTS AND POST TO PAGE
          title.append(img);
          cardFull.append(title, temp, humid, wind);
          card.append(cardFull);
          $("#today").append(card);
  
          getFC(searchVal);
          getUV(data.coord.lat, data.coord.lon);
        }
      });
    }
    
// -------------------------------



// UV INDEX

    function getUV(lat, lon) {
      $.ajax({
        type: "GET",

        // api key cc75177dd9f0c2642683bbb98b276f16
        url: "https://api.openweathermap.org/data/2.5/uvi?appid=cc75177dd9f0c2642683bbb98b276f16&lat=" + lat + "&lon=" + lon,
        dataType: "json",
        success: function(data) {
          var uv = $("<p>").text("UV Index: ");
          var btn = $("<span>").addClass("btn btn-sm").text(data.value);
          
          // BOOTSTRAP CLASS CHANGES COLOR OF UV BUTTON
          //GREEN OUTLINE FAVORABLE (SUCCESS), YELLOW OUTLINE MODERATE (WARNING), RED OUTLINE SEVERE (DANGER), RED SOLID VERY SEVERE (DANGER)

          if (data.value < 3) {
            btn.addClass("btn-outline-success");
          }
          else if (data.value < 6) {
            btn.addClass("btn-outline-warning");
          }
          else if (data.value < 8) {
            btn.addClass("btn-outline-danger")
          }
          else {
            btn.addClass("btn-danger");
          }
          
          $("#today .card-body").append(uv.append(btn));
        }
      });
    }

// -------------------------------    



// 5-DAY FORECAST

    function getFC(searchVal) {
      $.ajax({

        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchVal + "&appid=cc75177dd9f0c2642683bbb98b276f16&units=imperial",
        dataType: "json",
        success: function(data) {
          
          // REPLACE CONTENT
          $("#forecast").html("<h4 class=\"mt-2\">5 Day Forecast</h4>").append("<div class=\"row\">");
  
          // LOOP FORECASTS
          for (var i = 0; i < data.list.length; i++) {
            // 3PM FORECASTS

            if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) { // TRY OTHER TIME RANGES

              // BOOTSTRAP CARDS
              var col = $("<div>").addClass("col-md-2");
              var body = $("<div>").addClass("card-body p-2");
              var card = $("<div>").addClass("text-white card bg-secondary");
  
              var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
              
              var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " F");
              var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

              // weather icon image
              var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
  
              // MERGE & POST TO PAGE
              col.append(card.append(body.append(title, img, p1, p2)));
              $("#forecast .row").append(col);
            }
          }
        }
      });
    }

// -------------------------------



// GET HISTORY/LOCAL STORAGE

    var history = JSON.parse(window.localStorage.getItem("history")) || [];
  
    if (history.length > 0) {
      weatherSearch(history[history.length-1]); 
    
    }
  
    for (var i = 0; i < history.length; i++) {
      makeRow(history[i]);
    }
  });

// -------------------------------  