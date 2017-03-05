"use strict";
var settings = {
    width : 10,
    height : 9,
    playZoneLeft : null,
    playZoneRight : null
};


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
        height = +$('.height').val(),
        table = '';
    
    for (var i = 0; i < height; i++) {
        
        table += '<tr row="a'+i+'">';
            for (var l = 0; l < width; l++) {
                table += '<td col="'+l+'"></td>';
            }
        table += '</tr>';
        
    }
    

    settings.width = width - 1;
    settings.height = height - 1;
    
    width++;
    $('.wall').empty();
    while (--width) {$('.wall').append('<td></td>')}
    
    $('tr[row]').remove();
    $('.wall:first').after(table);
});


$('.playZone').change(function() {
    settings.playWidth = ++$(this).val();
});

