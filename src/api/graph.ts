import axios from "axios";

const project5 = axios.create({
  // baseURL: "http://192.168.1.123:30020", // 此处url为南京公司鲲游后端地址
  baseURL: "http://127.0.0.1:4523/m1/5385065-5057833-default",
  // baseURL: "http://zwjs-precision-7670:8080",
  // baseURL: "project5",
  timeout: 300000,
});

// 创建后端2的 axios 实例
const project3 = axios.create({
  // baseURL: "/measure", // 后端2的基础 URL
  baseURL: "http://127.0.0.1:4523/m1/5623623-5303208-default",
  // baseURL: "http://zwjs-precision-7670:8090",
  // baseURL: "project3",
  timeout: 300000, // 超时时间
});

[project5, project3].forEach((instance) => {
  instance.interceptors.request.use(
    (response) => {
      return response; // 请求成功则返回response
    },
    (error) => {
      // 请求失败则显示错误状态
      console.log("请求失败");
      return Promise.reject(error);
    }
  );
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      console.log("响应失败");
      return Promise.reject(error);
    }
  );
});

export function getGraphData(id: string) {
  return project5({
    url: `/v1/graph/${id}`,
    // url: `/topology/detail?feederId=${id}`,
    method: "get",
  });
}

export function getDeployDetail(feederId: string) {
  return project3({
    // url: `/detail`,
    url: `/measure/detail`,
    method: "get",
    params: {
      feederId: feederId
    },
  });
}

export function postDeployCalc(dataBody: JSON) {
  return project3({
    // url: `/start`,
    url: `/measure/start`,
    data: dataBody,
    method: "post",
  });
}

export function getTopologyDetail(feederId: string) {
  return project3({
    url: `/topology/detail`,
    method: "get",
    params: {
      feederId
    }
  });
}

export function postIdentifyCalc(feederId: string) {
  return project3({
    url: `/topology/identification/start`,
    method: "post",
    data: {
      feederId
    }
  });
}

export function postCompleteCalc(feederId: string) {
  return project3({
    url: `/topology/completion/start`,
    method: "post",
    data: {
      feederId
    }
  });
}