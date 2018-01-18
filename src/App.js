import React, { Component } from 'react';
import './App.css';
import _ from 'lodash';
import prefix_match from './prefix-match';
import createHistory from 'history/createBrowserHistory';
import Collapse from 'antd/lib/collapse';
import Tree from 'antd/lib/tree';
import AutoComplete from 'antd/lib/auto-complete';
import Button from 'antd/lib/button';
import queryString from 'query-string';
import wikidata from './Wikidata';
import Wikipedia from './Wikipedia';

import Lightbox from 'react-image-lightbox';
import Gallery from 'react-photo-gallery';
const TreeNode = Tree.TreeNode;
const Option = AutoComplete.Option;
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
        {value.map((x, i) => {
          let href = `${baseUrl}${encodeURIComponent(x)}`;
          return <div key={i}><a href={href} target={target}>{x}</a></div>;
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
    let imageInfo = this.props.imageInfo;
    if (!imageInfo) { return null };
    return (
      <Gallery
        onClick={this.props.onClick}
        photos={imageInfo.map(x => ({ src: x.thumburl, width: x.thumbwidth, height: x.thumbheight }))} />
    );
  }
}
class TAViewerDetailLightbox extends Component {
  state = {
    currentImage: 0
  }

  gotoPrevImage = () => {
    const { imageInfo, currentImage } = this.props;
    const nImages = imageInfo.length;
    this.props.setCurrentImage((currentImage - 1 + nImages) % nImages);
  }

  gotoNextImage = () => {
    const { imageInfo, currentImage } = this.props;
    const nImages = imageInfo.length;
    this.props.setCurrentImage((currentImage + 1) % nImages)
  }

  render() {
    const { imageInfo, currentImage } = this.props;
    const nImages = imageInfo.length;
    return (
      <div>
        <Lightbox
          imagePadding={80}
          wrapperClassName="taviewer-lightbox"
          mainSrc={imageInfo[currentImage].url}
          nextSrc={imageInfo[(currentImage + 1) % nImages].url}
          prevSrc={imageInfo[(currentImage + nImages - 1) % nImages].url}

          onMovePrevRequest={this.gotoPrevImage}
          onMoveNextRequest={this.gotoNextImage}
          images={imageInfo.map(x => ({ src: x.url }))}
          onCloseRequest={this.props.onClose} />
      </div>
    );
  }
}

function getWikipediaImageInfo(titles, wikipediaCache) {
  if (!titles || titles.length === 0) {
    return [];
  }
  let imageInfo = [];
  for (let wikiTitle of titles) {
    const wikiInfo = _.get(wikipediaCache, wikiTitle, null);
    if (wikiInfo && wikiInfo.imageInfo) {
      imageInfo = _.union(imageInfo, wikiInfo.imageInfo);
    }
  }

  return imageInfo;
}

class TA98ViewerDetail extends Component {
  state = {
    wikidataCache: {},
    wikipediaCache: {},
    currentImage: 0
  }

  closeLightbox = () => {
    this.props.closeLightbox();
  }

  openLightbox = (ev, info) => {
    this.setState({
      currentImage: info.index
    });
    this.props.openLightbox();
  }

  updateWikidataCache = (id, info) => {
    this.setState({
      wikidataCache:
        _.assign({},
          this.state.wikidataCache,
          { [id]: info })
    });
  }

  updateWikipediaCache = (title, info) => {
    this.setState({
      wikipediaCache:
        _.assign({},
          this.state.wikipediaCache,
          { [title]: info })
    });
  }

  setCurrentImage = (i) => {
    this.setState({ currentImage: i });
  }

  renderWikidataProperty(ids, propId, propLabel, urlPrefix) {
    if (!ids || ids.length === 0) {
      return null;
    }
    const validEntities = _.compact(_.map(ids, id => this.state.wikidataCache[id]));
    if (validEntities.length === 0) {
      return null;
    }

    let allClaimValues = [];
    for (let entity of validEntities) {
      let claimValues = wikidata.getEntityClaimValues(entity, propId);
      if(claimValues) { 
        allClaimValues = _.union(allClaimValues, claimValues);
      }
    }
    if(!allClaimValues.length) {
      return null;
    }
    let displayValues = allClaimValues;
    if(urlPrefix) {
      displayValues = _.map(allClaimValues, claimValue => 
          <a href={urlPrefix + claimValue} target='_blank'>{claimValue}</a>);
    }

    return (<div key={propId} className="taviewer-detail-row">
      <div className="taviewer-detail-key">{propLabel}:</div>
      <div className="taviewer-detail-value">{displayValues.map((x, i)=><div key={i}>{x}</div>)}</div>
    </div>);

  }
  getWikidataLanguageCount(ids) {
    if (!ids || ids.length === 0) {
      return 0;
    }
    const validEntities = _.compact(_.map(ids, id => this.state.wikidataCache[id]));
    if (validEntities.length === 0) {
      return 0;
    }
    /// hack here
    const info = validEntities[0];
    return _.values(info['labels']).length;
  }

  renderWikidataLanguage(ids) {
    if (!ids || ids.length === 0) {
      return null;
    }
    const validEntities = _.compact(_.map(ids, id => this.state.wikidataCache[id]));
    if (validEntities.length === 0) {
      return null;
    }
    /// hack here
    const info = validEntities[0];
    return _.map(_.sortBy(_.values(info['labels']), 'language'), v => {
      return (<div key={v["language"]} className="taviewer-detail-row">
        <div className="taviewer-detail-key">{v['language']}:</div>
        <div className="taviewer-detail-value">{v['value']}</div>
      </div>)
    });
  }

  getWikipediaArticleCount(ids) {
    if (!ids || ids.length === 0) {
      return 0;
    }
    const validEntities = _.compact(_.map(ids, id => this.state.wikidataCache[id]));
    if (validEntities.length === 0) {
      return 0;
    }
    /// hack here
    const info = validEntities[0];
    return _.values(info['sitelinks']).length;
  }
  renderWikidataWikipedia(ids) {
    if (!ids || ids.length === 0) {
      return null;
    }
    const validEntities = _.compact(_.map(ids, id => this.state.wikidataCache[id]));
    if (validEntities.length === 0) {
      return null;
    }
    /// hack here
    const info = validEntities[0];
    const siteInfo = _.sortBy(_.values(info['sitelinks']), 'site');
    return _.map(siteInfo, v => {
      return (
        <div key={v["site"]} className="taviewer-detail-row">
          <div className="taviewer-detail-key">{v['site'].replace('wiki', '')}:</div>
          <div className="taviewer-detail-value">
            <div><a href={wikidata.getSitelinkUrl(v)} target="_blank">{v['title']}</a></div>
          </div>
        </div>
      )
    })
  }

  getWikidataWikipediaUrls(ids) {
    if (!ids || ids.length === 0) {
      return null;
    }
    const validEntities = _.compact(_.map(ids, id => this.state.wikidataCache[id]));
    if (validEntities.length === 0) {
      return null;
    }
    let wikipediaLinkInfo = [];
    for (let entity of validEntities) {
      const siteField = _.get(entity, ['sitelinks', 'enwiki'], null);
      if (siteField) {
        const siteUrl = wikidata.getSitelinkUrl(siteField);
        wikipediaLinkInfo.push([siteField.title, siteUrl]);
      }
    }
    return wikipediaLinkInfo;
  }


  render() {
    const { node, lightboxIsOpen } = this.props;
    const { wikipediaCache } = this.state;
    if (!node) {
      return null;
    }
    let wdEntityIDs = node[5];

    const languageCount = this.getWikidataLanguageCount(wdEntityIDs);
    const siteCount = this.getWikipediaArticleCount(wdEntityIDs);
    const wikipediaTitles = _.map(this.getWikidataWikipediaUrls(wdEntityIDs), 0);
    let imageInfo = getWikipediaImageInfo(wikipediaTitles, wikipediaCache);
    return (
      <div>
        <wikidata.Wikidata entityIDs={wdEntityIDs} onValue={this.updateWikidataCache} />
        <Wikipedia wikiTitles={wikipediaTitles} onValue={this.updateWikipediaCache} />

        <h2>{node[1]}</h2>
        <TAViewerDetailRow label="TA98 ID" value={node[0]} />
        <TAViewerDetailRow label="Latin name" value={node[2]} />
        <TAViewerDetailRow label="Synonyms" value={node[3]} />
        <TAViewerDetailLinks label="Wikipedia"
          value={wikipediaTitles} baseUrl={WikipediaBaseUrl} target="_blank" />
        <TAViewerDetailLinks label="Wikidata"
          value={node[5]} baseUrl={WikidataBaseUrl} target="_blank" />

        {this.renderWikidataProperty(wdEntityIDs,
          'P1402', "FMA ID",
          'http://fme.biostr.washington.edu/FME/index.jsp?fmaid=')}
        {this.renderWikidataProperty(wdEntityIDs,
          'P486', "Mesh ID",
          'https://meshb.nlm.nih.gov/#/record/ui?ui=')}
        {this.renderWikidataProperty(wdEntityIDs,
          'P696',
          "Neurolex ID", 'http://neurolex.org/wiki/')}

        <Collapse bordered={false}>
          {imageInfo.length > 0 ?
            <Panel header={"Wikipedia images (" + imageInfo.length + ")"}>
              <div>
                <TAViewerDetailGallery
                  isOpen={this.state.lightboxIsOpen}
                  className="taviewer-carousel"
                  onClose={this.closeLightbox}
                  onClick={this.openLightbox}
                  imageInfo={imageInfo} />

              </div>
            </Panel> : null}
          {languageCount > 0 ?
            <Panel header={`Translations (${languageCount})`} >{this.renderWikidataLanguage(wdEntityIDs)}</Panel>
            : null}
          {siteCount > 0 ?
            <Panel header={`Wikipedia sites (${siteCount})`}>{this.renderWikidataWikipedia(wdEntityIDs)}</Panel>
            : null}
        </Collapse>
        {lightboxIsOpen ? <TAViewerDetailLightbox
          currentImage={this.state.currentImage}
          gotoPrevImage={this.gotoPrevImage}
          gotoNextImage={this.gotoNextImage}
          setCurrentImage={this.setCurrentImage}
          onClose={this.closeLightbox}
          imageInfo={imageInfo} /> : null}
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

  selectExpandNode = (n) => {
    this.setState({
      selectExpandNode: n,
      lightboxIsOpen: false
    });
    this.pushHistory(n);
  }

  pushHistory = (n, lightboxOn) => {
    const uri = n ? `/?id=${n[0]}` : '/';
    const historyState = lightboxOn ? { lb: 1 } : undefined;

    this.state.history.push(uri, historyState);
  }

  openLightbox = () => {
    this.setState({ lightboxIsOpen: true });
  }

  closeLightbox = () => {
    this.setState({ lightboxIsOpen: false });
  }

  handleHistory = (location, action) => {
    if (action === 'POP' || action === 'X-INIT') {
      if (this.state.lightboxIsOpen) {
        this.pushHistory(this.state.selectExpandNode);
        this.setState({
          lightboxIsOpen: false
        });
        return;
      }

      const query = queryString.parse(location.search);
      let selectedNode = null;
      if (query.id && this.props.ta98Data.get_node_by_id(query.id)) {
        selectedNode = this.props.ta98Data.get_node_by_id(query.id);
      }
      this.setState({
        lightboxIsOpen: false,
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
          <div className="taviewer-topheader">
            <div className="taviewer-title">
              <h1 className="app-title">TA98 Viewer</h1>
            </div>
            <div className="taviewer-menubar">
              <Button href="https://mhalle.github.io/taviewer" size="small" target="_blank">about...</Button>
            </div>
          </div>
          <div className="taviewer-bottomheader">
          <div className="taviewer-search-spacer"></div>

          <div className="taviewer-search">
            <Complete
              className="taviewer-complete"
              data={this.props.ta98Data}
              onSelect={this.selectExpandNode} />
          </div>
          </div>
        </header>
      <main className="taviewer-main">

        <div className="taviewer-detail">
          <TA98ViewerDetail
            openLightbox={this.openLightbox}
            closeLightbox={this.closeLightbox}
            lightboxIsOpen={this.state.lightboxIsOpen}
            node={this.state.selectExpandNode} />
        </div>
        <div className="taviewer-tree">
          <TA98TreeViewer
            data={this.props.ta98Data}
            onSelect={this.selectExpandNode}
            selectExpandNode={this.state.selectExpandNode} />
        </div>
      </main>
      </div >
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
        searchString: null
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
        optionLabelProp="value"
        ref="autocomplete"
        value={this.state.searchString}
        onSelect={this.onSelect}
        onSearch={this.handleSearch}
        placeholder="search (e.g. thalamus)">
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
