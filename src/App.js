import React, { Component } from 'react';
import './App.css';
import _ from 'lodash';
import prefix_match from './prefix-match';
import createHistory from 'history/createBrowserHistory';
import { Collapse, Tree, AutoComplete } from 'antd';
import queryString from 'query-string';
import { Wikidata, getSitelinkUrl } from './Wikidata';
import Lightbox from 'react-images';
import Gallery from 'react-photo-gallery';
const TreeNode = Tree.TreeNode;
const Option = AutoComplete.Option;
const WikiCommonsPrefix = "https://upload.wikimedia.org/wikipedia/commons/";
const WikipediaBaseUrl = 'https://en.wikipedia.org/wiki/';
const WikidataBaseUrl = 'https://www.wikidata.org/wiki/'
const Panel = Collapse.Panel;

function TAViewerDetailLinks(props) {
  const { label, baseUrl, value, target } = props;

  if (value === null || value.length === 0) {
    return null;
  }
  return (
    <div className="taviewer-detail-row">
      <div className="taviewer-detail-key">{label}:</div>
      <div className="taviewer-detail-value">
        {value.map(x => {
          let href = `${baseUrl}${encodeURIComponent(x)}`;
          return <div><a href={href} target={target}>{x}</a></div>;
        })}
      </div>
    </div>
  )
}
function TAViewerDetailRow(props) {
  let label = props.label;
  let value = props.value;

  if (value === null || (_.isArray(value) && value.length === 0)) {
    return null;
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
  if (val >= items.length) {
    return items.length - 1;
  }
  return val;
}

class TA98ViewerDetail extends Component {
  state = {
    lightboxIsOpen: false,
    wikidataCache: {},
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
    console.log('goto next', this.props.node);
    let currentImage = clampRange(this.state.currentImage + 1,
      this.wikipediaImageUrls());
    this.setState({ currentImage });
  }

  gotoPrevImage = () => {
    console.log('goto prev', this.props.node[4]);

    let currentImage = clampRange(this.state.currentImage - 1,
      this.wikipediaImageUrls());
    this.setState({ currentImage });
  }

  updateWikidataCache = (id, info) => {
    this.setState({
      wikidataCache:
        _.assign({},
          this.state.wikidataCache,
          { [id]: info })
    });
  }

  renderWikidataLanguage(id) {
    if (!id || !this.state.wikidataCache[id]) {
      return null;
    }
    const info = this.state.wikidataCache[id];
    return _.map(_.sortBy(_.values(info['labels']), 'language'), v => {
      return (<div key={v["language"]} className="taviewer-detail-row">
        <div className="taviewer-detail-key">{v['language']}:</div>
        <div className="taviewer-detail-value">{v['value']}</div>
      </div>)
    });
  }

  renderWikidataWikipedia(id) {
    if (!id || !this.state.wikidataCache[id]) {
      return null;
    }
    const info = this.state.wikidataCache[id];
    const siteInfo = _.sortBy(_.values(info['sitelinks']), 'site');
    return _.map(siteInfo, v => {
      return (
        <div key={v["site"]} className="taviewer-detail-row">
          <div className="taviewer-detail-key">{v['site'].replace('wiki', '')}:</div>
          <div className="taviewer-detail-value">
            <div><a href={getSitelinkUrl(v)} target="_blank">{v['title']}</a></div>
          </div>
        </div>
      )
    })
  }

  wikipediaImageUrls() {
    const { node, wpImageIndex } = this.props;
    if (!node || node[4].length == 0) {
      return [];
    }
    const shortUrls = _.union(_.flatMap(node[4], wpTitle =>
      _.get(wpImageIndex, wpTitle, [])));
    console.log(shortUrls, node[4], wpImageIndex);
    const imageUrls = _.map(shortUrls, x => `${WikiCommonsPrefix}${x}`);
    return imageUrls;
  }

  render() {
    let node = this.props.node;
    let wpImageIndex = this.props.wpImageIndex;
    if (!node) {
      return null;
    }
    let wd_entity = node[5];
    let imageUrls = this.wikipediaImageUrls();

    return (
      <div>
        <Wikidata entityIDs={wd_entity} onValue={this.updateWikidataCache} />
        <h2>{node[1]}</h2>
        <TAViewerDetailRow label="TA98 ID" value={node[0]} />
        <TAViewerDetailRow label="Latin name" value={node[2]} />
        <TAViewerDetailRow label="Synonyms" value={node[3]} />
        <TAViewerDetailLinks label="Wikipedia"
          value={node[4]} baseUrl={WikipediaBaseUrl} target="_blank" />
        <TAViewerDetailLinks label="Wikidata"
          value={node[5]} baseUrl={WikidataBaseUrl} target="_blank" />
        <Collapse bordered={false}>
          {imageUrls.length > 0 ?
            <Panel header={"Images (" + imageUrls.length + ")"}>
              <div>
                <TAViewerDetailGallery
                  isOpen={this.state.lightboxIsOpen}
                  className="taviewer-carousel"
                  onClose={this.closeLightbox}
                  onClick={this.openLightbox}
                  imageUrls={imageUrls} />
                <TAViewerDetailLightbox
                  isOpen={this.state.lightboxIsOpen}
                  currentImage={this.state.currentImage}
                  gotoPrevImage={this.gotoPrevImage}
                  gotoNextImage={this.gotoNextImage}
                  onClose={this.closeLightbox}
                  imageUrls={imageUrls} />
              </div>
            </Panel> : null}
          {wd_entity.length > 0 ?
            <Panel header="Translations">{this.renderWikidataLanguage(wd_entity[0])}</Panel>
            : null}
          {wd_entity.length > 0 ?
            <Panel header="Other Wikipedia sites">{this.renderWikidataWikipedia(wd_entity[0])}</Panel>
            : null}
        </Collapse>


      </div>
    );
  }
}

class App extends Component {
  state = {
    selectExpandNode: null,
    history: null,
    unlisten: null,
    lightboxIsOpen: false,
    currentImage: 0,
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
      if (query.id && this.props.ta98Data.get_node_by_id(query.id)) {
        selectedNode = this.props.ta98Data.get_node_by_id(query.id);
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
    const unlisten = history.listen((location, action) => {
      this.handleHistory(location, action);
    });
    this.setState({
      unlisten,
      history,
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
              data={this.props.ta98Data}
              onSelect={this.selectExpandNode} />
          </div>
        </header>
        <main className="taviewer-main">

          <div className="taviewer-detail">
            <TA98ViewerDetail
              node={this.state.selectExpandNode}
              wpImageIndex={this.props.wpImageIndex} />
          </div>
          <div className="taviewer-tree">
            <TA98TreeViewer
              data={this.props.ta98Data}
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
        _.startsWith(v[0], searchString.toUpperCase())) {
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

export default App;
