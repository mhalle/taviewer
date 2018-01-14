import wdk from 'wikidata-sdk';
import _ from 'lodash';
import { Component } from 'react';


const getSitelinkUrl = wdk.getSitelinkUrl;

class Wikidata extends Component {
    state = {
        cache: {},
        pending: {}
    }

    onValue = (id, e) => {
        if(this.props.onValue) {
            this.props.onValue(id, e);
        }
    }
    wikidataEntityQuery(entityID) {
        let pendingMod = {
            [entityID]: true
        };
        this.setState({pending: _.assign({}, this.state.pending, pendingMod)});

        const queryUrl = wdk.getEntities([entityID], null,
            ['labels', 'descriptions', 'aliases', 'sitelinks']);
        pendingMod[entityID] = true;
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
                const pendingMod = {
                    [entityID]: false
                };
                const cacheMod = {
                    [entityID]: entity
                };
                this.setState({ 
                    cache: _.assign({}, this.state.cache, cacheMod),
                    pending: _.assign({}, this.state.pending, pendingMod)
                });
                this.onValue(entityID, entity);
                return entity;

            }).catch((err) => {
                const pendingMod = {
                    [entityID]: false
                };
                this.setState({pending: _.assign({}, this.state.pending, pendingMod)});
            });
    }

    componentDidMount() {
        console.log('cdm');
        const { entityIDs } = this.props;
        _.forEach(entityIDs, entityID => {
            setTimeout(this.wikidataEntityQuery(entityID), 1);
        });
    }

    componentWillReceiveProps(newProps) {
        if(_.isEqual(newProps, this.props)) {
            return;
        }
        const { entityIDs } = newProps;
        _.forEach(entityIDs, entityID => {
            if (this.state.pending[entityID]){
                return;
            }
            if (_.has(this.state.cache, entityID)) {
                setTimeout(() => this.onValue(entityID, this.state.cache[entityID]), 1);
                return null;
            }
            setTimeout(this.wikidataEntityQuery(entityID), 1);
        });
    }

    render() {
        console.log('render');
        return null;
    }
}
export {Wikidata, getSitelinkUrl};