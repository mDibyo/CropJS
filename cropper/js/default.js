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
    if (!this.selectionRectangleColor) this.selectionRectangleColor = 'white';

    // Setup canvas with KinecticJS
    this.background = new Image();
    this.background.src = this.imageSrc;
    this.background.onload = function () {
        that._initStage();
    }

} 


CropJS.prototype = {

    _mouse: false,

    _initStage: function() {

        if (!this.width) this.width = this.background.width;
        if (!this.height) this.height = this.background.height;
        if (this.cropEdges) {
            var that = this;
            this.cropEdges.normalize = function() {
                if (this.leftX < 1 && this.rightX < 1) {
                    this.leftX *= that.width;
                    this.rightX *= that.width;
                }
                if (this.topY < 1 && this.bottomY < 1) {
                    this.topY *= that.height;
                    this.bottomY *= that.height;
                }
            }
            this.cropEdges.normalize();
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
            opacity: 0.6,
        })
        .on('mouseover', function () {
            document.body.style.cursor = 'crosshair';
        })
        .on('mouseout', function () {
            document.body.style.cursor = 'default';
        });
        this._dynamicLayer.add(this._fullMask);
        this._stage.add(this._dynamicLayer);
        if (this.cropEdges) {
            this._initSelectionRectangle();
            this._addSelectionRectangle();
            this._addDragListeners();
        }
        
    },

    _initSelectionRectangle: function() {

        if (!this.cropEdges) return;

        this._fullMask.remove();
        var that = this;

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
        
        // Crop Handles
        if (!this.handleSize) this.handleSize = 10;
        console.log(this);

        this._handles = {

            size: this.handleSize,

            topLeft: new Kinetic.Rect({
                x: this.cropEdges.leftX - this.handleSize / 2,
                y: this.cropEdges.topY - this.handleSize / 2,
                width: this.handleSize,
                height: this.handleSize,
                fill: this.selectionRectangleColor,
                mouse: false,
            })
                .on('mouseover', function () {
                    document.body.style.cursor = 'nw-resize';
                })
                .on('mouseout', function () {
                    document.body.style.cursor = 'default';
                })
                .on('mousedown touchstart', function () {
                    if (that._mouse) return;
                    that._mouse = true;
                    this.attrs.mouse = true;
                    console.log("topLeft mousedown");
                })
                .on('mousemove touchmove', function () {
                    if (!that._mouse) return;
                    that.cropEdges.leftX = that._stage.getPointerPosition().x;
                    that.cropEdges.topY = that._stage.getPointerPosition().y;
                    console.log("topLeft mousemove");
                })
                .on('mouseup touchend', function () {
                    if (!that._mouse) return;
                    that._mouse = false;
                    this.attrs.mouse = false;
                    console.log("topLeft mouseup");
                }),

            topRight: new Kinetic.Rect({
                x: this.cropEdges.rightX - this.handleSize / 2,
                y: this.cropEdges.topY - this.handleSize / 2,
                width: this.handleSize,
                height: this.handleSize,
                fill: this.selectionRectangleColor,
                mouse: false,
            })
                .on('mouseover', function () {
                    document.body.style.cursor = 'ne-resize';
                })
                .on('mouseout', function () {
                    document.body.style.cursor = 'default';
                })
                .on('mousedown touchstart', function () {
                    if (that._mouse) return;
                    that._mouse = true;
                    this.attrs.mouse = true;
                    console.log("topRight mousedown");
                })
                .on('mousemove touchmove', function () {
                    if (!that._mouse) return;
                    that.cropEdges.rightX = that._stage.getPointerPosition().x;
                    that.cropEdges.topY = that._stage.getPointerPosition().y;
                    console.log("topRight mousemove");
                })
                .on('mouseup touchend', function () {
                    if (!that._mouse) return;
                    that._mouse = false;
                    this.attrs.mouse = false;
                    console.log("topRight mouseup");
                }),

            bottomLeft: new Kinetic.Rect({
                x: this.cropEdges.leftX - this.handleSize / 2,
                y: this.cropEdges.bottomY - this.handleSize / 2,
                width: this.handleSize,
                height: this.handleSize,
                fill: this.selectionRectangleColor,
                mouse: false,
            })
                .on('mouseover', function () {
                    document.body.style.cursor = 'sw-resize';
                })
                .on('mouseout', function () {
                    document.body.style.cursor = 'default';
                })
                .on('mousedown touchstart', function () {
                    if (that._mouse) return;
                    that._mouse = true;
                    this.attrs.mouse = true;
                    console.log("bottomLeft mousedown");
                })
                .on('mousemove touchmove', function () {
                    if (!that._mouse) return;
                    that.cropEdges.leftX = that._stage.getPointerPosition().x;
                    that.cropEdges.bottomY = that._stage.getPointerPosition().y;
                    console.log("bottomLeft mousemove");
                })
                .on('mouseup touchend', function () {
                    if (!that._mouse) return;
                    that._mouse = false;
                    this.attrs.mouse = false;
                    console.log('bottomLeft mouseup');
                }),

            bottomRight: new Kinetic.Rect({
                x: this.cropEdges.rightX - this.handleSize / 2,
                y: this.cropEdges.bottomY - this.handleSize / 2,
                width: this.handleSize,
                height: this.handleSize,
                fill: this.selectionRectangleColor,
                mouse: false,
            })
                .on('mouseover', function () {
                    document.body.style.cursor = 'se-resize';
                })
                .on('mouseout', function () {
                    document.body.style.cursor = 'default';
                })
                .on('mousedown touchstart', function () {
                    if (that._mouse) return;
                    that._mouse = true;
                    this.attrs.mouse = true;
                    console.log("bottomRight mousedown");
                })
                .on('mousemove touchmove', function () {
                    if (!that._mouse) return;
                    that.cropEdges.rightX = that._stage.getPointerPosition().x;
                    that.cropEdges.bottomY = that._stage.getPointerPosition().y;
                    console.log("bottomRight mousemove");
                })
                .on('mouseup touchend', function () {
                    if (!that._mouse) return;
                    that._mouse = false;
                    this.attrs.mouse = false;
                    console.log("bottomRight mouseup");
                }),

            add: function () {
                that._dynamicLayer.add(this.topLeft);
                that._dynamicLayer.add(this.topRight);
                that._dynamicLayer.add(this.bottomLeft);
                that._dynamicLayer.add(this.bottomRight);
            },

        }
        
        // Masks
        if (!this.opacity) this.opacity = 0.6;
        this._masks = {
  
            left: new Kinetic.Rect({
                x: 0,
                y: 0,
                width: this.cropEdges.leftX,
                height: this.height,
                fill: 'black',
                opacity: this.opacity,
            })
                .on('mouseover', function () {
                    document.body.style.cursor = 'crosshair';
                })
                .on('mouseout', function () {
                    document.body.style.cursor = 'default';
                }),

            right: new Kinetic.Rect({
                x: this.cropEdges.rightX,
                y: 0,
                width: this.width - this.cropEdges.rightX,
                height: this.height,
                fill: 'black',
                opacity: this.opacity,
            })
                .on('mouseover', function () {
                    document.body.style.cursor = 'crosshair';
                })
                .on('mouseout', function () {
                    document.body.style.cursor = 'default';
                }),

            top: new Kinetic.Rect({
                x: this.cropEdges.leftX,
                y: 0,
                width: this.cropEdges.rightX - this.cropEdges.leftX,
                height: this.cropEdges.topY,
                fill: 'black',
                opacity: this.opacity,
            })
                .on('mouseover', function () {
                    document.body.style.cursor = 'crosshair';
                })
                .on('mouseout', function () {
                    document.body.style.cursor = 'default';
                }),

            bottom: new Kinetic.Rect({
                x: this.cropEdges.leftX,
                y: this.cropEdges.bottomY,
                width: this.cropEdges.rightX - this.cropEdges.leftX,
                height: this.height - this.cropEdges.bottomY,
                fill: 'black',
                opacity: this.opacity,
            })
                .on('mouseover', function () {
                    document.body.style.cursor = 'crosshair';
                })
                .on('mouseout', function () {
                    document.body.style.cursor = 'default';
                }),

            add: function () {
                that._dynamicLayer.add(this.left);
                that._dynamicLayer.add(this.right);
                that._dynamicLayer.add(this.top);
                that._dynamicLayer.add(this.bottom);
            },

        }
    },

    _addSelectionRectangle: function() {
        
        var that = this;

        this._masks.add()
        this._dynamicLayer.add(this._selectionRectangle);
        this._handles.add();
        this._dynamicLayer.draw();

        this._stage.on('mousemove touchmove', function () {

            // Handle when selection is inverted
            if (that.cropEdges.leftX > that.cropEdges.rightX) {
                // Swap edges
                var temp = that.cropEdges.leftX;
                that.cropEdges.leftX = that.cropEdges.rightX;
                that.cropEdges.rightX = temp;
                // Swap handles
                temp = that._handles.topLeft.attrs.mouse;
                that._handles.topLeft.attrs.mouse = that._handles.topRight.attrs.mouse;
                that._handles.topRight.attrs.mouse = temp;
                temp = that._handles.bottomLeft.attrs.mouse;
                that._handles.bottomLeft.attrs.mouse = that._handles.bottomRight.attrs.mouse;
                that._handles.bottomRight.attrs.mouse = temp;
            }
            if (that.cropEdges.topY > that.cropEdges.bottomY) {
                // Swap edges
                var temp = that.cropEdges.topY;
                that.cropEdges.topY = that.cropEdges.bottomY;
                that.cropEdges.bottomY = temp;
                // Swap handles
                temp = that._handles.topLeft.attrs.mouse;
                that._handles.topLeft.attrs.mouse = that._handles.bottomLeft.attrs.mouse;
                that._handles.bottomLeft.attrs.mouse = temp;
                temp = that._handles.topRight.attrs.mouse;
                that._handles.topRight.attrs.mouse = that._handles.bottomRight.attrs.mouse;
                that._handles.bottomRight.attrs.mouse = temp;
            }

            // Implement handles
            if (that._handles.topLeft.attrs.mouse) that._handles.topLeft.fire('mousemove');
            if (that._handles.topRight.attrs.mouse) that._handles.topRight.fire('mousemove');
            if (that._handles.bottomLeft.attrs.mouse) that._handles.bottomLeft.fire('mousemove');
            if (that._handles.bottomRight.attrs.mouse) that._handles.bottomRight.fire('mousemove');

            // Implement selected region

            // Implement unselected region

            that._updateSelectionRectangle();

        });

    },

    _addDragListeners: function() {

        var mouse = false;
        var that = this;
        

    },

    _removeSelectionRectangle: function() {

        this._selectionRectangle.remove();
        this._handleTopLeft.remove();
        this._handleTopRight.remove();
        this._handleBottomLeft.remove();
        this._handleBottomRight.remove();
        this._maskLeft.remove();
        this._maskRight.remove();
        this._maskTop.remove();
        this._maskBottom.remove();

    },

    
    _updateSelectionRectangle: function () {

        // Convenience variables
        var rect = this._selectionRectangle,
            handles = this._handles,
            masks = this._masks,
            edges = this.cropEdges;

        // Update Rectangle
        rect.setX(edges.leftX);
        rect.setY(edges.topY);
        rect.setWidth(edges.rightX - edges.leftX);
        rect.setHeight(edges.bottomY - edges.topY);

        // Update handles
        handles.topLeft.setX(edges.leftX - this.handleSize / 2);
        handles.topLeft.setY(edges.topY - this.handleSize / 2);
        handles.topRight.setX(edges.rightX - this.handleSize / 2);
        handles.topRight.setY(edges.topY - this.handleSize / 2);
        handles.bottomLeft.setX(edges.leftX - this.handleSize / 2);
        handles.bottomLeft.setY(edges.bottomY - this.handleSize / 2);
        handles.bottomRight.setX(edges.rightX - this.handleSize / 2);
        handles.bottomRight.setY(edges.bottomY - this.handleSize / 2);

        // Update Masks
        masks.top.setX(edges.leftX);
        masks.top.setWidth(edges.rightX - edges.leftX);
        masks.top.setHeight(edges.topY);
        masks.bottom.setX(edges.leftX);
        masks.bottom.setY(edges.bottomY);
        masks.bottom.setWidth(edges.rightX - edges.leftX);
        masks.bottom.setHeight(this._stage.attrs.height - edges.bottomY);
        masks.left.setWidth(edges.leftX);
        masks.right.setX(edges.rightX);
        masks.right.setWidth(this._stage.attrs.width - edges.rightX);

        // draw Layer
        this._dynamicLayer.draw();

    },

    setCursor: function(cursorStyle) {
        document.getElementById(this.imageContainerID).style.cursor = cursorStyle;
    },

    cut: function () {
        console.log("This is the cut function");
    },

};