'use strict';

function BonusClass(name, val) {
    this.type = undefined;
    this.value = undefined;
    this.parent = undefined;
    
    this.push = function() {
        for (let i = 0; i < arguments.length; ++i){
            let obj = arguments[i];
            obj.parent = this;
            this[this.length] = obj;
        }
    }
    
    this.getClass = function() {
        var cls = [this.name],
        parent = this.parent;
        while(parent) {
            cls.push(parent.name);
            parent = parent.parent;
        }
        return cls;
    }
    
    this.getVal = function(){
        var val = [this.value],
        parent = this.parent;
        while(parent) {
            if (parent.value !== null) {
                val.push(parent.value);
            }
            parent = parent.parent;
        }
        return val;
    }
    
    Object.defineProperties(this, {
        type : {enumerable: false},
        push: {enumerable: false},
        parent : {enumerable: false},
        getVal: {enumerable: false},
        getClass: {enumerable: false},
        
        value : {
            enumerable: false,
            value: val
        },
        name: {
            enumerable: false,
            value: name
        },
        length: {
            enumerable: false,
            get: function() {
                return Object.keys(this).length;
            }
        },
    });
    
}
    
function actions(obj, numb) {
    obj.forEach(function(obj){
        if (!numb) {
            obj.push(new BonusClass('Down', -1));
            obj.push(new BonusClass('Up', 1));
            obj.push( new BonusClass('Rand', getRandom(0, 2) ? 1 : -1, 1) );
        } else {
            obj.push(new BonusClass('1', 1));
            obj.push(new BonusClass('2', 2));
            obj.push(new BonusClass('3', 3));
            obj.push(new BonusClass('Rand', getRandom(1, 4)));
        }
    });
}