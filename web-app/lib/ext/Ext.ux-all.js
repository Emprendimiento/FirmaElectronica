/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
// We are adding these custom layouts to a namespace that does not
// exist by default in Ext, so we have to add the namespace first:
Ext.ns('Ext.ux.layout', 'Ext.ux.form');

/**
 * @class Ext.ux.layout.CenterLayout
 * @extends Ext.layout.FitLayout
 * <p>This is a very simple layout style used to center contents within a container.  This layout works within
 * nested containers and can also be used as expected as a Viewport layout to center the page layout.</p>
 * <p>As a subclass of FitLayout, CenterLayout expects to have a single child panel of the container that uses
 * the layout.  The layout does not require any config options, although the child panel contained within the
 * layout must provide a fixed or percentage width.  The child panel's height will fit to the container by
 * default, but you can specify <tt>autoHeight:true</tt> to allow it to autosize based on its content height.
 * Example usage:</p>
 * <pre><code>
// The content panel is centered in the container
var p = new Ext.Panel({
    title: 'Center Layout',
    layout: 'ux.center',
    items: [{
        title: 'Centered Content',
        width: '75%',
        html: 'Some content'
    }]
});

// If you leave the title blank and specify no border
// you'll create a non-visual, structural panel just
// for centering the contents in the main container.
var p = new Ext.Panel({
    layout: 'ux.center',
    border: false,
    items: [{
        title: 'Centered Content',
        width: 300,
        autoHeight: true,
        html: 'Some content'
    }]
});
</code></pre>
 */
Ext.ux.layout.CenterLayout = Ext.extend(Ext.layout.FitLayout, {
	// private
    setItemSize : function(item, size){
        this.container.addClass('ux-layout-center');
        item.addClass('ux-layout-center-item');
        if(item && size.height > 0){
            if(item.width){
                size.width = item.width;
            }
            item.setSize(size);
        }
    }
});

Ext.Container.LAYOUTS['ux.center'] = Ext.ux.layout.CenterLayout;
/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.ns('Ext.ux.grid');

/**
 * @class Ext.ux.grid.GroupSummary
 * @extends Ext.util.Observable
 * A GridPanel plugin that enables dynamic column calculations and a dynamically
 * updated grouped summary row.
 */
Ext.ux.grid.GroupSummary = Ext.extend(Ext.util.Observable, {
    /**
     * @cfg {Function} summaryRenderer Renderer example:<pre><code>
summaryRenderer: function(v, params, data){
    return ((v === 0 || v > 1) ? '(' + v +' Tasks)' : '(1 Task)');
},
     * </code></pre>
     */
    /**
     * @cfg {String} summaryType (Optional) The type of
     * calculation to be used for the column.  For options available see
     * {@link #Calculations}.
     */

    constructor : function(config){
        Ext.apply(this, config);
        Ext.ux.grid.GroupSummary.superclass.constructor.call(this);
    },
    init : function(grid) {
    	var me = this;
        me.grid = grid;
        var v = me.view = grid.getView();
        v.doGroupEnd = me.doGroupEnd.createDelegate(me);

        v.afterMethod('onColumnWidthUpdated', me.doWidth, me);
        v.afterMethod('onAllColumnWidthsUpdated', me.doAllWidths, me);
        v.afterMethod('onColumnHiddenUpdated', me.doHidden, me);
        v.afterMethod('onUpdate', me.doUpdate, me);
        v.afterMethod('onRemove', me.doRemove, me);

        if(!me.rowTpl){
            me.rowTpl = new Ext.Template(
                '<div class="x-grid3-summary-row" style="{tstyle}">',
                '<table class="x-grid3-summary-table" border="0" cellspacing="0" cellpadding="0" style="{tstyle}">',
                    '<tbody><tr>{cells}</tr></tbody>',
                '</table></div>'
            );
            me.rowTpl.disableFormats = true;
        }
        me.rowTpl.compile();

        if(!me.cellTpl){
            me.cellTpl = new Ext.Template(
                '<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} {css}" style="{style}">',
                '<div class="x-grid3-cell-inner x-grid3-col-{id}" unselectable="on">{value}</div>',
                "</td>"
            );
            me.cellTpl.disableFormats = true;
        }
        me.cellTpl.compile();
    },

    /**
     * Toggle the display of the summary row on/off
     * @param {Boolean} visible <tt>true</tt> to show the summary, <tt>false</tt> to hide the summary.
     */
    toggleSummaries : function(visible){
        var el = this.grid.getGridEl();
        if(el){
            if(visible === undefined){
                visible = el.hasClass('x-grid-hide-summary');
            }
            el[visible ? 'removeClass' : 'addClass']('x-grid-hide-summary');
        }
    },

    renderSummary : function(o, cs){
        cs = cs || this.view.getColumnData();
        var cfg = this.grid.getColumnModel().config,
            buf = [], c, p = {}, cf, last = cs.length-1;
        for(var i = 0, len = cs.length; i < len; i++){
            c = cs[i];
            cf = cfg[i];
            p.id = c.id;
            p.style = c.style;
            p.css = i == 0 ? 'x-grid3-cell-first ' : (i == last ? 'x-grid3-cell-last ' : '');
            if(cf.summaryType || cf.summaryRenderer){
                p.value = (cf.summaryRenderer || c.renderer)(o.data[c.name], p, o);
            }else{
                p.value = '';
            }
            if(p.value == undefined || p.value === "") p.value = "&#160;";
            buf[buf.length] = this.cellTpl.apply(p);
        }

        return this.rowTpl.apply({
            tstyle: 'width:'+this.view.getTotalWidth()+';',
            cells: buf.join('')
        });
    },

    /**
     * @private
     * @param {Object} rs
     * @param {Object} cs
     */
    calculate : function(rs, cs){
        var data = {}, r, c, cfg = this.grid.getColumnModel().config, cf;
        for(var j = 0, jlen = rs.length; j < jlen; j++){
            r = rs[j];
            for(var i = 0, len = cs.length; i < len; i++){
                c = cs[i];
                cf = cfg[i];
                if(cf.summaryType){
                    data[c.name] = Ext.ux.grid.GroupSummary.Calculations[cf.summaryType](data[c.name] || 0, r, c.name, data);
                }
            }
        }
        return data;
    },

    doGroupEnd : function(buf, g, cs, ds, colCount){
        var data = this.calculate(g.rs, cs);
        buf.push('</div>', this.renderSummary({data: data}, cs), '</div>');
    },

    doWidth : function(col, w, tw){
        if(!this.isGrouped()){
            return;
        }
        var gs = this.view.getGroups(),
            len = gs.length,
            i = 0,
            s;
        for(; i < len; ++i){
            s = gs[i].childNodes[2];
            s.style.width = tw;
            s.firstChild.style.width = tw;
            s.firstChild.rows[0].childNodes[col].style.width = w;
        }
    },

    doAllWidths : function(ws, tw){
        if(!this.isGrouped()){
            return;
        }
        var gs = this.view.getGroups(),
            len = gs.length,
            i = 0,
            j, 
            s, 
            cells, 
            wlen = ws.length;
            
        for(; i < len; i++){
            s = gs[i].childNodes[2];
            s.style.width = tw;
            s.firstChild.style.width = tw;
            cells = s.firstChild.rows[0].childNodes;
            for(j = 0; j < wlen; j++){
                cells[j].style.width = ws[j];
            }
        }
    },

    doHidden : function(col, hidden, tw){
        if(!this.isGrouped()){
            return;
        }
        var gs = this.view.getGroups(),
            len = gs.length,
            i = 0,
            s, 
            display = hidden ? 'none' : '';
        for(; i < len; i++){
            s = gs[i].childNodes[2];
            s.style.width = tw;
            s.firstChild.style.width = tw;
            s.firstChild.rows[0].childNodes[col].style.display = display;
        }
    },
    
    isGrouped : function(){
        return !Ext.isEmpty(this.grid.getStore().groupField);
    },

    // Note: requires that all (or the first) record in the
    // group share the same group value. Returns false if the group
    // could not be found.
    refreshSummary : function(groupValue){
        return this.refreshSummaryById(this.view.getGroupId(groupValue));
    },

    getSummaryNode : function(gid){
        var g = Ext.fly(gid, '_gsummary');
        if(g){
            return g.down('.x-grid3-summary-row', true);
        }
        return null;
    },

    refreshSummaryById : function(gid){
        var g = Ext.getDom(gid);
        if(!g){
            return false;
        }
        var rs = [];
        this.grid.getStore().each(function(r){
            if(r._groupId == gid){
                rs[rs.length] = r;
            }
        });
        var cs = this.view.getColumnData(),
            data = this.calculate(rs, cs),
            markup = this.renderSummary({data: data}, cs),
            existing = this.getSummaryNode(gid);
            
        if(existing){
            g.removeChild(existing);
        }
        Ext.DomHelper.append(g, markup);
        return true;
    },

    doUpdate : function(ds, record){
        this.refreshSummaryById(record._groupId);
    },

    doRemove : function(ds, record, index, isUpdate){
        if(!isUpdate){
            this.refreshSummaryById(record._groupId);
        }
    },

    /**
     * Show a message in the summary row.
     * <pre><code>
grid.on('afteredit', function(){
    var groupValue = 'Ext Forms: Field Anchoring';
    summary.showSummaryMsg(groupValue, 'Updating Summary...');
});
     * </code></pre>
     * @param {String} groupValue
     * @param {String} msg Text to use as innerHTML for the summary row.
     */
    showSummaryMsg : function(groupValue, msg){
        var gid = this.view.getGroupId(groupValue),
             node = this.getSummaryNode(gid);
        if(node){
            node.innerHTML = '<div class="x-grid3-summary-msg">' + msg + '</div>';
        }
    }
});

//backwards compat
Ext.grid.GroupSummary = Ext.ux.grid.GroupSummary;


/**
 * Calculation types for summary row:</p><div class="mdetail-params"><ul>
 * <li><b><tt>sum</tt></b> : <div class="sub-desc"></div></li>
 * <li><b><tt>count</tt></b> : <div class="sub-desc"></div></li>
 * <li><b><tt>max</tt></b> : <div class="sub-desc"></div></li>
 * <li><b><tt>min</tt></b> : <div class="sub-desc"></div></li>
 * <li><b><tt>average</tt></b> : <div class="sub-desc"></div></li>
 * </ul></div>
 * <p>Custom calculations may be implemented.  An example of
 * custom <code>summaryType=totalCost</code>:</p><pre><code>
// define a custom summary function
Ext.ux.grid.GroupSummary.Calculations['totalCost'] = function(v, record, field){
    return v + (record.data.estimate * record.data.rate);
};
 * </code></pre>
 * @property Calculations
 */

Ext.ux.grid.GroupSummary.Calculations = {
    'sum' : function(v, record, field){
        return v + (record.data[field]||0);
    },

    'count' : function(v, record, field, data){
        return data[field+'count'] ? ++data[field+'count'] : (data[field+'count'] = 1);
    },

    'max' : function(v, record, field, data){
        var v = record.data[field];
        var max = data[field+'max'] === undefined ? (data[field+'max'] = v) : data[field+'max'];
        return v > max ? (data[field+'max'] = v) : max;
    },

    'min' : function(v, record, field, data){
        var v = record.data[field];
        var min = data[field+'min'] === undefined ? (data[field+'min'] = v) : data[field+'min'];
        return v < min ? (data[field+'min'] = v) : min;
    },

    'average' : function(v, record, field, data){
        var c = data[field+'count'] ? ++data[field+'count'] : (data[field+'count'] = 1);
        var t = (data[field+'total'] = ((data[field+'total']||0) + (record.data[field]||0)));
        return t === 0 ? 0 : t / c;
    }
};
Ext.grid.GroupSummary.Calculations = Ext.ux.grid.GroupSummary.Calculations;

/**
 * @class Ext.ux.grid.HybridSummary
 * @extends Ext.ux.grid.GroupSummary
 * Adds capability to specify the summary data for the group via json as illustrated here:
 * <pre><code>
{
    data: [
        {
            projectId: 100,     project: 'House',
            taskId:    112, description: 'Paint',
            estimate:    6,        rate:     150,
            due:'06/24/2007'
        },
        ...
    ],

    summaryData: {
        'House': {
            description: 14, estimate: 9,
                   rate: 99, due: new Date(2009, 6, 29),
                   cost: 999
        }
    }
}
 * </code></pre>
 *
 */
Ext.ux.grid.HybridSummary = Ext.extend(Ext.ux.grid.GroupSummary, {
    /**
     * @private
     * @param {Object} rs
     * @param {Object} cs
     */
    calculate : function(rs, cs){
        var gcol = this.view.getGroupField(),
            gvalue = rs[0].data[gcol],
            gdata = this.getSummaryData(gvalue);
        return gdata || Ext.ux.grid.HybridSummary.superclass.calculate.call(this, rs, cs);
    },

    /**
     * <pre><code>
grid.on('afteredit', function(){
    var groupValue = 'Ext Forms: Field Anchoring';
    summary.showSummaryMsg(groupValue, 'Updating Summary...');
    setTimeout(function(){ // simulate server call
        // HybridSummary class implements updateSummaryData
        summary.updateSummaryData(groupValue,
            // create data object based on configured dataIndex
            {description: 22, estimate: 888, rate: 888, due: new Date(), cost: 8});
    }, 2000);
});
     * </code></pre>
     * @param {String} groupValue
     * @param {Object} data data object
     * @param {Boolean} skipRefresh (Optional) Defaults to false
     */
    updateSummaryData : function(groupValue, data, skipRefresh){
        var json = this.grid.getStore().reader.jsonData;
        if(!json.summaryData){
            json.summaryData = {};
        }
        json.summaryData[groupValue] = data;
        if(!skipRefresh){
            this.refreshSummary(groupValue);
        }
    },

    /**
     * Returns the summaryData for the specified groupValue or null.
     * @param {String} groupValue
     * @return {Object} summaryData
     */
    getSummaryData : function(groupValue){
        var reader = this.grid.getStore().reader,
            json = reader.jsonData,
            fields = reader.recordType.prototype.fields,
            v;
            
        if(json && json.summaryData){
            v = json.summaryData[groupValue];
            if(v){
                return reader.extractValues(v, fields.items, fields.length);
            }
        }
        return null;
    }
});

//backwards compat
Ext.grid.HybridSummary = Ext.ux.grid.HybridSummary;
/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.ux.GroupTab = Ext.extend(Ext.Container, {
    mainItem: 0,
    
    expanded: true,
    
    deferredRender: true,
    
    activeTab: null,
    
    idDelimiter: '__',
    
    headerAsText: false,
    
    frame: false,
    
    hideBorders: true,
    
    initComponent: function(config){
        Ext.apply(this, config);
        this.frame = false;
        
        Ext.ux.GroupTab.superclass.initComponent.call(this);
        
        this.addEvents('activate', 'deactivate', 'changemainitem', 'beforetabchange', 'tabchange');
        
        this.setLayout(new Ext.layout.CardLayout({
            deferredRender: this.deferredRender
        }));
        
        if (!this.stack) {
            this.stack = Ext.TabPanel.AccessStack();
        }
        
        this.initItems();
        
        this.on('beforerender', function(){
            this.groupEl = this.ownerCt.getGroupEl(this);
        }, this);
        
        this.on('add', this.onAdd, this, {
            target: this
        });
        this.on('remove', this.onRemove, this, {
            target: this
        });
        
        if (this.mainItem !== undefined) {
            var item = (typeof this.mainItem == 'object') ? this.mainItem : this.items.get(this.mainItem);
            delete this.mainItem;
            this.setMainItem(item);
        }
    },
    
    /**
     * Sets the specified tab as the active tab. This method fires the {@link #beforetabchange} event which
     * can return false to cancel the tab change.
     * @param {String/Panel} tab The id or tab Panel to activate
     */
    setActiveTab : function(item){
        item = this.getComponent(item);
        if(!item){
            return false;
        }
        if(!this.rendered){
            this.activeTab = item;
            return true;
        }
        if(this.activeTab != item && this.fireEvent('beforetabchange', this, item, this.activeTab) !== false){
            if(this.activeTab && this.activeTab != this.mainItem){
                var oldEl = this.getTabEl(this.activeTab);
                if(oldEl){
                    Ext.fly(oldEl).removeClass('x-grouptabs-strip-active');
                }
            }
            var el = this.getTabEl(item);
            Ext.fly(el).addClass('x-grouptabs-strip-active');
            this.activeTab = item;
            this.stack.add(item);

            this.layout.setActiveItem(item);
            if(this.layoutOnTabChange && item.doLayout){
                item.doLayout();
            }
            if(this.scrolling){
                this.scrollToTab(item, this.animScroll);
            }

            this.fireEvent('tabchange', this, item);
            return true;
        }
        return false;
    },
    
    getTabEl: function(item){
        if (item == this.mainItem) {
            return this.groupEl;
        }
        return Ext.TabPanel.prototype.getTabEl.call(this, item);
    },
    
    onRender: function(ct, position){
        Ext.ux.GroupTab.superclass.onRender.call(this, ct, position);
        
        this.strip = Ext.fly(this.groupEl).createChild({
            tag: 'ul',
            cls: 'x-grouptabs-sub'
        });

        this.tooltip = new Ext.ToolTip({
           target: this.groupEl,
           delegate: 'a.x-grouptabs-text',
           trackMouse: true,
           renderTo: document.body,
           listeners: {
               beforeshow: function(tip) {
                   var item = (tip.triggerElement.parentNode === this.mainItem.tabEl)
                       ? this.mainItem
                       : this.findById(tip.triggerElement.parentNode.id.split(this.idDelimiter)[1]);

                   if(!item.tabTip) {
                       return false;
                   }
                   tip.body.dom.innerHTML = item.tabTip;
               },
               scope: this
           }
        });
                
        if (!this.itemTpl) {
            var tt = new Ext.Template('<li class="{cls}" id="{id}">', '<a onclick="return false;" class="x-grouptabs-text {iconCls}">{text}</a>', '</li>');
            tt.disableFormats = true;
            tt.compile();
            Ext.ux.GroupTab.prototype.itemTpl = tt;
        }
        
        this.items.each(this.initTab, this);
    },
    
    afterRender: function(){
        Ext.ux.GroupTab.superclass.afterRender.call(this);
        
        if (this.activeTab !== undefined) {
            var item = (typeof this.activeTab == 'object') ? this.activeTab : this.items.get(this.activeTab);
            delete this.activeTab;
            this.setActiveTab(item);
        }
    },
    
    // private
    initTab: function(item, index){
        var before = this.strip.dom.childNodes[index];
        var p = Ext.TabPanel.prototype.getTemplateArgs.call(this, item);
        
        if (item === this.mainItem) {
            item.tabEl = this.groupEl;
            p.cls += ' x-grouptabs-main-item';
        }
        
        var el = before ? this.itemTpl.insertBefore(before, p) : this.itemTpl.append(this.strip, p);
        
        item.tabEl = item.tabEl || el;
                
        item.on('disable', this.onItemDisabled, this);
        item.on('enable', this.onItemEnabled, this);
        item.on('titlechange', this.onItemTitleChanged, this);
        item.on('iconchange', this.onItemIconChanged, this);
        item.on('beforeshow', this.onBeforeShowItem, this);
    },
    
    setMainItem: function(item){
        item = this.getComponent(item);
        if (!item || this.fireEvent('changemainitem', this, item, this.mainItem) === false) {
            return;
        }
        
        this.mainItem = item;
    },
    
    getMainItem: function(){
        return this.mainItem || null;
    },
    
    // private
    onBeforeShowItem: function(item){
        if (item != this.activeTab) {
            this.setActiveTab(item);
            return false;
        }
    },
    
    // private
    onAdd: function(gt, item, index){
        if (this.rendered) {
            this.initTab.call(this, item, index);
        }
    },
    
    // private
    onRemove: function(tp, item){
        Ext.destroy(Ext.get(this.getTabEl(item)));
        this.stack.remove(item);
        item.un('disable', this.onItemDisabled, this);
        item.un('enable', this.onItemEnabled, this);
        item.un('titlechange', this.onItemTitleChanged, this);
        item.un('iconchange', this.onItemIconChanged, this);
        item.un('beforeshow', this.onBeforeShowItem, this);
        if (item == this.activeTab) {
            var next = this.stack.next();
            if (next) {
                this.setActiveTab(next);
            }
            else if (this.items.getCount() > 0) {
                this.setActiveTab(0);
            }
            else {
                this.activeTab = null;
            }
        }
    },
    
    // private
    onBeforeAdd: function(item){
        var existing = item.events ? (this.items.containsKey(item.getItemId()) ? item : null) : this.items.get(item);
        if (existing) {
            this.setActiveTab(item);
            return false;
        }
        Ext.TabPanel.superclass.onBeforeAdd.apply(this, arguments);
        var es = item.elements;
        item.elements = es ? es.replace(',header', '') : es;
        item.border = (item.border === true);
    },
    
    // private
    onItemDisabled: Ext.TabPanel.prototype.onItemDisabled,
    onItemEnabled: Ext.TabPanel.prototype.onItemEnabled,
    
    // private
    onItemTitleChanged: function(item){
        var el = this.getTabEl(item);
        if (el) {
            Ext.fly(el).child('a.x-grouptabs-text', true).innerHTML = item.title;
        }
    },
    
    //private
    onItemIconChanged: function(item, iconCls, oldCls){
        var el = this.getTabEl(item);
        if (el) {
            Ext.fly(el).child('a.x-grouptabs-text').replaceClass(oldCls, iconCls);
        }
    },
    
    beforeDestroy: function(){
        Ext.TabPanel.prototype.beforeDestroy.call(this);
        this.tooltip.destroy();
    }
});

