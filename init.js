"use strict";
var settings = {
    width : 10,
    height : 9,
    playZone : 1,
    set playZoneSet(val) {
        
        this.playZone = val;
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
    }
};

drawTable(settings.width+1, settings.height+1);
settings.playZoneSet = 1;
settings.difficult = 1;

$('.submit').click(function() {
    $('.inputWrap input, select').attr('disabled','');
    $('.startButtons').fadeIn(400);
    $('.settings').hide(400);
    
    var script = document.createElement('script'),
        head = document.getElementById('head');
	script.src = "game.js";
    head.appendChild(script);
});


$('.width, .height').change(function() {
    var width = +$('.width').val(),
        height = +$('.height').val();
    
    settings.width = width - 1;
    settings.height = height - 1;
    drawTable(width, height);
    settings.playZoneSet = settings.playZone;
});


$('#playZone').change(function() {
    settings.playZoneSet = +$(this).val();
});

$('#difficult').change(function() {
    settings.difficult = +$(this).val();
});

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