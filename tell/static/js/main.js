$(document).ready(function() {
    $("body").addClass((("ontouchstart" in document.documentElement) ? 'touch' : 'no-touch'));

    var scroll = function (direction, nodeIndex, $scrollerNodes) {
        var nextNodeIndex = nodeIndex;
        var currentNodeIndex = nodeIndex;
        for (var i = 0; i < Math.abs(direction); i++) {
            currentNodeIndex = nextNodeIndex;
            nextNodeIndex = nextNodeIndex + (direction > 0 ? 1 : -1);
            if (nextNodeIndex < currentNodeIndex && nextNodeIndex - 2 >= 0) {
                $($scrollerNodes[nextNodeIndex - 2]).removeClass("hidden");
                if (nextNodeIndex + 3 < $scrollerNodes.length) {
                    $($scrollerNodes[nextNodeIndex + 3]).addClass("hidden");
                }
            } else if (nextNodeIndex > currentNodeIndex && nextNodeIndex + 2 < $scrollerNodes.length) {
                $($scrollerNodes[nextNodeIndex + 2]).removeClass("hidden");
                if (nextNodeIndex - 3 >= 0) {
                    $($scrollerNodes[nextNodeIndex - 3]).addClass("hidden");
                }
            } else {
                return;
            }
        }
    };

    var changeImage = function(direction, nodeIndex, $scrollerNodes, $lightbox, $image) {
        var newNodeIndex = nodeIndex + direction;
        if (newNodeIndex >= 0 && newNodeIndex < $scrollerNodes.length) {
            $image.attr("src", $($scrollerNodes[newNodeIndex]).find("img").data("size-medium"));

            if (newNodeIndex == 0) {
                $lightbox.find(".navblock.left").addClass("hidden");
            } else {
                $lightbox.find(".navblock.left").removeClass("hidden");
            }

            if (newNodeIndex == $scrollerNodes.length - 1) {
                $lightbox.find(".navblock.right").addClass("hidden");
            } else {
                $lightbox.find(".navblock.right").removeClass("hidden");
            }

            $($scrollerNodes[nodeIndex]).removeClass("active");
            $($scrollerNodes[newNodeIndex]).addClass("active");

            scroll(direction, nodeIndex, $scrollerNodes);
            return newNodeIndex;
        } else {
            return nodeIndex;
        }
    };

    var closeLightbox = function ($lightboxClose, $lightbox, $page) {
        $lightbox.find(".scroller-center").empty();
        $lightboxClose.unbind('click');
        $lightbox.unbind('click');
        $(document).unbind('keydown');
        $page.show();
        $lightbox.hide();
    };

    var showLightbox = function(nodeIndex, $thumbnailNodes) {
        var $lightbox = $(".lightbox"),
            $image = $lightbox.find(".image"),
            $page = $(".page");

        var $scroller = $lightbox.find(".scroller-center");
        var start = Math.min(Math.max(0, nodeIndex - 2), Math.max(0, $thumbnailNodes.length - 5));
        $thumbnailNodes.each(function(idx, thumbnailNode) {
            var $thumbnailNodeClone = $(thumbnailNode).clone();
            $scroller.append($thumbnailNodeClone);
            if(idx >= start && idx < start + 5) {
                $thumbnailNodeClone.toggleClass("hidden");
            }
        });

        var $scrollerNodes = $scroller.find(".album-thumbnail-node");
        $scrollerNodes.click(function() {
            nodeIndex = changeImage($scrollerNodes.index(this) - nodeIndex, nodeIndex, $scrollerNodes, $lightbox, $image);
        });

        nodeIndex = changeImage(0, nodeIndex, $scrollerNodes, $lightbox, $image);

        $lightbox.find(".navblock").click(function(evt) {
            evt.stopPropagation();
            var direction = $(this).hasClass("right") ? 1 : -1;
            nodeIndex = changeImage(direction, nodeIndex, $scrollerNodes, $lightbox, $image);
        });

        $lightbox.find(".lightbox-close").click(function() {
            closeLightbox($(this), $lightbox, $page);
        });

        $(document).keydown(function(evt) {
            if (evt.which == 27) {
                closeLightbox($lightbox.find(".lightbox-close"), $lightbox, $page);
            } else if (evt.which == 37) {
                nodeIndex = changeImage(-1, nodeIndex, $scrollerNodes, $lightbox, $image);
            } else if (evt.which == 39) {
                nodeIndex = changeImage(1, nodeIndex, $scrollerNodes, $lightbox, $image);
            }
        });

        var $imageContainer = $lightbox.find(".image-container");
        $imageContainer.on("swipeleft",function(){
            nodeIndex = changeImage(1, nodeIndex, $scrollerNodes, $lightbox, $image);
        });

        $imageContainer.on("swiperight",function(){
            nodeIndex = changeImage(-1, nodeIndex, $scrollerNodes, $lightbox, $image);
        });

        $lightbox.show();
        $page.hide();
    };

    $(".album-thumbnail-link").click(function() {
        showLightbox($(this).parent().find(".album-thumbnail-link").index(this), $(this).parent().find(".album-thumbnail-node"));
    });

    $(".album-title-link").click(function() {
        showLightbox(0, $(this).parent().find(".album-thumbnail-node"));
    });
});