Ext.reg('grouptab', Ext.ux.GroupTab);
/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.ns('Ext.ux');

Ext.ux.GroupTabPanel = Ext.extend(Ext.TabPanel, {
    tabPosition: 'left',

    alternateColor: false,

    alternateCls: 'x-grouptabs-panel-alt',

    defaultType: 'grouptab',

    deferredRender: false,

    activeGroup : null,

    initComponent: function(){
        Ext.ux.GroupTabPanel.superclass.initComponent.call(this);
        
        this.addEvents(
            'beforegroupchange',
            'groupchange'
        );
        this.elements = 'body,header';
        this.stripTarget = 'header';

        this.tabPosition = this.tabPosition == 'right' ? 'right' : 'left';

        this.addClass('x-grouptabs-panel');

        if (this.tabStyle && this.tabStyle != '') {
            this.addClass('x-grouptabs-panel-' + this.tabStyle);
        }

        if (this.alternateColor) {
            this.addClass(this.alternateCls);
        }

        this.on('beforeadd', function(gtp, item, index){
            this.initGroup(item, index);
        });
        this.items.each(function(item){
            item.on('tabchange',function(item){
                this.fireEvent('tabchange', this, item.activeTab);
            }, this);
        },this);
    },

    initEvents : function() {
        this.mon(this.strip, 'mousedown', this.onStripMouseDown, this);
    },

    onRender: function(ct, position){
        Ext.TabPanel.superclass.onRender.call(this, ct, position);
        if(this.plain){
            var pos = this.tabPosition == 'top' ? 'header' : 'footer';
            this[pos].addClass('x-tab-panel-'+pos+'-plain');
        }

        var st = this[this.stripTarget];

        this.stripWrap = st.createChild({cls:'x-tab-strip-wrap ', cn:{
            tag:'ul', cls:'x-grouptabs-strip x-grouptabs-tab-strip-'+this.tabPosition}});

        var beforeEl = (this.tabPosition=='bottom' ? this.stripWrap : null);
        this.strip = new Ext.Element(this.stripWrap.dom.firstChild);

        this.header.addClass('x-grouptabs-panel-header');
        this.bwrap.addClass('x-grouptabs-bwrap');
        this.body.addClass('x-tab-panel-body-'+this.tabPosition + ' x-grouptabs-panel-body');

        if (!this.groupTpl) {
            var tt = new Ext.Template(
                '<li class="{cls}" id="{id}">',
                '<a class="x-grouptabs-expand" onclick="return false;"></a>',
                '<a class="x-grouptabs-text {iconCls}" href="#" onclick="return false;">',
                '<span>{text}</span></a>',
                '</li>'
            );
            tt.disableFormats = true;
            tt.compile();
            Ext.ux.GroupTabPanel.prototype.groupTpl = tt;
        }
        this.items.each(this.initGroup, this);
    },

    afterRender: function(){
        Ext.ux.GroupTabPanel.superclass.afterRender.call(this);

        this.tabJoint = Ext.fly(this.body.dom.parentNode).createChild({
            cls: 'x-tab-joint'
        });

        this.addClass('x-tab-panel-' + this.tabPosition);
        this.header.setWidth(this.tabWidth);

        if (this.activeGroup !== undefined) {
            var group = (typeof this.activeGroup == 'object') ? this.activeGroup : this.items.get(this.activeGroup);
            delete this.activeGroup;
            this.setActiveGroup(group);
            group.setActiveTab(group.getMainItem());
        }
    },

    getGroupEl : Ext.TabPanel.prototype.getTabEl,

    // private
    findTargets: function(e){
        var item = null,
            itemEl = e.getTarget('li', this.strip);
        if (itemEl) {
            item = this.findById(itemEl.id.split(this.idDelimiter)[1]);
            if (item.disabled) {
                return {
                    expand: null,
                    item: null,
                    el: null
                };
            }
        }
        return {
            expand: e.getTarget('.x-grouptabs-expand', this.strip),
            isGroup: !e.getTarget('ul.x-grouptabs-sub', this.strip),
            item: item,
            el: itemEl
        };
    },

    // private
    onStripMouseDown: function(e){
        if (e.button != 0) {
            return;
        }
        e.preventDefault();
        var t = this.findTargets(e);
        if (t.expand) {
            this.toggleGroup(t.el);
        }
        else if (t.item) {
            if(t.isGroup) {
                t.item.setActiveTab(t.item.getMainItem());
            }
            else {
                t.item.ownerCt.setActiveTab(t.item);
            }
        }
    },

    expandGroup: function(groupEl){
        if(groupEl.isXType) {
            groupEl = this.getGroupEl(groupEl);
        }
        Ext.fly(groupEl).addClass('x-grouptabs-expanded');
        this.syncTabJoint();
    },

    toggleGroup: function(groupEl){
        if(groupEl.isXType) {
            groupEl = this.getGroupEl(groupEl);
        }
        Ext.fly(groupEl).toggleClass('x-grouptabs-expanded');
        this.syncTabJoint();
    },

    collapseGroup: function(groupEl){
        if(groupEl.isXType) {
            groupEl = this.getGroupEl(groupEl);
        }
        Ext.fly(groupEl).removeClass('x-grouptabs-expanded');
        this.syncTabJoint();
    },

    syncTabJoint: function(groupEl){
        if (!this.tabJoint) {
            return;
        }

        groupEl = groupEl || this.getGroupEl(this.activeGroup);
        if(groupEl) {
            this.tabJoint.setHeight(Ext.fly(groupEl).getHeight() - 2);

            var y = Ext.isGecko2 ? 0 : 1;
            if (this.tabPosition == 'left'){
                this.tabJoint.alignTo(groupEl, 'tl-tr', [-2,y]);
            }
            else {
                this.tabJoint.alignTo(groupEl, 'tr-tl', [1,y]);
            }
        }
        else {
            this.tabJoint.hide();
        }
    },

    getActiveTab : function() {
        if(!this.activeGroup) return null;
        return this.activeGroup.getTabEl(this.activeGroup.activeTab) || null;
    },

    onResize: function(){
        Ext.ux.GroupTabPanel.superclass.onResize.apply(this, arguments);
        this.syncTabJoint();
    },

    createCorner: function(el, pos){
        return Ext.fly(el).createChild({
            cls: 'x-grouptabs-corner x-grouptabs-corner-' + pos
        });
    },

    initGroup: function(group, index){
        var before = this.strip.dom.childNodes[index],
            p = this.getTemplateArgs(group);
        if (index === 0) {
            p.cls += ' x-tab-first';
        }
        p.cls += ' x-grouptabs-main';
        p.text = group.getMainItem().title;

        var el = before ? this.groupTpl.insertBefore(before, p) : this.groupTpl.append(this.strip, p),
            tl = this.createCorner(el, 'top-' + this.tabPosition),
            bl = this.createCorner(el, 'bottom-' + this.tabPosition);

        group.tabEl = el;
        if (group.expanded) {
            this.expandGroup(el);
        }

        if (Ext.isIE6 || (Ext.isIE && !Ext.isStrict)){
            bl.setLeft('-10px');
            bl.setBottom('-5px');
            tl.setLeft('-10px');
            tl.setTop('-5px');
        }

        this.mon(group, {
            scope: this,
            changemainitem: this.onGroupChangeMainItem,
            beforetabchange: this.onGroupBeforeTabChange
        });
    },

    setActiveGroup : function(group) {
        group = this.getComponent(group);
        if(!group){
            return false;
        }
        if(!this.rendered){
            this.activeGroup = group;
            return true;
        }
        if(this.activeGroup != group && this.fireEvent('beforegroupchange', this, group, this.activeGroup) !== false){
            if(this.activeGroup){
                this.activeGroup.activeTab = null;
                var oldEl = this.getGroupEl(this.activeGroup);
                if(oldEl){
                    Ext.fly(oldEl).removeClass('x-grouptabs-strip-active');
                }
            }

            var groupEl = this.getGroupEl(group);
            Ext.fly(groupEl).addClass('x-grouptabs-strip-active');

            this.activeGroup = group;
            this.stack.add(group);

            this.layout.setActiveItem(group);
            this.syncTabJoint(groupEl);

            this.fireEvent('groupchange', this, group);
            return true;
        }
        return false;
    },

    onGroupBeforeTabChange: function(group, newTab, oldTab){
        if(group !== this.activeGroup || newTab !== oldTab) {
            this.strip.select('.x-grouptabs-sub > li.x-grouptabs-strip-active', true).removeClass('x-grouptabs-strip-active');
        }
        this.expandGroup(this.getGroupEl(group));
        if(group !== this.activeGroup) {
            return this.setActiveGroup(group);
        }
    },

    getFrameHeight: function(){
        var h = this.el.getFrameWidth('tb');
        h += (this.tbar ? this.tbar.getHeight() : 0) +
        (this.bbar ? this.bbar.getHeight() : 0);

        return h;
    },

    adjustBodyWidth: function(w){
        return w - this.tabWidth;
    }
});

Ext.reg('grouptabpanel', Ext.ux.GroupTabPanel);
// $Id: Ext.ux-all.js,v 1.1 2012/01/10 15:30:32 cbravo Exp $

/** It creates a new input text mask.
* @class Ext.ux.InputTextMask is a plugin for Ext.form.TextField, used to add an input mask to the field.
* Mask Individual Character Usage:
* <ul>
* <li>9 - designates only numeric values</li>
* <li>L - designates only uppercase letter values</li>
* <li>l - designates only lowercase letter values</li>
* <li>A - designates only alphanumeric values</li>
* <li>X - denotes that a custom client script regular expression is specified</li>
*</ul>
* All other characters are assumed to be "special" characters used to mask the input component.
* <h4>Example 1:</h4>
* (999)999-9999 only numeric values can be entered where the the character
* position value is 9. Parenthesis and dash are non-editable/mask characters.
* <h4>Example 2:</h4>
* 99L-ll-X[^A-C]X only numeric values for the first two characters,
* uppercase values for the third character, lowercase letters for the
* fifth/sixth characters, and the last character X[^A-C]X together counts
* as the eighth character regular expression that would allow all characters
* but "A", "B", and "C". Dashes outside the regular expression are non-editable/mask characters.
* @constructor
* @param (String) mask The input mask defining string
* @param (boolean) clearWhenInvalid True to clear the mask when the field blurs and the text is invalid. Optional, default is true.
*/

Ext.namespace('Ext.ux');

Ext.ux.InputTextMask = function(config) {
    var mask = config.mask;
    //var clearWhenInvalid = config.clearWhenInvalid;
    var clearWhenInvalid = true;
    if(clearWhenInvalid === undefined){
      this.clearWhenInvalid = true;
    }else{
      this.clearWhenInvalid = clearWhenInvalid;
    }
    this.rawMask = mask;
    this.viewMask = '';
    this.maskArray = [];
    var mai = 0;
    var regexp = '';
    for(var i=0; i<mask.length; i++){
        if(regexp){
            if(regexp == 'X'){
                regexp = '';
            }
            if(mask.charAt(i) == 'X'){
                this.maskArray[mai] = regexp;
                mai++;
                regexp = '';
            } else {
                regexp += mask.charAt(i);
            }
        } else if(mask.charAt(i) == 'X'){
            regexp += 'X';
            this.viewMask += '_';
        } else if(mask.charAt(i) == '9' || mask.charAt(i) == 'L' || mask.charAt(i) == 'l' || mask.charAt(i) == 'A') {
            this.viewMask += '_';
            this.maskArray[mai] = mask.charAt(i);
            mai++;
        } else {
            this.viewMask += mask.charAt(i);
            this.maskArray[mai] = RegExp.escape(mask.charAt(i));
            mai++;
        }
    }

    this.specialChars = this.viewMask.replace(/(L|l|9|A|_|X)/g,'');
};

Ext.ux.InputTextMask.prototype = {

    init : function(field) {
        this.field = field;

        if (field.rendered){
            this.assignEl();
        } else {
            field.on('render', this.assignEl, this);
        }

        field.on('blur',this.removeValueWhenInvalid, this);
        field.on('focus',this.processMaskFocus, this);
    },

    assignEl : function() {
        this.inputTextElement = this.field.getEl().dom;
        this.field.getEl().on('keypress', this.processKeyPress, this);
        this.field.getEl().on('keydown', this.processKeyDown, this);
        if(Ext.isSafari || Ext.isIE){
            this.field.getEl().on('paste',this.startTask,this);
            this.field.getEl().on('cut',this.startTask,this);
        }
        if(Ext.isGecko || Ext.isOpera){
            this.field.getEl().on('mousedown',this.setPreviousValue,this);
        }
        if(Ext.isGecko){
          this.field.getEl().on('input',this.onInput,this);
        }
        if(Ext.isOpera){
          this.field.getEl().on('input',this.onInputOpera,this);
        }
    },
    onInput : function(){
        this.startTask(false);
    },
    onInputOpera : function(){
      if(!this.prevValueOpera){
        this.startTask(false);
      }else{
        this.manageBackspaceAndDeleteOpera();
      }
    },

    manageBackspaceAndDeleteOpera: function(){
      this.inputTextElement.value=this.prevValueOpera.cursorPos.previousValue;
      this.manageTheText(this.prevValueOpera.keycode,this.prevValueOpera.cursorPos);
      this.prevValueOpera=null;
    },

    setPreviousValue : function(event){
        this.oldCursorPos=this.getCursorPosition();
    },

    getValidatedKey : function(keycode, cursorPosition) {
        var maskKey = this.maskArray[cursorPosition.start];
        if(maskKey == '9'){
            return keycode.pressedKey.match(/[0-9]/);
        } else if(maskKey == 'L'){
            return (keycode.pressedKey.match(/[A-Za-z]/))? keycode.pressedKey.toUpperCase(): null;
        } else if(maskKey == 'l'){
            return (keycode.pressedKey.match(/[A-Za-z]/))? keycode.pressedKey.toLowerCase(): null;
        } else if(maskKey == 'A'){
            return keycode.pressedKey.match(/[A-Za-z0-9]/);
        } else if(maskKey){
            return (keycode.pressedKey.match(new RegExp(maskKey)));
        }
        return(null);
    },

    removeValueWhenInvalid : function() {
        if(this.clearWhenInvalid && this.inputTextElement.value.indexOf('_') > -1){
            this.inputTextElement.value = '';
        }
    },

    managePaste : function() {
        if(this.oldCursorPos===null){
          return;
        }
        var valuePasted=this.inputTextElement.value.substring(this.oldCursorPos.start,this.inputTextElement.value.length-(this.oldCursorPos.previousValue.length-this.oldCursorPos.end));
        if(this.oldCursorPos.start<this.oldCursorPos.end){//there is selection...
          this.oldCursorPos.previousValue=
            this.oldCursorPos.previousValue.substring(0,this.oldCursorPos.start)+
            this.viewMask.substring(this.oldCursorPos.start,this.oldCursorPos.end)+
            this.oldCursorPos.previousValue.substring(this.oldCursorPos.end,this.oldCursorPos.previousValue.length);
          valuePasted=valuePasted.substr(0,this.oldCursorPos.end-this.oldCursorPos.start);
        }
        this.inputTextElement.value=this.oldCursorPos.previousValue;
        keycode={unicode :'',
          isShiftPressed: false,
          isTab: false,
          isBackspace: false,
          isLeftOrRightArrow: false,
          isDelete: false,
          pressedKey : ''
        };
        var charOk=false;
        for(var i=0;i<valuePasted.length;i++){
            keycode.pressedKey=valuePasted.substr(i,1);
            keycode.unicode=valuePasted.charCodeAt(i);
            this.oldCursorPos=this.skipMaskCharacters(keycode,this.oldCursorPos);
            if(this.oldCursorPos===false){
                break;
            }
            if(this.injectValue(keycode,this.oldCursorPos)){
                charOk=true;
                this.moveCursorToPosition(keycode, this.oldCursorPos);
                this.oldCursorPos.previousValue=this.inputTextElement.value;
                this.oldCursorPos.start=this.oldCursorPos.start+1;
            }
        }
        if(!charOk && this.oldCursorPos!==false){
            this.moveCursorToPosition(null, this.oldCursorPos);
        }
        this.oldCursorPos=null;
    },

    processKeyDown : function(e){
        this.processMaskFormatting(e,'keydown');
    },

    processKeyPress : function(e){
        this.processMaskFormatting(e,'keypress');
    },

    startTask : function(setOldCursor){
      if(this.task===undefined){
        this.task=new Ext.util.DelayedTask(this.managePaste,this);
      }
      if(setOldCursor!== false){
        this.oldCursorPos=this.getCursorPosition();
      }
      this.task.delay(0);
    },

    skipMaskCharacters : function(keycode, cursorPos){
       if(cursorPos.start!=cursorPos.end && (keycode.isDelete || keycode.isBackspace)){
         return(cursorPos);
       }
        while(this.specialChars.match(RegExp.escape(this.viewMask.charAt(((keycode.isBackspace)? cursorPos.start-1: cursorPos.start))))){
            if(keycode.isBackspace) {
                cursorPos.dec();
            } else {
                cursorPos.inc();
            }
            if(cursorPos.start >= cursorPos.previousValue.length || cursorPos.start < 0){
                return false;
            }
        }
        return(cursorPos);
    },

    isManagedByKeyDown : function(keycode){
        if(keycode.isDelete || keycode.isBackspace){
            return(true);
        }
        return(false);
    },

    processMaskFormatting : function(e, type) {
        this.oldCursorPos=null;
        var cursorPos = this.getCursorPosition();
        var keycode = this.getKeyCode(e, type);
        if(keycode.unicode===0){//?? sometimes on Safari
            return;
        }
        if((keycode.unicode==67 || keycode.unicode==99) && e.ctrlKey){//Ctrl+c, let's the browser manage it!
            return;
        }
        if((keycode.unicode==88 || keycode.unicode==120) && e.ctrlKey){//Ctrl+x, manage paste
            this.startTask();
            return;
        }
        if((keycode.unicode==86 || keycode.unicode==118) && e.ctrlKey){//Ctrl+v, manage paste....
            this.startTask();
            return;
        }
        if((keycode.isBackspace || keycode.isDelete) && Ext.isOpera){
          this.prevValueOpera={cursorPos: cursorPos, keycode: keycode};
          return;
        }
        if(type=='keydown' && !this.isManagedByKeyDown(keycode)){
            return true;
        }
        if(type=='keypress' && this.isManagedByKeyDown(keycode)){
            return true;
        }
        if(this.handleEventBubble(e, keycode, type)){
            return true;
        }
        return(this.manageTheText(keycode, cursorPos));
    },

    manageTheText: function(keycode, cursorPos){
      if(this.inputTextElement.value.length === 0){
          this.inputTextElement.value = this.viewMask;
      }
      cursorPos=this.skipMaskCharacters(keycode, cursorPos);
      if(cursorPos===false){
          return false;
      }
      if(this.injectValue(keycode, cursorPos)){
          this.moveCursorToPosition(keycode, cursorPos);
      }
      return(false);
    },

    processMaskFocus : function(){
        if(this.inputTextElement.value.length === 0){
            var cursorPos = this.getCursorPosition();
            this.inputTextElement.value = this.viewMask;
            this.moveCursorToPosition(null, cursorPos);
        }
    },

    isManagedByBrowser : function(keyEvent, keycode, type){
        if(((type=='keypress' && keyEvent.charCode===0) ||
            type=='keydown') && (keycode.unicode==Ext.EventObject.TAB ||
            keycode.unicode==Ext.EventObject.RETURN ||
            keycode.unicode==Ext.EventObject.ENTER ||
            keycode.unicode==Ext.EventObject.SHIFT ||
            keycode.unicode==Ext.EventObject.CONTROL ||
            keycode.unicode==Ext.EventObject.ESC ||
            keycode.unicode==Ext.EventObject.PAGEUP ||
            keycode.unicode==Ext.EventObject.PAGEDOWN ||
            keycode.unicode==Ext.EventObject.END ||
            keycode.unicode==Ext.EventObject.HOME ||
            keycode.unicode==Ext.EventObject.LEFT ||
            keycode.unicode==Ext.EventObject.UP ||
            keycode.unicode==Ext.EventObject.RIGHT ||
            keycode.unicode==Ext.EventObject.DOWN)){
                return(true);
        }
        return(false);
    },

    handleEventBubble : function(keyEvent, keycode, type) {
        try {
            if(keycode && this.isManagedByBrowser(keyEvent, keycode, type)){
                return true;
            }
            keyEvent.stopEvent();
            return false;
        } catch(e) {
            alert(e.message);
        }
    },

    getCursorPosition : function() {
        var s, e, r;
        if(this.inputTextElement.createTextRange){
            r = document.selection.createRange().duplicate();
            r.moveEnd('character', this.inputTextElement.value.length);
            if(r.text === ''){
                s = this.inputTextElement.value.length;
            } else {
                s = this.inputTextElement.value.lastIndexOf(r.text);
            }
            r = document.selection.createRange().duplicate();
            r.moveStart('character', -this.inputTextElement.value.length);
            e = r.text.length;
        } else {
            s = this.inputTextElement.selectionStart;
            e = this.inputTextElement.selectionEnd;
        }
        return this.CursorPosition(s, e, r, this.inputTextElement.value);
    },

    moveCursorToPosition : function(keycode, cursorPosition) {
        var p = (!keycode || (keycode && keycode.isBackspace ))? cursorPosition.start: cursorPosition.start + 1;
        if(this.inputTextElement.createTextRange){
            cursorPosition.range.move('character', p);
            cursorPosition.range.select();
        } else {
            this.inputTextElement.selectionStart = p;
            this.inputTextElement.selectionEnd = p;
        }
    },

    injectValue : function(keycode, cursorPosition) {
        if (!keycode.isDelete && keycode.unicode == cursorPosition.previousValue.charCodeAt(cursorPosition.start)){
          return true;
        }
        var key;
        if(!keycode.isDelete && !keycode.isBackspace){
            key=this.getValidatedKey(keycode, cursorPosition);
        } else {
            if(cursorPosition.start == cursorPosition.end){
                key='_';
                if(keycode.isBackspace){
                    cursorPosition.dec();
                }
            } else {
                key=this.viewMask.substring(cursorPosition.start,cursorPosition.end);
            }
        }
        if(key){
            this.inputTextElement.value = cursorPosition.previousValue.substring(0,cursorPosition.start);
            this.inputTextElement.value+= key +cursorPosition.previousValue.substring(cursorPosition.start + key.length,cursorPosition.previousValue.length);
            return true;
        }
        return false;
    },

    getKeyCode : function(onKeyDownEvent, type) {
        var keycode = {};
        keycode.unicode = onKeyDownEvent.getKey();
        keycode.isShiftPressed = onKeyDownEvent.shiftKey;

        keycode.isDelete = ((onKeyDownEvent.getKey() == Ext.EventObject.DELETE && type=='keydown') || ( type=='keypress' && onKeyDownEvent.charCode===0 && onKeyDownEvent.keyCode == Ext.EventObject.DELETE))? true: false;
        keycode.isTab = (onKeyDownEvent.getKey() == Ext.EventObject.TAB)? true: false;
        keycode.isBackspace = (onKeyDownEvent.getKey() == Ext.EventObject.BACKSPACE)? true: false;
        keycode.isLeftOrRightArrow = (onKeyDownEvent.getKey() == Ext.EventObject.LEFT || onKeyDownEvent.getKey() == Ext.EventObject.RIGHT)? true: false;
        keycode.pressedKey = String.fromCharCode(keycode.unicode);
        return(keycode);
    },

    CursorPosition : function(start, end, range, previousValue) {
        var cursorPosition = {};
        cursorPosition.start = isNaN(start)? 0: start;
        cursorPosition.end = isNaN(end)? 0: end;
        cursorPosition.range = range;
        cursorPosition.previousValue = previousValue;
        cursorPosition.inc = function(){cursorPosition.start++;cursorPosition.end++;};
        cursorPosition.dec = function(){cursorPosition.start--;cursorPosition.end--;};
        return(cursorPosition);
    }
};

