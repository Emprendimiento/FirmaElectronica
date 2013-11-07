App.FirmaElectronica.PanelDatosUsuarioUi = Ext.extend(Ext.Panel, {
    title: 'Informaci&oacute;n de mi cuenta',
    iconCls: 'icon-usuario-app',
    height: 238,
    //width: 350,
    layout: 'fit',
    frame: false,
    border: true,
    autoScroll: true,
    tbar: [{
            text: 'Contraseña',
            iconCls: 'icon-pass',
            scale: 'small',
            tooltip: 'Modificar su contraseña',
            scope: this,
            scale : 'small',
                    cmpEvent: 'editarPassword'
        }, '-', {
            text: 'Datos Personales',
            iconCls: 'icon-usuario-datos-personales',
            scale: 'small',
            tooltip: 'Modificar sus datos personales',
            scope: this,
            scale : 'small',
                    cmpEvent: 'editarDatosPersonales'
        }, '-', {
            text: 'Subrogancia',
            iconCls: 'icon-subrogancia',
            scale: 'small',
            tooltip: 'Solicitar Subrogancia al administrador del Sistema',
            scope: this,
            scale : 'small',
                    cmpEvent: 'solicitarSubrogancia'
        }],
    formDatosUsuario: null,
    initComponent: function() {
        this.initFormDatosUsuario();
        this.items = [this.formDatosUsuario];
        App.FirmaElectronica.PanelDatosUsuarioUi.superclass.initComponent.call(this);
    },
    initFormDatosUsuario: function() {
        this.formDatosUsuario = new Ext.form.FormPanel({
            frame: true,
            border: false,
            labelWidth: 130,
            height: 238,
            labelAlign: 'top',
            items: [{
                    xtype: 'fieldset',
                    title: 'Informaci&oacute;n General',
                    items: [/*{
                            xtype: 'container',
                            layout: 'column',
                            items: [{
                                    xtype: 'container',
                                    width: 200,
                                    layout: 'form',
                                    items: [{
                                            xtype: 'textfield',
                                            fieldLabel: 'N&#176; Documento',
                                            name: 'numeroDocumento',
                                            id: 'numeroDocumentoId',
                                            width: 180,
                                            blankText: 'Debe completar esta informaci&oacute;n.'
                                        }]
                                }, {
                                    xtype: 'container',
                                    width: 200,
                                    layout: 'form',
                                    items: [{
                                            xtype: 'datefield',
                                            format: 'd/m/Y',
                                            fieldLabel: 'Fecha Comisi&oacute;n de Falta(*)',
                                            name: 'fechaComisionDeFalta',
                                            id: 'fechaComisionDeFaltaId',
                                            width: 180,
                                            allowBlank: false,
                                            blankText: 'Debe completar esta informaci&oacute;n.'
                                        }]
                                }]
                        }*/]
                }]
        });
    }
});