app.controller("OptionsController", function($scope) {
  var ipcRenderer = require('ipc');

  $scope.accounts = [];
  $scope.name = "";
  $scope.secret = "";


  $scope.update = function() {

    var accounts = ipcRenderer.sendSync('getAccounts', 'ping');
    console.log(accounts);
    if (accounts === undefined || accounts === null || accounts === "") {
      return;
    }
    $scope.accounts = accounts;
  }

  $scope.addAccount = function() {
    var account = {name: $scope.name, secret: $scope.secret};
    ipcRenderer.sendSync('addAccount', account);
    $scope.name = "";
    $scope.secret = "";
    $scope.update();
  }

  $scope.update();

})
