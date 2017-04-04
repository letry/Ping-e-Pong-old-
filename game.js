"use strict";
let Walls = [], Balls = [], Users = [], Bonuses = [], contBonus, score = 0,
    statistic = {
        stepBall: 0,
        destroyedWall: 0,
        totalBonuses: 0,
        totalBalls: 0,
        totalWalls: 0,
        activBonuses: 0,
        startTimer() {
            return this.startTime = new Date;
        },
        stopTimer() {
            if (this.startTime) {
                let difTime = new Date(new Date - this.startTime);
                return this.gameTime = difTime.getMinutes() + ':' + difTime.getSeconds();
            } else return 'Таймер не запущен';
        },
        reset() {
            for (let prop in this) {
                if (typeof this[prop] != 'function') {
                    this[prop] = 0;
                }
            }
        }
    };

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
                var lB = this[this.length - 1];

                for (let i = val + 1; --i;) {
                    let newBall = new Ball(
                        lB.spd, lB.pwr, 
                        [lB._y, lB._x], 
                        [lB._vertic, lB._horiz]
                    );
                    this.push( newBall );
                    
                    if (i == val) newBall.revDir(1);
                    else if (i == val-1) newBall.revDir(0,1);
                    else if (i == val-2) newBall.revDir(1,0);
                    
                    newBall.start();
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
                if (settings.theme == 'animate') {
                    document.getElementsByTagName('table')[0]
                        .removeChild(this[i].ball);
                }
                this[i].stop();
                draw(this[i]._x, this[i]._y);
                --this.length;
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
    frz: {
        enumerable: false,
        get: function() {return 0},
        set: function(val) {
            let ms = val * 1000;
            for (let i = 0; i < this.length ; ++i) {
                this[i].stop();
                setTimeout(() => {
                    this[i].start();
                }, ms);
            }
        }
    },
    rvrs: {
        enumerable: false,
        get: function() {return 0},
        set: function(val) {
            this.forEach((ball) => {
                ball.revDir(1, 1);
            });
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
                ++statistic.totalWalls;
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
                            --val;
                        }
                }
            }(this);
        }
    }
});


//Constructors
function Ball(spd, pwr, position, direction) {
    this.pwr = pwr;
    this.spd = spd;
    
    [this._y, this._x] = position;
    [this._vertic, this._horiz] = direction;
    
    (() => {
        let color = settings.theme != 'animate' ?
            `rgb(${305 - pwr * 50}, 255, 255)` : null;
        
        if (settings.theme == 'animate') {
            let pos = $(`tr[row="a${this._y}"] td[col="${this._x}"]`).position();
            this.ball = document.createElement('img');
            this.ball.src = 'img/Balls.png';
            this.ball.className = 'ball';
            this.ball.setAttribute('style', `top: ${pos.top}px; left: ${pos.left}px;`);
            document.getElementsByTagName('table')[0].appendChild(this.ball);
        }
        
        draw(position[1], position[0], color, 'border');
        ++statistic.totalBalls;
    })();
}
Ball.prototype.stop = function() {clearTimeout(this._intId)};
Ball.prototype.start = function intrval() {
    var checkAll,
        Y = this._y,
        X = this._x,
        color = settings.theme != 'animate' ?
        `rgb(${305 - this.pwr * 50}, 255, 255)` : null;
    
    //Регулировка направления
    checkAll = () => {
        if ( (this._vertic && (checkBlock(Y+1, X, this.pwr))) || 
            (!this._vertic && (checkBlock(Y-1, X, this.pwr)))) {
                this.revDir(1);
            }
       if ( (this._horiz && (checkBlock(Y, X+1, this.pwr))) || 
            (!this._horiz && (checkBlock(Y, X-1, this.pwr)))) {
                this.revDir();
            }
    }

    draw(this._x, this._y);
     
    checkAll();
			
    this._vertic ? Y++ : Y--;
    this._horiz ? X++ : X--;
			
	while ( checkBlock(Y, X, this.pwr) ) {
	    this.revDir(1, 1);
		this._vertic ? Y++ : Y--;
		this._horiz ? X++ : X--;
		checkAll();
    }
            
	this._vertic ? this._y++ : this._y--;
    this._horiz ? this._x++ : this._x--;
    
    if (settings.theme == 'animate') {
        let pos = $(`tr[row="a${this._y}"] td[col="${this._x}"]`).position();
        if (pos) {
            $(this.ball).animate({top: pos.top, left: pos.left}, this.spd-50, 'linear');
        }
    }
    
    draw(this._x, this._y, color, 'border');

    //Ускорение
    if (this.spd > settings.speedBall / 3) this.spd --;
    ++statistic.stepBall;
            
    this._intId = setTimeout(intrval.bind(this), this.spd);
}
Ball.prototype.revDir = function(y) {
    if ( arguments[1] ) {
		this._vertic = !this._vertic;
		this._horiz = !this._horiz;
	} else {
		y ? this._vertic = !this._vertic :
		this._horiz = !this._horiz;
	}
}

