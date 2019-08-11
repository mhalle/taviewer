const TrieSearch = require('trie-search');

class PrefixSearch {
    constructor() {
        this.index = new TrieSearch(['term'], {
            splitOnRegEx: /[-\s]/g,
            min: 2
        });
    }

    indexNode(node, term, termType, pref, lang) {
        const indexObj = {
            node,
            term,
            termType,
            pref,
            lang
        };
        this.index.add(indexObj);
    }

    getMatches(prefixString) {
        return this.index.get(prefixString);
    }
}
export default PrefixSearch;

