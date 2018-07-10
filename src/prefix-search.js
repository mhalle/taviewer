const TrieSearch = require('trie-search');

class PrefixSearch {
    constructor() {
        this.index = new TrieSearch(['term'], {
            min: 1
        });
    }

    indexNode(node, term, termType) {
        const indexObj = {
            node,
            term,
            termType
        };
        this.index.add(indexObj);
    }

    getMatches(prefixString) {
        return this.index.get(prefixString);
    }
}
module.exports = PrefixSearch;

