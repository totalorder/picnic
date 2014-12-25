$(document).ready(function() {
    $(".album-thumbnail-link").click(function() {
        var $lightbox = $(".lightbox"),
            $image = $lightbox.find(".image");
        $image.attr("src", $(this).children("img").data("size-medium"));

        var $scroller = $lightbox.find(".scroller-center");
        $scroller.empty();
        $(this).parent().find(".album-thumbnail-node").each(function(idx, thumbnailNode) {
            var $thumbnailNodeClone = $(thumbnailNode).clone();
            $scroller.append($thumbnailNodeClone);
            if(idx < 5) {
                $thumbnailNodeClone.toggleClass("hidden");
            }
        });

        $lightbox.show();
        $lightbox.click(function() {
           $lightbox.unbind('click');
           $lightbox.hide();
        });
    });
});