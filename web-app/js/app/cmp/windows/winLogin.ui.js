App.FirmaElectronica.WinLoginUi = Ext.extend(Ext.Window, {
    modal : true,
    resizable : false,
    width : 410,
    height : 242,
    title : 'Firma Electr&oacute;nica de Documentos',
    iconCls : 'icon-win-login',
    border : false,
    buttonIngresar : null,
    closable : false,
    listeners: {
        afterrender: function(){
            // TODO
            // Incorporar validación de sesión activa
        }
    },
    initComponent : function(){
        this.initForm();
        this.initButtons();
        this.items = [this.form];
        this.buttons = [this.buttonIngresar];
        App.FirmaElectronica.WinLoginUi.superclass.initComponent.call(this);
    },
    initForm : function(){
        this.form = new Ext.form.FormPanel({
            frame : true,
            border : false,
            labelAlign : 'top',
            items : [{
                xtype : 'fieldset',
                title : 'Autenticaci&oacute;n de Usuario',
                items : [{
                    xtype: 'container',
                    layout:'column',
                    items:[{
                        xtype : 'container',
                        width : 240,
                        layout : 'form',
                        items : [{
                            xtype : 'textfield',
                            fieldLabel : 'RUN',
                            vtype : 'rut',
                            name : 'runUsuario',
                            id : 'runUsuaruioId',
                            width : 200,
                            allowBlank : false,
                            blankText : 'Debe completar esta informaci&oacute;n.'
                        },{
                            xtype : 'textfield',
                            fieldLabel : 'Contrase&ntilde;a',
                            name : 'passwordUsuario',
                            id : 'passwordUsuarioId',
                            inputType : 'password',
                            width : 200,
                            allowBlank : false,
                            blankText : 'Debe completar esta informaci&oacute;n.',
                            listeners:{
                                scope:this,
                                specialkey: function(f,e){
                                    if(e.getKey()==e.ENTER){
                                        this.ingresar();
                                    }
                                }
                            }
                        }]
                    },{
                        xtype : 'container',
                        width : 120,
                        layout : 'fit',
                        items : [{
                            xtype: 'box',
                            border : false,
                            autoEl: {
                                tag : 'img',
                                style : 'height: 120px;',
                                src : './images/app/logoApp.png'
                            }
                        }]
                    }]
                }]
            }]
        });
    },
    initButtons : function(){
        this.buttonIngresar = new Ext.Button({
            text : 'Ingresar',
            iconCls : 'icon-login',
            scope : this,
            cmpEvent : 'ingresar'
        });
    }
});