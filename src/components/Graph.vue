<template>
  <div class="wrapper">
    <div class="input-container">
      <a-input
        class="input"
        v-model:value="searchId"
        placeholder="请输入查询id"
      />
      <a-button class="search" @click="refreshGraph" type="primary"
        >查询</a-button
      >
    </div>
    <div ref="graphContainer" class="graph-container" :key="searchCount"></div>
    <deployment
      :graphId="searchId"
      :mode="mode"
      @handleMasterNodeVisible="handleMasterNodeVisible"
      @handleNewNodeVisible="handleNewNodeVisible"
      @handleIdentificationVisible="handleIdentificationVisible"
      @handleCompletionVisible="handleCompletionVisible"
      @handleExistNodeVisible="handleExistNodeVisible"
    />
  </div>
</template>

<script>
import * as d3 from "d3";
import dayjs from "dayjs";
import { getGraphData } from "@/api/graph";
import Deployment from "@/components/Deployment.vue";
import { nodeIcons, linkStyles } from "@/assets/graphStyle.js";

export default {
  components: { Deployment },
  name: "RelationGraph",
  props: {
    mode: {
      type: String,
      required: true,
      validator: (value) => ['topology', 'measure'].includes(value)
    }
  },
  data() {
    return {
      data: {
        nodes: [],
        edges: [],
      },
      searchCount: 0,
      searchId: "10DKX-372305",
    };
  },
  computed: {
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
              const type = nodeIcons[d.type]
                ? nodeIcons[d.type]
                : nodeIcons.type1;
              return d.x - (type.width * cosTheta) / 2 - 30;
            }
          }) // 偏移，使文本居中
          .attr("y", (d) => {
            const type = nodeIcons[d.type]
              ? nodeIcons[d.type]
              : nodeIcons.type1;
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
            linkStyles[d.style]
              ? linkStyles[d.style].stroke
              : linkStyles.solid.stroke
          )
          .attr("stroke-width", (d) =>
            linkStyles[d.style]
              ? linkStyles[d.style].strokeWidth
              : linkStyles.solid.strokeWidth
          )
          .attr("stroke-dasharray", (d) =>
            linkStyles[d.style]
              ? linkStyles[d.style].strokeDasharray
              : linkStyles.solid.strokeDasharray
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
          })
          .text(function(d) { return d.id; });

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
            nodeIcons[d.type] ? nodeIcons[d.type].src : nodeIcons.type1.src
          )
          .attr("width", (d) =>
            nodeIcons[d.type] ? nodeIcons[d.type].width : nodeIcons.type1.width
          )
          .attr("height", (d) =>
            nodeIcons[d.type]
              ? nodeIcons[d.type].height
              : nodeIcons.type1.height
          )
          .attr(
            "x",
            (d) =>
              d.x -
              (nodeIcons[d.type]
                ? nodeIcons[d.type].width
                : nodeIcons.type1.width) /
                (d.type == "Switch" ? 1 : 2)
          )
          .attr(
            "y",
            (d) =>
              d.y -
              (nodeIcons[d.type]
                ? nodeIcons[d.type].height
                : nodeIcons.type1.height) /
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
          });
      });
    },
    getPointOnLine(sourceNode, targetNode, r0) {
      const x1 = sourceNode.x;
      const y1 = sourceNode.y;
      const x2 = targetNode.x;
      const y2 = targetNode.y;
      const sourceDircetion = sourceNode.direction;
      const info = nodeIcons[sourceNode.type]
        ? nodeIcons[sourceNode.type]
        : nodeIcons.type1;
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
    handleNodeVisibility(isVisible, nodeSet, iconType) {
      console.log(`Node visibility update - Type: ${iconType}`, isVisible, nodeSet);
      const svg = d3.select(this.$refs.graphContainer).select("svg");
      if (svg.empty()) return;
      const g = svg.select("g");

      const nodeIds = nodeSet.reduce((acc, id) => (acc[id] = true, acc), {});
      g.selectAll("image")
        .filter(d => nodeIds[d.id])
        .attr("href", d => isVisible ? nodeIcons[iconType].src : nodeIcons[d.type].src)
        .attr("xlink:href", d => isVisible ? nodeIcons[iconType].src : nodeIcons[d.type].src); // 兼容旧浏览器
    },
    handleNewACLVisibility(isVisible, lineSet) {
      const svg = d3.select(this.$refs.graphContainer).select("svg");
      if (svg.empty()) return;
      const g = svg.select("g");

      const idSet = new Set(Array.isArray(lineSet) ? lineSet : []);
      const aclEdges = this.data.edges.filter(
        (edge) => edge.type === "ACL" && idSet.has(edge.id)
      );

      const iconInfo = nodeIcons.NewPosition || nodeIcons.type1;

      if (!isVisible) {
        // 仅移除匹配到的 ACL 中点图例，避免误删其它标记
        g
          .selectAll("image.acl-newposition")
          .filter((d) => idSet.has(d.id))
          .remove();
        return;
      }

      // 通过数据绑定在连线中点绘制/更新图例
      const markers = g
        .selectAll("image.acl-newposition")
        .data(aclEdges, (d) => d.id);

      // 退出：删除不再需要的图例
      markers.exit().remove();

      // 进入：为新数据添加图例
      markers
        .enter()
        .append("image")
        .attr("class", "acl-newposition")
        .attr("width", iconInfo.width)
        .attr("height", iconInfo.height)
        .attr("xlink:href", iconInfo.src)
        .attr("href", iconInfo.src)
        .attr("pointer-events", "none")
        .merge(markers)
        .attr("x", (d) => {
          const sourceNode = this.data.nodes.find((n) => n.id === d.sourceId);
          const targetNode = this.data.nodes.find((n) => n.id === d.targetId);
          const mx = (sourceNode.x + targetNode.x) / 2;
          return mx - iconInfo.width / 2;
        })
        .attr("y", (d) => {
          const sourceNode = this.data.nodes.find((n) => n.id === d.sourceId);
          const targetNode = this.data.nodes.find((n) => n.id === d.targetId);
          const my = (sourceNode.y + targetNode.y) / 2;
          return my - iconInfo.height / 2;
        });
    },
    handleMasterNodeVisible(isVisible, masterNode) {
      this.handleNodeVisibility(isVisible, masterNode, 'MasterPosition');
    },
    handleNewNodeVisible(isVisible, newNode) {
      this.handleNodeVisibility(isVisible, newNode, 'NewPosition');
      this.handleNewACLVisibility(isVisible, newNode);
    },
    handleExistNodeVisible(isVisible, existNode) {
      this.handleNodeVisibility(isVisible, existNode, 'ExistPosition');
    },
    handleIdentificationVisible(isVisible, identificationNode) {
      const svg = d3.select(this.$refs.graphContainer).select("svg");
      if (svg.empty()) return;
      const g = svg.select("g");
      
      // 创建id到status的映射
      const idStatusMap = {};
      identificationNode.forEach(item => {
        idStatusMap[item.switch_id] = item.current_status;
      });
      
      // 获取所有需要更新的节点id
      const nodeIds = identificationNode.map(item => item.switch_id);
      
      g.selectAll("image")
        .filter(d => nodeIds.includes(d.id))
        .attr("href", d => {
          if (!isVisible) {
            return nodeIcons[d.type].src;
          }
          // 根据status决定显示哪个图标
          const status = idStatusMap[d.id];
          return status? nodeIcons.switchConnect.src : nodeIcons.switchDisconnect.src;
        })
        .attr("xlink:href", d => {
          if (!isVisible) {
            return nodeIcons[d.type].src;
          }
          // 根据status决定显示哪个图标
          const status = idStatusMap[d.id];
          return status? nodeIcons.switchConnect.src : nodeIcons.switchDisconnect.src;
        }); // 兼容旧浏览器
    },
    handleCompletionVisible(isVisible, missingFromTo, missingConnectionLines) {
      console.log("handleCompletionVisible", isVisible, missingFromTo, missingConnectionLines);
      const svg = d3.select(this.$refs.graphContainer).select("svg");
      if (svg.empty()) return;
      const g = svg.select("g");
      
      // 根据 missingFromTo 和 missingConnectionLines 构建补全的 line 合集
      const completionLines = [];
      
      // 处理 missingFromTo 中的 from_bus 和 to_bus
      if (missingFromTo && Array.isArray(missingFromTo)) {
        missingFromTo.forEach(item => {
          if (item.from_bus && item.to_bus) {
            completionLines.push({
              from: item.from_bus,
              to: item.to_bus,
              status: true // 假设补全的连接线都是连接状态
            });
          }
        });
      }
      
             // 处理 missingConnectionLines 中的 line_id
       if (missingConnectionLines && Array.isArray(missingConnectionLines)) {
         missingConnectionLines.forEach(item => {
           if (item.line_id) {
             // 根据 line_id 在 edges 中查找对应的边，获取 sourceId 和 targetId
             const matchingEdge = this.data.edges.find(edge => edge.id === item.line_id);
             if (matchingEdge) {
               completionLines.push({
                 id: item.line_id,
                 from: matchingEdge.sourceId,
                 to: matchingEdge.targetId,
                 status: true // 假设补全的连接线都是连接状态
               });
             }
           }
         });
       }
      
      // 创建 from-to 到 status 的映射
      const lineStatusMap = {};
      completionLines.forEach(item => {
        // 创建双向映射，因为边的方向可能是 sourceId->targetId 或 targetId->sourceId
        const key1 = `${item.from}-${item.to}`;
        const key2 = `${item.to}-${item.from}`;
        lineStatusMap[key1] = item.status;
        lineStatusMap[key2] = item.status;
      });
      
      g.selectAll("line")
        .attr("stroke", d => {
          const key1 = `${d.sourceId}-${d.targetId}`;
          const key2 = `${d.targetId}-${d.sourceId}`;
          
          if (!isVisible) {
            return linkStyles[d.style] ? linkStyles[d.style].stroke : linkStyles.solid.stroke;
          }
          if (lineStatusMap.hasOwnProperty(key1) || lineStatusMap.hasOwnProperty(key2)) {
            return "blue";
          }
          return linkStyles[d.style] ? linkStyles[d.style].stroke : linkStyles.solid.stroke;
        })
        .attr("stroke-dasharray", d => {
          const key1 = `${d.sourceId}-${d.targetId}`;
          const key2 = `${d.targetId}-${d.sourceId}`;
          
          if (!isVisible) {
            return linkStyles[d.style] ? linkStyles[d.style].strokeDasharray : linkStyles.solid.strokeDasharray;
          }
          const status = lineStatusMap[key1] !== undefined ? lineStatusMap[key1] : lineStatusMap[key2];
          if (status !== undefined) {
            return status ? "none" : "2, 4"; // 连接用实线，断开用虚线
          }
          return linkStyles[d.style] ? linkStyles[d.style].strokeDasharray : linkStyles.solid.strokeDasharray;
        });

      // 当显示完成度效果时，让显示为实线的连线闪烁两次
      if (isVisible) {
        const linesToBlink = g.selectAll("line").filter(d => {
          const key1 = `${d.sourceId}-${d.targetId}`;
          const key2 = `${d.targetId}-${d.sourceId}`;
          const status = lineStatusMap[key1] !== undefined ? lineStatusMap[key1] : lineStatusMap[key2];
          return !!status; // 任何 truthy 状态均视为连接（需要实线）
        });

        const getBaseWidth = (d) => (linkStyles[d.style] ? linkStyles[d.style].strokeWidth : linkStyles.solid.strokeWidth);

        // 终止可能已有的动画并重置不透明度/宽度
        linesToBlink.interrupt()
          .attr("stroke-opacity", 1)
          .attr("stroke-width", d => getBaseWidth(d));

        // 闪烁两次（0 -> 1 更明显，同时放大线宽）
        let sel = linesToBlink;
        for (let i = 0; i < 4; i += 1) {
          sel = sel
            .transition()
            .duration(200)
            .ease(d3.easeLinear)
            .attr("stroke-opacity", 0)
            .attr("stroke-width", d => getBaseWidth(d) * 1.8)
            .transition()
            .duration(200)
            .ease(d3.easeLinear)
            .attr("stroke-opacity", 1)
            .attr("stroke-width", d => getBaseWidth(d));
        }
      } else {
        // 关闭效果时重置所有连线的不透明度并中断动画
        g.selectAll("line").interrupt().attr("stroke-opacity", 1);
      }
    },
  },
};
</script>

<style scoped>
.wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: start;
  padding: 20px;
  gap: 20px;
}

.input {
  width: 200px;
  margin-right: 10px;
  border: gray solid 1px;
}

.graph-container {
  position: relative;
  flex: 1;
  width: 100%;
  justify-content: end;
  align-items: center;
  border: gray solid 1px;
  border-radius: 10px;
  overflow: hidden; /* 隐藏溢出内容 */
}
</style>
