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
import MasterPosition from "../components/icons/MasterPosition.svg";
import NewPosition from "../components/icons/NewPosition.svg";
import ExistPosition from "../components/icons/ExistPosition.svg";
import SwitchConnect from "../components/icons/SwitchConnect.svg";
import SwitchDisconnect from "../components/icons/SwitchDisconnect.svg";
import PoleCode from "../components/icons/PoleCode.svg";

export const nodeIcons = {
  type1: {
    src: type1Icon,
    width: 40,
    height: 40,
    isCircle: false,
  },
  Substation: {
    src: Substation,
    matserSrc: 1,
    newSrc: 2,
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
  UsagePoint: { src: Load, width: 20, height: 20, isCircle: true },
  Switch: { src: Switch, width: 50, height: 20, isCircle: false },
  LoadBreakSwitch: { src: Switch, width: 50, height: 20, isCircle: false },
  ConnectivityNode: {
    src: ConnectivityNode,
    width: 20,
    height: 20,
    isCircle: true,
  },
  PoleCode: {
    src: PoleCode,
    width: 10,
    height: 10,
    isCircle: true,
  }, Junction: {
    src: ConnectivityNode,
    width: 20,
    height: 20,
    isCircle: true,
  },
  Breaker: { src: Breaker, width: 50, height: 20, isCircle: false },
  Fuse: { src: Breaker, width: 50, height: 20, isCircle: false },
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
  PowerTransformerWinding: {
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
  MasterPosition: {
    src: MasterPosition,
    width: 20,
    height: 20,
    isCircle: true,
  },
  NewPosition: {
    src: NewPosition,
    width: 20,
    height: 20,
    isCircle: true,
  },
  ExistPosition: {
    src: ExistPosition,
    width: 20,
    height: 20,
    isCircle: true,
  },
  switchConnect: {
    src: SwitchConnect,
    width: 50,
    height: 20,
    isCircle: false,
  },
  switchDisconnect: {
    src: SwitchDisconnect,
    width: 50,
    height: 20,
    isCircle: false,
  }
};

export const linkStyles = {
  solid: { stroke: "#000000", strokeWidth: 2, strokeDasharray: "0" },
  dashed: { stroke: "#000000", strokeWidth: 2, strokeDasharray: "2,4" },
  ConnectivityEdge: {
    stroke: "#000000",
    strokeWidth: 2,
    strokeDasharray: "0",
  },
};