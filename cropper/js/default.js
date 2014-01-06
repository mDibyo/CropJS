function CropJS(cropObject) {

    var that = this

    // Check if required/optional attributes are present
    for (var attr in cropObject) this[attr] = cropObject[attr];
    if (!this.imageSrc) {
        console.log("required attribute imageSrc not defined");
        return;
    }
    if (!this.imageContainerID) {
        console.log("required attribute imageContainerID not defined");
        return;
    }
    if (!this.selectionRectangleColor) this.selectionRectangleColor = 'black';

    // Setup canvas with KinecticJS
    this.background = new Image();
    this.background.src = this.imageSrc;
    this.background.onload = function () {
        that._initStage();
    }

} 


CropJS.prototype = {

    _initStage: function() {

        if (!this.width) this.width = this.background.width;
        if (!this.height) this.height = this.background.height;
        if (this.cropEdges) {
            if (this.cropEdges.leftX < 1 && this.cropEdges.rightX < 1) {
                this.cropEdges.leftX *= this.width;
                this.cropEdges.rightX *= this.width;
            }
            if (this.cropEdges.topY < 1 && this.cropEdges.bottomY < 1) {
                this.cropEdges.topY *= this.height;
                this.cropEdges.bottomY *= this.height;
            }
        }

        this._stage = new Kinetic.Stage({
            container: this.imageContainerID,
            width: this.width,
            height: this.height,
        });

        this._staticLayer = new Kinetic.Layer();
        this._bgImage = new Kinetic.Image({
            x: 0,
            y: 0,
            image: this.background,
            width: this.width,
            height: this.height,
        });
        this._staticLayer.add(this._bgImage);
        this._stage.add(this._staticLayer);

        this._dynamicLayer = new Kinetic.Layer();

        this._fullMask = new Kinetic.Rect({
            x: 0,
            y: 0,
            width: this.width,
            height: this.height,
            fill: 'black',
            opacity: 0.4,
        });
        this._dynamicLayer.add(this._fullMask);
        this._stage.add(this._dynamicLayer);
        if (this.cropEdges) {
            this._setupSelectionRectangle();
            this._addSelectionRectangle();
        }
        
    },

    _initSelectionRectangle: function() {

        if (!this.cropEdges) return;

        this._fullMask.remove();

        // Selection Rectangle
        this._selectionRectangle = new Kinetic.Rect({
            x: this.cropEdges.leftX,
            y: this.cropEdges.topY,
            width: this.cropEdges.rightX - this.cropEdges.leftX,
            height: this.cropEdges.bottomY - this.cropEdges.topY,
        });
        this._selectionRectangle
            .on('mouseover', function () {
                document.body.style.cursor = 'move';
            })
            .on('mouseout', function () {
                document.body.style.cursor = 'default';
            });
        
        // Toggles
        if (!this.toggleSize) this.toggleSize = 8;
        this._toggleTopLeft = new Kinetic.Rect({
            x: this.cropEdges.leftX - this.toggleSize / 2,
            y: this.cropEdges.topY - this.toggleSize / 2,
            width: this.toggleSize,
            height: this.toggleSize,
            fill: this.selectionRectangleColor,
        });
        this._toggleTopLeft
            .on('mouseover', function () {
                document.body.style.cursor = 'nw-resize';
            })
            .on('mouseout', function () {
                document.body.style.cursor = 'default';
            });
        this._toggleTopRight = new Kinetic.Rect({
            x: this.cropEdges.rightX - this.toggleSize / 2,
            y: this.cropEdges.topY - this.toggleSize / 2,
            width: this.toggleSize,
            height: this.toggleSize,
            fill: this.selectionRectangleColor,
        });
        this._toggleTopRight
            .on('mouseover', function () {
                document.body.style.cursor = 'ne-resize';
            })
            .on('mouseout', function () {
                document.body.style.cursor = 'default';
            });
        this._toggleBottomLeft = new Kinetic.Rect({
            x: this.cropEdges.leftX - this.toggleSize / 2,
            y: this.cropEdges.bottomY - this.toggleSize / 2,
            width: this.toggleSize,
            height: this.toggleSize,
            fill: this.selectionRectangleColor,
        });
        this._toggleBottomLeft
            .on('mouseover', function () {
                document.body.style.cursor = 'sw-resize';
            })
            .on('mouseout', function () {
                document.body.style.cursor = 'default';
            });
        this._toggleBottomRight = new Kinetic.Rect({
            x: this.cropEdges.rightX - this.toggleSize / 2,
            y: this.cropEdges.bottomY - this.toggleSize / 2,
            width: this.toggleSize,
            height: this.toggleSize,
            fill: this.selectionRectangleColor,
        });
        this._toggleBottomRight
            .on('mouseover', function () {
                document.body.style.cursor = 'se-resize';
            })
            .on('mouseout', function () {
                document.body.style.cursor = 'default';
            });
        
        // Masks
        this._maskLeft = new Kinetic.Rect({
            x: 0,
            y: 0,
            width: this.cropEdges.leftX,
            height: this.height,
            fill: 'black',
            opacity: 0.4,
        });
        this._maskLeft
            .on('mouseover', function () {
                document.body.style.cursor = 'crosshair';
            })
            .on('mouseout', function () {
                document.body.style.cursor = 'default';
            });
        this._maskRight = new Kinetic.Rect({
            x: this.cropEdges.rightX,
            y: 0,
            width: this.width - this.cropEdges.rightX,
            height: this.height,
            fill: 'black',
            opacity: 0.4,
        });
        this._maskRight
            .on('mouseover', function () {
                document.body.style.cursor = 'crosshair';
            })
            .on('mouseout', function () {
                document.body.style.cursor = 'default';
            });
        this._maskTop = new Kinetic.Rect({
            x: this.cropEdges.leftX,
            y: 0,
            width: this.cropEdges.rightX - this.cropEdges.leftX,
            height: this.cropEdges.topY,
            fill: 'black',
            opacity: 0.4,
        });
        this._maskTop
            .on('mouseover', function () {
                document.body.style.cursor = 'crosshair';
            })
            .on('mouseout', function () {
                document.body.style.cursor = 'default';
            });
        this._maskBottom = new Kinetic.Rect({
            x: this.cropEdges.leftX,
            y: this.cropEdges.bottomY,
            width: this.cropEdges.rightX - this.cropEdges.leftX,
            height: this.height - this.cropEdges.bottomY,
            fill: 'black',
            opacity: 0.4,
        });
        this._maskBottom
            .on('mouseover', function () {
                document.body.style.cursor = 'crosshair';
            })
            .on('mouseout', function () {
                document.body.style.cursor = 'default';
            });

    },

    _addSelectionRectangle: function() {
        
        // Add to stage
        this._dynamicLayer.add(this._maskLeft);
        this._dynamicLayer.add(this._maskRight);
        this._dynamicLayer.add(this._maskTop);
        this._dynamicLayer.add(this._maskBottom);
        this._dynamicLayer.add(this._selectionRectangle);
        this._dynamicLayer.add(this._toggleTopLeft);
        this._dynamicLayer.add(this._toggleTopRight);
        this._dynamicLayer.add(this._toggleBottomLeft);
        this._dynamicLayer.add(this._toggleBottomRight); 

        this._dynamicLayer.draw();

    },

    _removeSelectionRectangle: function() {

        this._selectionRectangle.remove();
        this._toggleTopLeft.remove();
        this._toggleTopRight.remove();
        this._toggleBottomLeft.remove();
        this._toggleBottomRight.remove();
        this._maskLeft.remove();
        this._maskRight.remove();
        this._maskTop.remove();
        this._maskBottom.remove();

    },

    setCursor: function(cursorStyle) {
        document.getElementById(this.imageContainerID).style.cursor = cursorStyle;
    },

    cut: function () {
        console.log("This is the cut function");
    },

};