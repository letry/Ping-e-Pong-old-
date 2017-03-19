"use strict";
var Walls = [], Balls = [], Users = [], Bonuses = [], contBonus, score = 0, statistic;

Array.prototype.deepRemove = function(elem) {
    
    var indx = this.indexOf(elem);
    if (indx !== -1) {
        return this.splice(indx, 1);
    } else {
        for (let i = 0; i < this.length; ++i) {
            if (Array.isArray(this[i])) this[i].deepRemove(elem);
        }
    }
    return false;
}

Object.defineProperties(Balls, {
    create: {
        enumerable: false,
        get: function() {return 0},
        set: function(val) {
                var lastBall = this[this.length - 1],
                    lBspd = lastBall.spd,
                    lBpwr = lastBall.pwr;

                for (let i = val + 1; --i;) {
                    let lBpos = lastBall.getPosition.slice(),
                        lBdir = lastBall.getDirection.slice();
                    
                    if (i == val) revDir(1);
                    else if (i == val-1) revDir(0,1);
                    else if (i == val-2) revDir(1,0);
                    
                    this.push( new Ball(lBspd, lBpwr, lBpos, lBdir) );
                    this[this.length-1].start();
                    
                    function revDir(y) {
                        if ( arguments[1] ) {
                            lBdir[0] = !lBdir[0];
                            lBdir[1] = !lBdir[1];
                        } else {
                            y ? lBdir[0] = !lBdir[0] :
                            lBdir[1] = !lBdir[1];
                        }
                    }
                }
            }
        },
        spd: {
            enumerable: false,
            get: function() {return 0},
            set: function(val) {
                for (let i = 0; i < this.length ; ++i) {
                    this[i].spd -= val * 50;
                } 
            }
        },
        pwr: {
            enumerable: false,
            get: function() {return 0},
            set: function(val) {
                for (let i = 0; i < this.length ; ++i) {
                    this[i].pwr += val;
                }
            }
        },
        delete: {
            enumerable: false,
            get: function() {return 0},
            set: function(val) {
                let length = this.length;
                
                    for (let i = length - 1;
                         (val == Infinity ? true : this.length > 1) && 
                         this.length > length - val &&
                         this.length > 0;
                         --i) {
                        this[i].stop();
                        let position = this[i].getPosition.slice(),
                            posY = position[0],
                            posX = position[1];

                        draw(posX, posY);
                        --this.length;
                }
            }
        }
});

Object.defineProperties(Walls, {
    create: {
        enumerable: false,
        get: function() {return 0},
        set: function(val) {
            var emptyBlocks = $('td[col]:not([class],[style])'),
                randBlock = getRandom(0, emptyBlocks.length),
                randX = +emptyBlocks[randBlock].attributes[0].value,
                randY = +emptyBlocks[randBlock].parentNode.attributes[0].value.slice(1);

                this.push( new Wall(val, randX, randY) );
            }
    },
    clear: {
        enumerable: false,
        get: function() {return 0},
        set: function(val) {
            !function cleared(Wall) {
                for (let i = Wall.length - 1; i >= 0 && val; --i) {
                    if ( Array.isArray(Wall[i]) ) cleared(Wall[i]);
                    
                    if (val) {
                        Wall[i].HP = 0;
                        Walls.deepRemove(Wall[i]);
                        --val;
                    }
                    
                }
            }(this);
        }
    }
    
});


function Ball(spd, pwr, position, direction) {
    var intId;
    
    this.pwr = pwr;
    this.spd = spd;
    this.getPosition = position;
    this.getDirection = direction;
    
	this.start = function intrval() {
			var Y = position[0],
                X = position[1],
                clr = 305 - this.pwr * 50,
                color = "rgb("+clr+", 255, 255)";
			
			draw(position[1], position[0]);
     
            checkAll.call(this);
			
            direction[0] ? Y++ : Y--;
            direction[1] ? X++ : X--;
			
			while ( checkBlock(Y, X, this.pwr) ) {
				revDir(1, 1);
				direction[0] ? Y++ : Y--;
				direction[1] ? X++ : X--;
				checkAll.call(this);
			}
            
			direction[0] ? position[0]++ : position[0]--;
            direction[1] ? position[1]++ : position[1]--;
            
            draw(position[1], position[0], color, 'border');
			
			//Регулировка направления
			function checkAll() {
				if ( (direction[0] && (checkBlock(Y+1, X, this.pwr))) || 
                     (!direction[0] && (checkBlock(Y-1, X, this.pwr)))) {
                    revDir(1);
                }
                if ( (direction[1] && (checkBlock(Y, X+1, this.pwr))) || 
                     (!direction[1] && (checkBlock(Y, X-1, this.pwr)))) {
                    revDir();
                }
			}
            
			//Инверсия направления
			function revDir(y) {
				if ( arguments[1] ) {
					direction[0] = !direction[0];
					direction[1] = !direction[1];
				} else {
					y ? direction[0] = !direction[0] :
					direction[1] = !direction[1];
				}
			}

            //Изменение скорости
            if (this.spd > settings.speedBall / 3) this.spd --;
            ++score;
            
        intId = setTimeout(intrval.bind(this), this.spd);
	};
	this.stop = function(){
		clearTimeout(intId);
	};
}

