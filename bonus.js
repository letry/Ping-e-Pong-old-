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
    
function actions(numb) {
    if (!numb) {
        this.push(new BonusClass('Down', -1));
        this.push(new BonusClass('Up', 1));
        this.push( new BonusClass('Rand', getRandom(0, 2) ? 1 : -1, 1) );
    } else {
        this.push(new BonusClass('1', 1));
        this.push(new BonusClass('2', 2));
        this.push(new BonusClass('3', 3));
        this.push(new BonusClass('Rand', getRandom(1, 4)));
    }
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}