const MeshBaseUrl = 'https://meshb.nlm.nih.gov/#/record/ui?ui=';
const NeuroNamesBaseUrl = 'http://braininfo.rprc.washington.edu/centraldirectory.aspx?ID=';
const UBERONBaseUrl = 'http://purl.obolibrary.org/obo/UBERON_';
const UMLSBaseUrl = 'https://ncim-stage.nci.nih.gov/ncimbrowser/ConceptReport.jsp?dictionary=NCI%20Metathesaurus&code=';

const wikidataFields = [
    {
        label: "Mesh ID",
        wikidataProperty: "P486",
        url: (x) => MeshBaseUrl + x
    },
    {
        label: "NeuroNames ID",
        wikidataProperty: "P4394",
        url: (x) => NeuroNamesBaseUrl + x
    },
    {
        label: "UBERON ID",
        wikidataProperty: 'P1554',
        url: (x) => UBERONBaseUrl + x
    },
    {
        label: "UMLS CUI",
        wikidataProperty: "P2892",
        url: (x) => UMLSBaseUrl + x
    }
]

export default wikidataFields;