Ext.applyIf(RegExp, {
  escape : function(str) {
    return str.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  }
});

Ext.ux.InputTextMask=Ext.ux.InputTextMask;/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
/*
 * Note that this control will most likely remain as an example, and not as a core Ext form
 * control.  However, the API will be changing in a future release and so should not yet be
 * treated as a final, stable API at this time.
 */

/**
 * @class Ext.ux.form.ItemSelector
 * @extends Ext.form.Field
 * A control that allows selection of between two Ext.ux.form.MultiSelect controls.
 *
 *  @history
 *    2008-06-19 bpm Original code contributed by Toby Stuart (with contributions from Robert Williams)
 *
 * @constructor
 * Create a new ItemSelector
 * @param {Object} config Configuration options
 * @xtype itemselector 
 */
Ext.ux.form.ItemSelector = Ext.extend(Ext.form.Field,  {
    hideNavIcons:false,
    imagePath:"",
    iconUp:"up2.gif",
    iconDown:"down2.gif",
    iconLeft:"left2.gif",
    iconRight:"right2.gif",
    iconTop:"top2.gif",
    iconBottom:"bottom2.gif",
    drawUpIcon:true,
    drawDownIcon:true,
    drawLeftIcon:true,
    drawRightIcon:true,
    drawTopIcon:true,
    drawBotIcon:true,
    delimiter:',',
    bodyStyle:null,
    border:false,
    defaultAutoCreate:{tag: "div"},
    /**
     * @cfg {Array} multiselects An array of {@link Ext.ux.form.MultiSelect} config objects, with at least all required parameters (e.g., store)
     */
    multiselects:null,

    initComponent: function(){
        Ext.ux.form.ItemSelector.superclass.initComponent.call(this);
        this.addEvents({
            'rowdblclick' : true,
            'change' : true
        });
    },

    onRender: function(ct, position){
        Ext.ux.form.ItemSelector.superclass.onRender.call(this, ct, position);

        // Internal default configuration for both multiselects
        var msConfig = [{
            legend: 'Available',
            draggable: true,
            droppable: true,
            width: 100,
            height: 100
        },{
            legend: 'Selected',
            droppable: true,
            draggable: true,
            width: 100,
            height: 100
        }];

        this.fromMultiselect = new Ext.ux.form.MultiSelect(Ext.applyIf(this.multiselects[0], msConfig[0]));
        this.fromMultiselect.on('dblclick', this.onRowDblClick, this);

        this.toMultiselect = new Ext.ux.form.MultiSelect(Ext.applyIf(this.multiselects[1], msConfig[1]));
        this.toMultiselect.on('dblclick', this.onRowDblClick, this);

        var p = new Ext.Panel({
            bodyStyle:this.bodyStyle,
            border:this.border,
            layout:"table",
            layoutConfig:{columns:3}
        });

        p.add(this.fromMultiselect);
        var icons = new Ext.Panel({header:false});
        p.add(icons);
        p.add(this.toMultiselect);
        p.render(this.el);
        icons.el.down('.'+icons.bwrapCls).remove();

        // ICON HELL!!!
        if (this.imagePath!="" && this.imagePath.charAt(this.imagePath.length-1)!="/")
            this.imagePath+="/";
        this.iconUp = this.imagePath + (this.iconUp || 'up2.gif');
        this.iconDown = this.imagePath + (this.iconDown || 'down2.gif');
        this.iconLeft = this.imagePath + (this.iconLeft || 'left2.gif');
        this.iconRight = this.imagePath + (this.iconRight || 'right2.gif');
        this.iconTop = this.imagePath + (this.iconTop || 'top2.gif');
        this.iconBottom = this.imagePath + (this.iconBottom || 'bottom2.gif');
        var el=icons.getEl();
        this.toTopIcon = el.createChild({tag:'img', src:this.iconTop, style:{cursor:'pointer', margin:'2px'}});
        el.createChild({tag: 'br'});
        this.upIcon = el.createChild({tag:'img', src:this.iconUp, style:{cursor:'pointer', margin:'2px'}});
        el.createChild({tag: 'br'});
        this.addIcon = el.createChild({tag:'img', src:this.iconRight, style:{cursor:'pointer', margin:'2px'}});
        el.createChild({tag: 'br'});
        this.removeIcon = el.createChild({tag:'img', src:this.iconLeft, style:{cursor:'pointer', margin:'2px'}});
        el.createChild({tag: 'br'});
        this.downIcon = el.createChild({tag:'img', src:this.iconDown, style:{cursor:'pointer', margin:'2px'}});
        el.createChild({tag: 'br'});
        this.toBottomIcon = el.createChild({tag:'img', src:this.iconBottom, style:{cursor:'pointer', margin:'2px'}});
        this.toTopIcon.on('click', this.toTop, this);
        this.upIcon.on('click', this.up, this);
        this.downIcon.on('click', this.down, this);
        this.toBottomIcon.on('click', this.toBottom, this);
        this.addIcon.on('click', this.fromTo, this);
        this.removeIcon.on('click', this.toFrom, this);
        if (!this.drawUpIcon || this.hideNavIcons) { this.upIcon.dom.style.display='none'; }
        if (!this.drawDownIcon || this.hideNavIcons) { this.downIcon.dom.style.display='none'; }
        if (!this.drawLeftIcon || this.hideNavIcons) { this.addIcon.dom.style.display='none'; }
        if (!this.drawRightIcon || this.hideNavIcons) { this.removeIcon.dom.style.display='none'; }
        if (!this.drawTopIcon || this.hideNavIcons) { this.toTopIcon.dom.style.display='none'; }
        if (!this.drawBotIcon || this.hideNavIcons) { this.toBottomIcon.dom.style.display='none'; }

        var tb = p.body.first();
        this.el.setWidth(p.body.first().getWidth());
        p.body.removeClass();

        this.hiddenName = this.name;
        var hiddenTag = {tag: "input", type: "hidden", value: "", name: this.name};
        this.hiddenField = this.el.createChild(hiddenTag);
    },
    
    doLayout: function(){
        if(this.rendered){
            this.fromMultiselect.fs.doLayout();
            this.toMultiselect.fs.doLayout();
        }
    },

    afterRender: function(){
        Ext.ux.form.ItemSelector.superclass.afterRender.call(this);

        this.toStore = this.toMultiselect.store;
        this.toStore.on('add', this.valueChanged, this);
        this.toStore.on('remove', this.valueChanged, this);
        this.toStore.on('load', this.valueChanged, this);
        this.valueChanged(this.toStore);
    },

    toTop : function() {
        var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
        var records = [];
        if (selectionsArray.length > 0) {
            selectionsArray.sort();
            for (var i=0; i<selectionsArray.length; i++) {
                record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
                records.push(record);
            }
            selectionsArray = [];
            for (var i=records.length-1; i>-1; i--) {
                record = records[i];
                this.toMultiselect.view.store.remove(record);
                this.toMultiselect.view.store.insert(0, record);
                selectionsArray.push(((records.length - 1) - i));
            }
        }
        this.toMultiselect.view.refresh();
        this.toMultiselect.view.select(selectionsArray);
    },

    toBottom : function() {
        var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
        var records = [];
        if (selectionsArray.length > 0) {
            selectionsArray.sort();
            for (var i=0; i<selectionsArray.length; i++) {
                record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
                records.push(record);
            }
            selectionsArray = [];
            for (var i=0; i<records.length; i++) {
                record = records[i];
                this.toMultiselect.view.store.remove(record);
                this.toMultiselect.view.store.add(record);
                selectionsArray.push((this.toMultiselect.view.store.getCount()) - (records.length - i));
            }
        }
        this.toMultiselect.view.refresh();
        this.toMultiselect.view.select(selectionsArray);
    },

    up : function() {
        var record = null;
        var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
        selectionsArray.sort();
        var newSelectionsArray = [];
        if (selectionsArray.length > 0) {
            for (var i=0; i<selectionsArray.length; i++) {
                record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
                if ((selectionsArray[i] - 1) >= 0) {
                    this.toMultiselect.view.store.remove(record);
                    this.toMultiselect.view.store.insert(selectionsArray[i] - 1, record);
                    newSelectionsArray.push(selectionsArray[i] - 1);
                }
            }
            this.toMultiselect.view.refresh();
            this.toMultiselect.view.select(newSelectionsArray);
        }
    },

    down : function() {
        var record = null;
        var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
        selectionsArray.sort();
        selectionsArray.reverse();
        var newSelectionsArray = [];
        if (selectionsArray.length > 0) {
            for (var i=0; i<selectionsArray.length; i++) {
                record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
                if ((selectionsArray[i] + 1) < this.toMultiselect.view.store.getCount()) {
                    this.toMultiselect.view.store.remove(record);
                    this.toMultiselect.view.store.insert(selectionsArray[i] + 1, record);
                    newSelectionsArray.push(selectionsArray[i] + 1);
                }
            }
            this.toMultiselect.view.refresh();
            this.toMultiselect.view.select(newSelectionsArray);
        }
    },

    fromTo : function() {
        var selectionsArray = this.fromMultiselect.view.getSelectedIndexes();
        var records = [];
        if (selectionsArray.length > 0) {
            for (var i=0; i<selectionsArray.length; i++) {
                record = this.fromMultiselect.view.store.getAt(selectionsArray[i]);
                records.push(record);
            }
            if(!this.allowDup)selectionsArray = [];
            for (var i=0; i<records.length; i++) {
                record = records[i];
                if(this.allowDup){
                    var x=new Ext.data.Record();
                    record.id=x.id;
                    delete x;
                    this.toMultiselect.view.store.add(record);
                }else{
                    this.fromMultiselect.view.store.remove(record);
                    this.toMultiselect.view.store.add(record);
                    selectionsArray.push((this.toMultiselect.view.store.getCount() - 1));
                }
            }
        }
        this.toMultiselect.view.refresh();
        this.fromMultiselect.view.refresh();
        var si = this.toMultiselect.store.sortInfo;
        if(si){
            this.toMultiselect.store.sort(si.field, si.direction);
        }
        this.toMultiselect.view.select(selectionsArray);
    },

    toFrom : function() {
        var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
        var records = [];
        if (selectionsArray.length > 0) {
            for (var i=0; i<selectionsArray.length; i++) {
                record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
                records.push(record);
            }
            selectionsArray = [];
            for (var i=0; i<records.length; i++) {
                record = records[i];
                this.toMultiselect.view.store.remove(record);
                if(!this.allowDup){
                    this.fromMultiselect.view.store.add(record);
                    selectionsArray.push((this.fromMultiselect.view.store.getCount() - 1));
                }
            }
        }
        this.fromMultiselect.view.refresh();
        this.toMultiselect.view.refresh();
        var si = this.fromMultiselect.store.sortInfo;
        if (si){
            this.fromMultiselect.store.sort(si.field, si.direction);
        }
        this.fromMultiselect.view.select(selectionsArray);
    },

    valueChanged: function(store) {
        var record = null;
        var values = [];
        for (var i=0; i<store.getCount(); i++) {
            record = store.getAt(i);
            values.push(record.get(this.toMultiselect.valueField));
        }
        this.hiddenField.dom.value = values.join(this.delimiter);
        this.fireEvent('change', this, this.getValue(), this.hiddenField.dom.value);
    },

    getValue : function() {
        return this.hiddenField.dom.value;
    },

    onRowDblClick : function(vw, index, node, e) {
        if (vw == this.toMultiselect.view){
            this.toFrom();
        } else if (vw == this.fromMultiselect.view) {
            this.fromTo();
        }
        return this.fireEvent('rowdblclick', vw, index, node, e);
    },

    reset: function(){
        range = this.toMultiselect.store.getRange();
        this.toMultiselect.store.removeAll();
        this.fromMultiselect.store.add(range);
        var si = this.fromMultiselect.store.sortInfo;
        if (si){
            this.fromMultiselect.store.sort(si.field, si.direction);
        }
        this.valueChanged(this.toMultiselect.store);
    }
});

Ext.reg('itemselector', Ext.ux.form.ItemSelector);

//backwards compat
Ext.ux.ItemSelector = Ext.ux.form.ItemSelector;
/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.ns('Ext.ux.form');

/**
 * @class Ext.ux.form.MultiSelect
 * @extends Ext.form.Field
 * A control that allows selection and form submission of multiple list items.
 *
 *  @history
 *    2008-06-19 bpm Original code contributed by Toby Stuart (with contributions from Robert Williams)
 *    2008-06-19 bpm Docs and demo code clean up
 *
 * @constructor
 * Create a new MultiSelect
 * @param {Object} config Configuration options
 * @xtype multiselect
 */
