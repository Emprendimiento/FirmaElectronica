/**
 * Bootstrap/loader de la aplicacion
 *
 */
Ext.onReady(function(){
    Ext.QuickTips.init();
    new App.FirmaElectronica.WinLogin().show();
});