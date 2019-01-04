const _ = require('lodash');

function taDataTree(dataList, parent = null) {
    if (!dataList) {
        return [];
    }
    return _.map(dataList, (d) => {
        let terms = _.mapValues(d['t'], t => _.castArray(t));
        let preferredTerms = {};
        let synonyms = [];
        for (let lang of _.keys(terms)) {
            preferredTerms[lang] = terms[lang][0];
            synonyms = synonyms.concat(terms[lang].slice(1));
        }

        let node = {
            id: d['i'],
            name: preferredTerms,
            synonyms,
            fmaId: d['f'],
            wikiDataId: d['w'] ? _.castArray(d['w']) : null,
            parent
        };
        node.children = taDataTree(d['c'], node);
        return node;
    });
}


function indexTree(node_list, index) {
    index = index || {};
    if(!node_list){
        return index;
    }
    _.forEach(node_list, node => {
        index[node.id] = node;
        indexTree(node.children, index);
    });
    return index;
}

class NodeIndex {
    constructor(treeData) {
        this.tree = taDataTree(treeData['c']);
        this.index = indexTree(this.tree);
    }

    getNodeById(id) {
        return this.index[id];
    }

    getNodes() {
        return _.values(this.index);
    }
}

export default NodeIndex;
