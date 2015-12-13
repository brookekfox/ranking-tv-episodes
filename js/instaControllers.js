angular.module("imdb", [])
.controller("ImdbController", ["$scope", "RequestService", function ($scope, RequestService) {
  $scope.series = {
    // title: "",
    // rating: "",
    // seasons: [],
    // episodes: []
  };

  $scope.sendImdbRequest = function(title) {
    RequestService.fetch(title).then(function(response) {
      console.log(response);
      $scope.series = response;
      // $scope.series.title = response.title;
      // $scope.series.rating = response.imdbRating;
      // $scope.series.seasons = response.seasons;
      // $scope.series.episodes = response.episodes;
      // $scope.series.episodes = response.episodes.sort(function (a, b) {
      //   return b.rating - a.rating;
      // });
      console.log($scope.series);
    });
  }
}])
.factory("RequestService", ["$q", function($q){
  return {
    fetch: function(title) {
      var defer = $q.defer();
      var series = {
        title: title,
        imdbId: "",
        imdbRating: "",
        seasons: [],
        episodes: [],
        episodeIds: []
      };
      $.ajax({
        type: "GET",
        dataType: "jsonp",
        cache: false,
        url: "http://www.omdbapi.com/?t=" + series.title.replace(/\s/g, "+") + "&r=json",
        success: function (response) {
          series.title = response.Title;
          series.imdbId = response.imdbID;
          series.imdbRating = response.imdbRating;
          var url = "http://www.myapifilms.com/imdb?idIMDB=" + series.imdbId.toString() + "&format=JSONP&seasons=1";

          $.ajax({
            type: "GET",
            dataType: "jsonp",
            cache: false,
            url: url,
            success: function (response) {
              series.seasons = response.seasons;
              series.seasons.forEach((season) => {
                season.episodes.forEach((episode) => {
                  series.episodeIds.push(episode.idIMDB);
                });
              });
              // for (var j = 0; j < series.seasons.length; j++) {
              //   var thisSeason = series.seasons[j];
              //   for (var k = 0; k < thisSeason.episodes.length; k++) {
              //     var id = thisSeason.episodes[k].idIMDB
              //     $.ajax({
              //       type: "GET",
              //       dataType: "jsonp",
              //       cache: false,
              //       url: "http://www.omdbapi.com/?i=" + id + "&r=json",
              //       success: function (response) {
              //         console.log(response);
              //         // $scope.series.episodes.push({
              //         //   title: response.Title,
              //         //   season: response.Season,
              //         //   episode: response.Episode,
              //         //   rating: parseFloat(response.imdbRating),
              //         //   imdbID: response.imdbID
              //         // });
              //         series.episodes.push(response);
              //       }
              //     });
              //   }
              // }

              series.episodeIds.forEach((id) => {
                $.ajax({
                  type: "GET",
                  dataType: "jsonp",
                  cache: false,
                  async: false,
                  url: "http://www.omdbapi.com/?i=" + id + "&r=json",
                  success: function (response) {
                    if (response.imdbRating != "N/A") {
                      series.episodes.push({
                        title: response.Title,
                        season: response.Season,
                        episode: response.Episode,
                        rating: parseFloat(response.imdbRating)
                      });
                    }
                  }
                });
              });
              defer.resolve(series);
            }
          });
        }
      });
      return defer.promise;
    }
  }
}]);
