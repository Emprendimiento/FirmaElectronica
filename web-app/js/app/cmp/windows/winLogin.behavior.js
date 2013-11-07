App.FirmaElectronica.WinLogin = Ext.extend(App.FirmaElectronica.WinLoginUi, {
    initComponent: function() {
        this.addEvents('ingresar');
        App.FirmaElectronica.WinLogin.superclass.initComponent.call(this);
        this.on('ingresar', this.ingresar, this);
    },
    ingresar: function() {
        var me = this;
        var data = me.form.getForm().getFieldValues();
        var jsonResponse;
        if (me.form.getForm().isValid()) {
            new App.FirmaElectronica.ViewPort();
            me.close();
            /*
             me.form.getForm().submit({
             url : 'usuario/getLogin',
             success : function(resp, opt){
             jsonResponse = Ext.util.JSON.decode(opt.response.responseText);
             INIT_SESION(jsonResponse.data);
             new App.FirmaElectronica.view.ViewPort();
             me.close();
             },
             failure : function(resp, opt){
             jsonResponse = Ext.util.JSON.decode(opt.response.responseText);
             Ext.Msg.show({
             title: 'Info',
             msg: jsonResponse.info,
             buttons: Ext.MessageBox.OK,
             icon: Ext.MessageBox.INFO
             });
             }
             });
             */
        }else {
            Ext.Msg.show({
                title: 'Info',
                msg: 'Existen datos que debe completar',
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.INFO
            });
        }
        this.close();
    }
});