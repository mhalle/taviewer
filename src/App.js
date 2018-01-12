import React, { Component } from 'react';
import './App.css';
import _ from 'lodash';
import prefix_match from './prefix-match';
import createHistory from 'history/createBrowserHistory';
import { Tree, AutoComplete } from 'antd';
import NodeIndex from './NodeIndex';
import queryString from 'query-string';
import ta98_json from './human.json';
import wpImageIndex from './wikipedia-images.json';
import Lightbox from 'react-images';
import Gallery from 'react-photo-gallery';
const TreeNode = Tree.TreeNode;
const Option = AutoComplete.Option;
const WikiCommonsPrefix = "https://upload.wikimedia.org/wikipedia/commons/";

function WikipediaLink(title, target) {
  if (!title) {
    return null;
  }
  let underscored = title.replace(' ', '_');
  let link = `https://en.wikipedia.org/wiki/${underscored}`;
  if (target) {
    return <a href={link} target={target}>{title}</a>;
  }
  return <a href={link}>{title}</a>;
}

function TAViewerDetailRow(props) {
  let label = props.label;
  let value = props.value;

  if (value === null || (_.isArray(value) && value.length === 0)) {
    return <div></div>;
  }
  if (_.isArray(value)) {
    return (
      <div className="taviewer-detail-row">
        <div className="taviewer-detail-key">{label}:</div>
        <div className="taviewer-detail-value">
          {value.map(x => <div key={x}>{x}</div>)}
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


class TAViewerDetailGallery extends Component {
  render() {
    let imageUrls = this.props.imageUrls;
    if (!imageUrls) { return null };
    return (
      <Gallery
        onClick={this.props.onClick}
        photos={imageUrls.map(x => ({ src: x, width: 1, height: 1 }))} />
    );
  }
}
class TAViewerDetailLightbox extends Component {
  render() {
    let imageUrls = this.props.imageUrls;
    if (!imageUrls) {
      return null;
    }
    return (
      <div>
        <Lightbox
          onClickPrev={this.props.gotoPrevImage}
          onClickNext={this.props.gotoNextImage}
          currentImage={this.props.currentImage}
          isOpen={this.props.isOpen}
          images={imageUrls.map(x => ({ src: x }))}
          onClose={this.props.onClose} />
      </div>
    );
  }
}

function clampRange(val, items) {
  if (val < 0 || !items) {
    return 0;
  }
  if(val >= items.length) {
    return items.length - 1;
  }
  return val;
}
class TA98ViewerDetail extends Component {
  state = {
    lightboxIsOpen: false,
    currentImage: 0
  }

  closeLightbox = () => {
    this.setState({ lightboxIsOpen: false });
  }

  openLightbox = (ev, info) => {
    this.setState({ 
      lightboxIsOpen: true,
      currentImage: info.index
     });
  }

  gotoNextImage = () => {
    let currentImage = clampRange(this.state.currentImage + 1, this.props.node[4]);
    this.setState({currentImage});
  }

  gotoPrevImage = () => {
    let currentImage = clampRange(this.state.currentImage - 1, this.props.node[4]);
    this.setState({currentImage});
  }

  render() {
    let node = this.props.node;
    let wpImageIndex = this.props.wpImageIndex;
    if (!node) {
      return null;
    }
    let imageUrls = null;
    if (node[4]) {
      let shortImageUrls = wpImageIndex[node[4]];
      if (shortImageUrls) {
        imageUrls = shortImageUrls.map(x => `${WikiCommonsPrefix}${x}`);
      }
    }
    return (
      <div>
        <h2>{node[1]}</h2>
        <TAViewerDetailRow label="TA98 ID" value={node[0]} />
        <TAViewerDetailRow label="Latin name" value={node[2]} />
        <TAViewerDetailRow label="Synonyms" value={node[3]} />
        <TAViewerDetailRow label="Wikipedia"
          value={WikipediaLink(node[4], "_blank")} />
          <div>
        <TAViewerDetailGallery
          isOpen={this.state.lightboxIsOpen}
          className="taviewer-carousel"
          onClose={this.closeLightbox}
          onClick={this.openLightbox}
          imageUrls={imageUrls} />
          </div>
        <TAViewerDetailLightbox
          isOpen={this.state.lightboxIsOpen}
          currentImage={this.state.currentImage}
          gotoPrevImage={this.gotoPrevImage}
          gotoNextImage={this.gotoNextImage}
          onClose={this.closeLightbox}
          imageUrls={imageUrls} />
      </div>
    );
  }
}

class App extends Component {
  state = {
    selectExpandNode: null,
    history: null,
    unlisten: null,
    nodeIndex: null,
    wpImageIndex: null,
    lightboxIsOpen: false,
    currentImage: 0
  };

  selectExpandNode = n => {
    let selectExpandNode = n;
    this.setState({ selectExpandNode });
    if (n) {
      this.state.history.push(`/?id=${n[0]}`);
    }
    else {
      this.state.history.push('/');
    }
  }

  handleHistory = (location, action) => {
    if (action === 'POP' || action === 'X-INIT') {
      const query = queryString.parse(location.search);
      let selectedNode = null;
      if (query.id && this.state.nodeIndex.get_node_by_id(query.id)) {
        selectedNode = this.state.nodeIndex.get_node_by_id(query.id);
      }
      this.setState({
        selectExpandNode: selectedNode
      });
    }
  }

  componentDidMount() {
    this.handleHistory(this.state.history.location, 'X-INIT');
  }
  componentWillMount() {

    const history = createHistory();
    const nodeIndex = new NodeIndex(ta98_json);
    const unlisten = history.listen((location, action) => {
      this.handleHistory(location, action);
    });
    this.setState({
      wpImageIndex,
      unlisten,
      history,
      nodeIndex
    }
    );
  }
  componentWillUnmount() {
    if (this.state.unlisten) {
      this.state.unlisten();
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
          <Complete
            className="taviewer-complete"
            data={this.state.nodeIndex}
            onSelect={this.selectExpandNode} />
        </div>
      </header>
      <main className="taviewer-main">

        <div className="taviewer-detail">
          <TA98ViewerDetail 
            node={this.state.selectExpandNode} 
            wpImageIndex={this.state.wpImageIndex} />
        </div>
        <div className="taviewer-tree">
          <TA98TreeViewer
            data={this.state.nodeIndex}
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
    let title_text = `${node[1]} (${node[0]})`;
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
  componentWillMount() {
    this.setState({
      matchingNodes: this.props.data.get_nodes()
    });
  }

  handleSearch = (searchString) => {
    let matchingNodes = [];
    _.forOwn(this.props.data.get_nodes(), (v) => {
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
      let selectedNode = this.props.data.get_node_by_id(v);
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
      children = <Option
        disabled={true}
        key="TooMany">{matchingNodes.length} matches...</Option>;
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
      this.props.onSelect(this.props.data.get_node_by_id(keys[0]));
    }
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

export default App;
