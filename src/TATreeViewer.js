import _ from 'lodash';
import React, { Component } from 'react';
import Tree from 'antd/lib/tree';
const TreeNode = Tree.TreeNode;


class TATreeViewer extends Component {
    state = {
        expandedKeys: [],
        searchValue: '',
        autoExpandParent: true,
        selectedKeys: []
    }
    componentDidMount() {
        this.selectExpandNode(this.props.selectExpandNode);
    }

    selectExpandNode(node) {
        let keyValue = node ? [node[0]] : [];
        this.setState({
            expandedKeys: keyValue,
            autoExpandParent: true,
            selectedKeys: keyValue
        })
    }

    componentWillReceiveProps(nextProps) {
        let newNode = nextProps.selectExpandNode;

        if (newNode !== this.props.selectExpandNode) {
            this.selectExpandNode(newNode);
        }
    }

    onExpand = (e) => {
        this.setState({
            expandedKeys: e,
            autoExpandParent: false
        })
    }

    onSelect = (keys, ev) => {

        if (keys && keys.length === 1 && this.props.onSelect) {
            this.props.onSelect(this.props.data.get_node_by_id(keys[0]));
        }
        this.setState({ selectedKeys: keys });

    }
    render() {
        const { expandedKeys, autoExpandParent, selectedKeys } = this.state;

        return (
            <Tree showLine
                onExpand={this.onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                selectedKeys={selectedKeys}
                onSelect={this.onSelect}
            >
                {tree_level(this.props.data.tree)}
            </Tree>
        );
    }
}

function tree_level(node_list) {
    if (!node_list) {
        return;
    }
    let sorted_list = _.sortBy(node_list, x => x[1]);
    return (_.map(sorted_list, node => {
        let title_text = `${node[1]} (${node[0]})`;
        let is_group = node.length === 7;
        return (
            <TreeNode
                className={is_group ? "taviewer-group" : "taviewer-leaf"}
                title={title_text}
                key={node[0]}>
                {tree_level(node[6])}
            </TreeNode>
        );
    }));
}

export default TATreeViewer;