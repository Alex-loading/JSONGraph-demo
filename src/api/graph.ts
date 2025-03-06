import axios from "axios";

const project5 = axios.create({
  baseURL: "http://47.122.67.91:8080",
  timeout: 10000,
});

// 创建后端2的 axios 实例
const project3 = axios.create({
  baseURL: "https://apifoxmock.com/m1/5623623-5303208-default", // 后端2的基础 URL
  timeout: 10000, // 超时时间
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
    method: "get",
  });
}

export function getDeployDetail(){
  return project3({
    url: `/measure/detail`,
    method: "get",
  });
}

export function postDeployCalc(dataBody: JSON){
  return project3({
    url: `/measure/start`,
    data: dataBody,
    method: "post",
  });
}

export function getTopologyDetail(feederId: string){
  return project3({
    url: `/topology/detail`,
    method: "get",
    params: {
      feederId
    }
  });
}

export function postIdentifyCalc(feederId: string){
  return project3({
    url: `/topology/identification/start`,
    method: "post",
    data: {
      feederId
    }
  });
}

export function postCompleteCalc(feederId: string){
  return project3({
    url: `/topology/completion/start`,
    method: "get",
    data: {
      feederId
    }
  });
}