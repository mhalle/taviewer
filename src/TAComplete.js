import React, { Component } from 'react';
import AutoComplete from 'antd/lib/auto-complete';
import _ from 'lodash';
import prefix_match from './prefix-match';

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
    let matchingNodes = [];
    let { language } = this.props;

    _.forOwn(this.props.data.getNodes(), (v) => {
      const lc = searchString.toLowerCase();
      if (prefix_match(lc, v.name[language])) {
        matchingNodes.push(v);
      }
    })
    matchingNodes = _.sortBy(matchingNodes, 1);
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

  render() {
    const { matchingNodes } = this.state;
    const { language } = this.props;

    let children;
    if (matchingNodes.length > 350) {
      children = <Option
        disabled={true}
        key="TooMany">{matchingNodes.length} matches...</Option>;
    }
    else {
      children = _.map(matchingNodes, m => {
        return <Option value={m.id} key={m.id}>{m.name[language]}&nbsp;({m.id})</Option>
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

export default TAComplete;