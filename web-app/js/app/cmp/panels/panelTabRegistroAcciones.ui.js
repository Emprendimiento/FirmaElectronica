App.FirmaElectronica.PanelTabRegistroAccionesUi = Ext.extend(Ext.Panel, {
//    title: 'Registro de Acciones Registradas',
    height: 238,
    width: 725,
    layout: 'fit',
    frame: false,
    border: true,
    autoScroll: true,
    tabPanel: null,
    pageSize : 10,
    storeDocumentosFirmados: null,
    storeDocumentosEnviados: null,
    storeDocumentosRechazados: null,
    gridDocumentosFirmados: null,
    gridDocumentosEnviados: null,
    gridDocumentosRechazados: null,
    initComponent: function() {
        this.initStores();
        this.initGrids();
        this.initTabs();
        this.items = [this.tabPanel];
        App.FirmaElectronica.PanelTabRegistroAccionesUi.superclass.initComponent.call(this);
    },
    initStores: function() {
        this.storeDocumentosFirmados = new Ext.data.JsonStore({
            fields: [ 'id', 'fechaFirma', 'fecha', 'emisor', 'formato', 'descripcion', 'tipo'],
            autoLoad: true,
            data: [
                {"id": 1, "fechaFirma":"02/09/2013", "fecha":"29/08/2013", "emisor":"Bruce Wayne", "formato" : "PDF", "descripcion" : "Orden de Compra #345 - Motores BMW", "tipo" : "Orden de Compra"},
                {"id": 2, "fechaFirma":"02/09/2013", "fecha":"27/08/2013", "emisor":"Jill Valentine", "formato" : "XML", "descripcion" : "Factura Electrónica #431", "tipo" : "Factura Electr&oacute;nica"}
            ]
        });
        this.storeDocumentosEnviados = new Ext.data.JsonStore({
            fields: [ 'id', 'fechaFirma', 'fecha', 'emisor', 'formato', 'descripcion', 'tipo'],
            autoLoad: true,
            data: [
                {"id": 1, "fechaFirma":"02/09/2013", "fecha":"29/08/2013", "emisor":"Bruce Wayne", "formato" : "PDF", "descripcion" : "Orden de Compra #345 - Motores BMW", "tipo" : "Orden de Compra"},
                {"id": 2, "fechaFirma":"02/09/2013", "fecha":"27/08/2013", "emisor":"Jill Valentine", "formato" : "XML", "descripcion" : "Factura Electrónica #431", "tipo" : "Factura Electr&oacute;nica"}
            ]
        });
        this.storeDocumentosRechazados = new Ext.data.JsonStore({
            fields: [ 'id', 'fechaFirma', 'fecha', 'emisor', 'formato', 'descripcion', 'tipo'],
            autoLoad: true,
            data: [
                {"id": 1, "fechaFirma":"02/09/2013", "fecha":"29/08/2013", "emisor":"Bruce Wayne", "formato" : "PDF", "descripcion" : "Orden de Compra #345 - Motores BMW", "tipo" : "Orden de Compra"},
                {"id": 2, "fechaFirma":"02/09/2013", "fecha":"27/08/2013", "emisor":"Jill Valentine", "formato" : "XML", "descripcion" : "Factura Electrónica #431", "tipo" : "Factura Electr&oacute;nica"}
            ]
        });
    },
    initTabs: function() {
        this.tabPanel = new Ext.TabPanel({
            renderTo: Ext.getBody(),
            activeTab: 0,
            border: false,
            items: [{
                    title: 'Documentos Firmados',
                    iconCls : 'icon-documentos-firmados',
                    items: [
                        this.gridDocumentosFirmados
                    ]
                }, {
                    title: 'Documentos Enviados',
                    iconCls : 'icon-documentos-enviados',
                    items: [
                        this.gridDocumentosEnviados
                    ]
                }, {
                    title: 'Documentos Rechazados',
                    iconCls : 'icon-documentos-rechazados',
                    items: [
                        this.gridDocumentosRechazados
                    ]
                }]
        });
    },
    initGrids: function() {
        this.gridDocumentosFirmados = new Ext.grid.GridPanel({
            id: 'gridDocumentosFirmadosId',
            height : 210,
            stripeRows: true,
            loadMask: true,
            autoScroll: true,
            frame: true,
            store: this.storeDocumentosFirmados,
            sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
            columns: [
                {header : 'Firma', sortable : true, width : 80, dataIndex : 'fechaFirma'},
                {header : 'Recepci&oacute;n', sortable : true, width : 80, dataIndex : 'fecha'},
                {header : 'Emisor', sortable : true, width : 140, dataIndex : 'emisor'},
                {header : 'Descripci&oacute;n', sortable : true, width : 220, dataIndex : 'descripcion'},
                {header : 'Tipo', sortable : true, width : 120, dataIndex : 'tipo'},
                {header : 'Formato', sortable : true, width : 60, dataIndex : 'formato'}
            ],
            bbar : new Ext.PagingToolbar({
                store : this.storeDocumentosFirmados,
                pageSize : this.pageSize,
                displayInfo : true
            }),
            tbar: [{
                text: 'Ver detalle',
                iconCls: 'icon-grid-visualizar',
                scale: 'small',
                tooltip: 'Ver el detalle del registro seleccionado',
                scope: this,
                scale : 'small'
            }]
        });
        this.gridDocumentosEnviados = new Ext.grid.GridPanel({
            id: 'gridDocumentosEnviadosId',
            height : 210,
            stripeRows: true,
            loadMask: true,
            autoScroll: true,
            frame: true,
            store: this.storeDocumentosEnviados,
            sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
            columns: [
                {header : 'Firma', sortable : true, width : 80, dataIndex : 'fechaFirma'},
                {header : 'Recepci&oacute;n', sortable : true, width : 80, dataIndex : 'fecha'},
                {header : 'Emisor', sortable : true, width : 120, dataIndex : 'emisor'},
                {header : 'Descripci&oacute;n', sortable : true, width : 200, dataIndex : 'descripcion'},
                {header : 'Tipo', sortable : true, width : 120, dataIndex : 'tipo'},
                {header : 'Formato', sortable : true, width : 60, dataIndex : 'formato'}
            ],
            bbar : new Ext.PagingToolbar({
                store : this.storeDocumentosEnviados,
                pageSize : this.pageSize,
                displayInfo : true
            }),
            tbar: [{
                text: 'Ver detalle',
                iconCls: 'icon-grid-visualizar',
                scale: 'small',
                tooltip: 'Ver el detalle del registro seleccionado',
                scope: this,
                scale : 'small'
            }]
        });
        this.gridDocumentosRechazados = new Ext.grid.GridPanel({
            id: 'gridDocumentosRechazadosId',
            height : 210,
            stripeRows: true,
            loadMask: true,
            autoScroll: true,
            frame: true,
            store: this.storeDocumentosRechazados,
            sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
            columns: [
                {header : 'Firma', sortable : true, width : 80, dataIndex : 'fechaFirma'},
                {header : 'Recepci&oacute;n', sortable : true, width : 80, dataIndex : 'fecha'},
                {header : 'Emisor', sortable : true, width : 120, dataIndex : 'emisor'},
                {header : 'Descripci&oacute;n', sortable : true, width : 200, dataIndex : 'descripcion'},
                {header : 'Tipo', sortable : true, width : 120, dataIndex : 'tipo'},
                {header : 'Formato', sortable : true, width : 60, dataIndex : 'formato'}
            ],
            bbar : new Ext.PagingToolbar({
                store : this.storeDocumentosRechazados,
                pageSize : this.pageSize,
                displayInfo : true
            }),
            tbar: [{
                text: 'Ver detalle',
                iconCls: 'icon-grid-visualizar',
                scale: 'small',
                tooltip: 'Ver el detalle del registro seleccionado',
                scope: this,
                scale : 'small'
            }]
        });
    }
});