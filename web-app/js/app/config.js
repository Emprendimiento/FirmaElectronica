Ext.ns('App');
Ext.ns('App.FirmaElectronica');
Ext.form.Field.prototype.msgTarget = 'side';
Ext.BLANK_IMAGE_URL = 'lib/ext/resources/images/default/s.gif';

MERGE_OBJETOS = function(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
};

INIT_SESION = function(obj){
    USER_ID = obj.id;
    USER_RUN = obj.run;
    USER_PERFIL = obj.perfil;
    USER_NOMBRES = obj.nombres;
    USER_APELLIDOS = obj.apellidos;
    USER_EMAIL = obj.email;
    return true;
};

RESET_SESION = function(obj){
    USER_ID = "";
    USER_RUN = "";
    USER_PERFIL = "";
    USER_NOMBRES = "";
    USER_APELLIDOS = "";
    USER_EMAIL = "";
    return true;
};