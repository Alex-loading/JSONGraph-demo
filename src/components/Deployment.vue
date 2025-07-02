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
      <div v-if="props.mode === 'measure'">
        <InfoRow title="已有测量位置"><img :src="ExistPosition" class="icon"/></InfoRow>
        <InfoRow title="关键测量位置"><img :src="MasterPosition" class="icon"/></InfoRow>
        <InfoRow title="新增测量位置"><img :src="NewPosition" class="icon"/></InfoRow>
      </div>
      <div v-else-if="props.mode === 'topology'">
        <InfoRow title="拓扑辨识开关（连接）"><img :src="icSwitchConnect" class="topology-icon"/></InfoRow>
        <InfoRow title="拓扑辨识开关（断开）"><img :src="icSwitchDisconnect" class="topology-icon"/></InfoRow>
        <InfoRow title="补全变更连线（连接）"><img :src="icLineConnect" class="topology-icon"/></InfoRow>
        <InfoRow title="补全变更连线（断开）"><img :src="icLineDisconnect" class="topology-icon"/></InfoRow>
      </div>
    </a-card>
  </div>
</template>
<script setup>
import { ref, computed, watch } from "vue";
import { getDeployDetail, postDeployCalc, getTopologyDetail } from "@/api/graph.ts";
import InfoRow from "./InfoRow.vue";
import { onMounted, onUpdated } from "vue";
import ExistPosition from "../components/icons/ExistPosition.svg?url";
import MasterPosition from "../components/icons/MasterPosition.svg?url";
import NewPosition from "../components/icons/NewPosition.svg?url";
import icSwitchConnect from "../components/icons/ic-Switch-connect.svg?url"
import icSwitchDisconnect from "../components/icons/ic-Switch-disconnect.svg?url"
import icLineConnect from "../components/icons/ic-Line-connect.svg?url"
import icLineDisconnect from "../components/icons/ic-Line-disconnect.svg?url"

const props = defineProps({
  graphId: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    required: true,
    validator: (value) => ['topology', 'measure'].includes(value)
  }
});
const emit = defineEmits(["handleMasterNodeVisible", "handleNewNodeVisible"]);

const allTitleList = [
  {
    id: 1,
    title: "拓扑可观性分析",
    mode: "measure"
  },
  {
    id: 2,
    title: "关键量测位置挖掘",
    mode: "measure"
  },
  {
    id: 3,
    title: "量测优化配置",
    mode: "measure"
  },
  {
    id: 4,
    title: "拓扑基本信息",
    mode: "topology"
  },
  {
    id: 5,
    title: "拓扑错误辨识",
    mode: "topology"
  },
  {
    id: 6,
    title: "拓扑补全",
    mode: "topology"
  },
];

const titleList = computed(() => 
  allTitleList.filter(item => item.mode === props.mode)
);

const tabValue = ref(null);

// 监听 mode 变化，自动设置第一个 tab
watch(() => props.mode, (newMode) => {
  const firstTab = titleList.value[0];
  if (firstTab) {
    tabValue.value = firstTab.id;
  }
}, { immediate: true });

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
const getDetail = () => {
  getDeployDetail("10DKX-604769").then((res) => {
    topoAnalysisRes.value.total = res.data.data.total;
    topoAnalysisRes.value.observeCount = res.data.data.observeCount;
    topoAnalysisRes.value.observability = res.data.data.observability;
    topoAnalysisRes.value.summary = res.data.data.summary;
    topoAnalysisRes.value.updateTime = res.data.data.updateTime;
    masterNodeRes.value.masterNode = res.data.data.masterNode;
    masterNodeRes.value.masterNodeTime = res.data.data.masterNodeTime;
    newNodeRes.value.newNode = res.data.data.newNode;
    newNodeRes.value.newNodeTime = res.data.data.newNodeTime;
    newNodeRes.value.amplitudePercent = res.data.data.amplitudePercent;
    newNodeRes.value.phaseAnglePercent = res.data.data.phaseAnglePercent;
  });
  getTopologyDetail("10DKX-604769").then((topoRes) => {
    topoBaseInfo.value = topoRes.data.data.base;
    topoCompletionData.value.lineList = topoRes.data.data.line.lineList;
    topoCompletionData.value.lineCount = topoRes.data.data.line.lineCount;
    topoCompletionData.value.completionTime = topoRes.data.data.line.updateTime;
    topoIdentificationData.value.switchList = topoRes.data.data.switch.switchList;
    topoIdentificationData.value.switchCount = topoRes.data.data.switch.switchCount;
    topoIdentificationData.value.identificationTime = topoRes.data.data.switch.updateTime;
  });
};
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
const handleMasterNodeVisible = (checked) => {
  console.log(checked, masterNodeRes.value.masterNode);
  emit("handleMasterNodeVisible", checked, masterNodeRes.value.masterNode)
  // emit("handleMasterNodeVisible", checked, ['100032507']); // 测试用(graphId = 4)
};
const handleNewNodeVisible = (checked) => {
  console.log(checked, newNodeRes.value.newNode);
  emit("handleNewNodeVisible", checked, newNodeRes.value.newNode);
  // emit("handleNewNodeVisible", checked, ['100032435']); // 测试用(graphId = 4)
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
}

.radio-group {
  width: 560px;
  display: flex;
}

.collapse {
  background-color: whitesmoke;
  margin-top: 10px;
}

::v-deep(.ant-collapse-header) {
  padding: 5px 10px !important;
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
.icon {
  width: 10px;
  height: 10px;
}
.topology-icon{
  width: 36px;
  height: 18px;
}
</style>
