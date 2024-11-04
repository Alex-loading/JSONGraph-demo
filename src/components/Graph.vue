<template>
  <div ref="graphContainer" class="graph-container"></div>
</template>

<script>
import * as d3 from "d3";
import type1Icon from "../components/icons/type1.svg"
// import ACLineSegment from "../components/icons/ACLineSegment.svg"
// import Disconnector from "../components/icons/Disconnector.svg"
import Load from "../components/icons/Load.svg"
import Switch from "../components/icons/Switch.svg"
// import ConnectivityNode from "../components/icons/ConnectivityNode.svg"
import Breaker from "../components/icons/Breaker.svg"
import BusbarSection from "../components/icons/BusbarSection.svg"

export default {
  name: "RelationGraph",
  data() {
    return {
      data: {
        nodes: [
          {id: 1, label: "Node A", type: "type1", x: 50, y: 150},
          {id: 2, label: "Node B", type: "Switch", x: 150, y: 150},
          {id: 3, label: "Node C", type: "Load", x: 250, y: 150},
          {id: 4, label: "Node D", type: "Breaker", x: 250, y: 250},
          {id: 5, label: "Node E", type: "Load", x: 350, y: 150},
          {id: 6, label: "Node F", type: "BusbarSection", x: 250, y: 350},
        ],
        links: [
          {id: 1, label: "Link 1", type: "dotted", sourceId: 1, targetId: 2},
          {id: 3, label: "Link 2", type: "dotted", sourceId: 3, targetId: 4},
          {id: 4, label: "Link 3", type: "solid", sourceId: 2, targetId: 3},
          {id: 5, label: "Link 4", type: "solid", sourceId: 3, targetId: 5},
          {id: 6, label: "Link 4", type: "solid", sourceId: 4, targetId: 6},
        ],
      },
      nodeIcons: {
        type1: {src: type1Icon, width: 40, height: 40},
        // ACLineSegment: {src: ACLineSegment, width: 40, height: 40},
        // Disconnector: {src: Disconnector, width: 40, height: 40},
        Load: {src: Load, width: 20, height: 20},
        Switch: {src: Switch, width: 40, height: 20},
        // ConnectivityNode: {src: ConnectivityNode, width: 40, height: 40},
        Breaker: {src: Breaker, width: 40, height: 20},
        BusbarSection: {src: BusbarSection, width: 20, height: 20},

      },
      linkStyles: {
        solid: { stroke: "#000000", strokeWidth: 2, strokeDasharray: "0" },
        dotted: { stroke: "#000000", strokeWidth: 2, strokeDasharray: "2,2" },
      },
    };
  },
  mounted() {
    this.createGraph();
  },
  methods: {
    createGraph() {
      const svg = d3
          .select(this.$refs.graphContainer)
          .append("svg")
          .attr("width", 500)
          .attr("height", 500);

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
          .data(this.data.links)
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
          .attr("xlink:href", (d) => this.nodeIcons[d.type].src) // 根据节点type选择图标
          .attr("x", (d) => d.x - this.nodeIcons[d.type].width / 2) // 调整图标位置使其居中
          .attr("y", (d) => d.y - this.nodeIcons[d.type].height / 2)
          .attr("width", (d) => this.nodeIcons[d.type].width)
          .attr("height", (d) => this.nodeIcons[d.type].height)
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
          .selectAll("text")
          .data(this.data.nodes)
          .enter()
          .append("text")
          .attr("x", (d) => d.x)
          .attr("y", (d) => d.y + this.nodeIcons[d.type].height)
          .text((d) => d.label)
          .attr("fill", (d) => d.type === "type2" ? "#0000ff" :"#000000")
          .attr("font-size", "12px")
          .attr("text-anchor", "middle");


      // // 添加连线标签
      // svg
      //     .selectAll("text.link-label")
      //     .data(this.links)
      //     .enter()
      //     .append("text")
      //     .attr("class", "link-label")
      //     .attr("x", (d) => {
      //       const sourceNode = this.nodes.find((node) => node.id === d.sourceId);
      //       const targetNode = this.nodes.find((node) => node.id === d.targetId);
      //       return (sourceNode.x + targetNode.x) / 2;
      //     })
      //     .attr("y", (d) => {
      //       const sourceNode = this.nodes.find((node) => node.id === d.sourceId);
      //       const targetNode = this.nodes.find((node) => node.id === d.targetId);
      //       return (sourceNode.y + targetNode.y) / 2;
      //     })
      //     .text((d) => d.label)
      //     .attr("fill", "#666")
      //     .attr("font-size", "10px")
      //     .attr("text-anchor", "middle");
    },
  },
};
</script>

<style scoped>
.graph-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}
</style>
