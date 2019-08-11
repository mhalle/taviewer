import React, { Component } from 'react';
import './App.css';
import { createBrowserHistory } from 'history';
// import { translate, Trans } from 'react-i18next';

import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import queryString from 'query-string';

import TAComplete from './TAComplete';
import TATreeViewer from './TATreeViewer';
import TADetailViewer from './TADetailViewer';
import _ from 'lodash';
const Option = Select.Option;

function LanguageSelect(props) {
  return (<Select style={{ width: 125 }}
    defaultValue="en"
    {...props}>
    <Option value="la">Latin</Option>
    <Option value="en">English</Option>
    <Option value="es">Spanish (beta)</Option>
  </Select>
  )
}

const supportedLanguages = ['en', 'la', 'es'];
let defaultLanguage = 'en';

function About() {
  return (<Button
    href="https://mhalle.github.io/taviewer"
    size="default"
    target="_blank">about...</Button>
  )
}

class App extends Component {
  history = null;
  unlisten = null;

  state = {
    selectExpandNode: null,
    lightboxIsOpen: false,
    currentImage: 0,
    language: defaultLanguage
  };

  constructor() {
    super();
    this.history = createBrowserHistory();
    this.unlisten = this.history.listen((location, action) => {
      this.handleHistory(location, action);
    });
    let userLanguage = navigator.language || navigator.userLanguage;
    if (userLanguage) {
      userLanguage = userLanguage.toLowerCase().slice(0, 2);
    }
    if(_.includes(supportedLanguages, userLanguage)) {
      this.state.language = defaultLanguage = userLanguage;
    }
    else {
      // if user language isn't supported, default is Latin
      this.state.language = defaultLanguage = 'la';
    }
  }

  handleSelectExpandNode = (n) => {
    this.setState({
      selectExpandNode: n,
      lightboxIsOpen: false
    });
    this.pushHistory(n, this.state.language);
  }

  pushHistory = (n, lang) => {
    let uri = '/';
    let q = [];

    if(n){
      q=[`id=${n.id}`];
    }
    if(lang !== defaultLanguage && _.includes(supportedLanguages, lang)){
      q.push(`lang=${lang}`);
    }
    if(q.length){
      uri = '/?' + q.join('&');
    }

    this.history.push(uri);
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
        this.pushHistory(this.state.selectExpandNode, this.state.language);
        this.setState({
          lightboxIsOpen: false
        });
        return;
      }

      const query = queryString.parse(location.search);
      let selectedNode = null;
      if (query.id && this.props.ta98Data.getNodeById(query.id)) {
        selectedNode = this.props.ta98Data.getNodeById(query.id);
      }

      let language;
      if (query.lang && _.includes(supportedLanguages, query.lang)) {
        language = query.lang;
      }
      else {
        language = defaultLanguage;
      }
      this.setState({
        lightboxIsOpen: false,
        selectExpandNode: selectedNode,
        language
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

  changeLanguage = (language) => {
    this.setState({
      language
    });
    this.pushHistory(this.state.selectExpandNode, language);
  }

  render() {
    const { i18n } = this.props;

    return (
      
      <div className="taviewer">
        <header className="taviewer-header">
          <div className="taviewer-menubar">
          <div className="taviewer-title">
            <h1>TA Viewer</h1>
          </div>
            <div className="taviewer-search">
              <TAComplete language={this.state.language}
                className="taviewer-complete"
                data={this.props.ta98Data}
                onSelect={this.handleSelectExpandNode} />
            </div>
            <LanguageSelect onChange={this.changeLanguage} value={this.state.language}/>
            <About />
          </div>
        </header>
        <main className="taviewer-main">
          <div className="taviewer-tree">
            <TATreeViewer language={this.state.language}
              data={this.props.ta98Data}
              onSelect={this.handleSelectExpandNode}
              selectExpandNode={this.state.selectExpandNode} />
          </div>
          <div className="taviewer-detail">
            <TADetailViewer language={this.state.language}
              openLightbox={this.openLightbox}
              closeLightbox={this.closeLightbox}
              lightboxIsOpen={this.state.lightboxIsOpen}
              selectExpandNode={this.handleSelectExpandNode}
              node={this.state.selectExpandNode} />
          </div>
        </main>
      </div>
    );
  }

}

//export default translate('taviewer')(App);
export default App;
