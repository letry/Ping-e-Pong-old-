"use strict";
var Walls = [], Balls = [];

function Ball(spd, position, direction) {
    var intId = false;
    
    Object.defineProperty(this, 'speed', {
        get: function() {return spd},
        set : function(val) {
        		this.stop();
            spd = val;
       			this.start();
        }
    });
    
	this.start = function() {
        
		function intrval() {
			var Y = position[0],
                X = position[1];
			
			draw(position[1], position[0]);
     
            checkAll();
			
            direction[0] ? Y++ : Y--;
            direction[1] ? X++ : X--;
			
			while ( checkBlock(Y, X) ) {
				revDir(1, 1);
				direction[0] ? Y++ : Y--;
				direction[1] ? X++ : X--;
				checkAll();
			}
            
			direction[0] ? position[0]++ : position[0]--;
            direction[1] ? position[1]++ : position[1]--;
            
            draw(position[1], position[0], 'white');
			
			//Регулировка направления
			function checkAll() {
				
				if ( checkBlock(Y+1, X) || checkBlock(Y-1, X) ) {
					revDir(1);
				}
				
				if ( checkBlock(Y, X+1) || checkBlock(Y, X-1) ) {
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
		}
        
        intId = setInterval(intrval.bind(this), this.speed);
	};
	this.stop = function(){
		clearInterval(intId);
	};
}





function User(speed, widthShield, HP, part) {
    var wall, intId;

    this.start = function() {
        /*function intrval() {

        }
        intId = setInterval(intrval.bind(this), this.speed);*/
    }

    this.stop = function() {
    	clearInterval(intId);
    }

    Object.defineProperties(this, {
    	HP: {
    		get: function() {return HP},
    		set: function(val) {
    			HP = val;
    			wall = new Wall(val, null, part);
    		}
    	},
    	speed: {
    		get: function() {return speed},
    		set: function(val) {
    			this.stop();
    			speed = val;
    			this.start();
    		}
    	},
    	widthShield: {
    		get: function() {return widthShield},
    		set: function(val) {
    			this.shield = new Shield(-1, [part ? part - 1 : part + 1], [5]);
    			widthShield = val;
    		}
    	}
    });

    this.HP = HP;
    this.speed = speed;
    this.widthShield = widthShield; 
}




function Wall(HP, x, y) {
    
    this.draw = function () {
        var color = HP == 3 ? 'rgba(255,255,255,0.7)' :
        HP == 2 ? '#78705E' :
        HP == 1 ? 'rgba(147, 108, 99, 0.76)':
        HP == -1 ? 'blue' : 'none';
        
        x.forEach(function(item, i, x) {
            draw(x[i], y[i], color, 'border');
        });
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
                    for (var i = 0; i < 10; i++) {
                        Y.push(x);
                        X.push(i);
                    }
                } else if (y || y === 0) {
                    for (var i = 0; i < 10; i++) {
                        Y.push(i);
                        X.push(y);
                    }
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

function Shield(HP, x, y) {
	Wall.call(this, HP, x, y);
  
	this.move = function(up) {
        var maxY = Math.min.apply(null, this.y),
            minY = Math.min.apply(null, this.y),
            maxIndY = this.y.indexOf(maxY),
            minIndY = this.y.indexOf(minY);
        
    	if (up) {
            if ( !checkBlock(minY - 1, x[minIndY]) ) {
                for (var i = 0; i < this.y.length; i++) {
                    draw(this.x[i], this.y[i]);
                    this.y[i] -= 1;
                    this.draw(this.x[i], this.y[i] - 1);
                }
            }
    	} else {
            if ( !checkBlock(maxY + 1, x[maxIndY]) ) {
                for (var i = 0; i < this.y.length; i++) {
                    draw(this.x[i], this.y[i]);
                    this.y[i] += 1;
                    this.draw(this.x[i], this.y[i] + 1);
                }
            }
    	}
    }
}

//AutoFunctions
var User1 = new User(1, 1, 1, 0),
    User2 = new User(1, 1, 1, 9);
	
//Kontroller
$('body').on('keydown',function(e){

    switch(e.which) {
            
        case 87:
            User1.shield.move(1);
        break;
            
        case 83:
            User1.shield.move(null);
        break;
            
            
        case 38:
            User2.shield.move(1);
        break;
            
        case 40:
            User2.shield.move(null);
        break;
    }

});

$('input[type="number"]').on('change', function(e){

    var attr = $(this).attr('value'),
        val = $(this).val(),
		cls = $(this).attr('class'),
        points = $(this).siblings('.countPoint').text(),
        userId = $(this).parent().attr('class')[7];
    
	if ( (val > 3 || val < 1) ) {
        $(this).parent().find('input[type="number"]').attr('value', 1);
        $(this).parent().find('input[type="number"]').val(1);
        $(this).parent().find('.countPoint').text(3);
    } else {
        
        if ( val > attr ) {
            if (points > 0) {
                $(this).attr( 'value', val );
                $(this).siblings('.countPoint').text(--points);
				userChange();
            } else {
                $(this).attr('value', attr );
                $(this).val(attr);
				userChange();
            }
        } else {
            $(this).attr( 'value', val );
            $(this).siblings('.countPoint').text(++points);
			userChange();			
        }
    }
	
    function userChange() {
		if (userId == 1) {
			User1[cls] = val;
		} else {
			User2[cls] = val;
		}
	}
});

$('.confirm').click(function() {
    var userId = $(this).parent().attr('class')[7];
    $(this).parent().find('input[type="number"]').attr('disabled', 1);
    
    
    Balls.push( new Ball(300, [2, 4], [1, 1]) );
		Balls[Balls.length-1].start();
});

function checkBlock(y, x) {
    if ( !$('tr').is('[row="a'+ y +'"]') ||
        $('tr[row="a'+ y +'"] > td[col="'+ x +'"]').hasClass('border') 
		||$('td[col="'+ x +'"]').is('[col="9"]') || $('td[col="'+ x +'"]').is('[col="0"]') 
		) {return true;}
}

//View
function draw(x, y, col, cls){
    var blks = $('tr[row="a'+ y +'"] > td[col="'+ x +'"]');
        
    if (cls) blks.attr('class', cls);
    else blks.removeAttr('class');
    
	if (col) {
		blks.css({background: col});
	} else {
		blks.removeAttr('style');
	}
    
    
}