function User(speed, widthShield, HP, part) {

    this.ready = false;

    Object.defineProperties(this, {
        part : {
            value : part,
            writable : false,
            configurable : false
        },
    	HP: {
    		get: function() {return HP},
    		set: function(val) {
                var indx = part ? 1 : 0;
    			HP = val;
                if (settings.multiWall) {
                    Walls[indx] = [];
                    for (var i = settings.height; i >= 0 ; --i) {
                        Walls[indx].push( new Wall(val, part, i) );
                    }
                } else {
                    Walls[indx] = new Wall(val, null, part);
                }
    		}
    	},
    	speed: {
    		get: function() {
                return Math.round((settings.SpeedShield - speed) / (settings.SpeedShield / 6));
            },
    		set: function(val) {
                if (val > 0) {
                    var spd = settings.SpeedShield - val * (settings.SpeedShield / 6);
                    this.shield.speed = speed = spd;
                }
    		}
    	},
    	widthShield: {
    		get: function() {return widthShield},
    		set: function(val) {
                var center = Math.floor(settings.height/2), width = [];
                
                if (val > 0) {
                    widthShield = val;
                    for (;--val + 1;){
                        width.push(++center);
                    }   

                    if (this.shield) this.shield.HP = 0;
                    this.shield = new Shield(Infinity, part ? part - settings.playZone : part + settings.playZone, width, speed);
                }
                
    		}
    	}
    });

    this.HP = HP;
    this.widthShield = widthShield; 
    this.speed = speed;
}

function Wall(HP, x, y) {
    
    this.draw = function () {
        var color = HP == Infinity ? 'blue':
            HP > 2 && HP < Infinity ? 'rgba(255,255,255,0.7)' :
            HP == 2 ? '#78705E' :
            HP == 1 ? 'rgba(147, 108, 99, 0.76)': null,
            cls = HP > 0 ? 'border' : null;
        
        draw(x, y, color, cls);
    }
		
    this.setWall = function () {
        var X = [], Y = [];
        if ( Array.isArray(x) ) {
			if (Array.isArray(y)) {
				x.forEach(function(item, i) {
                    Y.push(y[i]);
                    X.push(x[i]);
                }); 
			} else {
                x.forEach(function(item, i) {
                    Y.push(y);
                    X.push(x[i]);
                }); 
            }
		} else {
            if (Array.isArray(y)) {
				y.forEach(function(item, i) {
                    Y.push(y[i]);
                    X.push(x);
                }); 
			} else {
                
                if ( (x || x === 0) && (y || y === 0) ) {
                    Y.push(y);
                    X.push(x);
                } else if (x || x === 0) {
                    for (var i = 0; i <= settings.width; i++) {
                        Y.push(x);
                        X.push(i);
                    }
                } else if (y || y === 0) {
                    for (var i = 0; i <= settings.height; i++) {
                        Y.push(i);
                        X.push(y);
                    }
                } else {
                    Y = null;
                    X = null;
                }
            }
        }
        this.x = x = X;
        this.y = y = Y;
    }
    
    Object.defineProperty(this, 'HP', {
		get: function() {return HP},
		set: function(val) {
            HP = val;
            this.setWall();
            this.draw();
		}
	});
    
    this.HP = HP;
    this.x = x;
    this.y = y;
     
}

function Shield(HP, x, y, speed) {
    var ready = true;
	Wall.call(this, HP, x, y);
    
    this.speed = speed;
	this.move = function(dir) {
        if (ready) {
            var maxY = Math.max.apply(null, this.y),
                minY = Math.min.apply(null, this.y),
                maxIndY = this.y.indexOf(maxY),
                minIndY = this.y.indexOf(minY);
            
        	if (dir === 1 || !dir) {
                var Y = !dir ? maxY + 1 : minY - 1,
                    indx = !dir ? maxIndY : minIndY,
                    dir = !dir ? 1 : -1;
                
                if ( !checkBlock(Y, this.x[indx]) ) {
                    for (var i = this.y.length; i--;) {
                        draw(this.x[i], this.y[i]);
                        this.y[i] += dir;
                    }
                    this.draw();
                }
        	} else {
                if(dir === -2 || dir === 2) {
                    dir = dir === 2 ? 1 : -1;
                    
                    for (var i = this.y.length - 1; i > -1; i--) {
                        if ( isntPzone(this.x[i] + dir, this.y[i]) ||
                            checkBlock(this.y[i], this.x[i] + dir)) break;
                        if (i == 0) {
                            for (var l = this.y.length - 1; l > -1; l--) {
                                draw(this.x[l], this.y[l]);
                                this.x[l] += dir;
                            }      
                            this.draw();
                        }
                    }
        	   }
            }
            
            
            ready = false;
            setTimeout(function() {ready = true}, this.speed)
        }
        function isntPzone(x, y) {
            return !$('tr[row="a'+ y +'"] > td[col="'+ x +'"]').hasClass('playZone');
        }
    }
}

