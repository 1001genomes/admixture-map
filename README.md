The 1001 Genomes Admixture Map
==
The [1001 Genomes Admixture Map](http://gregor-mendel-institute.github.io/1001-admixture-map/) is an interactive web-based tool, that allows to interactively explore the fine-scale picture of population structure for the 1135 _A. thaliana_ accession that are part of the [1001 genomes project](http://1001genomes.org/).  

The data was generated using the software package [ADMIXTURE](https://www.genetics.ucla.edu/software/admixture/) and stored in a [Fusion table](https://www.google.com/fusiontables/DataSource?docid=11w8bumbRj9R-lmdPa4tBCrf_7VDloDTG5jJTPg-w). 

![Admixture-map](https://raw.githubusercontent.com/Gregor-Mendel-Institute/1001-admixture-map/master/preview.png "1001 Genomes Admixture Map")

For each accession a piechart is displayed. The slices correspond to the various fractions of the ADMIXTURE cluster.  
Users can change the number of clusters K by clicking on the gear icon in the top left corner (by default data for K=8 is shown).



Because of the number of accessions (1135) nearby accessions are clustered together and an averaged piechart is displayed. The number inside the piechart shows the number of accessions that are clustered together. Clicking on a cluster will zoom into the region and display piecharts for individual accessions or smaller clusters.  

The list on the left side shows all accessions that are visible in the current view. Zooming into specific regions either by clicking on a cluster or using the Google Maps zoom control will update the list. 
Hovering the mouse over a cluster will filter the list to display only the accessions that are part of the corresponding cluster and in addition to show a popup with a more detailed version of the piechart.

Hovering the mouse over an accession in the list will display a pin on the map at its location and clicking on the list item will zoom into that position.  
A searchbox above the list allows the user to search for a specific accession using either the ID or the name. 
