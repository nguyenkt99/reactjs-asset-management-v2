import { get } from '../httpHelper';

class UserService {
  getPublicContent() {
    return get('/v1/public');
  }

  ///Staff board here
  getStaffBoard() {
    return get('/v1/staff');
  }

  ///Admin board here

  getAdminBoard() {
    return get('/v1/admin');
  }
}

export default new UserService();