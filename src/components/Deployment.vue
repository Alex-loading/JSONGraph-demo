<template>
  <div class="deployment-wrapper">
    <a-radio-group v-model:value="tabValue" class="radio-group">
      <a-radio-button
        v-for="item in titleList"
        :key="item.id"
        :value="item.id"
        style="flex: 1; text-align: center"
        >{{ item.title }}</a-radio-button
      >
    </a-radio-group>
    <a-collapse class="collapse">
      <a-collapse-panel
        :header="titleList.find((item) => item.id == tabValue).title"
      >
        <div class="panel-content">
          <template v-if="tabValue == 1">
            <InfoRow
              v-for="item in [
                'total',
                'observeCount',
                'observability',
                'summary',
              ]"
              v-bind:key="item"
              :title="paramDict[item]"
              :value="topoAnalysisRes[item]"
            />
            <a-divider dashed class="divider" />
            <InfoRow
              :title="paramDict.updateTime"
              :value="topoAnalysisRes.updateTime"
            />
          </template>
          <template v-if="tabValue == 2">
            <InfoRow
              :title="paramDict.masterNode"
              :value="masterNodeRes.masterNode.length"
            />
            <InfoRow :title="paramDict.keyIsVisible"
              ><a-switch
                v-model:checked="masterNodeRes.keyIsVisible"
                @change="handleMasterNodeVisible"
            /></InfoRow>
            <a-divider dashed class="divider" />
            <InfoRow
              :title="paramDict.masterNodeTime"
              :value="masterNodeRes.masterNodeTime"
            />
          </template>
          <template v-if="tabValue == 3">
            <InfoRow :title="paramDict.optConfigData">
              <InfoRow :title="paramDict.amplitude" suffix="%">
                <a-input-number
                  v-model:value="optConfigData.amplitude"
                  style="width: 40px"
                  size="small"
                ></a-input-number>
              </InfoRow>
              <InfoRow :title="paramDict.phaseAngle" suffix="%">
                <a-input-number
                  v-model:value="optConfigData.phaseAngle"
                  style="width: 40px"
                  size="small"
                ></a-input-number>
              </InfoRow>
              <a-button size="small" @click="handleCalculation"
                >开始计算</a-button
              >
            </InfoRow>
            <a-divider dashed class="divider" />
            <InfoRow
              :title="paramDict.newNode"
              :value="newNodeRes.newNode.length"
            />

            <InfoRow :title="paramDict.optConfigRes">
              <InfoRow
                :title="paramDict.amplitude"
                :value="newNodeRes.amplitudePercent"
                suffix="%"
              />
              <InfoRow
                :title="paramDict.phaseAngle"
                :value="newNodeRes.phaseAnglePercent"
                suffix="%"
              />
            </InfoRow>
            <InfoRow :title="paramDict.addIsVisible"
              ><a-switch
                v-model:checked="newNodeRes.addIsVisible"
                @change="handleNewNodeVisible"
            /></InfoRow>
            <a-divider dashed class="divider" />
            <InfoRow
              :title="paramDict.newNodeTime"
              :value="newNodeRes.newNodeTime"
            />
          </template>
          <template v-if="tabValue == 4">
            <InfoRow
              v-for="item in [
                'feederName',
                'lineCount',
                'switchCount',
                'transformerCount',
                ]"
              v-bind:key="item"
              :title="paramDict[item]"
              :value="topoBaseInfo[item]"
            />
          </template>
          <template v-if="tabValue == 5">
            <InfoRow :title="paramDict.startIdentification">
              <a-button size="small" @click="handleIdentification">开始计算</a-button>
            </InfoRow>
            <InfoRow
              v-for="item in [
                'switchCount',
                'identificationTime',
                ]"
              v-bind:key="item"
              :title="paramDict[item]"
              :value="topoIdentificationData[item]"
            />
            <InfoRow :title="paramDict.identificationVisible">
              <a-switch
                v-model:checked="topoIdentificationData.identificationVisible"
                @change="handleIdentificationVisible"
              />
            </InfoRow>
          </template>
          <template v-if="tabValue == 6">
            <InfoRow :title="paramDict.startCompletion">
              <a-button size="small" @click="handleCompletion">开始计算</a-button>
            </InfoRow>
            <InfoRow
              v-for="item in [
                'lineCount',
                'completionTime',
                ]"
              v-bind:key="item"
              :title="paramDict[item]"
              :value="topoCompletionData[item]"
            />
            <InfoRow :title="paramDict.completionVisible">
              <a-switch
                v-model:checked="topoCompletionData.completionVisible"
                @change="handleCompletionVisible"
              />
            </InfoRow>
          </template>
        </div>
      </a-collapse-panel>
    </a-collapse>
    <a-card class="deployment-card">
      <div class="text-bold">图例</div>
      <InfoRow title="已有测量的位置"><div class="circle"></div></InfoRow
      ><InfoRow title="关键测量的位置"><div class="circle"></div></InfoRow
      ><InfoRow title="新增测量的位置"><div class="circle"></div></InfoRow
    ></a-card>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { getDeployDetail, postCompleteCalc, postDeployCalc, getTopologyDetail, postIdentifyCalc } from "@/api/graph.ts";