function Bonus(x, y, conf) {
    var cls = contBonus[conf[0]][conf[1]][conf[2]].getClass(),
        val = contBonus[conf[0]][conf[1]][conf[2]].getVal(),
        bgs = getBackgrounds(cls);
    
    $('tr[row="a'+y+'"] > td[col="'+x+'"]')
        .css({'background':bgs, 'background-size': 'cover', 'background-repeat': 'round'});
    
    this.x = x;
    this.y = y;
    this.activate = function(part) {
        var target = val[2];
        
        if (val[2][0] instanceof User) {
            if ((part && val[0] == 1) || (!part && val[0] == -1)) {
                target = val[2][1];
            } else {
                target = val[2][0];
            }
        }
        
        target[val[1]] += val[0];
    }
    
    function getBackgrounds(cls) {
        var clas = [];
        for (let i=0; i<cls.length; ++i) {
            clas.push('url(img/'+cls[i]+'.png)')
        }
        return clas.join(',');
    }
    
}


Bonus.activate = function (x, y, part) {
    Bonuses.forEach(function(item, i) {
        if (item.x == x && item.y == y) {
            item.activate(part);
            Bonuses.splice(i, 1);
        }
    });
}

Bonus.runCreater = function bonusCreater () {
    var playZoneBlocks = $('td[class="playZone"]'),
        randBlock = getRandom(0, playZoneBlocks.length),
        randX = +playZoneBlocks[randBlock].attributes[0].value,
        randY = +playZoneBlocks[randBlock].parentNode.attributes[0].value.slice(1),
        
        randClass = getRandom(0, [contBonus.length]),
        randType =  getRandom(0, [contBonus[randClass].length] ),
        randAct =   getRandom(0 ,[contBonus[randClass][randType].length]);
    
    Bonuses.push( new Bonus(randX, randY, [randClass, randType, randAct]) );
    
    Bonus.timeoutId = setTimeout(bonusCreater, settings.bonusСhance);
}

Bonus.stopCreater = function () {
    if (this.timeoutId) clearTimeout(this.timeoutId);
}

Bonus.clear = function() {
    $('.main table td[style *= "png"]').removeAttr('style');
    Bonuses = [];
}


//AutoFunctions
startSetting();

if (settings.bonuses) {
    contBonus = new BonusClass('bonus', null);

    contBonus.push(
        new BonusClass('Ball', Balls),
        new BonusClass('pWall', [Users[0], Users[1]]),
        new BonusClass('Shield', [Users[0], Users[1]]),
        new BonusClass('Wall', Walls));

    contBonus[0].push(
        new BonusClass('Speeds', 'spd'),
        new BonusClass('Power', 'pwr'),
        new BonusClass('Multi', 'create'),
        new BonusClass('Delete', 'delete')
    );

    contBonus[1].push(new BonusClass('Health', 'HP'));

    contBonus[2].push(
        new BonusClass('Speeds', 'speed'),
        new BonusClass('Widths', 'widthShield')
    );

    contBonus[3].push(new BonusClass('Set', 'create'));

    actions([
        contBonus[0][0],
        contBonus[0][1],
        contBonus[1][0],
        contBonus[2][0],
        contBonus[2][1]
    ]);
    
    actions([
        contBonus[0][2],
        contBonus[0][3],
        contBonus[3][0]
    ], 1)
    
}
    
//Kontroller
$('body').on('keydown', function(e){

    switch(e.which) {
            
        case 87:
            Users[0].shield.move(1);
        break;
        case 83:
            Users[0].shield.move(null);
        break;

        case 65:
            Users[0].shield.move(-2);
        break;
        case 68:
            Users[0].shield.move(2);
        break;
            
            
        case 38:
            Users[1].shield.move(1);
        break;
        case 40:
            Users[1].shield.move(null);
        break;

        case 37:
            Users[1].shield.move(-2);
        break;
        case 39:
            Users[1].shield.move(2);
        break;
    }

});

