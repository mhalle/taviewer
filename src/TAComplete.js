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
  
  export default TAComplete;