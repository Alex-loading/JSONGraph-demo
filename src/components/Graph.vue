<template>
  <div class="wrapper">
    <a-collapse
      v-model:activeKey="activeKey"
      accordion
      class="collapse-container"
    >
      <a-collapse-panel key="1" header="根据id查询单线图">
        <div>
          <a-input
            class="input"
            v-model:value="searchId"
            placeholder="请输入查询id"
          />
          <a-button class="search" @click="refreshGraph" type="primary">查询</a-button>
        </div>
      </a-collapse-panel>
      <a-collapse-panel key="2" header="根据馈线树型结构查询单线图">
        <div class="tree-container">
          <a-tree
            v-model:selectedKeys="selectedKeys"
            :tree-data="treeData"
            @select="onSelect"
          >
          </a-tree>
        </div>
      </a-collapse-panel>
      <a-collapse-panel key="3" header="获取量测数据">
        <div style="width: 300px">
          <a-form
            :model="formState"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            labelAlign="left"
          >
            <a-form-item label="节点ID">
              <div v-if="formState.name != ''">{{ formState.name }}</div>
              <div v-else style="font-weight: 500">
                请点击load类型的节点获取
              </div>
            </a-form-item>
            <a-form-item label="日期">
              <a-radio-group v-model:value="formState.date">
                <a-radio value="10">10月1日</a-radio>
                <a-radio value="11">11月1日</a-radio>
                <a-radio value="12">12月1日</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="量测时间">
              <a-time-picker
                v-model:value="formState.moment"
                :minuteStep="30"
                format="HH:mm"
                placeholder="请选择时间"
              />
            </a-form-item>
            <a-form-item :wrapper-col="{ offset: 6 }">
              <a-button type="primary" @click="onMeasurementSubmit"
                >获取</a-button
              >
              <a-button style="margin-left: 10px" @click="onMeasurementReset">清空</a-button>
            </a-form-item>

            <div v-if="measurementRes.length != 0">
              <a-divider>量测数据</a-divider>
              <div style="max-height: 400px; overflow-y: scroll">
                <a-form-item
                  v-for="(value, key) in measurementRes"
                  :key="key"
                  :label="key"
                  class="data-line"
                >
                  <span>{{ value }}</span>
                </a-form-item>
              </div>
            </div>
          </a-form>
        </div>
      </a-collapse-panel>
    </a-collapse>
    <div ref="graphContainer" class="graph-container" :key="searchCount"></div>
  </div>
</template>

<script>
import * as d3 from "d3";
import dayjs from "dayjs";
import type1Icon from "../components/icons/type1.svg";
import ACLineSegment from "../components/icons/ACLineSegment.svg";
import Disconnector from "../components/icons/Disconnector.svg";
import Load from "../components/icons/Load.svg";
import Switch from "../components/icons/Switch.svg";
import ConnectivityNode from "../components/icons/ConnectivityNode.svg";
import Breaker from "../components/icons/Breaker.svg";
import BusbarSection from "../components/icons/BusbarSection.svg";
import PowerTransformer from "../components/icons/PowerTransformer.svg";
import TieSwitch from "../components/icons/TieSwitch.svg";
import Substation from "../components/icons/Substation.svg";
import { getGraphData, getTreeData, getMeasurementData } from "@/api/graph.ts";

