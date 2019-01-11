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
        let keyValue = node ? [node.id] : [];
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
            this.props.onSelect(this.props.data.getNodeById(keys[0]));
        }
        this.setState({ selectedKeys: keys });

    }
    render() {
        const { expandedKeys, autoExpandParent, selectedKeys } = this.state;
        const language = this.props.language;
        return (
            <Tree showLine
                onExpand={this.onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                selectedKeys={selectedKeys}
                onSelect={this.onSelect}
            >
                {tree_level(this.props.data.tree, language)}
            </Tree>
        );
    }
}

function tree_level(node_list, language) {
    if (!node_list) {
        return;
    }
    let sorted_list = _.sortBy(node_list, x => x.id);
    return (_.map(sorted_list, node => {
        let title_label = `${node.name[language]} (${node.id})`;
        return (
            <TreeNode
                className={node.children && node.children.length > 0 ? "taviewer-group" : "taviewer-leaf"}
                title={title_label}
                key={node.id}>
                {tree_level(node.children, language)}
            </TreeNode>
        );
    }));
}

export default TATreeViewer;