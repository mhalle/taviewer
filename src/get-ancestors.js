function getAncestors(node) {
    const hier = [];

    let nodep = node;
    while (nodep) {
        hier.push(nodep);
        nodep = nodep.parent;
    }
    return hier;
}

export default getAncestors;
