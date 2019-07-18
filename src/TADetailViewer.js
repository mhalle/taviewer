import _ from 'lodash';
import React, { Component } from 'react';
import wikidata from './Wikidata';
import Wikipedia from './Wikipedia';
import Collapse from 'antd/lib/collapse';
import Lightbox from 'react-image-lightbox';
import Gallery from 'react-photo-gallery';
import getAncestors from './get-ancestors';
import { translate, Trans } from 'react-i18next';

const Panel = Collapse.Panel;

const WikidataBaseUrl = 'https://www.wikidata.org/wiki/';
const FMABaseUrl = 'http://xiphoid.biostr.washington.edu/fma/fmabrowser-hierarchy.html?fmaid=';
const MeshBaseUrl = 'https://meshb.nlm.nih.gov/#/record/ui?ui=';
const NeuroNamesBaseUrl = 'http://braininfo.rprc.washington.edu/centraldirectory.aspx?ID=';
const UBERONBaseUrl = 'http://purl.obolibrary.org/obo/UBERON_';
const UMLSBaseUrl = 'https://ncim-stage.nci.nih.gov/ncimbrowser/ConceptReport.jsp?dictionary=NCI%20Metathesaurus&code=';

class TADetailViewer extends Component {
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


    renderWikidataGray(ids, label, target) {
        if (!ids || ids.length === 0) {
            return null;
        }
        const validEntities = _.compact(_.map(ids, id => this.state.wikidataCache[id]));
        if (validEntities.length === 0) {
            return null;
        }
        /// hack here
        const info = validEntities[0];
        const grayInfo = wikidata.getGraysAnatomyInfo(info);
        if (grayInfo.length === 0) {
            return null;
        }

        return (
            <div className="taviewer-detail-row">
                <div className="taviewer-detail-key">{label}:</div>
                <div className="taviewer-detail-value">
                    {grayInfo.map((g, i) => {
                        const pageText = g.page === null ? '' : `page ${g.page}`
                        return g.url ?
                            <div key={i}><a href={g.url} target={target}>{pageText}</a></div>
                            :
                            <span key="pageText">{pageText}</span>;

                    })}
                </div>
            </div>
        );
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
            if (claimValues) {
                allClaimValues = _.union(allClaimValues, claimValues);
            }
        }
        if (!allClaimValues.length) {
            return null;
        }
        let displayValues = allClaimValues;
        if (urlPrefix) {
            displayValues = _.map(allClaimValues, claimValue =>
                <a href={urlPrefix + claimValue} target='_blank'>{claimValue}</a>);
        }

        return (<div key={propId} className="taviewer-detail-row">
            <div className="taviewer-detail-key">{propLabel}:</div>
            <div className="taviewer-detail-value">{displayValues.map((x, i) => <div key={i}>{x}</div>)}</div>
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
                <div className="taviewer-detail-key-nested">{v['language']}:</div>
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
        const markupList = _.map(siteInfo, v => {
            try {
                return (
                    <div key={v["site"]} className="taviewer-detail-row">
                        <div className="taviewer-detail-key-nested">{v['site'].replace('wiki', '')}:</div>
                        <div className="taviewer-detail-value">
                            <div><a href={wikidata.getSitelinkUrl(v)} target="_blank">{v['title']}</a></div>
                        </div>
                    </div>
                )
            } catch (err) {
                return undefined;
            }
        })
        return _.compact(markupList);
    }

    getWikidataWikipediaUrls(ids, lang) {
        if (!ids || ids.length === 0) {
            return null;
        }
        if (!lang) {
            lang = 'en';
        }
        const validEntities = _.compact(_.map(ids, id => this.state.wikidataCache[id]));
        if (validEntities.length === 0) {
            return null;
        }
        let wikipediaLinkInfo = [];
        let langSite = lang + 'wiki';
        for (let entity of validEntities) {
            const siteField = _.get(entity, ['sitelinks', langSite], null);
            if (siteField) {
                const siteUrl = wikidata.getSitelinkUrl(siteField);
                wikipediaLinkInfo.push([siteField.title, siteUrl]);
            }
        }
        return wikipediaLinkInfo;
    }

    renderBreadcrumbs(node, lang) {
        const ancestors = getAncestors(node);
        const renderItems = [];
        for (var i = 0; i < ancestors.length; i++) {
            const a = ancestors[i];
            // render this way, rather than using CSS, so that the user can 
            // select the entire path line
            renderItems.push(
                <a key={i} onClick={() => this.props.selectExpandNode(a)}>
                    <span><span className="separator">/</span>{a.name[lang]}</span>
                </a>
            );
        }
        return (
            <div className="taviewer-breadcrumbs">
                {_.reverse(renderItems)}
            </div>
        );
    }