import InfoRow from "./InfoRow.vue";
import { onMounted, onUpdated } from "vue";
const props = defineProps({
  graphId: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["handleMasterNodeVisible", "handleNewNodeVisible"]);
const tabValue = ref(1);
const titleList = [
  {
    id: 1,
    title: "拓扑可观性分析",
  },
  {
    id: 2,
    title: "关键量测位置挖掘",
  },
  {
    id: 3,
    title: "量测优化配置",
  },
  {
    id: 4,
    title: "拓扑基本信息",
  },
  {
    id: 5,
    title: "拓扑错误辨识",
  },
  {
    id: 6,
    title: "拓扑补全",
  },
];
const paramDict = {
  total: "总节点数",
  observeCount: "可观节点数",
  observability: "可观度",
  summary: "可观性评估结论",
  updateTime: "数据完成时间",

  masterNode: "关键量测位置个数",
  keyIsVisible: "关键量测位置",
  masterNodeTime: "数据完成时间",

  optConfigData: "设置状态估计误差阈值",
  amplitude: "电压幅值",
  phaseAngle: "电压相角",
  newNode: "新增量测布点个数",
  optConfigRes: "满足状态估计误差的节点占比",
  addIsVisible: "新增量测位置",
  newNodeTime: "数据完成时间",

  feederName: "馈线名称",
  lineCount: "补全线路数量",
  switchCount: "开关数量",
  transformerCount: "专变数量",

  startCompletion: "拓扑补全",
  lineCount: "补全线路数量",
  completionTime: "更新时间",
  completionVisible: "显示补全",

  startIdentification: "拓扑辨识",
  switchCount: "辨识开关数量",
  identificationTime: "更新时间",
  identificationVisible: "显示辨识",
};
// 量测配置
const topoAnalysisRes = ref({
  total: 0,
  observeCount: 0,
  observability: 0,
  summary: "",
  updateTime: "",
});
const masterNodeRes = ref({
  masterNode: [],
  keyIsVisible: false,
  masterNodeTime: "",
});
const optConfigData = ref({
  amplitude: 1,
  phaseAngle: 1,
});
const newNodeRes = ref({
  newNode: [],
  amplitudePercent: 0,
  phaseAnglePercent: 0,
  addIsVisible: false,
  newNodeTime: "",
});
// 拓扑补全
const topoBaseInfo = ref({
  feederName: "",
  lineCount: 0,
  switchCount: 0,
  transformerCount: 0,
});
const topoCompletionData = ref({
  lineList: [],
  completionVisible: false,
  lineCount: 0,
  completionTime: "",
});
const topoIdentificationData = ref({
  switchList: [],
  identificationVisible: false,
  switchCount: 0,
  identificationTime: "",
});

onMounted(() => {
  getDetail();
});
onUpdated(() => {
  getDetail();
});

// 量测优化配置
const getDetail = () => {
  getDeployDetail().then((res) => {
    topoAnalysisRes.value = res.data.data.observe;
    masterNodeRes.value.masterNode = res.data.data.node.masterNode;
    masterNodeRes.value.masterNodeTime = res.data.data.node.masterNodeTime;
    newNodeRes.value.newNode = res.data.data.node.newNode;
    newNodeRes.value.newNodeTime = res.data.data.node.newNodeTime;
    newNodeRes.value.amplitudePercent = res.data.data.node.amplitudePercent;
    newNodeRes.value.phaseAnglePercent = res.data.data.node.phaseAnglePercent;
  });
  getTopologyDetail(props.graphId).then((topoRes) => {
    topoBaseInfo.value = topoRes.data.data.base;
    topoCompletionData.value.lineList = topoRes.data.data.line.lineList;
    topoCompletionData.value.lineCount = topoRes.data.data.line.lineCount;
    topoCompletionData.value.completionTime = topoRes.data.data.line.updateTime;
    topoIdentificationData.value.switchList = topoRes.data.data.switch.switchList;
    topoIdentificationData.value.switchCount = topoRes.data.data.switch.switchCount;
    topoIdentificationData.value.identificationTime = topoRes.data.data.switch.updateTime;
  });
};
// 触发量测优化配置模型计算
// TODO: 可能要进行计算
const handleCalculation = () => {
  postDeployCalc({
    amplitude: optConfigData.value.amplitude,
    phaseAngle: optConfigData.value.phaseAngle,
    topologyId: props.graphId,
  }).then((res) => {
    newNodeRes.value.newNode = res.data.data.node.newNode;
    newNodeRes.value.newNodeTime = res.data.data.node.newNodeTime;
    newNodeRes.value.amplitudePercent = res.data.data.node.amplitudePercent;
    newNodeRes.value.phaseAnglePercent = res.data.data.node.phaseAnglePercent;
  });
};
// 关键量测位置可视（图源变更）
const handleMasterNodeVisible = (checked) => {
  console.log(checked, masterNodeRes.value.masterNode);
  emit("handleMasterNodeVisible", checked, masterNodeRes.value.masterNode);
};
// 新增量测位置可视（图源变更）
const handleNewNodeVisible = (checked) => {
  console.log(checked, newNodeRes.value.newNode);
  emit("handleNewNodeVisible", checked, newNodeRes.value.newNode);
};
// 触发拓扑辨识
const handleIdentification = () => {
  postIdentifyCalc(props.graphId).then((res) => {
    console.log(res);
    console.log("触发拓扑辨识")
    // TODO: toast提示
  });
};
// 触发拓扑补全
const handleCompletion = () => {
  postCompleteCalc(props.graphId).then((res) => {
    console.log(res);
    console.log("触发拓扑补全")
    // TODO: toast提示
  });
};
// 拓扑辨识可视（图源变更）
const handleIdentificationVisible = (checked) => {
  console.log(checked, );
  emit("handleIdentificationVisible", checked, topoIdentificationData.value.switchList);
};
// 拓扑补全可视（图源变更）
const handleCompletionVisible = (checked) => {
  console.log(checked, );
  emit("handleCompletionVisible", checked, topoCompletionData.value.lineList);
};
</script>
<style scoped>
.deployment-wrapper {
  position: absolute;
  top: 20px;
  right: 10px;
  display: flex;
  flex-direction: column;
  align-items: end;
}

.radio-group {
  width: 1080px;
  display: flex;
}

.collapse {
  width: 600px;
  background-color: whitesmoke;
  margin-top: 10px;
}

::v-deep(.ant-collapse-header) {
  padding-top: 5px !important;
  padding-bottom: 5px !important;
  font-weight: bold;
}
::v-deep(.ant-collapse-content) {
  background-color: rgb(255, 254, 254);
  padding: 5px !important;
}

.panel-content {
  display: flex;
  flex-direction: column;
  justify-content: start;
  gap: 5px;
}

.divider {
  margin: 5px 0;
}

.deployment-card {
  align-self: flex-end;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: start;
  border: gray solid 1px;
}
.text-bold {
  font-weight: bold;
  margin-bottom: 10px;
}
::v-deep(.ant-card-body) {
  padding: 15px;
}
.circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: blue;
}
</style>
