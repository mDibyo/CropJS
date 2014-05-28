/**
 * CropJS ---------------------- DOCUMENTATION NOT COMPLETE
 * This is a JavaScript widget that adds end-user cropping functionality to any image
 * on a webpage with a number of configurable options. It makes use of the KineticJS
 * library. The interface works with mouse as well as touch.
 * The interface lets people select any region whcih can then be dragged and resized
 * with customizable handles. The selected region can be dropped simply by selecting
 * a new region with the mouse.
 * @author Dibyo Majumdar <dibyo.majumdar@gmail.com>
 */


/**
 * EdgeList constructor
 * Edgelist specifies the edges of the crop selection in an image as a list of four
 * coordinates that represent the top, bottom, left and right edges of the selection
 * without any duplication in information.
 * @param {Object} edgeObject
 * @param {Number} [edgeObject.leftX] the x-coordinate of the left edge of selection
 * @param {Number} [edgeObject.rightX] the x-coordinate of the right edge of selection
 * @param {Number} [edgeObject.topY] the y-coordinate of the top edge of selection
 * @param {Number} [edgeObject.bototmY] the y-coordinate of the bottom edge of selection
 */
function EdgeList(edgeObject) {

  this.leftX = edgeObject.leftX;
  this.rightX = edgeObject.rightX;
  this.topY = edgeObject.topY;
  this.bottomY = edgeObject.bottomY;
  this.defined = true;
  this.normalized = false;

}


EdgeList.prototype = {

  /**
   * normalize function normalizes the edges of the crop selection to the total width and
   * height of the image
   * @param  {Object} cropObject Object representing the full image
   * @param  {boolean} force     when true, perform normalization even if edges may already be normalized
   * @return {Object}            this EdgeList object
   */
  normalize: function(cropObject, force) {

    if (!this.normalized || force) {      
      this.leftX /= cropObject.width;
      this.rightX /= cropObject.width;
      this.topY /= cropObject.height;
      this.bottomY /= cropObject.width;
    }

    return this;

  },

  /**
   * denormalize function performs the opposite of the normalize function ie. it scales the
   * edges in proportion to the total width and height of the image
   * @param  {Object} cropObject Object representing the full image
   * @param  {boolean} force     when true, perform denormalization even if edges may not be normalized
   * @return {Object}            this EdgeList object
   */
  denormalize: function (cropObject, force) {

    if (this.normalized || force) {
      this.leftX *= cropObject.width;
      this.rightX *= cropObject.width;
      this.topY *= cropObject.height;
      this.bottomY *= cropObject.height;
    }

    return this;

  },

  /**
   * getCoordinates function returns the coordinates of the four vertices of the selected region
   * @return {Object} the coordinates of topLeft, topRight, bottomLeft and bottomRight vertices
   */
  getCoordinates: function() {

    return {
      topLeft: {
        x: this.leftX,
        y: this.topY,
      },
      topRight: {
        x: this.rightX,
        y: this.topY,
      },
      bottomLeft: {
        x: this.leftX,
        y: this.bottomY,
      },
      bottomRight: {
        x: this.rightX,
        y: this.bottomY,
      },
    };

  },

  /**
   * getXYWH function returns the dimension of the image as the coordinates of the bottomLeft
   * vertex and the width and height of the crop selection.
   * @return {Object} the x, y coordinates of bottomLeft corner, width and height of the crop selection
   */
  getXYWH: function() {

    return {
      x: this.bottomY,
      y: this.leftX,
      width: this.rightX - this.leftX,
      height: this.topY - this.bottomY,
    }

  }

};


/**
 * CropJS constructor
 * It initializes the image canvas to be used with CropJS using the set of configurational
 * arguments passed into it.
 * @param {Object} config
 */
function CropJS(config) {

  var that = this;

  // Check if required/optional attributes are present
  for (var attr in config) this[attr] = config[attr];
  if (!this.imageSrc && !this.image) {
    console.log("required attribute imageSrc/image not defined");
    return;
  }
  if (!this.imageContainerID) {
    console.log("required attribute imageContainerID not defined");
    return;
  }
  if (!this.selectionRectangleColor) {
    this.selectionRectangleColor = 'white';
  }

  // Setup canvas with KinecticJS after loading image if necessary
  if (!this.image) {
    // Image has not been loaded yet
    this.background = new Image();
    this.background.src = this.imageSrc;
    this.background.onload = function () {
      that._initStage();
    };
  } else {
    // Image has already been loaded
    this.background = this.image;
    this._initStage();
  }


} 