Ext.ux.form.MultiSelect = Ext.extend(Ext.form.Field,  {
    /**
     * @cfg {String} legend Wraps the object with a fieldset and specified legend.
     */
    /**
     * @cfg {Ext.ListView} view The {@link Ext.ListView} used to render the multiselect list.
     */
    /**
     * @cfg {String/Array} dragGroup The ddgroup name(s) for the MultiSelect DragZone (defaults to undefined).
     */
    /**
     * @cfg {String/Array} dropGroup The ddgroup name(s) for the MultiSelect DropZone (defaults to undefined).
     */
    /**
     * @cfg {Boolean} ddReorder Whether the items in the MultiSelect list are drag/drop reorderable (defaults to false).
     */
    ddReorder:false,
    /**
     * @cfg {Object/Array} tbar The top toolbar of the control. This can be a {@link Ext.Toolbar} object, a
     * toolbar config, or an array of buttons/button configs to be added to the toolbar.
     */
    /**
     * @cfg {String} appendOnly True if the list should only allow append drops when drag/drop is enabled
     * (use for lists which are sorted, defaults to false).
     */
    appendOnly:false,
    /**
     * @cfg {Number} width Width in pixels of the control (defaults to 100).
     */
    width:100,
    /**
     * @cfg {Number} height Height in pixels of the control (defaults to 100).
     */
    height:100,
    /**
     * @cfg {String/Number} displayField Name/Index of the desired display field in the dataset (defaults to 0).
     */
    displayField:0,
    /**
     * @cfg {String/Number} valueField Name/Index of the desired value field in the dataset (defaults to 1).
     */
    valueField:1,
    /**
     * @cfg {Boolean} allowBlank False to require at least one item in the list to be selected, true to allow no
     * selection (defaults to true).
     */
    allowBlank:true,
    /**
     * @cfg {Number} minSelections Minimum number of selections allowed (defaults to 0).
     */
    minSelections:0,
    /**
     * @cfg {Number} maxSelections Maximum number of selections allowed (defaults to Number.MAX_VALUE).
     */
    maxSelections:Number.MAX_VALUE,
    /**
     * @cfg {String} blankText Default text displayed when the control contains no items (defaults to the same value as
     * {@link Ext.form.TextField#blankText}.
     */
    blankText:Ext.form.TextField.prototype.blankText,
    /**
     * @cfg {String} minSelectionsText Validation message displayed when {@link #minSelections} is not met (defaults to 'Minimum {0}
     * item(s) required').  The {0} token will be replaced by the value of {@link #minSelections}.
     */
    minSelectionsText:'Minimum {0} item(s) required',
    /**
     * @cfg {String} maxSelectionsText Validation message displayed when {@link #maxSelections} is not met (defaults to 'Maximum {0}
     * item(s) allowed').  The {0} token will be replaced by the value of {@link #maxSelections}.
     */
    maxSelectionsText:'Maximum {0} item(s) allowed',
    /**
     * @cfg {String} delimiter The string used to delimit between items when set or returned as a string of values
     * (defaults to ',').
     */
    delimiter:',',
    /**
     * @cfg {Ext.data.Store/Array} store The data source to which this MultiSelect is bound (defaults to <tt>undefined</tt>).
     * Acceptable values for this property are:
     * <div class="mdetail-params"><ul>
     * <li><b>any {@link Ext.data.Store Store} subclass</b></li>
     * <li><b>an Array</b> : Arrays will be converted to a {@link Ext.data.ArrayStore} internally.
     * <div class="mdetail-params"><ul>
     * <li><b>1-dimensional array</b> : (e.g., <tt>['Foo','Bar']</tt>)<div class="sub-desc">
     * A 1-dimensional array will automatically be expanded (each array item will be the combo
     * {@link #valueField value} and {@link #displayField text})</div></li>
     * <li><b>2-dimensional array</b> : (e.g., <tt>[['f','Foo'],['b','Bar']]</tt>)<div class="sub-desc">
     * For a multi-dimensional array, the value in index 0 of each item will be assumed to be the combo
     * {@link #valueField value}, while the value at index 1 is assumed to be the combo {@link #displayField text}.
     * </div></li></ul></div></li></ul></div>
     */

    // private
    defaultAutoCreate : {tag: "div"},

    // private
    initComponent: function(){
        Ext.ux.form.MultiSelect.superclass.initComponent.call(this);

        if(Ext.isArray(this.store)){
            if (Ext.isArray(this.store[0])){
                this.store = new Ext.data.ArrayStore({
                    fields: ['value','text'],
                    data: this.store
                });
                this.valueField = 'value';
            }else{
                this.store = new Ext.data.ArrayStore({
                    fields: ['text'],
                    data: this.store,
                    expandData: true
                });
                this.valueField = 'text';
            }
            this.displayField = 'text';
        } else {
            this.store = Ext.StoreMgr.lookup(this.store);
        }

        this.addEvents({
            'dblclick' : true,
            'click' : true,
            'change' : true,
            'drop' : true
        });
    },

    // private
    onRender: function(ct, position){
        Ext.ux.form.MultiSelect.superclass.onRender.call(this, ct, position);

        var fs = this.fs = new Ext.form.FieldSet({
            renderTo: this.el,
            title: this.legend,
            height: this.height,
            width: this.width,
            style: "padding:0;",
            tbar: this.tbar
        });
        fs.body.addClass('ux-mselect');

        this.view = new Ext.ListView({
            multiSelect: true,
            store: this.store,
            columns: [{ header: 'Value', width: 1, dataIndex: this.displayField }],
            hideHeaders: true
        });

        fs.add(this.view);

        this.view.on('click', this.onViewClick, this);
        this.view.on('beforeclick', this.onViewBeforeClick, this);
        this.view.on('dblclick', this.onViewDblClick, this);

        this.hiddenName = this.name || Ext.id();
        var hiddenTag = { tag: "input", type: "hidden", value: "", name: this.hiddenName };
        this.hiddenField = this.el.createChild(hiddenTag);
        this.hiddenField.dom.disabled = this.hiddenName != this.name;
        fs.doLayout();
    },

    // private
    afterRender: function(){
        Ext.ux.form.MultiSelect.superclass.afterRender.call(this);

        if (this.ddReorder && !this.dragGroup && !this.dropGroup){
            this.dragGroup = this.dropGroup = 'MultiselectDD-' + Ext.id();
        }

        if (this.draggable || this.dragGroup){
            this.dragZone = new Ext.ux.form.MultiSelect.DragZone(this, {
                ddGroup: this.dragGroup
            });
        }
        if (this.droppable || this.dropGroup){
            this.dropZone = new Ext.ux.form.MultiSelect.DropZone(this, {
                ddGroup: this.dropGroup
            });
        }
    },

    // private
    onViewClick: function(vw, index, node, e) {
        this.fireEvent('change', this, this.getValue(), this.hiddenField.dom.value);
        this.hiddenField.dom.value = this.getValue();
        this.fireEvent('click', this, e);
        this.validate();
    },

    // private
    onViewBeforeClick: function(vw, index, node, e) {
        if (this.disabled || this.readOnly) {
            return false;
        }
    },

    // private
    onViewDblClick : function(vw, index, node, e) {
        return this.fireEvent('dblclick', vw, index, node, e);
    },

    /**
     * Returns an array of data values for the selected items in the list. The values will be separated
     * by {@link #delimiter}.
     * @return {Array} value An array of string data values
     */
    getValue: function(valueField){
        var returnArray = [];
        var selectionsArray = this.view.getSelectedIndexes();
        if (selectionsArray.length == 0) {return '';}
        for (var i=0; i<selectionsArray.length; i++) {
            returnArray.push(this.store.getAt(selectionsArray[i]).get((valueField != null) ? valueField : this.valueField));
        }
        return returnArray.join(this.delimiter);
    },

    /**
     * Sets a delimited string (using {@link #delimiter}) or array of data values into the list.
     * @param {String/Array} values The values to set
     */
    setValue: function(values) {
        var index;
        var selections = [];
        this.view.clearSelections();
        this.hiddenField.dom.value = '';

        if (!values || (values == '')) { return; }

        if (!Ext.isArray(values)) { values = values.split(this.delimiter); }
        for (var i=0; i<values.length; i++) {
            index = this.view.store.indexOf(this.view.store.query(this.valueField,
                new RegExp('^' + values[i] + '$', "i")).itemAt(0));
            selections.push(index);
        }
        this.view.select(selections);
        this.hiddenField.dom.value = this.getValue();
        this.validate();
    },

    // inherit docs
    reset : function() {
        this.setValue('');
    },

    // inherit docs
    getRawValue: function(valueField) {
        var tmp = this.getValue(valueField);
        if (tmp.length) {
            tmp = tmp.split(this.delimiter);
        }
        else {
            tmp = [];
        }
        return tmp;
    },

    // inherit docs
    setRawValue: function(values){
        setValue(values);
    },

    // inherit docs
    validateValue : function(value){
        if (value.length < 1) { // if it has no value
             if (this.allowBlank) {
                 this.clearInvalid();
                 return true;
             } else {
                 this.markInvalid(this.blankText);
                 return false;
             }
        }
        if (value.length < this.minSelections) {
            this.markInvalid(String.format(this.minSelectionsText, this.minSelections));
            return false;
        }
        if (value.length > this.maxSelections) {
            this.markInvalid(String.format(this.maxSelectionsText, this.maxSelections));
            return false;
        }
        return true;
    },

    // inherit docs
    disable: function(){
        this.disabled = true;
        this.hiddenField.dom.disabled = true;
        this.fs.disable();
    },

    // inherit docs
    enable: function(){
        this.disabled = false;
        this.hiddenField.dom.disabled = false;
        this.fs.enable();
    },

    // inherit docs
    destroy: function(){
        Ext.destroy(this.fs, this.dragZone, this.dropZone);
        Ext.ux.form.MultiSelect.superclass.destroy.call(this);
    }
});


Ext.reg('multiselect', Ext.ux.form.MultiSelect);

//backwards compat
Ext.ux.Multiselect = Ext.ux.form.MultiSelect;


Ext.ux.form.MultiSelect.DragZone = function(ms, config){
    this.ms = ms;
    this.view = ms.view;
    var ddGroup = config.ddGroup || 'MultiselectDD';
    var dd;
    if (Ext.isArray(ddGroup)){
        dd = ddGroup.shift();
    } else {
        dd = ddGroup;
        ddGroup = null;
    }
    Ext.ux.form.MultiSelect.DragZone.superclass.constructor.call(this, this.ms.fs.body, { containerScroll: true, ddGroup: dd });
    this.setDraggable(ddGroup);
};

Ext.extend(Ext.ux.form.MultiSelect.DragZone, Ext.dd.DragZone, {
    onInitDrag : function(x, y){
        var el = Ext.get(this.dragData.ddel.cloneNode(true));
        this.proxy.update(el.dom);
        el.setWidth(el.child('em').getWidth());
        this.onStartDrag(x, y);
        return true;
    },

    // private
    collectSelection: function(data) {
        data.repairXY = Ext.fly(this.view.getSelectedNodes()[0]).getXY();
        var i = 0;
        this.view.store.each(function(rec){
            if (this.view.isSelected(i)) {
                var n = this.view.getNode(i);
                var dragNode = n.cloneNode(true);
                dragNode.id = Ext.id();
                data.ddel.appendChild(dragNode);
                data.records.push(this.view.store.getAt(i));
                data.viewNodes.push(n);
            }
            i++;
        }, this);
    },

    // override
    onEndDrag: function(data, e) {
        var d = Ext.get(this.dragData.ddel);
        if (d && d.hasClass("multi-proxy")) {
            d.remove();
        }
    },

    // override
    getDragData: function(e){
        var target = this.view.findItemFromChild(e.getTarget());
        if(target) {
            if (!this.view.isSelected(target) && !e.ctrlKey && !e.shiftKey) {
                this.view.select(target);
                this.ms.setValue(this.ms.getValue());
            }
            if (this.view.getSelectionCount() == 0 || e.ctrlKey || e.shiftKey) return false;
            var dragData = {
                sourceView: this.view,
                viewNodes: [],
                records: []
            };
            if (this.view.getSelectionCount() == 1) {
                var i = this.view.getSelectedIndexes()[0];
                var n = this.view.getNode(i);
                dragData.viewNodes.push(dragData.ddel = n);
                dragData.records.push(this.view.store.getAt(i));
                dragData.repairXY = Ext.fly(n).getXY();
            } else {
                dragData.ddel = document.createElement('div');
                dragData.ddel.className = 'multi-proxy';
                this.collectSelection(dragData);
            }
            return dragData;
        }
        return false;
    },

    // override the default repairXY.
    getRepairXY : function(e){
        return this.dragData.repairXY;
    },

    // private
    setDraggable: function(ddGroup){
        if (!ddGroup) return;
        if (Ext.isArray(ddGroup)) {
            Ext.each(ddGroup, this.setDraggable, this);
            return;
        }
        this.addToGroup(ddGroup);
    }
});

Ext.ux.form.MultiSelect.DropZone = function(ms, config){
    this.ms = ms;
    this.view = ms.view;
    var ddGroup = config.ddGroup || 'MultiselectDD';
    var dd;
    if (Ext.isArray(ddGroup)){
        dd = ddGroup.shift();
    } else {
        dd = ddGroup;
        ddGroup = null;
    }
    Ext.ux.form.MultiSelect.DropZone.superclass.constructor.call(this, this.ms.fs.body, { containerScroll: true, ddGroup: dd });
    this.setDroppable(ddGroup);
};

Ext.extend(Ext.ux.form.MultiSelect.DropZone, Ext.dd.DropZone, {
    /**
     * Part of the Ext.dd.DropZone interface. If no target node is found, the
     * whole Element becomes the target, and this causes the drop gesture to append.
     */
    getTargetFromEvent : function(e) {
        var target = e.getTarget();
        return target;
    },

    // private
    getDropPoint : function(e, n, dd){
        if (n == this.ms.fs.body.dom) { return "below"; }
        var t = Ext.lib.Dom.getY(n), b = t + n.offsetHeight;
        var c = t + (b - t) / 2;
        var y = Ext.lib.Event.getPageY(e);
        if(y <= c) {
            return "above";
        }else{
            return "below";
        }
    },

    // private
    isValidDropPoint: function(pt, n, data) {
        if (!data.viewNodes || (data.viewNodes.length != 1)) {
            return true;
        }
        var d = data.viewNodes[0];
        if (d == n) {
            return false;
        }
        if ((pt == "below") && (n.nextSibling == d)) {
            return false;
        }
        if ((pt == "above") && (n.previousSibling == d)) {
            return false;
        }
        return true;
    },

    // override
    onNodeEnter : function(n, dd, e, data){
        return false;
    },

    // override
    onNodeOver : function(n, dd, e, data){
        var dragElClass = this.dropNotAllowed;
        var pt = this.getDropPoint(e, n, dd);
        if (this.isValidDropPoint(pt, n, data)) {
            if (this.ms.appendOnly) {
                return "x-tree-drop-ok-below";
            }

            // set the insert point style on the target node
            if (pt) {
                var targetElClass;
                if (pt == "above"){
                    dragElClass = n.previousSibling ? "x-tree-drop-ok-between" : "x-tree-drop-ok-above";
                    targetElClass = "x-view-drag-insert-above";
                } else {
                    dragElClass = n.nextSibling ? "x-tree-drop-ok-between" : "x-tree-drop-ok-below";
                    targetElClass = "x-view-drag-insert-below";
                }
                if (this.lastInsertClass != targetElClass){
                    Ext.fly(n).replaceClass(this.lastInsertClass, targetElClass);
                    this.lastInsertClass = targetElClass;
                }
            }
        }
        return dragElClass;
    },

    // private
    onNodeOut : function(n, dd, e, data){
        this.removeDropIndicators(n);
    },

    // private
    onNodeDrop : function(n, dd, e, data){
        if (this.ms.fireEvent("drop", this, n, dd, e, data) === false) {
            return false;
        }
        var pt = this.getDropPoint(e, n, dd);
        if (n != this.ms.fs.body.dom)
            n = this.view.findItemFromChild(n);

        if(this.ms.appendOnly) {
            insertAt = this.view.store.getCount();
        } else {
            insertAt = n == this.ms.fs.body.dom ? this.view.store.getCount() - 1 : this.view.indexOf(n);
            if (pt == "below") {
                insertAt++;
            }
        }

        var dir = false;

        // Validate if dragging within the same MultiSelect
        if (data.sourceView == this.view) {
            // If the first element to be inserted below is the target node, remove it
            if (pt == "below") {
                if (data.viewNodes[0] == n) {
                    data.viewNodes.shift();
                }
            } else {  // If the last element to be inserted above is the target node, remove it
                if (data.viewNodes[data.viewNodes.length - 1] == n) {
                    data.viewNodes.pop();
                }
            }

            // Nothing to drop...
            if (!data.viewNodes.length) {
                return false;
            }

            // If we are moving DOWN, then because a store.remove() takes place first,
            // the insertAt must be decremented.
            if (insertAt > this.view.store.indexOf(data.records[0])) {
                dir = 'down';
                insertAt--;
            }
        }

        for (var i = 0; i < data.records.length; i++) {
            var r = data.records[i];
            if (data.sourceView) {
                data.sourceView.store.remove(r);
            }
            this.view.store.insert(dir == 'down' ? insertAt : insertAt++, r);
            var si = this.view.store.sortInfo;
            if(si){
                this.view.store.sort(si.field, si.direction);
            }
        }
        return true;
    },

    // private
    removeDropIndicators : function(n){
        if(n){
            Ext.fly(n).removeClass([
                "x-view-drag-insert-above",
                "x-view-drag-insert-left",
                "x-view-drag-insert-right",
                "x-view-drag-insert-below"]);
            this.lastInsertClass = "_noclass";
        }
    },

    // private
    setDroppable: function(ddGroup){
        if (!ddGroup) return;
        if (Ext.isArray(ddGroup)) {
            Ext.each(ddGroup, this.setDroppable, this);
            return;
        }
        this.addToGroup(ddGroup);
    }
});
/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

/* Fix for Opera, which does not seem to include the map function on Array's */
if (!Array.prototype.map) {
    Array.prototype.map = function(fun){
        var len = this.length;
        if (typeof fun != 'function') {
            throw new TypeError();
        }
        var res = new Array(len);
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this) {
                res[i] = fun.call(thisp, this[i], i, this);
            }
        }
        return res;
    };
}

Ext.ns('Ext.ux.data');

/**
 * @class Ext.ux.data.PagingMemoryProxy
 * @extends Ext.data.MemoryProxy
 * <p>Paging Memory Proxy, allows to use paging grid with in memory dataset</p>
 */
Ext.ux.data.PagingMemoryProxy = Ext.extend(Ext.data.MemoryProxy, {
    constructor : function(data){
        Ext.ux.data.PagingMemoryProxy.superclass.constructor.call(this);
        this.data = data;
    },
    doRequest : function(action, rs, params, reader, callback, scope, options){
        params = params ||
        {};
        var result;
        try {
            result = reader.readRecords(this.data);
        } 
        catch (e) {
            this.fireEvent('loadexception', this, options, null, e);
            callback.call(scope, null, options, false);
            return;
        }
        
        // filtering
        if (params.filter !== undefined) {
            result.records = result.records.filter(function(el){
                if (typeof(el) == 'object') {
                    var att = params.filterCol || 0;
                    return String(el.data[att]).match(params.filter) ? true : false;
                }
                else {
                    return String(el).match(params.filter) ? true : false;
                }
            });
            result.totalRecords = result.records.length;
        }
        
        // sorting
        if (params.sort !== undefined) {
            // use integer as params.sort to specify column, since arrays are not named
            // params.sort=0; would also match a array without columns
            var dir = String(params.dir).toUpperCase() == 'DESC' ? -1 : 1;
            var fn = function(v1, v2){
                return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
            };
            result.records.sort(function(a, b){
                var v = 0;
                if (typeof(a) == 'object') {
                    v = fn(a.data[params.sort], b.data[params.sort]) * dir;
                }
                else {
                    v = fn(a, b) * dir;
                }
                if (v == 0) {
                    v = (a.index < b.index ? -1 : 1);
                }
                return v;
            });
        }
        // paging (use undefined cause start can also be 0 (thus false))
        if (params.start !== undefined && params.limit !== undefined) {
            result.records = result.records.slice(params.start, params.start + params.limit);
        }
        callback.call(scope, result, options, true);
    }
});

//backwards compat.
Ext.data.PagingMemoryProxy = Ext.ux.data.PagingMemoryProxy;
/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.ux.Portal = Ext.extend(Ext.Panel, {
    layout : 'column',
    autoScroll : true,
    cls : 'x-portal',
    defaultType : 'portalcolumn',
    
    initComponent : function(){
        Ext.ux.Portal.superclass.initComponent.call(this);
        this.addEvents({
            validatedrop:true,
            beforedragover:true,
            dragover:true,
            beforedrop:true,
            drop:true
        });
    },

    initEvents : function(){
        Ext.ux.Portal.superclass.initEvents.call(this);
        this.dd = new Ext.ux.Portal.DropZone(this, this.dropConfig);
    },
    
    beforeDestroy : function() {
        if(this.dd){
            this.dd.unreg();
        }
        Ext.ux.Portal.superclass.beforeDestroy.call(this);
    }
});

Ext.reg('portal', Ext.ux.Portal);

