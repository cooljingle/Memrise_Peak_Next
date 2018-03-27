// ==UserScript==
// @name           Memrise Peek Next
// @namespace      https://github.com/cooljingle
// @description    Lets you see the upcoming word in advance
// @match          https://www.memrise.com/course/*/garden/*
// @match          https://www.memrise.com/garden/review/*
// @version        0.0.7
// @updateURL      https://github.com/cooljingle/memrise-peek-next/raw/master/Memrise_Peek_Next.user.js
// @downloadURL    https://github.com/cooljingle/memrise-peek-next/raw/master/Memrise_Peek_Next.user.js
// @grant          none
// ==/UserScript==

$(document).ready(function() {
    var g = MEMRISE.garden;
    g.session_start = (function() {
        var cached_function = g.session_start;
        return function() {
            peekWords();
            var result = cached_function.apply(this, arguments);
            enableNoReverseTranslations();
            return result;
        };
    }());

    var prevBoxIndex = 0;

    function peekWords() {
        MEMRISE.garden.session.box_factory.make = (function() {
            var cached_function = MEMRISE.garden.session.box_factory.make;
            return function() {
                var result = cached_function.apply(this, arguments);
                if(result.template !== "end_of_session") {
                    var currentWord = getWord(result);
                    var nextWord = getNextWord(result);
                    if(currentWord)
                        window.setTimeout(() => $('.garden-box input, .garden-box .choices').before(`<div style="font-size: 18px">${currentWord}</div>`), 0);
                    if(nextWord)
                        window.setTimeout(() => $('.garden-box input, .garden-box .choices').after(`<div style="font-size: 18px">${nextWord}</div>`), 0);

                    return result;
                }
            };
        }());
    }

    function getBoxIndex(learnable) {
        return _.findIndex(MEMRISE.garden.session_data.boxes, d => d.learnable_id === learnable.learnable_id);
    }

    function getNextWord(prevLearnable) {
        prevBoxIndex = Math.max(prevBoxIndex, getBoxIndex(prevLearnable));
        var nextLearnable = MEMRISE.garden.session_data.boxes[prevBoxIndex + 1]; //best we can do now the internal _list of boxes is no longer avaiable to us
        return getWord(nextLearnable);
    }

    function getWord(learnable) {
        var learnableDef = learnable && learnable.learnable_id && g.learnables[learnable.learnable_id].definition;
        return learnableDef && learnableDef.kind === "text" && learnableDef.value;
    }

    function enableNoReverseTranslations() {
        g.session.box_factory.make = (function () {
            var cached_function = g.session.box_factory.make;
            return function () {
                var result = cached_function.apply(this, arguments);
                result.template = result.template.replace("reversed_", "");
                return result;
            };
        }());
    }
});
