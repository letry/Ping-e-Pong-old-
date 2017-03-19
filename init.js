"use strict";
var settings = {
    width : 10,
    height : 9,
    set playZoneSet(val) {
        this.playZone = val;
        $('td').removeClass('playZone');

        for (var i = val; i > -1 ;--i) {
            $('td[col="'+i+'"]').addClass('playZone');
        }
        for (var i = this.width; i >= this.width - val ;--i) {
            $('td[col="'+i+'"]').addClass('playZone');
        }
    },
    set difficult(val) {
        var startSpeed = 600;
        this.powerBall = val > 2 ? 2 : 1;
        this.speedBall = startSpeed - val * 100;
        this.SpeedShield = val > 2 ? 450 : 300;
        this.bonusСhance = val * 10000;
    }
};

//AutoFunc
drawTable(settings.width+1, settings.height+1);
settings.playZoneSet = 1;


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
        head = document.getElementById('head');
	gameScript.src = "game.js";
	gameScript.defer = true;
    bonusScript.src = "bonus.js";
	bonusScript.defer = true;
    
    if (settings.bonuses) head.appendChild(bonusScript);
    head.appendChild(gameScript);
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