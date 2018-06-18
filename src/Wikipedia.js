import _ from 'lodash';
import wikipediaBlacklist from './WikipediaImageBlacklist';
import { Component } from 'react';

const BogusImageRe = RegExp(wikipediaBlacklist.join('|'));

function filterBogusImages(imageInfo) {
    return _.filter(imageInfo, info => {
        return !BogusImageRe.test(info.url);
    });
}

var WikipediaImageAPIUrl = 'https://en.wikipedia.org/w/api.php?generator=images&iiprop=url|size&prop=imageinfo&format=json&action=query&redirects=&origin=*';

function getWikipediaImageinfoUrl(title, thumbwidth, thumbheight) {
    let encodedTitle = encodeURIComponent(title);
    let qs = `titles=${encodedTitle}&iiurlwidth=${thumbwidth}&iiurlheight=${thumbheight}`
    let url = `${WikipediaImageAPIUrl}&${qs}`
    return url;
}

class Wikipedia extends Component {
    pending = {};
    cache = {};

    onValue = (id, e) => {
        if (this.props.onValue) {
            this.props.onValue(id, e);
        }
    }

    wikipediaQuery(wikiTitle) {
        this.pending[wikiTitle] = true;

        const searchUrl = getWikipediaImageinfoUrl(wikiTitle, 256, 256);
        fetch(searchUrl).then(res => {
            if (!res.ok) {
                throw new Error('wikipedia request error');
            }
            return res.json();
        }).then(doc => {
            const pages = _.values(_.get(doc, ['query', 'pages'], []));
            const imageInfo = _.map(pages, page => page.imageinfo[0]);
            return filterBogusImages(imageInfo);
        }).then(imageInfo => {
            const wikiInfo = {
                imageInfo: imageInfo
            };
            this.cache[wikiTitle] = wikiInfo;
            this.pending[wikiTitle] = false;

            this.onValue(wikiTitle, wikiInfo);
        }).catch(err => {
            this.pending[wikiTitle] = false;
            throw err;
        });
    }

    componentDidMount() {
        const { wikiTitles } = this.props;
        _.forEach(wikiTitles, wikiTitle => {
            setTimeout(this.wikipediaQuery(wikiTitle), 1);
        });
    }

    componentDidUpdate(prevProps) {
        if (_.isEqual(prevProps, this.props)) {
            return;
        }
        const { wikiTitles } = this.props;
        _.forEach(wikiTitles, wikiTitle => {
            if (this.pending[wikiTitle]) {
                return;
            }
            if (_.has(this.cache, wikiTitle)) {
                setTimeout(() => this.onValue(wikiTitle, this.cache[wikiTitle]), 1);
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