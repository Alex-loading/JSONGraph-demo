<template>
  <div class="wrapper">
    <div class="search-container">
      <input class="input" v-model="searchId" placeholder="请输入查询id" >
      <button class="search" @click="refreshGraph">查询</button>
    </div>
    <div ref="graphContainer" class="graph-container" :key="searchCount"></div>
  </div>
</template>

<script>
import * as d3 from "d3";
import type1Icon from "../components/icons/type1.svg"
import ACLineSegment from "../components/icons/ACLineSegment.svg"
import Disconnector from "../components/icons/Disconnector.svg"
import Load from "../components/icons/Load.svg"
import Switch from "../components/icons/Switch.svg"
import ConnectivityNode from "../components/icons/ConnectivityNode.svg"
import Breaker from "../components/icons/Breaker.svg"
import BusbarSection from "../components/icons/BusbarSection.svg"
import {getGraphData} from "@/api/graph.ts";

export default {
  name: "RelationGraph",
  data() {
    return {
      data: {
        nodes: [],
        edges: []
      },
      nodeIcons: {
        type1: {src: type1Icon, width: 40, height: 40},
        ACLineSegment: {src: ACLineSegment, width: 40, height: 40},
        Disconnector: {src: Disconnector, width: 40, height: 40},
        Load: {src: Load, width: 20, height: 20},
        Switch: {src: Switch, width: 40, height: 20},
        ConnectivityNode: {src: ConnectivityNode, width: 40, height: 40},
        Breaker: {src: Breaker, width: 40, height: 20},
        BusbarSection: {src: BusbarSection, width: 40, height: 20},
      },
      linkStyles: {
        solid: { stroke: "#000000", strokeWidth: 2, strokeDasharray: "0" },
        dotted: { stroke: "#000000", strokeWidth: 2, strokeDasharray: "2,2" },
        ConnectivityEdge: { stroke: "#000000", strokeWidth: 2, strokeDasharray: "0"}
      },
      searchCount: 0,
      searchId: "",
    };
  },
  methods: {
    refreshGraph() {
      this.searchCount += 1;
      this.createGraph();
    },
    createGraph() {
      getGraphData(this.searchId).then(res => {
        console.log(res)
        this.data = res.data.data
        console.log("data", this.data)

        const svg = d3
            .select(this.$refs.graphContainer)
            .append("svg")
            .attr("width", 2000)
            .attr("height", 2000)
            .style("transform-origin", "0 0");

        // 初始化缩放行为
        svg
            .call(
                d3
                    .zoom()
                    .scaleExtent([0.8, 3])
                    .on("zoom", (e) => {
                      svg.attr("transform", () => {
                        return `translate(${e.transform.x},${e.transform.y}) scale(${e.transform.k})`;
                      });
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

        // 绘制连线
        svg
            .selectAll("line")
            .data(this.data.edges)
            .enter()
            .append("line")
            .attr("x1", (d) => this.data.nodes.find((node) => node.id === d.sourceId).x)
            .attr("y1", (d) => this.data.nodes.find((node) => node.id === d.sourceId).y)
            .attr("x2", (d) => this.data.nodes.find((node) => node.id === d.targetId).x)
            .attr("y2", (d) => this.data.nodes.find((node) => node.id === d.targetId).y)
            .attr("stroke", (d) => this.linkStyles[d.type].stroke)
            .attr("stroke-width", (d) => this.linkStyles[d.type].strokeWidth)
            .attr("stroke-dasharray", (d) => this.linkStyles[d.type].strokeDasharray);

        // 绘制节点图标
        svg
            .selectAll("image")
            .data(this.data.nodes)
            .enter()
            .append("image")
            // .attr("xlink:href", (d) => this.nodeIcons[d.type].src) // 根据节点type选择图标
            // .attr("width", (d) => this.nodeIcons[d.type].width)
            // .attr("height", (d) => this.nodeIcons[d.type].height)
            .attr("xlink:href", (d) => (this.nodeIcons[d.type] ? this.nodeIcons[d.type].src : this.nodeIcons.type1.src))
            .attr("width", (d) => (this.nodeIcons[d.type] ? this.nodeIcons[d.type].width : this.nodeIcons.type1.width))
            .attr("height", (d) => (this.nodeIcons[d.type] ? this.nodeIcons[d.type].height : this.nodeIcons.type1.height))
            .attr("x", (d) => d.x - (this.nodeIcons[d.type] ? this.nodeIcons[d.type].width : this.nodeIcons.type1.width) / 2) // 调整图标位置使其居中
            .attr("y", (d) => d.y - ((this.nodeIcons[d.type] ? this.nodeIcons[d.type].height : this.nodeIcons.type1.height)) / 2)
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
            });

        // 添加节点标签
        svg
            .selectAll("foreignObject")
            .data(this.data.nodes)
            .enter()
            .append("foreignObject")
            .attr("x", (d) => d.x - 30) // 偏移，使文本居中
            .attr("y", (d) => d.y + ((this.nodeIcons[d.type] ? this.nodeIcons[d.type].height : this.nodeIcons.type1.height)) / 2)
            .attr("width", 60)
            .attr("height", 120)
            .append("xhtml:div")
            .style("color", (d) => d.type === "Switch" ? "#0000ff" : "#000000")
            .style("font-size", "8px")
            .style("text-align", "center")
            .style("word-wrap", "break-word")
            .style("overflow-wrap", "break-word")
            .text((d) => d.label);
      })
    },
  },
};
</script>

<style scoped>
.wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.search-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  .input{
    width: 160px;
    margin-right: 10px;
    height: 30px;
  }
  .search{
    height: 30px;
  }
}
.graph-container {
  height: 800px;
  width: 80%;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  border: #282828 solid 1px;
  overflow: hidden; /* 隐藏溢出内容 */
}
</style>
