App.FirmaElectronica.HomeAppUi = Ext.extend(Ext.Panel, {
    title: 'Firma Electr&oacute;nica de Documentos',
    iconCls: 'icon-titulo-app',
    width: 1200,
    frame: false,
    border: true,
    tbar: null,
    initComponent: function() {
        this.initTbar();
        this.items = [
            new App.FirmaElectronica.FormDashboardApp()
        ];
        App.FirmaElectronica.HomeAppUi.superclass.initComponent.call(this);
    },
    initTbar: function() {
        this.tbar = ['->',
            'Bienvenido John Connor' /*+ USER_NOMBRES + ' ' + USER_APELLIDOS*/,
            '-', {
                text: 'Cerrar Sesi&oacute;n',
                iconCls: 'icon-cerrar-sesion',
                tooltip: 'Salir del Sistema',
                scope: this,
                scale: 'medium',
                cmpEvent: 'cerrarSesion'
            }
        ];
    }
});