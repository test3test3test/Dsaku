


var initialF = function(){
    $("body").stop().animate({opacity: '1'}, 1000);
}

var adding = function() {
    $(this).addClass('activ');
    $(this).children('.gbHeadDrop').slideDown(300);
}

var removing = function() {
    $(this).removeClass('activ');
    $(this).children('.gbHeadDrop').hide();
}

//initial effect
$(document).ready(function(){
    $("body").css({opacity: '0'});

    setTimeout(initialF,1000);
});

//スマホではaddingやremobingを使用しないよう設定
$(document).ready(function(){
    if ($(window).width() > 740) {
        //gbHeadDrop
        $(function() { 
            // $(".gbHeadDrop").hide();
        
            $(".gbDropMenu").hover(adding, removing);
        });
    }
});


$(function() { 
    $(".gbHeadDrop").hide();
});


//bxslider

$(window).load(function () {
    $('.bxslider').bxSlider({
      auto: true,
      pause: 6000,
      autoStart: true,
      speed: 1800,
      touchEnabled: false,
    });
});


//video_slilder
jQuery(function($) {
    $('.video_slider').bxSlider({
        auto: true,
        pause: 14000,
        pager: false,
        controls: false,
        infiniteLoop: true,
        onSlideBefore: function($slideElement, oldIndex, newIndex) {
            const videos = $slideElement.parent().find('video');
            videos.each(function(index, element) {
                $(element).get(0).pause();
                $(element).get(0).currentTime = 0;
            });
        },
        onSlideAfter: function($slideElement, oldIndex, newIndex) {
            const video = $slideElement.find('video');
            if(video.length) {
                video.get(0).play();
            }
        },
    });
});
