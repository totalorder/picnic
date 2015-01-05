$(document).ready(function() {
    var lightbox = null;

    var launchIntoFullscreen = function(element) {
        if(element.requestFullscreen) {
            element.requestFullscreen();
        } else if(element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if(element.webkitRequestFullscreen) {
            console.log("fullscreen webkit");
            element.webkitRequestFullscreen();
        } else if(element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    };

    var exitFullscreen = function () {
        if(document.exitFullscreen) {
            document.exitFullscreen();
        } else if(document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if(document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    };

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

    var changeImage = function(direction, nodeIndex, $scrollerNodes, $lightbox, $image, $album, $infoBox, noNavigate) {
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
            if (!noNavigate) {
                navigated($album, newNodeIndex);
            }

            if (!$infoBox.hasClass("hidden")) {
                updateInfoBox($infoBox, $scrollerNodes, newNodeIndex);
            }
            return newNodeIndex;
        } else {
            return nodeIndex;
        }
    };

    var closeLightbox = function ($lightboxClose, $lightboxFullscreen, $lightbox, $page, noNavigate) {
        $lightbox.find(".scroller-center").empty();
        $lightboxClose.unbind('click');
        $lightboxFullscreen.unbind('click');
        $lightbox.unbind('click');
        $lightbox.find(".navblock").unbind('click');
        $lightbox.find(".image-container").unbind("swipeleft");
        $lightbox.find(".image-container").unbind("swiperight");
        $(document).unbind('keydown');
        document.body.style.overflow="visible";
        $lightbox.hide();
        lightbox = null;
        if (!noNavigate) {
            navigated(null, null);
        }
    };

    var navigated = function ($album, nodeIndex) {
        if ($album === null) {
            //console.log("Navigated: null /");
            history.pushState(null, "Bilder", "/");
        }
        else if (nodeIndex === null) {
            //console.log("Navigated: {albumSlug: " + $album.data('slug') + ", nodeIndex: null} /" + $album.data('title'), "/" + $album.data('slug') + "/" )
            history.pushState({"albumSlug": $album.data('slug'), "nodeIndex": null}, $album.data('title'), "/" + $album.data('slug') + "/");
        } else {
            //console.log("Navigated: {albumSlug: " + $album.data('slug') + ", nodeIndex: " + nodeIndex + "} /" + $album.data('slug') + "/" + (nodeIndex + 1) + "/")
            history.pushState({"albumSlug": $album.data('slug'), "nodeIndex": nodeIndex}, $album.data('title'), "/" + $album.data('slug') + "/" + (nodeIndex + 1) + "/");
        }
    };

    $(window).bind('popstate', function(evt) {
        //console.log(location.href);
        //console.log(evt.originalEvent.state);
        if (evt.originalEvent.state === null) {
            if (lightbox !== null) {
                closeLightbox(lightbox.getLightboxClose(), lightbox.getLightboxFullscreen(), lightbox.getLightbox(), lightbox.getPage(), true);
            }
        } else if (lightbox !== null && evt.originalEvent.state.albumSlug === lightbox.getAlbum().data('slug')) {
            var evtNodeIndex = evt.originalEvent.state.nodeIndex === null ? 0 : evt.originalEvent.state.nodeIndex;
            lightbox.setNodeIndex(changeImage(evtNodeIndex - lightbox.getNodeIndex(),
                lightbox.getNodeIndex(), lightbox.getScrollerNodes(),
                lightbox.getLightbox(), lightbox.getImage(), lightbox.getAlbum(), lightbox.getInfoBox(), true));
        } else if (lightbox === null ) {
            var $album = $('.album[data-slug="' + evt.originalEvent.state.albumSlug + '"]');
            lightbox = showLightbox($album, $album.find(".album-thumbnail-node"), evt.originalEvent.state.nodeIndex, true);
        }
    });

    function updateInfoBox($infoBox, $scrollerNodes, nodeIndex) {
        $infoBox.empty();
        var $photoInfoClone = $($scrollerNodes[nodeIndex]).find(".photo-info").clone();
        $photoInfoClone.find("aa").each(function (idx, aAnchor) {
            var anchor = $("<a></a>")[0];
            anchor.className = aAnchor.className;
            $.extend(anchor.classList, aAnchor.classList);
            $(anchor).attr('href', $(aAnchor).attr('href'));
            $(anchor).addClass(aAnchor.className);
            $(aAnchor).wrapAll($(anchor));
            $(aAnchor).contents().unwrap();
        });
        $photoInfoClone.removeClass("hidden");
        $infoBox.append($photoInfoClone);
    }

    var showLightbox = function($album, $thumbnailNodes, nodeIndex, noNavigate) {
        if (!noNavigate) {
            navigated($album, nodeIndex);
        }
        if (nodeIndex === null) {
            nodeIndex = 0;
        }

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

        var $infoBox = $lightbox.find(".lightbox-info-box");

        var $scrollerNodes = $scroller.find(".album-thumbnail-node");
        $scrollerNodes.click(function(evt) {
            evt.preventDefault();
            nodeIndex = changeImage($scrollerNodes.index(this) - nodeIndex, nodeIndex, $scrollerNodes, $lightbox, $image, $album, $infoBox);
        });

        nodeIndex = changeImage(0, nodeIndex, $scrollerNodes, $lightbox, $image, $album, $infoBox, true);

        $lightbox.find(".navblock").click(function(evt) {
            evt.preventDefault();
            var direction = $(this).hasClass("right") ? 1 : -1;
            nodeIndex = changeImage(direction, nodeIndex, $scrollerNodes, $lightbox, $image, $album, $infoBox);
        });

        var $lightboxClose = $lightbox.find(".lightbox-close");

        var $lightboxFullscreen = $lightbox.find(".lightbox-fullscreen");
        var $lightboxFullscreenGlyph = $lightboxFullscreen.find(".glyphicon");

        var fullscreenChanged = function(evt) {
            console.log(evt);
            if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
                $lightboxFullscreenGlyph.addClass("glyphicon-resize-small");
                $lightboxFullscreenGlyph.removeClass("glyphicon-resize-full");
            } else {
                $lightboxFullscreenGlyph.addClass("glyphicon-resize-full");
                $lightboxFullscreenGlyph.removeClass("glyphicon-resize-small");
            }
        };

        $(document).on("fullscreenchange", function(e) {
            fullscreenChanged(e);
        });
        $(document).on("mozfullscreenchange", function(e) {
            fullscreenChanged(e);
        });
        $(document).on("webkitfullscreenchange", function(e) {
            fullscreenChanged(e);
        });
        $(document).on("msfullscreenchange", function(e) {
            fullscreenChanged(e);
        });

        $lightboxClose.click(function() {
            closeLightbox($lightboxClose, $lightboxFullscreen, $lightbox, $page);
        });

        if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            $lightboxFullscreenGlyph.addClass("glyphicon-resize-small");
            $lightboxFullscreenGlyph.removeClass("glyphicon-resize-full");
        }

        $lightboxFullscreen.click(function() {
            if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
                exitFullscreen();
            } else {
                launchIntoFullscreen(document.documentElement);
            }
        });

        $(document).keydown(function(evt) {
            if (evt.which == 27) {
                closeLightbox($lightboxClose, $lightboxFullscreen, $lightbox, $page);
            } else if (evt.which == 37) {
                nodeIndex = changeImage(-1, nodeIndex, $scrollerNodes, $lightbox, $image, $album, $infoBox);
            } else if (evt.which == 39) {
                nodeIndex = changeImage(1, nodeIndex, $scrollerNodes, $lightbox, $image, $album, $infoBox);
            }
        });

        var $imageContainer = $lightbox.find(".image-container");
        $imageContainer.on("swipeleft",function(){
            nodeIndex = changeImage(1, nodeIndex, $scrollerNodes, $lightbox, $image, $album, $infoBox);
        });

        $imageContainer.on("swiperight",function(){
            nodeIndex = changeImage(-1, nodeIndex, $scrollerNodes, $lightbox, $image, $album, $infoBox);
        });

        var $infoButton = $lightbox.find(".lightbox-info-button");
        var $infoButtonClose = $lightbox.find(".lightbox-info-button-close");

        $infoButton.show();
        $infoBox.addClass("hidden");
        $infoButtonClose.addClass("hidden");
        $infoButton.show();

        $infoButton.click(function(evt) {
            evt.preventDefault();
            updateInfoBox($infoBox, $scrollerNodes, nodeIndex);
            $infoBox.removeClass("hidden");
            $infoButtonClose.removeClass("hidden");
            $infoButton.hide();
        });

        $infoButtonClose.click(function(evt) {
            evt.preventDefault();
            $infoButton.show();
            $infoButtonClose.addClass("hidden");
            $infoBox.addClass("hidden");
        });

        $lightbox.show();
        document.body.style.overflow="hidden";

        return {
            "getNodeIndex": function() { return nodeIndex; },
            "setNodeIndex": function(newNodeIndex) { nodeIndex = newNodeIndex; },
            "getScrollerNodes": function() { return $scrollerNodes },
            "getLightbox": function() { return $lightbox },
            "getImage": function() { return $image },
            "getAlbum": function() { return $album },
            "getLightboxClose": function() { return $lightboxClose },
            "getLightboxFullscreen": function() { return $lightboxFullscreen },
            "getPage": function() { return $page },
            "getInfoBox": function() { return $infoBox}
        }
    };

    $(".album-thumbnail-link").click(function(evt) {
        evt.preventDefault();
        var $albumThumbnailGroup = $(this).parent();
        lightbox = showLightbox($albumThumbnailGroup.parent(), $(this).parent().find(".album-thumbnail-node"), $albumThumbnailGroup.find(".album-thumbnail-link").index(this));
    });

    $(".album-title-link").click(function(evt) {
        evt.preventDefault();
        var $albumThumbnailGroup = $(this).parent();
        lightbox = showLightbox($albumThumbnailGroup.parent(), $albumThumbnailGroup.find(".album-thumbnail-node"), null);
    });

    var _$lighbox = $(".lightbox");
    var _$album;
    if(_$lighbox.data('album-slug') && _$lighbox.data('node-index')) {
        _$album = $('.album[data-slug="' + _$lighbox.data('album-slug') + '"]');
        lightbox = showLightbox(_$album, _$album.find(".album-thumbnail-node"), _$lighbox.data('node-index'), true);
    } else if (_$lighbox.data('album-slug')) {
        _$album = $('.album[data-slug="' + _$lighbox.data('album-slug') + '"]');
        lightbox = showLightbox(_$album, _$album.find(".album-thumbnail-node"), null, true);
    }
});