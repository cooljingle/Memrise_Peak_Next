// ==UserScript==
// @name           Memrise Peek Next
// @namespace      https://github.com/cooljingle
// @description    Lets you see the upcoming word in advance
// @match          https://www.memrise.com/course/*/garden/*
// @match          https://www.memrise.com/garden/review/*
// @version        0.0.6
// @updateURL      https://github.com/cooljingle/memrise-peek-next/raw/master/Memrise_Peek_Next.user.js
// @downloadURL    https://github.com/cooljingle/memrise-peek-next/raw/master/Memrise_Peek_Next.user.js
// @grant          none
// ==/UserScript==

$(document).ready(function() {
    var g = MEMRISE.garden,
        b = g.boxes;
    b.load = (function() {
        var cached_function = b.load;
        return function() {
            peekWords();
            var result = cached_function.apply(this, arguments);
            enableNoReverseTranslations();
            return result;
        };
    }());

    function peekWords() {
        MEMRISE.garden.boxes.activate_box = (function() {
            var cached_function = MEMRISE.garden.boxes.activate_box;
            return function() {
                var result = cached_function.apply(this, arguments);
                if(this.current().template !== "end_of_session") {
                    var currentWord = getWord(this.current().learnable);
                    var nextWord = getNextWord(this.current().learnable_id);
                    if(currentWord)
                        $('.garden-box input, .garden-box .choices').before(`<div style="font-size: 18px">${currentWord}</div>`);
                    if(nextWord)
                        $('.garden-box input, .garden-box .choices').after(`<div style="font-size: 18px">${nextWord}</div>`);
                    return result;
                }
            };
        }());
    }

    function getNextWord(prevLearnableId) {
        var nextLearnable = _.find(b._list.slice(b.num + 1, -1), box => prevLearnableId !== box.learnable_id);
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
