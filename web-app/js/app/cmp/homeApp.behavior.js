App.FirmaElectronica.HomeApp = Ext.extend(App.FirmaElectronica.HomeAppUi, {
    initComponent: function() {
        this.addEvents('cerrarSesion');
        App.FirmaElectronica.HomeApp.superclass.initComponent.call(this);
        this.on('cerrarSesion', this.cerrarSesion, this);
    },
    cerrarSesion: function() {
        document.location = './';
    }
});