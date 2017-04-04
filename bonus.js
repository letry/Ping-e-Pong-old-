'use strict';

function Bonus(x, y, conf) {
    this._cls = contBonus[conf[0]][conf[1]][conf[2]].getClass();
    this._val = contBonus[conf[0]][conf[1]][conf[2]].getVal();
    this._bgs = getBackgrounds(this._cls);
    this.x = x;
    this.y = y;
    
    $('tr[row="a'+y+'"] > td[col="'+x+'"]')
    .css({
        'background':this._bgs,
        'background-size': 'cover',
        'background-repeat': 'round'
    });
    
    function getBackgrounds(cls) {
        var clas = [];
        for (let i=0; i<cls.length; ++i) {
            clas.push('url(img/'+cls[i]+'.png)')
        }
        return clas.join(',');
    }
}
Bonus.prototype.activate = function(part) {
    let val = this._val,
        target = val[2];
        
    if (val[2][0] instanceof User) {
        if ((part && val[0] == 1) || (!part && val[0] == -1)) {
            target = val[2][1];
        } else {
            target = val[2][0];
        }
    }    
    target[val[1]] += val[0];
}

Bonus.activate = function (x, y, part) {
    Bonuses.forEach(function(item, i) {
        if (item.x == x && item.y == y) {
            item.activate(part);
            Bonuses.splice(i, 1);
            ++statistic.activBonuses;
        }
    });
}

Bonus.runCreater = function bonusCreater () {
    let playZoneBlocks = $('td[class="playZone"]'),
        randBlock = getRandom(0, playZoneBlocks.length),
        randX = +playZoneBlocks[randBlock].attributes[0].value,
        randY = +playZoneBlocks[randBlock].parentNode.attributes[0].value.slice(1),
        
        randClass = getRandom(0, [contBonus.length]),
        randType =  getRandom(0, [contBonus[randClass].length] ),
        randAct =   getRandom(0 ,[contBonus[randClass][randType].length]);
    
    Bonuses.push( new Bonus(randX, randY, [randClass, randType, randAct]) );
    ++statistic.totalBonuses;
    Bonus.timeoutId = setTimeout(bonusCreater, settings.bonusСhance);
}

Bonus.stopCreater = function () {
    if (this.timeoutId) clearTimeout(this.timeoutId);
}

Bonus.clear = function() {
    $('.main table td[style *= "png"]').removeAttr('style');
    Bonuses = [];
}


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

let effects = {
    get storm() {return 0},
    get rotation() {return 0},
    set storm(scnd) {
        let allMs = scnd * 5000,
            lightMs = scnd * 1500,
            light = document.createElement('div'),
            ready = true;
        
        light.className = 'light';
        document.body.appendChild(light);
        
        setTimeout(() => {
            document.body.removeChild(light);
            ready = false;
        }, allMs);
        
        lightning();
        
        function lightning() {
            light.setAttribute('style', 'opacity:0.2');
            setTimeout(() => light.setAttribute('style', 'opacity:0.8'), 400);
            
            if (ready) setTimeout(lightning, lightMs);
        }
    },
    set rotation(count) {
        let table = document.getElementsByTagName('table')[0];
        
        rotate(count * 360);
        
        function rotate(degr) {
            table.setAttribute(
                'style',
                `transform: rotate(${--degr}deg)`
            );
            if (degr) setTimeout(() => rotate(degr), 20);
            else table.removeAttribute('style');
        }
    }
}