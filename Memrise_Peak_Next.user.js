// ==UserScript==
// @name           Memrise Peak Next
// @namespace      https://github.com/cooljingle
// @description    Lets you see the upcoming word in advance
// @match          https://www.memrise.com/course/*/garden/*
// @match          https://www.memrise.com/garden/review/*
// @version        0.0.1
// @updateURL      https://github.com/cooljingle/memrise-peak-next/raw/master/Memrise_Peak_Next.user.js
// @downloadURL    https://github.com/cooljingle/memrise-peak-next/raw/master/Memrise_Peak_Next.user.js
// @grant          none
// ==/UserScript==

$(document).ready(function() {
    var g = MEMRISE.garden,
        b = g.boxes;
    b.load = (function() {
        var cached_function = b.load;
        return function() {
            _.each(g.box_types, function(box_type) {
                if(box_type !== g.box_types.EndOfSessionBox) {
                    peakWords(box_type);
                }
            });
            var result = cached_function.apply(this, arguments);
            enableNoReverseTranslations();
            return result;
        };
    }());

    function peakWords(box_type) {
        box_type.prototype.activate = (function() {
            var cached_function = box_type.prototype.activate;
            return function() {
                var result = cached_function.apply(this, arguments);
                var currentWord = getWord(this.learnable);
                var nextWord = getNextWord(this.learnable_id);
                if(currentWord)
                    $('input, .choices').before(currentWord);
                if(nextWord)
                    $('input, .choices').after(nextWord);
                return result;
            };
        }());
    }

    function getNextWord(prevLearnableId) {
        var nextLearnable = _.find(b._list.slice(b.num + 1, -1), box => prevLearnableId !== box.learnable_id);
        return getWord(nextLearnable);
    }

    function getWord(learnable) {
        var learnableDef = learnable && g.learnables[learnable.learnable_id].definition;
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
