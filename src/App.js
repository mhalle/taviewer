import React, { Component } from 'react';
import './App.css';
import _ from 'lodash';
import prefix_match from './prefix-match';
import ta98_json from './human.json';

import { Tree, AutoComplete } from 'antd';
const TreeNode = Tree.TreeNode;
const Option = AutoComplete.Option;


function index_tree(node_list, index) {
  index = index || {};
  _.forEach(node_list, node => {
    index[node[0]] = node;
    index_tree(node[5], index);
  });
  return index;
}

function WikipediaLink(title, target) {
  if(!title) {
    return null;
  }
  let underscored = title.replace(' ', '_');
  let link =  `https://en.wikipedia.org/wiki/${underscored}`;
  if(target){
    return <a href={link} target={target}>{title}</a>;
  } 
  return <a href={link}>{title}</a>;
}

function TAViewerDetailRow(props) {
    let label = props.label;
    let value = props.value;

    if(value === null || (_.isArray(value) && value.length === 0)) {
      return <div></div>;
    }
    if(_.isArray(value)) {
      return (
        <div className="taviewer-detail-row">
        <div className="taviewer-detail-key">{label}:</div>
        <div className="taviewer-detail-value">
          { value.map(x =><div>{x}</div>) }
        </div>
        </div>
      )
    }
    return (
      <div className="taviewer-detail-row">
      <div className="taviewer-detail-key">{label}:</div>
      <div className="taviewer-detail-value">
        {value}
      </div>
      </div>
    )
}
class App extends Component {
  state = {
    selectExpandNode: null
  };

  selectExpandNode = n => {
    let selectExpandNode = n;
    this.setState({ selectExpandNode });
  }


  renderDetail(node) {
    if (node) {
      return (
        <div>
          <h2>{node[1]}</h2>
          <TAViewerDetailRow label="TA98 ID" value={node[0]} />
          <TAViewerDetailRow label="Latin name" value={node[2]} />
          <TAViewerDetailRow label="Synonyms" value={node[3]} />
          <TAViewerDetailRow label="Wikipedia" value={WikipediaLink(node[4], "_blank")}/>
        </div>
      );
    }
  }
  render() {
    return (
      <div className="taviewer">
        <header className="taviewer-header">
          <div className="taviewer-title">
            <h1 className="app-title">TA98 Viewer</h1>
          </div>
          <div className="taviewer-search">
            <Complete className="taviewer-complete" data={ta98_json} onSelect={this.selectExpandNode} />
          </div>
        </header>
        <main className="taviewer-main">

          <div className="taviewer-detail">
            {this.renderDetail(this.state.selectExpandNode)}
          </div>
          <div className="taviewer-tree">
            <TA98TreeViewer data={ta98_json}
              onSelect={this.selectExpandNode}
              selectExpandNode={this.state.selectExpandNode} />
          </div>
        </main>
      </div>
    );
  }
}

function tree_level(node_list) {
  if (!node_list) {
    return;
  }
  let sorted_list = _.sortBy(node_list, x => x[1]);
  return (_.map(sorted_list, node => {
    let title_text = node[1] + ' (' + node[0] + ')';
    let is_group = node.length === 6;
    return (
      <TreeNode
        className={is_group ? "taviewer-group" : "taviewer-leaf"}
        title={title_text}
        key={node[0]}>
        {tree_level(node[5])}
      </TreeNode>
    );
  }));
}

class Complete extends Component {
  state = {
    searchString: '',
    matchingNodes: [],
    selectedNode: null
  }
  componentDidMount() {
    this.data_index = index_tree(this.props.data);
    this.setState({ matchingNodes: _.values(this.data_index) });
  }

  handleSearch = (searchString) => {
    let matchingNodes = [];
    _.forOwn(this.data_index, (v) => {
      if (prefix_match(searchString.toLowerCase(), v[1]) ||
        _.startsWith(v[0], searchString.toLowerCase())) {
        matchingNodes.push(v);
      }
    })
    matchingNodes = _.sortBy(matchingNodes, 1);
    this.setState({ searchString, matchingNodes });
  }

  onSelect = (v) => {
    if (v) {
      let selectedNode = this.data_index[v];
      this.setState({
        selectedNode,
        searchString: selectedNode[1]
      });
      if (this.props.onSelect) {
        this.props.onSelect(selectedNode);
      }
    }
  }

  render() {
    let { matchingNodes } = this.state;

    let children;
    if (matchingNodes.length > 400) {
      children = <Option disabled={true} key="TooMany">{matchingNodes.length} matches...</Option>;
    }
    else {
      children = _.map(matchingNodes, m => {
        return <Option value={m[0]} key={m[0]}>{m[1]}&nbsp;({m[0]})</Option>
      });
    }
    return (
      <AutoComplete
        showSearch
        allowClear        
        ref="autocomplete"
        value={this.state.searchString}
        onSelect={this.onSelect}
        onSearch={this.handleSearch} placeholder="search">
        {children}
      </AutoComplete>
    )
  }

}

class TA98TreeViewer extends Component {
  state = {
    expandedKeys: [],
    searchValue: '',
    autoExpandParent: true,
    selectedKeys: []
  }
  componentDidMount() {
    this.data_index = index_tree(this.props.data);
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
    this.setState({ selectedKeys: keys })
    if (keys && keys.length === 1 && this.props.onSelect) {
      this.props.onSelect(this.data_index[keys[0]]);
    }
  }
  render() {
    let data = this.props.data;
    const { expandedKeys, autoExpandParent, selectedKeys } = this.state;

    return [
      <Tree showLine
        onExpand={this.onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        selectedKeys={selectedKeys}
        onSelect={this.onSelect}
      >
        {tree_level(data)}
      </Tree>
    ];
  }
}

export default App;
