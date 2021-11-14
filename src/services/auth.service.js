import { post } from "../httpHelper";

class AuthService {
  //login here//
  login(username, password) {
    return post("/auth/signin", { username, password })
      .then((response) => {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('user', JSON.stringify({
            role: response.data.role,
            username: response.data.username,
            firstLogin: response.data.firstLogin
          }))
        }
        // console.log(response);
        return response.data;
      });
  }

  //logout here//
  logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("selected");
  }

  //register////
  register(username, email, password) {
   
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
}

export default new AuthService();
