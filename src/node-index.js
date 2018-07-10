const _ = require('lodash');

function taDataTree(dataList, parent = null) {
    if (!dataList) {
        return [];
    }
    return _.map(dataList, (d) => {
        let node = {
            id: d[0],
            name: {
                en: d[1],
                la: d[2]
            },
            synonyms: d[3],
            fmaId: d[4],
            wikiDataId: d[5],
            parent
        };
        node.children = taDataTree(_.get(d, [6], []), node);
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
        this.tree = taDataTree(treeData);
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
