import React, { Component } from 'react';
import AutoComplete from 'antd/lib/auto-complete';
import Tooltip from 'antd/lib/tooltip';
import _ from 'lodash';
import prefix_match from './prefix-match';
import getAncestors from './get-ancestors';

const Option = AutoComplete.Option;


class TAComplete extends Component {
  state = {
    searchString: '',
    matchingNodes: [],
    selectedNode: null
  }
  componentDidMount() {
    this.setState({
      matchingNodes: this.props.data.getNodes()
    });
  }

  handleSearch = (searchString) => {
    console.log(searchString);
    let matchingNodes = [];
    let { language } = this.props;

    _.forOwn(this.props.data.getNodes(), (v) => {
      const lc = searchString.toLowerCase();
      if (prefix_match(lc, v.name[language])) {
        matchingNodes.push(v);
      }
    })
    matchingNodes = _.sortBy(matchingNodes, [o => o.name[language]]);
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
    if (matchingNodes.length > 200) {
      children = <Option
        disabled={true}
        key="TooMany">{matchingNodes.length} matches...</Option>;
    }
    else {
      children = _.map(matchingNodes, m => {
        const tooltipContent = this.getAncestorNames(m, language);
        return <Option value={m.id} key={m.id}>
          {
            tooltipContent ?
              <Tooltip
                placement="right"
                arrowPointAtCenter={true}
                mouseEnterDelay={0.7}
                overlayClassName="taviewer-complete-tooltip"
                title={tooltipContent}>{m.name[language]} ({m.id})
              </Tooltip> 
              : <span>{m.name[language]} ({m.id})</span>
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