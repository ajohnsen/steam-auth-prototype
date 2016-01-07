var app = require('app');
var Tray = require('tray');
var Menu = require('menu');
var path = require('path');
var BrowserWindow = require('browser-window');
var dialog = require('dialog');
var clipboard = require('clipboard');
var SteamTotp = require('steam-totp');
var smalltalk = require('smalltalk');

var iconPath = path.join(__dirname, 'icon.png');
var appIcon = null;
var win = null;

const Configstore = require('configstore');
const pkg = require('./package.json');

// Init a Configstore instance with an unique ID e.g.
// package name and optionally some default values
const conf = new Configstore(pkg.name, {foo: 'bar'});

conf.set("accounts", []);
require('crash-reporter').start({companyName: 'Test'});
app.on('ready', function(){
  win = new BrowserWindow({show: false});
  optionWindow = new BrowserWindow({height: 300, width: 360, frame: true, show: false})
  optionWindow.loadURL('file://' + __dirname + '/options.html');
  optionWindow.on('closed', function() {

  })

  var updateContextMenu = function() {
    var text = "Account1: "+ SteamTotp.getAuthCode('GHEheuagwhawagwaG') +"\nAccount2: "+ SteamTotp.getAuthCode('GHEheuagwhawGG');
    appIcon.setToolTip(text);
    var accounts = conf.get("accounts");
    if (accounts === undefined || accounts === null || accounts === "") {
      accounts = [];
    }
    console.log(accounts);
    var menu = [];
    for(var i = 0; i < accounts.length; i++) {
      var account = accounts[i];
      menu.push({ label: account.name, click: function() { clipboard.writeText(SteamTotp.getAuthCode(account.secret))}});
    }
    menu.push({
                type: 'separator'
            })

    var updateButton = {
      label: 'Update',
      click: function() {
        appIcon.setContextMenu(updateContextMenu());
        optionWindow.show();
      }
    }
    menu.push(updateButton);

    var quitButton = {
      label: 'Quit',
      selector: 'terminate:',
    }

    menu.push(quitButton);
    console.log(menu);

    return Menu.buildFromTemplate(menu);
  }


  const ipcMain = require('electron').ipcMain;
  ipcMain.on('addAccount', function(event, args) {
    var accounts = conf.get("accounts");
    if (accounts === undefined || accounts === null || accounts === "") {
      accounts = [];
    }
    accounts.push(args);
    conf.set('accounts', accounts);
    var contextMenu = updateContextMenu();
    appIcon.setContextMenu(contextMenu);
    event.returnValue = conf.get('accounts');
  })
  ipcMain.on('getAccounts', function(event, args) {
    var accounts = conf.get('accounts');
    event.returnValue = accounts;
  })



  appIcon = new Tray(iconPath);

  appIcon.on('click', function() {
    var contextMenu = updateContextMenu();
    appIcon.setContextMenu(contextMenu);
  })


  var contextMenu = updateContextMenu();
  var text = "Account1: "+ SteamTotp.getAuthCode('GHEheuagwhawagwaG') +"\nAccount2: "+ SteamTotp.getAuthCode('GHEheuagwhawGG');
  appIcon.setToolTip(text);
  appIcon.setContextMenu(contextMenu);
  setInterval(function() {
    //appIcon.setContextMenu(updateContextMenu());
  },1000)
});
