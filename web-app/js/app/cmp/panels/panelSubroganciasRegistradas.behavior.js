App.FirmaElectronica.PanelSubroganciasRegistradas = Ext.extend(App.FirmaElectronica.PanelSubroganciasRegistradasUi, {
    initComponent : function(){
        this.addEvents('verDetalle');
        App.FirmaElectronica.PanelSubroganciasRegistradas.superclass.initComponent.call(this);
        this.on('verDetalle', this.verDetalle, this);
    },
    verDetalle : function(){
        var sm = this.grid.getSelectionModel();
        var itemSeleccionado = null;
        if(!sm.getCount())
            Ext.Msg.alert('Info', 'Debe seleccionar un registro.');
        else{
            itemSeleccionado = sm.getSelected();
        }
    }
});