Ext.ux.Portal.DropZone = Ext.extend(Ext.dd.DropTarget, {
    
    constructor : function(portal, cfg){
        this.portal = portal;
        Ext.dd.ScrollManager.register(portal.body);
        Ext.ux.Portal.DropZone.superclass.constructor.call(this, portal.bwrap.dom, cfg);
        portal.body.ddScrollConfig = this.ddScrollConfig;
    },
    
    ddScrollConfig : {
        vthresh: 50,
        hthresh: -1,
        animate: true,
        increment: 200
    },

    createEvent : function(dd, e, data, col, c, pos){
        return {
            portal: this.portal,
            panel: data.panel,
            columnIndex: col,
            column: c,
            position: pos,
            data: data,
            source: dd,
            rawEvent: e,
            status: this.dropAllowed
        };
    },

    notifyOver : function(dd, e, data){
        var xy = e.getXY(), portal = this.portal, px = dd.proxy;

        // case column widths
        if(!this.grid){
            this.grid = this.getGrid();
        }

        // handle case scroll where scrollbars appear during drag
        var cw = portal.body.dom.clientWidth;
        if(!this.lastCW){
            this.lastCW = cw;
        }else if(this.lastCW != cw){
            this.lastCW = cw;
            portal.doLayout();
            this.grid = this.getGrid();
        }

        // determine column
        var col = 0, xs = this.grid.columnX, cmatch = false;
        for(var len = xs.length; col < len; col++){
            if(xy[0] < (xs[col].x + xs[col].w)){
                cmatch = true;
                break;
            }
        }
        // no match, fix last index
        if(!cmatch){
            col--;
        }

        // find insert position
        var p, match = false, pos = 0,
            c = portal.items.itemAt(col),
            items = c.items.items, overSelf = false;

        for(var len = items.length; pos < len; pos++){
            p = items[pos];
            var h = p.el.getHeight();
            if(h === 0){
                overSelf = true;
            }
            else if((p.el.getY()+(h/2)) > xy[1]){
                match = true;
                break;
            }
        }

        pos = (match && p ? pos : c.items.getCount()) + (overSelf ? -1 : 0);
        var overEvent = this.createEvent(dd, e, data, col, c, pos);

        if(portal.fireEvent('validatedrop', overEvent) !== false &&
           portal.fireEvent('beforedragover', overEvent) !== false){

            // make sure proxy width is fluid
            px.getProxy().setWidth('auto');

            if(p){
                px.moveProxy(p.el.dom.parentNode, match ? p.el.dom : null);
            }else{
                px.moveProxy(c.el.dom, null);
            }

            this.lastPos = {c: c, col: col, p: overSelf || (match && p) ? pos : false};
            this.scrollPos = portal.body.getScroll();

            portal.fireEvent('dragover', overEvent);

            return overEvent.status;
        }else{
            return overEvent.status;
        }

    },

    notifyOut : function(){
        delete this.grid;
    },

    notifyDrop : function(dd, e, data){
        delete this.grid;
        if(!this.lastPos){
            return;
        }
        var c = this.lastPos.c, 
            col = this.lastPos.col, 
            pos = this.lastPos.p,
            panel = dd.panel,
            dropEvent = this.createEvent(dd, e, data, col, c,
                pos !== false ? pos : c.items.getCount());

        if(this.portal.fireEvent('validatedrop', dropEvent) !== false &&
           this.portal.fireEvent('beforedrop', dropEvent) !== false){

            dd.proxy.getProxy().remove();
            panel.el.dom.parentNode.removeChild(dd.panel.el.dom);
            
            if(pos !== false){
                c.insert(pos, panel);
            }else{
                c.add(panel);
            }
            
            c.doLayout();

            this.portal.fireEvent('drop', dropEvent);

            // scroll position is lost on drop, fix it
            var st = this.scrollPos.top;
            if(st){
                var d = this.portal.body.dom;
                setTimeout(function(){
                    d.scrollTop = st;
                }, 10);
            }

        }
        delete this.lastPos;
    },

    // internal cache of body and column coords
    getGrid : function(){
        var box = this.portal.bwrap.getBox();
        box.columnX = [];
        this.portal.items.each(function(c){
             box.columnX.push({x: c.el.getX(), w: c.el.getWidth()});
        });
        return box;
    },

    // unregister the dropzone from ScrollManager
    unreg: function() {
        Ext.dd.ScrollManager.unregister(this.portal.body);
        Ext.ux.Portal.DropZone.superclass.unreg.call(this);
    }
});
/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.ux.PortalColumn = Ext.extend(Ext.Container, {
    layout : 'anchor',
    //autoEl : 'div',//already defined by Ext.Component
    defaultType : 'portlet',
    cls : 'x-portal-column'
});

Ext.reg('portalcolumn', Ext.ux.PortalColumn);
/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.ux.Portlet = Ext.extend(Ext.Panel, {
    anchor : '100%',
    frame : true,
    collapsible : true,
    draggable : true,
    cls : 'x-portlet'
});

Ext.reg('portlet', Ext.ux.Portlet);
/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.ns('Ext.ux.grid');

/**
 * @class Ext.ux.grid.RowEditor
 * @extends Ext.Panel
 * Plugin (ptype = 'roweditor') that adds the ability to rapidly edit full rows in a grid.
 * A validation mode may be enabled which uses AnchorTips to notify the user of all
 * validation errors at once.
 *
 * @ptype roweditor
 */
Ext.ux.grid.RowEditor = Ext.extend(Ext.Panel, {
    floating: true,
    shadow: false,
    layout: 'hbox',
    cls: 'x-small-editor',
    buttonAlign: 'center',
    baseCls: 'x-row-editor',
    elements: 'header,footer,body',
    frameWidth: 5,
    buttonPad: 3,
    clicksToEdit: 'auto',
    monitorValid: true,
    focusDelay: 250,
    errorSummary: true,

    saveText: 'Save',
    cancelText: 'Cancel',
    commitChangesText: 'You need to commit or cancel your changes',
    errorText: 'Errors',

    defaults: {
        normalWidth: true
    },

    initComponent: function(){
        Ext.ux.grid.RowEditor.superclass.initComponent.call(this);
        this.addEvents(
            /**
             * @event beforeedit
             * Fired before the row editor is activated.
             * If the listener returns <tt>false</tt> the editor will not be activated.
             * @param {Ext.ux.grid.RowEditor} roweditor This object
             * @param {Number} rowIndex The rowIndex of the row just edited
             */
            'beforeedit',
            /**
             * @event canceledit
             * Fired when the editor is cancelled.
             * @param {Ext.ux.grid.RowEditor} roweditor This object
             * @param {Boolean} forced True if the cancel button is pressed, false is the editor was invalid.
             */
            'canceledit',
            /**
             * @event validateedit
             * Fired after a row is edited and passes validation.
             * If the listener returns <tt>false</tt> changes to the record will not be set.
             * @param {Ext.ux.grid.RowEditor} roweditor This object
             * @param {Object} changes Object with changes made to the record.
             * @param {Ext.data.Record} r The Record that was edited.
             * @param {Number} rowIndex The rowIndex of the row just edited
             */
            'validateedit',
            /**
             * @event afteredit
             * Fired after a row is edited and passes validation.  This event is fired
             * after the store's update event is fired with this edit.
             * @param {Ext.ux.grid.RowEditor} roweditor This object
             * @param {Object} changes Object with changes made to the record.
             * @param {Ext.data.Record} r The Record that was edited.
             * @param {Number} rowIndex The rowIndex of the row just edited
             */
            'afteredit'
        );
    },

    init: function(grid){
        this.grid = grid;
        this.ownerCt = grid;
        if(this.clicksToEdit === 2){
            grid.on('rowdblclick', this.onRowDblClick, this);
        }else{
            grid.on('rowclick', this.onRowClick, this);
            if(Ext.isIE){
                grid.on('rowdblclick', this.onRowDblClick, this);
            }
        }

        // stopEditing without saving when a record is removed from Store.
        grid.getStore().on('remove', function() {
            this.stopEditing(false);
        },this);

        grid.on({
            scope: this,
            keydown: this.onGridKey,
            columnresize: this.verifyLayout,
            columnmove: this.refreshFields,
            reconfigure: this.refreshFields,
            beforedestroy : this.beforedestroy,
            destroy : this.destroy,
            bodyscroll: {
                buffer: 250,
                fn: this.positionButtons
            }
        });
        grid.getColumnModel().on('hiddenchange', this.verifyLayout, this, {delay:1});
        grid.getView().on('refresh', this.stopEditing.createDelegate(this, []));
    },

    beforedestroy: function() {
        this.stopMonitoring();
        this.grid.getStore().un('remove', this.onStoreRemove, this);
        this.stopEditing(false);
        Ext.destroy(this.btns, this.tooltip);
    },

    refreshFields: function(){
        this.initFields();
        this.verifyLayout();
    },

    isDirty: function(){
        var dirty;
        this.items.each(function(f){
            if(String(this.values[f.id]) !== String(f.getValue())){
                dirty = true;
                return false;
            }
        }, this);
        return dirty;
    },

    startEditing: function(rowIndex, doFocus){
        if(this.editing && this.isDirty()){
            this.showTooltip(this.commitChangesText);
            return;
        }
        if(Ext.isObject(rowIndex)){
            rowIndex = this.grid.getStore().indexOf(rowIndex);
        }
        if(this.fireEvent('beforeedit', this, rowIndex) !== false){
            this.editing = true;
            var g = this.grid, view = g.getView(),
                row = view.getRow(rowIndex),
                record = g.store.getAt(rowIndex);

            this.record = record;
            this.rowIndex = rowIndex;
            this.values = {};
            if(!this.rendered){
                this.render(view.getEditorParent());
            }
            var w = Ext.fly(row).getWidth();
            this.setSize(w);
            if(!this.initialized){
                this.initFields();
            }
            var cm = g.getColumnModel(), fields = this.items.items, f, val;
            for(var i = 0, len = cm.getColumnCount(); i < len; i++){
                val = this.preEditValue(record, cm.getDataIndex(i));
                f = fields[i];
                f.setValue(val);
                this.values[f.id] = Ext.isEmpty(val) ? '' : val;
            }
            this.verifyLayout(true);
            if(!this.isVisible()){
                this.setPagePosition(Ext.fly(row).getXY());
            } else{
                this.el.setXY(Ext.fly(row).getXY(), {duration:0.15});
            }
            if(!this.isVisible()){
                this.show().doLayout();
            }
            if(doFocus !== false){
                this.doFocus.defer(this.focusDelay, this);
            }
        }
    },

    stopEditing : function(saveChanges){
        this.editing = false;
        if(!this.isVisible()){
            return;
        }
        if(saveChanges === false || !this.isValid()){
            this.hide();
            this.fireEvent('canceledit', this, saveChanges === false);
            return;
        }
        var changes = {},
            r = this.record,
            hasChange = false,
            cm = this.grid.colModel,
            fields = this.items.items;
        for(var i = 0, len = cm.getColumnCount(); i < len; i++){
            if(!cm.isHidden(i)){
                var dindex = cm.getDataIndex(i);
                if(!Ext.isEmpty(dindex)){
                    var oldValue = r.data[dindex],
                        value = this.postEditValue(fields[i].getValue(), oldValue, r, dindex);
                    if(String(oldValue) !== String(value)){
                        changes[dindex] = value;
                        hasChange = true;
                    }
                }
            }
        }
        if(hasChange && this.fireEvent('validateedit', this, changes, r, this.rowIndex) !== false){
            r.beginEdit();
            Ext.iterate(changes, function(name, value){
                r.set(name, value);
            });
            r.endEdit();
            this.fireEvent('afteredit', this, changes, r, this.rowIndex);
        }
        this.hide();
    },

    verifyLayout: function(force){
        if(this.el && (this.isVisible() || force === true)){
            var row = this.grid.getView().getRow(this.rowIndex);
            this.setSize(Ext.fly(row).getWidth(), Ext.isIE ? Ext.fly(row).getHeight() + 9 : undefined);
            var cm = this.grid.colModel, fields = this.items.items;
            for(var i = 0, len = cm.getColumnCount(); i < len; i++){
                if(!cm.isHidden(i)){
                    var adjust = 0;
                    if(i === (len - 1)){
                        adjust += 3; // outer padding
                    } else{
                        adjust += 1;
                    }
                    fields[i].show();
                    fields[i].setWidth(cm.getColumnWidth(i) - adjust);
                } else{
                    fields[i].hide();
                }
            }
            this.doLayout();
            this.positionButtons();
        }
    },

    slideHide : function(){
        this.hide();
    },

    initFields: function(){
        var cm = this.grid.getColumnModel(), pm = Ext.layout.ContainerLayout.prototype.parseMargins;
        this.removeAll(false);
        for(var i = 0, len = cm.getColumnCount(); i < len; i++){
            var c = cm.getColumnAt(i),
                ed = c.getEditor();
            if(!ed){
                ed = c.displayEditor || new Ext.form.DisplayField();
            }
            if(i == 0){
                ed.margins = pm('0 1 2 1');
            } else if(i == len - 1){
                ed.margins = pm('0 0 2 1');
            } else{
                if (Ext.isIE) {
                    ed.margins = pm('0 0 2 0');
                }
                else {
                    ed.margins = pm('0 1 2 0');
                }
            }
            ed.setWidth(cm.getColumnWidth(i));
            ed.column = c;
            if(ed.ownerCt !== this){
                ed.on('focus', this.ensureVisible, this);
                ed.on('specialkey', this.onKey, this);
            }
            this.insert(i, ed);
        }
        this.initialized = true;
    },

    onKey: function(f, e){
        if(e.getKey() === e.ENTER){
            this.stopEditing(true);
            e.stopPropagation();
        }
    },

    onGridKey: function(e){
        if(e.getKey() === e.ENTER && !this.isVisible()){
            var r = this.grid.getSelectionModel().getSelected();
            if(r){
                var index = this.grid.store.indexOf(r);
                this.startEditing(index);
                e.stopPropagation();
            }
        }
    },

    ensureVisible: function(editor){
        if(this.isVisible()){
             this.grid.getView().ensureVisible(this.rowIndex, this.grid.colModel.getIndexById(editor.column.id), true);
        }
    },

    onRowClick: function(g, rowIndex, e){
        if(this.clicksToEdit == 'auto'){
            var li = this.lastClickIndex;
            this.lastClickIndex = rowIndex;
            if(li != rowIndex && !this.isVisible()){
                return;
            }
        }
        this.startEditing(rowIndex, false);
        this.doFocus.defer(this.focusDelay, this, [e.getPoint()]);
    },

    onRowDblClick: function(g, rowIndex, e){
        this.startEditing(rowIndex, false);
        this.doFocus.defer(this.focusDelay, this, [e.getPoint()]);
    },

    onRender: function(){
        Ext.ux.grid.RowEditor.superclass.onRender.apply(this, arguments);
        this.el.swallowEvent(['keydown', 'keyup', 'keypress']);
        this.btns = new Ext.Panel({
            baseCls: 'x-plain',
            cls: 'x-btns',
            elements:'body',
            layout: 'table',
            width: (this.minButtonWidth * 2) + (this.frameWidth * 2) + (this.buttonPad * 4), // width must be specified for IE
            items: [{
                ref: 'saveBtn',
                itemId: 'saveBtn',
                xtype: 'button',
                text: this.saveText,
                width: this.minButtonWidth,
                handler: this.stopEditing.createDelegate(this, [true])
            }, {
                xtype: 'button',
                text: this.cancelText,
                width: this.minButtonWidth,
                handler: this.stopEditing.createDelegate(this, [false])
            }]
        });
        this.btns.render(this.bwrap);
    },

    afterRender: function(){
        Ext.ux.grid.RowEditor.superclass.afterRender.apply(this, arguments);
        this.positionButtons();
        if(this.monitorValid){
            this.startMonitoring();
        }
    },

    onShow: function(){
        if(this.monitorValid){
            this.startMonitoring();
        }
        Ext.ux.grid.RowEditor.superclass.onShow.apply(this, arguments);
    },

    onHide: function(){
        Ext.ux.grid.RowEditor.superclass.onHide.apply(this, arguments);
        this.stopMonitoring();
        this.grid.getView().focusRow(this.rowIndex);
    },

    positionButtons: function(){
        if(this.btns){
            var g = this.grid,
                h = this.el.dom.clientHeight,
                view = g.getView(),
                scroll = view.scroller.dom.scrollLeft,
                bw = this.btns.getWidth(),
                width = Math.min(g.getWidth(), g.getColumnModel().getTotalWidth());

            this.btns.el.shift({left: (width/2)-(bw/2)+scroll, top: h - 2, stopFx: true, duration:0.2});
        }
    },

    // private
    preEditValue : function(r, field){
        var value = r.data[field];
        return this.autoEncode && typeof value === 'string' ? Ext.util.Format.htmlDecode(value) : value;
    },

    // private
    postEditValue : function(value, originalValue, r, field){
        return this.autoEncode && typeof value == 'string' ? Ext.util.Format.htmlEncode(value) : value;
    },

    doFocus: function(pt){
        if(this.isVisible()){
            var index = 0,
                cm = this.grid.getColumnModel(),
                c;
            if(pt){
                index = this.getTargetColumnIndex(pt);
            }
            for(var i = index||0, len = cm.getColumnCount(); i < len; i++){
                c = cm.getColumnAt(i);
                if(!c.hidden && c.getEditor()){
                    c.getEditor().focus();
                    break;
                }
            }
        }
    },

    getTargetColumnIndex: function(pt){
        var grid = this.grid,
            v = grid.view,
            x = pt.left,
            cms = grid.colModel.config,
            i = 0,
            match = false;
        for(var len = cms.length, c; c = cms[i]; i++){
            if(!c.hidden){
                if(Ext.fly(v.getHeaderCell(i)).getRegion().right >= x){
                    match = i;
                    break;
                }
            }
        }
        return match;
    },

    startMonitoring : function(){
        if(!this.bound && this.monitorValid){
            this.bound = true;
            Ext.TaskMgr.start({
                run : this.bindHandler,
                interval : this.monitorPoll || 200,
                scope: this
            });
        }
    },

    stopMonitoring : function(){
        this.bound = false;
        if(this.tooltip){
            this.tooltip.hide();
        }
    },

    isValid: function(){
        var valid = true;
        this.items.each(function(f){
            if(!f.isValid(true)){
                valid = false;
                return false;
            }
        });
        return valid;
    },

    // private
    bindHandler : function(){
        if(!this.bound){
            return false; // stops binding
        }
        var valid = this.isValid();
        if(!valid && this.errorSummary){
            this.showTooltip(this.getErrorText().join(''));
        }
        this.btns.saveBtn.setDisabled(!valid);
        this.fireEvent('validation', this, valid);
    },

    lastVisibleColumn : function() {
        var i = this.items.getCount() - 1,
            c;
        for(; i >= 0; i--) {
            c = this.items.items[i];
            if (!c.hidden) {
                return c;
            }
        }
    },

    showTooltip: function(msg){
        var t = this.tooltip;
        if(!t){
            t = this.tooltip = new Ext.ToolTip({
                maxWidth: 600,
                cls: 'errorTip',
                width: 300,
                title: this.errorText,
                autoHide: false,
                anchor: 'left',
                anchorToTarget: true,
                mouseOffset: [40,0]
            });
        }
        var v = this.grid.getView(),
            top = parseInt(this.el.dom.style.top, 10),
            scroll = v.scroller.dom.scrollTop,
            h = this.el.getHeight();

        if(top + h >= scroll){
            t.initTarget(this.lastVisibleColumn().getEl());
            if(!t.rendered){
                t.show();
                t.hide();
            }
            t.body.update(msg);
            t.doAutoWidth(20);
            t.show();
        }else if(t.rendered){
            t.hide();
        }
    },

    getErrorText: function(){
        var data = ['<ul>'];
        this.items.each(function(f){
            if(!f.isValid(true)){
                data.push('<li>', f.getActiveError(), '</li>');
            }
        });
        data.push('</ul>');
        return data;
    }
});
Ext.preg('roweditor', Ext.ux.grid.RowEditor);
Ext.namespace('Ext.ux.form');
/**
 * <p>SuperBoxSelect is an extension of the ComboBox component that displays selected items as labelled boxes within the form field. As seen on facebook, hotmail and other sites.</p>
 * 
 * @author <a href="mailto:dan.humphrey@technomedia.co.uk">Dan Humphrey</a>
 * @class Ext.ux.form.SuperBoxSelect
 * @extends Ext.form.ComboBox
 * @constructor
 * @component
 * @version 1.0
 * @license TBA (To be announced)
 * 
 */