    render() {
        const { t, i18n } = this.props;

        const { node, lightboxIsOpen, language } = this.props;
        const { wikipediaCache } = this.state;
        if (!node) {
            return null;
        }
        let wdEntityIDs = node.wikidataId;

        const languageCount = this.getWikidataLanguageCount(wdEntityIDs);
        const siteCount = this.getWikipediaArticleCount(wdEntityIDs);
        const wikipediaPageInfo = this.getWikidataWikipediaUrls(wdEntityIDs);
        const wikipediaTitles = _.map(wikipediaPageInfo, 0);
        let langWikipediaPageInfo = null;
        if (language !== 'en' && language !== 'la') {
            langWikipediaPageInfo = this.getWikidataWikipediaUrls(wdEntityIDs, language);
        }
        const imageInfo = getWikipediaImageInfo(wikipediaTitles, wikipediaCache);

        return (
            <div>
                <wikidata.Wikidata entityIDs={wdEntityIDs} onValue={this.updateWikidataCache} />
                <Wikipedia wikiTitles={wikipediaTitles} onValue={this.updateWikipediaCache} />

                <h2>{node.name[language]}</h2>
                {this.renderBreadcrumbs(node, language)}


                <DetailRow label="TA98 ID" value={node.id} />
                {
                    language !== 'la' ? 
                        <DetailRow label="Latin name" value={node.name['la']} /> : null
                }
                {
                    language !== 'en' ? 
                        <DetailRow label="English name" value={node.name['en']} /> : null
                }
                <DetailRow label="Synonyms" value={node.synonyms} />

                {
                langWikipediaPageInfo ? 
                        <DetailLinks label={`Wikipedia (${language})`} 
                                     value={langWikipediaPageInfo} 
                                     target="_blank" /> : null
                }

                <DetailLinks label="Wikipedia"
                    value={wikipediaPageInfo} target="_blank" />

                <DetailLinksBase label="Wikidata"
                    value={node.wikidataId} baseUrl={WikidataBaseUrl} target="_blank" />

                {this.renderWikidataGray(wdEntityIDs, "Gray's Anatomy", "_blank")}

                {node.fmaId !== null ? <DetailLinksBase label="FMA ID"
                    value={[node.fmaId]} baseUrl={FMABaseUrl} target="_blank" /> : null}


                {this.renderWikidataProperty(wdEntityIDs,
                    'P486', "Mesh ID", MeshBaseUrl)}

                {this.renderWikidataProperty(wdEntityIDs,
                    'P4394', "NeuroNames ID", NeuroNamesBaseUrl)}

                {this.renderWikidataProperty(wdEntityIDs,
                    'P1554', "UBERON ID", UBERONBaseUrl)}

                {this.renderWikidataProperty(wdEntityIDs,
                    'P2892', "UMLS CUI", UMLSBaseUrl)}


                <Collapse bordered={false}>
                    {imageInfo.length > 0 ?
                        <Panel header={"Wikipedia images (" + imageInfo.length + ")"}>
                            <div>
                                <DetailGallery
                                    isOpen={this.state.lightboxIsOpen}
                                    className="taviewer-carousel"
                                    onClose={this.closeLightbox}
                                    onClick={this.openLightbox}
                                    imageInfo={imageInfo} />

                            </div>
                        </Panel> : null}

                    {siteCount > 0 ?
                        <Panel header={`Wikipedia sites (${siteCount})`}>{this.renderWikidataWikipedia(wdEntityIDs)}</Panel>
                        : null}
                    {languageCount > 0 ?
                        <Panel header={`Translations (${languageCount})`} >{this.renderWikidataLanguage(wdEntityIDs)}</Panel>
                        : null}
                </Collapse>
                {lightboxIsOpen ? <DetailLightbox
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


function DetailLinksBase(props) {
    const { label, baseUrl, value, target } = props;

    if (value === null || value.length === 0) {
        return null;
    }
    return (
        <div className="taviewer-detail-row">
            <div className="taviewer-detail-key">{label}:</div>
            <div className="taviewer-detail-value">
                {value.map((x, i) => {
                    const href = `${baseUrl}${encodeURIComponent(x)}`;
                    return <div key={i}><a href={href} target={target}>{x}</a></div>;
                })}
            </div>
        </div>
    )
}

function DetailLinks(props) {
    const { label, value, target } = props;

    if (value === null || value.length === 0) {
        return null;
    }
    return (
        <div className="taviewer-detail-row">
            <div className="taviewer-detail-key">{label}:</div>
            <div className="taviewer-detail-value">
                {value.map((x, i) => {
                    return <div key={i}><a href={x[1]} target={target}>{x[0]}</a></div>;
                })}
            </div>
        </div>
    )
}

function DetailRow(props) {
    const { label, value } = props;

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

class DetailGallery extends Component {
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
class DetailLightbox extends Component {
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
            imageInfo = _.unionBy(imageInfo, wikiInfo.imageInfo, 'url');
        }
    }
    return imageInfo;
}


export default TADetailViewer;
