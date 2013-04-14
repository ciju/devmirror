$('#dragbar').mousedown(function(e) {
  e.preventDefault();
  $('#top-div, #bottom-div').append("<div class='over'></div>");
  $(document).mousemove(function(e){
    $('#top-div').css("height", e.pageY+2);
    $('#bottom-div').css("top", e.pageY+2);
  });
});
$(document).mouseup(function(e){
  $(document).unbind('mousemove');
  $('.over').remove();
});

$('.cover').click(function (e) {
  $(this).css('opacity', '.5').animate({
    opacity: 0
  }, 3000);
  return false;
});