Ext.ux.form.SuperBoxSelect = function(config) {
    Ext.ux.form.SuperBoxSelect.superclass.constructor.call(this,config);
    this.addEvents(
        /**
         * Fires before an item is added to the component via user interaction. Return false from the callback function to prevent the item from being added.
         * @event beforeadditem
         * @memberOf Ext.ux.form.SuperBoxSelect
         * @param {SuperBoxSelect} this
         * @param {Mixed} value The value of the item to be added
         */
        'beforeadditem',

        /**
         * Fires after a new item is added to the component.
         * @event additem
         * @memberOf Ext.ux.form.SuperBoxSelect
         * @param {SuperBoxSelect} this
         * @param {Mixed} value The value of the item which was added
         * @param {Record} record The store record which was added
         */
        'additem',

        /**
         * Fires when the allowAddNewData config is set to true, and a user attempts to add an item that is not in the data store.
         * @event newitem
         * @memberOf Ext.ux.form.SuperBoxSelect
         * @param {SuperBoxSelect} this
         * @param {Mixed} value The new item's value
         */
        'newitem',

        /**
         * Fires when an item's remove button is clicked. Return false from the callback function to prevent the item from being removed.
         * @event beforeremoveitem
         * @memberOf Ext.ux.form.SuperBoxSelect
         * @param {SuperBoxSelect} this
         * @param {Mixed} value The value of the item to be removed
         */
        'beforeremoveitem',

        /**
         * Fires after an item has been removed.
         * @event removeitem
         * @memberOf Ext.ux.form.SuperBoxSelect
         * @param {SuperBoxSelect} this
         * @param {Mixed} value The value of the item which was removed
         * @param {Record} record The store record which was removed
         */
        'removeitem',
        /**
         * Fires after the component values have been cleared.
         * @event clear
         * @memberOf Ext.ux.form.SuperBoxSelect
         * @param {SuperBoxSelect} this
         */
        'clear'
    );
    
};
/**
 * @private hide from doc gen
 */
