App.FirmaElectronica.FormDashboardAppUi = Ext.extend(Ext.form.FormPanel, {
    width: 1200,
    border: true,
    form: null,
    frame: true,
    labelAlign: 'top',
    initComponent: function() {
        this.initForm();
        this.items = [this.form];
        App.FirmaElectronica.FormDashboardAppUi.superclass.initComponent.call(this);
    },
    initForm: function() {
        this.form = {
            items: [{
                    xtype: 'container',
                    layout: 'column',
                    items: [{
                            xtype: 'container',
                            width: 730,
                            layout: 'form',
                            items: [
                                new App.FirmaElectronica.PanelDocumentosPorFirmar(),
                                new App.FirmaElectronica.PanelTabRegistroAcciones()
                            ]
                        }, {
                            xtype: 'container',
                            width: 455,
                            layout: 'form',
                            items: [
                                new App.FirmaElectronica.PanelDatosUsuario(),
                                new App.FirmaElectronica.PanelSubroganciasRegistradas()
                            ]
                        }]
                }]
        };
    }
});