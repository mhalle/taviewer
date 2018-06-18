import wdk from 'wikidata-sdk/dist/wikidata-sdk';
import _ from 'lodash';
import { Component } from 'react';


const getSitelinkUrl = wdk.getSitelinkUrl;



function getEntityClaimValues(entity, propId) {
    const claimEntry = _.get(entity, ['claims', propId], null);
    if (!claimEntry) {
        return null;
    }
    const values = _.compact(_.map(claimEntry, valueInfo =>
        _.get(valueInfo, ['mainsnak', 'datavalue', 'value'], null)));
    return values;
}

function getWikipedia(entity, wiki) {
    wiki = wiki || 'enwiki';
    const wikiEntry = _.get(entity, `sitelinks.${wiki}`, null);
    if (wikiEntry === null) {
        return null;
    }
    const wikiUrl = wdk.getSitelinkUrl(wikiEntry);
    return [wikiEntry.title, wikiUrl];
}

function getGraysAnatomyInfo(entityData) {
    const info = _.chain(entityData)
        .get(['claims', 'P1343'])
        .filter([['mainsnak', 'datavalue', 'value', 'numeric-id'], 19558994])
        .map(x => ({
            page: _.get(x, ['qualifiers', 'P304', 0, 'datavalue', 'value']),
            url: _.get(x, ['references', 0, 'snaks', 'P854', 0, 'datavalue', 'value'])
        }))
        .value();
    return info;
}

class Wikidata extends Component {
    pending = {};
    cache = {};
    onValue = (id, e) => {
        if (this.props.onValue) {
            this.props.onValue(id, e);
        }
    }
    wikidataEntityQuery(entityID) {
        this.pending[entityID] = true;

        const queryUrl = wdk.getEntities([entityID], null,
            null);
        fetch(queryUrl)
            .then(res => {
                if (!res.ok) {
                    throw new Error('bad network response');
                }
                return res.json();
            })
            .then(doc => {
                return doc['entities'][entityID];
            })
            .then(entity => {
                this.pending[entityID] = false;
                this.cache[entityID] = entity;

                this.onValue(entityID, entity);
                return entity;

            }).catch((err) => {
                this.pending[entityID] = false;
            });
    }

    componentDidMount() {
        const { entityIDs } = this.props;
        _.forEach(entityIDs, entityID => {
            setTimeout(this.wikidataEntityQuery(entityID), 1);
        });
    }

    componentDidUpdate(prevProps) {
        if (_.isEqual(prevProps, this.props)) {
            return;
        }
        const { entityIDs } = this.props;
        _.forEach(entityIDs, entityID => {
            if (this.pending[entityID]) {
                return;
            }
            if (_.has(this.cache, entityID)) {
                setTimeout(() => this.onValue(entityID, this.cache[entityID]), 1);
                return null;
            }
            setTimeout(this.wikidataEntityQuery(entityID), 1);
        });
    }

    render() {
        return null;
    }
}
export default {
    Wikidata,
    getWikipedia,
    getEntityClaimValues,
    getSitelinkUrl,
    getGraysAnatomyInfo
};