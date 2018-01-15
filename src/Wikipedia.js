import _ from 'lodash';
import { Component } from 'react';

const BogusImageRe = RegExp('(.*Lock-green.svg)|\
(.*Wiktionary-logo.*)|\
(.*Commons-logo.*)|\
(.*Wiki_letter_w.*)|\
(.*Folder_Hexagonal_Icon.*)|\
(.*Portal-puzzle.*)|\
(.*Symbol_.*)|\
(.*People_icon.*)|\
(.*Question_book.*)|\
(.*Padlock.*)|\
(.*WHO_Rod.*)\
');

function filterBogusImages(imageInfo) {
    return _.filter(imageInfo, info => {
        return !BogusImageRe.test(info.url);
    });
}

var WikipediaImageAPIUrl = 'https://en.wikipedia.org/w/api.php?generator=images&iiprop=url&prop=imageinfo&format=json&action=query&redirects=&origin=*';

function getWikipediaImageinfoUrl(title, thumbwidth, thumbheight) {
    let encodedTitle = encodeURIComponent(title);
    let qs = `titles=${encodedTitle}&iiurlwidth=${thumbwidth}&iiurlheight=${thumbheight}`
    let url = `${WikipediaImageAPIUrl}&${qs}`
    return url;
}

class Wikipedia extends Component {
    state = {
        cache: {},
        pending: {}
    }

    onValue = (id, e) => {
        if (this.props.onValue) {
            this.props.onValue(id, e);
        }
    }


    wikipediaQuery(wikiTitle) {
        this.setState({ pending: _.assign({}, this.state.pending, { [wikiTitle]: true }) });

        const searchUrl = getWikipediaImageinfoUrl(wikiTitle, 128, 128);
        fetch(searchUrl).then(res => {
            if (!res.ok) {
                throw new Error('wikipedia request error');
            }
            return res.json();
        }).then(doc => {
            const pages = _.values(doc.query.pages);
            const imageInfo = _.map(pages, page => page.imageinfo[0]);
            return  filterBogusImages(imageInfo);
        }).then(imageInfo => {
            const wikiInfo = { 
                imageInfo: imageInfo,
                images: _.map(imageInfo, 'url')
            };
            this.setState({
                cache: _.assign({}, this.state.cache, { [wikiTitle]: wikiInfo }),
                pending: _.assign({}, this.state.pending, { [wikiTitle]: false })
            });
            this.onValue(wikiTitle, wikiInfo);
        }).catch(err => {
            this.setState({ pending: _.assign({}, this.state.pending, { [wikiTitle]: false }) });
            throw err;
        });
    }

    componentDidMount() {
        const { wikiTitles } = this.props;
        _.forEach(wikiTitles, wikiTitle => {
            setTimeout(this.wikipediaQuery(wikiTitle), 1);
        });
    }

    componentWillReceiveProps(newProps) {
        if (_.isEqual(newProps, this.props)) {
            return;
        }
        const { wikiTitles } = newProps;
        _.forEach(wikiTitles, wikiTitle => {
            if (this.state.pending[wikiTitle]) {
                return;
            }
            if (_.has(this.state.cache, wikiTitle)) {
                setTimeout(() => this.onValue(wikiTitle, this.state.cache[wikiTitle]), 1);
                return null;
            }
            setTimeout(this.wikipediaQuery(wikiTitle), 1);
        });
    }

    render() {
        return null;
    }
}
export default Wikipedia;