import React, { Component } from 'react';
import AutoComplete from 'antd/lib/auto-complete';
import Tooltip from 'antd/lib/tooltip';
import _ from 'lodash';
import PrefixSearch from './prefix-search';
import getAncestors from './get-ancestors';

const Option = AutoComplete.Option;

const MaxMatches = 300;

function indexNodes(nodes) {
  const index = new PrefixSearch();

  for(const n of nodes) {
    index.indexNode(n, n.name.en, 'name_en');
    index.indexNode(n, n.name.la, 'name_la');
    for(const s of n.synonyms) {
      index.indexNode(n, s, 'synonym');
    }
    index.indexNode(n, n.id, 'id');
  }
  return index;
}

function getBestMatching(nodes, lang) {
  let matchingNodes = [];
  const grouped = _.groupBy(nodes, n => n.node.id);
  for(const mv of _.values(grouped)) {
    const v = _.find(mv, i => i.term === i.node.name[lang]);
    if(v){
      matchingNodes.push(v);
    }
    else {
      matchingNodes.push(mv[0]);
    }
  }
  return _.sortBy(matchingNodes, [o => o.node.name[lang]]);
}

class TAComplete extends Component {
  constructor() {
    super();
    this.prefixSearchIndex = new PrefixSearch();
  }

  state = {
    searchString: '',
    matchingNodes: [],
    selectedNode: null
  }

  componentDidMount() {
    const allNodes = this.props.data.getNodes();
    this.prefixSearchIndex = indexNodes(allNodes);

    this.setState({
      matchingNodes: []
    });
  }

  handleSearch = (searchString) => {
    let { language } = this.props;

    const matches = this.prefixSearchIndex.getMatches(searchString);
    const matchingNodes = getBestMatching(matches, language);
  
    this.setState({ searchString, matchingNodes });
  }

  onSelect = (v) => {
    if (v) {
      let selectedNode = this.props.data.getNodeById(v);

      this.setState({
        selectedNode,
        searchString: null
      });
      if (this.props.onSelect) {
        this.props.onSelect(selectedNode);
      }
    }
  }

  getAncestorNames(n, lang) {
    const ancestors = getAncestors(n);
    const nameElements = [];
    for (let i = 1; i < ancestors.length; i++) {
      nameElements.push(<span key={i}>{ancestors[i].name[lang]}</span>);
    }
    if (nameElements.length === 0) {
      return null;
    }
    return (
      <div className="taviewer-breadcrumbs">{nameElements}</div>
    );
  }

  render() {
    const { matchingNodes } = this.state;
    const { language } = this.props;

    let children;
    if (matchingNodes.length > MaxMatches) {
      children = <Option
        disabled={true}
        key="TooMany">{matchingNodes.length} matches...</Option>;
    }
    else {
      children = _.map(matchingNodes, md => {
        const m = md.node;
        const tooltipContent = this.getAncestorNames(m, language);
        const primaryTerm = m.name[language];
        const matchingTerm = md.term;

        const printTerm = primaryTerm === matchingTerm ? 
                        primaryTerm : `${matchingTerm} (${primaryTerm})`;
        return <Option value={m.id} key={m}>
          {
            tooltipContent ?
              <Tooltip
                key={m.id}
                placement="right"
                arrowPointAtCenter={true}
                mouseEnterDelay={0.7}
                overlayClassName="taviewer-complete-tooltip"
                title={tooltipContent}>{printTerm} ({m.id})
              </Tooltip> 
              : <span>{printTerm} ({m.id})</span>
          }
        </Option>
      });
    }
    return (
      <div className="taviewer-complete">
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
      </div>
    )
  }

}

export default TAComplete;