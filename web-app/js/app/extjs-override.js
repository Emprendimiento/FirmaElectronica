(function() {
    var initComponent = Ext.Button.prototype.initComponent;

    /**
     * @class Ext.Button
     */
    Ext.override(Ext.Button, {
        /**
         * @cfg {String} cmpEvent
         * Nombre del evento que se gatillará cuando se ejecute el handler del botón.
         **/

        /**
         * @private
         **/
        initComponent : function() {
            var me = this, handler, scope;
            initComponent.call(me);

            if (me.cmpEvent) {
                scope = me.scope || me;
                handler = me.fireEvent.createDelegate(scope, [me.cmpEvent]);
                me.setHandler(handler, scope);
            }
        }
    });
})();

Ext.apply(Ext.form.VTypes,{
    'rutText': "RUT no v&aacute;lido, el formato debe ser: 00000000-0",
    'rutRe': /^0*(\d{1,3}(\.?\d{3})*)\-?([\dkK])$/,
    'rut': function (v) {
        var r = v.split('-');
        if (!r[1] || !r[0]) return false;
        function dv(T){
            var M=0,S=1;
            for(;T;T=Math.floor(T/10))
            S=(S+T%10*(9-M++%6))%11;
            return S?S-1:'k';
        }
        return this.rutRe.test(v) && dv(r[0]) == r[1].toLowerCase() ? true : false;
    }
});