Ext.ux.form.SuperBoxSelect = Ext.extend(Ext.ux.form.SuperBoxSelect,Ext.form.ComboBox,{
    /**
     * @cfg {Boolean} allowAddNewData When set to true, allows items to be added (via the setValueEx and addItem methods) that do not already exist in the data store. Defaults to false.
     */
    allowAddNewData: false,

    /**
     * @cfg {Boolean} backspaceDeletesLastItem When set to false, the BACKSPACE key will focus the last selected item. When set to true, the last item will be immediately deleted. Defaults to true.
     */
    backspaceDeletesLastItem: true,

    /**
     * @cfg {String} classField The underlying data field that will be used to supply an additional class to each item.
     */
    classField: null,

    /**
     * @cfg {String} clearBtnCls An additional class to add to the in-field clear button.
     */
    clearBtnCls: '',

    /**
     * @cfg {String/XTemplate} displayFieldTpl A template for rendering the displayField in each selected item. Defaults to null.
     */
    displayFieldTpl: null,

    /**
     * @cfg {String} extraItemCls An additional css class to apply to each item.
     */
    extraItemCls: '',

    /**
     * @cfg {String/Object/Function} extraItemStyle Additional css style(s) to apply to each item. Should be a valid argument to Ext.Element.applyStyles.
     */
    extraItemStyle: '',

    /**
     * @cfg {String} expandBtnCls An additional class to add to the in-field expand button.
     */
    expandBtnCls: '',

    /**
     * @cfg {Boolean} fixFocusOnTabSelect When set to true, the component will not lose focus when a list item is selected with the TAB key. Defaults to true.
     */
    fixFocusOnTabSelect: true,
    /**
     * @cfg {Boolean} forceFormValue When set to true, the component will always return a value to the parent form getValues method, and when the parent form is submitted manually. Defaults to false, meaning the component will only be included in the parent form submission (or getValues) if at least 1 item has been selected.  
     */
    forceFormValue: true,
    /**
     * @cfg {Boolean} forceSameValueQuery When set to true, the component will always query the server even when the last query was the same. Defaults to false.  
     */
    forceSameValueQuery : false,
    /**
     * @cfg {Number} itemDelimiterKey The key code which terminates keying in of individual items, and adds the current
     * item to the list. Defaults to the ENTER key.
     */
    itemDelimiterKey: Ext.EventObject.ENTER,    
    /**
     * @cfg {Boolean} navigateItemsWithTab When set to true the tab key will navigate between selected items. Defaults to true.
     */
    navigateItemsWithTab: true,
    /**
     * @cfg {Boolean} pinList When set to true and the list is opened via the arrow button, the select list will be pinned to allow for multiple selections. Defaults to true.
     */
    pinList: true,

    /**
     * @cfg {Boolean} preventDuplicates When set to true unique item values will be enforced. Defaults to true.
     */
    preventDuplicates: true,
    
    /**
     * @cfg {String} queryValuesDelimiter Used to delimit multiple values queried from the server when mode is remote.
     */
    queryValuesDelimiter: '|',
    
    /**
     * @cfg {String} queryValuesIndicator A request variable that is sent to the server (as true) to indicate that we are querying values rather than display data (as used in autocomplete) when mode is remote.
     */
    queryValuesIndicator: 'valuesqry',

    /**
     * @cfg {Boolean} removeValuesFromStore When set to true, selected records will be removed from the store. Defaults to true.
     */
    removeValuesFromStore: true,

    /**
     * @cfg {String} renderFieldBtns When set to true, will render in-field buttons for clearing the component, and displaying the list for selection. Defaults to true.
     */
    renderFieldBtns: true,

    /**
     * @cfg {Boolean} stackItems When set to true, the items will be stacked 1 per line. Defaults to false which displays the items inline.
     */
    stackItems: false,

    /**
     * @cfg {String} styleField The underlying data field that will be used to supply additional css styles to each item.
     */
    styleField : null,
    
     /**
     * @cfg {Boolean} supressClearValueRemoveEvents When true, the removeitem event will not be fired for each item when the clearValue method is called, or when the clear button is used. Defaults to false.
     */
    supressClearValueRemoveEvents : false,
    
    /**
     * @cfg {String/Boolean} validationEvent The event that should initiate field validation. Set to false to disable automatic validation (defaults to 'blur').
     */
	validationEvent : 'blur',
	
    /**
     * @cfg {String} valueDelimiter The delimiter to use when joining and splitting value arrays and strings.
     */
    valueDelimiter: ',',
    initComponent:function() {
       Ext.apply(this, {
            items           : new Ext.util.MixedCollection(false),
            usedRecords     : new Ext.util.MixedCollection(false),
            addedRecords	: [],
            remoteLookup	: [],
            hideTrigger     : true,
            grow            : false,
            resizable       : false,
            multiSelectMode : false,
            preRenderValue  : null
        });
        
        if(this.transform){
            this.doTransform();
        }
        if(this.forceFormValue){
        	this.items.on({
        	   add: this.manageNameAttribute,
        	   remove: this.manageNameAttribute,
        	   clear: this.manageNameAttribute,
        	   scope: this
        	});
        }
        
        Ext.ux.form.SuperBoxSelect.superclass.initComponent.call(this);
        if(this.mode === 'remote' && this.store){
        	this.store.on('load', this.onStoreLoad, this);
        }
    },
    onRender:function(ct, position) {
    	var h = this.hiddenName;
    	this.hiddenName = null;
        Ext.ux.form.SuperBoxSelect.superclass.onRender.call(this, ct, position);
        this.hiddenName = h;
        this.manageNameAttribute();
       
        var extraClass = (this.stackItems === true) ? 'x-superboxselect-stacked' : '';
        if(this.renderFieldBtns){
            extraClass += ' x-superboxselect-display-btns';
        }
        this.el.removeClass('x-form-text').addClass('x-superboxselect-input-field');
        
        this.wrapEl = this.el.wrap({
            tag : 'ul'
        });
        
        this.outerWrapEl = this.wrapEl.wrap({
            tag : 'div',
            cls: 'x-form-text x-superboxselect ' + extraClass
        });
       
        this.inputEl = this.el.wrap({
            tag : 'li',
            cls : 'x-superboxselect-input'
        });
        
        if(this.renderFieldBtns){
            this.setupFieldButtons().manageClearBtn();
        }
        
        this.setupFormInterception();
    },
    onStoreLoad : function(store, records, options){
    	//accomodating for bug in Ext 3.0.0 where options.params are empty
    	var q = options.params[this.queryParam] || store.baseParams[this.queryParam] || "",
    		isValuesQuery = options.params[this.queryValuesIndicator] || store.baseParams[this.queryValuesIndicator];
    	
    	if(this.removeValuesFromStore){
    		this.store.each(function(record) {
				if(this.usedRecords.containsKey(record.get(this.valueField))){
					this.store.remove(record);
				}
			}, this);
    	}
    	//queried values
    	if(isValuesQuery){
    		var params = q.split(this.queryValuesDelimiter);
    		Ext.each(params,function(p){
    			this.remoteLookup.remove(p);
    			var rec = this.findRecord(this.valueField,p);
    			if(rec){
    				this.addRecord(rec);
    			}
    		},this);
    		
    		if(this.setOriginal){
    			this.setOriginal = false;
    			this.originalValue = this.getValue();
    		}
    	}

    	//queried display (autocomplete) & addItem
    	if(q !== '' && this.allowAddNewData){
    		Ext.each(this.remoteLookup,function(r){
    			if(typeof r == "object" && r[this.displayField] == q){
    				this.remoteLookup.remove(r);
					if(records.length && records[0].get(this.displayField) === q) {
						this.addRecord(records[0]);
						return;
					}
					var rec = this.createRecord(r);
					this.store.add(rec);
		        	this.addRecord(rec);
		        	this.addedRecords.push(rec); //keep track of records added to store
		        	(function(){
		        		if(this.isExpanded()){
			        		this.collapse();
		        		}
		        	}).defer(10,this);
		        	return;
    			}
    		},this);
    	}
    	
    	var toAdd = [];
    	if(q === ''){
	    	Ext.each(this.addedRecords,function(rec){
	    		if(this.preventDuplicates && this.usedRecords.containsKey(rec.get(this.valueField))){
					return;	    			
	    		}
	    		toAdd.push(rec);
	    		
	    	},this);
	    	
    	}else{
    		var re = new RegExp(Ext.escapeRe(q) + '.*','i');
    		Ext.each(this.addedRecords,function(rec){
	    		if(this.preventDuplicates && this.usedRecords.containsKey(rec.get(this.valueField))){
					return;	    			
	    		}
	    		if(re.test(rec.get(this.displayField))){
	    			toAdd.push(rec);
	    		}
	    	},this);
	    }
    	this.store.add(toAdd);
    	this.sortStore();
    	
		if(this.store.getCount() === 0 && this.isExpanded()){
			this.collapse();
		}
		
	},
    doTransform : function() {
    	var s = Ext.getDom(this.transform), transformValues = [];
            if(!this.store){
                this.mode = 'local';
                var d = [], opts = s.options;
                for(var i = 0, len = opts.length;i < len; i++){
                    var o = opts[i], oe = Ext.get(o),
                        value = oe.getAttributeNS(null,'value') || '',
                        cls = oe.getAttributeNS(null,'className') || '',
                        style = oe.getAttributeNS(null,'style') || '';
                    if(o.selected) {
                        transformValues.push(value);
                    }
                    d.push([value, o.text, cls, typeof(style) === "string" ? style : style.cssText]);
                }
                this.store = new Ext.data.SimpleStore({
                    'id': 0,
                    fields: ['value', 'text', 'cls', 'style'],
                    data : d
                });
                Ext.apply(this,{
                    valueField: 'value',
                    displayField: 'text',
                    classField: 'cls',
                    styleField: 'style'
                });
            }
           
            if(transformValues.length){
                this.value = transformValues.join(',');
            }
    },
    setupFieldButtons : function(){
        this.buttonWrap = this.outerWrapEl.createChild({
            cls: 'x-superboxselect-btns'
        });
        
        this.buttonClear = this.buttonWrap.createChild({
            tag:'div',
            cls: 'x-superboxselect-btn-clear ' + this.clearBtnCls
        });
        
        this.buttonExpand = this.buttonWrap.createChild({
            tag:'div',
            cls: 'x-superboxselect-btn-expand ' + this.expandBtnCls
        });
        
        this.initButtonEvents();
        
        return this;
    },
    initButtonEvents : function() {
        this.buttonClear.addClassOnOver('x-superboxselect-btn-over').on('click', function(e) {
            e.stopEvent();
            if (this.disabled) {
                return;
            }
            this.clearValue();
            this.el.focus();
        }, this);

        this.buttonExpand.addClassOnOver('x-superboxselect-btn-over').on('click', function(e) {
            e.stopEvent();
            if (this.disabled) {
                return;
            }
            if (this.isExpanded()) {
                this.multiSelectMode = false;
            } else if (this.pinList) {
                this.multiSelectMode = true;
            }
            this.onTriggerClick();
        }, this);
    },
    removeButtonEvents : function() {
        this.buttonClear.removeAllListeners();
        this.buttonExpand.removeAllListeners();
        return this;
    },
    clearCurrentFocus : function(){
        if(this.currentFocus){
            this.currentFocus.onLnkBlur();
            this.currentFocus = null;
        }  
        return this;        
    },
    initEvents : function() {
        var el = this.el;
        el.on({
            click   : this.onClick,
            focus   : this.clearCurrentFocus,
            blur    : this.onBlur,
            keydown : this.onKeyDownHandler,
            keyup   : this.onKeyUpBuffered,
            scope   : this
        });

        this.on({
            collapse: this.onCollapse,
            expand: this.clearCurrentFocus,
            scope: this
        });

        this.wrapEl.on('click', this.onWrapClick, this);
        this.outerWrapEl.on('click', this.onWrapClick, this);
        
        this.inputEl.focus = function() {
            el.focus();
        };

        Ext.ux.form.SuperBoxSelect.superclass.initEvents.call(this);

        Ext.apply(this.keyNav, {
            tab: function(e) {
                if (this.fixFocusOnTabSelect && this.isExpanded()) {
                    e.stopEvent();
                    el.blur();
                    this.onViewClick(false);
                    this.focus(false, 10);
                    return true;
                }

                this.onViewClick(false);
                if (el.dom.value !== '') {
                    this.setRawValue('');
                }

                return true;
            },

            down: function(e) {
                if (!this.isExpanded() && !this.currentFocus) {
                    this.onTriggerClick();
                } else {
                    this.inKeyMode = true;
                    this.selectNext();
                }
            },

            enter: function(){}
        });
    },

    onClick: function() {
        this.clearCurrentFocus();
        this.collapse();
        this.autoSize();
    },

    beforeBlur: Ext.form.ComboBox.superclass.beforeBlur,

    onFocus: function() {
        this.outerWrapEl.addClass(this.focusClass);

        Ext.ux.form.SuperBoxSelect.superclass.onFocus.call(this);
    },

    onBlur: function() {
        this.outerWrapEl.removeClass(this.focusClass);

        this.clearCurrentFocus();

        if (this.el.dom.value !== '') {
            this.applyEmptyText();
            this.autoSize();
        }

        Ext.ux.form.SuperBoxSelect.superclass.onBlur.call(this);
    },

    onCollapse: function() {
    	this.view.clearSelections();
        this.multiSelectMode = false;
    },

    onWrapClick: function(e) {
        e.stopEvent();
        this.collapse();
        this.el.focus();
        this.clearCurrentFocus();
    },
    markInvalid : function(msg) {
        var elp, t;

        if (!this.rendered || this.preventMark ) {
            return;
        }
        this.outerWrapEl.addClass(this.invalidClass);
        msg = msg || this.invalidText;

        switch (this.msgTarget) {
            case 'qtip':
                Ext.apply(this.el.dom, {
                    qtip    : msg,
                    qclass  : 'x-form-invalid-tip'
                });
                Ext.apply(this.wrapEl.dom, {
                    qtip    : msg,
                    qclass  : 'x-form-invalid-tip'
                });
                if (Ext.QuickTips) { // fix for floating editors interacting with DND
                    Ext.QuickTips.enable();
                }
                break;
            case 'title':
                this.el.dom.title = msg;
                this.wrapEl.dom.title = msg;
                this.outerWrapEl.dom.title = msg;
                break;
            case 'under':
                if (!this.errorEl) {
                    elp = this.getErrorCt();
                    if (!elp) { // field has no container el
                        this.el.dom.title = msg;
                        break;
                    }
                    this.errorEl = elp.createChild({cls:'x-form-invalid-msg'});
                    this.errorEl.setWidth(elp.getWidth(true) - 20);
                }
                this.errorEl.update(msg);
                Ext.form.Field.msgFx[this.msgFx].show(this.errorEl, this);
                break;
            case 'side':
                if (!this.errorIcon) {
                    elp = this.getErrorCt();
                    if (!elp) { // field has no container el
                        this.el.dom.title = msg;
                        break;
                    }
                    this.errorIcon = elp.createChild({cls:'x-form-invalid-icon'});
                }
                this.alignErrorIcon();
                Ext.apply(this.errorIcon.dom, {
                    qtip    : msg,
                    qclass  : 'x-form-invalid-tip'
                });
                this.errorIcon.show();
                this.on('resize', this.alignErrorIcon, this);
                break;
            default:
                t = Ext.getDom(this.msgTarget);
                t.innerHTML = msg;
                t.style.display = this.msgDisplay;
                break;
        }
        this.fireEvent('invalid', this, msg);
    },
    clearInvalid : function(){
        if(!this.rendered || this.preventMark){ // not rendered
            return;
        }
        this.outerWrapEl.removeClass(this.invalidClass);
        switch(this.msgTarget){
            case 'qtip':
                this.el.dom.qtip = '';
                this.wrapEl.dom.qtip ='';
                break;
            case 'title':
                this.el.dom.title = '';
                this.wrapEl.dom.title = '';
                this.outerWrapEl.dom.title = '';
                break;
            case 'under':
                if(this.errorEl){
                    Ext.form.Field.msgFx[this.msgFx].hide(this.errorEl, this);
                }
                break;
            case 'side':
                if(this.errorIcon){
                    this.errorIcon.dom.qtip = '';
                    this.errorIcon.hide();
                    this.un('resize', this.alignErrorIcon, this);
                }
                break;
            default:
                var t = Ext.getDom(this.msgTarget);
                t.innerHTML = '';
                t.style.display = 'none';
                break;
        }
        this.fireEvent('valid', this);
    },
    alignErrorIcon : function(){
        if(this.wrap){
            this.errorIcon.alignTo(this.wrap, 'tl-tr', [Ext.isIE ? 5 : 2, 3]);
        }
    },
    expand : function(){
        if (this.isExpanded() || !this.hasFocus) {
            return;
        }
        this.list.alignTo(this.outerWrapEl, this.listAlign).show();
        this.innerList.setOverflow('auto'); // necessary for FF 2.0/Mac
        Ext.getDoc().on({
            mousewheel: this.collapseIf,
            mousedown: this.collapseIf,
            scope: this
        });
        this.fireEvent('expand', this);
    },
    restrictHeight : function(){
        var inner = this.innerList.dom,
            st = inner.scrollTop, 
            list = this.list;
        
        inner.style.height = '';
        
        var pad = list.getFrameWidth('tb')+(this.resizable?this.handleHeight:0)+this.assetHeight,
            h = Math.max(inner.clientHeight, inner.offsetHeight, inner.scrollHeight),
            ha = this.getPosition()[1]-Ext.getBody().getScroll().top,
            hb = Ext.lib.Dom.getViewHeight()-ha-this.getSize().height,
            space = Math.max(ha, hb, this.minHeight || 0)-list.shadowOffset-pad-5;
        
        h = Math.min(h, space, this.maxHeight);
        this.innerList.setHeight(h);

        list.beginUpdate();
        list.setHeight(h+pad);
        list.alignTo(this.outerWrapEl, this.listAlign);
        list.endUpdate();
        
        if(this.multiSelectMode){
            inner.scrollTop = st;
        }
    },
    validateValue: function(val){
        if(this.items.getCount() === 0){
             if(this.allowBlank){
                 this.clearInvalid();
                 return true;
             }else{
                 this.markInvalid(this.blankText);
                 return false;
             }
        }
        this.clearInvalid();
        return true;
    },
    manageNameAttribute :  function(){
    	if(this.items.getCount() === 0 && this.forceFormValue){
    	   this.el.dom.setAttribute('name', this.hiddenName || this.name);
    	}else{
    		this.el.dom.removeAttribute('name');
    	}
    },
    setupFormInterception : function(){
        var form;
        this.findParentBy(function(p){ 
            if(p.getForm){
                form = p.getForm();
            }
        });
        if(form){
        	var formGet = form.getValues;
            form.getValues = function(asString){
                this.el.dom.disabled = true;
                var oldVal = this.el.dom.value;
                this.setRawValue('');
                var vals = formGet.call(form);
                this.el.dom.disabled = false;
                this.setRawValue(oldVal);
                if(this.forceFormValue && this.items.getCount() === 0){
                	vals[this.name] = '';
                }
                return asString ? Ext.urlEncode(vals) : vals ;
            }.createDelegate(this);
        }
    },
    onResize : function(w, h, rw, rh) {
        var reduce = Ext.isIE6 ? 4 : Ext.isIE7 ? 1 : Ext.isIE8 ? 1 : 0;
        if(this.wrapEl){
            this._width = w;
            this.outerWrapEl.setWidth(w - reduce);
            if (this.renderFieldBtns) {
                reduce += (this.buttonWrap.getWidth() + 20);
                this.wrapEl.setWidth(w - reduce);
        }
        }
        Ext.ux.form.SuperBoxSelect.superclass.onResize.call(this, w, h, rw, rh);
        this.autoSize();
    },
    onEnable: function(){
        Ext.ux.form.SuperBoxSelect.superclass.onEnable.call(this);
        this.items.each(function(item){
            item.enable();
        });
        if (this.renderFieldBtns) {
            this.initButtonEvents();
        }
    },
    onDisable: function(){
        Ext.ux.form.SuperBoxSelect.superclass.onDisable.call(this);
        this.items.each(function(item){
            item.disable();
        });
        if(this.renderFieldBtns){
            this.removeButtonEvents();
        }
    },
    /**
     * Clears all values from the component.
     * @methodOf Ext.ux.form.SuperBoxSelect
     * @name clearValue
     * @param {Boolean} supressRemoveEvent [Optional] When true, the 'removeitem' event will not fire for each item that is removed.    
     */
    clearValue : function(supressRemoveEvent){
        Ext.ux.form.SuperBoxSelect.superclass.clearValue.call(this);
        this.preventMultipleRemoveEvents = supressRemoveEvent || this.supressClearValueRemoveEvents || false;
    	this.removeAllItems();
    	this.preventMultipleRemoveEvents = false;
        this.fireEvent('clear',this);
        return this;
    },
    onKeyUp : function(e) {
        if (this.editable !== false && (!e.isSpecialKey() || e.getKey() === e.BACKSPACE) && e.getKey() !== this.itemDelimiterKey && (!e.hasModifier() || e.shiftKey)) {
            this.lastKey = e.getKey();
            this.dqTask.delay(this.queryDelay);
        }        
    },
    onKeyDownHandler : function(e,t) {
    	    	
        var toDestroy,nextFocus,idx;
        if ((e.getKey() === e.DELETE || e.getKey() === e.SPACE) && this.currentFocus){
            e.stopEvent();
            toDestroy = this.currentFocus;
            this.on('expand',function(){this.collapse();},this,{single: true});
            idx = this.items.indexOfKey(this.currentFocus.key);
            this.clearCurrentFocus();
            
            if(idx < (this.items.getCount() -1)){
                nextFocus = this.items.itemAt(idx+1);
            }
            
            toDestroy.preDestroy(true);
            if(nextFocus){
                (function(){
                    nextFocus.onLnkFocus();
                    this.currentFocus = nextFocus;
                }).defer(200,this);
            }
        
            return true;
        }
        
        var val = this.el.dom.value, it, ctrl = e.ctrlKey;
        if(e.getKey() === this.itemDelimiterKey){
            e.stopEvent();
            if (val !== "") {
                if (ctrl || !this.isExpanded())  {  //ctrl+enter for new items
                	this.view.clearSelections();
                    this.collapse();
                    this.setRawValue('');
                    this.fireEvent('newitem', this, val);
                } else {
                	this.onViewClick();
                    //removed from 3.0.1
                    if(this.unsetDelayCheck){
                        this.delayedCheck = true;
                        this.unsetDelayCheck.defer(10, this);
                    }
                }
            }else{
                if(!this.isExpanded()){
                    return;
                }
                this.onViewClick();
                //removed from 3.0.1
                if(this.unsetDelayCheck){
                    this.delayedCheck = true;
                    this.unsetDelayCheck.defer(10, this);
                }
            }
            return true;
        }
        
        if(val !== '') {
            this.autoSize();
            return;
        }
        
        //select first item
        if(e.getKey() === e.HOME){
            e.stopEvent();
            if(this.items.getCount() > 0){
                this.collapse();
                it = this.items.get(0);
                it.el.focus();
                
            }
            return true;
        }
        //backspace remove
        if(e.getKey() === e.BACKSPACE){
            e.stopEvent();
            if(this.currentFocus) {
                toDestroy = this.currentFocus;
                this.on('expand',function(){
                    this.collapse();
                },this,{single: true});
                
                idx = this.items.indexOfKey(toDestroy.key);
                
                this.clearCurrentFocus();
                if(idx < (this.items.getCount() -1)){
                    nextFocus = this.items.itemAt(idx+1);
                }
                
                toDestroy.preDestroy(true);
                
                if(nextFocus){
                    (function(){
                        nextFocus.onLnkFocus();
                        this.currentFocus = nextFocus;
                    }).defer(200,this);
                }
                
                return;
            }else{
                it = this.items.get(this.items.getCount() -1);
                if(it){
                    if(this.backspaceDeletesLastItem){
                        this.on('expand',function(){this.collapse();},this,{single: true});
                        it.preDestroy(true);
                    }else{
                        if(this.navigateItemsWithTab){
                            it.onElClick();
                        }else{
                            this.on('expand',function(){
                                this.collapse();
                                this.currentFocus = it;
                                this.currentFocus.onLnkFocus.defer(20,this.currentFocus);
                            },this,{single: true});
                        }
                    }
                }
                return true;
            }
        }
        
        if(!e.isNavKeyPress()){
            this.multiSelectMode = false;
            this.clearCurrentFocus();
            return;
        }
        //arrow nav
        if(e.getKey() === e.LEFT || (e.getKey() === e.UP && !this.isExpanded())){
            e.stopEvent();
            this.collapse();
            //get last item
            it = this.items.get(this.items.getCount()-1);
            if(this.navigateItemsWithTab){ 
                //focus last el
                if(it){
                    it.focus(); 
                }
            }else{
                //focus prev item
                if(this.currentFocus){
                    idx = this.items.indexOfKey(this.currentFocus.key);
                    this.clearCurrentFocus();
                    
                    if(idx !== 0){
                        this.currentFocus = this.items.itemAt(idx-1);
                        this.currentFocus.onLnkFocus();
                    }
                }else{
                    this.currentFocus = it;
                    if(it){
                        it.onLnkFocus();
                    }
                }
            }
            return true;
        }
        if(e.getKey() === e.DOWN){
            if(this.currentFocus){
                this.collapse();
                e.stopEvent();
                idx = this.items.indexOfKey(this.currentFocus.key);
                if(idx == (this.items.getCount() -1)){
                    this.clearCurrentFocus.defer(10,this);
                }else{
                    this.clearCurrentFocus();
                    this.currentFocus = this.items.itemAt(idx+1);
                    if(this.currentFocus){
                        this.currentFocus.onLnkFocus();
                    }
                }
                return true;
            }
        }
        if(e.getKey() === e.RIGHT){
            this.collapse();
            it = this.items.itemAt(0);
            if(this.navigateItemsWithTab){ 
                //focus first el
                if(it){
                    it.focus(); 
                }
            }else{
                if(this.currentFocus){
                    idx = this.items.indexOfKey(this.currentFocus.key);
                    this.clearCurrentFocus();
                    if(idx < (this.items.getCount() -1)){
                        this.currentFocus = this.items.itemAt(idx+1);
                        if(this.currentFocus){
                            this.currentFocus.onLnkFocus();
                        }
                    }
                }else{
                    this.currentFocus = it;
                    if(it){
                        it.onLnkFocus();
                    }
                }
            }
        }
    },
    onKeyUpBuffered : function(e){
        if(!e.isNavKeyPress()){
            this.autoSize();
        }
    },
    reset :  function(){
    	this.killItems();
        Ext.ux.form.SuperBoxSelect.superclass.reset.call(this);
        this.addedRecords = [];
        this.autoSize().setRawValue('');
    },
    applyEmptyText : function(){
		this.setRawValue('');
        if(this.items.getCount() > 0){
            this.el.removeClass(this.emptyClass);
            this.setRawValue('');
            return this;
        }
        if(this.rendered && this.emptyText && this.getRawValue().length < 1){
            this.setRawValue(this.emptyText);
            this.el.addClass(this.emptyClass);
        }
        return this;
    },
    /**
     * @private
     * 
     * Use clearValue instead
     */
    removeAllItems: function(){
    	this.items.each(function(item){
            item.preDestroy(true);
        },this);
        this.manageClearBtn();
        return this;
    },
    killItems : function(){
    	this.items.each(function(item){
            item.kill();
        },this);
        this.resetStore();
        this.items.clear();
        this.manageClearBtn();
        return this;
    },
    resetStore: function(){
        this.store.clearFilter();
        if(!this.removeValuesFromStore){
            return this;
        }
        this.usedRecords.each(function(rec){
            this.store.add(rec);
        },this);
        this.usedRecords.clear();
        if(!this.store.remoteSort){
            this.store.sort(this.displayField, 'ASC');	
        }
        
        return this;
    },
    sortStore: function(){
        var ss = this.store.getSortState();
        if(ss && ss.field){
            this.store.sort(ss.field, ss.direction);
        }
        return this;
    },
    getCaption: function(dataObject){
        if(typeof this.displayFieldTpl === 'string') {
            this.displayFieldTpl = new Ext.XTemplate(this.displayFieldTpl);
        }
        var caption, recordData = dataObject instanceof Ext.data.Record ? dataObject.data : dataObject;
      
        if(this.displayFieldTpl) {
            caption = this.displayFieldTpl.apply(recordData);
        } else if(this.displayField) {
            caption = recordData[this.displayField];
        }
        
        return caption;
    },
    addRecord : function(record) {
        var display = record.data[this.displayField],
            caption = this.getCaption(record),
            val = record.data[this.valueField],
            cls = this.classField ? record.data[this.classField] : '',
            style = this.styleField ? record.data[this.styleField] : '';

        if (this.removeValuesFromStore) {
            this.usedRecords.add(val, record);
            this.store.remove(record);
        }
        
        this.addItemBox(val, display, caption, cls, style);
        this.fireEvent('additem', this, val, record);
    },
    createRecord : function(recordData){
        if(!this.recordConstructor){
            var recordFields = [
                {name: this.valueField},
                {name: this.displayField}
            ];
            if(this.classField){
                recordFields.push({name: this.classField});
            }
            if(this.styleField){
                recordFields.push({name: this.styleField});
            }
            this.recordConstructor = Ext.data.Record.create(recordFields);
        }
        return new this.recordConstructor(recordData);
    },
    /**
     * Adds an array of items to the SuperBoxSelect component if the {@link #Ext.ux.form.SuperBoxSelect-allowAddNewData} config is set to true.
     * @methodOf Ext.ux.form.SuperBoxSelect
     * @name addItem
     * @param {Array} newItemObjects An Array of object literals containing the property names and values for an item. The property names must match those specified in {@link #Ext.ux.form.SuperBoxSelect-displayField}, {@link #Ext.ux.form.SuperBoxSelect-valueField} and {@link #Ext.ux.form.SuperBoxSelect-classField} 
     */
    addItems : function(newItemObjects){
    	if (Ext.isArray(newItemObjects)) {
			Ext.each(newItemObjects, function(item) {
				this.addItem(item);
			}, this);
		} else {
			this.addItem(newItemObjects);
		}
    },
    /**
     * Adds a new non-existing item to the SuperBoxSelect component if the {@link #Ext.ux.form.SuperBoxSelect-allowAddNewData} config is set to true.
     * This method should be used in place of addItem from within the newitem event handler.
     * @methodOf Ext.ux.form.SuperBoxSelect
     * @name addNewItem
     * @param {Object} newItemObject An object literal containing the property names and values for an item. The property names must match those specified in {@link #Ext.ux.form.SuperBoxSelect-displayField}, {@link #Ext.ux.form.SuperBoxSelect-valueField} and {@link #Ext.ux.form.SuperBoxSelect-classField} 
     */
    addNewItem : function(newItemObject){
    	this.addItem(newItemObject,true);
    },
    /**
     * Adds an item to the SuperBoxSelect component if the {@link #Ext.ux.form.SuperBoxSelect-allowAddNewData} config is set to true.
     * @methodOf Ext.ux.form.SuperBoxSelect
     * @name addItem
     * @param {Object} newItemObject An object literal containing the property names and values for an item. The property names must match those specified in {@link #Ext.ux.form.SuperBoxSelect-displayField}, {@link #Ext.ux.form.SuperBoxSelect-valueField} and {@link #Ext.ux.form.SuperBoxSelect-classField} 
     */
    addItem : function(newItemObject, /*hidden param*/ forcedAdd){
        
        var val = newItemObject[this.valueField];

        if(this.disabled) {
            return false;
        }
        if(this.preventDuplicates && this.hasValue(val)){
            return;
        }
        
        //use existing record if found
        var record = this.findRecord(this.valueField, val);
        if (record) {
            this.addRecord(record);
            return;
        } else if (!this.allowAddNewData) { // else it's a new item
            return;
        }
        
        if(this.mode === 'remote'){
        	this.remoteLookup.push(newItemObject); 
        	this.doQuery(val,false,false,forcedAdd);
        	return;
        }
        
        var rec = this.createRecord(newItemObject);
        this.store.add(rec);
        this.addRecord(rec);
        
        return true;
    },
    addItemBox : function(itemVal,itemDisplay,itemCaption, itemClass, itemStyle) {
        var hConfig, parseStyle = function(s){
            var ret = '';
            switch(typeof s){
                case 'function' :
                    ret = s.call();
                    break;
                case 'object' :
                    for(var p in s){
                        ret+= p +':'+s[p]+';';
                    }
                    break;
                case 'string' :
                    ret = s + ';';
            }
            return ret;
        }, itemKey = Ext.id(null,'sbx-item'), box = new Ext.ux.form.SuperBoxSelectItem({
            owner: this,
            disabled: this.disabled,
            renderTo: this.wrapEl,
            cls: this.extraItemCls + ' ' + itemClass,
            style: parseStyle(this.extraItemStyle) + ' ' + itemStyle,
            caption: itemCaption,
            display: itemDisplay,
            value:  itemVal,
            key: itemKey,
            listeners: {
                'remove': function(item){
                    if(this.fireEvent('beforeremoveitem',this,item.value) === false){
                        return;
                    }
                    this.items.removeKey(item.key);
                    if(this.removeValuesFromStore){
                        if(this.usedRecords.containsKey(item.value)){
                            this.store.add(this.usedRecords.get(item.value));
                            this.usedRecords.removeKey(item.value);
                            this.sortStore();
                            if(this.view){
                                this.view.render();
                            }
                        }
                    }
                    if(!this.preventMultipleRemoveEvents){
                    	this.fireEvent.defer(250,this,['removeitem',this,item.value, this.findInStore(item.value)]);
                    }
                },
                destroy: function(){
                    this.collapse();
                    this.autoSize().manageClearBtn().validateValue();
                },
                scope: this
            }
        });
        box.render();
        
        hConfig = {
            tag :'input', 
            type :'hidden', 
            value : itemVal,
            name : (this.hiddenName || this.name)
        };
        
        if(this.disabled){
        	Ext.apply(hConfig,{
        	   disabled : 'disabled'
        	})
        }
        box.hidden = this.el.insertSibling(hConfig,'before');

        this.items.add(itemKey,box);
        this.applyEmptyText().autoSize().manageClearBtn().validateValue();
    },
    manageClearBtn : function() {
        if (!this.renderFieldBtns || !this.rendered) {
            return this;
        }
        var cls = 'x-superboxselect-btn-hide';
        if (this.items.getCount() === 0) {
            this.buttonClear.addClass(cls);
        } else {
            this.buttonClear.removeClass(cls);
        }
        return this;
    },
    findInStore : function(val){
        var index = this.store.find(this.valueField, val);
        if(index > -1){
            return this.store.getAt(index);
        }
        return false;
    },
    /**
     * Returns an array of records associated with the selected items.
     * @methodOf Ext.ux.form.SuperBoxSelect
     * @name getSelectedRecords
     * @return {Array} An array of records associated with the selected items. 
     */
    getSelectedRecords : function(){
    	var  ret =[];
    	if(this.removeValuesFromStore){
    		ret = this.usedRecords.getRange();
    	}else{
    		var vals = [];
	        this.items.each(function(item){
	            vals.push(item.value);
	        });
	        Ext.each(vals,function(val){
	        	ret.push(this.findInStore(val));
	        },this);
    	}
    	return ret;
    },
    /**
     * Returns an item which contains the passed HTML Element.
     * @methodOf Ext.ux.form.SuperBoxSelect
     * @name findSelectedItem
     * @param {HTMLElement} el The LI HTMLElement of a selected item in the list  
     */
    findSelectedItem : function(el){
        var ret;
        this.items.each(function(item){
            if(item.el.dom === el){
                ret = item;
                return false;
            }
        });
        return ret;
    },
    /**
     * Returns a record associated with the item which contains the passed HTML Element.
     * @methodOf Ext.ux.form.SuperBoxSelect
     * @name findSelectedRecord
     * @param {HTMLElement} el The LI HTMLElement of a selected item in the list  
     */
    findSelectedRecord : function(el){
        var ret, item = this.findSelectedItem(el);
        if(item){
        	ret = this.findSelectedRecordByValue(item.value)
        }
        
        return ret;
    },
    /**
     * Returns a selected record associated with the passed value.
     * @methodOf Ext.ux.form.SuperBoxSelect
     * @name findSelectedRecordByValue
     * @param {Mixed} val The value to lookup
     * @return {Record} The matching Record. 
     */
    findSelectedRecordByValue : function(val){
    	var ret;
    	if(this.removeValuesFromStore){
    		this.usedRecords.each(function(rec){
	            if(rec.get(this.valueField) == val){
	                ret = rec;
	                return false;
	            }
	        },this);		
    	}else{
    		ret = this.findInStore(val);
    	}
    	return ret;
    },
    /**
     * Returns a String value containing a concatenated list of item values. The list is concatenated with the {@link #Ext.ux.form.SuperBoxSelect-valueDelimiter}.
     * @methodOf Ext.ux.form.SuperBoxSelect
     * @name getValue
     * @return {String} a String value containing a concatenated list of item values. 
     */
    getValue : function() {
        var ret = [];
        this.items.each(function(item){
            ret.push(item.value);
        });
        return ret.join(this.valueDelimiter);
    },
    /**
     * Returns an Array of item objects containing the {@link #Ext.ux.form.SuperBoxSelect-displayField}, {@link #Ext.ux.form.SuperBoxSelect-valueField}, {@link #Ext.ux.form.SuperBoxSelect-classField} and {@link #Ext.ux.form.SuperBoxSelect-styleField} properties.
     * @methodOf Ext.ux.form.SuperBoxSelect
     * @name getValueEx
     * @return {Array} an array of item objects. 
     */
    getValueEx : function() {
        var ret = [];
        this.items.each(function(item){
            var newItem = {};
            newItem[this.valueField] = item.value;
            newItem[this.displayField] = item.display;
            if(this.classField){
                newItem[this.classField] = item.cls || '';
            }
            if(this.styleField){
                newItem[this.styleField] = item.style || '';
            }
            ret.push(newItem);
        },this);
        return ret;
    },
    // private
    initValue : function(){
        Ext.ux.form.SuperBoxSelect.superclass.initValue.call(this);
        if(this.mode === 'remote') {
        	this.setOriginal = true;
        }
    },
    /**
     * Sets the value of the SuperBoxSelect component.
     * @methodOf Ext.ux.form.SuperBoxSelect
     * @name setValue
     * @param {String|Array} value An array of item values, or a String value containing a delimited list of item values. (The list should be delimited with the {@link #Ext.ux.form.SuperBoxSelect-valueDelimiter) 
     */
    setValue : function(value){
        if(!this.rendered){
            this.value = value;
            return;
        }
            
        this.removeAllItems().resetStore();
        this.remoteLookup = [];
        
        if(Ext.isEmpty(value)){
        	return;
        }
        
        var values = value;
        if(!Ext.isArray(value)){
            value = '' + value;
            values = value.split(this.valueDelimiter); 
        }
        
        Ext.each(values,function(val){
            var record = this.findRecord(this.valueField, val);
            if(record){
                this.addRecord(record);
            }else if(this.mode === 'remote'){
				this.remoteLookup.push(val);            	
            }
        },this);
        
        if(this.mode === 'remote'){
      		var q = this.remoteLookup.join(this.queryValuesDelimiter); 
      		this.doQuery(q,false, true); //3rd param to specify a values query
        }
        
    },
    /**
     * Sets the value of the SuperBoxSelect component, adding new items that don't exist in the data store if the {@link #Ext.ux.form.SuperBoxSelect-allowAddNewData} config is set to true.
     * @methodOf Ext.ux.form.SuperBoxSelect
     * @name setValue
     * @param {Array} data An Array of item objects containing the {@link #Ext.ux.form.SuperBoxSelect-displayField}, {@link #Ext.ux.form.SuperBoxSelect-valueField} and {@link #Ext.ux.form.SuperBoxSelect-classField} properties.  
     */
    setValueEx : function(data){
        this.removeAllItems().resetStore();
        
        if(!Ext.isArray(data)){
            data = [data];
        }
        this.remoteLookup = [];
        
        if(this.allowAddNewData && this.mode === 'remote'){ // no need to query
            Ext.each(data, function(d){
            	var r = this.findRecord(this.valueField, d[this.valueField]) || this.createRecord(d);
                this.addRecord(r);
            },this);
            return;
        }
        
        Ext.each(data,function(item){
            this.addItem(item);
        },this);
    },
    /**
     * Returns true if the SuperBoxSelect component has a selected item with a value matching the 'val' parameter.
     * @methodOf Ext.ux.form.SuperBoxSelect
     * @name hasValue
     * @param {Mixed} val The value to test.
     * @return {Boolean} true if the component has the selected value, false otherwise.
     */
    hasValue: function(val){
        var has = false;
        this.items.each(function(item){
            if(item.value == val){
                has = true;
                return false;
            }
        },this);
        return has;
    },
    onSelect : function(record, index) {
    	if (this.fireEvent('beforeselect', this, record, index) !== false){
            var val = record.data[this.valueField];
            
            if(this.preventDuplicates && this.hasValue(val)){
                return;
            }
            
            this.setRawValue('');
            this.lastSelectionText = '';
            
            if(this.fireEvent('beforeadditem',this,val) !== false){
                this.addRecord(record);
            }
            if(this.store.getCount() === 0 || !this.multiSelectMode){
                this.collapse();
            }else{
                this.restrictHeight();
            }
    	}
    },
    onDestroy : function() {
        this.items.purgeListeners();
        this.killItems();
        if (this.renderFieldBtns) {
            Ext.destroy(
                this.buttonClear,
                this.buttonExpand,
                this.buttonWrap
            );
        }

        Ext.destroy(
            this.inputEl,
            this.wrapEl,
            this.outerWrapEl
        );

        Ext.ux.form.SuperBoxSelect.superclass.onDestroy.call(this);
    },
    autoSize : function(){
        if(!this.rendered){
            return this;
        }
        if(!this.metrics){
            this.metrics = Ext.util.TextMetrics.createInstance(this.el);
        }
        var el = this.el,
            v = el.dom.value,
            d = document.createElement('div');

        if(v === "" && this.emptyText && this.items.getCount() < 1){
            v = this.emptyText;
        }
        d.appendChild(document.createTextNode(v));
        v = d.innerHTML;
        d = null;
        v += "&#160;";
        var w = Math.max(this.metrics.getWidth(v) +  24, 24);
        if(typeof this._width != 'undefined'){
            w = Math.min(this._width, w);
        }
        this.el.setWidth(w);
        
        if(Ext.isIE){
            this.el.dom.style.top='0';
        }
        this.fireEvent('autosize', this, w);
        return this;
    },
    doQuery : function(q, forceAll,valuesQuery, forcedAdd){
        q = Ext.isEmpty(q) ? '' : q;
        var qe = {
            query: q,
            forceAll: forceAll,
            combo: this,
            cancel:false
        };
        if(this.fireEvent('beforequery', qe)===false || qe.cancel){
            return false;
        }
        q = qe.query;
        forceAll = qe.forceAll;
        if(forceAll === true || (q.length >= this.minChars) || valuesQuery && !Ext.isEmpty(q)){
            if(forcedAdd || this.forceSameValueQuery || this.lastQuery !== q){
            	this.lastQuery = q;
                if(this.mode == 'local'){
                    this.selectedIndex = -1;
                    if(forceAll){
                        this.store.clearFilter();
                    }else{
                        this.store.filter(this.displayField, q);
                    }
                    this.onLoad();
                }else{
                	
                    this.store.baseParams[this.queryParam] = q;
                    this.store.baseParams[this.queryValuesIndicator] = valuesQuery;
                    this.store.load({
                        params: this.getParams(q)
                    });
                    if(!forcedAdd){
                        this.expand();
                    }
                }
            }else{
                this.selectedIndex = -1;
                this.onLoad();
            }
        }
    }
});
Ext.reg('superboxselect', Ext.ux.form.SuperBoxSelect);
/*
 * @private
 */