function User(speed, widthShield, HP, part) {

    this.ready = false;
    this.walls = [];
    
    Object.defineProperties(this, {
        part : {
            value : part,
            writable : false,
            configurable : false
        },
    	HP: {
    		get: function() {return HP},
    		set: function(val) {
                var indx = part ? 1 : 0,
                    sign = val > HP ? 1 : -1;
                
    			HP = val > -1 ? val : 0;
                
                if (settings.multiWall) {
                    
                    if (this.walls.length) {
                        let lngth = this.walls.length;
                        for (let i = 0; i < lngth; ++i) {
                            let itr = HP ? i : 0;
                            this.walls[itr].HP += sign;
                        }
                    } else {
                        for (var i = settings.height; i >= 0 ; --i) {
                            this.walls.push( new Wall(val, part, i) );
                        }
                        if (!~Walls.indexOf(this.walls)) Walls.push(this.walls);
                    }
                    
                } else {
                    if (this.walls.length) {
                        this.walls[0].HP = HP;
                    } else {
                        let wall = new Wall(val, null, part)
                        this.walls.push(wall);
                        Walls.push(wall);
                    }
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
                if (this.shield) {
                    if (val > 0) {
                        let value = val > widthShield ? 1 : 0;
                        this.shield.resize(value);
                        widthShield = val;
                    }
                } else {
                    let center = Math.floor(settings.height/2), width = [];
                
                    widthShield = val;
                    for (;--val + 1;){
                        width.push(++center);
                    }   

                    this.shield = new Shield(
                        speed,
                        Infinity,
                        part ? part - settings.playZone : part + settings.playZone,
                        width
                    );
                }
    		}
    	}
    });

    this.HP = HP;
    this.widthShield = widthShield; 
    this.speed = speed;
}

function Wall(HP, x, y) {
    [this.x, this.y] = normalizCoord(x, y);
    
    Object.defineProperty(this, 'HP', {
		get: function() {return this._HP},
		set: function(val) {
            this._HP = val;
            this.draw();
            if (val < 1) {
                Walls.deepRemove(this);
                
                if (this.x[0] === 0) {
                    Users[0].walls.deepRemove(this);
                } else if (this.x[0] === settings.width) {
                    Users[1].walls.deepRemove(this);
                }
                
                ++statistic.destroyedWall;
            }
		}
	});

    this.HP = HP;
}
Wall.prototype.draw = function(clear) {
    let color = 
        clear ? null:
        this.HP == Infinity ? 'blue':
        this.HP > 2 && this.HP < Infinity ? 'rgba(255,255,255,0.7)' :
        this.HP == 2 ? '#78705E' :
        this.HP == 1 ? 'rgba(147, 108, 99, 0.76)': null,
        
        cls = clear ? null:
        this.HP > 0 ? 'border' : null;
        
    draw(this.x, this.y, color, cls);
}

function Shield(speed, ...args) {
	Wall.apply(this, args);
    this.speed = speed;
    this._ready = true;
}
Shield.prototype = Object.create(Wall.prototype);
Shield.prototype.move = function(dir) {
    if (this._ready) {
        let maxY = Math.max.apply(null, this.y),
            minY = Math.min.apply(null, this.y),
            maxIndY = this.y.indexOf(maxY),
            minIndY = this.y.indexOf(minY);
            
    	if (dir === 1 || !dir) {
            var Y = !dir ? maxY + 1 : minY - 1,
                indx = !dir ? maxIndY : minIndY,
                dir = !dir ? 1 : -1;
            
            if ( !checkBlock(Y, this.x[indx]) ) {
                this.draw(1);
                for (var i = this.y.length; i--;) {
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
                        this.draw(1);
                        for (var l = this.y.length - 1; l > -1; l--) {
                            this.x[l] += dir;
                        }      
                        this.draw();
                    }
                }
    	   }
        }    
        this._ready = false;
        setTimeout(() => this._ready = true, this.speed);
    }
    function isntPzone(x, y) {
        return !$('tr[row="a'+ y +'"] > td[col="'+ x +'"]').hasClass('playZone');
    }
}
Shield.prototype.resize = function(up) {
    let maxY = Math.max(...this.y),
        minY = Math.min(...this.y),
        x = this.x[0];
    
    this.draw(1);
    if (up) {
        this.x.push(this.x[0]);
        
        if (!checkBlock(--minY, x)) {
            this.y.push(minY);
        } else if (!checkBlock(++maxY, x)) {
            this.y.push(maxY);
        }  
    } else {
        let value = getRandom(0, 2) ? maxY : minY;
        
        this.y.splice(this.y.indexOf(value), 1);
        this.x.pop();
    }
    this.draw();
}
Shield.prototype.constructor = Shield;


