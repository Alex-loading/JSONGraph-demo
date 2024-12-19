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
                'nodeNum',
                'visibleNum',
                'visibility',
                'visibleConclusion',
              ]"
              v-bind:key="item"
              :title="paramDict[item]"
              :value="topoAnalysisRes[item]"
            />
          </template>
          <template v-if="tabValue == 2">
            <InfoRow :title="paramDict.keyNum" :value="keyMeasureRes.keyNum" />
            <InfoRow :title="paramDict.addIsVisible"
              ><a-switch
                v-model:checked="keyMeasureRes.keyIsVisible"
                @change="handleKeyMeasureChange"
            /></InfoRow>
          </template>
          <template v-if="tabValue == 3">
            <InfoRow :title="paramDict.optConfigData">
              <InfoRow :title="paramDict.voltageAmplitude" suffix="%">
                <a-input-number
                  v-model:value="optConfigData.voltageAmplitude"
                  style="width: 40px"
                  size="small"
                ></a-input-number>
              </InfoRow>
              <InfoRow :title="paramDict.voltageThreshold" suffix="%">
                <a-input-number
                  v-model:value="optConfigData.voltageThreshold"
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
              :title="paramDict.addPointNum"
              :value="optConfigRes.addPointNum"
            />

            <InfoRow :title="paramDict.optConfigRes">
              <InfoRow
                :title="paramDict.voltageAmplitude"
                :value="optConfigRes.voltageAmplitude"
                suffix="%"
              />
              <InfoRow
                :title="paramDict.voltageThreshold"
                :value="optConfigRes.voltageThreshold"
                suffix="%"
              />
            </InfoRow>
            <InfoRow :title="paramDict.addIsVisible"
              ><a-switch
                v-model:checked="optConfigRes.addIsVisible"
                @change="handleOptConfigChange"
            /></InfoRow>
          </template>
          <a-divider dashed class="divider" />
          <InfoRow
            v-for="item in ['finishTime', 'status']"
            v-bind:key="item"
            :title="paramDict[item]"
            :value="calcRes[item]"
          />
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
import { ref, reactive } from "vue";
import InfoRow from "./InfoRow.vue";
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
];
const paramDict = {
  nodeNum: "总节点数",
  visibleNum: "可观节点数",
  visibility: "可观度",
  visibleConclusion: "可观性评估结论",
  finishTime: "数据完成时间",
  status: "计算状态",
  keyNum: "关键量测位置个数",
  keyIsVisible: "关键量测位置",
  voltageAmplitude: "电压幅值",
  voltageThreshold: "电压相角",
  addPointNum: "新增量测布点个数",
  addIsVisible: "新增量测位置",
  optConfigData: "设置状态估计误差阈值",
  optConfigRes: "满足状态估计误差的节点占比",
};
const topoAnalysisRes = ref({
  nodeNum: 0,
  visibleNum: 0,
  visibility: 0,
  visibleConclusion: "",
});
const keyMeasureRes = ref({
  keyNum: 0,
  keyIsVisible: false,
});
const optConfigData = ref({
  voltageAmplitude: 1,
  voltageThreshold: 1,
});
const optConfigRes = ref({
  addPointNum: 0,
  voltageAmplitude: 0,
  voltageThreshold: 0,
  addIsVisible: false,
});
const calcRes = ref({
  finishTime: "2021-10-10",
  status: "已完成",
});
// 响应函数
const handleCalculation = () => {
  console.log(optConfigData.value);
};
const handleKeyMeasureChange = (checked) => {
  console.log(checked, keyMeasureRes.value);
};
const handleOptConfigChange = (checked) => {
  console.log(checked, optConfigRes.value);
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
  width: 540px;
  display: flex;
}

.collapse {
  background-color: whitesmoke;
  margin-top: 10px;
}
::v-deep(.ant-collapse-header) {
  padding: 5px !important;
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
}
.text-bold {
  font-weight: bold;
  margin-bottom: 10px;
}
::v-deep(.ant-card-body){
  padding: 15px;
}
.circle{
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: blue;
}
</style>
