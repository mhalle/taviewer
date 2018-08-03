const TrieSearch = require('trie-search');

class PrefixSearch {
    constructor() {
        this.index = new TrieSearch(['term'], {
            splitOnRegEx: /[-\s]/g,
            min: 1
        });
    }

    indexNode(node, term, termType, lang) {
        const indexObj = {
            node,
            term,
            termType,
            lang
        };
        this.index.add(indexObj);
    }

    getMatches(prefixString) {
        return this.index.get(prefixString);
    }
}
module.exports = PrefixSearch;

