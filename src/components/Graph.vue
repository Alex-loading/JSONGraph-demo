<template>
  <div ref="graphContainer" class="graph-container"></div>
</template>

<script>
import * as d3 from "d3";
import type1Icon from "../components/icons/type1.svg"
import type2Icon from "../components/icons/type2.svg"
import type3Icon from "../components/icons/type3.svg"
import type4Icon from "../components/icons/type4.svg"

export default {
  name: "RelationGraph",
  data() {
    return {
      nodes: [
        {id: 1, label: "Node A", type: "type1", x: 50, y: 150},
        {id: 2, label: "Node B", type: "type2", x: 150, y: 150},
        {id: 3, label: "Node C", type: "type3", x: 250, y: 150},
        {id: 4, label: "Node D", type: "type2", x: 250, y: 250},
        {id: 5, label: "Node E", type: "type3", x: 350, y: 150},
        {id: 6, label: "Node F", type: "type4", x: 250, y: 350},
      ],
      links: [
        {id: 1, label: "Link 1", type: "dotted", sourceId: 1, targetId: 2},
        {id: 3, label: "Link 2", type: "dotted", sourceId: 3, targetId: 4},
        {id: 4, label: "Link 3", type: "solid", sourceId: 2, targetId: 3},
        {id: 5, label: "Link 4", type: "solid", sourceId: 3, targetId: 5},
        {id: 6, label: "Link 4", type: "solid", sourceId: 4, targetId: 6},
      ],
      nodeIcons: {
        type1: {src: type1Icon, width: 40, height: 40},
        type2: {src: type2Icon, width: 40, height: 20},
        type3: {src: type3Icon, width: 20, height: 20},
        type4: {src: type4Icon, width: 20, height: 20},
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
          .data(this.links)
          .enter()
          .append("line")
          .attr("x1", (d) => this.nodes.find((node) => node.id === d.sourceId).x)
          .attr("y1", (d) => this.nodes.find((node) => node.id === d.sourceId).y)
          .attr("x2", (d) => this.nodes.find((node) => node.id === d.targetId).x)
          .attr("y2", (d) => this.nodes.find((node) => node.id === d.targetId).y)
          .attr("stroke", (d) => this.linkStyles[d.type].stroke)
          .attr("stroke-width", (d) => this.linkStyles[d.type].strokeWidth)
          .attr("stroke-dasharray", (d) => this.linkStyles[d.type].strokeDasharray);

      // 绘制节点图标
      svg
          .selectAll("image")
          .data(this.nodes)
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
          .data(this.nodes)
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
