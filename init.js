"use strict";
let localData = getData(['PePformdata','PePsettings']),
    settings = localData[1] || {
    width: 10, height: 9
};

Object.defineProperties(settings, {
    playZoneSet: {
        set: function(val) {
            this.playZone = val;
            $('td').removeClass('playZone');

            for (var i = val; i > -1 ;--i) {
                $('td[col="'+i+'"]').addClass('playZone');
            }
            for (var i = this.width; i >= this.width - val ;--i) {
                $('td[col="'+i+'"]').addClass('playZone');
            }
        }
    },
    difficult: {
          set: function(val) {
            var startSpeed = 450;
            this.powerBall = val > 2 ? 2 : 1;
            this.speedBall = startSpeed - val * 100;
            this.SpeedShield = val > 2 ? 350 : 250;
            this.bonusСhance = val * 10000;
        }   
    },
    setTheme: {
        set: function(val) {
            this.theme = val;
            document.head.children[1].href = val+'.css';
        }
    }
});
if (localData[0]) applyData(localData[0]);


//AutoFunc
drawTable(settings.width+1, settings.height+1);
settings.playZoneSet = localData[1] ? localData[1].playZone : 1;
settings.setTheme = localData[1] ? localData[1].theme : 'easy';

//Kontroller
$('.submit').click(function() {
    settings.difficult = +$('#difficult option:selected').val();
    settings.multiWall = +$('#multiWall:checked').val();
    settings.bonuses = +$('#bonuses:checked').val();
    
    $('.inputWrap input, select').attr('disabled','');
    $('.startButtons').fadeIn(400);
    $('.settings').hide(400);
    
    var gameScript = document.createElement('script'),
        bonusScript = document.createElement('script'),
        head = document.head;
    
	gameScript.src = "game.js";
	gameScript.defer = true;
    bonusScript.src = "bonus.js";
	bonusScript.defer = true;
    
    if (settings.bonuses) head.appendChild(bonusScript);
    head.appendChild(gameScript);
    
    let formData = {};
    $('.inputWrap input, select').each(function(){
        let val = this.type == 'checkbox' ? this.checked : $(this).val();
        formData[$(this).attr('id')] = val;
    });
    
    localStorage['PePformdata'] = JSON.stringify(formData);
    localStorage['PePsettings'] = JSON.stringify(settings);
});

$('.width, .height').change(function() {
    var width = +$('.width').val(),
        height = +$('.height').val();
    
    if ( width <= $(this).attr('max') && width >= $(this).attr('min') &&
         height <= $(this).attr('max') && height >= $(this).attr('min')) {
        settings.width = width - 1;
        settings.height = height - 1;
        drawTable(width, height);
        settings.playZoneSet = settings.playZone;
    }
    
});

$('#playZone').change(function() {
    var val = +$(this).val();
    if ( val <= $(this).attr('max') && val >= $(this).attr('min') ) {
        settings.playZoneSet = val;
    }
});

$('#theme').change(function() {
   settings.setTheme = $(this).val();
});
//View
function drawTable(width, height) {
    var table = '';
    for (var i = 0; i < height; i++) {
        
        table += '<tr row="a'+i+'">';
            for (var l = 0; l < width; l++) {
                table += '<td col="'+l+'"></td>';
            }
        table += '</tr>';
        
    }
    width++;
    $('.wall').empty();
    while (--width) {$('.wall').append('<td></td>')}
    
    $('tr[row]').remove();
    $('.wall:first').after(table);
}

function getData(keys) {
    try {
        var values = [];
        
        keys.forEach((item) => {
            item = localStorage[item];
            if (item) {
                item = JSON.parse(item);
                values.push(item);
            }
            
        });
        return values;
        
    } catch(e) {console.log('Ошибка в данных'); return values;}
}

function applyData(formData) {
    var {
        tableWidth = 11,
        tableHeight = 10,
        playZone = 1,
        difficult = 2,
        bonuses = 0,
        multiWall = 0,
        theme = 'easy'
    } = formData;
    
    $('#tableWidth').val(tableWidth);
    $('#tableHeight').val(tableHeight);
    $('#playZone').val(playZone);
    $('#theme option[value="'+theme+'"]').attr('selected','');
    $('#difficult option[value="'+difficult+'"]').attr('selected','');
    if (+multiWall) $('#multiWall').attr('checked','checked');
    if (+bonuses) $('#bonuses').attr('checked','checked');
}