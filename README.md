![TAViewer Screenshot](https://raw.githubusercontent.com/mhalle/taviewer/master/screenshot/taviewer1.png)

**[https://taviewer.openanatomy.org/](https://taviewer.openanatomy.org/)**

TAViewer is a web-based anatomy atlas term viewer based developed by the Open Anatomy Project at the Brigham and Women's Hospital in Boston.  It uses data from Terminologia Anatomica, published in 1998, a standard for anatomical naming created by anatomists. It also cross-references TA98 terms with data from Wikipedia and Wikidata.

## Background

The Terminologia Anatomica standard is the successor to  Nomina Anatomica, published in 1895, which was the first modern standard for the naming of structures within the human body.  The first edition of Terminologia Anatomica was published in 1998 by the Federative Committee on Anatomical Terminology (FCAT) and the 
[International Federation of Associations of Anatomists (IFAA)](http://www.ifaa.net/). It is currently maintained by the [Federative International Programme for Anatomical Terminology (FIPAT)](http:/http://fipat.library.dal.ca/).

Unlike other organized collections of anatomical terms, TA98 and its sister standards are organized around anatomical principles rather than ontological ones.  This makes TA98 an excellent tool for labeling and understanding the organization of the human body in a way that makes sense to physicians.

Unfortunately, TA is primarily available in book form, which has limited its use for digital purposes.  There is an online viewer for the standard at the [IFAA site at the University of Fribourg](https://www.unifr.ch/ifaa/). Unfortunately, this project was never fully completed and contains unapproved changes to the official TA standard.  The site also uses a Flash-based hierarchy viewer, which unfortunately requires the Flash plugin that is no longer supported for many modern browsers.

I developed [TAViewer](https://github.com/mhalle/ta98viewer) to demonstrate some of the features of the TA system, in part as a substitute for the Flash-based viewer.  TAViewer uses TA codes embedded in WikiData and Wikipedia to provide images, translations, and internationalized Wikipedia access for thousands of TA terms.  

This project simply would not have been possible without the work of the IFAA and the Wikipedia volunteers who associated TA98 codes with thousands of articles.

## Licensing

During my initial exploration of TA and the development of the TA viewer, I was unable to assertain the licensing or copyright restrictions on the TA data. Since that time, I have been in touch with leadership within FIPAT and we are discussing the details of the availability of this software. 

Looking to the future, the FIPAT web site indicates the progress is being made on TA2, a successor to TA, as well as [Terminologia Neuroanatomica (TNA)](http://fipat.library.dal.ca/tna/), a neuroanatomy vocabulary. These new works are planned to be released under the Creative Commons Attribution-NoDerivatives 4.0 International License, with individual terms being public domain.  The release and distribution of machine-readable versions of this valuable and useful resource are still under discussion within FIPAT. 

I wish to thank FIPAT again for bringing this unique work to the greater medical and education community.

TAViewer itself is licensed under the MIT License.

## Funding

TAViewer is part of the Open Anatomy project, which is in turn part of the [Neuroimaging Analysis Center (NAC)](http://nac.spl.harvard.edu/), an NIH-funded national resource center dedicated to understanding the human brain through imaging (NIH grant P41EB015902).
