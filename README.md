![TAViewer Screenshot](https://raw.githubusercontent.com/mhalle/taviewer/master/screenshot/taviewer1.png)

**[http://ta98.openanatomy.org/](http://ta98.openanatomy.org/)**

TAViewer is a web-based anatomy atlas term viewer based developed by the Open Anatomy Project at the Brigham and Women's Hospital in Boston.  It uses data from Terminologia Anatomica, or TA98, a standard for anatomical naming created by anatomists. It also cross-references TA98 terms with data from Wikipedia and Wikidata.

## Background

The Terminologia Anatomica standard is the successor to  Nomina Anatomica, published in 1895, which was the first modern standard for the naming of structures within the human body.  The first edition of Terminologia Anatomica, TA98, was published by the  Federative Committee on Anatomical Terminology (FCAT) and the 
[International Federation of Associations of Anatomists (IFAA)](http://www.ifaa.net/). It is currently maintained by the [Federative International Programme for Anatomical Terminology (FIPAT)](http:/http://fipat.library.dal.ca/).


Unlike other organized collections of anatomical terms, TA98 and its sister standards are organized around anatomical principles rather than ontological ones.  This makes TA98 an excellent tool for labeling and understanding the organization of the human body in a way that makes sense to physicians.

Unfortunately, TA98 is primarily available in book form, which greatly limits its use for digital purposes.  There is an online viewer for the standard at the [IFAA site at the University of Fribourg](https://www.unifr.ch/ifaa/). Unfortunately, this site  has obsolete Flash-based hierarchy viewers that no longer work on modern browsers. 

To make the TA98 data more accessible for digital atlasing, I ([Michael Halle](mailto:mhalle@bwh.harvard.edu)) of the Surgical Planning Lab at the Brigham and Women's Hospital in Boston crawled the [HTML version of the TA98 web pages](https://www.unifr.ch/ifaa/Public/EntryPage/TA98%20Tree/Alpha/All%20KWIC%20EN.htm) and created a database of all the terms and their properties.  This project can be found in the [ta98-sqlite GitHub repository](https://github.com/mhalle/ta98-sqlite).

I then developed [TAViewer](https://github.com/mhalle/ta98viewer) to recreate some of the functionality of the IFAA's Flash viewers. TAViewer uses TA98 codes embedding in WikiData and Wikipedia to provide images, translations, and internationalized Wikipedia access for thousands of TA98 terms.  

This project simply would not have been possible without the work of the IFAA and the Wikipedia volunteers who associated TA98 codes with thousands of articles.

## Licensing

Despite my best efforts to find out the licensing terms of the online content of TA98, I have failed to establish the terms of use (there is nothing available on the web site that I could find).  I am happy to work with the IFAA and its members to fully comply with any intellectual property claims that may exist. 

It appears that later atlases from the IFAA such as [Terminologia Neuroanatomica (TNA)](http://fipat.library.dal.ca/tna/) fall under a Creative Commons Attribution-NoDerivatives 4.0 International License, with individual terms being public domain.  Unfortunately, the TNA is currently only available to the general public as PDF files rather than as an accessible database.

I urge the IFAA to make these compelling, useful standards available in a machine-readable form so they can be adopted and used by the widest possible community.

TAViewer itself is licensed under the MIT License.

## Funding

TAViewer is part of the Open Anatomy project, which is in turn part of the [Neuroimaging Analysis Center (NAC)](http://nac.spl.harvard.edu/), an NIH-funded national resource center dedicated to understanding the human brain through imaging (NIH grant P41EB015902).
