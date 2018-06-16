import React, { Component } from 'react';
import './App.css';
import createHistory from 'history/createBrowserHistory';

import Button from 'antd/lib/button';
import queryString from 'query-string';

import TAComplete from './TAComplete';
import TATreeViewer from './TATreeViewer';
import TAViewerDetail from './TAViewerDetail';


class App extends Component {
  history = null;
  unlisten = null;

  state = {
    selectExpandNode: null,
    lightboxIsOpen: false,
    currentImage: 0,
  };

  constructor() {
    super();
    this.history = createHistory();
    this.unlisten = this.history.listen((location, action) => {
      this.handleHistory(location, action);
    });
  }

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

    this.history.push(uri, historyState);
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
    this.handleHistory(this.history.location, 'X-INIT');
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
              <TAComplete
                className="taviewer-complete"
                data={this.props.ta98Data}
                onSelect={this.selectExpandNode} />
            </div>
          </div>
        </header>
        <main className="taviewer-main">

          <div className="taviewer-detail">
            <TAViewerDetail
              openLightbox={this.openLightbox}
              closeLightbox={this.closeLightbox}
              lightboxIsOpen={this.state.lightboxIsOpen}
              node={this.state.selectExpandNode} />
          </div>
          <div className="taviewer-tree">
            <TATreeViewer
              data={this.props.ta98Data}
              onSelect={this.selectExpandNode}
              selectExpandNode={this.state.selectExpandNode} />
          </div>
        </main>
      </div >
    );
  }
}

export default App;
