// ==UserScript==
// @name           Memrise Peek Next
// @namespace      https://github.com/cooljingle
// @description    Lets you see the upcoming word in advance
// @match          https://www.memrise.com/course/*/garden/*
// @match          https://www.memrise.com/garden/review/*
// @version        0.0.8
// @updateURL      https://github.com/cooljingle/memrise-peek-next/raw/master/Memrise_Peek_Next.user.js
// @downloadURL    https://github.com/cooljingle/memrise-peek-next/raw/master/Memrise_Peek_Next.user.js
// @grant          none
// ==/UserScript==

$(document).ready(function() {
    var g = MEMRISE.garden,
        b;

    g.session_start = (function() {
        var cached_function = g.session_start;
        return function() {
            peekWords();
            var result = cached_function.apply(this, arguments);
            enableNoReverseTranslations();
            return result;
        };
    }());

    var boxIndex = -1;

    function peekWords() {
        MEMRISE.garden.session.box_factory.make = (function() {
            var cached_function = MEMRISE.garden.session.box_factory.make;
            return function() {
                b = b || MEMRISE.garden.session_data.boxes;
                var result = cached_function.apply(this, arguments);
                if(result.learnable_id && result.template !== "end_of_session") {
                    updateBoxIndex(result);
                    var currentWord = getWord(result);
                    var nextWord = getWord(b[boxIndex + 1]); //this will sometimes be wrong because memrise has inserted previous words you got wrong
                    if(currentWord)
                        window.setTimeout(() => $('.garden-box input, .garden-box .choices').before(`<div style="font-size: 18px">${currentWord}</div>`), 0);
                    if(nextWord)
                        window.setTimeout(() => $('.garden-box input, .garden-box .choices').after(`<div style="font-size: 18px">${nextWord}</div>`), 0);
                }
                return result;
            };
        }());
    }

    function getWord(learnable) {
        var learnableDef = learnable && learnable.learnable_id && g.learnables[learnable.learnable_id].definition;
        return learnableDef && learnableDef.kind === "text" && learnableDef.value;
    }

    function updateBoxIndex(actualBox) {
        if(b[boxIndex + 1].learnable_id === actualBox.learnable_id) {
            boxIndex++;
        }
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
