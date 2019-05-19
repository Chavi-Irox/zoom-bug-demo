import { Component, AfterViewInit } from '@angular/core';
import * as go from 'gojs';
import { HttpClient } from '@angular/common/http';
import { rooms } from './rooms';
import { nodes } from './nodes';

const DEVICE_TEMPLATE = "deviceTemplate";
const ROOM_TEMPLATE = "roomTemplate";
const SENSOR_TEMPLATE = "sensorTemplate";
let regularSelectedDeviceFill = "#b6cbfc";
const STROKE_WIDTH = 32;
let regularSelectedRoomFill = "transparent"
let regularFill = "transparent";
let dropFill = "rgba(128,255,255,.2)";
let validStroke = "#b6cbfc"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  title = 'demo-project';
  diagram: go.Diagram;
  displayBackDoors = 2;
  displayFrontDoors = 1;
  defualtSize: any[] = JSON.parse('[{"func":72,"categoryId":8,"width":19,"height":19,"name":"Agent"},{"func":36,"categoryId":0,"width":1,"height":1,"name":"Application"},{"func":24,"categoryId":6,"width":18,"height":25,"name":"Blade Server"},{"func":76,"categoryId":10,"width":10,"height":16,"name":"BMS"},{"func":44,"categoryId":3,"width":20,"height":40,"name":"Cabinet"},{"func":48,"categoryId":3,"width":19,"height":19,"name":"Cable Organizer"},{"func":73,"categoryId":8,"width":19,"height":19,"name":"Collector"},{"func":30,"categoryId":2,"width":1,"height":1,"name":"Copper"},{"func":55,"categoryId":0,"width":1,"height":1,"name":"Department"},{"func":68,"categoryId":10,"width":10,"height":10,"name":"Environmental Control"},{"func":63,"categoryId":11,"width":19,"height":19,"name":"Expander"},{"func":31,"categoryId":2,"width":1,"height":1,"name":"Fiber"},{"func":6,"categoryId":0,"width":1,"height":1,"name":"Fixed Ports"},{"func":40,"categoryId":1,"width":1,"height":1,"name":"Horizontal and Vertical"},{"func":17,"categoryId":7,"width":19,"height":19,"name":"Hub"},{"func":75,"categoryId":6,"width":15,"height":15,"name":"IP Camera"},{"func":28,"categoryId":6,"width":18,"height":25,"name":"IP Phone"},{"func":5,"categoryId":0,"width":1,"height":1,"name":"KVM"},{"func":29,"categoryId":6,"width":15,"height":15,"name":"KVM Device"},{"func":67,"categoryId":11,"width":19,"height":19,"name":"Local Scanner"},{"func":7,"categoryId":0,"width":1,"height":1,"name":"LOM"},{"func":60,"categoryId":11,"width":19,"height":19,"name":"Master"},{"func":62,"categoryId":11,"width":19,"height":19,"name":"Master Expander"},{"func":20,"categoryId":12,"width":19,"height":19,"name":"Master Scanner"},{"func":4,"categoryId":0,"width":1,"height":1,"name":"Modem"},{"func":3,"categoryId":0,"width":1,"height":1,"name":"Monitor"},{"func":1,"categoryId":0,"width":1,"height":1,"name":"NIC"},{"func":35,"categoryId":0,"width":1,"height":1,"name":"OS"},{"func":9,"categoryId":9,"width":15,"height":15,"name":"Outlet"},{"func":8,"categoryId":9,"width":30,"height":25,"name":"Panel"},{"func":10,"categoryId":9,"width":19,"height":19,"name":"Pass-Through"},{"func":41,"categoryId":1,"width":1,"height":1,"name":"Patch Cord"},{"func":69,"categoryId":10,"width":10,"height":10,"name":"PDU"},{"func":70,"categoryId":2,"width":10,"height":10,"name":"POWER SOCKET"},{"func":27,"categoryId":6,"width":18,"height":25,"name":"Printer"},{"func":23,"categoryId":12,"width":19,"height":19,"name":"PV Control Pad"},{"func":66,"categoryId":11,"width":19,"height":19,"name":"PVMax Control Pad"},{"func":64,"categoryId":11,"width":19,"height":19,"name":"PVMax Controller"},{"func":61,"categoryId":11,"width":19,"height":19,"name":"PVMax Scanner"},{"func":74,"categoryId":8,"width":19,"height":19,"name":"PVPlus Controller"},{"func":45,"categoryId":3,"width":20,"height":40,"name":"Rack"},{"func":16,"categoryId":7,"width":19,"height":19,"name":"Router"},{"func":21,"categoryId":12,"width":19,"height":19,"name":"Satellite Scanner"},{"func":2,"categoryId":0,"width":1,"height":1,"name":"SCSI"},{"func":22,"categoryId":12,"width":19,"height":19,"name":"Security Controller"},{"func":25,"categoryId":6,"width":18,"height":25,"name":"Servers & Computers"},{"func":46,"categoryId":3,"width":19,"height":19,"name":"Shelf"},{"func":47,"categoryId":3,"width":19,"height":19,"name":"Spacer"},{"func":15,"categoryId":7,"width":19,"height":19,"name":"Switch"},{"func":26,"categoryId":6,"width":18,"height":25,"name":"Telephone"},{"func":43,"categoryId":1,"width":1,"height":1,"name":"Trunk Cable"},{"func":0,"categoryId":0,"width":1,"height":1,"name":"UNUSEABLE"},{"func":71,"categoryId":10,"width":30,"height":30,"name":"UPS"},{"func":50,"categoryId":0,"width":1,"height":1,"name":"Vendor"}]');
  mapSize: any = {
    height: 87293,
    width: 127216
  };
  mapLocationId = 1015222;
  isLoaded

  constructor(private http: HttpClient) {
  }

  ngAfterViewInit(): void {
    this.initDiagram();
    this.initData()
  }

  initDiagram() {
    let $ = go.GraphObject.make;

    let templateMap = new go.Map<string, go.Node>();
    templateMap.add(DEVICE_TEMPLATE, this.getDeviceTemplate());
    templateMap.add(ROOM_TEMPLATE, this.getRoomTemplate());
    templateMap.add(SENSOR_TEMPLATE, this.getSensorTemplate());

    this.diagram = $(go.Diagram, "diagramDiv",
      {
        InitialLayoutCompleted: this.zoomToMap.bind(this),
        initialContentAlignment: go.Spot.Top,
        "animationManager.isEnabled": false,
        scrollMode: go.Diagram.InfiniteScroll,
        hasHorizontalScrollbar: false,
        hasVerticalScrollbar: false,
        "toolManager.hoverDelay": 100,
        groupTemplate: this.getGroupTemplate(),
        nodeTemplateMap: templateMap,
        "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
        "commandHandler.zoomFactor": 1.25,
        allowUndo: false,
      });

    this.diagram.model = new go.GraphLinksModel(this.diagram.model.nodeDataArray, (<any>this.diagram.model).linkDataArray);

    this.diagram.add(
      $(go.Part,
        {
          layerName: "Background", position: new go.Point(0, 0),
          selectable: false, pickable: false,
        },
        $(go.Picture,
          {
            name: "IMAGE",
            imageStretch: go.GraphObject.Fill,
            desiredSize: new go.Size(this.mapSize.width, this.mapSize.height),
            source: "assets/maps/" + this.mapLocationId + ".png"
          },
        )
      ));
    let forelayer = this.diagram.findLayer("Foreground");
    this.diagram.addLayerBefore($(go.Layer, { name: "draggedRooms" }), forelayer);
  }

  getDeviceTemplate() {
    let $ = go.GraphObject.make;
    let deviceTemplate =
      $(go.Node, "Auto",
        {
          rotateObjectName: "ROTATE_PART",
          locationSpot: go.Spot.Center,
          layerName: "Foreground",
          selectionObjectName: "SHAPE",
          selectionAdornmentTemplate:
            $(go.Adornment, "Auto",
              { layerName: "Background" },  // the predefined layer that is behind everything else
              $(go.Shape, "Circle", { name: "adornment", fill: regularSelectedDeviceFill, stroke: null },
              ),
              $(go.Placeholder)
            ),
        },
        new go.Binding("rotatable", "model", (model) => {
          return (model.FuncTypeId == 44 || model.FuncTypeId == 45);
        }),

        new go.Binding("locationObjectName", "model", (model) => {
          if (model.FuncTypeId == 44 || model.FuncTypeId == 45) {
            return "ICON_SHAPE"
          }
          return "SHAPE"
        }),
        new go.Binding("location", "", (data) => {
          if (data.model && data.model.Coordination)
            return new go.Point(data.model.Coordination[0], data.model.Coordination[1]);
        }).makeTwoWay((pt, data) => {
          data.model.Coordination = [pt.x, pt.y];
        }),
        $(go.Panel, "Vertical",
          $(go.Panel, "Spot",
            $(go.Panel, "Vertical", { name: "ROTATE_PART", alignment: new go.Spot(0.5, 0.5) },
              new go.Binding("angle", "", (data) => {
                return data.model.Rotation || 0;
              }).makeTwoWay((angle, data) => {
                data.model.Rotation = angle;
              }),
              $(go.Shape, //door
                {
                  fill: "orange",
                  opacity: 0.2,
                },
                new go.Binding("desiredSize", "model", (d) => {
                  if (this.displayBackDoors == 1) {
                    return new go.Size((d.Width > 22 ? d.Width : 22) * 25.4, (d.Width > 22 ? d.Width : 22) * 25.4);
                  }
                  else {
                    return new go.Size((d.Width > 22 ? d.Width : 22) * 25.4, (d.Width > 22 ? d.Width : 22) / 2 * 25.4);
                  }
                }),
                new go.Binding("visible", "model", (model) => {
                  return (model.FuncTypeId == 44 || model.FuncTypeId == 45) && this.displayBackDoors ? true : false;
                }),
                new go.Binding("geometryString", "model", (model) => {
                  if (this.displayBackDoors == 1) {

                    return "F M10 0 V10 H0 Q0 0 10 0z"

                  }
                  else {
                    return "F M0 0 V10 H10 V0 Q5 0 5 10 Q5 0 0 0z"
                  }
                }),

              ),
              $(go.Panel, "Spot",
                $(go.Picture,
                  {
                    alignment: new go.Spot(0, 0),
                    name: "SHAPE"
                  },
                  new go.Binding("desiredSize", "model", (d) => {
                    let size = this.calcSizeByFunc(d.FuncTypeId, this.defualtSize, this.mapSize);
                    return new go.Size(size.width, size.height);
                  }),
                  new go.Binding("source", "iconId", this.convertIconIdToImageSrc)
                ),
                $(go.Shape, "Rectangle",
                  {
                    alignment: new go.Spot(0.5, 0.5),
                    name: "ICON_SHAPE",
                    fill: "gray",
                    opacity: 0.2
                  },
                  new go.Binding("desiredSize", "model", (d) => {
                    return new go.Size((d.Width > 22 ? d.Width : 22) * 25.4, (d.Depth || 20) * 25.4);
                  }),
                  new go.Binding("visible", "model", (model) => {
                    return model.FuncTypeId == 44 || model.FuncTypeId == 45;
                  }),
                  new go.Binding("fill", "fillColor", (fillColor) => {
                    return fillColor && fillColor.length > 1 ? fillColor.toLowerCase() : "gray";
                  }),
                  new go.Binding("opacity", "fillColor", (fillColor) => {
                    if (fillColor != "gray") {
                      return 0.5
                    }
                    return 0.2;
                  })

                ),
                $(go.Shape, "Rectangle",
                  {
                    alignment: new go.Spot(0.5, 0.5),
                    stroke: "blue",
                    strokeWidth: 5,
                    fill: "transparent"
                  },
                  new go.Binding("desiredSize", "model", (d) => {
                    let size = this.calcSizeByFunc(d.FuncTypeId, this.defualtSize, this.mapSize);
                    return new go.Size(size.width, size.height);
                  }),
                  new go.Binding("visible", "model", (d) => {
                    return d.isReserved ? true : false
                  }),
                )
              ),
              $(go.Shape, //front door
                {
                  fill: "green",
                  opacity: 0.2,
                },
                new go.Binding("desiredSize", "model", (d) => {
                  if (this.displayFrontDoors == 1) {
                    return new go.Size((d.Width > 22 ? d.Width : 22) * 25.4, (d.Width > 22 ? d.Width : 22) * 25.4);
                  }
                  else {
                    return new go.Size((d.Width > 22 ? d.Width : 22) * 25.4, (d.Width > 22 ? d.Width : 22) / 2 * 25.4);
                  }
                }),
                new go.Binding("visible", "model", (model) => {
                  return (model.FuncTypeId == 44 || model.FuncTypeId == 45) && this.displayFrontDoors ? true : false;
                }),
                new go.Binding("geometryString", "model", (model) => {
                  if (this.displayFrontDoors == 1) {
                    return "F M0 0 H10 V10 Q0 10 0 0z";
                  }
                  else {
                    return "F M0 0 V10 Q5 10 5 0 Q5 10 10 10 V0z"
                  }
                }),

              )),
            $(go.Panel, "Spot", { alignment: new go.Spot(0.5, 0.5) },
              $(go.Panel,
                { isPanelMain: true, visible: false },
                new go.Binding("desiredSize", "model", (d) => {
                  let size = this.calcSizeByFunc(d.FuncTypeId, this.defualtSize, this.mapSize);
                  return new go.Size(size.width, size.height);
                })),
              $(go.Picture,//status
                {
                  alignment: new go.Spot(1, 0)
                },
                new go.Binding("source", "", (device) => {
                  return device.ImageStatus || "";
                }),
                new go.Binding("visible", "", (device) => {
                  return device.showStatus;
                }),
                new go.Binding("desiredSize", "model", (d) => {
                  let size = this.calcSizeByFunc(d.FuncTypeId, this.defualtSize, this.mapSize);
                  return new go.Size(size.width / 3, size.width / 3);
                })
              ),
              $(go.Picture,//marker
                {
                  alignment: new go.Spot(0.5, 0, 0, -600),
                  source: "assets/icons/marker.png",
                  height: 250,
                  width: 250
                },
                new go.Binding("visible", "", (device) => {
                  return device.showMarker == true;
                })
              ),
              $(go.Picture, //alert
                {
                  alignment: new go.Spot(0.5, 0, 0, -600),
                  source: "assets/icons/alert-marker.png",
                  height: 250,
                  width: 250
                },
                new go.Binding("visible", "", (device) => {
                  return device.alertData != null;
                }),
              ))),
          $(go.TextBlock,
            { pickable: false, wrap: go.TextBlock.None, height: 40, font: "bold 28pt sans-serif", textAlign: "right", isMultiline: false },
            new go.Binding("text", "", (e) => {
              return e.model.Name;
            }),
            new go.Binding("background", "", (e) => {
              if (e.model.Name)
                return "#FFFFCC";
              return "transparent"
            }),
            new go.Binding("stroke", "", (e) => {
              if (e.model.Name)
                return "black";
              return "transparent"
            })
          ),
          $(go.Panel, "Auto",
            $(go.Panel, "Horizontal",
              {
                margin: 4,
                defaultAlignment: go.Spot.Left
              },

              new go.Binding("itemArray", "", (device) => {
                return device.model.tags;
              }),
              {
                itemTemplate:
                  $(go.Panel, "Auto",
                    $(go.Shape, "Rectangle",
                      new go.Binding("fill", "Color"),
                      {
                        width: 75,
                        height: 75,
                        position: new go.Point(0, 0),
                        stroke: "transparent", margin: 4
                      })
                  )
              })
          )

        ));

    ;
    return deviceTemplate;
  }
  getRoomTemplate() {
    let $ = go.GraphObject.make;
    let roomTemplate =
      $(go.Node,
        {
          locationSpot: go.Spot.TopLeft,
          locationObjectName: "SHAPE",
          resizable: false,
          rotatable: false,
          reshapable: false,
          movable: false,
          copyable: false,
          selectionAdorned: true, selectionObjectName: "SHAPE",
          selectionAdornmentTemplate:
            $(go.Adornment, "Auto",
              $(go.Shape, { name: "adornment", stroke: "dodgerblue", strokeWidth: STROKE_WIDTH, fill: regularSelectedRoomFill },
                new go.Binding("geometryString", "geo")
              ),
              $(go.Placeholder, { margin: -1 })
            ),
        },
        new go.Binding("location", "", (data) => {
          if (data.model && data.model.Coordination)
            return new go.Point(data.model.Coordination[0], data.model.Coordination[1]);
        }).makeTwoWay((pt, data) => {
          data.model.Coordination = [pt.x, pt.y];
        }),
        $(go.Shape,
          { name: "SHAPE", fill: regularFill, stroke: validStroke, strokeWidth: STROKE_WIDTH },
          new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
          new go.Binding("angle").makeTwoWay(),
          new go.Binding("geometryString", "geo").makeTwoWay(go.Geometry.stringify),
          new go.Binding("fill", "isHighlighted", (h) => {
            return h ? dropFill : regularFill;
          }).ofObject(),
        ),
        //affected layer
        $(go.Shape,
          { name: "AFFECTED_SHAPE", visible: false, fill: "red", stroke: "transparent", opacity: 0.5 },
          new go.Binding("desiredSize", "size", go.Size.parse),
          new go.Binding("angle"),
          new go.Binding("geometryString", "geo"),
          new go.Binding("visible", "", (data) => {
            return data.isAffected ? true : false;
            //return true;
          })
        )
      );
    return roomTemplate;
  }
  getSensorTemplate() {
    let $ = go.GraphObject.make;
    let sensorTemplate =
      $(go.Node, "Auto",
        {
          locationSpot: go.Spot.Center,
          layerName: "Foreground",
          selectionAdornmentTemplate:
            $(go.Adornment, "Auto",
              { layerName: "Background" },
              $(go.Shape, "Circle", { name: "adornment", fill: regularSelectedDeviceFill, stroke: null }),
              $(go.Placeholder)
            ),
        },
        new go.Binding("visible", "visible"),
        new go.Binding("location", "", (data) => {
          if (data.model && data.model.Coordination)
            return new go.Point(data.model.Coordination[0], data.model.Coordination[1]);
        }).makeTwoWay((pt, data) => {
          data.model.Coordination = [pt.x, pt.y];
        }),
        $(go.Panel, "Vertical",
          $(go.Panel, "Spot",
            $(go.Picture,
              {
                alignment: new go.Spot(0.5, 0.5),
                name: "SHAPE"
              },
              new go.Binding("desiredSize", "model", (d) => {
                let size = this.calcSizeByFunc(76, this.defualtSize, this.mapSize);
                return new go.Size(size.width, size.height);
              }),
              new go.Binding("source", "iconId", this.convertSensorIconIdToImageSrc)
            ),
            $(go.Picture,
              {
                alignment: new go.Spot(1, 0),
              },
              new go.Binding("source", "", (device) => {
                return device.ImageStatus || "";
              }),
              new go.Binding("visible", "", (device) => {
                return device.showStatus;
              }),
              new go.Binding("desiredSize", "model", (d) => {
                let size = this.calcSizeByFunc(76, this.defualtSize, this.mapSize);
                return new go.Size(size.width / 3, size.width / 3);
              })
            ),
            $(go.Picture,
              {
                alignment: new go.Spot(0.5, -0.3),
                source: "assets/icons/marker.png",
              },
              new go.Binding("visible", "", (device) => {
                return device.showMarker == true;
              }),
              new go.Binding("desiredSize", "model", (d) => {
                return new go.Size(250, 250);
              })
            )
          ),
          $(go.TextBlock,
            { pickable: false, alignment: go.Spot.TopCenter, wrap: go.TextBlock.None, height: 40, font: "bold 28pt sans-serif", textAlign: "right", isMultiline: false },
            new go.Binding("text", "", (e) => {
              return e.model.Name;
            }),
            new go.Binding("background", "", (e) => {
              if (e.model.Name)
                return "#FFFFCC";
              return "transparent"
            }),
            new go.Binding("stroke", "", (e) => {
              if (e.model.Name)
                return "black";
              return "transparent"
            })
          ),
          $(go.Panel, "Auto",
            $(go.Panel, "Horizontal",
              {
                margin: 4,
                defaultAlignment: go.Spot.Left
              },

              new go.Binding("itemArray", "", (device) => {
                return device.model.tags;
              }),
              {
                itemTemplate:
                  $(go.Panel, "Auto",
                    $(go.Shape, "Rectangle",
                      new go.Binding("fill", "Color"),
                      {
                        width: 75,
                        height: 75,
                        position: new go.Point(0, 0),
                        stroke: "transparent", margin: 4
                      })
                  )
              })
          )

        ));

    ;
    return sensorTemplate;

  }

  calcSizeByFunc(funcId, defaults, mapSize: any = null) {
    let ratio = 1;
    if (mapSize)
      ratio = 8.5;
    let func = defaults.find(d => d.func == funcId)
    return { width: func.width * ratio, height: func.height * ratio };
  }

  convertIconIdToImageSrc(iconId) {
    return 'assets/catalogs/' + iconId + "_32.gif";
  }
  convertSensorIconIdToImageSrc(iconId) {
    return 'assets/sensors/' + iconId + "_32.gif";
  }

  zoomToMap() {
    if (this.diagram) {
      let rect = this.diagram.parts.first().findObject("IMAGE").actualBounds;
      this.diagram.zoomToRect(rect);
      this.diagram.centerRect(rect);
    }

  }

  getGroupTemplate() {
    let $ = go.GraphObject.make;
    let groupTemplate =
      $(go.Group, { layout: null, location: new go.Point(0, 0) }
      );
    return groupTemplate;
  }

  initData() {
    let roomsArray = rooms;
    roomsArray = this.adjustResourcesToMap(roomsArray);
    this.loadNodes(roomsArray);
    let device = nodes;
    device = this.adjustResourcesToMap(nodes);
    this.loadNodes(device);
    this.isLoaded = true;
  }

  adjustResourcesToMap(resources) {
    let nodes = [];
    resources.forEach(res => {
      nodes.push({ model: res, isLocation: res.CatalogId || res.ControllerId ? false : true })
    })
    return nodes;
  }

  loadNodes(nodes) {

    let nodesToAdd = [];
    //this.diagram.model.addNodeData({ key: 'g' + this.mapLocationId, isGroup: true });
    nodesToAdd.push({ key: 'g' + this.mapLocationId, isGroup: true });
    for (var i = nodes.length - 1; i >= 0; i--) {
      var nodeToAdd, node = nodes[i];
      if (node.isLocation) {
        nodeToAdd = {
          key: node.model.Id,
          category: ROOM_TEMPLATE,
          model: node.model,
          text: node.model.Name,
          geo: node.model.GeoPath + ' Z',
        };
        if (node.model.ParentId != this.mapLocationId)
          nodeToAdd.group = 'g' + node.model.ParentId;
      }
      else if (node.isSensor) {

        node.model.Coordination = node.model.MapCoordinates;
        nodeToAdd = {
          key: node.model.ControllerId + node.model.Id + node.model.TypeId,
          category: SENSOR_TEMPLATE,
          visible: false,
          showStatus: false,
          model: node.model,
          iconId: node.model.IconId,
          text: node.model.Name,
          group: 'g' + node.model.LocationId
        };
      }
      else {
        if (!node.model.Coordination)
          this.calcCoordination(node);
        nodeToAdd = {
          key: node.model.Id,
          category: DEVICE_TEMPLATE,
          visible: true,
          showStatus: false,
          model: node.model,
          iconId: node.model.IconId,
          text: node.model.Name,
          group: 'g' + node.model.LocationId
        };
      }
      if (node.model.Coordination) {
        //this.diagram.model.addNodeData(nodeToAdd);
        nodesToAdd.push(nodeToAdd);
      }
      if (nodeToAdd.category == ROOM_TEMPLATE) {
        if (!nodeToAdd.group) {
          //this.diagram.model.addNodeData({ key: 'g' + nodeToAdd.key, isGroup: true });
          nodesToAdd.push({ key: 'g' + nodeToAdd.key, isGroup: true });
        }
        else {
          //this.diagram.model.addNodeData({ key: 'g' + nodeToAdd.key, group: nodeToAdd.group, isGroup: true });
          nodesToAdd.push({ key: 'g' + nodeToAdd.key, group: nodeToAdd.group, isGroup: true });

        }
      }
    }
    this.diagram.startTransaction("nodes added");
    this.diagram.model.addNodeDataCollection(nodesToAdd);
                                this.diagram.commitTransaction("nodes added");
    

  }

  calcCoordination(device) {
    if (device.model.LocationId == this.mapLocationId) {
      let mapNode = this.diagram.findNodeForKey("g" + device.model.LocationId);
      //this.doCalc(device, mapNode.data, false, null);
      this.doCalc(device, mapNode, false);
    }
    else {
      let room = this.diagram.findNodeForKey(device.model.LocationId);
      if (room) {
        //this.doCalc(device, room.data.model, true, this.getRoomCoordinates(room));
        this.doCalc(device, room, true);
      }
    }
  }

  doCalc(device, location, isRoom) {
    let deviceSize = this.calcSizeByFunc(device.model.FuncTypeId, this.defualtSize, this.mapSize);
    let startPoint;
    if (!isRoom) {
      startPoint = location.startPoint ? location.startPoint : { x: location.actualBounds.x, y: location.actualBounds.y };
      //check if device position in the map
      let mapwidth = this.diagram.parts.first().findObject("IMAGE").actualBounds;
      if (startPoint.x + deviceSize.width > mapwidth) {
        startPoint.y += location.rowHeight ? location.rowHeight : 0;
        startPoint.x = location.actualBounds.x;
      }
      device.model.Coordination = [startPoint.x + deviceSize.width / 2, startPoint.y + deviceSize.height / 2];
      //point to the next device
      location.startPoint = { x: startPoint.x + deviceSize.width, y: startPoint.y };
      //the height of the row - to the next row
      location.rowHeight = location.rowHeight && location.rowHeight > deviceSize.height ? location.rowHeight : deviceSize.height;
    }
    else {
      if (!location.startPoint) {
        location.startPoint = { x: location.location.x, y: location.location.y };
      }
      if (location.startPoint.x + deviceSize.width > location.location.x + location.actualBounds.width / 2) {
        location.startPoint = { x: location.location.x, y: location.startPoint.y + deviceSize.height };
      }
      device.model.Coordination = [location.startPoint.x + deviceSize.width / 2, location.startPoint.y + deviceSize.height / 2];
      location.startPoint.x += deviceSize.width;


    }
  }

}