CropJS.prototype = {

  _mouse: false,

  cropEdges: undefined,

  _fullMask: {

    init: function (canvas) {
      // Initialize no selection for the canvas

      this.rect = new Kinetic.Rect({
        x: 0,
        y: 0,
        width: canvas._stage.attrs.width,
        height: canvas._stage.attrs.height,
        fill: 'black',
        opacity: 0.6,
      })
        .on('mouseover', function () {
          document.body.style.cursor = 'crosshair';
        })
        .on('mouseout', function () {
          document.body.style.cursor = 'default';
        })
        .on('mousedown touchstart', function () {
          canvas.cropEdges = {
            leftX: canvas._stage.getPointerPosition().x,
            rightX: canvas._stage.getPointerPosition().x,
            topY: canvas._stage.getPointerPosition().y,
            bottomY: canvas._stage.getPointerPosition().y,
          };
          canvas._initSelectionRectangle();
          canvas._addSelectionRectangle();
          canvas._handles.active = 'bottomRight';
          canvas._removeFullMask();
        })

      ;

    },

    add: function (canvas) {
      // Add no selection to the canvas
      canvas._dynamicLayer.add(this.rect);
    },

    remove: function (canvas) {
      // Remove no selection from the canvas
      this.rect.remove();
    },

  },

  _selectionRectangle: {

    init: function (canvas) {
      // Initialize a selection region for the canvas
      
      this.rect = new Kinetic.Rect({
        x: canvas.cropEdges.leftX,
        y: canvas.cropEdges.topY,
        width: canvas.cropEdges.rightX - canvas.cropEdges.leftX,
        height: canvas.cropEdges.bottomY - canvas.cropEdges.topY,
      })
        .on('mouseover', function () {
          document.body.style.cursor = 'move';
        })
        .on('mouseout', function () {
          document.body.style.cursor = 'default';
        })
        .on('mousedown touchstart', function () {
          canvas._selectionRectangle.mouse = true;
          canvas._selectionRectangle.initialPosition = canvas._stage.getPointerPosition();
          canvas._selectionRectangle.initialEdges = new EdgeList(canvas.cropEdges);
        })
        .on('mousemove touchmove', function () {
          if (!canvas._selectionRectangle.mouse) {
            return;
          }
          var pointer = canvas._stage.getPointerPosition(),
            initialEdges = canvas._selectionRectangle.initialEdges,
            initialPosition = canvas._selectionRectangle.initialPosition;
          // Calculate new position of selected region
          canvas.cropEdges.leftX = initialEdges.leftX + (pointer.x - initialPosition.x);
          canvas.cropEdges.rightX = initialEdges.rightX + (pointer.x - initialPosition.x);
          canvas.cropEdges.topY = initialEdges.topY + (pointer.y - initialPosition.y);
          canvas.cropEdges.bottomY = initialEdges.bottomY + (pointer.y - initialPosition.y);
          // Apply constraints
          if (canvas.cropEdges.leftX < 0) {
            canvas.cropEdges.leftX = 0;
          }
          if (canvas.cropEdges.leftX > (canvas._stage.attrs.width - this.attrs.width)) {
            canvas.cropEdges.leftX = canvas._stage.attrs.width - this.attrs.width;
          }
          if (canvas.cropEdges.rightX < this.attrs.width) {
            canvas.cropEdges.rightX = this.attrs.width;
          }
          if (canvas.cropEdges.rightX > canvas._stage.attrs.width) {
            canvas.cropEdges.rightX = canvas._stage.attrs.width;
          }
          if (canvas.cropEdges.topY < 0) {
            canvas.cropEdges.topY = 0;
          }
          if (canvas.cropEdges.topY > (canvas._stage.attrs.height - this.attrs.height)) {
            canvas.cropEdges.topY = canvas._stage.attrs.height - this.attrs.height;
          }
          if (canvas.cropEdges.bottomY < this.attrs.height) {
            canvas.cropEdges.bottomY = this.attrs.height;
          }
          if (canvas.cropEdges.bottomY > canvas._stage.attrs.height) {
            canvas.cropEdges.bottomY = canvas._stage.attrs.height;
          }
        })
        .on('mouseup touchend', function () {
          if (!canvas._selectionRectangle.mouse) {
            return;
          }
          canvas._selectionRectangle.mouse = false;
          canvas._selectionRectangle.initialPosition = undefined;
          canvas._selectionRectangle.initialEdges = undefined;
        });
    },

    add: function (canvas) {
      // Add a selection region to the canvas
      canvas._dynamicLayer.add(this.rect);
    },

    remove: function (canvas) {
      // Remove a selection region from the canvas
      this.rect.remove();
    },

    update: function (canvas) {
      // Update the selection region in the canvas
      var edges = canvas.cropEdges;
      this.rect.setX(edges.leftX);
      this.rect.setY(edges.topY);
      this.rect.setWidth(edges.rightX - edges.leftX);
      this.rect.setHeight(edges.bottomY - edges.topY);
    },
          
  },

  _handles: {

    init: function (canvas) {
      // Initialize crop handles for the canvas
      
      this.size = canvas.handleSize,

      this.active = undefined,

      this.topLeft = new Kinetic.Rect({
        x: canvas.cropEdges.leftX - canvas.handleSize / 2,
        y: canvas.cropEdges.topY - canvas.handleSize / 2,
        width: this.size,
        height: this.size,
        fill: canvas.selectionRectangleColor,
        mouse: false,
      })
        .on('mouseover', function () {
          document.body.style.cursor = 'nw-resize';
        })  
        .on('mouseout', function () {
          document.body.style.cursor = 'default';
        })
        .on('mousedown touchstart', function () {
          if (canvas._handles.active !== undefined &&
            canvas._handles.active != 'topLeft') {
            return;
          }
          canvas._handles.active = 'topLeft';
        })
        .on('mousemove touchmove', function () {
          if (canvas._handles.active != 'topLeft') {
            return;
          }
          canvas.cropEdges.leftX = canvas._stage.getPointerPosition().x;
          canvas.cropEdges.topY = canvas._stage.getPointerPosition().y;
        })
        .on('mouseup touchend', function () {
          canvas._handles.active = undefined;
        });

      this.topRight = new Kinetic.Rect({
        x: canvas.cropEdges.rightX - this.size / 2,
        y: canvas.cropEdges.topY - this.size / 2,
        width: this.size,
        height: this.size,
        fill: canvas.selectionRectangleColor,
        mouse: false,
      })
        .on('mouseover', function () {
          document.body.style.cursor = 'ne-resize';
        })
        .on('mouseout', function () {
          document.body.style.cursor = 'default';
        })
        .on('mousedown touchstart', function () {
          if (canvas._handles.active !== undefined &&
            canvas._handles.active != 'topRight') {
            return;
          }
          canvas._handles.active = 'topRight';
        })
        .on('mousemove touchmove', function () {
          if (canvas._handles.active != 'topRight') {
            return;
          }
          canvas.cropEdges.rightX = canvas._stage.getPointerPosition().x;
          canvas.cropEdges.topY = canvas._stage.getPointerPosition().y;
        })
        .on('mouseup touchend', function () {
          canvas._handles.active = undefined;
        });

      this.bottomLeft = new Kinetic.Rect({
        x: canvas.cropEdges.leftX - this.size / 2,
        y: canvas.cropEdges.bottomY - this.size / 2,
        width: this.size,
        height: this.size,
        fill: canvas.selectionRectangleColor,
        mouse: false,
      })
        .on('mouseover', function () {
          document.body.style.cursor = 'sw-resize';
        })
        .on('mouseout', function () {
          document.body.style.cursor = 'default';
        })
        .on('mousedown touchstart', function () {
          if (canvas._handles.active !== undefined &&
            canvas._handles.active != 'bottomLeft') {
            return;
          }
          canvas._handles.active = 'bottomLeft';
        })
        .on('mousemove touchmove', function () {
          if (canvas._handles.active != 'bottomLeft') {
            return;
          }
          canvas.cropEdges.leftX = canvas._stage.getPointerPosition().x;
          canvas.cropEdges.bottomY = canvas._stage.getPointerPosition().y;
        })
        .on('mouseup touchend', function () {
          canvas._handles.active = undefined;
        });

      this.bottomRight = new Kinetic.Rect({
        x: canvas.cropEdges.rightX - this.size / 2,
        y: canvas.cropEdges.bottomY - this.size / 2,
        width: this.size,
        height: this.size,
        fill: canvas.selectionRectangleColor,
        mouse: false,
      })
        .on('mouseover', function () {
            document.body.style.cursor = 'se-resize';
        })
        .on('mouseout', function () {
            document.body.style.cursor = 'default';
        })
        .on('mousedown touchstart', function () {
          if (canvas._handles.active !== undefined &&
            canvas._handles.active != 'bottomRight') {
            return;
          }
          canvas._handles.active = 'bottomRight';
        })
        .on('mousemove touchmove', function () {
          if (canvas._handles.active != 'bottomRight') {
            return;
          }
          canvas.cropEdges.rightX = canvas._stage.getPointerPosition().x;
          canvas.cropEdges.bottomY = canvas._stage.getPointerPosition().y;
        })
        .on('mouseup touchend', function () {
          canvas._handles.active = undefined;
        });
        
    },

    add: function (canvas) {
      // Add crop handles to the canvas
      canvas._dynamicLayer.add(this.topLeft);
      canvas._dynamicLayer.add(this.topRight);
      canvas._dynamicLayer.add(this.bottomLeft);
      canvas._dynamicLayer.add(this.bottomRight);
    },

    remove: function (canvas) {
      // Remove crop handles from the canvas
      this.topLeft.remove();
      this.topRight.remove();
      this.bottomLeft.remove();
      this.bottomRight.remove();
    },

    update: function (canvas) {
      // Update crop handles in the canvas
      var edges = canvas.cropEdges;
      this.topLeft.setX(edges.leftX - this.size / 2);
      this.topLeft.setY(edges.topY - this.size / 2);
      this.topRight.setX(edges.rightX - this.size / 2);
      this.topRight.setY(edges.topY - this.size / 2);
      this.bottomLeft.setX(edges.leftX - this.size / 2);
      this.bottomLeft.setY(edges.bottomY - this.size / 2);
      this.bottomRight.setX(edges.rightX - this.size / 2);
      this.bottomRight.setY(edges.bottomY - this.size / 2);
    },

  },

  _masks: {

    init: function (canvas) {
        // Initialize non-selected region for the canvas

      this.left = new Kinetic.Rect({
        x: 0,
        y: 0,
        width: canvas.cropEdges.leftX,
        height: canvas.height,
        fill: 'black',
        opacity: canvas.opacity,
      })
      .on('mouseover', function () {
        document.body.style.cursor = 'crosshair';
      })
      .on('mouseout', function () {
        document.body.style.cursor = 'default';
      })
      .on('mousedown touchstart', function () {
        canvas._handles.active = 'bottomRight';
        canvas.cropEdges.leftX = canvas.cropEdges.rightX = canvas._stage.getPointerPosition().x;
        canvas.cropEdges.topY = canvas.cropEdges.bottomY = canvas._stage.getPointerPosition().y;
        canvas._updateSelectionRectangle();
      });

      this.right = new Kinetic.Rect({
        x: canvas.cropEdges.rightX,
        y: 0,
        width: canvas.width - canvas.cropEdges.rightX,
        height: canvas.height,
        fill: 'black',
        opacity: canvas.opacity,
      })
        .on('mouseover', function () {
          document.body.style.cursor = 'crosshair';
        })
        .on('mouseout', function () {
          document.body.style.cursor = 'default';
        })
        .on('mousedown touchstart', function () {
          canvas._handles.active = 'bottomRight';
          canvas.cropEdges.leftX = canvas.cropEdges.rightX = canvas._stage.getPointerPosition().x;
          canvas.cropEdges.topY = canvas.cropEdges.bottomY = canvas._stage.getPointerPosition().y;
          canvas._updateSelectionRectangle();
        });

      this.top = new Kinetic.Rect({
        x: canvas.cropEdges.leftX,
        y: 0,
        width: canvas.cropEdges.rightX - canvas.cropEdges.leftX,
        height: canvas.cropEdges.topY,
        fill: 'black',
        opacity: canvas.opacity,
      })
        .on('mouseover', function () {
          document.body.style.cursor = 'crosshair';
        })
        .on('mouseout', function () {
          document.body.style.cursor = 'default';
        })
        .on('mousedown touchstart', function () {
          canvas._handles.active = 'bottomRight';
          canvas.cropEdges.leftX = canvas.cropEdges.rightX = canvas._stage.getPointerPosition().x;
          canvas.cropEdges.topY = canvas.cropEdges.bottomY = canvas._stage.getPointerPosition().y;
          canvas._updateSelectionRectangle();
        });

      this.bottom = new Kinetic.Rect({
        x: canvas.cropEdges.leftX,
        y: canvas.cropEdges.bottomY,
        width: canvas.cropEdges.rightX - canvas.cropEdges.leftX,
        height: canvas.height - canvas.cropEdges.bottomY,
        fill: 'black',
        opacity: canvas.opacity,
      })
        .on('mouseover', function () {
          document.body.style.cursor = 'crosshair';
        })
        .on('mouseout', function () {
          document.body.style.cursor = 'default';
        })
        .on('mousedown touchstart', function () {
          canvas._handles.active = 'bottomRight';
          canvas.cropEdges.leftX = canvas.cropEdges.rightX = canvas._stage.getPointerPosition().x;
          canvas.cropEdges.topY = canvas.cropEdges.bottomY = canvas._stage.getPointerPosition().y;
          canvas._updateSelectionRectangle();
        });            

    },

    add: function (canvas) {
      // Add non-selected region to the canvas
      canvas._dynamicLayer.add(this.left);
      canvas._dynamicLayer.add(this.right);
      canvas._dynamicLayer.add(this.top);
      canvas._dynamicLayer.add(this.bottom);
    },

    remove: function (canvas) {
      // Remove non-selected region from the canvas
      this.left.remove();
      this.right.remove();
      this.top.remove();
      this.bottom.remove();
    },

    update: function (canvas) {
      // Update non-selected region in the canvas
      var edges = canvas.cropEdges;
      this.top.setX(edges.leftX);
      this.top.setWidth(edges.rightX - edges.leftX);
      this.top.setHeight(edges.topY);
      this.bottom.setX(edges.leftX);
      this.bottom.setY(edges.bottomY);
      this.bottom.setWidth(edges.rightX - edges.leftX);
      this.bottom.setHeight(canvas._stage.attrs.height - edges.bottomY);
      this.left.setWidth(edges.leftX);
      this.right.setX(edges.rightX);
      this.right.setWidth(canvas._stage.attrs.width - edges.rightX);
    },

  },

  _initStage: function () {
    // Initialize canvas

    if (!this.width) {
      this.width = this.background.width;
    }
    if (!this.height) {
      this.height = this.background.height;
    }
    if (this.cropEdges) {
        this.cropEdges.denormalize(this);
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
    this._stage.add(this._dynamicLayer);

    this._initFullMask();

    if (this.cropEdges) {
      this._initSelectionRectangle();
      this._addSelectionRectangle();
    } else {
      this._initFullMask();
      this._addFullMask();
    }
      
  },

  _initFullMask: function () {
    // Initialize mode 1: NO SELECTION for the canvas

    if (this.cropEdges) {
      return;
    }

    // Full Mask
    this._fullMask.init(this);

  },

  _addFullMask: function () {
    // Add mode 1: NO SELECTION to the canvas

    this._fullMask.add(this);
    this._dynamicLayer.draw();

  },

  _removeFullMask: function () {

    this._fullMask.remove();
    this._dynamicLayer.draw();

  },

  _initSelectionRectangle: function() {
    // Initialize mode 2: SELECTION for the canvas

    if (!this.cropEdges) {
      return;
    }

    // Selection Rectangle
    this._selectionRectangle.init(this);
    
    // Crop Handles
    if (!this.handleSize) {
      this.handleSize = 10;
    }
    console.log(this);
    this._handles.init(this);        
    
    // Masks
    if (!this.opacity) {
      this.opacity = 0.6;
    }
    this._masks.init(this);
      
  },

  _addSelectionRectangle: function() {
    // Add mode 2: SELECTION to the canvas

    var that = this;

    this._masks.add(this);
    this._selectionRectangle.add(this);
    this._handles.add(this);
    this._dynamicLayer.draw();
    this._updateSelectionRectangle();

    this._stage.on('mousemove touchmove', function () {

      // Handle when selection is inverted
      if (that.cropEdges.leftX > that.cropEdges.rightX) {
        // Swap edges
        var temp = that.cropEdges.leftX;
        that.cropEdges.leftX = that.cropEdges.rightX;
        that.cropEdges.rightX = temp;
        // Swap handles
        if (that._handles.active == 'topLeft') {
          that._handles.active = 'topRight';
        } else if (that._handles.active == 'topRight') {
          that._handles.active = 'topLeft';
        } else if (that._handles.active == 'bottomLeft') {
          that._handles.active = 'bottomRight';
        } else if (that._handles.active == 'bottomRight') {
          that._handles.active = 'bottomLeft';
        }
      }
      if (that.cropEdges.topY > that.cropEdges.bottomY) {
        // Swap edges
        var temp = that.cropEdges.topY;
        that.cropEdges.topY = that.cropEdges.bottomY;
        that.cropEdges.bottomY = temp;
        // Swap handles
        if (that._handles.active == 'topLeft') {
          that._handles.active = 'bottomLeft';
        } else if (that._handles.active == 'topRight') {
          that._handles.active = 'bottomRight';
        } else if (that._handles.active == 'bottomLeft') {
          that._handles.active = 'topLeft';
        } else if (that._handles.active == 'bottomRight') {
          that._handles.active = 'topRight';
        }
      }

      // Implement handles
      if (that._handles.active == 'topLeft') {
        that._handles.topLeft.fire('mousemove');
      }
      if (that._handles.active == 'topRight') {
        that._handles.topRight.fire('mousemove');
      }
      if (that._handles.active == 'bottomLeft') {
        that._handles.bottomLeft.fire('mousemove');
      }
      if (that._handles.active == 'bottomRight') {
        that._handles.bottomRight.fire('mousemove');
      }

      // Implement selected region
      if (that._selectionRectangle.mouse) that._selectionRectangle.rect.fire('mousemove');

      // Implement unselected region
      

      that._updateSelectionRectangle();

    });

    this._stage.on('mouseup touchend', function () {
      that._selectionRectangle.mouse = false;
      that._handles.active = undefined;
    });
    this._stage.on('mouseout', function () {
      that._mouse = false;
    });

  },

  _removeSelectionRectangle: function() {
    // Remove mode 2: SELECTION from the canvas

    this._selectionRectangle.remove();
    this._handles.remove();
    this._masks.remove();

    this._stage.off('mousemove touchmove');

  },
  
  _updateSelectionRectangle: function () {
    // Update mode 2: SELECTION in the canvas

    // Update the Selection Rectangle
    this._selectionRectangle.update(this);
    this._handles.update(this);
    this._masks.update(this);

    // draw Layer
    this._dynamicLayer.draw();

  },

  setCursor: function(cursorStyle) {
    document.getElementById(this.imageContainerID).style.cursor = cursorStyle;
  },

  clearSelection: function() {

    if (this._selectionRectangle.rect) {
      this._removeSelectionRectangle();
    }
    if (this._fullMask.rect) {
      this._removeFullMask();
    }

    this.cropEdges = undefined;
    this._initFullMask();
    this._addFullMask();

  },

  getSelectionRectangle: function () {
    if (this.cropEdges === undefined) {
      return false;
    }
    return new EdgeList(this.cropEdges);
  },

  cut: function () {
    console.log("This is the cut function");
  },

};