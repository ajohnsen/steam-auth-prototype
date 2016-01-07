var app = require('app');
var Tray = require('tray');
var Menu = require('menu');
var MenuItem = require('menu-item');
var path = require('path');
var BrowserWindow = require('browser-window');
var clipboard = require('clipboard');
var SteamTotp = require('steam-totp');

var iconPath = path.join(__dirname, 'key_icon.png');
var appIcon = null;
var win = null;

const Configstore = require('configstore');
const pkg = require('./package.json');

// Init a Configstore instance with an unique ID e.g.
// package name and optionally some default values
const conf = new Configstore(pkg.name, {foo: 'bar'});

require('crash-reporter').start({companyName: 'Test'});
app.on('ready', function(){
  win = new BrowserWindow({show: false});
  optionWindow = new BrowserWindow({height: 300, width: 360, frame: true, show: false})
  optionWindow.loadURL('file://' + __dirname + '/options.html');
  optionWindow.on('closed', function() {

  })

  SteamTotp.getTimeOffset(function (error, time, latency) {
    console.log("Steam error: " + error);
    console.log("Steam offset: " + time);
    console.log("Steam latency: " + latency);
    SteamTotp.time(time);
  });

  var copyAuthToClipboard = function(secret) {
    var authCode = SteamTotp.getAuthCode(secret)
    console.log(secret);
    console.log(authCode);
    clipboard.writeText(authCode);
  }
  var updateContextMenu = function() {
    var text = "Account1: "+ SteamTotp.getAuthCode('GHEheuagwhawagwaG') +"\nAccount2: "+ SteamTotp.getAuthCode('GHEheuagwhawGG');
    appIcon.setToolTip(text);
    var accounts = conf.get("accounts");
    if (accounts === undefined || accounts === null || accounts === "") {
      accounts = [];
    }
    console.log(accounts);
    var menu = new Menu();

    accounts.forEach(function(account) {
      menu.append(new MenuItem(
        {
          label: account.name,
          click: function() {
            var authCode = SteamTotp.getAuthCode(account.secret);
            console.log(account);
            console.log(authCode);
            clipboard.writeText(authCode)
          }
        }));
    })

    menu.append(new MenuItem({
                type: 'separator'
            }));

    var updateButton = new MenuItem({
      label: 'Update',
      click: function() {
        appIcon.setContextMenu(updateContextMenu());
        optionWindow.show();
      }
    })
    menu.append(updateButton);

    var quitButton = new MenuItem({
      label: 'Quit',
      selector: 'terminate:',
    })

    menu.append(quitButton);
    console.log("MENU")
    console.log(menu);
    return menu;
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