$('.startButtons input[type="number"]').on('change', function(e){
    var attr = +$(this).attr('value'),
        val = +$(this).val(),
		cls = $(this).attr('class'),
        points = $(this).siblings('.countPoint').text(),
        userId = +$(this).parent().attr('class')[7];
    
	if ( (val > 3 || val < 1) ) {
        $(this).parent().find('input[type="number"]').attr('value', 1);
        $(this).parent().find('input[type="number"]').val(1);
        $(this).parent().find('.countPoint').text(3);
    } else {
        
        if ( val > attr ) {
            if (points > 0) {
                $(this).attr( 'value', val );
                $(this).siblings('.countPoint').text(--points);
				userChange(val);
            } else {
                $(this).attr('value', attr );
                $(this).val(attr);
				userChange(attr);
            }
        } else {
            $(this).attr( 'value', val );
            $(this).siblings('.countPoint').text(++points);
			userChange(val);			
        }
    }
	
    function userChange(val) {
        Users[userId][cls] = val;
	}
});

$('.confirm').click(function() {
    var userId = +$(this).parent().attr('class')[7];
    $(this).parent().find('input').attr('disabled', 1);
    
    Users[userId].ready = true;
    
    if ( Users.every(isReady) ) startGame();

    function isReady(User) {
        return User.ready;
    }
});

$('.rtrnSetPlayer').click(function(){
    Bonus.clear();
    Walls.clear = Infinity;
    Balls.delete = Infinity;
    
    startSetting();
    $('footer').hide();
});

$('.rtrn').click(function(){
    Bonus.clear();
    Walls.clear = Infinity;
    Balls.delete = Infinity;
    
    returnUsers();
    startGame();
    $('footer').hide();
});

$('.rtrnSetField').click(function(){
    document.location.href = document.location;
});


//View
function draw(x, y, col, cls){

    if (Array.isArray(x) && Array.isArray(y)) {
        x.forEach(function(item, i) {
            drawBlock(x[i], y[i]);
        });
    } else {
        drawBlock(x, y);
    }

    function drawBlock(x, y) {
        
        var blk = $('tr[row="a'+ y +'"] > td[col="'+ x +'"]');

        if (cls) blk.addClass(cls);
        else blk.removeClass('border');
        
        if (col) blk.css({background: col});
        else blk.removeAttr('style');

    } 
}

//Functions
function returnUsers() {
    let spd_0 = +$('.speed:first').val(),
        spd_1 = +$('.speed:last').val(),
        wdt_0 = +$('.widthShield:first').val(),
        wdt_1 = +$('.widthShield:last').val(),
        hp_0 = +$('.HP:first').val(),
        hp_1 = +$('.HP:last').val();
    
    Users[0].HP = hp_0;
    Users[1].HP = hp_1;
        
    Users[0].speed = spd_0;
    Users[1].speed = spd_1;
        
    Users[0].widthShield = wdt_0;
    Users[1].widthShield = wdt_1;
}

function startGame() {
    Balls.push( new Ball(settings.speedBall, settings.powerBall,
         [Math.floor(settings.height/2), Math.floor(settings.width/2)],
          [1, 1]) );
        Balls[Balls.length-1].start();
    
    if (settings.bonuses) {
        Bonus.runCreater();
    }
}

function startSetting(){  
    if (!Users[0]) {
        Users.push(new User(1, 1, 1, 0), new User(1, 1, 1, settings.width));
    } else {
        $('.startButtons').find('input').removeAttr('disabled');
        returnUsers()
        Users[0].ready = Users[1].ready = false;
    }
}

function checkBlock(y, x, pwr) {
    var pwr = pwr || 0;
    
    //Проверка победы
        if ( x < Users[0].part || x > Users[1].part ) {
                
            if ( x < Users[0].part ) {
                alert('Конец игры. Победил игрок 2 со счетом '+score);
            }
            if ( x > Users[1].part ) {
                alert('Конец игры. Победил игрок 1 со счетом '+score);
            }
            
            Balls.forEach(function(Ball) {
                Ball.stop();
            });
            Bonus.stopCreater();
            $('footer').show();
            throw 'Игра окончена';
        }

    if ( !$('tr').is('[row="a'+ y +'"]') ||
        $('tr[row="a'+ y +'"] > td[col="'+ x +'"]').hasClass('border')) {
             
        //Удар стены
        (function WallHit(Walls) {
            
            Walls.forEach(function(Wall, l) {
                var X = Wall.x, Y = Wall.y;
                
                if (Array.isArray(Wall)) WallHit(Wall);
                else {
                    for (let i = X.length ; i--; ) {
                        if ( X[i] == x && Y[i] == y ) {
                            Wall.HP -= pwr;
                            if (!Wall.HP) {
                                window.Walls.deepRemove(Wall);
                            }
                            break;
                        }
                    }
                }
            });
            
        })(Walls);
        
        return true;
        
    } else if (!pwr && $('tr[row="a'+ y +'"] > td[col="'+ x +'"]').attr('style') ) {
        var part = x > settings.width / 2 ? 1 : 0; 
        Bonus.activate(x, y, part);
    }
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}