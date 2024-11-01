<template>
  <div ref="graphContainer" class="graph-container"></div>
</template>

<script>
import * as d3 from "d3";
import type1Icon from "../components/icons/type1.svg"
import type2Icon from "../components/icons/type2.svg"

export default {
  name: "RelationGraph",
  data() {
    return {
      nodes: [
        {id: 1, label: "Node A", type: "type1", x: 100, y: 150},
        {id: 2, label: "Node B", type: "type2", x: 300, y: 250},
        {id: 3, label: "Node C", type: "type1", x: 200, y: 400},
        {id: 4, label: "Node D", type: "type2", x: 400, y: 350},
      ],
      links: [
        {id: 1, label: "Link 1", type: "solid", sourceId: 1, targetId: 2},
        {id: 2, label: "Link 2", type: "dashed", sourceId: 1, targetId: 3},
        {id: 3, label: "Link 3", type: "dotted", sourceId: 2, targetId: 4},
        {id: 4, label: "Link 4", type: "dotted", sourceId: 2, targetId: 3},
      ],
      nodeIcons: {
        type1: {src: type1Icon, width: 400, height: 40},
        type2: {src: type2Icon, width: 40, height: 40},
      },
      linkStyles: {
        solid: { stroke: "#aaa", strokeWidth: 2, strokeDasharray: "0" },
        dashed: { stroke: "#aaa", strokeWidth: 2, strokeDasharray: "5,5" },
        dotted: { stroke: "#aaa", strokeWidth: 2, strokeDasharray: "2,2" },
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
          .attr("x", (d) => d.x + 12)
          .attr("y", (d) => d.y + 4)
          .text((d) => d.label)
          .attr("fill", "#333")
          .attr("font-size", "12px");


      // 添加连线标签
      svg
          .selectAll("text.link-label")
          .data(this.links)
          .enter()
          .append("text")
          .attr("class", "link-label")
          .attr("x", (d) => {
            const sourceNode = this.nodes.find((node) => node.id === d.sourceId);
            const targetNode = this.nodes.find((node) => node.id === d.targetId);
            return (sourceNode.x + targetNode.x) / 2;
          })
          .attr("y", (d) => {
            const sourceNode = this.nodes.find((node) => node.id === d.sourceId);
            const targetNode = this.nodes.find((node) => node.id === d.targetId);
            return (sourceNode.y + targetNode.y) / 2;
          })
          .text((d) => d.label)
          .attr("fill", "#666")
          .attr("font-size", "10px")
          .attr("text-anchor", "middle");
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