//AutoFunctions
startSetting();

if (settings.bonuses) {
    contBonus = new BonusClass('bonus', null);

    contBonus.push(
        new BonusClass('Ball', Balls),
        new BonusClass('pWall', [Users[0], Users[1]]),
        new BonusClass('Shield', [Users[0], Users[1]]),
        new BonusClass('Wall', Walls),
        new BonusClass('Effect', effects)
    );

    contBonus[0].push(
        new BonusClass('Speeds', 'spd'),
        new BonusClass('Power', 'pwr'),
        new BonusClass('Multi', 'create'),
        new BonusClass('Delete', 'delete'),
        new BonusClass('freeze', 'frz'),
        new BonusClass('reverse', 'rvrs')
    );

    contBonus[1].push(new BonusClass('Health', 'HP'));

    contBonus[2].push(
        new BonusClass('Speeds', 'speed'),
        new BonusClass('Widths', 'widthShield')
    );

    contBonus[3].push(
        new BonusClass('Set', 'create'),
        new BonusClass('Delete', 'clear')
    );
    
    contBonus[4].push(
        new BonusClass('storm', 'storm'),
        new BonusClass('rotation', 'rotation')
    );

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
        contBonus[0][4],
        contBonus[3][0],
        contBonus[3][1],
        contBonus[4][0],
        contBonus[4][1]
    ], 1)
    
    contBonus[0][5].push(new BonusClass('none', 1));
}
if (settings.multiWall) {
    let style = document.head.children[4];
    style.textContent = '.main table tr td[class="playZone border"][style] {border: 1px solid white}';
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
$('.startButtons input[type="number"]').on('mouseenter', function() {
    $(this).on('keydown', function(e){
        e.preventDefault();
    });
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
    if (settings.bonuses) Bonus.clear();
    Walls.clear = Infinity;
    Balls.delete = Infinity;
    
    startSetting();
    $('footer, .statwrap').hide();
});

$('.rtrn').click(function(){
    if (settings.bonuses) Bonus.clear();
    Walls.clear = Infinity;
    Balls.delete = Infinity;
    
    returnUsers();
    startGame();
    $('footer, .statwrap').hide();
});

$('.rtrnSetField').click(function(){
    document.location.href = document.location;
});

$('.stat').click(function() {
    $('.statistic').toggleClass('active');
    $('.statistic span').each(function(){
        let clas = $(this).attr('class');
        $(this).text(statistic[clas]);
    })
});

//View
function draw(x, y, col, cls){

    if (Array.isArray(x) && Array.isArray(y)) {
        x.forEach((item, i) => {
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

function gameOver(winner) {
    if (!gameOver.flag) {
        let winrBlck = $(`div[class="player ${winner}"] .countPoint`),
            points = +winrBlck.text();
        
        winrBlck.text(points + 1);
        
        info(`Конец игры. Победил игрок ${winner + 1}`);
        
        Balls.forEach((Ball) => {
            Ball.stop();
            setTimeout(()=>Ball.stop(), 100);
        });

        statistic.stopTimer();
        
        if (settings.bonuses) {
            Bonus.stopCreater();
            Bonus.clear();
        }
        
        $('footer, .statwrap').show();
    }
    gameOver.flag = true;
}

function info(msg, stat) {
    let cap = document.getElementsByTagName('caption')[0];
    cap.textContent = msg;
    if (!stat) {
        setTimeout(() => cap.textContent = '', 4000);
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
    
    Users[0].shield.draw(1);
    Users[1].shield.draw(1);
    
    Users[0].shield = Users[1].shield = null;
    
    Users[0].widthShield = wdt_0;
    Users[1].widthShield = wdt_1;
    
    Users[0].HP = hp_0;
    Users[1].HP = hp_1;
        
    Users[0].speed = spd_0;
    Users[1].speed = spd_1;
}

function startGame() {
    let spd = settings.speedBall,
        pwr = settings.powerBall,
        pozY = Math.floor(settings.height/2),
        pozX = Math.floor(settings.width/2),
        dirY = getRandom(0, 2),
        dirX = getRandom(0, 2);
    
    statistic.reset();
    gameOver.flag = false;
    
    Balls.push( new Ball(spd, pwr, [pozY, pozX], [dirY, dirX]) );
    $('.startButtons').hide(300);
    
    !function startAnimate(count) {
        --count;
        info(count, 1);
        if (count) {
            
            if (settings.theme == 'animate') {
                $('[class="border"]')
                    .html(`<div class="starter">${count}</div>`);
                $('[class="border"] > .starter')
                    .animate(
                    {fontSize: 0},
                    1000,
                    'swing',
                    startAnimate.bind(null, count));
            } else {
                setTimeout(startAnimate.bind(null, count), 1000);
            }
            
        } else {
            $('[class="border"]').html('');
            info('Игра началась!');
            start();
        }
    }(4);
    
    function start() {
        Balls[Balls.length-1].start();
        statistic.startTimer();

        if (settings.bonuses) {
            Bonus.runCreater();
        }
    }
    
}

function startSetting(){
    info('Подготовка игроков', 1);
    $('.startButtons').show(300);
    if (!Users[0]) {
        Users.push(new User(1, 1, 1, 0), new User(1, 1, 1, settings.width));
    } else {
        $('.startButtons').find('input').removeAttr('disabled');
        returnUsers();
        Users[0].ready = Users[1].ready = false;
    }
}

function checkBlock(y, x, pwr) {
    var pwr = pwr || 0;
    
    //Проверка победы
    if (Users.length) {
        if ( x < Users[0].part || x > Users[1].part ) {
            let winner = x > Users[1].part ? 0 : 1;
            gameOver(winner);
            return;
        }
    }

    if ( !$('tr').is('[row="a'+ y +'"]') ||
        $('tr[row="a'+ y +'"] > td[col="'+ x +'"]').hasClass('border')) {
             
        //Удар стены
        !function WallHit(Walls) {
            
            Walls.forEach((Wall, l) => {
                var X = Wall.x, Y = Wall.y;
                
                if (Array.isArray(Wall)) WallHit(Wall);
                else {
                    for (let i = X.length ; i--; ) {
                        if ( X[i] == x && Y[i] == y ) {
                            Wall.HP -= pwr;
                            break;
                        }
                    }
                }
            });
            
        }(Walls);
        
        return true;
        
    } else if (settings.bonuses && !pwr && $('tr[row="a'+ y +'"] > td[col="'+ x +'"]').attr('style') ) {
        var part = x > settings.width / 2 ? 1 : 0; 
        Bonus.activate(x, y, part);
    }
}

function normalizCoord(x, y) {
    var X = [], Y = [];
     if ( Array.isArray(x) ) {
		if (Array.isArray(y)) {
            x.forEach((item, i) => {
                if (!checkBlock(y[i], x[i])) {
                    Y.push(y[i]);
                    X.push(x[i]);
                }
            }); 
        } else {
            x.forEach((item, i) => {
                if (!checkBlock(y, x[i])) {
                    Y.push(y);
                    X.push(x[i]);
                }
            }); 
        }
     } else {
         if (Array.isArray(y)) {
	       y.forEach((item, i) => {
               if (!checkBlock(y[i], x)) {
                    Y.push(y[i]);
                    X.push(x);
               }
            }); 
         } else {
                
            if ( (x || x === 0) && (y || y === 0) ) {
                if (!checkBlock(y, x)) {
                    Y.push(y);
                    X.push(x);
                }
            } else if (x || x === 0) {
                for (var i = 0; i <= settings.width; i++) {
                    if (!checkBlock(x, i)) {
                        Y.push(x);
                        X.push(i);
                    }
                }
            } else if (y || y === 0) {
                for (var i = 0; i <= settings.height; i++) {
                    if (!checkBlock(i, y)) {
                        Y.push(i);
                        X.push(y);
                    }
                }
            } else {
                Y = null;
                X = null;
            }
        }
    }
    return [X, Y];
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}