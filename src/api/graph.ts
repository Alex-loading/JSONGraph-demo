import axios from "axios";

const request = axios.create({
  baseURL: "http://47.122.67.91:8080",
  timeout: 10000,
})

request.interceptors.request.use(
  (response) => {
    return response // 请求成功则返回response
  },
  (error) => { // 请求失败则显示错误状态
    console.log('请求失败')
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.log('响应失败')
    return Promise.reject(error)
  }
)

export function getGraphData(id: string){
  return request({
    url: `/v1/graph/${id}`,
    method: 'get'
  });
}