export default {
  name: "RelationGraph",
  data() {
    return {
      data: {
        nodes: [],
        edges: [],
      },
      activeKey: 1,
      treeData: [],
      selectedKeys: [],
      formState: {
        name: "",
        date: "10",
        moment: "",
      },
      labelCol: {
        span: 6,
      },
      wrapperCol: {
        span: 24,
      },
      measurementRes: [],
      nodeIcons: {
        type1: {
          src: type1Icon,
          width: 40,
          height: 40,
          isCircle: false,
        },
        Substation: {
          src: Substation,
          width: 40,
          height: 40,
          isCircle: false,
        },
        ACLineSegment: {
          src: ACLineSegment,
          width: 20,
          height: 20,
          isCircle: true,
        },
        Disconnector: {
          src: Disconnector,
          width: 20,
          height: 20,
          isCircle: true,
        },
        Load: { src: Load, width: 20, height: 20, isCircle: true },
        Switch: { src: Switch, width: 50, height: 20, isCircle: false },
        ConnectivityNode: {
          src: ConnectivityNode,
          width: 20,
          height: 20,
          isCircle: true,
        },
        Breaker: { src: Breaker, width: 40, height: 20, isCircle: false },
        BusbarSection: {
          src: BusbarSection,
          width: 10,
          height: 10,
          isCircle: true,
        },
        PowerTransformer: {
          src: PowerTransformer,
          width: 40,
          height: 20,
          isCircle: false,
        },
        TieSwitch: {
          src: TieSwitch,
          width: 50,
          height: 20,
          isCircle: false,
        },
      },
      linkStyles: {
        solid: { stroke: "#000000", strokeWidth: 2, strokeDasharray: "0" },
        dashed: { stroke: "#000000", strokeWidth: 2, strokeDasharray: "2,4" },
        ConnectivityEdge: {
          stroke: "#000000",
          strokeWidth: 2,
          strokeDasharray: "0",
        },
      },
      searchCount: 0,
      searchId: "",
    };
  },
  mounted() {
    getTreeData().then((res) => {
      this.treeData = res.data.data.subStations.map((station) => ({
        title: station.name, 
        key: station.name, 
        children: station.feeders.map((feeder) => ({
          title: feeder.name, 
          key: feeder.id, 
        })),
      }));
    });
  },
  methods: {
    refreshGraph() {
      this.searchCount += 1;
      this.createGraph();
    },
    createGraph() {
      getGraphData(
        this.searchId,
        dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss")
      ).then((res) => {
        console.log(res);
        this.data = res.data.data;
        console.log("data", this.data);

        const svg = d3
          .select(this.$refs.graphContainer)
          .append("svg")
          .attr("width", "100%")
          .attr("height", "100%")
          .style("transform-origin", "0 0");

        // 初始化缩放行为，在g元素上操作，支持缩放和拖拽
        const g = svg.append("g");
        svg
          .call(
            d3
              .zoom()
              .scaleExtent([0.5, 5])
              .on("zoom", (e) => {
                g.attr(
                  "transform",
                  `translate(${e.transform.x},${e.transform.y}) scale(${e.transform.k})`
                );
              })
          )
          .on("dblclick.zoom", null);

        // 创建一个 tooltip 元素，初始隐藏
        const tooltip = d3
          .select(this.$refs.graphContainer)
          .append("div")
          .style("position", "absolute")
          .style("background-color", "#fff")
          .style("border", "1px solid #ccc")
          .style("padding", "5px")
          .style("border-radius", "5px")
          .style("visibility", "hidden")
          .style("font-size", "12px")
          .style("color", "#333");

        // 添加节点标签
        g.selectAll("foreignObject") // 使用 foreignObject 包裹文本，使其支持换行和换页
          .data(this.data.nodes)
          .enter()
          .append("foreignObject")
          .attr("x", (d) => {
            if (d.type != "Switch") {
              return d.x - 30;
            } else {
              const theta = (d.direction * Math.PI) / 180;
              const cosTheta = Math.cos(theta);
              const type = this.nodeIcons[d.type]
                ? this.nodeIcons[d.type]
                : this.nodeIcons.type1;
              return d.x - (type.width * cosTheta) / 2 - 30;
            }
          }) // 偏移，使文本居中
          .attr("y", (d) => {
            const type = this.nodeIcons[d.type]
              ? this.nodeIcons[d.type]
              : this.nodeIcons.type1;
            if (d.type == "Switch") {
              const theta = d.direction % 360;
              let y =
                d.y +
                (type.height * Math.abs(Math.cos((theta * Math.PI) / 180))) /
                  2 +
                6;
              if (theta > 180) {
                y +=
                  type.width *
                  Math.abs(Math.sin((theta - 180 * Math.PI) / 180));
              }
              return y;
            } else if (d.direction % 180 != 0 && d.direction % 90 == 0) {
              return d.y + type.width / 2 + 6;
            } else {
              return d.y + type.height / 2 + 6;
            }
          })
          .attr("width", 60)
          .attr("height", 120)
          .append("xhtml:div")
          .style("color", (d) => (d.type === "Switch" ? "#0000ff" : "#000000")) // 根据节点类型设置颜色，这里以Switch为例
          .style("font-size", "8px")
          .style("text-align", "center")
          .style("word-wrap", "break-word")
          .style("overflow-wrap", "break-word")
          .text((d) => d.label);

        // 绘制连线
        g.selectAll("line")
          .data(this.data.edges)
          .enter()
          .append("line")
          .attr(
            "x1",
            (d) => this.data.nodes.find((node) => node.id == d.sourceId).x
          )
          .attr(
            "y1",
            (d) => this.data.nodes.find((node) => node.id == d.sourceId).y
          )
          .attr(
            "x2",
            (d) => this.data.nodes.find((node) => node.id == d.targetId).x
          )
          .attr(
            "y2",
            (d) => this.data.nodes.find((node) => node.id == d.targetId).y
          )
          .attr("stroke", (d) =>
            this.linkStyles[d.style]
              ? this.linkStyles[d.style].stroke
              : this.linkStyles.solid.stroke
          )
          .attr("stroke-width", (d) =>
            this.linkStyles[d.style]
              ? this.linkStyles[d.style].strokeWidth
              : this.linkStyles.solid.strokeWidth
          )
          .attr("stroke-dasharray", (d) =>
            this.linkStyles[d.style]
              ? this.linkStyles[d.style].strokeDasharray
              : this.linkStyles.solid.strokeDasharray
          )
          .on("mouseover", (event, d) => {
            console.log("line: mouseover");
            console.log(d.type);
            if (d.type === "ACL") {
              console.log("is an ACL");
              tooltip
                .html(`ACL<br>ID: ${d.id}<br>Label: ${d.label}`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY + 10}px`)
                .style("visibility", "visible");
            }
          })
          .on("mousemove", (event, d) => {
            if (d.type === "ACL") {
              tooltip
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY + 10}px`);
            }
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
          });

        // 绘制连线电流（不去重 只考虑起始节点）
        g.selectAll("circle.start")
          .data(
            this.data.edges.filter((d) => {
              const sourceNode = this.data.nodes.find(
                (node) => node.id === d.sourceId
              );
              const targetNode = this.data.nodes.find(
                (node) => node.id === d.targetId
              );
              // 仅保留非 "Switch" 类型的边
              return sourceNode.type !== "Switch";
            })
          )
          .enter()
          .append("circle")
          .attr("class", "start")
          .attr("cx", (d) => {
            const sourceNode = this.data.nodes.find(
              (node) => node.id === d.sourceId
            );
            const targetNode = this.data.nodes.find(
              (node) => node.id === d.targetId
            );
            return this.getPointOnLine(sourceNode, targetNode, 3).x;
          })
          .attr("cy", (d) => {
            const sourceNode = this.data.nodes.find(
              (node) => node.id === d.sourceId
            );
            const targetNode = this.data.nodes.find(
              (node) => node.id === d.targetId
            );
            return this.getPointOnLine(sourceNode, targetNode, 3).y;
          })
          .attr("r", 2.5)
          .attr("stroke", "blue")
          .attr("fill", "none");

        // 绘制节点图标
        g.selectAll("image")
          .data(this.data.nodes)
          .enter()
          .append("image")
          .attr("xlink:href", (d) =>
            this.nodeIcons[d.type]
              ? this.nodeIcons[d.type].src
              : this.nodeIcons.type1.src
          )
          .attr("width", (d) =>
            this.nodeIcons[d.type]
              ? this.nodeIcons[d.type].width
              : this.nodeIcons.type1.width
          )
          .attr("height", (d) =>
            this.nodeIcons[d.type]
              ? this.nodeIcons[d.type].height
              : this.nodeIcons.type1.height
          )
          .attr(
            "x",
            (d) =>
              d.x -
              (this.nodeIcons[d.type]
                ? this.nodeIcons[d.type].width
                : this.nodeIcons.type1.width) /
                (d.type == "Switch" ? 1 : 2)
          )
          .attr(
            "y",
            (d) =>
              d.y -
              (this.nodeIcons[d.type]
                ? this.nodeIcons[d.type].height
                : this.nodeIcons.type1.height) /
                2
          )
          .attr("transform", (d) =>
            // 旋转 90 度，以图标中心为中心旋转
            d.type == "Load" ? "none" : `rotate(${d.direction}, ${d.x}, ${d.y})`
          )
          .on("mouseover", (event, d) => {
            // 当鼠标悬浮在节点上时，显示 tooltip
            tooltip
              .html(`ID: ${d.id}<br>Label: ${d.label}`)
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY + 10}px`)
              .style("visibility", "visible");
          })
          .on("mousemove", (event) => {
            // 当鼠标移动时，更新 tooltip 位置
            tooltip
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY + 10}px`);
          })
          .on("mouseout", () => {
            // 当鼠标离开节点时，隐藏 tooltip
            tooltip.style("visibility", "hidden");
          })
          .on("click", (event, d) => {
            // 图标点击事件（用于后续节点开闭的svg切换）
            if (d.type === "Load") {
              this.formState.name = d.id;
              this.activeKey = 3;
            }
          });
      });
    },
    getPointOnLine(sourceNode, targetNode, r0) {
      const x1 = sourceNode.x;
      const y1 = sourceNode.y;
      const x2 = targetNode.x;
      const y2 = targetNode.y;
      const sourceDircetion = sourceNode.direction;
      const info = this.nodeIcons[sourceNode.type]
        ? this.nodeIcons[sourceNode.type]
        : this.nodeIcons.type1;
      const L = info.width;
      const W = info.height;

      if (info.isCircle) {
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const t = (L / 2 + r0) / length;
        return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
      } else {
        const theta = (sourceDircetion * Math.PI) / 180;
        const deltaX = x2 - x1;
        const deltaY = y2 - y1;

        const cosTheta = Math.cos(-theta);
        const sinTheta = Math.sin(-theta);

        // 将方向向量旋转到新的坐标系
        const DxPrime = deltaX * cosTheta - deltaY * sinTheta;
        const DyPrime = deltaX * sinTheta + deltaY * cosTheta;

        if (sourceDircetion % 180 == 0) {
          if (x1 == x2) {
            return {
              x: x1,
              y: y2 > y1 ? y1 + (W / 2 + r0) : y1 - (W / 2 + r0),
            };
          }
          if (y1 == y2) {
            return {
              x: x2 > x1 ? x1 + (L / 2 + r0) : x1 - (L / 2 + r0),
              y: y1,
            };
          }
        }

        if (sourceDircetion % 90 == 0) {
          if (x1 == x2) {
            return {
              x: x1,
              y: y2 > y1 ? y1 + (L / 2 + r0) : y1 - (L / 2 + r0),
            };
          }
          if (y1 == y2) {
            return {
              x: x2 > x1 ? x1 + (W / 2 + r0) : x1 - (W / 2 + r0),
              y: y1,
            };
          }
        }

        // 如果方向向量为零，无法确定直线
        if (DxPrime === 0 && DyPrime === 0) {
          console.log("无法确定直线 l");
          return { x: null, y: null };
        }

        // 判断与哪一条边相切
        const tValues = [];
        if (DxPrime !== 0) {
          const tRight = (r0 + L / 2) / DxPrime;
          const xPrime = tRight * DxPrime;
          const yPrime = tRight * DyPrime;
          const yContact = yPrime;
          if (xPrime >= L / 2 && yContact >= -W / 2 && yContact <= W / 2) {
            tValues.push({ t: tRight, side: "right" });
          }
        }

        if (DxPrime !== 0) {
          const tLeft = (-r0 - L / 2) / DxPrime;
          const xPrime = tLeft * DxPrime;
          const yPrime = tLeft * DyPrime;
          const yContact = yPrime;
          if (xPrime <= -L / 2 && yContact >= -W / 2 && yContact <= W / 2) {
            tValues.push({ t: tLeft, side: "left" });
          }
        }

        if (DyPrime !== 0) {
          const tTop = (r0 + W / 2) / DyPrime;
          const xPrime = tTop * DxPrime;
          const yPrime = tTop * DyPrime;
          const xContact = xPrime;
          if (yPrime >= W / 2 && xContact >= -L / 2 && xContact <= L / 2) {
            tValues.push({ t: tTop, side: "top" });
          }
        }

        if (DyPrime !== 0) {
          const tBottom = (-r0 - W / 2) / DyPrime;
          const xPrime = tBottom * DxPrime;
          const yPrime = tBottom * DyPrime;
          const xContact = xPrime;
          if (yPrime <= -W / 2 && xContact >= -L / 2 && xContact <= L / 2) {
            tValues.push({ t: tBottom, side: "bottom" });
          }
        }

        if (tValues.length === 0) {
          console.log("未找到满足条件的点");
          return { x: null, y: null };
        }

        const positiveTValues = tValues.filter((item) => item.t > 0);
        if (positiveTValues.length === 0) {
          console.log("未找到正的 t 值");
          return { x: null, y: null };
        }
        const minTItem = positiveTValues.reduce((prev, curr) =>
          prev.t < curr.t ? prev : curr
        );
        const t = minTItem.t;
        const xPrime = t * DxPrime;
        const yPrime = t * DyPrime;

        // 将坐标转换回原始坐标系
        const cosThetaOrig = Math.cos(theta);
        const sinThetaOrig = Math.sin(theta);
        const x = x1 + xPrime * cosThetaOrig - yPrime * sinThetaOrig;
        const y = y1 + xPrime * sinThetaOrig + yPrime * cosThetaOrig;

        return { x, y };
      }
    },
    onSelect(selectedKeys, info) {
      if (info.node.children && info.node.children.length > 0) {
        return;
      } else {
        this.searchId = selectedKeys[0];
        this.refreshGraph();
      }
    },
    onMeasurementSubmit() {
      const hour = dayjs(this.formState.moment).hour();
      const minute = dayjs(this.formState.moment).minute();
      let timeIndex = hour * 2 + minute / 30;
      getMeasurementData({
        deviceId: this.formState.name,
        date: this.formState.date,
        timeStamp: timeIndex,
      }).then((res) => {
        this.measurementRes = res.data.data;
      });
    },
    onMeasurementReset() {
      this.formState = {
        name: "",
        date: "10",
        moment: "",
      };
      this.measurementRes = [];
    },
  },
};
</script>

<style scoped>
.wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: start;
  display: flex;
  padding: 20px;
  gap: 20px;
}

.collapse-container {
  width: 350px;
}

.input {
  width: 200px;
  margin-right: 10px;
}

.tree-container {
  margin-top: 5px;
  height: 70vh;
  overflow: scroll;
}

.data-line {
  margin-bottom: 0;
}

.graph-container {
  height: 100%;
  flex: 1;
  justify-content: end;
  align-items: center;
  border: #d9d9d9 solid 1px;
  border-radius: 10px;
  overflow: hidden; /* 隐藏溢出内容 */
}
</style>
