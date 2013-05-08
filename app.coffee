log = (args...) ->
    console.log(args...) if console?.log?

$('#dragbar').mousedown (e) ->
    e.preventDefault()

    $('#top-div, #bottom-div').append "<div class='over'></div>"

    log 'dragging', e.pageY

    $(document).mousemove (e) ->
        $('#top-div').css("height", e.pageY+2)
        $('#bottom-div').css("top", e.pageY+2)

$(document).mouseup (e) ->
    $(document).unbind('mousemove')
    $('.over').remove()

$('.cover').click (e) ->
    $(@).css('opacity', '.5').animate {opacity: 0}, 3000
    false