Ext.ux.form.SuperBoxSelectItem = function(config){
    Ext.apply(this,config);
    Ext.ux.form.SuperBoxSelectItem.superclass.constructor.call(this); 
};
/*
 * @private
 */
Ext.ux.form.SuperBoxSelectItem = Ext.extend(Ext.ux.form.SuperBoxSelectItem,Ext.Component, {
    initComponent : function(){
        Ext.ux.form.SuperBoxSelectItem.superclass.initComponent.call(this); 
    },
    onElClick : function(e){
        var o = this.owner;
        o.clearCurrentFocus().collapse();
        if(o.navigateItemsWithTab){
            this.focus();
        }else{
            o.el.dom.focus();
            var that = this;
            (function(){
                this.onLnkFocus();
                o.currentFocus = this;
            }).defer(10,this);
        }
    },
    
    onLnkClick : function(e){
        if(e) {
            e.stopEvent();
        }
        this.preDestroy();
        if(!this.owner.navigateItemsWithTab){
            this.owner.el.focus();
        }
    },
    onLnkFocus : function(){
        this.el.addClass("x-superboxselect-item-focus");
        this.owner.outerWrapEl.addClass("x-form-focus");
    },
    
    onLnkBlur : function(){
        this.el.removeClass("x-superboxselect-item-focus");
        this.owner.outerWrapEl.removeClass("x-form-focus");
    },
    
    enableElListeners : function() {
        this.el.on('click', this.onElClick, this, {stopEvent:true});
       
        this.el.addClassOnOver('x-superboxselect-item x-superboxselect-item-hover');
    },

    enableLnkListeners : function() {
        this.lnk.on({
            click: this.onLnkClick,
            focus: this.onLnkFocus,
            blur:  this.onLnkBlur,
            scope: this
        });
    },
    
    enableAllListeners : function() {
        this.enableElListeners();
        this.enableLnkListeners();
    },
    disableAllListeners : function() {
        this.el.removeAllListeners();
        this.lnk.un('click', this.onLnkClick, this);
        this.lnk.un('focus', this.onLnkFocus, this);
        this.lnk.un('blur', this.onLnkBlur, this);
    },
    onRender : function(ct, position){
        
        Ext.ux.form.SuperBoxSelectItem.superclass.onRender.call(this, ct, position);
        
        var el = this.el;
        if(el){
            el.remove();
        }
        
        this.el = el = ct.createChild({ tag: 'li' }, ct.last());
        el.addClass('x-superboxselect-item');
        
        var btnEl = this.owner.navigateItemsWithTab ? ( Ext.isSafari ? 'button' : 'a') : 'span';
        var itemKey = this.key;
        
        Ext.apply(el, {
            focus: function(){
                var c = this.down(btnEl +'.x-superboxselect-item-close');
                if(c){
                	c.focus();
                }
            },
            preDestroy: function(){
                this.preDestroy();
            }.createDelegate(this)
        });
        
        this.enableElListeners();

        el.update(this.caption);

        var cfg = {
            tag: btnEl,
            'class': 'x-superboxselect-item-close',
            tabIndex : this.owner.navigateItemsWithTab ? '0' : '-1'
        };
        if(btnEl === 'a'){
            cfg.href = '#';
        }
        this.lnk = el.createChild(cfg);
        
        
        if(!this.disabled) {
            this.enableLnkListeners();
        }else {
            this.disableAllListeners();
        }
        
        this.on({
            disable: this.disableAllListeners,
            enable: this.enableAllListeners,
            scope: this
        });

        this.setupKeyMap();
    },
    setupKeyMap : function(){
        this.keyMap = new Ext.KeyMap(this.lnk, [
            {
                key: [
                    Ext.EventObject.BACKSPACE, 
                    Ext.EventObject.DELETE, 
                    Ext.EventObject.SPACE
                ],
                fn: this.preDestroy,
                scope: this
            }, {
                key: [
                    Ext.EventObject.RIGHT,
                    Ext.EventObject.DOWN
                ],
                fn: function(){
                    this.moveFocus('right');
                },
                scope: this
            },
            {
                key: [Ext.EventObject.LEFT,Ext.EventObject.UP],
                fn: function(){
                    this.moveFocus('left');
                },
                scope: this
            },
            {
                key: [Ext.EventObject.HOME],
                fn: function(){
                    var l = this.owner.items.get(0).el.focus();
                    if(l){
                        l.el.focus();
                    }
                },
                scope: this
            },
            {
                key: [Ext.EventObject.END],
                fn: function(){
                    this.owner.el.focus();
                },
                scope: this
            },
            {
                key: Ext.EventObject.ENTER,
                fn: function(){
                }
            }
        ]);
        this.keyMap.stopEvent = true;
    },
    moveFocus : function(dir) {
        var el = this.el[dir == 'left' ? 'prev' : 'next']() || this.owner.el;
	    el.focus.defer(100,el);
    },

    preDestroy : function(supressEffect) {
    	if(this.fireEvent('remove', this) === false){
	    	return;
	    }	
    	var actionDestroy = function(){
            if(this.owner.navigateItemsWithTab){
                this.moveFocus('right');
            }
            this.hidden.remove();
            this.hidden = null;
            this.destroy();
        };
        
        if(supressEffect){
            actionDestroy.call(this);
        } else {
            this.el.hide({
                duration: 0.2,
                callback: actionDestroy,
                scope: this
            });
        }
        return this;
    },
    kill : function(){
    	this.hidden.remove();
        this.hidden = null;
        this.purgeListeners();
        this.destroy();
    },
    onDisable : function() {
    	if(this.hidden){
    	    this.hidden.dom.setAttribute('disabled', 'disabled');
    	}
    	this.keyMap.disable();
    	Ext.ux.form.SuperBoxSelectItem.superclass.onDisable.call(this);
    },
    onEnable : function() {
    	if(this.hidden){
    	    this.hidden.dom.removeAttribute('disabled');
    	}
    	this.keyMap.enable();
    	Ext.ux.form.SuperBoxSelectItem.superclass.onEnable.call(this);
    },
    onDestroy : function() {
        Ext.destroy(
            this.lnk,
            this.el
        );
        
        Ext.ux.form.SuperBoxSelectItem.superclass.onDestroy.call(this);
    }
});// vim: ts=4:sw=4:nu:fdc=2:nospell
/**
 * Ext.ux.form.XCheckbox - checkbox with configurable submit values
 *
 * @author  Ing. Jozef Sakalos
 * @version $Id: Ext.ux-all.js,v 1.1 2012/01/10 15:30:32 cbravo Exp $
 * @date    10. February 2008
 *
 *
 * @license Ext.ux.form.XCheckbox is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 * 
 * License details: http://www.gnu.org/licenses/lgpl.html
 */

/*global Ext */

/**
  * @class Ext.ux.XCheckbox
  * @extends Ext.form.Checkbox
  */
Ext.ns('Ext.ux.form');
Ext.ux.form.XCheckbox = Ext.extend(Ext.form.Checkbox, {
     submitOffValue:'false'
    ,submitOnValue:'true'

    ,onRender:function() {

        this.inputValue = this.submitOnValue;

        // call parent
        Ext.ux.form.XCheckbox.superclass.onRender.apply(this, arguments);

        // create hidden field that is submitted if checkbox is not checked
        this.hiddenField = this.wrap.insertFirst({tag:'input', type:'hidden'});

        // support tooltip
        if(this.tooltip) {
            this.imageEl.set({qtip:this.tooltip});
        }

        // update value of hidden field
        this.updateHidden();

    } // eo function onRender

    /**
     * Calls parent and updates hiddenField
     * @private
     */
    ,setValue:function(v) {
        v = this.convertValue(v);
        this.updateHidden(v);
        Ext.ux.form.XCheckbox.superclass.setValue.apply(this, arguments);
    } // eo function setValue

    /**
     * Updates hiddenField
     * @private
     */
    ,updateHidden:function(v) {
        v = undefined !== v ? v : this.checked;
        v = this.convertValue(v);
        if(this.hiddenField) {
            this.hiddenField.dom.value = v ? this.submitOnValue : this.submitOffValue;
            this.hiddenField.dom.name = v ? '' : this.el.dom.name;
        }
    } // eo function updateHidden

    /**
     * Converts value to boolean
     * @private
     */
    ,convertValue:function(v) {
        return (v === true || v === 'true' || v == 1 || v === this.submitOnValue || String(v).toLowerCase() === 'on');
    } // eo function convertValue

}); // eo extend

// register xtype
Ext.reg('xcheckbox', Ext.ux.form.XCheckbox);

// eof 

/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.ns('Ext.ux.form');

/**
 * @class Ext.ux.form.FileUploadField
 * @extends Ext.form.TextField
 * Creates a file upload field.
 * @xtype fileuploadfield
 */
Ext.ux.form.FileUploadField = Ext.extend(Ext.form.TextField,  {
    /**
     * @cfg {String} buttonText The button text to display on the upload button (defaults to
     * 'Browse...').  Note that if you supply a value for {@link #buttonCfg}, the buttonCfg.text
     * value will be used instead if available.
     */
    buttonText: 'Examinar...',
    /**
     * @cfg {Boolean} buttonOnly True to display the file upload field as a button with no visible
     * text field (defaults to false).  If true, all inherited TextField members will still be available.
     */
    buttonOnly: false,
    /**
     * @cfg {Number} buttonOffset The number of pixels of space reserved between the button and the text field
     * (defaults to 3).  Note that this only applies if {@link #buttonOnly} = false.
     */
    buttonOffset: 3,
    /**
     * @cfg {Object} buttonCfg A standard {@link Ext.Button} config object.
     */

    // private
    readOnly: true,

    /**
     * @hide
     * @method autoSize
     */
    autoSize: Ext.emptyFn,

    // private
    initComponent: function(){
        Ext.ux.form.FileUploadField.superclass.initComponent.call(this);

        this.addEvents(
            /**
             * @event fileselected
             * Fires when the underlying file input field's value has changed from the user
             * selecting a new file from the system file selection dialog.
             * @param {Ext.ux.form.FileUploadField} this
             * @param {String} value The file value returned by the underlying file input field
             */
            'fileselected'
        );
    },

    // private
    onRender : function(ct, position){
    	var me = this;
        Ext.ux.form.FileUploadField.superclass.onRender.call(me, ct, position);

        me.wrap = me.el.wrap({cls:'x-form-field-wrap x-form-file-wrap'});
        me.el.addClass('x-form-file-text');
        me.el.dom.removeAttribute('name');
        me.createFileInput();

        var btnCfg = Ext.applyIf(me.buttonCfg || {}, {
            text: me.buttonText
        });
        me.button = new Ext.Button(Ext.apply(btnCfg, {
            renderTo: me.wrap,
            cls: 'x-form-file-btn' + (btnCfg.iconCls ? ' x-btn-icon' : '')
        }));

        if(me.buttonOnly){
            me.el.hide();
            me.wrap.setWidth(me.button.getEl().getWidth());
        }

        me.bindListeners();
        me.resizeEl = me.positionEl = me.wrap;
    },
    
    bindListeners: function(){
    	var me = this;
        me.fileInput.on({
            scope: me,
            mouseenter: function() {
                me.button.addClass(['x-btn-over','x-btn-focus'])
            },
            mouseleave: function(){
                me.button.removeClass(['x-btn-over','x-btn-focus','x-btn-click'])
            },
            mousedown: function(){
                me.button.addClass('x-btn-click')
            },
            mouseup: function(){
                me.button.removeClass(['x-btn-over','x-btn-focus','x-btn-click'])
            },
            change: function(){
                var v = me.fileInput.dom.value;
                me.setValue(v);
                me.fireEvent('fileselected', me, v);    
            }
        }); 
    },
    
    createFileInput : function() {
        this.fileInput = this.wrap.createChild({
            id: this.getFileInputId(),
            name: this.name||this.getId(),
            cls: 'x-form-file',
            tag: 'input',
            type: 'file',
            size: 1
        });
    },
    
    reset : function(){
        this.fileInput.remove();
        this.createFileInput();
        this.bindListeners();
        Ext.ux.form.FileUploadField.superclass.reset.call(this);
    },

    // private
    getFileInputId: function(){
        return this.id + '-file';
    },

    // private
    onResize : function(w, h){
        Ext.ux.form.FileUploadField.superclass.onResize.call(this, w, h);

        this.wrap.setWidth(w);

        if(!this.buttonOnly){
            var w = this.wrap.getWidth() - this.button.getEl().getWidth() - this.buttonOffset;
            this.el.setWidth(w);
        }
    },

    // private
    onDestroy: function(){
        Ext.ux.form.FileUploadField.superclass.onDestroy.call(this);
        Ext.destroy(this.fileInput, this.button, this.wrap);
    },
    
    onDisable: function(){
        Ext.ux.form.FileUploadField.superclass.onDisable.call(this);
        this.doDisable(true);
    },
    
    onEnable: function(){
        Ext.ux.form.FileUploadField.superclass.onEnable.call(this);
        this.doDisable(false);

    },
    
    // private
    doDisable: function(disabled){
        this.fileInput.dom.disabled = disabled;
        this.button.setDisabled(disabled);
    },


    // private
    preFocus : Ext.emptyFn,

    // private
    alignErrorIcon : function(){
        this.errorIcon.alignTo(this.wrap, 'tl-tr', [2, 0]);
    }

});

Ext.reg('fileuploadfield', Ext.ux.form.FileUploadField);

// backwards compat
Ext.form.FileUploadField = Ext.ux.form.FileUploadField;
