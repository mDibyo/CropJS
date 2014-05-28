CropJS
======
This is a JavaScript widget that adds end-user cropping functionality to any image on a webpage with a number of configurable options. It makes use of the KineticJS library. The interface works with mouse as well as touch.

The interface lets people select any region whcih can then be dragged and resized with customizable handles. The selected region can be dropped simply by selecting a new region with the mouse.

Check out the demos for examples of how to use this widget. Also, look at the documentation in js/crop.js.

### Configurable settings (required/optional)

The CropJS object can be created wehen the image is loaded or before. It is created with a config object which takes the following parameters
- ``` imageContainerID ``` **(required)**: The id of the div element (NOT canvas element) in which you would like the canvas to be created
- ``` image ```/ ``` imageSrc ``` **(required)**: If the image has already been loaded and CropJs is called in the onload function of the image, then the Image object should be passed in as image, otherwise the filepath of the image should be passed in as imageSrc. In the latter case, CropJS will automatically load the image first.
- ``` width ``` (optional): The preferred width of the displayed canvas/image. By default, the true width of the image is used.
- ``` height ``` (optional): The preferred height of the displayed canvas/image. By defaut, the true height of the image is used.


    
