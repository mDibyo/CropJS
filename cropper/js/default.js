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

    cropEdges: undefined,

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

        this._selectionRectangle = {

            rect: new Kinetic.Rect({
                x: this.cropEdges.leftX,
                y: this.cropEdges.topY,
                width: this.cropEdges.rightX - this.cropEdges.leftX,
                height: this.cropEdges.bottomY - this.cropEdges.topY,
            })
                .on('mouseover', function () {
                    document.body.style.cursor = 'move';
                })
                .on('mouseout', function () {
                    document.body.style.cursor = 'default';
                }),

            add: function () {
                // Add the selected region to the canvas
                that._dynamicLayer.add(this.rect);
            },

            remove: function() {
                this.rect.remove();
            },

            update: function () {
                // Update the selected region
                var edges = that.cropEdges;
                this.rect.setX(edges.leftX);
                this.rect.setY(edges.topY);
                this.rect.setWidth(edges.rightX - edges.leftX);
                this.rect.setHeight(edges.bottomY - edges.topY);
            },
            
            
        }
        
        // Crop Handles
        if (!this.handleSize) this.handleSize = 10;
        console.log(this);

        this._handles = {

            size: this.handleSize,

            active: undefined,

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
                    if (that._handles.active != undefined &&
                        that._handles.active != 'topLeft') {
                        return;
                    }
                    that._handles.active = 'topLeft';
                    that._mouse = true;
                    console.log("topLeft mousedown");
                })
                .on('mousemove touchmove', function () {
                    if (!that._mouse) return;
                    if (that._handles.active != 'topLeft') return;
                    that.cropEdges.leftX = that._stage.getPointerPosition().x;
                    that.cropEdges.topY = that._stage.getPointerPosition().y;
                    console.log("topLeft mousemove");
                    console.log(that._handles.active);
                })
                .on('mouseup touchend', function () {
                    if (!that._mouse) return;
                    that._mouse = false;
                    that._handles.active = undefined;
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
                    if (that._handles.active != undefined &&
                        that._handles.active != 'topRight') {
                        return;
                    }
                    that._handles.active = 'topRight';
                    that._mouse = true;
                    console.log("topRight mousedown");
                })
                .on('mousemove touchmove', function () {
                    if (!that._mouse) return;
                    if (that._handles.active != 'topRight') return;
                    that.cropEdges.rightX = that._stage.getPointerPosition().x;
                    that.cropEdges.topY = that._stage.getPointerPosition().y;
                    console.log("topRight mousemove");
                    console.log(that._handles.active);
                })
                .on('mouseup touchend', function () {
                    if (!that._mouse) return;
                    that._mouse = false;
                    that._handles.active = undefined;
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
                    if (that._handles.active != undefined &&
                        that._handles.active != 'bottomLeft') {
                        return;
                    }
                    that._handles.active = 'bottomLeft';
                    that._mouse = true;
                    console.log("bottomLeft mousedown");
                })
                .on('mousemove touchmove', function () {
                    if (!that._mouse) return;
                    if (that._handles.active != 'bottomLeft') return;
                    that.cropEdges.leftX = that._stage.getPointerPosition().x;
                    that.cropEdges.bottomY = that._stage.getPointerPosition().y;
                    console.log("bottomLeft mousemove");
                    console.log(that._handles.active);
                })
                .on('mouseup touchend', function () {
                    if (!that._mouse) return;
                    that._mouse = false;
                    that._handles.active = undefined;
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
                    if (that._handles.active != undefined &&
                        that._handles.active != 'bottomRight') {
                        return;
                    }
                    that._handles.active = 'bottomRight';
                    that._mouse = true;
                    console.log("bottomRight mousedown");
                })
                .on('mousemove touchmove', function () {
                    if (!that._mouse) return;
                    if (that._handles.active != 'bottomRight') return;
                    that.cropEdges.rightX = that._stage.getPointerPosition().x;
                    that.cropEdges.bottomY = that._stage.getPointerPosition().y;
                    console.log("bottomRight mousemove");
                    console.log(that._handles.active);
                })
                .on('mouseup touchend', function () {
                    if (!that._mouse) return;
                    that._mouse = false;
                    that._handles.active = undefined;
                    console.log("bottomRight mouseup");
                }),

            add: function () {
                // Add crop handles to canvas
                that._dynamicLayer.add(this.topLeft);
                that._dynamicLayer.add(this.topRight);
                that._dynamicLayer.add(this.bottomLeft);
                that._dynamicLayer.add(this.bottomRight);
            },

            remove: function () {
                // Remove crop handles from canvas
                this.topLeft.remove();
                this.topRight.remove();
                this.bottomLeft.remove();
                this.bottomRight.remove();
            },

            update: function () {
                // Update crop handles
                var edges = that.cropEdges;
                this.topLeft.setX(edges.leftX - that.handleSize / 2);
                this.topLeft.setY(edges.topY - that.handleSize / 2);
                this.topRight.setX(edges.rightX - that.handleSize / 2);
                this.topRight.setY(edges.topY - that.handleSize / 2);
                this.bottomLeft.setX(edges.leftX - that.handleSize / 2);
                this.bottomLeft.setY(edges.bottomY - that.handleSize / 2);
                this.bottomRight.setX(edges.rightX - that.handleSize / 2);
                this.bottomRight.setY(edges.bottomY - that.handleSize / 2);
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
                // Add non-selected region to canvas
                that._dynamicLayer.add(this.left);
                that._dynamicLayer.add(this.right);
                that._dynamicLayer.add(this.top);
                that._dynamicLayer.add(this.bottom);
            },

            remove: function () {
                // Remove non-selected region from canvas
                this.left.remove();
                this.right.remove();
                this.top.remove();
                this.bottom.remove();
            },

            update: function () {
                // Update non-selected region
                var edges = that.cropEdges;
                this.top.setX(edges.leftX);
                this.top.setWidth(edges.rightX - edges.leftX);
                this.top.setHeight(edges.topY);
                this.bottom.setX(edges.leftX);
                this.bottom.setY(edges.bottomY);
                this.bottom.setWidth(edges.rightX - edges.leftX);
                this.bottom.setHeight(that._stage.attrs.height - edges.bottomY);
                this.left.setWidth(edges.leftX);
                this.right.setX(edges.rightX);
                this.right.setWidth(that._stage.attrs.width - edges.rightX);
            },

        }
    },

    _addSelectionRectangle: function() {
        
        var that = this;

        this._masks.add()
        this._selectionRectangle.add();
        // this._dynamicLayer.add(this._selectionRectangle.rect);
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
                if (that._handles.active == 'topLeft') that._handles.active = 'topRight';
                else if (that._handles.active == 'topRight') that._handles.active = 'topLeft';
                else if (that._handles.active == 'bottomLeft') that._handles.active = 'bottomRight';
                else if (that._handles.active == 'bottomRight') that._handles.active = 'bottomLeft';
            }
            if (that.cropEdges.topY > that.cropEdges.bottomY) {
                // Swap edges
                var temp = that.cropEdges.topY;
                that.cropEdges.topY = that.cropEdges.bottomY;
                that.cropEdges.bottomY = temp;
                // Swap handles
                if (that._handles.active == 'topLeft') that._handles.active = 'bottomLeft';
                else if (that._handles.active == 'topRight') that._handles.active = 'bottomRight';
                else if (that._handles.active == 'bottomLeft') that._handles.active = 'topLeft';
                else if (that._handles.active == 'bottomRight') that._handles.active = 'topRight';
            }

            // Implement handles
            if (that._handles.active == 'topLeft') that._handles.topLeft.fire('mousemove');
            if (that._handles.active == 'topRight') that._handles.topRight.fire('mousemove');
            if (that._handles.active == 'bottomLeft') that._handles.bottomLeft.fire('mousemove');
            if (that._handles.active == 'bottomRight') that._handles.bottomRight.fire('mousemove');

            // Implement selected region

            // Implement unselected region

            that._updateSelectionRectangle();

        });

        //this._stage.on('mouseout', function () {
        //    that._mouse = false;
        //});

    },

    _addDragListeners: function() {

        var mouse = false;
        var that = this;
        

    },

    _removeSelectionRectangle: function() {

        this._selectionRectangle.remove();
        this._handles.remove();
        this._masks.remove();

    },

    
    _updateSelectionRectangle: function () {

        // Update the Selection Rectangle
        this._selectionRectangle.update();
        this._handles.update();
        this._masks.update();

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