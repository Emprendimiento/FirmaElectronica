App.FirmaElectronica.PanelDocumentosPorFirmarUi = Ext.extend(Ext.Panel, {
    title : 'Documentos pendientes por firmar',
    iconCls: 'icon-doc-por-firmar-app',
    height : 238,
    width : 725,
    layout : 'fit',
    frame : false,
    border : true,
    autoScroll : true,
    grid : null,
    tbar : null,
    storeItems : null,
    storeAll : null,

    initComponent : function(){
        this.initStores();
        this.initGrid();
        this.items = [this.grid];
        App.FirmaElectronica.PanelDocumentosPorFirmarUi.superclass.initComponent.call(this);
    },

    initStores: function(){
        this.storeItems = new Ext.data.JsonStore({
            fields: [ 'id', 'fecha', 'emisor', 'formato', 'descripcion', 'tipo', 'archivo'],
            autoLoad: true,
            data:  [ 
              { "id": 1, "fecha":"29/08/2013", "emisor":"Bruce Wayne", "formato" : "PDF", "descripcion" : "Orden de Compra #212 Motores CAT", "tipo" : "Orden de Compra", "archivo" : "20130829_OC212.pdf"},
              { "id": 2, "fecha":"27/08/2013", "emisor":"Jill Valentine", "formato" : "XML", "descripcion" : "Factura Electrónica #443", "tipo" : "Factura Electr&oacute;nica", "archivo" : "20130827_F443.xml"}
            ]
        });
        this.storeAll = new Ext.data.JsonStore({
            fields: [ 'id', 'descripcion'],
            autoLoad: true,
            data:  []
        });        
    },

    initGrid : function(){
        this.grid = new Ext.grid.GridPanel({
            id : 'gridDocumentosPorFirmarId',
            stripeRows : true,
            loadMask : true,
            autoScroll : true,
            frame : true,
            store : this.storeItems,
            sm : new Ext.grid.RowSelectionModel({singleSelect : true}),
            columns : [
                {header : 'Recepci&oacute;n', sortable : true, width : 80, dataIndex : 'fecha'},
                {header : 'Emisor', sortable : true, width : 120, dataIndex : 'emisor'},
                {header : 'Descripci&oacute;n', sortable : true, width : 190, dataIndex : 'descripcion'},
                {header : 'Tipo', sortable : true, width : 120, dataIndex : 'tipo'},
                {header : 'Archivo', sortable : true, width : 130, dataIndex : 'archivo'},
                {header : 'Formato', sortable : true, width : 60, dataIndex : 'formato'}
            ],
            tbar : [{
                text : 'Firmar',
                iconCls : 'icon-firma',
                scale : 'small',
                tooltip : 'Firma electr&oacute;nica de los documentos seleccionados',
                scope : this,
                scale : 'small'
            }, '-',{
                text : 'Visualizar',
                iconCls : 'icon-grid-visualizar',
                scale : 'small',
                tooltip : 'Ver el detalle del documento seleccionado',
                scope : this,
                scale : 'small'
            }, '-',{
                text : 'Enviar',
                iconCls : 'icon-email',
                scale : 'small',
                tooltip : 'Enviar los documentos seleccionados a uno o m&aacute;s correos electr&oacute;nicos',
                scope : this,
                scale : 'small'
            }, '-',{
                text : 'Rechazar',
                iconCls : 'icon-rechazar',
                scale : 'small',
                tooltip : 'Rechazar los documentos seleccionados',
                scope : this,
                scale : 'small'
            }, '-',{
                xtype : 'combo',
                name : 'filtroEmisor',
                id : 'filtroEmisorId',
                fieldLabel : 'Emisor',
                emptyText : 'Filtro por Emisor',
                mode : 'local',
                typeAhead : true,
                displayField : 'emisor',
                valueField : 'id',
                width : 110,
                listWidth : 200,
                resizable : true,
                triggerAction : 'all',
                store : this.storeItems
            }, '-',{
                xtype : 'combo',
                name : 'filtroDescripcion',
                id : 'filtroDescripcionId',
                fieldLabel : 'Descripci&oacute;n',
                emptyText : 'Buscar por descripción',
                mode : 'local',
                typeAhead : true,
                displayField : 'descripcion',
                valueField : 'id',
                width : 160,
                listWidth : 200,
                resizable : true,
                triggerAction : 'all',
                store : this.storeItems
            }, '->',{
                text : 'Exportar',
                iconCls : 'icon-grid-visualizar',
                scale : 'small',
                tooltip : 'Exportar a Excel el listado de documentos pendientes de firma',
                scope : this,
                scale : 'small'
            }]
        });
    }
});