/**
 * ViewPort
 * Contenedor principal de la aplicacion
 */
App.FirmaElectronica.ViewPort = Ext.extend(Ext.Viewport,{
    layout : 'border',
    renderTo : Ext.getBody(),
    monitorResize : true,
    initComponent : function(){
        this.items = this.getSecciones();
        App.FirmaElectronica.ViewPort.superclass.initComponent.call(this);
    },
    getSecciones : function(){
        return [{
            id : 'panelCentral',
            region : 'center',
            border : false,
            items : [
//                new App.FirmaElectronica.HomeApp({style : 'position:absolute;left: 25%;margin-left: -495px;'})
                new App.FirmaElectronica.HomeApp({style : 'position:absolute;left: 50%;margin-left: -595px;'})
//                new App.FirmaElectronica.HomeApp()
            ]
        }];
    }
});