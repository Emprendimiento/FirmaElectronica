App.FirmaElectronica.PanelSubroganciasRegistradasUi = Ext.extend(Ext.Panel, {
    title : 'Subrogancias Registradas',
    iconCls: 'icon-subrogancia',
    height : 238,
    //width : 625,
    layout : 'fit',
    frame : false,
    border : true,
    autoScroll : true,
    grid : null,
    tbar : null,
    storeItems : null,
    initComponent : function(){
        this.initStores();
        this.initGrid();
        this.items = [this.grid];
        App.FirmaElectronica.PanelSubroganciasRegistradasUi.superclass.initComponent.call(this);
    },
    initStores: function(){
        this.storeItems = new Ext.data.JsonStore({
            fields: [ 'id', 'fecha', 'usuarioSubrogado', 'documentosFirmados', 'documentosRechazados', 'documentosPendientes'],
            autoLoad: true,
            data:  [ 
              { "id": 1, "fecha":"15/08/13 al 27/09/13", "usuarioSubrogado" : "Peter Cole", "documentosFirmados" : "17", "documentosRechazados" : "0", "documentosPendientes" : "3"},
              { "id": 2, "fecha":"02/05/13 al 22/05/13", "usuarioSubrogado" : "John Connor", "documentosFirmados" : "7", "documentosRechazados" : "2", "documentosPendientes" : "1"}
            ]
        });
    },

    initGrid : function(){
        this.grid = new Ext.grid.GridPanel({
            id : 'gridSubroganciasRegistradasId',
            stripeRows : true,
            loadMask : true,
            autoScroll : true,
            frame : true,
            store : this.storeItems,
            sm : new Ext.grid.RowSelectionModel({singleSelect : true}),
            columns : [
                {header : 'Periodo', sortable : true, width : 120, dataIndex : 'fecha'},
                {header : 'Subrogado', sortable : true, width : 100, dataIndex : 'usuarioSubrogado'},
                {header : 'Firmas', sortable : true, width : 50, dataIndex : 'documentosFirmados'},
                {header : 'Rechazos', sortable : true, width : 60, dataIndex : 'documentosRechazados'},
                {header : 'Pendientes', sortable : true, width : 70, dataIndex : 'documentosPendientes'}
            ],
            tbar : [{
                text : 'Ver detalle',
                iconCls : 'icon-grid-visualizar',
                scale : 'small',
                tooltip : 'Ver el detalle del registro seleccionado',
                scope : this,
                scale : 'small',
                cmpEvent : 'verDetalle'
            }]
        });
    }
});